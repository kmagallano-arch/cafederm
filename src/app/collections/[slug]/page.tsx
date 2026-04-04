import { notFound } from 'next/navigation'
import { getCollectionBySlug } from '@/data/collections'
import { getProductsByCategory } from '@/data/products'
import CollectionPageClient from './CollectionPageClient'

export function generateMetadata({ params }: { params: { slug: string } }) {
  const collection = getCollectionBySlug(params.slug)
  if (!collection) return { title: 'Not Found' }
  return { title: `${collection.name} — CafeDerm`, description: collection.description }
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = getCollectionBySlug(params.slug)
  if (!collection) notFound()
  const products = getProductsByCategory(params.slug)
  return <CollectionPageClient collection={collection} products={products} />
}
