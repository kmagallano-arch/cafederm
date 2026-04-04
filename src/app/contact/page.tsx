import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contact Us — CafeDerm', description: 'Get in touch with the CafeDerm team.' }

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 400, color: 'var(--brown-dark)', marginBottom: 16 }}>Contact Us</h1>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 24 }}>
        We&apos;d love to hear from you. Whether you have a question about our products, need help with an order, or just want to say hello, our team is here to help.
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 24 }}>
        Email us at <a href="mailto:hello@cafederm.com" style={{ color: 'var(--brown-dark)', fontWeight: 500 }}>hello@cafederm.com</a> and we&apos;ll get back to you within 24 hours.
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--brown)', marginBottom: 24 }}>
        Our support hours are Monday through Friday, 9am to 5pm EST.
      </p>
    </div>
  )
}
