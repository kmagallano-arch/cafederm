import styles from './Marquee.module.css'

const phrases = [
  'Premium Skincare, Real Results',
  'Dermatologist Tested',
  'Cruelty Free',
  'Clean Ingredients',
  'Premium Skincare, Real Results',
  'Dermatologist Tested',
  'Cruelty Free',
  'Clean Ingredients',
]

export default function Marquee() {
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
