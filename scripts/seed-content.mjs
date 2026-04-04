import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qogblzkpzreeikygwjhf.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const sections = {
  announcement: {
    text: 'Free Shipping on Orders Over $50 • Premium Skincare, Real Results',
    enabled: true,
  },
  hero: {
    label: 'New Collection',
    title: 'Premium Skincare,\nReal Results',
    subtitle: 'Clinically-tested formulas for radiant, healthy skin',
    buttonText: 'SHOP NOW',
    buttonLink: '/collections/all',
    backgroundImage: '',
  },
  marquee: {
    items: ['Premium Skincare, Real Results', 'Dermatologist Tested', 'Cruelty Free', 'Clean Ingredients'],
    enabled: true,
  },
  featuredBanner: {
    label: 'NEW ARRIVAL',
    title: 'Retinol Recovery\nNight Cream',
    subtitle: 'Wake up to visibly smoother,\nmore radiant skin',
    buttonText: 'SHOP NOW',
    buttonLink: '/products/retinol-recovery-night-cream',
    productImage: '',
    productName: 'Retinol Recovery Night Cream',
    productPrice: '$32',
    features: [
      { icon: '✓', label: 'Clinically\nTested' },
      { icon: '☽', label: 'Overnight\nRepair' },
      { icon: '✿', label: 'Clean\nFormula' },
    ],
  },
  about: {
    label: 'ABOUT CAFEDERM',
    title: 'We bring premium skincare\nto every one, every where,\nevery day.',
    buttonText: 'LEARN MORE',
    buttonLink: '/about',
  },
  mediaGrid: {
    left: { label: 'MIX, MATCH & SAVE', title: 'Build Your\nCustom Bundle', subtitle: 'Targeted, solution-driven skincare sets', buttonText: 'GET STARTED', buttonLink: '/collections/bundles' },
    right: { label: 'REWARDS', title: 'The CafeDerm\nLoyalty Club', subtitle: 'Earn points, perks, and more with every purchase', buttonText: 'JOIN NOW', buttonLink: '#' },
  },
  footer: {
    newsletterTitle: 'Stay in the know',
    newsletterText: 'Sign up for exclusive offers, skincare tips, and new product launches.',
  },
}

console.log('Seeding site content...\n')

for (const [section, data] of Object.entries(sections)) {
  const { error } = await supabase.from('site_content').upsert({
    id: section,
    section,
    data,
    updated_at: new Date().toISOString(),
  })
  if (error) {
    console.error(`  ✗ ${section}: ${error.message}`)
  } else {
    console.log(`  ✓ ${section}`)
  }
}

console.log('\nDone.')
