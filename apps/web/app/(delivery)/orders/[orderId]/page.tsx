'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'

// Mock order detail
const ORDER = {
  orderId: 'ORD-001-ABC',
  customerName: 'Nguyen Van A',
  phone: '+84 90 000 0001',
  address: '14 Maple Street, District 1',
  city: 'Ho Chi Minh City',
  country: 'Vietnam',
  codAmount: 89.99,
  currency: 'USD',
  product: 'Hand-woven Silk Scarf',
  status: 'in_transit',
}

export default function DeliveryDetailPage() {
  const router = useRouter()
  const params = useParams<{ orderId: string }>()
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [delivered, setDelivered] = useState(false)

  async function confirmDelivery() {
    if (otp.length < 4) { setOtpError('Enter the 4-digit OTP from the customer'); return }
    setOtpError('')
    setConfirming(true)
    await new Promise((r) => setTimeout(r, 1200))
    setConfirming(false)
    setDelivered(true)
  }

  if (delivered) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery Confirmed!</h1>
        <p className="text-gray-600 mb-2">COD collected: <strong>{formatCurrency(ORDER.codAmount, ORDER.currency)}</strong></p>
        <p className="text-sm text-gray-500 mb-6">Order #{ORDER.orderId} marked as delivered.</p>
        <Button onClick={() => router.push('/delivery/orders')}>Back to Deliveries</Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => router.back()} className="text-sm text-[var(--brand-primary)] hover:underline mb-4 inline-block">
        ← Back to list
      </button>

      <div className="flex items-center gap-2 mb-6">
  <h1 className="text-xl font-bold text-gray-900">Delivery #{params.orderId ?? ORDER.orderId}</h1>
        <Badge variant="warning" dot>In Transit</Badge>
      </div>

      {/* Map placeholder */}
      <div className="w-full h-44 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center mb-6 border border-gray-200">
        <div className="text-center">
          <p className="text-3xl mb-1">🗺️</p>
          <p className="text-sm text-gray-500">Map View</p>
          <p className="text-xs text-gray-400">{ORDER.address}</p>
        </div>
      </div>

      {/* Customer info */}
      <Card padding="md" className="mb-4">
        <CardHeader><CardTitle>Customer Info</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="font-medium">{ORDER.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone</span>
            <a href={`tel:${ORDER.phone}`} className="font-medium text-[var(--brand-primary)]">{ORDER.phone}</a>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Address</span>
            <span className="font-medium text-right max-w-[60%]">{ORDER.address}, {ORDER.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Product</span>
            <span className="font-medium">{ORDER.product}</span>
          </div>
        </CardContent>
      </Card>

      {/* COD + OTP */}
      <Card padding="md" className="bg-amber-50 border-amber-200">
        <CardHeader><CardTitle>Collect Payment</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">COD Amount</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(ORDER.codAmount, ORDER.currency)}</span>
          </div>
          <Badge variant="warning">Cash on Delivery</Badge>

          <div className="border-t pt-4">
            <Input
              label="Customer OTP"
              placeholder="Enter 4-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              errorText={otpError}
              helperText="Ask the customer for the OTP sent to their phone"
              maxLength={6}
              inputMode="numeric"
            />
          </div>

          <Button onClick={confirmDelivery} loading={confirming} fullWidth>
            Confirm Delivery & Collect {formatCurrency(ORDER.codAmount, ORDER.currency)}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
