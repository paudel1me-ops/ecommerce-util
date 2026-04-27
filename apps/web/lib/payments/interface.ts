/**
 * Payment provider interface (A58)
 */
import type { PaymentRecord, PaymentMethod } from '@/lib/types'

export interface CreatePaymentInput {
  orderId:   string
  amount:    number
  currency:  string
  method:    PaymentMethod
  metadata?: Record<string, string>
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentRecord>
  confirmPayment(paymentId: string): Promise<PaymentRecord>
  refundPayment(paymentId: string, reason?: string): Promise<PaymentRecord>
}
