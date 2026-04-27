/**
 * Delivery service (A55, A56, A62) — assign, state machine, OTP.
 * Layer rule: calls deliveryRepo + orderRepo + userRepo only.
 */
import { createHash, randomInt } from 'crypto'
import { deliveryRepo } from '@/lib/repositories/delivery-repo'
import { orderRepo }    from '@/lib/repositories/order-repo'
import { userRepo }     from '@/lib/repositories/user-repo'
import { logger }       from '@/lib/logger'
import { track }        from '@/lib/analytics'
import { ok, err }      from '@/lib/types'
import type { DeliveryRecord, GeoLocation, ApiResponse } from '@/lib/types'

const OTP_TTL_MS = 10 * 60 * 1000   // 10 minutes

// ─── State machine ────────────────────────────────────────────────────────────
const TRANSITIONS: Record<DeliveryRecord['status'], DeliveryRecord['status'][]> = {
  pending:    ['assigned', 'failed'],
  assigned:   ['in_transit', 'failed'],
  in_transit: ['arrived', 'failed'],
  arrived:    ['delivered', 'failed'],
  delivered:  [],
  failed:     ['assigned'],
}

function canTransition(from: DeliveryRecord['status'], to: DeliveryRecord['status']): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

// ─── OTP helpers ──────────────────────────────────────────────────────────────
function generateOtpCode(): string { return String(randomInt(100_000, 999_999)) }
function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex')
}

// ─── Agent picker (mock nearest agent) ────────────────────────────────────────
function pickAgent(): string | null {
  const agents = userRepo.list().filter(u => u.role === 'delivery' && u.isVerified)
  if (!agents.length) return null
  return agents[Math.floor(Math.random() * agents.length)]!.id
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const deliveryService = {
  // A55 — Assign delivery agent to an order
  async assign(orderId: string): Promise<ApiResponse<DeliveryRecord>> {
    const existing = deliveryRepo.findByOrder(orderId)
    if (existing) return ok(existing)

    const agentId = pickAgent()
    const record  = deliveryRepo.create({
      orderId,
      agentId,
      status:            agentId ? 'assigned' : 'pending',
      otpHash:           null,
      otpExpiresAt:      null,
      location:          null,
      attemptCount:      0,
      estimatedDelivery: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      deliveredAt:       null,
      failureReason:     null,
    })

    logger.info('delivery.assigned', { deliveryId: record.id, orderId, agentId })
    return ok(record)
  },

  async getByOrder(orderId: string): Promise<ApiResponse<DeliveryRecord>> {
    const record = deliveryRepo.findByOrder(orderId)
    if (!record) return err('NOT_FOUND', 'Delivery record not found.')
    return ok(record)
  },

  async listForAgent(agentId: string): Promise<ApiResponse<DeliveryRecord[]>> {
    const records = deliveryRepo.findByAgent(agentId)
    return ok(records, { total: records.length })
  },

  // A56 — Advance delivery status
  async updateStatus(
    deliveryId: string,
    newStatus:  DeliveryRecord['status'],
    agentId:    string,
    location?:  GeoLocation
  ): Promise<ApiResponse<DeliveryRecord>> {
    const record = deliveryRepo.findById(deliveryId)
    if (!record)                   return err('NOT_FOUND', 'Delivery not found.')
    if (record.agentId !== agentId) return err('FORBIDDEN', 'Not your delivery.')

    if (!canTransition(record.status, newStatus)) {
      return err('INVALID_TRANSITION', `Cannot transition from "${record.status}" to "${newStatus}".`)
    }

    const updates: Partial<DeliveryRecord> = {
      status:   newStatus,
      location: location ?? record.location,
    }
    if (newStatus === 'in_transit') updates.attemptCount = record.attemptCount + 1
    if (newStatus === 'delivered')  {
      updates.deliveredAt = new Date().toISOString()
      track('delivery_completed', { deliveryId, orderId: record.orderId })
    }
    if (newStatus === 'in_transit') {
      track('delivery_started', { deliveryId, orderId: record.orderId })
    }

    const updated = deliveryRepo.update(deliveryId, updates)
    if (!updated) return err('UPDATE_FAILED', 'Could not update delivery.')

    logger.info('delivery.status_changed', { deliveryId, from: record.status, to: newStatus })
    return ok(updated)
  },

  // A62 — Generate OTP (call when agent arrives)
  async generateOtp(deliveryId: string, agentId: string): Promise<ApiResponse<{ otp: string }>> {
    const record = deliveryRepo.findById(deliveryId)
    if (!record)                    return err('NOT_FOUND', 'Delivery not found.')
    if (record.agentId !== agentId)  return err('FORBIDDEN', 'Not your delivery.')
    if (record.status !== 'arrived') return err('INVALID_STATE', "OTP can only be generated when status is 'arrived'.")

    const otp      = generateOtpCode()
    const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString()

    deliveryRepo.update(deliveryId, { otpHash: hashOtp(otp), otpExpiresAt: expiresAt })
    logger.info('delivery.otp_generated', { deliveryId })
    // In prod: send OTP via SMS to buyer — do NOT return in response body
    return ok({ otp })
  },

  // A62 — Confirm OTP (buyer shows code to agent)
  async confirmOtp(deliveryId: string, otp: string): Promise<ApiResponse<DeliveryRecord>> {
    const record = deliveryRepo.findById(deliveryId)
    if (!record)                              return err('NOT_FOUND', 'Delivery not found.')
    if (!record.otpHash || !record.otpExpiresAt) return err('NO_OTP', 'No OTP generated for this delivery.')
    if (new Date(record.otpExpiresAt) < new Date()) return err('OTP_EXPIRED', 'OTP has expired. Request a new one.')
    if (hashOtp(otp) !== record.otpHash)      return err('OTP_INVALID', 'Incorrect OTP.')

    const updated = deliveryRepo.update(deliveryId, {
      status:      'delivered',
      deliveredAt: new Date().toISOString(),
      otpHash:     null,
      otpExpiresAt: null,
    })
    if (!updated) return err('UPDATE_FAILED', 'Could not confirm delivery.')

    // Mark order delivered + COD collected
    orderRepo.update(record.orderId, { status: 'delivered', paymentStatus: 'paid' })

    logger.info('delivery.confirmed', { deliveryId, orderId: record.orderId })
    track('delivery_completed', { deliveryId, orderId: record.orderId })
    return ok(updated)
  },
}
