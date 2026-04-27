import { NextRequest, NextResponse } from 'next/server'
import { register } from '@/lib/services/auth-service'
import { rateLimit } from '@/lib/security/rate-limit'
import { err } from '@/lib/types'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const limit = rateLimit(`register:${ip}`, 5, 60_000)
  if (!limit.allowed) return NextResponse.json(err('RATE_LIMITED', 'Too many requests.'), { status: 429 })

  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password || !body?.name || !body?.role || !body?.country)
    return NextResponse.json(err('VALIDATION', 'email, password, name, role, and country are required.'), { status: 400 })

  const result = await register(body)
  return NextResponse.json(result, { status: result.ok ? 201 : 400 })
}
