import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

type DeliveryStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered'

interface DeliveryItem {
  orderId: string
  address: string
  city: string
  codAmount: number
  currency: string
  status: DeliveryStatus
  customerName: string
}

const MOCK_DELIVERIES: DeliveryItem[] = [
  { orderId: 'ORD-001-ABC', address: '14 Maple Street', city: 'Ho Chi Minh City', codAmount: 89.99, currency: 'USD', status: 'assigned', customerName: 'Nguyen Van A' },
  { orderId: 'ORD-002-DEF', address: '7 Rose Avenue', city: 'Hanoi', codAmount: 240.00, currency: 'USD', status: 'in_transit', customerName: 'Tran Thi B' },
  { orderId: 'ORD-003-GHI', address: '3 Dragon Road, Apt 5B', city: 'Da Nang', codAmount: 55.00, currency: 'USD', status: 'pending', customerName: 'Le Van C' },
  { orderId: 'ORD-004-JKL', address: '22 Bamboo Lane', city: 'Hue', codAmount: 195.00, currency: 'USD', status: 'delivered', customerName: 'Pham Thi D' },
]

const statusConfig: Record<DeliveryStatus, { label: string; variant: BadgeVariant }> = {
  pending:    { label: 'Pending',    variant: 'default' },
  assigned:   { label: 'Assigned',   variant: 'info' },
  in_transit: { label: 'In Transit', variant: 'warning' },
  delivered:  { label: 'Delivered',  variant: 'success' },
}

export default function DeliveryListPage() {
  const active = MOCK_DELIVERIES.filter((d) => d.status !== 'delivered')
  const done = MOCK_DELIVERIES.filter((d) => d.status === 'delivered')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
          <p className="text-sm text-gray-500 mt-0.5">{active.length} active · {done.length} completed today</p>
        </div>
        <Badge variant="success" dot>On shift</Badge>
      </div>

      {/* Active */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active ({active.length})</h2>
      <div className="flex flex-col gap-3 mb-8">
        {active.map((d) => {
          const cfg = statusConfig[d.status]
          return (
            <Card key={d.orderId} padding="md" className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 font-mono">{d.orderId}</p>
                  <Badge variant={cfg.variant} size="sm" dot>{cfg.label}</Badge>
                </div>
                <p className="text-sm text-gray-700 truncate">{d.address}, {d.city}</p>
                <p className="text-xs text-gray-500 mt-0.5">{d.customerName}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-sm font-bold text-gray-900">COD {formatCurrency(d.codAmount, d.currency)}</span>
                <Link href={`/delivery/orders/${d.orderId}`}>
                  <Button size="sm">
                    {d.status === 'assigned' ? 'Start Delivery' : 'View'}
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Completed */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Completed Today ({done.length})</h2>
      <div className="flex flex-col gap-2">
        {done.map((d) => (
          <Card key={d.orderId} padding="sm" className="flex items-center justify-between opacity-60">
            <div>
              <p className="text-sm font-medium font-mono text-gray-700">{d.orderId}</p>
              <p className="text-xs text-gray-500">{d.city}</p>
            </div>
            <Badge variant="success" size="sm">Delivered ✓</Badge>
          </Card>
        ))}
      </div>
    </div>
  )
}
