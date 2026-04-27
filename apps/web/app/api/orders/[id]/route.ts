import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/lib/services/order-service'
import { verifyToken } from '@/lib/auth/jwt'
import { err } from '@/lib/types'

async function getAuthPayload(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token).catch(() => null)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAuthPayload(req)
  if (!payload) return NextResponse.json(err('UNAUTHORIZED', 'Authentication required.'), { status: 401 })
  const result = await orderService.getById(id, payload.sub, payload.role)
  return NextResponse.json(result, { status: result.ok ? 200 : 404 })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAuthPayload(req)
  if (!payload) return NextResponse.json(err('UNAUTHORIZED', 'Authentication required.'), { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body?.status) return NextResponse.json(err('VALIDATION', 'status is required.'), { status: 400 })
  const result = await orderService.updateStatus(id, body.status, payload.sub, payload.role)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
