import styles from './Marquee.module.css'
import type { SiteContent } from '@/lib/content'

interface MarqueeProps {
  content: SiteContent['marquee']
}

export default function Marquee({ content }: MarqueeProps) {
  if (!content.enabled) return null

  // Double the items for seamless scrolling, then duplicate again for the CSS animation
  const phrases = [...content.items, ...content.items]

  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        {phrases.map((phrase, i) => (
          <span key={i} className={styles.text}>
            {phrase} &bull;
          </span>
        ))}
        {phrases.map((phrase, i) => (
          <span key={`dup-${i}`} className={styles.text}>
            {phrase} &bull;
          </span>
        ))}
      </div>
    </div>
  )
}
