/**
 * COD (Cash on Delivery) payment provider (A59)
 * Payment stays PENDING until delivery is physically confirmed via OTP.
 */
import { randomUUID } from 'crypto'
import { logger } from '@/lib/logger'
import type { PaymentProvider, CreatePaymentInput } from './interface'
import type { PaymentRecord } from '@/lib/types'

const payments = new Map<string, PaymentRecord>()

export const codProvider: PaymentProvider = {
  async createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
    const now = new Date().toISOString()
    const record: PaymentRecord = {
      id:        randomUUID(),
      orderId:   input.orderId,
      method:    'cod',
      status:    'pending',   // COD: pending until physical delivery confirmation
      amount:    input.amount,
      currency:  input.currency,
      metadata:  input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    }
    payments.set(record.id, record)
    logger.info('payment.cod_created', { paymentId: record.id, orderId: record.orderId })
    return record
  },

  async confirmPayment(paymentId: string): Promise<PaymentRecord> {
    const record = payments.get(paymentId)
    if (!record) throw new Error(`Payment ${paymentId} not found`)
    const updated: PaymentRecord = { ...record, status: 'paid', updatedAt: new Date().toISOString() }
    payments.set(paymentId, updated)
    logger.info('payment.cod_confirmed', { paymentId })
    return updated
  },

  async refundPayment(paymentId: string): Promise<PaymentRecord> {
    const record = payments.get(paymentId)
    if (!record) throw new Error(`Payment ${paymentId} not found`)
    const updated: PaymentRecord = { ...record, status: 'refunded', updatedAt: new Date().toISOString() }
    payments.set(paymentId, updated)
    logger.info('payment.cod_refunded', { paymentId })
    return updated
  },
}
