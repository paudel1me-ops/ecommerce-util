'use client'

import { useState } from 'react'
import ImageGrid from '@/components/ImageGrid'
import Filters from '@/components/Filters'

export interface ActiveFilters {
  q: string
  product_type: string
  style: string
  material: string
  color: string
  pattern: string
  season: string
  occasion: string
  consumer_profile: string
  trend_notes: string
  continent: string
  country: string
  city: string
  designer: string
  year: string
  month: string
}

const EMPTY_FILTERS: ActiveFilters = {
  q: '', product_type: '', style: '', material: '', color: '', pattern: '',
  season: '', occasion: '', consumer_profile: '', trend_notes: '',
  continent: '', country: '', city: '', designer: '', year: '', month: '',
}

export default function Dashboard() {
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS)

  const setFilter = (key: keyof ActiveFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAll = () => setFilters(EMPTY_FILTERS)

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Product Gallery</h1>
          <a
            href="/upload"
            className="inline-flex items-center gap-1.5 bg-[var(--brand-primary)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            + Upload
          </a>
        </div>
        <div className="flex gap-6 items-start">
          {/* Image grid — takes remaining width */}
          <div className="flex-1 min-w-0">
            <ImageGrid filters={filters} />
          </div>
          {/* Filter sidebar — fixed width, sticky */}
          <aside className="w-72 flex-shrink-0 sticky top-20">
            <Filters filters={filters} setFilter={setFilter} clearAll={clearAll} />
          </aside>
        </div>
      </div>
    </div>
  )
}
