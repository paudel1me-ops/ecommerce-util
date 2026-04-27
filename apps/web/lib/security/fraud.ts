/**
 * Fraud detection (A63) — rule-based scoring.
 * Calls repos only. No HTTP imports.
 */
import { orderRepo }   from '@/lib/repositories/order-repo'
import { productRepo } from '@/lib/repositories/product-repo'
import { logger }      from '@/lib/logger'

export interface FraudResult {
  score:   number    // 0–100
  blocked: boolean   // score >= 80
  flags:   string[]
}

export const fraudService = {
  checkBuyer(buyerId: string): FraudResult {
    const flags: string[] = []
    let score = 0

    const orders    = orderRepo.findByBuyer(buyerId)
    const cancelled = orders.filter(o => o.status === 'cancelled')
    const cancelRate = orders.length > 0 ? cancelled.length / orders.length : 0

    if (cancelRate > 0.5 && orders.length >= 3) {
      flags.push('HIGH_CANCELLATION_RATE')
      score += 40
    }

    // More than 5 orders in last hour
    const recentOrders = orders.filter(
      o => Date.now() - new Date(o.createdAt).getTime() < 3_600_000
    )
    if (recentOrders.length > 5) {
      flags.push('RAPID_ORDERING')
      score += 30
    }

    // COD orders over $500
    const highValue = orders.filter(o => o.paymentMethod === 'cod' && o.total > 500)
    if (highValue.length > 0) {
      flags.push('HIGH_VALUE_COD')
      score += 20
    }

    if (score >= 80) logger.warn('fraud.buyer_high_risk', { buyerId, score, flags })
    return { score, blocked: score >= 80, flags }
  },

  checkSeller(sellerId: string): FraudResult {
    const flags: string[] = []
    let score = 0

    const products  = productRepo.findAll({ sellerId })
    const badPriced = products.filter(p => p.price < 0.01 || p.price > 100_000)
    if (badPriced.length > 0) {
      flags.push('SUSPICIOUS_PRICING')
      score += 35
    }

    // New seller listing excessive products (>50)
    if (products.length > 50) {
      flags.push('HIGH_VOLUME_LISTINGS')
      score += 20
    }

    if (score >= 80) logger.warn('fraud.seller_high_risk', { sellerId, score, flags })
    return { score, blocked: score >= 80, flags }
  },
}
