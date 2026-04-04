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
