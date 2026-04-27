export const dynamic = 'force-dynamic'

import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { ProductCard } from '@/components/marketplace/ProductCard'
import Link from 'next/link'

const CATEGORIES = ['All', 'Textiles', 'Ceramics', 'Jewelry', 'Food & Drink', 'Home Decor']

export default function HomePage() {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      {/* Hero — full-bleed navy banner */}
      <section className="w-full bg-[var(--brand-primary)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Authentic goods,<br className="hidden sm:block" /> verified at the source
          </h1>
          <p className="text-base sm:text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Every product on Origin Market is made — and verified — in its seller&apos;s home country.
          </p>
          {/* Search */}
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="search"
              placeholder="Search products, countries, crafts…"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]"
            />
            <button className="shrink-0 bg-[var(--brand-secondary)] text-[var(--brand-primary)] font-semibold px-5 py-3 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
              Search
            </button>
          </div>
          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-white text-[var(--brand-primary)] text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get started free
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 border border-white/40 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Browse gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Origin-verified sellers</span>
            <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> AI-powered classification</span>
            <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Cash on delivery</span>
            <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Artisan-direct pricing</span>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mr-1">Browse:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="px-4 py-1.5 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Featured Products</h2>
          <Link href="/dashboard" className="text-sm text-[var(--brand-primary)] hover:underline font-medium">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  )
}
