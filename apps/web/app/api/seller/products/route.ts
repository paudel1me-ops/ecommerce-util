import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/product-service'
import { verifyToken } from '@/lib/auth/jwt'
import { err } from '@/lib/types'

// GET /api/seller/products — seller's own product listings
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json(err('UNAUTHORIZED', 'Authentication required.'), { status: 401 })
  const payload = await verifyToken(token).catch(() => null)
  if (!payload || payload.role !== 'seller')
    return NextResponse.json(err('FORBIDDEN', 'Seller account required.'), { status: 403 })

  const { searchParams } = req.nextUrl
  const result = await productService.list({
    sellerId: payload.sub,
    status:   (searchParams.get('status') as 'active' | 'draft') ?? undefined,
  })
  return NextResponse.json(result)
}
