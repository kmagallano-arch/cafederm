import Link from 'next/link'
import { collections } from '@/data/collections'
import styles from './CollectionCards.module.css'

export default function CollectionCards() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {collections.map(collection => (
          <Link key={collection.slug} href={`/collections/${collection.slug}`}>
            <div className={styles.card}>
              <span className={styles.placeholder}>Collection Image</span>
              <div className={styles.label}>{collection.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
