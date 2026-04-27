import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Search service is not configured (missing Supabase env vars).' },
      { status: 503 }
    )
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseKey
  )

  const { searchParams } = new URL(request.url)

  // Text search
  const q = searchParams.get('q')?.trim()

  // Product attribute filters
  const productType     = searchParams.get('product_type') || searchParams.get('type')
  const style           = searchParams.get('style')
  const material        = searchParams.get('material')
  const color           = searchParams.get('color')
  const pattern         = searchParams.get('pattern')
  const season          = searchParams.get('season')
  const occasion        = searchParams.get('occasion')
  const consumerProfile = searchParams.get('consumer_profile')
  const trendNotes      = searchParams.get('trend_notes')

  // Contextual filters
  const continent = searchParams.get('continent')
  const country   = searchParams.get('country')
  const city      = searchParams.get('city')

  // Time filters
  const year  = searchParams.get('year')   // e.g. "2025"
  const month = searchParams.get('month')  // e.g. "3" (1-12)

  // Designer filter
  const designer = searchParams.get('designer')

  // Pagination
  const limit  = Math.min(parseInt(searchParams.get('limit')  || '20', 10), 200)
  const offset = Math.max(parseInt(searchParams.get('offset') || '0',  10), 0)

  let dbQuery = supabase.from('products').select('*').order('created_at', { ascending: false })

  // Full-text search against the tsvector column.
  // 'plain' uses plainto_tsquery — forgiving with natural language input
  // (no special syntax required; handles "embroidered neckline", "artisan market" etc.)
  if (q) {
    dbQuery = dbQuery.textSearch('search_vector', q, { type: 'plain' })
  }

  // --- Product attribute filters (JSONB path equality) ---
  if (productType)     dbQuery = dbQuery.eq('metadata->>product_type',    productType)
  if (style)           dbQuery = dbQuery.eq('metadata->>style',            style)
  if (material)        dbQuery = dbQuery.eq('metadata->>material',         material)
  // color_palette is a JSONB array — use the @> (contains) operator
  if (color)           dbQuery = dbQuery.filter('metadata->color_palette', 'cs', JSON.stringify([color]))
  if (pattern)         dbQuery = dbQuery.eq('metadata->>pattern',          pattern)
  if (season)          dbQuery = dbQuery.eq('metadata->>season',           season)
  if (occasion)        dbQuery = dbQuery.eq('metadata->>occasion',         occasion)
  if (consumerProfile) dbQuery = dbQuery.eq('metadata->>consumer_profile', consumerProfile)
  if (trendNotes)      dbQuery = dbQuery.ilike('metadata->>trend_notes',   `%${trendNotes}%`)

  // --- Location filters (nested JSONB) ---
  if (continent) dbQuery = dbQuery.eq('metadata->location_context->>continent', continent)
  if (country)   dbQuery = dbQuery.eq('metadata->location_context->>country',   country)
  if (city)      dbQuery = dbQuery.eq('metadata->location_context->>city',      city)

  // --- Time range filters ---
  if (year) {
    const y = parseInt(year, 10)
    if (!isNaN(y)) {
      dbQuery = dbQuery
        .gte('created_at', `${y}-01-01T00:00:00.000Z`)
        .lt('created_at',  `${y + 1}-01-01T00:00:00.000Z`)
    }
  }
  if (month && !year) {
    // month-only filter without a year — filter by calendar month across all years
    // Supabase does not expose date_part; fall through to client filtering
    // (acceptable for POC dataset sizes)
  }

  // --- Designer filter ---
  if (designer) dbQuery = dbQuery.ilike('metadata->>designer', `%${designer}%`)

  // Pagination applied last
  dbQuery = dbQuery.range(offset, offset + limit - 1)

  const { data, error } = await dbQuery

  // Fallback for legacy deployments that still store records directly in `images`.
  if (error) {
    let legacyQuery = supabase.from('images').select('*').order('created_at', { ascending: false })

    if (q) legacyQuery = legacyQuery.textSearch('search_vector', q, { type: 'plain' })
    if (productType) legacyQuery = legacyQuery.eq('ai_metadata->>product_type', productType)
    if (style) legacyQuery = legacyQuery.eq('ai_metadata->>style', style)
    if (material) legacyQuery = legacyQuery.eq('ai_metadata->>material', material)
    if (color) legacyQuery = legacyQuery.filter('ai_metadata->color_palette', 'cs', JSON.stringify([color]))
    if (pattern) legacyQuery = legacyQuery.eq('ai_metadata->>pattern', pattern)
    if (season) legacyQuery = legacyQuery.eq('ai_metadata->>season', season)
    if (occasion) legacyQuery = legacyQuery.eq('ai_metadata->>occasion', occasion)
    if (consumerProfile) legacyQuery = legacyQuery.eq('ai_metadata->>consumer_profile', consumerProfile)
    if (trendNotes) legacyQuery = legacyQuery.ilike('ai_metadata->>trend_notes', `%${trendNotes}%`)
    if (continent) legacyQuery = legacyQuery.eq('ai_metadata->location_context->>continent', continent)
    if (country) legacyQuery = legacyQuery.eq('ai_metadata->location_context->>country', country)
    if (city) legacyQuery = legacyQuery.eq('ai_metadata->location_context->>city', city)
    if (designer) legacyQuery = legacyQuery.ilike('designer', `%${designer}%`)
    if (year) {
      const y = parseInt(year, 10)
      if (!isNaN(y)) {
        legacyQuery = legacyQuery
          .gte('created_at', `${y}-01-01T00:00:00.000Z`)
          .lt('created_at', `${y + 1}-01-01T00:00:00.000Z`)
      }
    }

    legacyQuery = legacyQuery.range(offset, offset + limit - 1)
    const { data: legacyData, error: legacyError } = await legacyQuery
    if (legacyError) {
      return NextResponse.json({ error: legacyError.message }, { status: 500 })
    }
    return NextResponse.json(legacyData ?? [])
  }

  // Post-filter by month when requested without a year (done in-process for POC)
  let results = (data ?? []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    file_url: row.url,
    ai_description: row.description,
    ai_metadata: row.metadata,
    designer: row.metadata?.designer ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))
  if (month && !year) {
    const m = parseInt(month, 10)
    if (!isNaN(m)) {
      results = results.filter(
        (img: any) => new Date(img.created_at).getMonth() + 1 === m
      )
    }
  }

  return NextResponse.json(results)
}