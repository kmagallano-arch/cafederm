# CafeDerm E-Commerce Site — Design Spec

## Overview

CafeDerm is a premium skincare brand selling facial and body care products. The site is a Next.js e-commerce storefront with Stripe Checkout, modeled after Naturium's layout but with CafeDerm's own "Latte Luxe" color palette and branding.

**Stack:** Next.js 14 (App Router) + Stripe Checkout + Vercel hosting
**No Shopify.** Stripe handles all payments (cards, Apple Pay, Google Pay, Link).

---

## Brand Identity

### Name & Tagline
- **Brand:** CafeDerm
- **Tagline:** "Premium Skincare, Real Results"

### Color Palette — "Latte Luxe"
| Token | Hex | Usage |
|-------|-----|-------|
| `--cream` | `#F7F1EB` | Page background, light sections |
| `--cream-dark` | `#E8D5C0` | Secondary backgrounds, borders |
| `--brown-light` | `#B8926A` | Accent text, stars, subtle elements |
| `--brown` | `#6B4226` | Secondary text, labels, subheadings |
| `--brown-dark` | `#2C1810` | Primary text, buttons, headings |
| `--white` | `#FFFFFF` | Cards, product sections |
| `--black` | `#1A1A1A` | Fallback text |

### Typography
| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Headings | Cormorant Garamond | 400, 500 | Hero titles, section titles, product banner |
| Body | Inter | 300-600 | Navigation, product titles, descriptions, buttons |
| Buttons | Inter | 600 | All CTAs, uppercase with letter-spacing |

### Button Styles
- **Primary (dark):** `bg: --brown-dark`, `text: --cream`, square corners
- **Outline:** `border: --brown-dark`, `text: --brown-dark`, transparent bg
- **All buttons:** 11px, letter-spacing 2.5px, uppercase, 14px vertical padding

---

## Product Structure

### Categories (Collections)
1. New Arrivals
2. Face Care
3. Body Care
4. Best Sellers
5. Bundles
6. Shop All

### Product Data Model
```
Product {
  id: string
  name: string
  slug: string
  description: string
  price: number (cents)
  compareAtPrice?: number (cents, for sale items)
  images: string[] (URLs)
  category: string
  tags: string[] (e.g. "new", "best-seller")
  variants?: { name: string, options: string[] }[]
  rating: number
  reviewCount: number
  inStock: boolean
}
```

Products stored as static JSON initially (no database needed for launch). Easy to migrate to a CMS or database later.

### Placeholder Products (15+)
**Face Care:** Caffeine Brightening Serum ($24), Gentle Foaming Cleanser ($18), Niacinamide Pore Refining Toner ($20), Retinol Recovery Night Cream ($32), Vitamin C Complex Serum ($26), Hyaluronic Acid Moisturizer ($28), SPF 50 Daily Moisturizer ($28), Exfoliating AHA/BHA Peel ($22)

**Body Care:** Advanced Body Wash ($18), Hyaluronic Acid Body Lotion ($22), Firming Body Cream ($26), Smoothing Body Scrub ($20), Hydrating Body Oil ($24)

**Bundles:** The Essentials Set ($58), The Glow Kit ($72), The Full Routine ($95)

---

## Page Structure

### Pages
1. **Homepage** (`/`) — main landing page (designed and approved)
2. **Collection page** (`/collections/[slug]`) — filterable product grid
3. **Product detail page** (`/products/[slug]`) — images, description, add to cart
4. **Cart** (drawer/slide-out) — line items, quantity, subtotal
5. **About** (`/about`) — brand story
6. **Contact** (`/contact`) — contact form
7. **Policies** (`/shipping`, `/privacy`, `/terms`) — static text pages

### Homepage Sections (top to bottom)
1. **Announcement bar** — dark brown (`--brown-dark`), white text, free shipping message
2. **Sticky header** — white bg, logo center, nav left (New Arrivals, Face Care, Body Care, Bundles, About), search + cart right
3. **Hero slideshow** — full-width, cream gradient background, "Premium Skincare, Real Results", SHOP NOW CTA
4. **Scrolling marquee** — dark bar, brand values ticker: "Premium Skincare, Real Results / Dermatologist Tested / Cruelty Free / Clean Ingredients"
5. **Collection cards** — 5-column grid: New Arrivals, Face Care, Body Care, Best Sellers, Shop All. Square image placeholders with label below.
6. **Trending Now** — section title + 4-column product grid with badges (NEW, BEST SELLER), quick-add (+) button, star ratings
7. **Featured product banner** — split layout: left text content (NEW ARRIVAL badge, title, description, feature icons, CTA) + right product image placeholder. Rich gradient background with decorative circles.
8. **Shop by dropdown** — "Shop by [Trending v]" with swappable product grid (Trending, Bundle & Save, New Arrivals, Body Care, Face Care)
9. **About section** — centered text overlay on cream background: "We bring premium skincare to every one, every where, every day." + LEARN MORE CTA
10. **Media grid** — 2-column: "Build Your Custom Bundle" (cream bg) + "The CafeDerm Loyalty Club" (dark brown bg)
11. **Footer** — 4-column: newsletter signup + Discover links + Help links + Shop links. Social icons + copyright below.

---

## Checkout Flow

### Cart
- Slide-out drawer from right side
- Shows line items with product image, name, quantity selector, price
- Subtotal + "Checkout" button
- Cart state managed with React context + localStorage persistence

### Stripe Checkout
- On "Checkout" click: POST to `/api/checkout` with cart items
- API route creates a Stripe Checkout Session with line items
- Redirect to Stripe's hosted checkout page
- On success: redirect to `/order-confirmation?session_id={id}`
- On cancel: redirect back to cart

**Stripe Checkout handles:** payment form, card validation, Apple Pay, Google Pay, Link (one-click), email receipt, fraud detection. No custom payment UI needed.

### Order Confirmation
- Fetch session details from Stripe
- Display: order number, items purchased, total, shipping address
- Clear cart

---

## Technical Architecture

### Project Structure
```
cafederm/
  src/
    app/
      layout.tsx          — root layout, fonts, metadata
      page.tsx            — homepage
      collections/[slug]/page.tsx
      products/[slug]/page.tsx
      about/page.tsx
      contact/page.tsx
      api/
        checkout/route.ts — Stripe session creation
    components/
      layout/
        AnnouncementBar.tsx
        Header.tsx
        Footer.tsx
        CartDrawer.tsx
      home/
        Hero.tsx
        Marquee.tsx
        CollectionCards.tsx
        ProductGrid.tsx
        FeaturedBanner.tsx
        ShopBySection.tsx
        AboutSection.tsx
        MediaGrid.tsx
      shared/
        ProductCard.tsx
        Button.tsx
    context/
      CartContext.tsx
    data/
      products.ts        — static product data
      collections.ts     — collection definitions
    lib/
      stripe.ts          — Stripe client init
    styles/
      globals.css        — CSS variables, base styles
  public/
    images/              — product images, hero images
    fonts/               — if self-hosting
```

### Key Technical Decisions
- **Static product data** (JSON) — no database for v1. Products are defined in `data/products.ts`. Easy to swap for a CMS later.
- **CSS Variables** — all colors/typography as CSS custom properties for easy theming
- **No component library** — custom CSS for full design control
- **Cart persistence** — localStorage with React context
- **Stripe Checkout (hosted)** — no custom payment form, maximum trust/conversion
- **Vercel deployment** — `git push` to deploy, free tier sufficient
- **Image optimization** — Next.js `<Image>` component with placeholder blur

### Environment Variables
```
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_SITE_URL=https://cafederm.com
```

---

## Responsive Breakpoints
| Breakpoint | Width | Layout changes |
|------------|-------|----------------|
| Mobile | < 700px | Single column, hamburger menu, stacked hero |
| Tablet | 700-999px | 2-column product grid, condensed nav |
| Desktop | 1000px+ | Full layout as designed |

---

## Out of Scope (v1)
- User accounts / login
- Order history
- Inventory management
- Reviews/ratings system (placeholder stars only)
- Blog / journal
- Email marketing integration
- Analytics (can add later)
- Search functionality (placeholder only)
- Wishlist functionality (placeholder only)
