import * as React from 'react'
import Link from 'next/link'
import { cn, formatCurrency, truncate } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'

export type OriginVerdict = 'verified' | 'flagged' | 'rejected' | 'pending'

export interface ProductCardProps {
  id: string
  title: string
  price: number
  currency?: string
  imageUrl?: string
  rating?: number
  reviewCount?: number
  originCountry: string
  originVerdict?: OriginVerdict
  sellerName?: string
  className?: string
}

const verdictBadge: Record<OriginVerdict, { variant: BadgeVariant; label: string }> = {
  verified: { variant: 'success', label: '✓ Verified Origin' },
  flagged:  { variant: 'warning', label: '⚠ Flagged' },
  rejected: { variant: 'danger',  label: '✗ Rejected' },
  pending:  { variant: 'default', label: '○ Pending' },
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={cn('w-3.5 h-3.5', star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200')}
            fill="currentColor" viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-gray-500">({count})</span>}
    </div>
  )
}

export function ProductCard({
  id, title, price, currency = 'USD', imageUrl, rating, reviewCount,
  originCountry, originVerdict = 'pending', sellerName, className,
}: ProductCardProps) {
  const verdict = verdictBadge[originVerdict]

  return (
    <Link href={`/product/${id}`} className="block group" aria-label={title}>
      <Card padding="none" hoverable className={cn('overflow-hidden', className)}>
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Origin verdict badge overlay */}
          <div className="absolute top-2 left-2">
            <Badge variant={verdict.variant} size="sm" dot>{verdict.label}</Badge>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1.5">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">
            {truncate(title, 50)}
          </h3>

          {sellerName && (
            <p className="text-xs text-gray-500">{sellerName}</p>
          )}

          <div className="flex items-center gap-1.5">
            <Badge variant="outline" size="sm">
              🌍 {originCountry.toUpperCase()}
            </Badge>
          </div>

          {rating !== undefined && (
            <StarRating rating={rating} count={reviewCount} />
          )}

          <div className="flex items-center justify-between mt-1">
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(price, currency)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default ProductCard
