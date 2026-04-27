import { z } from 'zod'

export const SkuSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  sku_code: z.string().min(1),
  attributes: z.record(z.string()), // e.g. { size: 'M', color: 'red' }
  price_override: z.number().positive().optional(),
  stock_qty: z.number().int().min(0).default(0),
})

export type Sku = z.infer<typeof SkuSchema>
