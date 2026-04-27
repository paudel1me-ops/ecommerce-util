/**
 * Sliding-window rate limiter (A38)
 */

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  identifier: string,
  limit = 60,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now()
  let win = store.get(identifier)

  if (!win || now >= win.resetAt) {
    win = { count: 0, resetAt: now + windowMs }
    store.set(identifier, win)
  }

  win.count += 1
  const allowed = win.count <= limit
  return { allowed, remaining: Math.max(0, limit - win.count), resetAt: win.resetAt }
}
