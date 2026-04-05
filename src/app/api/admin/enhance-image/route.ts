import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json()
    if (!imageUrl) return NextResponse.json({ error: 'No image URL provided' }, { status: 400 })
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    // Download the original image
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return NextResponse.json({ error: 'Failed to download image' }, { status: 500 })
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    const base64 = buffer.toString('base64')

    // Send to Gemini to recreate a clean version
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: 'Look at this product photo. Generate a new, clean, professional product photography image of the SAME exact product shown here. Requirements: clean white background, professional studio lighting, no text, no logos, no watermarks, no branding, no labels, no writing of any kind. Just the physical product itself, beautifully lit. Keep the exact same product shape, color, and design. High quality commercial product photography.',
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
      return NextResponse.json({ error: 'AI enhancement failed — try again' }, { status: 500 })
    }

    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts || []
    const imagePart = parts.find((p: { inlineData?: { data: string } }) => p.inlineData)

    if (!imagePart?.inlineData?.data) {
      // Check if Gemini refused
      const textPart = parts.find((p: { text?: string }) => p.text)
      const reason = textPart?.text || 'No image generated'
      return NextResponse.json({ error: `Enhancement failed: ${reason.slice(0, 100)}` }, { status: 500 })
    }

    // Upload enhanced image to Supabase Storage
    const enhancedBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
    const fileName = `enhanced-${Date.now()}-${Math.random().toString(36).slice(2)}.png`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, enhancedBuffer, { contentType: 'image/png', upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)

    return NextResponse.json({ enhancedUrl: urlData.publicUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
