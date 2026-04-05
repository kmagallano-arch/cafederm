import { Product } from '@/types'
import { supabase } from '@/lib/supabase'

export const products: Product[] = [
  {
    id: 'prod_caffeine_serum',
    name: 'Caffeine Brightening Serum',
    slug: 'caffeine-brightening-serum',
    description: 'A potent vitamin C and caffeine-infused serum that visibly brightens and energizes dull, tired skin. Lightweight, fast-absorbing formula for daily use.',
    price: 2400,
    images: ['/images/products/caffeine-serum.jpg'],
    category: 'face-care',
    tags: ['new', 'best-seller'],
    rating: 4.8,
    reviewCount: 128,
    inStock: true,
  },
  {
    id: 'prod_foaming_cleanser',
    name: 'Gentle Foaming Cleanser',
    slug: 'gentle-foaming-cleanser',
    description: 'A pH-balanced, sulfate-free foaming cleanser that removes impurities without stripping the skin barrier. Suitable for all skin types.',
    price: 1800,
    images: ['/images/products/foaming-cleanser.jpg'],
    category: 'face-care',
    tags: ['best-seller'],
    rating: 4.9,
    reviewCount: 312,
    inStock: true,
  },
  {
    id: 'prod_niacinamide_toner',
    name: 'Niacinamide Pore Refining Toner',
    slug: 'niacinamide-pore-refining-toner',
    description: 'A niacinamide-powered toner that minimizes pores, controls oil, and smooths skin texture. Alcohol-free formula for sensitive skin.',
    price: 2000,
    images: ['/images/products/niacinamide-toner.jpg'],
    category: 'face-care',
    tags: [],
    rating: 4.7,
    reviewCount: 205,
    inStock: true,
  },
  {
    id: 'prod_retinol_night_cream',
    name: 'Retinol Recovery Night Cream',
    slug: 'retinol-recovery-night-cream',
    description: 'An advanced encapsulated retinol cream that promotes cell turnover overnight. Buffered with squalane and ceramides for comfort.',
    price: 3200,
    images: ['/images/products/retinol-cream.jpg'],
    category: 'face-care',
    tags: ['new'],
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
  },
  {
    id: 'prod_vitamin_c_serum',
    name: 'Vitamin C Complex Serum',
    slug: 'vitamin-c-complex-serum',
    description: 'A stabilized 15% vitamin C serum with ferulic acid and vitamin E for maximum antioxidant protection and brightening.',
    price: 2600,
    images: ['/images/products/vitamin-c-serum.jpg'],
    category: 'face-care',
    tags: ['new'],
    rating: 4.5,
    reviewCount: 67,
    inStock: true,
  },
  {
    id: 'prod_ha_moisturizer',
    name: 'Hyaluronic Acid Moisturizer',
    slug: 'hyaluronic-acid-moisturizer',
    description: 'A multi-weight hyaluronic acid moisturizer that delivers deep hydration across all skin layers. Non-comedogenic, lightweight gel-cream.',
    price: 2800,
    images: ['/images/products/ha-moisturizer.jpg'],
    category: 'face-care',
    tags: ['best-seller'],
    rating: 4.8,
    reviewCount: 276,
    inStock: true,
  },
  {
    id: 'prod_spf_moisturizer',
    name: 'SPF 50 Daily Moisturizer',
    slug: 'spf-50-daily-moisturizer',
    description: 'A broad-spectrum SPF 50 moisturizer with a weightless, invisible finish. No white cast. Reef-safe mineral filters.',
    price: 2800,
    images: ['/images/products/spf-moisturizer.jpg'],
    category: 'face-care',
    tags: ['best-seller'],
    rating: 4.9,
    reviewCount: 241,
    inStock: true,
  },
  {
    id: 'prod_aha_bha_peel',
    name: 'Exfoliating AHA/BHA Peel',
    slug: 'exfoliating-aha-bha-peel',
    description: 'A 10% AHA and 2% BHA exfoliating treatment that resurfaces skin, unclogs pores, and improves tone. Use 2-3 times per week.',
    price: 2200,
    images: ['/images/products/aha-bha-peel.jpg'],
    category: 'face-care',
    tags: [],
    rating: 4.6,
    reviewCount: 154,
    inStock: true,
  },
  {
    id: 'prod_body_wash',
    name: 'Advanced Body Wash',
    slug: 'advanced-body-wash',
    description: 'A nourishing body wash with peptides and ceramides that cleanses while strengthening the skin barrier. Rich, creamy lather.',
    price: 1800,
    images: ['/images/products/body-wash.jpg'],
    category: 'body-care',
    tags: [],
    rating: 4.7,
    reviewCount: 96,
    inStock: true,
  },
  {
    id: 'prod_body_lotion',
    name: 'Hyaluronic Acid Body Lotion',
    slug: 'hyaluronic-acid-body-lotion',
    description: 'A fast-absorbing body lotion with multi-weight hyaluronic acid for all-day hydration. Lightweight, non-greasy finish.',
    price: 2200,
    images: ['/images/products/body-lotion.jpg'],
    category: 'body-care',
    tags: ['best-seller'],
    rating: 4.8,
    reviewCount: 184,
    inStock: true,
  },
  {
    id: 'prod_body_cream',
    name: 'Firming Body Cream',
    slug: 'firming-body-cream',
    description: 'A rich body cream with retinol and shea butter that firms, smooths, and deeply nourishes dry skin.',
    price: 2600,
    images: ['/images/products/body-cream.jpg'],
    category: 'body-care',
    tags: [],
    rating: 4.5,
    reviewCount: 73,
    inStock: true,
  },
  {
    id: 'prod_body_scrub',
    name: 'Smoothing Body Scrub',
    slug: 'smoothing-body-scrub',
    description: 'A gentle exfoliating body scrub with walnut shell powder and glycolic acid. Buffs away rough skin for a silky-smooth finish.',
    price: 2000,
    images: ['/images/products/body-scrub.jpg'],
    category: 'body-care',
    tags: ['new'],
    rating: 4.7,
    reviewCount: 58,
    inStock: true,
  },
  {
    id: 'prod_body_oil',
    name: 'Hydrating Body Oil',
    slug: 'hydrating-body-oil',
    description: 'A lightweight dry body oil with squalane and jojoba that absorbs instantly. Leaves skin glowing without residue.',
    price: 2400,
    images: ['/images/products/body-oil.jpg'],
    category: 'body-care',
    tags: [],
    rating: 4.6,
    reviewCount: 112,
    inStock: true,
  },
  {
    id: 'prod_essentials_set',
    name: 'The Essentials Set',
    slug: 'the-essentials-set',
    description: 'Everything you need to start your skincare routine: Gentle Foaming Cleanser + Niacinamide Toner + Hyaluronic Acid Moisturizer. Save 15%.',
    price: 5800,
    compareAtPrice: 6600,
    images: ['/images/products/essentials-set.jpg'],
    category: 'bundles',
    tags: ['best-seller'],
    rating: 4.9,
    reviewCount: 198,
    inStock: true,
  },
  {
    id: 'prod_glow_kit',
    name: 'The Glow Kit',
    slug: 'the-glow-kit',
    description: 'Your brightening essentials: Caffeine Brightening Serum + Vitamin C Complex Serum + SPF 50 Daily Moisturizer. Save 18%.',
    price: 7200,
    compareAtPrice: 7800,
    images: ['/images/products/glow-kit.jpg'],
    category: 'bundles',
    tags: ['new'],
    rating: 4.8,
    reviewCount: 64,
    inStock: true,
  },
  {
    id: 'prod_full_routine',
    name: 'The Full Routine',
    slug: 'the-full-routine',
    description: 'The complete AM/PM regimen: Cleanser + Toner + Vitamin C Serum + Moisturizer + SPF + Retinol Night Cream. Save 22%.',
    price: 9500,
    compareAtPrice: 12200,
    images: ['/images/products/full-routine.jpg'],
    category: 'bundles',
    tags: [],
    rating: 4.9,
    reviewCount: 41,
    inStock: true,
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'all') return products
  if (category === 'best-sellers') return products.filter(p => p.tags.includes('best-seller'))
  if (category === 'new-arrivals') return products.filter(p => p.tags.includes('new'))
  return products.filter(p => p.category === category)
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

// Database types (snake_case from Supabase)
interface DbProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_at_price: number | null
  images: string[]
  category: 'face-care' | 'body-care' | 'bundles'
  tags: string[]
  rating: number
  review_count: number
  in_stock: boolean
  ingredients: string
  how_to_use: string
  key_benefits: string[]
  related_product_ids: string[]
  variants: { name: string; options: string[] }[]
  recommended_for: string[]
  awards: string
  subscribe_discount: number
  ritual_product_ids: string[]
}

function dbToProduct(db: DbProduct): Product {
  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    description: db.description,
    price: db.price,
    compareAtPrice: db.compare_at_price ?? undefined,
    images: db.images,
    category: db.category,
    tags: db.tags,
    rating: db.rating,
    reviewCount: db.review_count,
    inStock: db.in_stock,
    ingredients: db.ingredients || '',
    howToUse: db.how_to_use || '',
    keyBenefits: db.key_benefits || [],
    relatedProductIds: db.related_product_ids || [],
    variants: db.variants || [],
    recommendedFor: db.recommended_for || [],
    awards: db.awards || '',
    subscribeDiscount: db.subscribe_discount || 20,
    ritualProductIds: db.ritual_product_ids || [],
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error || !data) return products // fallback to static
  return data.map(dbToProduct)
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single()
  if (error || !data) return getProductBySlug(slug) // fallback to static
  return dbToProduct(data)
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  if (category === 'all') return fetchProducts()
  if (category === 'best-sellers') {
    const { data, error } = await supabase.from('products').select('*').contains('tags', ['best-seller'])
    if (error || !data) return getProductsByCategory(category)
    return data.map(dbToProduct)
  }
  if (category === 'new-arrivals') {
    const { data, error } = await supabase.from('products').select('*').contains('tags', ['new'])
    if (error || !data) return getProductsByCategory(category)
    return data.map(dbToProduct)
  }
  const { data, error } = await supabase.from('products').select('*').eq('category', category)
  if (error || !data) return getProductsByCategory(category)
  return data.map(dbToProduct)
}
