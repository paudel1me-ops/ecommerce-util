import { z } from 'zod'

export function PaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    total_pages: z.number().int().nonnegative(),
  })
}

export type Paginated<T> = {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>
