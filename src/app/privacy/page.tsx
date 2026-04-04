import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy — CafeDerm', description: 'CafeDerm privacy policy.' }

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 400, color: 'var(--brown-dark)', marginBottom: 16 }}>Privacy Policy</h1>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 24 }}>
        At CafeDerm, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information when you visit our website or make a purchase.
      </p>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 400, color: 'var(--brown-dark)', marginTop: 32, marginBottom: 12 }}>Information We Collect</h2>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 16 }}>
        We collect information you provide directly, such as your name, email address, shipping address, and payment details when you place an order. We also collect usage data to improve your shopping experience.
      </p>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 400, color: 'var(--brown-dark)', marginTop: 32, marginBottom: 12 }}>How We Use Your Information</h2>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 16 }}>
        Your information is used to process orders, send order confirmations and shipping updates, and improve our products and services. We never sell your personal data to third parties.
      </p>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 400, color: 'var(--brown-dark)', marginTop: 32, marginBottom: 12 }}>Data Security</h2>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)' }}>
        We use industry-standard encryption and security measures to protect your personal information. Payment processing is handled securely through Stripe.
      </p>
    </div>
  )
}
