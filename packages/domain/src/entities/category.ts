import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  parent_id: z.string().uuid().nullable().optional(),
  description: z.string().optional(),
})

export type Category = z.infer<typeof CategorySchema>
