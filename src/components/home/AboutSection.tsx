import Button from '@/components/shared/Button'
import styles from './AboutSection.module.css'
import type { SiteContent } from '@/lib/content'

interface AboutSectionProps {
  content: SiteContent['about']
}

export default function AboutSection({ content }: AboutSectionProps) {
  const titleParts = content.title.split('\n')

  return (
    <section className={styles.section}>
      <div className={styles.bgCircle} />
      <div className={styles.inner}>
        <p className={styles.label}>{content.label}</p>
        <h2 className={styles.title}>
          {titleParts.map((part, i) => (
            <span key={i}>
              {part}
              {i < titleParts.length - 1 && <br />}
            </span>
          ))}
        </h2>
        <Button href={content.buttonLink} variant="outline">{content.buttonText}</Button>
      </div>
    </section>
  )
}
