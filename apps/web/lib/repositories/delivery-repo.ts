import { randomUUID } from 'crypto'
import { store } from '@/lib/db/store'
import type { DeliveryRecord } from '@/lib/types'

type CreateInput = Omit<DeliveryRecord, 'id' | 'createdAt' | 'updatedAt'>
type UpdateInput = Partial<Omit<DeliveryRecord, 'id' | 'createdAt'>>

export const deliveryRepo = {
  create(data: CreateInput): DeliveryRecord {
    const now = new Date().toISOString()
    const record: DeliveryRecord = { ...data, id: randomUUID(), createdAt: now, updatedAt: now }
    store.deliveries.set(record.id, record)
    return record
  },

  findById(id: string): DeliveryRecord | undefined {
    return store.deliveries.get(id)
  },

  findByOrder(orderId: string): DeliveryRecord | undefined {
    for (const d of store.deliveries.values()) {
      if (d.orderId === orderId) return d
    }
    return undefined
  },

  findByAgent(agentId: string): DeliveryRecord[] {
    return Array.from(store.deliveries.values()).filter(d => d.agentId === agentId)
  },

  findPending(): DeliveryRecord[] {
    return Array.from(store.deliveries.values()).filter(d => d.status === 'pending')
  },

  update(id: string, data: UpdateInput): DeliveryRecord | undefined {
    const record = store.deliveries.get(id)
    if (!record) return undefined
    const updated: DeliveryRecord = { ...record, ...data, updatedAt: new Date().toISOString() }
    store.deliveries.set(id, updated)
    return updated
  },

  list(): DeliveryRecord[] {
    return Array.from(store.deliveries.values())
  },
}
