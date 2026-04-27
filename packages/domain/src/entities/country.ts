import { z } from 'zod'

export const CountrySchema = z.object({
  code: z.string().length(2).toUpperCase(), // ISO 3166-1 alpha-2
  name: z.string().min(1),
  region: z.string().optional(),
  flag_emoji: z.string().optional(),
})

export type Country = z.infer<typeof CountrySchema>
