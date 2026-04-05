export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: 'face-care' | 'body-care' | 'bundles'
  tags: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  ingredients?: string
  howToUse?: string
  keyBenefits?: string[]
  relatedProductIds?: string[]
  variants?: { name: string; options: string[] }[]
  recommendedFor?: string[]
  awards?: string
  subscribeDiscount?: number
  ritualProductIds?: string[]
  trustBadges?: { icon: string; label: string }[]
  ingredientImages?: { name: string; image: string; description: string; benefits: string[] }[]
  brandStoryImage?: string
  brandStoryTitle?: string
  brandStoryText?: string
  sampleReviews?: { name: string; rating: number; date: string; text: string }[]
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
