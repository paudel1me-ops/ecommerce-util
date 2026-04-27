/**
 * lib/env.ts
 * ---------------------------------------------------------------------------
 * Zod-validated environment variables.
 * Import `env` anywhere instead of accessing process.env directly.
 * Any missing or malformed required variable throws at startup — not at runtime.
 *
 * Usage:
 *   import { env } from '@/lib/env'
 *   const url = env.NEXT_PUBLIC_SUPABASE_URL
 * ---------------------------------------------------------------------------
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const envSchema = z.object({
  // ── Supabase ──────────────────────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(10, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is too short'),
  SUPABASE_SERVICE_KEY: z
    .string()
    .min(10, 'SUPABASE_SERVICE_KEY is too short')
    .optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),

  // ── OpenAI ────────────────────────────────────────────────────────────────
  OPENAI_API_KEY: z
    .string()
    .min(10, 'OPENAI_API_KEY is required')
    .optional(),
  OPENAI_ORG_ID: z.string().optional(),

  // ── App ───────────────────────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Origin Market'),
  NEXT_PUBLIC_CDN_URL: z.string().optional(),

  // ── Redis ─────────────────────────────────────────────────────────────────
  REDIS_URL: z.string().optional(),

  // ── Vector Store ──────────────────────────────────────────────────────────
  WEAVIATE_URL: z.string().optional(),
  WEAVIATE_API_KEY: z.string().optional(),

  // ── Payments ──────────────────────────────────────────────────────────────
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // ── Email ─────────────────────────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),

  // ── Feature Flags ─────────────────────────────────────────────────────────
  FEATURE_FLAG_ORIGIN_VERIFY: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
  FEATURE_FLAG_RAG: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  FEATURE_FLAG_CULTURAL_CONTEXT: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  FEATURE_FLAG_MULTI_CURRENCY: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  FEATURE_FLAG_MULTI_LANGUAGE: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  FEATURE_FLAG_SELLER_KYC: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  FEATURE_FLAG_LLM_ROUTER: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),

  // ── Eval / CI ─────────────────────────────────────────────────────────────
  USE_REAL_MODEL: z
    .string()
    .transform((v) => v === '1')
    .default('0'),

  // ── Node environment ──────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
})

// ---------------------------------------------------------------------------
// Parse + export — throws with clear message on first bad/missing variable
// ---------------------------------------------------------------------------

function parseEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')
    throw new Error(
      `\n❌ Environment validation failed:\n${formatted}\n\nFix your .env.local file.\n`
    )
  }

  return result.data
}

// Singleton — parsed once per process
export const env = parseEnv()

// ---------------------------------------------------------------------------
// Feature flag helpers (convenience)
// ---------------------------------------------------------------------------

export const featureFlags = {
  originVerify: env.FEATURE_FLAG_ORIGIN_VERIFY,
  rag: env.FEATURE_FLAG_RAG,
  culturalContext: env.FEATURE_FLAG_CULTURAL_CONTEXT,
  multiCurrency: env.FEATURE_FLAG_MULTI_CURRENCY,
  multiLanguage: env.FEATURE_FLAG_MULTI_LANGUAGE,
  sellerKyc: env.FEATURE_FLAG_SELLER_KYC,
  llmRouter: env.FEATURE_FLAG_LLM_ROUTER,
} as const

export type Env = z.infer<typeof envSchema>
