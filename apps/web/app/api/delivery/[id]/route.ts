import { NextRequest, NextResponse } from 'next/server'
import { deliveryService } from '@/lib/services/delivery-service'
import { verifyToken } from '@/lib/auth/jwt'
import { err } from '@/lib/types'

async function getAgentPayload(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const p = await verifyToken(token).catch(() => null)
  return p?.role === 'delivery' ? p : null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAgentPayload(req)
  if (!payload) return NextResponse.json(err('UNAUTHORIZED', 'Delivery agent authentication required.'), { status: 401 })
  // Reuse listForAgent and find by id
  const allResult = await deliveryService.listForAgent(payload.sub)
  if (!allResult.ok) return NextResponse.json(allResult, { status: 400 })
  const record = allResult.data.find((d) => d.id === id)
  if (!record) return NextResponse.json(err('NOT_FOUND', 'Delivery not found.'), { status: 404 })
  return NextResponse.json({ ok: true, data: record })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAgentPayload(req)
  if (!payload) return NextResponse.json(err('UNAUTHORIZED', 'Delivery agent authentication required.'), { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json(err('VALIDATION', 'Request body required.'), { status: 400 })

  // confirmOtp
  if (body.otp !== undefined) {
    const result = await deliveryService.confirmOtp(id, body.otp)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  }

  // generateOtp
  if (body.generateOtp) {
    const result = await deliveryService.generateOtp(id, payload.sub)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  }

  // status update
  if (body.status) {
    const result = await deliveryService.updateStatus(id, body.status, payload.sub, body.location)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  }

  return NextResponse.json(err('VALIDATION', 'Provide status, generateOtp, or otp in body.'), { status: 400 })
}
