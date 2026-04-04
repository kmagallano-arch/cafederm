import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shipping & Returns — CafeDerm', description: 'CafeDerm shipping and return policies.' }

export default function ShippingPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 400, color: 'var(--brown-dark)', marginBottom: 16 }}>Shipping &amp; Returns</h1>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 400, color: 'var(--brown-dark)', marginTop: 32, marginBottom: 12 }}>Shipping</h2>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 16 }}>
        We offer free standard shipping on all orders over $50 within the United States and Canada. Standard shipping typically takes 3-7 business days.
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 16 }}>
        Expedited shipping options are available at checkout for an additional fee. Orders placed before 2pm EST on business days are typically processed the same day.
      </p>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 400, color: 'var(--brown-dark)', marginTop: 32, marginBottom: 12 }}>Returns</h2>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 16 }}>
        We offer a 30-day return policy on all unopened products. If you&apos;re not satisfied with your purchase, simply contact us at hello@cafederm.com to initiate a return.
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)' }}>
        Refunds are processed within 5-7 business days of receiving the returned item.
      </p>
    </div>
  )
}
