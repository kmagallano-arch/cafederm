import ProductEditorClient from './ProductEditorClient'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Product — CafeDerm Admin', robots: 'noindex' }

export default function ProductEditorPage({ params }: { params: { slug: string } }) {
  return <ProductEditorClient slug={params.slug} />
}
