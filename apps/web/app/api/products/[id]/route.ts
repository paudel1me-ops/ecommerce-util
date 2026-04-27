import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/product-service'
import { verifyToken } from '@/lib/auth/jwt'
import { err } from '@/lib/types'

async function getSellerPayload(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const p = await verifyToken(token).catch(() => null)
  return p?.role === 'seller' ? p : null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await productService.getById(id)
  return NextResponse.json(result, { status: result.ok ? 200 : 404 })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getSellerPayload(req)
  if (!payload) return NextResponse.json(err('FORBIDDEN', 'Seller account required.'), { status: 403 })
  const body = await req.json().catch(() => ({}))
  const result = await productService.update(id, payload.sub, body)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getSellerPayload(req)
  if (!payload) return NextResponse.json(err('FORBIDDEN', 'Seller account required.'), { status: 403 })
  const result = await productService.remove(id, payload.sub)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
