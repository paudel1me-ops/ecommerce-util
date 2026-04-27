import { z } from 'zod'

// PT-05 search query schema
export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  country: z.string().length(2).toUpperCase().optional(),
  category_id: z.string().uuid().optional(),
  min_price: z.number().nonnegative().optional(),
  max_price: z.number().positive().optional(),
  origin_verdict: z.enum(['verified', 'flagged', 'rejected', 'pending']).optional(),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'rating']).default('relevance'),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().min(1).max(100).default(20),
  embedding: z.array(z.number()).length(1536).optional(), // vector search
})

export type SearchQuery = z.infer<typeof SearchQuerySchema>
