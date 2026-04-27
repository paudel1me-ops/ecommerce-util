/**
 * Sliding-window rate limiter (A64)
 * Uses in-memory store — swap for Redis in prod.
 */
import { store } from '@/lib/db/store'

export interface RateLimitResult {
  allowed:   boolean
  remaining: number
  resetAt:   number
}

export function rateLimit(
  key:      string,
  limit:    number = 60,
  windowMs: number = 60_000
): RateLimitResult {
  const now   = Date.now()
  const entry = store.rateLimits.get(key)

  if (!entry || now > entry.resetAt) {
    store.rateLimits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}
