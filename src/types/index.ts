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
