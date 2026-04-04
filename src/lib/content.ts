import { supabase } from './supabase'

export interface SiteContent {
  announcement: {
    text: string
    enabled: boolean
  }
  hero: {
    label: string
    title: string
    subtitle: string
    buttonText: string
    buttonLink: string
    backgroundImage: string
  }
  marquee: {
    items: string[]
    enabled: boolean
  }
  featuredBanner: {
    label: string
    title: string
    subtitle: string
    buttonText: string
    buttonLink: string
    productImage: string
    productName: string
    productPrice: string
    features: { icon: string; label: string }[]
  }
  about: {
    label: string
    title: string
    buttonText: string
    buttonLink: string
  }
  mediaGrid: {
    left: { label: string; title: string; subtitle: string; buttonText: string; buttonLink: string }
    right: { label: string; title: string; subtitle: string; buttonText: string; buttonLink: string }
  }
  footer: {
    newsletterTitle: string
    newsletterText: string
  }
}

export const defaultContent: SiteContent = {
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

export async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const { data, error } = await supabase.from('site_content').select('*')
    if (error || !data || data.length === 0) return defaultContent

    const content = { ...defaultContent }
    for (const row of data) {
      const section = row.section as keyof SiteContent
      if (section in content) {
        (content as any)[section] = { ...(content as any)[section], ...row.data }
      }
    }
    return content
  } catch {
    return defaultContent
  }
}

export async function fetchSection<K extends keyof SiteContent>(section: K): Promise<SiteContent[K]> {
  try {
    const { data, error } = await supabase.from('site_content').select('data').eq('section', section).single()
    if (error || !data) return defaultContent[section]
    return { ...defaultContent[section], ...data.data }
  } catch {
    return defaultContent[section]
  }
}
