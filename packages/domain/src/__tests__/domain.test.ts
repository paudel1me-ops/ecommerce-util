import { describe, it, expect } from 'vitest'
import {
  CountrySchema,
  CategorySchema,
  SellerSchema,
  ProductSchema,
  SkuSchema,
  CartSchema,
  OrderSchema,
  ReviewSchema,
  CollectionSchema,
  ClassificationSchema,
  OriginVerifySchema,
  SearchQuerySchema,
  PaginatedSchema,
} from '../index'
import { z } from 'zod'

describe('Domain Entities', () => {
  it('CountrySchema parses valid country', () => {
    const c = CountrySchema.parse({ code: 'jp', name: 'Japan', region: 'Asia' })
    expect(c.code).toBe('JP')
  })

  it('CategorySchema parses valid category', () => {
    const cat = CategorySchema.parse({ id: '00000000-0000-0000-0000-000000000001', slug: 'textiles', name: 'Textiles' })
    expect(cat.slug).toBe('textiles')
  })

  it('SellerSchema defaults verification_status to pending', () => {
    const s = SellerSchema.parse({
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      business_name: 'Kyoto Crafts',
      registered_country: 'jp',
    })
    expect(s.verification_status).toBe('pending')
    expect(s.registered_country).toBe('JP')
  })

  it('ProductSchema rejects negative price', () => {
    expect(() =>
      ProductSchema.parse({
        id: '00000000-0000-0000-0000-000000000001',
        seller_id: '00000000-0000-0000-0000-000000000002',
        title: 'Silk scarf',
        origin_country: 'VN',
        price: -5,
      })
    ).toThrow()
  })

  it('SkuSchema parses attributes map', () => {
    const sku = SkuSchema.parse({
      id: '00000000-0000-0000-0000-000000000001',
      product_id: '00000000-0000-0000-0000-000000000002',
      sku_code: 'SILK-M-RED',
      attributes: { size: 'M', color: 'red' },
      stock_qty: 10,
    })
    expect(sku.attributes.color).toBe('red')
  })

  it('CartSchema defaults to empty items', () => {
    const cart = CartSchema.parse({ id: '00000000-0000-0000-0000-000000000001' })
    expect(cart.items).toEqual([])
  })

  it('OrderSchema defaults status to pending', () => {
    const order = OrderSchema.parse({
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      total_amount: 99.99,
    })
    expect(order.status).toBe('pending')
  })

  it('ReviewSchema rejects rating 6', () => {
    expect(() =>
      ReviewSchema.parse({
        id: '00000000-0000-0000-0000-000000000001',
        product_id: '00000000-0000-0000-0000-000000000002',
        user_id: '00000000-0000-0000-0000-000000000003',
        rating: 6,
      })
    ).toThrow()
  })

  it('CollectionSchema defaults product_ids to empty', () => {
    const col = CollectionSchema.parse({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Summer Edit',
      slug: 'summer-edit',
    })
    expect(col.product_ids).toEqual([])
  })
})

describe('Domain Schemas', () => {
  it('ClassificationSchema allows origin extensions', () => {
    const c = ClassificationSchema.parse({
      description: 'A beautiful woven basket',
      metadata: {
        product_type: 'basket',
        style: 'traditional',
        material: 'rattan',
        color_palette: ['brown'],
        pattern: 'weave',
        season: 'all',
        occasion: 'home',
        consumer_profile: 'adult',
        trend_notes: 'rustic',
        location_context: { continent: 'Asia', country: 'Vietnam', city: 'Hanoi' },
      },
      origin_country: 'vn',
      origin_confidence: 0.92,
      origin_verdict: 'verified',
    })
    expect(c.origin_country).toBe('VN')
    expect(c.origin_verdict).toBe('verified')
  })

  it('OriginVerifySchema defaults evidence arrays to empty', () => {
    const r = OriginVerifySchema.parse({
      claimed_country: 'IN',
      confidence: 0.78,
      verdict: 'flagged',
    })
    expect(r.evidence).toEqual([])
    expect(r.cultural_markers).toEqual([])
  })

  it('SearchQuerySchema defaults sort and pagination', () => {
    const q = SearchQuerySchema.parse({ q: 'silk scarf' })
    expect(q.sort).toBe('relevance')
    expect(q.page).toBe(1)
    expect(q.per_page).toBe(20)
  })

  it('PaginatedSchema wraps items correctly', () => {
    const schema = PaginatedSchema(z.object({ id: z.string() }))
    const result = schema.parse({ data: [{ id: 'x' }], total: 1, page: 1, per_page: 20, total_pages: 1 })
    expect(result.data[0].id).toBe('x')
  })
})
