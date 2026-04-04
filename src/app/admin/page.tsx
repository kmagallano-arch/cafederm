import AdminClient from './AdminClient'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — CafeDerm', robots: 'noindex' }

export default function AdminPage() {
  return <AdminClient />
}
