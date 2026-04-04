import Button from '@/components/shared/Button'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.circle1} />
      <div className={styles.circle2} />
      <div className={styles.circle3} />
      <div className={styles.content}>
        <p className={styles.label}>New Collection</p>
        <h1 className={styles.title}>Premium Skincare,<br />Real Results</h1>
        <p className={styles.subtitle}>
          Science-backed formulas infused with the finest botanical ingredients.
          Discover skincare that truly works for every skin type.
        </p>
        <Button href="/collections/all">Shop Now</Button>
      </div>
    </section>
  )
}
