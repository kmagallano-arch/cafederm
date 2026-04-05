import { notFound } from 'next/navigation'
import { fetchProductBySlug, fetchProductsByCategory, fetchProducts } from '@/data/products'
import ProductPageClient from './ProductPageClient'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await fetchProductBySlug(params.slug)
  if (!product) return { title: 'Not Found' }
  return { title: `${product.name} — CafeDerm`, description: product.description }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetchProductBySlug(params.slug)
  if (!product) notFound()

  const allProducts = await fetchProducts()

  // Get related products: same category, excluding current
  const related = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  // Get ritual products
  const ritualProducts = product.ritualProductIds?.length
    ? allProducts.filter(p => product.ritualProductIds!.includes(p.id))
    : related

  return <ProductPageClient product={product} relatedProducts={related} ritualProducts={ritualProducts} />
}
