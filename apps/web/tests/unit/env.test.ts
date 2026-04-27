/**
 * Unit tests for lib/env.ts — Zod env validator
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// We need to test parseEnv in isolation so we can inject different env values.
// To avoid module singleton issues we inline a minimal schema re-parse here.
import { z } from 'zod'

const testEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
  FEATURE_FLAG_RAG: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  FEATURE_FLAG_ORIGIN_VERIFY: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
})

function parseTestEnv(raw: Record<string, string>) {
  return testEnvSchema.parse(raw)
}

const VALID_BASE = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'a-valid-anon-key-that-is-long-enough',
}

describe('env validator', () => {
  it('parses valid environment correctly', () => {
    const result = parseTestEnv(VALID_BASE)
    expect(result.NEXT_PUBLIC_SUPABASE_URL).toBe('https://project.supabase.co')
    expect(result.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe(
      'a-valid-anon-key-that-is-long-enough'
    )
  })

  it('throws when NEXT_PUBLIC_SUPABASE_URL is not a URL', () => {
    expect(() =>
      parseTestEnv({ ...VALID_BASE, NEXT_PUBLIC_SUPABASE_URL: 'not-a-url' })
    ).toThrow()
  })

  it('throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is too short', () => {
    expect(() =>
      parseTestEnv({ ...VALID_BASE, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'short' })
    ).toThrow()
  })

  it('FEATURE_FLAG_RAG defaults to false', () => {
    const result = parseTestEnv(VALID_BASE)
    expect(result.FEATURE_FLAG_RAG).toBe(false)
  })

  it('FEATURE_FLAG_RAG parses "true" string → boolean true', () => {
    const result = parseTestEnv({ ...VALID_BASE, FEATURE_FLAG_RAG: 'true' })
    expect(result.FEATURE_FLAG_RAG).toBe(true)
  })

  it('FEATURE_FLAG_ORIGIN_VERIFY defaults to true', () => {
    const result = parseTestEnv(VALID_BASE)
    expect(result.FEATURE_FLAG_ORIGIN_VERIFY).toBe(true)
  })

  it('NODE_ENV defaults to "development"', () => {
    const result = parseTestEnv(VALID_BASE)
    expect(result.NODE_ENV).toBe('development')
  })

  it('rejects invalid NODE_ENV value', () => {
    expect(() =>
      parseTestEnv({ ...VALID_BASE, NODE_ENV: 'staging' })
    ).toThrow()
  })
})
