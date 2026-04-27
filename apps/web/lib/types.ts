/**
 * Canonical runtime types — single source of truth for apps/web.
 * API routes, services, and repositories all import from here.
 */

// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole     = 'buyer' | 'seller' | 'delivery' | 'admin'
export type AuthProvider = 'email' | 'google' | 'facebook' | 'apple'

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  passwordHash: string
  name: string
  role: UserRole
  provider: AuthProvider
  country: string        // ISO 3166-1 alpha-2
  phone?: string
  avatarUrl?: string
  isVerified: boolean
  createdAt: string      // ISO 8601
  updatedAt: string
}

// ─── JWT ──────────────────────────────────────────────────────────────────────
export interface JwtPayload {
  sub: string            // userId
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

// ─── Product ──────────────────────────────────────────────────────────────────
export type ProductStatus = 'draft' | 'active' | 'inactive' | 'rejected'

export interface Product {
  id: string
  sellerId: string
  name: string
  description: string
  price: number          // in USD
  currency: string       // ISO 4217
  country: string        // origin country ISO 3166-1 alpha-2
  category: string
  images: string[]
  stock: number
  rating: number         // 0–5
  reviewCount: number
  status: ProductStatus
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending' | 'confirmed' | 'processing'
  | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export type PaymentMethod = 'cod' | 'stripe' | 'razorpay'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  country: string
}

export interface ShippingAddress {
  name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface Order {
  id: string
  buyerId: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  total: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  shippingAddress: ShippingAddress
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Delivery ─────────────────────────────────────────────────────────────────
export type DeliveryStatus =
  | 'pending' | 'assigned' | 'in_transit' | 'arrived' | 'delivered' | 'failed'

export interface GeoLocation {
  lat: number
  lng: number
  address?: string
  timestamp: string
}

export interface DeliveryRecord {
  id: string
  orderId: string
  agentId: string | null
  status: DeliveryStatus
  otpHash: string | null
  otpExpiresAt: string | null
  location: GeoLocation | null
  attemptCount: number
  estimatedDelivery: string | null
  deliveredAt: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export interface PaymentRecord {
  id: string
  orderId: string
  method: PaymentMethod
  status: PaymentStatus
  amount: number
  currency: string
  metadata: Record<string, string>
  createdAt: string
  updatedAt: string
}

// ─── API response helpers ─────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  ok: true
  data: T
  meta?: { total?: number; page?: number; limit?: number }
}

export interface ApiError {
  ok: false
  error: { code: string; message: string; details?: unknown }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export function ok<T>(data: T, meta?: ApiSuccess<T>['meta']): ApiSuccess<T> {
  return { ok: true, data, ...(meta ? { meta } : {}) }
}

export function err(code: string, message: string, details?: unknown): ApiError {
  return { ok: false, error: { code, message, details } }
}
