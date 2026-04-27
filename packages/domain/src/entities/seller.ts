import { z } from 'zod'

export const SellerSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  business_name: z.string().min(1),
  registered_country: z.string().length(2).toUpperCase(),
  verified: z.boolean().default(false),
  verification_status: z.enum(['pending', 'verified', 'rejected', 'suspended']).default('pending'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export type Seller = z.infer<typeof SellerSchema>
