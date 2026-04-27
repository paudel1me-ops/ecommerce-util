import { z } from 'zod'
import { OriginVerdict } from '../entities/product'

// Extends the base classification schema with origin marketplace fields
export const ClassificationSchema = z.object({
  description: z.string(),
  metadata: z.object({
    product_type: z.string(),
    style: z.string(),
    material: z.string(),
    color_palette: z.array(z.string()),
    pattern: z.string(),
    season: z.string(),
    occasion: z.string(),
    consumer_profile: z.string(),
    trend_notes: z.string(),
    location_context: z.object({
      continent: z.string(),
      country: z.string(),
      city: z.string(),
    }),
  }),
  // Origin marketplace extensions
  origin_country: z.string().length(2).toUpperCase().optional(),
  origin_confidence: z.number().min(0).max(1).optional(),
  origin_verdict: OriginVerdict.optional(),
  cultural_context: z.record(z.unknown()).optional(),
  seller_id: z.string().uuid().optional(),
  price: z.number().positive().optional(),
})

export type ClassificationResult = z.infer<typeof ClassificationSchema>
