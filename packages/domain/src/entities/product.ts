import { z } from 'zod'

export const OriginVerdict = z.enum(['verified', 'flagged', 'rejected', 'pending'])
export type OriginVerdict = z.infer<typeof OriginVerdict>

export const MediaAssetSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  type: z.enum(['image', 'video']),
  order: z.number().int().min(0).default(0),
})

export const ProductSchema = z.object({
  id: z.string().uuid(),
  seller_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  origin_country: z.string().length(2).toUpperCase(),
  price: z.number().positive(),
  currency: z.string().length(3).toUpperCase().default('USD'),
  status: z.enum(['draft', 'active', 'inactive', 'deleted']).default('draft'),
  origin_confidence: z.number().min(0).max(1).optional(),
  origin_verdict: OriginVerdict.optional(),
  cultural_context: z.record(z.unknown()).optional(),
  media_assets: z.array(MediaAssetSchema).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export type Product = z.infer<typeof ProductSchema>
export type MediaAsset = z.infer<typeof MediaAssetSchema>
