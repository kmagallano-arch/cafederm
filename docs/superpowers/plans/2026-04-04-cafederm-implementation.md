# CafeDerm E-Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete CafeDerm e-commerce site with Next.js 14 and Stripe Checkout, modeled after Naturium's layout with the "Latte Luxe" color palette.

**Architecture:** Next.js 14 App Router with static product data, React context for cart state, Stripe Checkout Sessions for payments, and CSS custom properties for theming. No database — products are TypeScript constants. Cart persists via localStorage.

**Tech Stack:** Next.js 14, React 18, TypeScript, Stripe (checkout sessions), CSS Modules + CSS Variables, Vercel

---

## File Structure

```
cafederm/
  src/
    app/
      layout.tsx                        — root layout, fonts, metadata, CartProvider
      page.tsx                          — homepage composition
      globals.css                       — CSS variables, resets, base styles
      collections/[slug]/page.tsx       — collection listing page
      collections/[slug]/collections.module.css
      products/[slug]/page.tsx          — product detail page
      products/[slug]/product.module.css
      about/page.tsx                    — brand story
      order-confirmation/page.tsx       — post-checkout success
      api/checkout/route.ts             — Stripe session creation
    components/
      layout/
        AnnouncementBar.tsx + .module.css
        Header.tsx + .module.css
        Footer.tsx + .module.css
        CartDrawer.tsx + .module.css
      home/
        Hero.tsx + .module.css
        Marquee.tsx + .module.css
        CollectionCards.tsx + .module.css
        ProductGrid.tsx + .module.css
        FeaturedBanner.tsx + .module.css
        ShopBySection.tsx + .module.css
        AboutSection.tsx + .module.css
        MediaGrid.tsx + .module.css
      shared/
        ProductCard.tsx + .module.css
        Button.tsx + .module.css
    context/
      CartContext.tsx
    data/
      products.ts
      collections.ts
    lib/
      stripe.ts
    types/
      index.ts
  public/
    images/                             — placeholder images
  .env.local                            — Stripe keys (not committed)
  next.config.js
  tsconfig.json
  package.json
```

---

### Task 1: Project Scaffold + Global Styles

**Files:**
- Create: `package.json`, `next.config.js`, `tsconfig.json`, `.gitignore`, `.env.local`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/karenmagallano/cafederm
npx create-next-app@14 . --typescript --app --src-dir --no-tailwind --no-eslint --import-alias "@/*" --use-npm
```

Select defaults when prompted. This creates the full Next.js scaffold.

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/karenmagallano/cafederm
npm install stripe @stripe/stripe-js
```

- [ ] **Step 3: Create `.env.local`**

Create `/Users/karenmagallano/cafederm/.env.local`:

```
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 4: Write `src/app/globals.css`**

Replace the generated `globals.css` with the CafeDerm design tokens and base styles:

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

:root {
  --cream: #F7F1EB;
  --cream-dark: #E8D5C0;
  --brown-light: #B8926A;
  --brown: #6B4226;
  --brown-dark: #2C1810;
  --white: #FFFFFF;
  --black: #1A1A1A;
  --gray: #888888;

  --font-heading: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;

  --container-max: 1300px;
  --container-padding: 48px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  color: var(--black);
  background: var(--white);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

ul {
  list-style: none;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 699px) {
  :root {
    --container-padding: 20px;
  }
}

@media (min-width: 700px) and (max-width: 999px) {
  :root {
    --container-padding: 32px;
  }
}
```

- [ ] **Step 5: Write `src/app/layout.tsx`**

Replace the generated layout:

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CafeDerm — Premium Skincare, Real Results',
  description: 'CafeDerm offers premium, clinically-tested skincare and body care. Discover luxurious formulas with real results.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 6: Write a minimal `src/app/page.tsx`**

```tsx
export default function Home() {
  return (
    <main>
      <h1>CafeDerm</h1>
      <p>Coming soon...</p>
    </main>
  )
}
```

- [ ] **Step 7: Verify it runs**

```bash
cd /Users/karenmagallano/cafederm && npm run dev
```

Open http://localhost:3000 — should show "CafeDerm / Coming soon..."

- [ ] **Step 8: Commit**

```bash
cd /Users/karenmagallano/cafederm
git add -A
git commit -m "feat: scaffold Next.js 14 project with CafeDerm design tokens"
```

---

### Task 2: Types + Product Data + Collections Data

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/products.ts`
- Create: `src/data/collections.ts`

- [ ] **Step 1: Write `src/types/index.ts`**

```ts
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number          // in cents
  compareAtPrice?: number // in cents, for sale display
  images: string[]
  category: 'face-care' | 'body-care' | 'bundles'
  tags: string[]         // e.g. 'new', 'best-seller'
  rating: number
  reviewCount: number
  inStock: boolean
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string
  image: string
}

export interface CartItem {
  product: Product
  quantity: number
}
```

- [ ] **Step 2: Write `src/data/products.ts`**

```ts
import { Product } from '@/types'

export const products: Product[] = [
  // FACE CARE
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
  // BODY CARE
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
  // BUNDLES
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
```

- [ ] **Step 3: Write `src/data/collections.ts`**

```ts
import { Collection } from '@/types'

export const collections: Collection[] = [
  {
    id: 'col_new_arrivals',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Discover our latest skincare innovations.',
    image: '/images/collections/new-arrivals.jpg',
  },
  {
    id: 'col_face_care',
    name: 'Face Care',
    slug: 'face-care',
    description: 'Clinically-tested serums, moisturizers, and treatments for your face.',
    image: '/images/collections/face-care.jpg',
  },
  {
    id: 'col_body_care',
    name: 'Body Care',
    slug: 'body-care',
    description: 'Luxurious body washes, lotions, and treatments for radiant skin.',
    image: '/images/collections/body-care.jpg',
  },
  {
    id: 'col_best_sellers',
    name: 'Best Sellers',
    slug: 'best-sellers',
    description: 'Our most-loved products, backed by thousands of reviews.',
    image: '/images/collections/best-sellers.jpg',
  },
  {
    id: 'col_bundles',
    name: 'Bundles',
    slug: 'bundles',
    description: 'Curated sets at a special price. Mix, match, and save.',
    image: '/images/collections/bundles.jpg',
  },
  {
    id: 'col_all',
    name: 'Shop All',
    slug: 'all',
    description: 'Browse our complete collection of premium skincare.',
    image: '/images/collections/shop-all.jpg',
  },
]

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find(c => c.slug === slug)
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/karenmagallano/cafederm
git add src/types src/data
git commit -m "feat: add product types, 16 placeholder products, and collection definitions"
```

---

### Task 3: Shared Components — Button + ProductCard

**Files:**
- Create: `src/components/shared/Button.tsx`, `src/components/shared/Button.module.css`
- Create: `src/components/shared/ProductCard.tsx`, `src/components/shared/ProductCard.module.css`

- [ ] **Step 1: Write `src/components/shared/Button.module.css`**

```css
.btn {
  display: inline-block;
  padding: 14px 40px;
  font-size: 11px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  text-align: center;
}

.dark {
  background: var(--brown-dark);
  color: var(--cream);
  border-color: var(--brown-dark);
}

.dark:hover {
  background: var(--brown);
  border-color: var(--brown);
}

.outline {
  background: transparent;
  color: var(--brown-dark);
  border-color: var(--brown-dark);
}

.outline:hover {
  background: var(--brown-dark);
  color: var(--cream);
}

.outlineLight {
  background: transparent;
  color: var(--cream);
  border-color: var(--cream);
}

.outlineLight:hover {
  background: var(--cream);
  color: var(--brown-dark);
}
```

- [ ] **Step 2: Write `src/components/shared/Button.tsx`**

```tsx
import Link from 'next/link'
import styles from './Button.module.css'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  variant?: 'dark' | 'outline' | 'outlineLight'
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
}

export default function Button({
  children,
  href,
  variant = 'dark',
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const cls = `${styles.btn} ${styles[variant]} ${className}`

  if (href) {
    return <Link href={href} className={cls}>{children}</Link>
  }

  return (
    <button type={type} className={cls} onClick={onClick}>
      {children}
    </button>
  )
}
```

- [ ] **Step 3: Write `src/components/shared/ProductCard.module.css`**

```css
.card {
  cursor: pointer;
  position: relative;
}

.figure {
  aspect-ratio: 1;
  background: var(--cream);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.image {
  object-fit: cover;
}

.placeholder {
  font-family: var(--font-heading);
  font-size: 16px;
  color: var(--brown-light);
}

.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--brown-dark);
  color: var(--cream);
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 10px;
  font-weight: 600;
  z-index: 2;
}

.quickAdd {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: var(--white);
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
}

.card:hover .quickAdd {
  opacity: 1;
}

.title {
  font-size: 13px;
  font-weight: 400;
  margin-bottom: 6px;
  line-height: 1.4;
}

.priceRow {
  display: flex;
  gap: 8px;
  align-items: center;
}

.price {
  font-size: 13px;
  color: var(--gray);
}

.comparePrice {
  font-size: 12px;
  color: var(--gray);
  text-decoration: line-through;
  opacity: 0.6;
}

.stars {
  font-size: 11px;
  color: var(--brown-light);
  margin-top: 4px;
}
```

- [ ] **Step 4: Write `src/components/shared/ProductCard.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { Product } from '@/types'
import { formatPrice } from '@/data/products'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
  onQuickAdd?: (product: Product) => void
}

export default function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const badge = product.tags.includes('new')
    ? 'NEW'
    : product.tags.includes('best-seller')
    ? 'BEST SELLER'
    : null

  const fullStars = Math.floor(product.rating)
  const hasHalf = product.rating % 1 >= 0.5
  const starsDisplay = '★'.repeat(fullStars) + (hasHalf ? '★' : '') + '☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0))

  return (
    <div className={styles.card}>
      <div className={styles.figure}>
        {badge && <span className={styles.badge}>{badge}</span>}
        <span className={styles.placeholder}>Product Image</span>
        <button
          className={styles.quickAdd}
          onClick={(e) => {
            e.preventDefault()
            onQuickAdd?.(product)
          }}
          aria-label={`Add ${product.name} to cart`}
        >
          +
        </button>
      </div>
      <Link href={`/products/${product.slug}`}>
        <div className={styles.title}>{product.name}</div>
      </Link>
      <div className={styles.priceRow}>
        <span className={styles.price}>{formatPrice(product.price)}</span>
        {product.compareAtPrice && (
          <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</span>
        )}
      </div>
      <div className={styles.stars}>{starsDisplay} ({product.reviewCount})</div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/karenmagallano/cafederm
git add src/components/shared
git commit -m "feat: add Button and ProductCard shared components"
```

---

### Task 4: Layout Components — AnnouncementBar + Header + Footer

**Files:**
- Create: `src/components/layout/AnnouncementBar.tsx`, `src/components/layout/AnnouncementBar.module.css`
- Create: `src/components/layout/Header.tsx`, `src/components/layout/Header.module.css`
- Create: `src/components/layout/Footer.tsx`, `src/components/layout/Footer.module.css`

- [ ] **Step 1: Write AnnouncementBar**

`src/components/layout/AnnouncementBar.module.css`:

```css
.bar {
  background: var(--brown-dark);
  color: var(--cream);
  text-align: center;
  padding: 10px 16px;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 500;
}
```

`src/components/layout/AnnouncementBar.tsx`:

```tsx
import styles from './AnnouncementBar.module.css'

export default function AnnouncementBar() {
  return (
    <aside className={styles.bar}>
      Free Shipping on Orders Over $50 &bull; Premium Skincare, Real Results
    </aside>
  )
}
```

- [ ] **Step 2: Write Header**

`src/components/layout/Header.module.css`:

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px var(--container-padding);
  background: var(--white);
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  display: flex;
  gap: 32px;
}

.navLink {
  font-size: 12px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 500;
  transition: color 0.2s;
}

.navLink:hover {
  color: var(--brown);
}

.logo {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 500;
  letter-spacing: 3px;
  color: var(--brown-dark);
}

.icons {
  display: flex;
  gap: 20px;
  align-items: center;
}

.iconBtn {
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  color: var(--black);
  font-family: var(--font-body);
  display: flex;
  align-items: center;
  gap: 4px;
}

.cartCount {
  font-size: 11px;
  background: var(--brown-dark);
  color: var(--cream);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* Mobile */
.mobileMenuBtn {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

@media (max-width: 699px) {
  .nav {
    display: none;
  }
  .mobileMenuBtn {
    display: block;
  }
  .logo {
    font-size: 22px;
  }
}
```

`src/components/layout/Header.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import styles from './Header.module.css'

export default function Header() {
  const { totalItems, setCartOpen } = useCart()

  return (
    <header className={styles.header}>
      <button className={styles.mobileMenuBtn} aria-label="Menu">☰</button>
      <nav className={styles.nav}>
        <Link href="/collections/new-arrivals" className={styles.navLink}>New Arrivals</Link>
        <Link href="/collections/face-care" className={styles.navLink}>Face Care</Link>
        <Link href="/collections/body-care" className={styles.navLink}>Body Care</Link>
        <Link href="/collections/bundles" className={styles.navLink}>Bundles</Link>
        <Link href="/about" className={styles.navLink}>About</Link>
      </nav>
      <Link href="/" className={styles.logo}>CafeDerm</Link>
      <div className={styles.icons}>
        <button className={styles.iconBtn} aria-label="Search">🔍</button>
        <button className={styles.iconBtn} onClick={() => setCartOpen(true)} aria-label="Cart">
          🛒 {totalItems > 0 && <span className={styles.cartCount}>{totalItems}</span>}
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Write Footer**

`src/components/layout/Footer.module.css`:

```css
.footer {
  background: var(--cream);
  padding: 60px var(--container-padding) 30px;
  border-top: 1px solid var(--cream-dark);
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 40px;
}

.newsletterTitle {
  font-family: var(--font-heading);
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--brown-dark);
}

.newsletterText {
  font-size: 13px;
  color: var(--brown);
  margin-bottom: 16px;
  line-height: 1.5;
}

.emailRow {
  display: flex;
}

.emailInput {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--cream-dark);
  background: var(--white);
  font-size: 13px;
  font-family: var(--font-body);
  outline: none;
}

.emailBtn {
  padding: 12px 24px;
  background: var(--brown-dark);
  color: var(--cream);
  border: none;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: var(--font-body);
  font-weight: 500;
  cursor: pointer;
}

.linksTitle {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--brown-dark);
}

.linkItem {
  margin-bottom: 10px;
}

.link {
  font-size: 13px;
  color: var(--brown);
  transition: color 0.2s;
}

.link:hover {
  color: var(--brown-dark);
}

.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid var(--cream-dark);
  font-size: 12px;
  color: var(--gray);
}

.social {
  display: flex;
  gap: 16px;
}

.socialLink {
  color: var(--brown);
  font-size: 13px;
  transition: color 0.2s;
}

.socialLink:hover {
  color: var(--brown-dark);
}

@media (max-width: 699px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
```

`src/components/layout/Footer.tsx`:

```tsx
import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <h3 className={styles.newsletterTitle}>Stay in the know</h3>
          <p className={styles.newsletterText}>
            Sign up for exclusive offers, skincare tips, and new product launches.
          </p>
          <div className={styles.emailRow}>
            <input type="email" placeholder="Enter your email" className={styles.emailInput} />
            <button className={styles.emailBtn}>Subscribe</button>
          </div>
        </div>
        <div>
          <h4 className={styles.linksTitle}>Discover</h4>
          <ul>
            <li className={styles.linkItem}><Link href="/about" className={styles.link}>About Us</Link></li>
            <li className={styles.linkItem}><Link href="/collections/best-sellers" className={styles.link}>Best Sellers</Link></li>
            <li className={styles.linkItem}><Link href="/collections/new-arrivals" className={styles.link}>New Arrivals</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={styles.linksTitle}>Help</h4>
          <ul>
            <li className={styles.linkItem}><Link href="/contact" className={styles.link}>Contact</Link></li>
            <li className={styles.linkItem}><Link href="/shipping" className={styles.link}>Shipping & Returns</Link></li>
            <li className={styles.linkItem}><Link href="/privacy" className={styles.link}>Privacy Policy</Link></li>
            <li className={styles.linkItem}><Link href="/terms" className={styles.link}>Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={styles.linksTitle}>Shop</h4>
          <ul>
            <li className={styles.linkItem}><Link href="/collections/face-care" className={styles.link}>Face Care</Link></li>
            <li className={styles.linkItem}><Link href="/collections/body-care" className={styles.link}>Body Care</Link></li>
            <li className={styles.linkItem}><Link href="/collections/bundles" className={styles.link}>Bundles</Link></li>
            <li className={styles.linkItem}><Link href="/collections/all" className={styles.link}>Shop All</Link></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>&copy; 2026 CafeDerm. All rights reserved.</span>
        <div className={styles.social}>
          <a href="#" className={styles.socialLink}>Instagram</a>
          <a href="#" className={styles.socialLink}>TikTok</a>
          <a href="#" className={styles.socialLink}>Facebook</a>
          <a href="#" className={styles.socialLink}>YouTube</a>
          <a href="#" className={styles.socialLink}>Pinterest</a>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/karenmagallano/cafederm
git add src/components/layout
git commit -m "feat: add AnnouncementBar, Header, and Footer layout components"
```

---

### Task 5: Cart Context + Cart Drawer

**Files:**
- Create: `src/context/CartContext.tsx`
- Create: `src/components/layout/CartDrawer.tsx`, `src/components/layout/CartDrawer.module.css`
- Modify: `src/app/layout.tsx` — wrap with CartProvider + add layout components

- [ ] **Step 1: Write `src/context/CartContext.tsx`**

```tsx
'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Product, CartItem } from '@/types'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cafederm-cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {}
    }
    setLoaded(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('cafederm-cart', JSON.stringify(items))
    }
  }, [items, loaded])

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setCartOpen(true)
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.product.id !== productId))
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, subtotal, cartOpen, setCartOpen,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
```

- [ ] **Step 2: Write CartDrawer styles**

`src/components/layout/CartDrawer.module.css`:

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  max-width: 100vw;
  height: 100vh;
  background: var(--white);
  z-index: 201;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.drawer.open {
  transform: translateX(0);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.headerTitle {
  font-family: var(--font-heading);
  font-size: 22px;
  color: var(--brown-dark);
}

.closeBtn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--black);
  padding: 4px;
}

.body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: var(--gray);
  font-size: 14px;
}

.item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.itemImage {
  width: 80px;
  height: 80px;
  background: var(--cream);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--brown-light);
}

.itemInfo {
  flex: 1;
}

.itemName {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.itemPrice {
  font-size: 13px;
  color: var(--gray);
  margin-bottom: 8px;
}

.itemControls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qtyBtn {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  background: var(--white);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty {
  font-size: 13px;
  min-width: 20px;
  text-align: center;
}

.removeBtn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 12px;
  color: var(--gray);
  cursor: pointer;
  text-decoration: underline;
}

.footer {
  padding: 20px 24px;
  border-top: 1px solid #eee;
}

.subtotalRow {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
}

.checkoutBtn {
  width: 100%;
  padding: 16px;
  background: var(--brown-dark);
  color: var(--cream);
  border: none;
  font-size: 12px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: background 0.3s;
}

.checkoutBtn:hover {
  background: var(--brown);
}

.checkoutBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Write `src/components/layout/CartDrawer.tsx`**

```tsx
'use client'

import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/data/products'
import styles from './CartDrawer.module.css'

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, updateQuantity, removeItem, subtotal } = useCart()

  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
      }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${cartOpen ? styles.open : ''}`}
        onClick={() => setCartOpen(false)}
      />
      <div className={`${styles.drawer} ${cartOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>Your Cart</span>
          <button className={styles.closeBtn} onClick={() => setCartOpen(false)}>×</button>
        </div>
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>Your cart is empty</div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className={styles.item}>
                <div className={styles.itemImage}>IMG</div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.product.name}</div>
                  <div className={styles.itemPrice}>{formatPrice(item.product.price)}</div>
                  <div className={styles.itemControls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >−</button>
                    <span className={styles.qty}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >+</button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.product.id)}
                    >Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 4: Update `src/app/layout.tsx` to include CartProvider + layout components**

```tsx
import type { Metadata } from 'next'
import { CartProvider } from '@/context/CartContext'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/layout/CartDrawer'
import './globals.css'

export const metadata: Metadata = {
  title: 'CafeDerm — Premium Skincare, Real Results',
  description: 'CafeDerm offers premium, clinically-tested skincare and body care. Discover luxurious formulas with real results.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Verify it runs**

```bash
cd /Users/karenmagallano/cafederm && npm run dev
```

Open http://localhost:3000 — should show announcement bar, header with nav, placeholder content, and footer.

- [ ] **Step 6: Commit**

```bash
cd /Users/karenmagallano/cafederm
git add src/context src/components/layout src/app/layout.tsx
git commit -m "feat: add CartContext, CartDrawer, and wire layout components"
```

---

### Task 6: Homepage Sections (Hero through MediaGrid)

**Files:**
- Create: `src/components/home/Hero.tsx` + `.module.css`
- Create: `src/components/home/Marquee.tsx` + `.module.css`
- Create: `src/components/home/CollectionCards.tsx` + `.module.css`
- Create: `src/components/home/ProductGrid.tsx` + `.module.css`
- Create: `src/components/home/FeaturedBanner.tsx` + `.module.css`
- Create: `src/components/home/ShopBySection.tsx` + `.module.css`
- Create: `src/components/home/AboutSection.tsx` + `.module.css`
- Create: `src/components/home/MediaGrid.tsx` + `.module.css`
- Modify: `src/app/page.tsx` — compose all sections

This is the largest task. Each component is self-contained. Build them one at a time, then compose in `page.tsx`.

- [ ] **Step 1: Write Hero component**

`src/components/home/Hero.module.css`:

```css
.hero {
  position: relative;
  height: 85vh;
  min-height: 500px;
  background: linear-gradient(135deg, var(--cream) 0%, var(--cream-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.content {
  text-align: center;
  z-index: 2;
  padding: 0 24px;
}

.label {
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--brown);
  margin-bottom: 16px;
  font-weight: 500;
}

.title {
  font-family: var(--font-heading);
  font-size: clamp(36px, 6vw, 72px);
  font-weight: 400;
  line-height: 1.1;
  color: var(--brown-dark);
  margin-bottom: 16px;
}

.subtitle {
  font-size: 14px;
  color: var(--brown);
  margin-bottom: 32px;
  letter-spacing: 0.5px;
}

.circles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0.08;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--brown);
}

.circle1 { width: 600px; height: 600px; top: -100px; right: -200px; }
.circle2 { width: 400px; height: 400px; bottom: -100px; left: -100px; }
.circle3 { width: 300px; height: 300px; top: 50%; left: 50%; transform: translate(-50%, -50%); }
```

`src/components/home/Hero.tsx`:

```tsx
import Button from '@/components/shared/Button'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.circles}>
        <div className={`${styles.circle} ${styles.circle1}`} />
        <div className={`${styles.circle} ${styles.circle2}`} />
        <div className={`${styles.circle} ${styles.circle3}`} />
      </div>
      <div className={styles.content}>
        <p className={styles.label}>New Collection</p>
        <h1 className={styles.title}>
          Premium Skincare,<br /><em>Real Results</em>
        </h1>
        <p className={styles.subtitle}>Clinically-tested formulas for radiant, healthy skin</p>
        <Button href="/collections/all">Shop Now</Button>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Write Marquee component**

`src/components/home/Marquee.module.css`:

```css
.marquee {
  background: var(--brown-dark);
  color: var(--cream);
  padding: 14px 0;
  overflow: hidden;
  white-space: nowrap;
}

.inner {
  display: inline-block;
  animation: scroll 25s linear infinite;
  font-family: var(--font-heading);
  font-size: 18px;
  letter-spacing: 2px;
}

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

`src/components/home/Marquee.tsx`:

```tsx
import styles from './Marquee.module.css'

const items = [
  'Premium Skincare, Real Results',
  'Dermatologist Tested',
  'Cruelty Free',
  'Clean Ingredients',
]

export default function Marquee() {
  const text = items.join(' \u00A0\u2022\u00A0 ')
  return (
    <div className={styles.marquee}>
      <div className={styles.inner}>
        {text} &nbsp;&bull;&nbsp; {text} &nbsp;&bull;&nbsp;
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write CollectionCards component**

`src/components/home/CollectionCards.module.css`:

```css
.section {
  padding: 60px var(--container-padding);
  background: var(--cream);
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.card {
  text-align: center;
  display: block;
}

.image {
  aspect-ratio: 1;
  background: var(--cream-dark);
  margin-bottom: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 18px;
  color: var(--brown);
  transition: transform 0.3s;
}

.card:hover .image {
  transform: scale(1.02);
}

.label {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 500;
  color: var(--black);
}

@media (max-width: 699px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 700px) and (max-width: 999px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

`src/components/home/CollectionCards.tsx`:

```tsx
import Link from 'next/link'
import { collections } from '@/data/collections'
import styles from './CollectionCards.module.css'

export default function CollectionCards() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {collections.map(col => (
          <Link key={col.id} href={`/collections/${col.slug}`} className={styles.card}>
            <div className={styles.image}>{col.name}</div>
            <span className={styles.label}>{col.name.toUpperCase()}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Write ProductGrid component**

`src/components/home/ProductGrid.module.css`:

```css
.section {
  padding: 60px var(--container-padding);
}

.sectionAlt {
  composes: section;
  background: var(--cream);
}

.title {
  font-family: var(--font-heading);
  font-size: clamp(28px, 3vw, 42px);
  font-weight: 400;
  text-align: center;
  margin-bottom: 40px;
  color: var(--brown-dark);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: var(--container-max);
  margin: 0 auto;
}

@media (max-width: 699px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (min-width: 700px) and (max-width: 999px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

`src/components/home/ProductGrid.tsx`:

```tsx
'use client'

import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import ProductCard from '@/components/shared/ProductCard'
import styles from './ProductGrid.module.css'

interface ProductGridProps {
  title: string
  products: Product[]
  alt?: boolean
}

export default function ProductGrid({ title, products, alt }: ProductGridProps) {
  const { addItem } = useCart()

  return (
    <section className={alt ? styles.sectionAlt : styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>
        {products.slice(0, 4).map(product => (
          <ProductCard key={product.id} product={product} onQuickAdd={addItem} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Write FeaturedBanner component**

`src/components/home/FeaturedBanner.module.css`:

```css
.banner {
  position: relative;
  min-height: 550px;
  background: linear-gradient(160deg, #E8D5C0 0%, #D4C4B0 30%, #C9B89E 60%, #F7F1EB 100%);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.inner {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 60px var(--container-padding);
  gap: 60px;
}

.content {
  flex: 1;
  max-width: 480px;
  padding: 48px 56px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
}

.label {
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--brown);
  margin-bottom: 12px;
  font-weight: 500;
}

.title {
  font-family: var(--font-heading);
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 400;
  line-height: 1.15;
  color: var(--brown-dark);
  margin-bottom: 12px;
}

.subtitle {
  font-size: 13px;
  color: var(--brown);
  margin-bottom: 24px;
  line-height: 1.6;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.features {
  display: flex;
  gap: 24px;
  margin-bottom: 28px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--brown);
  letter-spacing: 0.5px;
}

.featureIcon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.product {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.productImg {
  width: 320px;
  height: 420px;
  background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%);
  border: 1px solid rgba(255,255,255,0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.productPlaceholder {
  font-family: var(--font-heading);
  font-size: 18px;
  color: var(--brown);
  opacity: 0.6;
}

.productSub {
  font-size: 11px;
  color: var(--brown-light);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 8px;
}

.productDetails {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--white);
  padding: 14px 28px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  white-space: nowrap;
}

.productName {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.productPrice {
  font-size: 13px;
  color: var(--brown);
}

.deco {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(184, 146, 106, 0.2);
  pointer-events: none;
}

.deco1 { width: 500px; height: 500px; top: -150px; right: -100px; }
.deco2 { width: 300px; height: 300px; bottom: -80px; right: 200px; }
.deco3 { width: 180px; height: 180px; top: 60px; right: 30%; }

@media (max-width: 999px) {
  .inner {
    flex-direction: column;
    text-align: center;
  }
  .content {
    max-width: 100%;
  }
  .features {
    justify-content: center;
  }
  .productImg {
    width: 240px;
    height: 320px;
  }
}
```

`src/components/home/FeaturedBanner.tsx`:

```tsx
import Button from '@/components/shared/Button'
import styles from './FeaturedBanner.module.css'

export default function FeaturedBanner() {
  return (
    <section className={styles.banner}>
      <div className={`${styles.deco} ${styles.deco1}`} />
      <div className={`${styles.deco} ${styles.deco2}`} />
      <div className={`${styles.deco} ${styles.deco3}`} />
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.label}>New Arrival</p>
          <h2 className={styles.title}>Retinol Recovery<br />Night Cream</h2>
          <p className={styles.subtitle}>Wake up to visibly smoother,<br />more radiant skin</p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✓</div>
              <span>Clinically<br />Tested</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>☽</div>
              <span>Overnight<br />Repair</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✿</div>
              <span>Clean<br />Formula</span>
            </div>
          </div>
          <Button href="/products/retinol-recovery-night-cream">Shop Now</Button>
        </div>
        <div className={styles.product}>
          <div className={styles.productImg}>
            <span className={styles.productPlaceholder}>Product Image</span>
            <span className={styles.productSub}>Your photo here</span>
            <div className={styles.productDetails}>
              <div className={styles.productName}>Retinol Recovery Night Cream</div>
              <div className={styles.productPrice}>$32</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Write ShopBySection component**

`src/components/home/ShopBySection.module.css`:

```css
.section {
  padding: 60px var(--container-padding);
  background: var(--cream);
}

.header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  justify-content: center;
  margin-bottom: 40px;
}

.shopBy {
  font-family: var(--font-heading);
  font-size: 28px;
  color: var(--brown-dark);
}

.dropdown {
  font-family: var(--font-heading);
  font-size: 28px;
  color: var(--brown);
  border-bottom: 2px solid var(--brown);
  padding-bottom: 2px;
  cursor: pointer;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: var(--container-max);
  margin: 0 auto;
}

@media (max-width: 699px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
```

`src/components/home/ShopBySection.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { getProductsByCategory } from '@/data/products'
import ProductCard from '@/components/shared/ProductCard'
import styles from './ShopBySection.module.css'

const categories = [
  { label: 'Trending', slug: 'best-sellers' },
  { label: 'New Arrivals', slug: 'new-arrivals' },
  { label: 'Face Care', slug: 'face-care' },
  { label: 'Body Care', slug: 'body-care' },
  { label: 'Bundles', slug: 'bundles' },
]

export default function ShopBySection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const { addItem } = useCart()
  const active = categories[activeIdx]
  const products = getProductsByCategory(active.slug)

  const handleClick = () => {
    setActiveIdx((activeIdx + 1) % categories.length)
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.shopBy}>Shop by</span>
        <button className={styles.dropdown} onClick={handleClick}>
          {active.label} ▾
        </button>
      </div>
      <div className={styles.grid}>
        {products.slice(0, 4).map(product => (
          <ProductCard key={product.id} product={product} onQuickAdd={addItem} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Write AboutSection component**

`src/components/home/AboutSection.module.css`:

```css
.section {
  position: relative;
  min-height: 450px;
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px var(--container-padding);
}

.content {
  max-width: 600px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.85);
}

.label {
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--brown);
  margin-bottom: 12px;
  font-weight: 500;
}

.title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 3.5vw, 40px);
  font-weight: 400;
  line-height: 1.3;
  color: var(--brown-dark);
  margin-bottom: 24px;
}
```

`src/components/home/AboutSection.tsx`:

```tsx
import Button from '@/components/shared/Button'
import styles from './AboutSection.module.css'

export default function AboutSection() {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <p className={styles.label}>About CafeDerm</p>
        <h2 className={styles.title}>
          We bring premium skincare<br />
          to every <em>one</em>, every <em>where</em>,<br />
          every <em>day.</em>
        </h2>
        <Button href="/about" variant="outline">Learn More</Button>
      </div>
    </section>
  )
}
```

- [ ] **Step 8: Write MediaGrid component**

`src/components/home/MediaGrid.module.css`:

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 60px var(--container-padding);
  background: var(--white);
}

.item {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.itemLight {
  composes: item;
  background: linear-gradient(135deg, var(--cream-dark) 0%, var(--cream) 100%);
}

.itemDark {
  composes: item;
  background: var(--brown-dark);
  color: var(--cream);
}

.content {
  z-index: 2;
  padding: 40px;
}

.label {
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 12px;
  font-weight: 500;
}

.labelLight {
  composes: label;
  color: var(--brown);
}

.labelDark {
  composes: label;
  color: var(--brown-light);
}

.title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 400;
  line-height: 1.2;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 13px;
  margin-bottom: 20px;
  line-height: 1.5;
  opacity: 0.8;
}

@media (max-width: 699px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

`src/components/home/MediaGrid.tsx`:

```tsx
import Button from '@/components/shared/Button'
import styles from './MediaGrid.module.css'

export default function MediaGrid() {
  return (
    <section className={styles.grid}>
      <div className={styles.itemLight}>
        <div className={styles.content}>
          <p className={styles.labelLight}>MIX, MATCH & SAVE</p>
          <h3 className={styles.title}>Build Your<br />Custom Bundle</h3>
          <p className={styles.subtitle}>Targeted, solution-driven skincare sets</p>
          <Button href="/collections/bundles" variant="outline">Get Started</Button>
        </div>
      </div>
      <div className={styles.itemDark}>
        <div className={styles.content}>
          <p className={styles.labelDark}>REWARDS</p>
          <h3 className={styles.title}>The CafeDerm<br />Loyalty Club</h3>
          <p className={styles.subtitle}>Earn points, perks, and more with every purchase</p>
          <Button href="#" variant="outlineLight">Join Now</Button>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 9: Compose homepage in `src/app/page.tsx`**

```tsx
import Hero from '@/components/home/Hero'
import Marquee from '@/components/home/Marquee'
import CollectionCards from '@/components/home/CollectionCards'
import ProductGrid from '@/components/home/ProductGrid'
import FeaturedBanner from '@/components/home/FeaturedBanner'
import ShopBySection from '@/components/home/ShopBySection'
import AboutSection from '@/components/home/AboutSection'
import MediaGrid from '@/components/home/MediaGrid'
import { getProductsByCategory } from '@/data/products'

export default function Home() {
  const trending = getProductsByCategory('best-sellers')

  return (
    <>
      <Hero />
      <Marquee />
      <CollectionCards />
      <ProductGrid title="Trending Now" products={trending} />
      <FeaturedBanner />
      <ShopBySection />
      <AboutSection />
      <MediaGrid />
    </>
  )
}
```

- [ ] **Step 10: Verify the full homepage renders**

```bash
cd /Users/karenmagallano/cafederm && npm run dev
```

Open http://localhost:3000 — all 8 homepage sections should render matching the approved mockup.

- [ ] **Step 11: Commit**

```bash
cd /Users/karenmagallano/cafederm
git add src/components/home src/app/page.tsx
git commit -m "feat: add all homepage sections — Hero, Marquee, Collections, Products, Banner, ShopBy, About, MediaGrid"
```

---

### Task 7: Collection Page

**Files:**
- Create: `src/app/collections/[slug]/page.tsx`
- Create: `src/app/collections/[slug]/collections.module.css`

- [ ] **Step 1: Write `src/app/collections/[slug]/collections.module.css`**

```css
.page {
  padding: 60px var(--container-padding);
  max-width: var(--container-max);
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 48px;
}

.title {
  font-family: var(--font-heading);
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 400;
  color: var(--brown-dark);
  margin-bottom: 12px;
}

.description {
  font-size: 14px;
  color: var(--brown);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

.count {
  font-size: 12px;
  color: var(--gray);
  margin-top: 8px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 699px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (min-width: 700px) and (max-width: 999px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

- [ ] **Step 2: Write `src/app/collections/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { getCollectionBySlug } from '@/data/collections'
import { getProductsByCategory } from '@/data/products'
import CollectionPageClient from './CollectionPageClient'

interface Props {
  params: { slug: string }
}

export function generateMetadata({ params }: Props) {
  const collection = getCollectionBySlug(params.slug)
  if (!collection) return { title: 'Not Found' }
  return {
    title: `${collection.name} — CafeDerm`,
    description: collection.description,
  }
}

export default function CollectionPage({ params }: Props) {
  const collection = getCollectionBySlug(params.slug)
  if (!collection) notFound()

  const products = getProductsByCategory(params.slug)

  return <CollectionPageClient collection={collection} products={products} />
}
```

- [ ] **Step 3: Create `src/app/collections/[slug]/CollectionPageClient.tsx`**

```tsx
'use client'

import { Collection } from '@/types'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import ProductCard from '@/components/shared/ProductCard'
import styles from './collections.module.css'

interface Props {
  collection: Collection
  products: Product[]
}

export default function CollectionPageClient({ collection, products }: Props) {
  const { addItem } = useCart()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{collection.name}</h1>
        <p className={styles.description}>{collection.description}</p>
        <p className={styles.count}>{products.length} products</p>
      </div>
      <div className={styles.grid}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} onQuickAdd={addItem} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify**

```bash
cd /Users/karenmagallano/cafederm && npm run dev
```

Navigate to http://localhost:3000/collections/face-care — should show title, description, and product grid.

- [ ] **Step 5: Commit**

```bash
cd /Users/karenmagallano/cafederm
git add src/app/collections
git commit -m "feat: add collection listing page with product grid"
```

---

### Task 8: Product Detail Page

**Files:**
- Create: `src/app/products/[slug]/page.tsx`
- Create: `src/app/products/[slug]/ProductPageClient.tsx`
- Create: `src/app/products/[slug]/product.module.css`

- [ ] **Step 1: Write `src/app/products/[slug]/product.module.css`**

```css
.page {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 60px var(--container-padding);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

.gallery {
  aspect-ratio: 1;
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 24px;
  color: var(--brown-light);
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.badge {
  display: inline-block;
  background: var(--brown-dark);
  color: var(--cream);
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 12px;
  font-weight: 600;
  margin-bottom: 16px;
  align-self: flex-start;
}

.title {
  font-family: var(--font-heading);
  font-size: clamp(28px, 3vw, 38px);
  font-weight: 400;
  color: var(--brown-dark);
  margin-bottom: 8px;
  line-height: 1.2;
}

.priceRow {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.price {
  font-size: 20px;
  color: var(--brown-dark);
  font-weight: 500;
}

.comparePrice {
  font-size: 16px;
  color: var(--gray);
  text-decoration: line-through;
}

.stars {
  font-size: 14px;
  color: var(--brown-light);
  margin-bottom: 24px;
}

.description {
  font-size: 14px;
  line-height: 1.7;
  color: var(--brown);
  margin-bottom: 32px;
}

.addToCart {
  width: 100%;
  max-width: 400px;
  padding: 18px;
  background: var(--brown-dark);
  color: var(--cream);
  border: none;
  font-size: 12px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 16px;
}

.addToCart:hover {
  background: var(--brown);
}

.details {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.detailItem {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--brown);
  margin-bottom: 8px;
}

@media (max-width: 699px) {
  .page {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
```

- [ ] **Step 2: Write `src/app/products/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { getProductBySlug, products } from '@/data/products'
import ProductPageClient from './ProductPageClient'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: Props) {
  const product = getProductBySlug(params.slug)
  if (!product) return { title: 'Not Found' }
  return {
    title: `${product.name} — CafeDerm`,
    description: product.description,
  }
}

export default function ProductPage({ params }: Props) {
  const product = getProductBySlug(params.slug)
  if (!product) notFound()

  return <ProductPageClient product={product} />
}
```

- [ ] **Step 3: Write `src/app/products/[slug]/ProductPageClient.tsx`**

```tsx
'use client'

import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/data/products'
import styles from './product.module.css'

interface Props {
  product: Product
}

export default function ProductPageClient({ product }: Props) {
  const { addItem } = useCart()

  const badge = product.tags.includes('new')
    ? 'NEW'
    : product.tags.includes('best-seller')
    ? 'BEST SELLER'
    : null

  const fullStars = Math.floor(product.rating)
  const starsDisplay = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars)

  return (
    <div className={styles.page}>
      <div className={styles.gallery}>Product Image</div>
      <div className={styles.info}>
        {badge && <span className={styles.badge}>{badge}</span>}
        <h1 className={styles.title}>{product.name}</h1>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
        <div className={styles.stars}>
          {starsDisplay} ({product.reviewCount} reviews)
        </div>
        <p className={styles.description}>{product.description}</p>
        <button className={styles.addToCart} onClick={() => addItem(product)}>
          Add to Cart
        </button>
        <div className={styles.details}>
          <div className={styles.detailItem}>✓ Free shipping over $50</div>
          <div className={styles.detailItem}>✓ Cruelty free</div>
          <div className={styles.detailItem}>✓ Dermatologist tested</div>
          <div className={styles.detailItem}>✓ Clean ingredients</div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify**

```bash
cd /Users/karenmagallano/cafederm && npm run dev
```

Navigate to http://localhost:3000/products/caffeine-brightening-serum — should show product detail with image placeholder, title, price, description, and add to cart button.

- [ ] **Step 5: Commit**

```bash
cd /Users/karenmagallano/cafederm
git add src/app/products
git commit -m "feat: add product detail page with add-to-cart"
```

---

### Task 9: Stripe Checkout API + Order Confirmation

**Files:**
- Create: `src/lib/stripe.ts`
- Create: `src/app/api/checkout/route.ts`
- Create: `src/app/order-confirmation/page.tsx`
- Create: `src/app/order-confirmation/OrderConfirmationClient.tsx`
- Create: `src/app/order-confirmation/confirmation.module.css`

- [ ] **Step 1: Write `src/lib/stripe.ts`**

```ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})
```

- [ ] **Step 2: Write `src/app/api/checkout/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

interface CartLineItem {
  id: string
  name: string
  price: number // cents
  quantity: number
}

export async function POST(request: Request) {
  try {
    const { items }: { items: CartLineItem[] } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 3: Write order confirmation styles**

`src/app/order-confirmation/confirmation.module.css`:

```css
.page {
  max-width: 600px;
  margin: 0 auto;
  padding: 80px var(--container-padding);
  text-align: center;
}

.icon {
  font-size: 48px;
  margin-bottom: 24px;
}

.title {
  font-family: var(--font-heading);
  font-size: 32px;
  color: var(--brown-dark);
  margin-bottom: 12px;
}

.subtitle {
  font-size: 14px;
  color: var(--brown);
  margin-bottom: 40px;
  line-height: 1.6;
}

.details {
  text-align: left;
  padding: 24px;
  background: var(--cream);
  margin-bottom: 32px;
}

.detailRow {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid var(--cream-dark);
}

.detailRow:last-child {
  border-bottom: none;
  font-weight: 600;
  padding-top: 12px;
}
```

- [ ] **Step 4: Write `src/app/order-confirmation/page.tsx`**

```tsx
import { Suspense } from 'react'
import OrderConfirmationClient from './OrderConfirmationClient'

export const metadata = {
  title: 'Order Confirmed — CafeDerm',
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px' }}>Loading...</div>}>
      <OrderConfirmationClient />
    </Suspense>
  )
}
```

- [ ] **Step 5: Write `src/app/order-confirmation/OrderConfirmationClient.tsx`**

```tsx
'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import Button from '@/components/shared/Button'
import styles from './confirmation.module.css'

export default function OrderConfirmationClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()

  useEffect(() => {
    if (sessionId) {
      clearCart()
    }
  }, [sessionId, clearCart])

  return (
    <div className={styles.page}>
      <div className={styles.icon}>✓</div>
      <h1 className={styles.title}>Thank You!</h1>
      <p className={styles.subtitle}>
        Your order has been confirmed. We&apos;ll send you a confirmation email with tracking details shortly.
      </p>
      {sessionId && (
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span>Order Reference</span>
            <span>{sessionId.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      )}
      <Button href="/collections/all">Continue Shopping</Button>
    </div>
  )
}
```

- [ ] **Step 6: Verify build compiles**

```bash
cd /Users/karenmagallano/cafederm && npm run build
```

Should compile with no errors. (Stripe API calls will fail without real keys, but the build should succeed.)

- [ ] **Step 7: Commit**

```bash
cd /Users/karenmagallano/cafederm
git add src/lib src/app/api src/app/order-confirmation
git commit -m "feat: add Stripe checkout API route and order confirmation page"
```

---

### Task 10: About Page + Static Policy Pages

**Files:**
- Create: `src/app/about/page.tsx`, `src/app/about/about.module.css`
- Create: `src/app/contact/page.tsx`
- Create: `src/app/shipping/page.tsx`
- Create: `src/app/privacy/page.tsx`
- Create: `src/app/terms/page.tsx`

- [ ] **Step 1: Write About page**

`src/app/about/about.module.css`:

```css
.hero {
  background: var(--cream);
  text-align: center;
  padding: 80px var(--container-padding) 60px;
}

.title {
  font-family: var(--font-heading);
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 400;
  color: var(--brown-dark);
  margin-bottom: 16px;
}

.subtitle {
  font-size: 15px;
  color: var(--brown);
  max-width: 550px;
  margin: 0 auto;
  line-height: 1.7;
}

.section {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px var(--container-padding);
}

.sectionTitle {
  font-family: var(--font-heading);
  font-size: 28px;
  color: var(--brown-dark);
  margin-bottom: 16px;
}

.text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--brown);
  margin-bottom: 24px;
}

.values {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--container-padding) 60px;
}

.value {
  text-align: center;
  padding: 32px 24px;
  background: var(--cream);
}

.valueIcon {
  font-size: 28px;
  margin-bottom: 12px;
}

.valueTitle {
  font-family: var(--font-heading);
  font-size: 20px;
  color: var(--brown-dark);
  margin-bottom: 8px;
}

.valueText {
  font-size: 13px;
  color: var(--brown);
  line-height: 1.6;
}

@media (max-width: 699px) {
  .values {
    grid-template-columns: 1fr;
  }
}
```

`src/app/about/page.tsx`:

```tsx
import { Metadata } from 'next'
import Button from '@/components/shared/Button'
import styles from './about.module.css'

export const metadata: Metadata = {
  title: 'About — CafeDerm',
  description: 'Learn about CafeDerm and our mission to deliver premium, clinically-tested skincare.',
}

export default function AboutPage() {
  return (
    <>
      <div className={styles.hero}>
        <h1 className={styles.title}>About CafeDerm</h1>
        <p className={styles.subtitle}>
          We believe everyone deserves access to premium, clinically-tested skincare
          that delivers real, visible results.
        </p>
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Story</h2>
        <p className={styles.text}>
          CafeDerm was born from a simple belief: premium skincare shouldn&apos;t come with a
          premium price tag. We partner with leading dermatologists and cosmetic chemists to
          develop formulas that combine clinical-grade actives with luxurious textures.
        </p>
        <p className={styles.text}>
          Every product is rigorously tested for efficacy and safety. We never compromise
          on ingredients, and we never test on animals. Our formulas are clean, effective,
          and designed for real results you can see and feel.
        </p>
      </div>
      <div className={styles.values}>
        <div className={styles.value}>
          <div className={styles.valueIcon}>✓</div>
          <h3 className={styles.valueTitle}>Clinically Tested</h3>
          <p className={styles.valueText}>Every formula backed by clinical studies and dermatologist approval.</p>
        </div>
        <div className={styles.value}>
          <div className={styles.valueIcon}>♡</div>
          <h3 className={styles.valueTitle}>Cruelty Free</h3>
          <p className={styles.valueText}>Never tested on animals. Always tested on willing humans.</p>
        </div>
        <div className={styles.value}>
          <div className={styles.valueIcon}>✿</div>
          <h3 className={styles.valueTitle}>Clean Formulas</h3>
          <p className={styles.valueText}>No parabens, sulfates, or phthalates. Just what your skin needs.</p>
        </div>
      </div>
      <div className={styles.section} style={{ textAlign: 'center' }}>
        <Button href="/collections/all">Shop Our Products</Button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Write placeholder policy pages**

`src/app/contact/page.tsx`:

```tsx
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contact — CafeDerm' }

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, marginBottom: 16, color: 'var(--brown-dark)' }}>
        Contact Us
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--brown)', marginBottom: 24 }}>
        Have a question? We&apos;d love to hear from you. Email us at{' '}
        <a href="mailto:hello@cafederm.com" style={{ color: 'var(--brown-dark)', textDecoration: 'underline' }}>
          hello@cafederm.com
        </a>{' '}
        and we&apos;ll get back to you within 24 hours.
      </p>
    </div>
  )
}
```

`src/app/shipping/page.tsx`:

```tsx
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shipping & Returns — CafeDerm' }

export default function ShippingPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, marginBottom: 16, color: 'var(--brown-dark)' }}>
        Shipping & Returns
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--brown)', marginBottom: 16 }}>
        <strong>Free shipping</strong> on all orders over $50 within the US and Canada.
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--brown)', marginBottom: 16 }}>
        Standard shipping (3-7 business days): $5.99
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--brown)' }}>
        Not happy with your purchase? Return any unused product within 30 days for a full refund.
        Contact us at hello@cafederm.com to initiate a return.
      </p>
    </div>
  )
}
```

`src/app/privacy/page.tsx`:

```tsx
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy — CafeDerm' }

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, marginBottom: 16, color: 'var(--brown-dark)' }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--brown)' }}>
        CafeDerm respects your privacy. We collect only the information necessary to process
        your orders and improve your shopping experience. We never sell your personal data to
        third parties. Payment processing is handled securely by Stripe.
      </p>
    </div>
  )
}
```

`src/app/terms/page.tsx`:

```tsx
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service — CafeDerm' }

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, marginBottom: 16, color: 'var(--brown-dark)' }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--brown)' }}>
        By using CafeDerm, you agree to these terms. All products are for external use only.
        Prices are in USD and subject to change. We reserve the right to limit quantities.
        All sales are subject to our return policy.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Verify**

```bash
cd /Users/karenmagallano/cafederm && npm run dev
```

Check: http://localhost:3000/about, /contact, /shipping, /privacy, /terms — all should render.

- [ ] **Step 4: Commit**

```bash
cd /Users/karenmagallano/cafederm
git add src/app/about src/app/contact src/app/shipping src/app/privacy src/app/terms
git commit -m "feat: add About page and static policy pages (contact, shipping, privacy, terms)"
```

---

### Task 11: Final Build Verification + Cleanup

**Files:**
- Modify: `src/app/globals.css` (if needed)
- Create: `.gitignore` updates

- [ ] **Step 1: Ensure `.gitignore` includes sensitive files**

Verify `.gitignore` contains:

```
.env*.local
node_modules
.next
out
```

- [ ] **Step 2: Run production build**

```bash
cd /Users/karenmagallano/cafederm && npm run build
```

Fix any TypeScript or build errors that appear.

- [ ] **Step 3: Test production build locally**

```bash
cd /Users/karenmagallano/cafederm && npm start
```

Open http://localhost:3000 and verify:
1. Homepage renders all sections
2. Navigation links work (collections, about, etc.)
3. Product cards show correctly
4. Product detail page loads
5. Cart drawer opens when clicking cart icon or quick-add
6. Cart quantity controls work
7. Footer links work

- [ ] **Step 4: Final commit**

```bash
cd /Users/karenmagallano/cafederm
git add -A
git commit -m "chore: final build verification and cleanup"
```

---

## Summary

| Task | What it builds | Files |
|------|---------------|-------|
| 1 | Next.js scaffold + design tokens | layout, globals.css, config |
| 2 | Types + 16 products + 6 collections | types/, data/ |
| 3 | Button + ProductCard components | shared/ |
| 4 | AnnouncementBar + Header + Footer | layout/ |
| 5 | CartContext + CartDrawer + wired layout | context/, layout/ |
| 6 | All 8 homepage sections | home/, page.tsx |
| 7 | Collection listing page | collections/[slug]/ |
| 8 | Product detail page | products/[slug]/ |
| 9 | Stripe checkout + order confirmation | api/checkout, order-confirmation/ |
| 10 | About + policy pages | about/, contact/, shipping/, etc. |
| 11 | Build verification + cleanup | — |
