import { randomUUID } from 'crypto'
import { store } from '@/lib/db/store'
import type { Product } from '@/lib/types'

type CreateInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
type UpdateInput = Partial<Omit<Product, 'id' | 'createdAt'>>

export interface ProductFilters {
  sellerId?:  string
  country?:   string
  category?:  string
  status?:    Product['status']
  minPrice?:  number
  maxPrice?:  number
  search?:    string
}

export const productRepo = {
  create(data: CreateInput): Product {
    const now = new Date().toISOString()
    const product: Product = { ...data, id: randomUUID(), createdAt: now, updatedAt: now }
    store.products.set(product.id, product)
    return product
  },

  findById(id: string): Product | undefined {
    return store.products.get(id)
  },

  findAll(filters: ProductFilters = {}): Product[] {
    let list = Array.from(store.products.values())
    if (filters.sellerId)        list = list.filter(p => p.sellerId === filters.sellerId)
    if (filters.country)         list = list.filter(p => p.country === filters.country)
    if (filters.category)        list = list.filter(p => p.category === filters.category)
    if (filters.status)          list = list.filter(p => p.status === filters.status)
    if (filters.minPrice != null) list = list.filter(p => p.price >= filters.minPrice!)
    if (filters.maxPrice != null) list = list.filter(p => p.price <= filters.maxPrice!)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  },

  update(id: string, data: UpdateInput): Product | undefined {
    const product = store.products.get(id)
    if (!product) return undefined
    const updated: Product = { ...product, ...data, updatedAt: new Date().toISOString() }
    store.products.set(id, updated)
    return updated
  },

  delete(id: string): boolean {
    return store.products.delete(id)
  },

  countBySeller(sellerId: string): number {
    return this.findAll({ sellerId }).length
  },
}
