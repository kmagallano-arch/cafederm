import { notFound } from 'next/navigation'
import { getProductBySlug, getProductsByCategory, products } from '@/data/products'
import ProductPageClient from './ProductPageClient'

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug)
  if (!product) return { title: 'Not Found' }
  return { title: `${product.name} — CafeDerm`, description: product.description }
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug)
  if (!product) notFound()

  // Get related products: same category, excluding current
  const related = getProductsByCategory(product.category)
    .filter(p => p.id !== product.id)
    .slice(0, 4)

  return <ProductPageClient product={product} relatedProducts={related} />
}
