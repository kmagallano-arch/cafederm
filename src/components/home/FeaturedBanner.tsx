import Button from '@/components/shared/Button'
import styles from './FeaturedBanner.module.css'

export default function FeaturedBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.circle1} />
      <div className={styles.circle2} />
      <div className={styles.left}>
        <span className={styles.badge}>New Arrival</span>
        <h2 className={styles.title}>Retinol Recovery<br />Night Cream</h2>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>&#10003;</span>
            <span>Clinically Tested</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>&#9790;</span>
            <span>Overnight Repair</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>&#9883;</span>
            <span>Clean Formula</span>
          </div>
        </div>
        <div>
          <Button href="/products/retinol-recovery-night-cream">Shop Now</Button>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.imagePlaceholder}>
          Product Image
          <div className={styles.priceCard}>
            From
            <span className={styles.priceAmount}>$48</span>
          </div>
        </div>
      </div>
    </section>
  )
}
