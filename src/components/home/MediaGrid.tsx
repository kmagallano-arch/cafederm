import Link from 'next/link'
import styles from './MediaGrid.module.css'
import type { SiteContent } from '@/lib/content'

interface MediaGridProps {
  content: SiteContent['mediaGrid']
}

export default function MediaGrid({ content }: MediaGridProps) {
  const leftTitleParts = content.left.title.split('\n')
  const rightTitleParts = content.right.title.split('\n')

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <Link href={content.left.buttonLink}>
          <div className={`${styles.card} ${styles.cardLight}`}>
            <div className={styles.cardCircle} />
            <span className={styles.cardLabel}>{content.left.label}</span>
            <h3 className={styles.cardTitle}>
              {leftTitleParts.map((part, i) => (
                <span key={i}>
                  {part}
                  {i < leftTitleParts.length - 1 && <br />}
                </span>
              ))}
            </h3>
            <span className={styles.cardLink}>{content.left.buttonText} &rarr;</span>
          </div>
        </Link>
        <Link href={content.right.buttonLink}>
          <div className={`${styles.card} ${styles.cardDark}`}>
            <div className={styles.cardCircle} />
            <span className={styles.cardLabel}>{content.right.label}</span>
            <h3 className={styles.cardTitle}>
              {rightTitleParts.map((part, i) => (
                <span key={i}>
                  {part}
                  {i < rightTitleParts.length - 1 && <br />}
                </span>
              ))}
            </h3>
            <span className={styles.cardLink}>{content.right.buttonText} &rarr;</span>
          </div>
        </Link>
      </div>
    </section>
  )
}
