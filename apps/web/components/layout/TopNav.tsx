'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const NAV_LINKS = [
  { href: '/',                 label: 'Shop' },
  { href: '/dashboard',        label: 'Gallery' },
  { href: '/seller/dashboard', label: 'Sell' },
  { href: '/orders',           label: 'Deliver' },
]

export function TopNav() {
  const path = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-[var(--brand-primary)]">Origin</span>
          <span className="text-xl font-bold text-[var(--brand-secondary)]">Market</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                (href === '/' ? path === href : path.startsWith(href))
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/upload" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[var(--brand-primary)] transition-colors px-2 py-1.5">
            + Upload
          </Link>
          <Link href="/login">
            <Button size="sm" variant="ghost">Log in</Button>
          </Link>
          <Link href="/login">
            <Button size="sm" variant="primary">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default TopNav
