import ProductEditorClient from '../[slug]/ProductEditorClient'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Product — CafeDerm Admin', robots: 'noindex' }

export default function NewProductPage() {
  return <ProductEditorClient slug="new" />
}
