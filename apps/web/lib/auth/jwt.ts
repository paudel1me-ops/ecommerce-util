/**
 * JWT utilities (A22)
 * Uses Web Crypto API — no external dependency, works in Edge Runtime.
 */
import type { JwtPayload } from '@/lib/types'

const ALG   = 'HS256'
const TOKEN_TTL_SECONDS = 60 * 60 * 24 // 24h

function b64url(input: string | Uint8Array): string {
  const str = typeof input === 'string' ? input : String.fromCharCode(...input)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(str: string): string {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
}

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JwtPayload = { ...payload, iat: now, exp: now + TOKEN_TTL_SECONDS }

  const header  = b64url(JSON.stringify({ alg: ALG, typ: 'JWT' }))
  const body    = b64url(JSON.stringify(fullPayload))
  const message = `${header}.${body}`

  const key = await getKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  const sigB64 = b64url(new Uint8Array(sig))

  return `${message}.${sigB64}`
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const secret = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [header, body, sigB64] = parts
    const message = `${header}.${body}`
    const sigBytes = Uint8Array.from(fromB64url(sigB64), (c) => c.charCodeAt(0))

    const key = await getKey(secret)
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(message))
    if (!valid) return null

    const payload = JSON.parse(fromB64url(body)) as JwtPayload
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(fromB64url(parts[1])) as JwtPayload
  } catch {
    return null
  }
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

// ─── Clean aliases used by services/API routes ────────────────────────────────
export const signToken  = signJwt
export const verifyToken = verifyJwt
export const decodeToken = decodeJwt
