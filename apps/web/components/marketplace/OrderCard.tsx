import * as React from 'react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export interface OrderCardProps {
  orderId: string
  status: OrderStatus
  total: number
  currency?: string
  itemCount: number
  createdAt: string | Date
  onViewDetails?: (orderId: string) => void
  onTrack?: (orderId: string) => void
  className?: string
}

const statusConfig: Record<OrderStatus, { variant: BadgeVariant; label: string }> = {
  pending:   { variant: 'warning', label: 'Pending' },
  confirmed: { variant: 'info',    label: 'Confirmed' },
  shipped:   { variant: 'info',    label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  cancelled: { variant: 'danger',  label: 'Cancelled' },
  refunded:  { variant: 'default', label: 'Refunded' },
}

export function OrderCard({
  orderId, status, total, currency = 'USD', itemCount, createdAt,
  onViewDetails, onTrack, className,
}: OrderCardProps) {
  const cfg = statusConfig[status]
  const shortId = orderId.slice(0, 8).toUpperCase()

  return (
    <Card className={cn('w-full', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500 font-mono">#{shortId}</p>
          <p className="text-sm text-gray-600">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          <p className="text-xs text-gray-400">{formatDate(createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
          <span className="text-base font-bold text-gray-900">{formatCurrency(total, currency)}</span>
        </div>
      </div>

      <CardFooter className="gap-2 justify-end">
        {onTrack && (status === 'confirmed' || status === 'shipped') && (
          <Button size="sm" variant="secondary" onClick={() => onTrack(orderId)}>
            Track
          </Button>
        )}
        {onViewDetails && (
          <Button size="sm" variant="ghost" onClick={() => onViewDetails(orderId)}>
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default OrderCard
