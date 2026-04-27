/**
 * A70 Integration Test – full end-to-end happy path + 4 error cases
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '@/lib/db/store'
import * as authSvc from '@/lib/services/auth-service'
import { productService } from '@/lib/services/product-service'
import { orderService } from '@/lib/services/order-service'
import { deliveryService } from '@/lib/services/delivery-service'

beforeEach(() => {
  store.users.clear()
  store.products.clear()
  store.orders.clear()
  store.deliveries.clear()
  store.rateLimits.clear()
})

const addr = {
  name: 'Test', phone: '1234567890', line1: '1 Main St',
  city: 'NYC', state: 'NY', postalCode: '10001', country: 'US',
}

const makeProduct = (sellerId: string) => ({
  sellerId, sellerCountry: 'IN', name: 'Widget', description: '',
  price: 10, currency: 'USD', stock: 10, category: 'Other',
  country: 'IN', images: [] as string[], tags: [] as string[],
})

describe('A70 – Full E2E Flow', () => {
  it('1. complete order lifecycle: register → login → product → order → OTP delivery', async () => {
    const sellerRes = await authSvc.register({ email: 'seller@t.com', password: 'pass123', role: 'seller', country: 'IN', name: 'S' })
    const buyerRes  = await authSvc.register({ email: 'buyer@t.com',  password: 'pass123', role: 'buyer',  country: 'US', name: 'B' })
    const agentRes  = await authSvc.register({ email: 'agent@t.com',  password: 'pass123', role: 'delivery', country: 'IN', name: 'A' })
    if (!sellerRes.ok || !buyerRes.ok || !agentRes.ok) throw new Error('Registration failed')

    const agent = store.users.get(agentRes.data.user.id)!
    store.users.set(agent.id, { ...agent, isVerified: true })

    const loginRes = await authSvc.login({ email: 'seller@t.com', password: 'pass123' })
    expect(loginRes.ok).toBe(true)

    const productRes = await productService.create({
      sellerId: sellerRes.data.user.id, sellerCountry: 'IN',
      name: 'Kashmiri Saffron', description: 'Pure saffron',
      price: 50, currency: 'USD', stock: 100, category: 'Spices',
      country: 'IN', images: [], tags: ['luxury'],
    })
    expect(productRes.ok).toBe(true)
    if (!productRes.ok) throw new Error()

    const orderRes = await orderService.create({
      buyerId: buyerRes.data.user.id,
      items: [{ productId: productRes.data.id, quantity: 2 }],
      shippingAddress: addr,
    })
    expect(orderRes.ok).toBe(true)
    if (!orderRes.ok) throw new Error()

    const delivery = [...store.deliveries.values()].find(d => d.orderId === orderRes.data.id)
    expect(delivery).toBeDefined()
    expect(delivery!.status).toBe('assigned')

    await deliveryService.updateStatus(delivery!.id, 'in_transit', agent.id)
    await deliveryService.updateStatus(delivery!.id, 'arrived', agent.id)

    const otpRes = await deliveryService.generateOtp(delivery!.id, agent.id)
    expect(otpRes.ok).toBe(true)
    if (!otpRes.ok) throw new Error()

    const confirmRes = await deliveryService.confirmOtp(delivery!.id, otpRes.data.otp)
    expect(confirmRes.ok).toBe(true)

    const finalOrder = store.orders.get(orderRes.data.id)!
    expect(finalOrder.status).toBe('delivered')
    expect(finalOrder.paymentStatus).toBe('paid')
  })

  it('2. duplicate email registration → EMAIL_EXISTS error', async () => {
    await authSvc.register({ email: 'dup@t.com', password: 'pass123', role: 'buyer', country: 'US', name: 'A' })
    const res = await authSvc.register({ email: 'dup@t.com', password: 'pass456', role: 'buyer', country: 'US', name: 'B' })
    expect(res.ok).toBe(false)
    if (res.ok) throw new Error()
    expect(res.error.code).toBe('EMAIL_EXISTS')
  })

  it('3. restricted origin product (KP) → COUNTRY_RESTRICTED error', async () => {
    const sellerRes = await authSvc.register({ email: 'kp@t.com', password: 'pass123', role: 'seller', country: 'KP', name: 'K' })
    expect(sellerRes.ok).toBe(true)
    if (!sellerRes.ok) throw new Error()

    const productRes = await productService.create({
      sellerId: sellerRes.data.user.id, sellerCountry: 'KP',
      name: 'DPRK Widget', description: '', price: 10, currency: 'USD',
      stock: 5, category: 'Electronics', country: 'KP', images: [], tags: [],
    })
    expect(productRes.ok).toBe(false)
    if (productRes.ok) throw new Error()
    expect(productRes.error.code).toBe('COUNTRY_RESTRICTED')
  })

  it('4. insufficient stock order → INSUFFICIENT_STOCK error', async () => {
    const seller = await authSvc.register({ email: 's@t.com', password: 'pass123', role: 'seller', country: 'IN', name: 'S' })
    const buyer  = await authSvc.register({ email: 'b@t.com', password: 'pass123', role: 'buyer',  country: 'US', name: 'B' })
    if (!seller.ok || !buyer.ok) throw new Error()

    const product = await productService.create(makeProduct(seller.data.user.id))
    if (!product.ok) throw new Error()

    const orderRes = await orderService.create({
      buyerId: buyer.data.user.id,
      items: [{ productId: product.data.id, quantity: 99 }],
      shippingAddress: addr,
    })
    expect(orderRes.ok).toBe(false)
    if (orderRes.ok) throw new Error()
    expect(orderRes.error.code).toBe('INSUFFICIENT_STOCK')
  })

  it('5. wrong OTP confirmation → OTP_INVALID error', async () => {
    const seller = await authSvc.register({ email: 's2@t.com', password: 'pass123', role: 'seller', country: 'IN', name: 'S' })
    const buyer  = await authSvc.register({ email: 'b2@t.com', password: 'pass123', role: 'buyer',  country: 'US', name: 'B' })
    const agentR = await authSvc.register({ email: 'a2@t.com', password: 'pass123', role: 'delivery', country: 'IN', name: 'A' })
    if (!seller.ok || !buyer.ok || !agentR.ok) throw new Error()
    const agent = store.users.get(agentR.data.user.id)!
    store.users.set(agent.id, { ...agent, isVerified: true })

    const product = await productService.create(makeProduct(seller.data.user.id))
    if (!product.ok) throw new Error()

    const order = await orderService.create({
      buyerId: buyer.data.user.id,
      items: [{ productId: product.data.id, quantity: 1 }],
      shippingAddress: addr,
    })
    if (!order.ok) throw new Error()

    const delivery = [...store.deliveries.values()].find(d => d.orderId === order.data.id)!
    await deliveryService.updateStatus(delivery.id, 'in_transit', agent.id)
    await deliveryService.updateStatus(delivery.id, 'arrived', agent.id)
    await deliveryService.generateOtp(delivery.id, agent.id)

    const badOtp = await deliveryService.confirmOtp(delivery.id, '000000')
    expect(badOtp.ok).toBe(false)
    if (badOtp.ok) throw new Error()
    expect(badOtp.error.code).toBe('OTP_INVALID')
  })
})
