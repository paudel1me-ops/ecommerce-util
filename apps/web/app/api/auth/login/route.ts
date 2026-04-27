import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/services/auth-service'
import { rateLimit } from '@/lib/security/rate-limit'
import { err } from '@/lib/types'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const limit = rateLimit(`login:${ip}`, 10, 60_000)
  if (!limit.allowed) return NextResponse.json(err('RATE_LIMITED', 'Too many requests.'), { status: 429 })

  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password)
    return NextResponse.json(err('VALIDATION', 'email and password are required.'), { status: 400 })

  const result = await login({ email: body.email, password: body.password })
  return NextResponse.json(result, { status: result.ok ? 200 : 401 })
}
