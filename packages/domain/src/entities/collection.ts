import { z } from 'zod'

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  seller_id: z.string().uuid().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  cover_image_url: z.string().url().optional(),
  is_public: z.boolean().default(true),
  product_ids: z.array(z.string().uuid()).default([]),
})

export type Collection = z.infer<typeof CollectionSchema>
