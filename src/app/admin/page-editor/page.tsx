import PageEditorClient from './PageEditorClient'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Page Editor — CafeDerm Admin', robots: 'noindex' }

export default function PageEditorPage() {
  return <PageEditorClient />
}
