'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const STEPS = ['Country', 'Category', 'Product Details', 'Proof Upload']

const CATEGORIES = ['Textiles', 'Ceramics', 'Jewelry', 'Leather Goods', 'Woodwork', 'Metalwork', 'Art & Prints', 'Food & Drink', 'Beauty & Wellness', 'Fashion', 'Home Decor', 'Toys & Games']

// Step 1 — Country (locked to seller's registered country)
function StepCountry({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm font-medium text-amber-800">🔒 Country Locked</p>
        <p className="text-sm text-amber-700 mt-1">Your products must be manufactured in your registered country.</p>
      </div>
      <Card padding="md" className="flex items-center gap-4">
        <span className="text-4xl">🇻🇳</span>
        <div>
          <p className="font-semibold text-gray-900">Vietnam</p>
          <p className="text-sm text-gray-500">Your registered country of manufacture</p>
          <Badge variant="success" size="sm" dot className="mt-1">Verified Seller</Badge>
        </div>
      </Card>
      <Button onClick={onNext}>Continue →</Button>
    </div>
  )
}

// Step 2 — Category
function StepCategory({ value, onChange, onNext, onBack }: { value: string; onChange: (v: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">Select the category that best describes your product.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-left',
              value === cat
                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[var(--brand-primary)]',
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!value}>Continue →</Button>
      </div>
    </div>
  )
}

// Step 3 — Product Details
function StepDetails({ form, onChange, onNext, onBack }: {
  form: { title: string; description: string; price: string; currency: string }
  onChange: (k: string, v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Product name is required'
    if (!form.price || Number(form.price) <= 0) e.price = 'Enter a valid price'
    return e
  }

  function next() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onNext()
  }

  return (
    <div className="flex flex-col gap-4">
      <Input label="Product Name" required value={form.title} onChange={(e) => onChange('title', e.target.value)} errorText={errors.title} placeholder="e.g. Hand-woven Silk Scarf" />
      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe your product…"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)]"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Price" required type="number" min="0" step="0.01" value={form.price} onChange={(e) => onChange('price', e.target.value)} errorText={errors.price} placeholder="0.00" />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Currency</label>
          <select
            value={form.currency}
            onChange={(e) => onChange('currency', e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20"
          >
            <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option><option>NPR</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={next}>Continue →</Button>
      </div>
    </div>
  )
}

// Step 4 — Proof Upload
function StepProof({ onSubmit, onBack, submitting }: { onSubmit: () => void; onBack: () => void; submitting: boolean }) {
  const [files, setFiles] = useState<string[]>([])

  function fakeUpload() {
    setFiles((f) => [...f, `photo_${f.length + 1}.jpg`])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-800">📸 Upload Manufacturing Proof</p>
        <p className="text-sm text-blue-700 mt-1">Photos of your workshop, tools, or production process help verify origin.</p>
      </div>
      <div
        onClick={fakeUpload}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[var(--brand-primary)] transition-colors"
      >
        <p className="text-3xl mb-2">📁</p>
        <p className="text-sm font-medium text-gray-700">Click to add photos</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, HEIC up to 10MB each</p>
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f) => (
            <Badge key={f} variant="success" size="sm">✓ {f}</Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={onSubmit} loading={submitting}>Submit Product</Button>
      </div>
    </div>
  )
}

// Main wizard
export default function AddProductPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState('')
  const [details, setDetails] = useState({ title: '', description: '', price: '', currency: 'USD' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSubmitting(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Submitted!</h1>
        <p className="text-gray-600 mb-6">Your product is pending origin verification. We'll notify you within 24h.</p>
        <Button onClick={() => router.push('/seller/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Product</h1>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div className={cn('flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 shrink-0',
              i < step ? 'bg-green-500 border-green-500 text-white'
                : i === step ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white'
                : 'border-gray-300 text-gray-400 bg-white',
            )}>
              {i < step ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5', i < step ? 'bg-green-400' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{STEPS[step]}</h2>
        {step === 0 && <StepCountry onNext={() => setStep(1)} />}
        {step === 1 && <StepCategory value={category} onChange={setCategory} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && (
          <StepDetails
            form={details}
            onChange={(k, v) => setDetails((d) => ({ ...d, [k]: v }))}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && <StepProof onSubmit={handleSubmit} onBack={() => setStep(2)} submitting={submitting} />}
      </Card>
    </div>
  )
}
