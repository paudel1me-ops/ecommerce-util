import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

const STATS = [
  { label: 'Total Earnings', value: formatCurrency(4_280, 'USD'), change: '+12%', positive: true },
  { label: 'Active Products', value: '14', change: '+2', positive: true },
  { label: 'Pending Orders', value: '6', change: '+1', positive: false },
  { label: 'Avg Rating', value: '4.7 ★', change: 'Stable', positive: true },
]

const RECENT_ORDERS = [
  { id: 'ORD-001', product: 'Silk Scarf', buyer: 'A.K.', amount: 89.99, status: 'pending' as const },
  { id: 'ORD-002', product: 'Ceramic Bowl Set', buyer: 'M.T.', amount: 240.00, status: 'confirmed' as const },
  { id: 'ORD-003', product: 'Woven Basket', buyer: 'S.L.', amount: 55.00, status: 'shipped' as const },
]

const statusBadge = { pending: 'warning', confirmed: 'info', shipped: 'info', delivered: 'success' } as const

export default function SellerDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Artisan Co. 🇻🇳</p>
        </div>
        <Link href="/seller/products/new">
          <Button>+ Add Product</Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((s) => (
          <Card key={s.label} padding="md">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            <p className={`text-xs mt-1 ${s.positive ? 'text-green-600' : 'text-amber-600'}`}>{s.change} this month</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <CardHeader className="px-5 pt-5 pb-4">
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <div className="divide-y divide-gray-100">
              {RECENT_ORDERS.map((order) => (
                <div key={order.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.product}</p>
                    <p className="text-xs text-gray-500">{order.id} · {order.buyer}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatCurrency(order.amount)}</span>
                    <Badge variant={statusBadge[order.status]}>{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance */}
        <div className="flex flex-col gap-4">
          <Card padding="md">
            <CardHeader><CardTitle>Origin Compliance</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Verified</span><span className="font-semibold text-green-600">11 / 14</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
                <p className="text-xs text-gray-500">3 products need origin review</p>
              </div>
            </CardContent>
          </Card>

          <Card padding="md">
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link href="/seller/products/new"><Button variant="secondary" fullWidth size="sm">Add New Product</Button></Link>
              <Button variant="ghost" fullWidth size="sm">View All Orders</Button>
              <Button variant="ghost" fullWidth size="sm">Manage Inventory</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
