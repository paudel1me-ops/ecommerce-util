import { z } from 'zod'

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  cart_id: z.string().uuid(),
  product_id: z.string().uuid(),
  sku_id: z.string().uuid().optional(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
})

export const CartSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  session_id: z.string().optional(),
  items: z.array(CartItemSchema).default([]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export type Cart = z.infer<typeof CartSchema>
export type CartItem = z.infer<typeof CartItemSchema>
