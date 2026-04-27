import { z } from 'zod'
import { OriginVerdict } from '../entities/product'

// PT-04 output schema: origin verification result from ML pipeline
export const OriginVerifySchema = z.object({
  product_id: z.string().uuid().optional(),
  seller_id: z.string().uuid().optional(),
  claimed_country: z.string().length(2).toUpperCase(),
  detected_country: z.string().length(2).toUpperCase().optional(),
  confidence: z.number().min(0).max(1),
  verdict: OriginVerdict,
  evidence: z.array(z.string()).default([]),
  cultural_markers: z.array(z.string()).default([]),
  flags: z.array(z.string()).default([]),
  reviewed_at: z.string().datetime().optional(),
})

export type OriginVerifyResult = z.infer<typeof OriginVerifySchema>
