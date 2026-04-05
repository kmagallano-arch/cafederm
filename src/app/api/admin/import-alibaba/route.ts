import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 })

    // Step 1: Fetch Alibaba page with full browser-like headers
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    if (!pageRes.ok) return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 })
    const html = await pageRes.text()

    // If Alibaba returned a short/blocked page, try the product ID approach
    const productIdMatch = url.match(/_(\d+)\.html/)
    const productId = productIdMatch?.[1]

    // Also try fetching the mobile/offer API for more data
    let extraImages: string[] = []
    if (productId) {
      try {
        const offerRes = await fetch(`https://www.alibaba.com/product-detail/api/offer/${productId}/detail.json`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json',
            'Referer': url,
          },
        })
        if (offerRes.ok) {
          const offerData = await offerRes.json()
          // Extract images from API response
          const apiImages = JSON.stringify(offerData)
          const apiImgPattern = /https?:\/\/[a-z0-9]+\.alicdn\.com\/[^"'\\,\s]+\.(jpg|jpeg|png|webp)/gi
          let m
          while ((m = apiImgPattern.exec(apiImages)) !== null) {
            if (!/avatar|logo|icon|flag|tps-|TB1/i.test(m[0])) {
              extraImages.push(m[0])
            }
          }
        }
      } catch {
        // API fallback failed, continue with HTML
      }
    }

    // Step 2: Extract image URLs (original, unmodified)
    const htmlImages = extractAlibabaImages(html)
    // Merge with API-fetched images, dedup
    const allImgSet = new Set(htmlImages.concat(extraImages))
    const imageUrls = Array.from(allImgSet).slice(0, 20)

    // Step 3: Scrape product text data from the page
    const scrapedData = scrapeProductData(html)

    // Step 4: Download original images and upload to Supabase Storage
    const uploadedImageUrls: string[] = []
    for (const imgUrl of imageUrls.slice(0, 20)) {
      try {
        const imgRes = await fetch(imgUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': url,
          },
        })
        if (!imgRes.ok) continue
        const buffer = Buffer.from(await imgRes.arrayBuffer())
        if (buffer.length < 5000) continue // skip tiny images

        const ext = imgUrl.includes('.png') ? 'png' : 'jpg'
        const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, buffer, {
            contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
            upsert: true,
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
        uploadedImageUrls.push(urlData.publicUrl)
      } catch (e) {
        console.error('Error downloading image:', e)
        continue
      }
    }

    // Step 5: Use Gemini to rewrite text content (NOT images)
    let productData = {
      name: scrapedData.title || '',
      description: '',
      price: 2400,
      ingredients: '',
      howToUse: '',
      keyBenefits: [] as string[],
      recommendedFor: [] as string[],
      tags: ['new'] as string[],
      variants: [] as { name: string; options: string[] }[],
    }

    if (process.env.GEMINI_API_KEY && (scrapedData.title || scrapedData.description || scrapedData.specs.length > 0)) {
      try {
        const rewritten = await rewriteWithGemini(scrapedData)
        if (rewritten) {
          productData = { ...productData, ...rewritten }
        }
      } catch (e) {
        console.error('Gemini rewrite error:', e)
        // Fall through with scraped data as-is
      }
    }

    return NextResponse.json({
      images: uploadedImageUrls,
      productData,
      total: imageUrls.length,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function extractAlibabaImages(html: string): string[] {
  const images: Set<string> = new Set()

  // Method 1: Look for alicdn.com image URLs in the HTML
  const cdnPattern = /https?:\/\/[a-z0-9]+\.alicdn\.com\/[^\s"'<>\\]+\.(jpg|jpeg|png|webp)/gi
  let match
  while ((match = cdnPattern.exec(html)) !== null) {
    let imgUrl = match[0]
    // Skip UI elements
    if (/avatar|logo|icon|flag|tps-|TB1/i.test(imgUrl)) continue
    // Remove size suffixes to get full resolution
    imgUrl = imgUrl.replace(/_\d+x\d+q?\d*\.(jpg|jpeg|png|webp)/i, '.$1')
    imgUrl = imgUrl.replace(/\.(jpg|jpeg|png|webp)_\d+x\d+\.\1/i, '.$1')
    imgUrl = imgUrl.replace(/_\d+x\d+/i, '')
    images.add(imgUrl)
  }

  // Method 2: Look for image data in script tags (common Alibaba pattern)
  const scriptPattern = /"(?:imageUrl|originalImageUrl|imgUrl)":\s*"(https?:\/\/[^"]+)"/gi
  while ((match = scriptPattern.exec(html)) !== null) {
    const imgUrl = match[1]
    if (!/avatar|logo|icon|flag|tps-|TB1/i.test(imgUrl)) {
      images.add(imgUrl)
    }
  }

  // Method 3: Look for Open Graph images
  const ogPattern = /property="og:image"\s+content="([^"]+)"/gi
  while ((match = ogPattern.exec(html)) !== null) {
    images.add(match[1])
  }

  // Method 4: data-src and data-lazy-src attributes
  const dataSrcPattern = /data-(?:lazy-)?src="(https?:\/\/[a-z0-9]+\.alicdn\.com\/[^"]+)"/gi
  while ((match = dataSrcPattern.exec(html)) !== null) {
    const imgUrl = match[1]
    if (!/avatar|logo|icon|flag|tps-|TB1/i.test(imgUrl)) {
      images.add(imgUrl)
    }
  }

  // Method 5: Look for window.__INIT_DATA or similar JS data objects with image arrays
  const initDataPattern = /"(?:images|imgList|mainImages)":\s*\[([\s\S]*?)\]/gi
  while ((match = initDataPattern.exec(html)) !== null) {
    const urlsInArray = /https?:\/\/[a-z0-9]+\.alicdn\.com\/[^"'\\]+/gi
    let innerMatch
    while ((innerMatch = urlsInArray.exec(match[1])) !== null) {
      const imgUrl = innerMatch[0]
      if (!/avatar|logo|icon|flag|tps-|TB1/i.test(imgUrl)) {
        images.add(imgUrl)
      }
    }
  }

  // Method 6: data-imgs attribute (common in Alibaba galleries)
  const dataImgsPattern = /data-imgs="([^"]+)"/gi
  while ((match = dataImgsPattern.exec(html)) !== null) {
    try {
      const decoded = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')
      const urlsInAttr = /https?:\/\/[a-z0-9]+\.alicdn\.com\/[^"'\\,\s]+/gi
      let innerMatch
      while ((innerMatch = urlsInAttr.exec(decoded)) !== null) {
        const imgUrl = innerMatch[0]
        if (!/avatar|logo|icon|flag|tps-|TB1/i.test(imgUrl)) {
          images.add(imgUrl)
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  // Deduplicate by base URL (after removing size suffixes) and filter
  const seen = new Set<string>()
  return Array.from(images).filter(imgUrl => {
    if (imgUrl.length <= 30) return false
    // Normalize for dedup
    const base = imgUrl.replace(/_\d+x\d+q?\d*/i, '').replace(/\.\w+_\d+x\d+\.\w+$/i, '')
    if (seen.has(base)) return false
    seen.add(base)
    return true
  }).slice(0, 20)
}

interface ScrapedData {
  title: string
  description: string
  specs: { key: string; value: string }[]
}

function scrapeProductData(html: string): ScrapedData {
  let title = ''
  let description = ''
  const specs: { key: string; value: string }[] = []

  // Title: og:title > <title> > <h1>
  const ogTitleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i)
  if (ogTitleMatch) {
    title = ogTitleMatch[1]
  } else {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].replace(/\s*[-|].*$/, '').trim()
    }
  }
  if (!title) {
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    if (h1Match) title = h1Match[1].trim()
  }

  // Description: og:description or meta description
  const ogDescMatch = html.match(/property="og:description"\s+content="([^"]+)"/i)
  if (ogDescMatch) {
    description = ogDescMatch[1]
  } else {
    const metaDescMatch = html.match(/name="description"\s+content="([^"]+)"/i)
    if (metaDescMatch) description = metaDescMatch[1]
  }

  // Specs: look for key-value pairs in tables or data attributes
  const specRowPattern = /<t[dh][^>]*>\s*([^<]+)\s*<\/t[dh]>\s*<t[dh][^>]*>\s*([^<]+)\s*<\/t[dh]>/gi
  let specMatch
  while ((specMatch = specRowPattern.exec(html)) !== null) {
    const key = specMatch[1].trim()
    const value = specMatch[2].trim()
    if (key && value && key.length < 100 && value.length < 500) {
      specs.push({ key, value })
    }
  }

  // Also look for JSON-LD structured data
  const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  let jsonMatch
  while ((jsonMatch = jsonLdPattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(jsonMatch[1])
      if (data.name && !title) title = data.name
      if (data.description && !description) description = data.description
    } catch {
      // ignore parse errors
    }
  }

  // Decode HTML entities
  title = decodeHtmlEntities(title)
  description = decodeHtmlEntities(description)

  return { title, description, specs }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

async function rewriteWithGemini(scraped: ScrapedData): Promise<{
  name: string
  description: string
  price: number
  ingredients: string
  howToUse: string
  keyBenefits: string[]
  recommendedFor: string[]
  tags: string[]
  variants: { name: string; options: string[] }[]
} | null> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

  const specsText = scraped.specs.map(s => `${s.key}: ${s.value}`).join('\n')

  const prompt = `You are a copywriter for CafeDerm, a premium skincare brand. Given this raw product data scraped from a supplier page, rewrite it as clean, premium product copy.

Raw title: ${scraped.title}
Raw description: ${scraped.description}
Specs:
${specsText || '(none)'}

Return a JSON object (no markdown, no code fences) with these fields:
{
  "name": "Clean product name suitable for a premium skincare brand (short, elegant)",
  "description": "2-3 sentences of premium product copy describing what this product does and why it's special",
  "price": 2400,
  "ingredients": "Best guess at ingredients based on the product type and any specs, or empty string if unclear",
  "howToUse": "Usage instructions appropriate for this type of product",
  "keyBenefits": ["3-5 key benefits as short phrases"],
  "recommendedFor": ["2-3 skin types or concerns this product addresses"],
  "tags": ["new"],
  "variants": []
}

Price should be in cents (e.g. 2400 = $24.00). Set a reasonable retail price for a premium skincare product of this type.
If the product is clearly not skincare, still adapt the copy to sound premium and professional.
Return ONLY the JSON object, nothing else.`

  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  })

  if (!res.ok) {
    console.error('Gemini API error:', res.status, await res.text())
    return null
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) return null

  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      name: parsed.name || scraped.title,
      description: parsed.description || '',
      price: typeof parsed.price === 'number' ? parsed.price : 2400,
      ingredients: parsed.ingredients || '',
      howToUse: parsed.howToUse || '',
      keyBenefits: Array.isArray(parsed.keyBenefits) ? parsed.keyBenefits : [],
      recommendedFor: Array.isArray(parsed.recommendedFor) ? parsed.recommendedFor : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['new'],
      variants: Array.isArray(parsed.variants) ? parsed.variants : [],
    }
  } catch (e) {
    console.error('Failed to parse Gemini response:', text, e)
    return null
  }
}
