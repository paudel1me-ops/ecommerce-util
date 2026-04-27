import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = MOCK_PRODUCTS.find((p) => p.id === id)
  if (!product) notFound()

  const { title, price, currency = 'USD', imageUrl, rating, reviewCount, originCountry, originVerdict = 'pending', sellerName } = product

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="text-sm text-[var(--brand-primary)] hover:underline mb-4 inline-block">
        ← Back to products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📦</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {sellerName && <p className="text-sm text-gray-500 mt-1">by {sellerName}</p>}
          </div>

          {/* Origin */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">🌍 Made in {originCountry.toUpperCase()}</Badge>
            {originVerdict === 'verified' && (
              <Badge variant="success" dot>Verified Origin</Badge>
            )}
            {originVerdict === 'flagged' && (
              <Badge variant="warning" dot>Origin Flagged</Badge>
            )}
          </div>

          {/* Rating */}
          {rating !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}>★</span>
                ))}
              </div>
              <span className="text-sm text-gray-600">{rating} ({reviewCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(price, currency)}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">
            This product is crafted by artisans in {originCountry.toUpperCase()} and has been verified through our origin authentication system. Purchasing directly supports the maker community.
          </p>

          {/* Seller card */}
          <Card padding="sm" className="bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">Sold by</p>
            <p className="text-sm font-semibold text-gray-900">{sellerName ?? 'Independent Seller'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Ships from {originCountry.toUpperCase()}</p>
          </Card>

          {/* COD CTA */}
          <div className="flex flex-col gap-2 mt-2">
            <Link href={`/checkout?product=${product.id}`}>
              <Button fullWidth size="lg">Buy Now — Cash on Delivery</Button>
            </Link>
            <p className="text-xs text-center text-gray-400">No payment required until delivery</p>
          </div>
        </div>
      </div>
    </div>
  )
}
