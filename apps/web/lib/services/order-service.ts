/**
 * Order service (A52) — business logic only. Calls orderRepo + productRepo + deliveryService.
 * Layer rule: no HTTP imports, no direct store access.
 */
import { orderRepo } from '@/lib/repositories/order-repo'
import { productRepo } from '@/lib/repositories/product-repo'
import { deliveryService } from '@/lib/services/delivery-service'
import { logger } from '@/lib/logger'
import { track } from '@/lib/analytics'
import { ok, err } from '@/lib/types'
import type { Order, OrderItem, ShippingAddress, ApiResponse } from '@/lib/types'

const SHIPPING_FEE = 5.00

export interface CreateOrderInput {
  buyerId:         string
  items:           Array<{ productId: string; quantity: number }>
  shippingAddress: ShippingAddress
  notes?:          string
}

export const orderService = {
  async create(input: CreateOrderInput): Promise<ApiResponse<Order>> {
    if (!input.items?.length)       return err('VALIDATION', 'Order must contain at least one item.')
    if (!input.shippingAddress)     return err('VALIDATION', 'Shipping address is required.')

    // Resolve + validate each item
    const resolvedItems: OrderItem[] = []
    let subtotal = 0

    for (const item of input.items) {
      if (item.quantity < 1) return err('VALIDATION', 'Quantity must be at least 1.')
      const product = productRepo.findById(item.productId)
      if (!product)               return err('PRODUCT_NOT_FOUND', `Product ${item.productId} not found.`)
      if (product.status !== 'active') return err('PRODUCT_UNAVAILABLE', `"${product.name}" is not available.`)
      if (product.stock < item.quantity)
        return err('INSUFFICIENT_STOCK', `Insufficient stock for "${product.name}" (available: ${product.stock}).`)

      resolvedItems.push({
        productId: product.id,
        name:      product.name,
        price:     product.price,
        quantity:  item.quantity,
        country:   product.country,
      })
      subtotal += product.price * item.quantity
    }

    const order = orderRepo.create({
      buyerId:         input.buyerId,
      items:           resolvedItems,
      subtotal,
      shippingFee:     SHIPPING_FEE,
      total:           Number((subtotal + SHIPPING_FEE).toFixed(2)),
      status:          'pending',
      paymentMethod:   'cod',
      paymentStatus:   'pending',
      shippingAddress: input.shippingAddress,
      notes:           input.notes,
    })

    // Deduct stock
    for (const item of resolvedItems) {
      const p = productRepo.findById(item.productId)
      if (p) productRepo.update(item.productId, { stock: p.stock - item.quantity })
    }

    logger.info('order.created', { orderId: order.id, buyerId: order.buyerId, total: order.total })
    track('order_placed', { orderId: order.id, total: order.total, itemCount: resolvedItems.length })

    // Auto-assign delivery agent
    await deliveryService.assign(order.id)

    return ok(order)
  },

  async getById(id: string, requesterId: string, requesterRole: string): Promise<ApiResponse<Order>> {
    const order = orderRepo.findById(id)
    if (!order) return err('NOT_FOUND', 'Order not found.')

    const canAccess =
      order.buyerId === requesterId ||
      requesterRole === 'admin' ||
      requesterRole === 'delivery'

    if (!canAccess) return err('FORBIDDEN', 'Access denied.')
    return ok(order)
  },

  async listForBuyer(buyerId: string): Promise<ApiResponse<Order[]>> {
    const orders = orderRepo.findByBuyer(buyerId)
    return ok(orders, { total: orders.length })
  },

  async updateStatus(
    id: string,
    status: Order['status'],
    requesterId: string,
    requesterRole: string
  ): Promise<ApiResponse<Order>> {
    const order = orderRepo.findById(id)
    if (!order) return err('NOT_FOUND', 'Order not found.')

    const canUpdate =
      requesterRole === 'admin' ||
      requesterRole === 'delivery' ||
      (requesterRole === 'buyer' && status === 'cancelled' && order.buyerId === requesterId)

    if (!canUpdate) return err('FORBIDDEN', 'Cannot update this order.')

    const updated = orderRepo.update(id, { status })
    if (!updated) return err('UPDATE_FAILED', 'Could not update order.')

    if (status === 'delivered') {
      track('order_delivered', { orderId: id })
    }
    return ok(updated)
  },
}
