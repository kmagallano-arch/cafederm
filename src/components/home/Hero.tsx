import Button from '@/components/shared/Button'
import styles from './Hero.module.css'
import type { SiteContent } from '@/lib/content'

interface HeroProps {
  content: SiteContent['hero']
}

export default function Hero({ content }: HeroProps) {
  const titleParts = content.title.split('\n')

  return (
    <section
      className={styles.hero}
      style={content.backgroundImage ? { backgroundImage: `url(${content.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <div className={styles.circle1} />
      <div className={styles.circle2} />
      <div className={styles.circle3} />
      <div className={styles.content}>
        <p className={styles.label}>{content.label}</p>
        <h1 className={styles.title}>
          {titleParts.map((part, i) => (
            <span key={i}>
              {part}
              {i < titleParts.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className={styles.subtitle}>{content.subtitle}</p>
        <Button href={content.buttonLink}>{content.buttonText}</Button>
      </div>
    </section>
  )
}
