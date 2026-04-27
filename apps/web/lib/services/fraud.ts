/**
 * Fraud scoring (A32) — basic rule-based
 */
import type { Order } from '@/lib/types'

export interface FraudResult {
  score: number   // 0–100
  flags: string[]
  blocked: boolean
}

const COD_HIGH_VALUE_USD = 300
const NEW_ACCOUNT_HIGH_USD = 150

export function scoreFraud(order: Order): FraudResult {
  const flags: string[] = []
  let score = 0

  if (order.total > COD_HIGH_VALUE_USD) {
    score += 30
    flags.push('HIGH_COD_AMOUNT')
  }

  if (order.total > NEW_ACCOUNT_HIGH_USD && order.buyerId?.startsWith('new_')) {
    score += 25
    flags.push('NEW_ACCOUNT_HIGH_VALUE')
  }

  if (order.shippingAddress?.city?.toLowerCase().includes('test')) {
    score += 20
    flags.push('SUSPICIOUS_ADDRESS')
  }

  const blocked = score >= 60

  return { score, flags, blocked }
}
