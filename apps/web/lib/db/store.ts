/**
 * In-memory store singleton.
 * All repositories read/write here. Swap per-collection for Supabase in prod.
 */
import type { User, Product, Order, DeliveryRecord } from '@/lib/types'

export interface AppStore {
  users:      Map<string, User>
  products:   Map<string, Product>
  orders:     Map<string, Order>
  deliveries: Map<string, DeliveryRecord>
  rateLimits: Map<string, { count: number; resetAt: number }>
}

function makeStore(): AppStore {
  return {
    users:      new Map(),
    products:   new Map(),
    orders:     new Map(),
    deliveries: new Map(),
    rateLimits: new Map(),
  }
}

// Survive Next.js hot-reload via globalThis
const g = globalThis as typeof globalThis & { __wmt?: AppStore }
export const store: AppStore = g.__wmt ?? (g.__wmt = makeStore())
