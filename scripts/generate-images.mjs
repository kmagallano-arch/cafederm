import fs from 'fs'
import path from 'path'

const API_KEY = process.env.GEMINI_API_KEY || fs.readFileSync('.env.local', 'utf8').match(/GEMINI_API_KEY=(.*)/)?.[1]?.trim()
if (!API_KEY) { console.error('No GEMINI_API_KEY found'); process.exit(1) }

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`

async function generateImage(prompt, outputPath) {
  console.log(`  Generating: ${path.basename(outputPath)}...`)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '1:1', sampleImageSize: 1024 }
      })
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`  ✗ Failed: ${res.status} — ${err.slice(0, 200)}`)
      return false
    }

    const data = await res.json()
    if (!data.predictions?.[0]?.bytesBase64Encoded) {
      console.error(`  ✗ No image in response`)
      return false
    }

    const buffer = Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64')
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, buffer)
    console.log(`  ✓ Saved: ${outputPath}`)
    return true
  } catch (e) {
    console.error(`  ✗ Error: ${e.message}`)
    return false
  }
}

async function generateHeroImage(prompt, outputPath, aspectRatio) {
  console.log(`  Generating: ${path.basename(outputPath)}...`)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: aspectRatio || '16:9', sampleImageSize: 1024 }
      })
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`  ✗ Failed: ${res.status} — ${err.slice(0, 200)}`)
      return false
    }

    const data = await res.json()
    if (!data.predictions?.[0]?.bytesBase64Encoded) {
      console.error(`  ✗ No image in response`)
      return false
    }

    const buffer = Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64')
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, buffer)
    console.log(`  ✓ Saved: ${outputPath}`)
    return true
  } catch (e) {
    console.error(`  ✗ Error: ${e.message}`)
    return false
  }
}

const publicDir = 'public/images'

const images = [
  // Hero
  { prompt: 'Luxury skincare products arranged on a warm beige marble surface, soft natural lighting, cream and brown tones, minimalist aesthetic, premium brand photography, no text, no logos', path: `${publicDir}/hero/hero-banner.jpg`, aspect: '16:9' },

  // Products — Face Care
  { prompt: 'Single luxury skincare serum bottle, amber glass with dropper, clean white background, soft shadow, premium product photography, minimalist, no text no labels', path: `${publicDir}/products/caffeine-serum.jpg` },
  { prompt: 'Single luxury foaming cleanser pump bottle, matte white packaging, clean white background, soft shadow, premium skincare product photography, minimalist, no text no labels', path: `${publicDir}/products/foaming-cleanser.jpg` },
  { prompt: 'Single luxury toner bottle, frosted glass, clean white background, soft shadow, premium skincare product photography, minimalist, no text no labels', path: `${publicDir}/products/niacinamide-toner.jpg` },
  { prompt: 'Single luxury night cream jar, dark elegant packaging, clean white background, soft shadow, premium skincare product photography, minimalist, no text no labels', path: `${publicDir}/products/retinol-cream.jpg` },
  { prompt: 'Single luxury vitamin C serum bottle, orange-tinted glass with dropper, clean white background, soft shadow, premium product photography, minimalist, no text no labels', path: `${publicDir}/products/vitamin-c-serum.jpg` },
  { prompt: 'Single luxury moisturizer jar, clean white packaging with gold accent, clean white background, soft shadow, premium skincare product photography, minimalist, no text no labels', path: `${publicDir}/products/ha-moisturizer.jpg` },
  { prompt: 'Single luxury SPF sunscreen tube, sleek modern white packaging, clean white background, soft shadow, premium skincare product photography, minimalist, no text no labels', path: `${publicDir}/products/spf-moisturizer.jpg` },
  { prompt: 'Single luxury exfoliating peel bottle, clinical elegant packaging, clean white background, soft shadow, premium skincare product photography, minimalist, no text no labels', path: `${publicDir}/products/aha-bha-peel.jpg` },

  // Products — Body Care
  { prompt: 'Single luxury body wash bottle, tall sleek packaging, clean white background, soft shadow, premium bodycare product photography, minimalist, no text no labels', path: `${publicDir}/products/body-wash.jpg` },
  { prompt: 'Single luxury body lotion pump bottle, elegant white packaging, clean white background, soft shadow, premium bodycare product photography, minimalist, no text no labels', path: `${publicDir}/products/body-lotion.jpg` },
  { prompt: 'Single luxury body cream jar, rich cream colored packaging, clean white background, soft shadow, premium bodycare product photography, minimalist, no text no labels', path: `${publicDir}/products/body-cream.jpg` },
  { prompt: 'Single luxury body scrub jar, textured cream visible through glass, clean white background, soft shadow, premium bodycare product photography, minimalist, no text no labels', path: `${publicDir}/products/body-scrub.jpg` },
  { prompt: 'Single luxury body oil bottle, elegant glass with gold cap, clean white background, soft shadow, premium bodycare product photography, minimalist, no text no labels', path: `${publicDir}/products/body-oil.jpg` },

  // Products — Bundles
  { prompt: 'Three luxury skincare products arranged together (cleanser, toner, moisturizer), matching minimal packaging, clean white background, premium set photography, no text no labels', path: `${publicDir}/products/essentials-set.jpg` },
  { prompt: 'Three luxury skincare products arranged together (two serums and a moisturizer), bright glowing aesthetic, clean white background, premium set photography, no text no labels', path: `${publicDir}/products/glow-kit.jpg` },
  { prompt: 'Six luxury skincare products arranged in a row, complete routine set, matching elegant packaging, clean white background, premium set photography, no text no labels', path: `${publicDir}/products/full-routine.jpg` },

  // Collections
  { prompt: 'Elegant flat lay of facial skincare products on beige surface, serums and creams, warm tones, premium brand aesthetic, no text no logos', path: `${publicDir}/collections/new-arrivals.jpg` },
  { prompt: 'Close up of a woman applying serum to her face, soft natural lighting, dewy skin, warm beige tones, premium skincare brand aesthetic, no text', path: `${publicDir}/collections/face-care.jpg` },
  { prompt: 'Luxury body care products arranged on marble surface with tropical leaves, body lotion and scrub, warm cream tones, premium brand aesthetic, no text no logos', path: `${publicDir}/collections/body-care.jpg` },
  { prompt: 'Top-down flat lay of bestselling skincare products arranged in a circle on beige linen, warm lighting, premium aesthetic, no text no logos', path: `${publicDir}/collections/best-sellers.jpg` },
  { prompt: 'Three skincare gift sets wrapped with ribbon on beige background, luxury packaging, warm tones, premium brand photography, no text no logos', path: `${publicDir}/collections/bundles.jpg` },
  { prompt: 'Full collection of luxury skincare products arranged on shelves, clean minimal display, warm beige tones, premium brand aesthetic, no text no logos', path: `${publicDir}/collections/shop-all.jpg` },
]

console.log(`\nGenerating ${images.length} images with Imagen 3.0...\n`)

let success = 0
let failed = 0

for (const img of images) {
  const ok = img.aspect
    ? await generateHeroImage(img.prompt, img.path, img.aspect)
    : await generateImage(img.prompt, img.path)
  if (ok) success++
  else failed++
  // Rate limit pause
  await new Promise(r => setTimeout(r, 2000))
}

console.log(`\nDone! ${success} generated, ${failed} failed.`)
