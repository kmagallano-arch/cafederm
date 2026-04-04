import Button from '@/components/shared/Button'
import styles from './AboutSection.module.css'

export default function AboutSection() {
  return (
    <section className={styles.section}>
      <div className={styles.bgCircle} />
      <div className={styles.inner}>
        <p className={styles.label}>About CafeDerm</p>
        <h2 className={styles.title}>
          We bring premium skincare to every one, every where, every day.
        </h2>
        <Button href="/about" variant="outline">Learn More</Button>
      </div>
    </section>
  )
}
