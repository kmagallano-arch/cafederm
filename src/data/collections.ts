import { Collection } from '@/types'

export const collections: Collection[] = [
  { id: 'col_new_arrivals', name: 'New Arrivals', slug: 'new-arrivals', description: 'Discover our latest skincare innovations.', image: '/images/collections/new-arrivals.jpg' },
  { id: 'col_face_care', name: 'Face Care', slug: 'face-care', description: 'Clinically-tested serums, moisturizers, and treatments for your face.', image: '/images/collections/face-care.jpg' },
  { id: 'col_body_care', name: 'Body Care', slug: 'body-care', description: 'Luxurious body washes, lotions, and treatments for radiant skin.', image: '/images/collections/body-care.jpg' },
  { id: 'col_best_sellers', name: 'Best Sellers', slug: 'best-sellers', description: 'Our most-loved products, backed by thousands of reviews.', image: '/images/collections/best-sellers.jpg' },
  { id: 'col_bundles', name: 'Bundles', slug: 'bundles', description: 'Curated sets at a special price. Mix, match, and save.', image: '/images/collections/bundles.jpg' },
  { id: 'col_all', name: 'Shop All', slug: 'all', description: 'Browse our complete collection of premium skincare.', image: '/images/collections/shop-all.jpg' },
]

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find(c => c.slug === slug)
}
