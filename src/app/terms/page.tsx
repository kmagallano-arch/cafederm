import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service — CafeDerm', description: 'CafeDerm terms of service.' }

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 400, color: 'var(--brown-dark)', marginBottom: 16 }}>Terms of Service</h1>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 24 }}>
        By accessing and using the CafeDerm website, you agree to be bound by these Terms of Service. Please read them carefully before making a purchase.
      </p>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 400, color: 'var(--brown-dark)', marginTop: 32, marginBottom: 12 }}>Orders and Payments</h2>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 16 }}>
        All orders are subject to availability and confirmation. Prices are listed in USD and are subject to change without notice. Payment is processed securely at the time of purchase.
      </p>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 400, color: 'var(--brown-dark)', marginTop: 32, marginBottom: 12 }}>Product Information</h2>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 16 }}>
        We strive to display our products as accurately as possible. However, colors and appearance may vary slightly from what you see on screen. CafeDerm products are not intended to diagnose, treat, cure, or prevent any disease.
      </p>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 400, color: 'var(--brown-dark)', marginTop: 32, marginBottom: 12 }}>Limitation of Liability</h2>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)' }}>
        CafeDerm shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our total liability shall not exceed the amount paid for the product in question.
      </p>
    </div>
  )
}
