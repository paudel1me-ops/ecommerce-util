'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'

type Role = 'buyer' | 'seller' | 'delivery'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('buyer')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  const ROLE_REDIRECT: Record<Role, string> = {
    buyer:    '/',
    seller:   '/seller/dashboard',
    delivery: '/delivery/orders',
  }

  function validate() {
    const e: typeof errors = {}
    if (!email.trim() || !email.includes('@')) e.email = 'Enter a valid email'
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    router.push(ROLE_REDIRECT[role])
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--brand-primary)]">Origin Market</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <Card padding="none">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Role selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">I am a…</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-lg">
                  {(['buyer', 'seller', 'delivery'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                        role === r ? 'bg-white shadow text-[var(--brand-primary)]' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {r === 'buyer' ? '🛍 Buyer' : r === 'seller' ? '🏪 Seller' : '🚚 Delivery'}
                    </button>
                  ))}
                </div>
              </div>

              <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} errorText={errors.email} placeholder="you@example.com" />
              <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} errorText={errors.password} placeholder="••••••••" />

              <Button type="submit" fullWidth loading={loading}>Sign In</Button>

              <p className="text-xs text-center text-gray-400">
                Demo: any email + password ≥ 6 chars
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
