import { z } from 'zod'

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  sku_id: z.string().uuid().optional(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
  origin_country: z.string().length(2).toUpperCase(),
})

export const OrderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']).default('pending'),
  total_amount: z.number().positive(),
  currency: z.string().length(3).toUpperCase().default('USD'),
  items: z.array(OrderItemSchema).default([]),
  shipping_address: z.record(z.unknown()).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export type Order = z.infer<typeof OrderSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
