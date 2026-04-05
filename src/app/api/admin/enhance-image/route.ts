import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const { imageUrl, prompt: customPrompt, generateNew } = await request.json()
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`

    let parts: Record<string, unknown>[]

    if (imageUrl && !generateNew) {
      // MODE 1: Edit/enhance an existing image
      const imgRes = await fetch(imageUrl)
      if (!imgRes.ok) return NextResponse.json({ error: 'Failed to download image' }, { status: 500 })
      const buffer = Buffer.from(await imgRes.arrayBuffer())
      const base64 = buffer.toString('base64')

      const defaultPrompt = 'Edit this product photo. Replace any visible brand name, logo, or supplier text on the product label with the brand name "CafeDerm" in an elegant, minimal serif font. Keep EVERYTHING else exactly the same — same bottle, same background, same styling, same decorative elements. Only change the text on the label to say "CafeDerm" and keep the product type text. The result should look like a CafeDerm branded product photo.'

      parts = [
        { text: customPrompt || defaultPrompt },
        { inline_data: { mime_type: 'image/jpeg', data: base64 } },
      ]
    } else if (imageUrl && generateNew) {
      // MODE 2: Generate new image using existing image as style reference
      const imgRes = await fetch(imageUrl)
      if (!imgRes.ok) return NextResponse.json({ error: 'Failed to download reference image' }, { status: 500 })
      const buffer = Buffer.from(await imgRes.arrayBuffer())
      const base64 = buffer.toString('base64')

      parts = [
        { text: customPrompt || 'Generate a new professional product photography image similar in style to this reference image. CafeDerm brand, luxury skincare aesthetic.' },
        { inline_data: { mime_type: 'image/jpeg', data: base64 } },
      ]
    } else {
      // MODE 3: Generate from scratch (no reference image)
      if (!customPrompt) return NextResponse.json({ error: 'Prompt is required when no image provided' }, { status: 400 })
      parts = [{ text: customPrompt }]
    }

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `AI failed (${res.status}): ${errText.slice(0, 100)}` }, { status: 500 })
    }

    const data = await res.json()
    const responseParts = data.candidates?.[0]?.content?.parts || []
    const imagePart = responseParts.find((p: { inlineData?: { data: string } }) => p.inlineData)

    if (!imagePart?.inlineData?.data) {
      const textPart = responseParts.find((p: { text?: string }) => p.text)
      const reason = textPart?.text || 'No image generated'
      return NextResponse.json({ error: reason.slice(0, 200) }, { status: 500 })
    }

    // Upload to Supabase Storage
    const enhancedBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
    const fileName = `generated-${Date.now()}-${Math.random().toString(36).slice(2)}.png`

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
