import { NextResponse, type NextRequest } from 'next/server'
import { verifyJwt, extractBearerToken } from '@/lib/auth/jwt'

// Routes that require a valid JWT
// Note: Next.js route groups like (seller) don't appear in the URL.
// /dashboard and /products/new → (seller), /orders → (delivery)
// In dev, auth is bypassed on page routes so the UI is usable without login.
const PROTECTED_API_PREFIXES = [
  '/api/orders',
  '/api/delivery',
]

// API routes where only mutating methods need auth
const PROTECTED_API_MUTATION = ['/api/products']
const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

function isProtected(pathname: string, method: string): boolean {
  if (PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p))) return true
  if (PROTECTED_API_MUTATION.some((p) => pathname.startsWith(p)) && MUTATION_METHODS.has(method)) return true
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  if (!isProtected(pathname, method)) {
    return NextResponse.next()
  }

  const token = extractBearerToken(request.headers.get('authorization') ?? '')
  if (!token) {
    // For page routes redirect to login; for API routes return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const payload = await verifyJwt(token)
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.sub)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


