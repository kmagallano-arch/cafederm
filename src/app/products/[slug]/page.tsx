import { notFound } from 'next/navigation'
import { getProductBySlug, products } from '@/data/products'
import ProductPageClient from './ProductPageClient'

export function generateStaticParams() { return products.map(p => ({ slug: p.slug })) }

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug)
  if (!product) return { title: 'Not Found' }
  return { title: `${product.name} — CafeDerm`, description: product.description }
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug)
  if (!product) notFound()
  return <ProductPageClient product={product} />
}
