import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 })

    // Step 1: Fetch Alibaba page
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    if (!pageRes.ok) return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 })
    const html = await pageRes.text()

    // Step 2: Extract image URLs
    const imageUrls = extractAlibabaImages(html)
    if (imageUrls.length === 0) {
      return NextResponse.json({ error: 'No product images found on page' }, { status: 404 })
    }

    // Step 3: Download, analyze, and upload each image
    const results: { url: string; originalUrl: string; brandingWarning: string | null; enhanced: boolean }[] = []
    for (const imgUrl of imageUrls.slice(0, 10)) {
      try {
        // Download image
        const imgRes = await fetch(imgUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': url,
          },
        })
        if (!imgRes.ok) continue
        const buffer = Buffer.from(await imgRes.arrayBuffer())
        if (buffer.length < 5000) continue // skip tiny images

        // Try to recreate a clean version using Gemini image generation
        let finalBuffer: Uint8Array = buffer
        let brandingWarning: string | null = null
        let wasEnhanced = false

        if (process.env.GEMINI_API_KEY) {
          const enhanced = await enhanceProductImage(buffer)
          if (enhanced.image) {
            finalBuffer = enhanced.image
            wasEnhanced = true
          }
          brandingWarning = enhanced.warning
        }

        // Upload to Supabase Storage
        const ext = wasEnhanced ? 'png' : (imgUrl.includes('.png') ? 'png' : 'jpg')
        const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, finalBuffer, {
            contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
            upsert: true,
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)

        results.push({
          url: urlData.publicUrl,
          originalUrl: imgUrl,
          brandingWarning,
          enhanced: wasEnhanced,
        })
      } catch (e) {
        console.error('Error processing image:', e)
        continue
      }
    }

    return NextResponse.json({ images: results, total: imageUrls.length })
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
    // Clean up URL - remove resize parameters to get full resolution
    imgUrl = imgUrl.replace(/_\d+x\d+\.(jpg|jpeg|png|webp)/i, '.$1')
    imgUrl = imgUrl.replace(/\.(\d+x\d+)\./i, '.')
    // Skip tiny images (icons, logos, avatars)
    if (imgUrl.includes('avatar') || imgUrl.includes('logo') || imgUrl.includes('icon') || imgUrl.includes('flag')) continue
    images.add(imgUrl)
  }

  // Method 2: Look for image data in script tags (common Alibaba pattern)
  const scriptPattern = /"(?:imageUrl|originalImageUrl|imgUrl)":\s*"(https?:\/\/[^"]+)"/gi
  while ((match = scriptPattern.exec(html)) !== null) {
    images.add(match[1])
  }

  // Method 3: Look for Open Graph images
  const ogPattern = /property="og:image"\s+content="([^"]+)"/gi
  while ((match = ogPattern.exec(html)) !== null) {
    images.add(match[1])
  }

  // Method 4: data-src and data-lazy-src attributes
  const dataSrcPattern = /data-(?:lazy-)?src="(https?:\/\/[a-z0-9]+\.alicdn\.com\/[^"]+)"/gi
  while ((match = dataSrcPattern.exec(html)) !== null) {
    images.add(match[1])
  }

  // Method 5: Look for window.__INIT_DATA or similar JS data objects with image arrays
  const initDataPattern = /"(?:images|imgList|mainImages)":\s*\[([\s\S]*?)\]/gi
  while ((match = initDataPattern.exec(html)) !== null) {
    const urlsInArray = /https?:\/\/[a-z0-9]+\.alicdn\.com\/[^"'\\]+/gi
    let innerMatch
    while ((innerMatch = urlsInArray.exec(match[1])) !== null) {
      images.add(innerMatch[0])
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
        images.add(innerMatch[0])
      }
    } catch {
      // ignore parse errors
    }
  }

  // Deduplicate and filter
  return Array.from(images).filter(imgUrl => {
    return imgUrl.length > 30 && !imgUrl.includes('avatar') && !imgUrl.includes('logo')
  })
}

async function enhanceProductImage(imageBuffer: Buffer): Promise<{ image: Buffer | null; warning: string | null }> {
  try {
    const base64 = imageBuffer.toString('base64')
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`

    // Use Gemini image model to recreate a clean version of the product
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "Look at this product photo. Generate a new, clean, professional product photography image of the SAME product shown here. Requirements: clean white background, professional studio lighting, no text, no logos, no watermarks, no branding, no labels, no writing of any kind on the product or background. Just the physical product itself, beautifully lit and photographed. High quality commercial product photography style.",
            },
            {
              inline_data: { mime_type: 'image/jpeg', data: base64 },
            },
          ],
        }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    })

    if (!res.ok) {
      // Fallback: just return original with analysis
      return { image: null, warning: await analyzeOnly(imageBuffer) }
    }

    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts || []

    // Find the image part
    const imagePart = parts.find((p: { inlineData?: { data: string } }) => p.inlineData)
    if (imagePart?.inlineData?.data) {
      const enhancedBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
      return { image: enhancedBuffer, warning: null }
    }

    // If Gemini refused to generate, check text response for policy block
    const textPart = parts.find((p: { text?: string }) => p.text)
    if (textPart?.text?.toLowerCase().includes('cannot') || textPart?.text?.toLowerCase().includes('sorry')) {
      return { image: null, warning: await analyzeOnly(imageBuffer) }
    }

    return { image: null, warning: null }
  } catch {
    return { image: null, warning: null }
  }
}

async function analyzeOnly(imageBuffer: Buffer): Promise<string | null> {
  try {
    const base64 = imageBuffer.toString('base64')
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Look at this product image. Is there any visible text, logos, watermarks, brand names, or supplier branding? Reply ONLY 'CLEAN' if none visible, or briefly describe what you see. Under 20 words." },
            { inline_data: { mime_type: 'image/jpeg', data: base64 } },
          ],
        }],
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!text || text.toUpperCase() === 'CLEAN') return null
    return text
  } catch {
    return null
  }
}
