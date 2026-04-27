import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/product-service'
import { verifyToken } from '@/lib/auth/jwt'
import { rateLimit } from '@/lib/security/rate-limit'
import { err } from '@/lib/types'

// GET /api/products — public, no auth required
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const result = await productService.list({
    country:  searchParams.get('country')  ?? undefined,
    category: searchParams.get('category') ?? undefined,
    search:   searchParams.get('q')        ?? undefined,
    status:   'active',
  })
  return NextResponse.json(result)
}

// POST /api/products — seller only
export async function POST(req: NextRequest) {
  const ip    = req.headers.get('x-forwarded-for') ?? 'unknown'
  const limit = rateLimit(`products:${ip}`, 20, 60_000)
  if (!limit.allowed) return NextResponse.json(err('RATE_LIMITED', 'Too many requests.'), { status: 429 })

  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json(err('UNAUTHORIZED', 'Authentication required.'), { status: 401 })

  const payload = await verifyToken(token).catch(() => null)
  if (!payload || payload.role !== 'seller')
    return NextResponse.json(err('FORBIDDEN', 'Seller account required.'), { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body?.name || body?.price == null || !body?.country || !body?.category)
    return NextResponse.json(err('VALIDATION', 'name, price, country, and category are required.'), { status: 400 })

  const result = await productService.create({ ...body, sellerId: payload.sub })
  return NextResponse.json(result, { status: result.ok ? 201 : 400 })
}
