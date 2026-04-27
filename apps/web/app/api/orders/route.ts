import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/lib/services/order-service'
import { verifyToken } from '@/lib/auth/jwt'
import { err } from '@/lib/types'

async function getBuyerPayload(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const p = await verifyToken(token).catch(() => null)
  return p?.role === 'buyer' ? p : null
}

// GET /api/orders — buyer only
export async function GET(req: NextRequest) {
  const payload = await getBuyerPayload(req)
  if (!payload) return NextResponse.json(err('UNAUTHORIZED', 'Buyer authentication required.'), { status: 401 })
  const result = await orderService.listForBuyer(payload.sub)
  return NextResponse.json(result)
}

// POST /api/orders — buyer only
export async function POST(req: NextRequest) {
  const payload = await getBuyerPayload(req)
  if (!payload) return NextResponse.json(err('UNAUTHORIZED', 'Buyer authentication required.'), { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body?.items || !body?.shippingAddress)
    return NextResponse.json(err('VALIDATION', 'items and shippingAddress are required.'), { status: 400 })
  const result = await orderService.create({ ...body, buyerId: payload.sub })
  return NextResponse.json(result, { status: result.ok ? 201 : 400 })
}
