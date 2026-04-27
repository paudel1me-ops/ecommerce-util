import { z } from 'zod'

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  user_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
  verified_purchase: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
})

export type Review = z.infer<typeof ReviewSchema>
