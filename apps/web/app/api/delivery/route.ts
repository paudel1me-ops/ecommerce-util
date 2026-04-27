import { NextRequest, NextResponse } from 'next/server'
import { deliveryService } from '@/lib/services/delivery-service'
import { verifyToken } from '@/lib/auth/jwt'
import { err } from '@/lib/types'

// GET /api/delivery — delivery agent only
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json(err('UNAUTHORIZED', 'Authentication required.'), { status: 401 })
  const payload = await verifyToken(token).catch(() => null)
  if (!payload || payload.role !== 'delivery')
    return NextResponse.json(err('FORBIDDEN', 'Delivery agent account required.'), { status: 403 })
  const result = await deliveryService.listForAgent(payload.sub)
  return NextResponse.json(result)
}
