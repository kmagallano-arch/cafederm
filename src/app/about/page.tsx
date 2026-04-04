import { Metadata } from 'next'
import Button from '@/components/shared/Button'
import styles from './about.module.css'

export const metadata: Metadata = { title: 'About — CafeDerm', description: 'Learn about CafeDerm and our mission.' }

export default function AboutPage() {
  return (
    <>
      <div className={styles.hero}>
        <h1 className={styles.title}>About CafeDerm</h1>
        <p className={styles.subtitle}>We believe everyone deserves access to premium, clinically-tested skincare that delivers real, visible results.</p>
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Story</h2>
        <p className={styles.text}>CafeDerm was born from a simple belief: premium skincare shouldn&apos;t come with a premium price tag. We partner with leading dermatologists and cosmetic chemists to develop formulas that combine clinical-grade actives with luxurious textures.</p>
        <p className={styles.text}>Every product is rigorously tested for efficacy and safety. We never compromise on ingredients, and we never test on animals. Our formulas are clean, effective, and designed for real results you can see and feel.</p>
      </div>
      <div className={styles.values}>
        <div className={styles.value}>
          <div className={styles.valueIcon}>{'\u2713'}</div>
          <h3 className={styles.valueTitle}>Clinically Tested</h3>
          <p className={styles.valueText}>Every formula backed by clinical studies and dermatologist approval.</p>
        </div>
        <div className={styles.value}>
          <div className={styles.valueIcon}>{'\u2661'}</div>
          <h3 className={styles.valueTitle}>Cruelty Free</h3>
          <p className={styles.valueText}>Never tested on animals. Always tested on willing humans.</p>
        </div>
        <div className={styles.value}>
          <div className={styles.valueIcon}>{'\u273F'}</div>
          <h3 className={styles.valueTitle}>Clean Formulas</h3>
          <p className={styles.valueText}>No parabens, sulfates, or phthalates. Just what your skin needs.</p>
        </div>
      </div>
      <div className={styles.section} style={{ textAlign: 'center' }}>
        <Button href="/collections/all">Shop Our Products</Button>
      </div>
    </>
  )
}
