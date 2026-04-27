'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getMockProduct } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutPageInner />
    </Suspense>
  )
}

function CheckoutPageInner() {
  const params = useSearchParams()
  const router = useRouter()
  const productId = params.get('product') ?? '1'
  const product = getMockProduct(productId)

  const [form, setForm] = useState({
    name: '', phone: '', addressLine1: '', addressLine2: '', city: '', postalCode: '', country: '',
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  function validate() {
    const e: Partial<typeof form> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\+?[\d\s\-]{8,}$/.test(form.phone)) e.phone = 'Enter a valid phone number'
    if (!form.addressLine1.trim()) e.addressLine1 = 'Address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.country.trim()) e.country = 'Country is required'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200)) // simulate API
    setSubmitting(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-6">Your order has been confirmed. Pay on delivery.</p>
        <Badge variant="success" size="md">Cash on Delivery</Badge>
        <div className="mt-8">
          <Button onClick={() => router.push('/')}>Continue Shopping</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="md:col-span-3 flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Delivery Address</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input label="Full Name" required value={form.name} onChange={set('name')} errorText={errors.name} placeholder="Jane Smith" />
              <Input label="Phone Number" required value={form.phone} onChange={set('phone')} errorText={errors.phone} placeholder="+1 555 000 0000" type="tel" />
              <Input label="Address Line 1" required value={form.addressLine1} onChange={set('addressLine1')} errorText={errors.addressLine1} placeholder="123 Main St" />
              <Input label="Address Line 2" value={form.addressLine2} onChange={set('addressLine2')} placeholder="Apt, Suite, Floor (optional)" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" required value={form.city} onChange={set('city')} errorText={errors.city} />
                <Input label="Postal Code" value={form.postalCode} onChange={set('postalCode')} />
              </div>
              <Input label="Country" required value={form.country} onChange={set('country')} errorText={errors.country} placeholder="United States" />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" fullWidth loading={submitting}>
            Place Order — Pay on Delivery
          </Button>
        </form>

        {/* Summary */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {product && (
                <div className="flex gap-3 items-start">
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.title} className="w-16 h-16 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                    <p className="text-xs text-gray-500">🌍 {product.originCountry.toUpperCase()}</p>
                    <p className="text-sm font-semibold mt-1">{formatCurrency(product.price, product.currency)}</p>
                  </div>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{product ? formatCurrency(product.price, product.currency) : '—'}</span>
              </div>
              <Badge variant="success" dot>Cash on Delivery</Badge>
              <p className="text-xs text-gray-500">No online payment. Pay when your order arrives.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
