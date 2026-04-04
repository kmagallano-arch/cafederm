#!/usr/bin/env node

/**
 * CafeDerm — Seed the products table
 *
 * Upserts all 16 products into the Supabase `products` table.
 * Safe to run multiple times (uses upsert on primary key).
 *
 * Prerequisites:
 *   1. The `products` table must already exist (see create-table.sql)
 *   2. RLS must allow inserts (service_role key bypasses RLS)
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-products.mjs
 *
 * If SUPABASE_SERVICE_ROLE_KEY is not set, the script falls back to the
 * anon key (which will fail if RLS blocks inserts for anon).
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qogblzkpzreeikygwjhf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZ2JsemtwenJlZWlreWd3amhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNDUwMTcsImV4cCI6MjA5MDkyMTAxN30.fw_xvn2Fl0h-_w8UlrZ28eYXR8R6lZsZwTN8hUgfOw0';

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    'WARNING: SUPABASE_SERVICE_ROLE_KEY not set — using anon key.',
    'Inserts may fail if RLS blocks anon writes.\n'
  );
}

const supabase = createClient(SUPABASE_URL, key);

const products = [
  {
    id: 'prod_caffeine_serum',
    name: 'Caffeine Brightening Serum',
    slug: 'caffeine-brightening-serum',
    description:
      'A potent vitamin C and caffeine-infused serum that visibly brightens and energizes dull, tired skin. Lightweight, fast-absorbing formula for daily use.',
    price: 2400,
    compare_at_price: null,
    images: ['/images/products/caffeine-serum.jpg'],
    category: 'face-care',
    tags: ['new', 'best-seller'],
    rating: 4.8,
    review_count: 128,
    in_stock: true,
  },
  {
    id: 'prod_foaming_cleanser',
    name: 'Gentle Foaming Cleanser',
    slug: 'gentle-foaming-cleanser',
    description:
      'A pH-balanced, sulfate-free foaming cleanser that removes impurities without stripping the skin barrier. Suitable for all skin types.',
    price: 1800,
    compare_at_price: null,
    images: ['/images/products/foaming-cleanser.jpg'],
    category: 'face-care',
    tags: ['best-seller'],
    rating: 4.9,
    review_count: 312,
    in_stock: true,
  },
  {
    id: 'prod_niacinamide_toner',
    name: 'Niacinamide Pore Refining Toner',
    slug: 'niacinamide-pore-refining-toner',
    description:
      'A niacinamide-powered toner that minimizes pores, controls oil, and smooths skin texture. Alcohol-free formula for sensitive skin.',
    price: 2000,
    compare_at_price: null,
    images: ['/images/products/niacinamide-toner.jpg'],
    category: 'face-care',
    tags: [],
    rating: 4.7,
    review_count: 205,
    in_stock: true,
  },
  {
    id: 'prod_retinol_night_cream',
    name: 'Retinol Recovery Night Cream',
    slug: 'retinol-recovery-night-cream',
    description:
      'An advanced encapsulated retinol cream that promotes cell turnover overnight. Buffered with squalane and ceramides for comfort.',
    price: 3200,
    compare_at_price: null,
    images: ['/images/products/retinol-cream.jpg'],
    category: 'face-care',
    tags: ['new'],
    rating: 4.6,
    review_count: 89,
    in_stock: true,
  },
  {
    id: 'prod_vitamin_c_serum',
    name: 'Vitamin C Complex Serum',
    slug: 'vitamin-c-complex-serum',
    description:
      'A stabilized 15% vitamin C serum with ferulic acid and vitamin E for maximum antioxidant protection and brightening.',
    price: 2600,
    compare_at_price: null,
    images: ['/images/products/vitamin-c-serum.jpg'],
    category: 'face-care',
    tags: ['new'],
    rating: 4.5,
    review_count: 67,
    in_stock: true,
  },
  {
    id: 'prod_ha_moisturizer',
    name: 'Hyaluronic Acid Moisturizer',
    slug: 'hyaluronic-acid-moisturizer',
    description:
      'A multi-weight hyaluronic acid moisturizer that delivers deep hydration across all skin layers. Non-comedogenic, lightweight gel-cream.',
    price: 2800,
    compare_at_price: null,
    images: ['/images/products/ha-moisturizer.jpg'],
    category: 'face-care',
    tags: ['best-seller'],
    rating: 4.8,
    review_count: 276,
    in_stock: true,
  },
  {
    id: 'prod_spf_moisturizer',
    name: 'SPF 50 Daily Moisturizer',
    slug: 'spf-50-daily-moisturizer',
    description:
      'A broad-spectrum SPF 50 moisturizer with a weightless, invisible finish. No white cast. Reef-safe mineral filters.',
    price: 2800,
    compare_at_price: null,
    images: ['/images/products/spf-moisturizer.jpg'],
    category: 'face-care',
    tags: ['best-seller'],
    rating: 4.9,
    review_count: 241,
    in_stock: true,
  },
  {
    id: 'prod_aha_bha_peel',
    name: 'Exfoliating AHA/BHA Peel',
    slug: 'exfoliating-aha-bha-peel',
    description:
      'A 10% AHA and 2% BHA exfoliating treatment that resurfaces skin, unclogs pores, and improves tone. Use 2-3 times per week.',
    price: 2200,
    compare_at_price: null,
    images: ['/images/products/aha-bha-peel.jpg'],
    category: 'face-care',
    tags: [],
    rating: 4.6,
    review_count: 154,
    in_stock: true,
  },
  {
    id: 'prod_body_wash',
    name: 'Advanced Body Wash',
    slug: 'advanced-body-wash',
    description:
      'A nourishing body wash with peptides and ceramides that cleanses while strengthening the skin barrier. Rich, creamy lather.',
    price: 1800,
    compare_at_price: null,
    images: ['/images/products/body-wash.jpg'],
    category: 'body-care',
    tags: [],
    rating: 4.7,
    review_count: 96,
    in_stock: true,
  },
  {
    id: 'prod_body_lotion',
    name: 'Hyaluronic Acid Body Lotion',
    slug: 'hyaluronic-acid-body-lotion',
    description:
      'A fast-absorbing body lotion with multi-weight hyaluronic acid for all-day hydration. Lightweight, non-greasy finish.',
    price: 2200,
    compare_at_price: null,
    images: ['/images/products/body-lotion.jpg'],
    category: 'body-care',
    tags: ['best-seller'],
    rating: 4.8,
    review_count: 184,
    in_stock: true,
  },
  {
    id: 'prod_body_cream',
    name: 'Firming Body Cream',
    slug: 'firming-body-cream',
    description:
      'A rich body cream with retinol and shea butter that firms, smooths, and deeply nourishes dry skin.',
    price: 2600,
    compare_at_price: null,
    images: ['/images/products/body-cream.jpg'],
    category: 'body-care',
    tags: [],
    rating: 4.5,
    review_count: 73,
    in_stock: true,
  },
  {
    id: 'prod_body_scrub',
    name: 'Smoothing Body Scrub',
    slug: 'smoothing-body-scrub',
    description:
      'A gentle exfoliating body scrub with walnut shell powder and glycolic acid. Buffs away rough skin for a silky-smooth finish.',
    price: 2000,
    compare_at_price: null,
    images: ['/images/products/body-scrub.jpg'],
    category: 'body-care',
    tags: ['new'],
    rating: 4.7,
    review_count: 58,
    in_stock: true,
  },
  {
    id: 'prod_body_oil',
    name: 'Hydrating Body Oil',
    slug: 'hydrating-body-oil',
    description:
      'A lightweight dry body oil with squalane and jojoba that absorbs instantly. Leaves skin glowing without residue.',
    price: 2400,
    compare_at_price: null,
    images: ['/images/products/body-oil.jpg'],
    category: 'body-care',
    tags: [],
    rating: 4.6,
    review_count: 112,
    in_stock: true,
  },
  {
    id: 'prod_essentials_set',
    name: 'The Essentials Set',
    slug: 'the-essentials-set',
    description:
      'Everything you need to start your skincare routine: Gentle Foaming Cleanser + Niacinamide Toner + Hyaluronic Acid Moisturizer. Save 15%.',
    price: 5800,
    compare_at_price: 6600,
    images: ['/images/products/essentials-set.jpg'],
    category: 'bundles',
    tags: ['best-seller'],
    rating: 4.9,
    review_count: 198,
    in_stock: true,
  },
  {
    id: 'prod_glow_kit',
    name: 'The Glow Kit',
    slug: 'the-glow-kit',
    description:
      'Your brightening essentials: Caffeine Brightening Serum + Vitamin C Complex Serum + SPF 50 Daily Moisturizer. Save 18%.',
    price: 7200,
    compare_at_price: 7800,
    images: ['/images/products/glow-kit.jpg'],
    category: 'bundles',
    tags: ['new'],
    rating: 4.8,
    review_count: 64,
    in_stock: true,
  },
  {
    id: 'prod_full_routine',
    name: 'The Full Routine',
    slug: 'the-full-routine',
    description:
      'The complete AM/PM regimen: Cleanser + Toner + Vitamin C Serum + Moisturizer + SPF + Retinol Night Cream. Save 22%.',
    price: 9500,
    compare_at_price: 12200,
    images: ['/images/products/full-routine.jpg'],
    category: 'bundles',
    tags: [],
    rating: 4.9,
    review_count: 41,
    in_stock: true,
  },
];

async function main() {
  console.log(`Seeding ${products.length} products into Supabase...\n`);

  const { data, error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'id' })
    .select('id, name');

  if (error) {
    console.error('Upsert failed:', error.message);
    if (error.message.includes('does not exist')) {
      console.log(
        '\nThe products table does not exist yet.',
        'Run the SQL in create-table.sql first.'
      );
    }
    process.exit(1);
  }

  console.log(`Successfully upserted ${data.length} products:\n`);
  for (const row of data) {
    console.log(`  - ${row.name} (${row.id})`);
  }
  console.log('\nDone.');
}

main();
