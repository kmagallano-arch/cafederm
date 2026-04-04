import Button from '@/components/shared/Button'
import styles from './FeaturedBanner.module.css'
import type { SiteContent } from '@/lib/content'

interface FeaturedBannerProps {
  content: SiteContent['featuredBanner']
}

export default function FeaturedBanner({ content }: FeaturedBannerProps) {
  const titleParts = content.title.split('\n')

  return (
    <section className={styles.banner}>
      <div className={styles.circle1} />
      <div className={styles.circle2} />
      <div className={styles.left}>
        <span className={styles.badge}>{content.label}</span>
        <h2 className={styles.title}>
          {titleParts.map((part, i) => (
            <span key={i}>
              {part}
              {i < titleParts.length - 1 && <br />}
            </span>
          ))}
        </h2>
        <div className={styles.features}>
          {content.features.map((feature, i) => (
            <div key={i} className={styles.feature}>
              <span className={styles.featureIcon}>{feature.icon}</span>
              <span>{feature.label.replace(/\n/g, ' ')}</span>
            </div>
          ))}
        </div>
        <div>
          <Button href={content.buttonLink}>{content.buttonText}</Button>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.imagePlaceholder}>
          {content.productImage ? (
            <img src={content.productImage} alt={content.productName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            content.productName
          )}
          <div className={styles.priceCard}>
            From
            <span className={styles.priceAmount}>{content.productPrice}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
