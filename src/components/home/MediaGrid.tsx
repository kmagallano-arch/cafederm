import Link from 'next/link'
import styles from './MediaGrid.module.css'

export default function MediaGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <Link href="/collections/bundles">
          <div className={`${styles.card} ${styles.cardLight}`}>
            <div className={styles.cardCircle} />
            <span className={styles.cardLabel}>Exclusive Offer</span>
            <h3 className={styles.cardTitle}>Build Your<br />Custom Bundle</h3>
            <span className={styles.cardLink}>Shop Bundles &rarr;</span>
          </div>
        </Link>
        <Link href="/rewards">
          <div className={`${styles.card} ${styles.cardDark}`}>
            <div className={styles.cardCircle} />
            <span className={styles.cardLabel}>Rewards Program</span>
            <h3 className={styles.cardTitle}>The CafeDerm<br />Loyalty Club</h3>
            <span className={styles.cardLink}>Learn More &rarr;</span>
          </div>
        </Link>
      </div>
    </section>
  )
}
