import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const maxDuration = 300 // 5 minutes — this is a long process

export async function POST(request: Request) {
  try {
    const { url, category = 'face-care', mode = 'create', existingProductId } = await request.json()
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 })

    // Step 1: Scrape Alibaba page
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    if (!pageRes.ok) return NextResponse.json({ error: 'Failed to fetch Alibaba page' }, { status: 500 })
    const html = await pageRes.text()

    // Step 2: Extract raw data from the page
    const rawData = extractAlibabaData(html)

    // Step 3: Use Gemini to rewrite everything for CafeDerm
    const productData = await rewriteForBrand(rawData, category)

    // Step 4: Extract and enhance images
    const imageUrls = extractAlibabaImages(html)
    const enhancedImages = await enhanceImages(imageUrls.slice(0, 6), url)

    // Step 5: Handle create vs update mode
    if (mode === 'update' && existingProductId) {
      // Update existing product — merge new data into existing
      const { data: existing, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', existingProductId)
        .single()

      if (fetchErr || !existing) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }

      // Only update fields that have new data
      if (productData.name) updates.name = productData.name
      if (productData.description) updates.description = productData.description
      if (productData.price) updates.price = productData.price
      if (productData.ingredients) updates.ingredients = productData.ingredients
      if (productData.howToUse) updates.how_to_use = productData.howToUse
      if (productData.keyBenefits?.length) updates.key_benefits = productData.keyBenefits
      if (productData.recommendedFor?.length) updates.recommended_for = productData.recommendedFor
      if (productData.tags?.length) updates.tags = productData.tags
      if (productData.variants?.length) updates.variants = productData.variants
      if (enhancedImages.length > 0) {
        // Append new images to existing ones
        const existingImages = existing.images || []
        updates.images = [...existingImages, ...enhancedImages]
      }
      updates.category = category

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', existingProductId)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ product: data, slug: data.slug })
    }

    // Create new product
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const id = 'prod_' + slug.replace(/-/g, '_').slice(0, 30)

    const product = {
      id,
      name: productData.name,
      slug,
      description: productData.description,
      price: productData.price,
      compare_at_price: productData.compareAtPrice || null,
      images: enhancedImages,
      category,
      tags: productData.tags || ['new'],
      rating: 4.7,
      review_count: 0,
      in_stock: true,
      ingredients: productData.ingredients,
      how_to_use: productData.howToUse,
      key_benefits: productData.keyBenefits,
      recommended_for: productData.recommendedFor,
      awards: '',
      subscribe_discount: 20,
      variants: productData.variants || [],
      related_product_ids: [],
      ritual_product_ids: [],
    }

    const { data, error } = await supabase.from('products').upsert(product).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ product: data, slug })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── Extract raw data from Alibaba HTML ─────────────────────────

function extractAlibabaData(html: string): { title: string; description: string; specs: string; price: string } {
  // Title: try multiple sources
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    || html.match(/og:title"\s+content="([^"]+)"/i)
    || html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  const rawTitle = titleMatch?.[1]?.trim() || 'Unknown Product'

  // Description from meta or page content
  const descMatch = html.match(/og:description"\s+content="([^"]+)"/i)
    || html.match(/name="description"\s+content="([^"]+)"/i)
  const rawDescription = descMatch?.[1]?.trim() || ''

  // Try to find product specs/details from common Alibaba patterns
  const specMatches: string[] = []
  const specPattern = /<(?:td|th|dt|dd|li)[^>]*>([^<]{3,100})<\/(?:td|th|dt|dd|li)>/gi
  let m
  while ((m = specPattern.exec(html)) !== null) {
    const text = m[1].trim()
    if (text.length > 3 && text.length < 100 && !text.includes('<') && !text.includes('{')) {
      specMatches.push(text)
    }
    if (specMatches.length > 50) break
  }

  // Price
  const priceMatch = html.match(/\$\s*(\d+\.?\d*)/i)
  const price = priceMatch?.[1] || ''

  return {
    title: rawTitle,
    description: rawDescription,
    specs: specMatches.join('\n'),
    price,
  }
}

// ─── AI rewrite for CafeDerm brand ──────────────────────────────

async function rewriteForBrand(rawData: { title: string; description: string; specs: string; price: string }, category: string) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

  const prompt = `You are a copywriter for CafeDerm, a premium skincare brand. Based on this Alibaba product listing, create polished product content for our DTC website.

RAW ALIBABA DATA:
Title: ${rawData.title}
Description: ${rawData.description}
Specs: ${rawData.specs}
Category: ${category}

Generate a JSON object with these EXACT fields:
{
  "name": "Clean, premium product name (no OEM/ODM/Private Label, max 6 words)",
  "description": "2-3 sentence premium product description. Highlight key active ingredients and benefits. Luxurious but clinical tone. No buzzwords like 'amazing' or 'incredible'.",
  "price": retail price in cents as integer (suggest a competitive DTC price, e.g. serum $24-32, cleanser $18-22, moisturizer $26-34, bundle $58-95),
  "compareAtPrice": null or higher price in cents for sale display,
  "ingredients": "Full ingredient list if available from the data, formatted properly with commas. If not available write a typical ingredient list for this type of product.",
  "howToUse": "Clear application instructions. How many drops/pumps, when to apply (AM/PM), any warnings.",
  "keyBenefits": ["benefit 1", "benefit 2", "benefit 3", "benefit 4", "benefit 5"] — 5 clear benefits,
  "recommendedFor": ["skin concern 1", "skin concern 2", "skin concern 3"] — 3-4 skin concerns this targets,
  "tags": ["new"] or ["new", "best-seller"],
  "variants": [{"name": "Size", "options": ["1 oz", "2 oz"]}] or [] if no variants make sense
}

Return ONLY the JSON object, no markdown, no explanation.`

  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  })

  if (!res.ok) {
    // Fallback: generate basic content
    return {
      name: rawData.title.replace(/OEM|ODM|Private Label|Custom|Factory/gi, '').trim().slice(0, 50),
      description: rawData.description || 'A premium skincare formula.',
      price: 2400,
      compareAtPrice: null,
      ingredients: '',
      howToUse: 'Apply to clean skin. Use morning and evening.',
      keyBenefits: ['Hydrates skin', 'Improves texture', 'Gentle formula'],
      recommendedFor: ['All skin types'],
      tags: ['new'],
      variants: [],
    }
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}'

  try {
    // Strip markdown code fences if present
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(jsonStr)
  } catch {
    return {
      name: rawData.title.replace(/OEM|ODM|Private Label|Custom|Factory/gi, '').trim().slice(0, 50),
      description: rawData.description || 'A premium skincare formula.',
      price: 2400,
      compareAtPrice: null,
      ingredients: '',
      howToUse: 'Apply to clean skin.',
      keyBenefits: ['Hydrates skin'],
      recommendedFor: ['All skin types'],
      tags: ['new'],
      variants: [],
    }
  }
}

// ─── Image enhancement ──────────────────────────────────────────

async function enhanceImages(imageUrls: string[], refererUrl: string): Promise<string[]> {
  const results: string[] = []

  for (const imgUrl of imageUrls) {
    try {
      // Download
      const imgRes = await fetch(imgUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': refererUrl },
      })
      if (!imgRes.ok) continue
      const buffer = Buffer.from(await imgRes.arrayBuffer())
      if (buffer.length < 5000) continue

      // Enhance with Gemini
      let finalBuffer: Uint8Array = buffer
      if (process.env.GEMINI_API_KEY) {
        const enhanced = await recreateCleanImage(buffer)
        if (enhanced) finalBuffer = enhanced
      }

      // Upload to Supabase
      const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.png`
      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, finalBuffer, { contentType: 'image/png', upsert: true })

      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
        results.push(data.publicUrl)
      }
    } catch {
      continue
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 2000))
  }

  return results
}

async function recreateCleanImage(imageBuffer: Buffer): Promise<Buffer | null> {
  try {
    const base64 = imageBuffer.toString('base64')
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: 'Look at this product photo. Generate a new, clean, professional product photography image of the SAME product. Clean white background, professional studio lighting, no text, no logos, no watermarks, no branding, no labels. Just the physical product beautifully photographed. High quality commercial product photography.' },
          { inline_data: { mime_type: 'image/jpeg', data: base64 } },
        ] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    const imagePart = data.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data: string } }) => p.inlineData)
    if (imagePart?.inlineData?.data) {
      return Buffer.from(imagePart.inlineData.data, 'base64')
    }
    return null
  } catch {
    return null
  }
}

// ─── Extract images from Alibaba HTML ───────────────────────────
// (Copied from import-alibaba route)

function extractAlibabaImages(html: string): string[] {
  const images: Set<string> = new Set()

  // Method 1: Look for alicdn.com image URLs in the HTML
  const cdnPattern = /https?:\/\/[a-z0-9]+\.alicdn\.com\/[^\s"'<>\\]+\.(jpg|jpeg|png|webp)/gi
  let match
  while ((match = cdnPattern.exec(html)) !== null) {
    let imgUrl = match[0]
    imgUrl = imgUrl.replace(/_\d+x\d+\.(jpg|jpeg|png|webp)/i, '.$1')
    imgUrl = imgUrl.replace(/\.(\d+x\d+)\./i, '.')
    if (imgUrl.includes('avatar') || imgUrl.includes('logo') || imgUrl.includes('icon') || imgUrl.includes('flag')) continue
    images.add(imgUrl)
  }

  // Method 2: Look for image data in script tags
  const scriptPattern = /"(?:imageUrl|originalImageUrl|imgUrl)":\s*"(https?:\/\/[^"]+)"/gi
  while ((match = scriptPattern.exec(html)) !== null) {
    images.add(match[1])
  }

  // Method 3: Open Graph images
  const ogPattern = /property="og:image"\s+content="([^"]+)"/gi
  while ((match = ogPattern.exec(html)) !== null) {
    images.add(match[1])
  }

  // Method 4: data-src and data-lazy-src attributes
  const dataSrcPattern = /data-(?:lazy-)?src="(https?:\/\/[a-z0-9]+\.alicdn\.com\/[^"]+)"/gi
  while ((match = dataSrcPattern.exec(html)) !== null) {
    images.add(match[1])
  }

  // Method 5: JS data objects with image arrays
  const initDataPattern = /"(?:images|imgList|mainImages)":\s*\[([\s\S]*?)\]/gi
  while ((match = initDataPattern.exec(html)) !== null) {
    const urlsInArray = /https?:\/\/[a-z0-9]+\.alicdn\.com\/[^"'\\]+/gi
    let innerMatch
    while ((innerMatch = urlsInArray.exec(match[1])) !== null) {
      images.add(innerMatch[0])
    }
  }

  // Method 6: data-imgs attribute
  const dataImgsPattern = /data-imgs="([^"]+)"/gi
  while ((match = dataImgsPattern.exec(html)) !== null) {
    try {
      const decoded = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')
      const urlsInAttr = /https?:\/\/[a-z0-9]+\.alicdn\.com\/[^"'\\,\s]+/gi
      let innerMatch
      while ((innerMatch = urlsInAttr.exec(decoded)) !== null) {
        images.add(innerMatch[0])
      }
    } catch {
      // ignore parse errors
    }
  }

  return Array.from(images).filter(imgUrl => {
    return imgUrl.length > 30 && !imgUrl.includes('avatar') && !imgUrl.includes('logo')
  })
}
