import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { parseClassification } from '@/lib/classification'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

function buildMockClassification(fileName: string) {
  const key = fileName.toLowerCase()
  const product_type = key.includes('shoe') ? 'shoes' : key.includes('bag') ? 'accessory' : 'dress'
  const style = key.includes('formal') ? 'formal' : 'casual'
  const material = key.includes('silk') ? 'silk' : 'cotton'

  return {
    description: `Mock classification for ${fileName} (OPENAI_API_KEY not configured).`,
    metadata: {
      product_type,
      style,
      material,
      color_palette: ['neutral', 'accent'],
      pattern: 'solid',
      season: 'all-season',
      occasion: style === 'formal' ? 'formal' : 'casual',
      consumer_profile: 'general',
      trend_notes: 'mock-local-classification',
      location_context: {
        continent: '',
        country: '',
        city: '',
      },
    },
  }
}

function toVectorLiteral(values: number[]): string {
  return `[${values.join(',')}]`
}

const CLASSIFICATION_PROMPT = `Analyze this product photo. Output ONLY valid JSON with no markdown fences.
Schema: {
  "description": "<rich natural-language description of the product>",
  "metadata": {
    "product_type": "<e.g. dress|shirt|pants|jacket|skirt|shoes|accessory>",
    "style": "<e.g. bohemian|casual|formal|streetwear|vintage|modern>",
    "material": "<e.g. cotton|silk|wool|denim|linen|leather>",
    "color_palette": ["<color1>", "<color2>"],
    "pattern": "<e.g. solid|striped|floral|plaid|geometric>",
    "season": "<summer|winter|spring|fall|all-season>",
    "occasion": "<casual|formal|party|work|athletic>",
    "consumer_profile": "<e.g. young professional|student|executive|artist>",
    "trend_notes": "<brief trend observation>",
    "location_context": {
      "continent": "<continent name or empty string>",
      "country": "<country name or empty string>",
      "city": "<city name or empty string>"
    }
  }
}`

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const usingServiceRole = Boolean(process.env.SUPABASE_SERVICE_KEY)
  const openaiKey = process.env.OPENAI_API_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Classification service is not configured (missing Supabase env vars).' },
      { status: 503 }
    )
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseKey
  )

  const formData = await request.formData()
  const file = formData.get('image') as File | null
  const designer = (formData.get('designer') as string | null)?.trim() ?? ''

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  let classification
  if (openaiKey) {
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: CLASSIFICATION_PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:${file.type};base64,${base64}` },
            },
          ],
        },
      ],
    })

    const rawContent = response.choices?.[0]?.message?.content ?? ''

    // Strip optional markdown code fences GPT-4o sometimes emits
    const content = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    if (!content) {
      return NextResponse.json({ error: 'No response from model' }, { status: 500 })
    }

    try {
      classification = parseClassification(content)
    } catch {
      return NextResponse.json({ error: 'Invalid classification data' }, { status: 500 })
    }
  } else {
    classification = buildMockClassification(file.name)
  }

  let embeddingLiteral: string | null = null
  if (openaiKey) {
    try {
    const embeddingText = [
      classification.description,
      classification.metadata.product_type,
      classification.metadata.style,
      classification.metadata.material,
      classification.metadata.pattern,
      classification.metadata.occasion,
      classification.metadata.consumer_profile,
      classification.metadata.trend_notes,
      classification.metadata.location_context?.continent,
      classification.metadata.location_context?.country,
      classification.metadata.location_context?.city,
      designer,
    ]
      .filter(Boolean)
      .join(' | ')

      const embeddingResponse = await getOpenAI().embeddings.create({
        model: 'text-embedding-3-small',
        input: embeddingText,
      })
      const vec = embeddingResponse.data?.[0]?.embedding
      if (Array.isArray(vec) && vec.length > 0) {
        embeddingLiteral = toVectorLiteral(vec)
      }
    } catch {
      // Keep upload flow resilient if embedding generation fails.
      embeddingLiteral = null
    }
  }

  // POC: no authenticated user — user_id stored as null
  const storagePath = `${Date.now()}-${file.name}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(storagePath, file)

  if (uploadError || !uploadData?.path) {
    if (!usingServiceRole) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        user_id: null,
        file_url: '',
        ai_description: classification.description,
        ai_metadata: {
          ...classification.metadata,
          ...(designer ? { designer } : {}),
          _local_fallback: true,
        },
        designer: designer || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        warning: uploadError?.message ?? 'Storage upload failed; returned local mock result.',
      })
    }

    return NextResponse.json(
      { error: uploadError?.message ?? 'Storage upload failed' },
      { status: 500 }
    )
  }

  const fileUrl = supabase.storage.from('uploads').getPublicUrl(uploadData.path).data.publicUrl

  // Primary path: new products schema (supports pgvector embeddings).
  const normalizedMetadata = {
    ...classification.metadata,
    ...(designer ? { designer } : {}),
  }

  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert({
      user_id: null,
      title: classification.metadata.product_type || file.name,
      description: classification.description,
      status: 'draft',
      url: fileUrl,
      label: classification.metadata.product_type || null,
      metadata: normalizedMetadata,
      cultural_context: classification.metadata.location_context ?? null,
      embedding: embeddingLiteral,
    })
    .select('*')
    .single()

  if (!productError && productData) {
    return NextResponse.json({
      id: productData.id,
      user_id: productData.user_id,
      file_url: productData.url,
      ai_description: productData.description,
      ai_metadata: productData.metadata,
      designer: productData.metadata?.designer ?? null,
      created_at: productData.created_at,
      updated_at: productData.updated_at,
    })
  }

  // Fallback path: legacy images schema.
  const { data: imageData, error: imageError } = await supabase
    .from('images')
    .insert({
      user_id: null,
      file_url: fileUrl,
      ai_description: classification.description,
      ai_metadata: classification.metadata,
      designer: designer || null,
    })
    .select()
    .single()

  if (imageError) {
    if (!usingServiceRole) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        user_id: null,
        file_url: fileUrl,
        ai_description: classification.description,
        ai_metadata: {
          ...classification.metadata,
          ...(designer ? { designer } : {}),
          _local_fallback: true,
        },
        designer: designer || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        warning: imageError.message,
      })
    }

    return NextResponse.json(
      {
        error: imageError.message,
        details: productError?.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json(imageData)
}
