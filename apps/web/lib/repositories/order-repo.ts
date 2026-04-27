import { randomUUID } from 'crypto'
import { store } from '@/lib/db/store'
import type { Order } from '@/lib/types'

type CreateInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
type UpdateInput = Partial<Omit<Order, 'id' | 'createdAt'>>

export const orderRepo = {
  create(data: CreateInput): Order {
    const now = new Date().toISOString()
    const order: Order = { ...data, id: randomUUID(), createdAt: now, updatedAt: now }
    store.orders.set(order.id, order)
    return order
  },

  findById(id: string): Order | undefined {
    return store.orders.get(id)
  },

  findByBuyer(buyerId: string): Order[] {
    return Array.from(store.orders.values()).filter(o => o.buyerId === buyerId)
  },

  findByStatus(status: Order['status']): Order[] {
    return Array.from(store.orders.values()).filter(o => o.status === status)
  },

  update(id: string, data: UpdateInput): Order | undefined {
    const order = store.orders.get(id)
    if (!order) return undefined
    const updated: Order = { ...order, ...data, updatedAt: new Date().toISOString() }
    store.orders.set(id, updated)
    return updated
  },

  list(): Order[] {
    return Array.from(store.orders.values())
  },
}
