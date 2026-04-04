'use client'

import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/data/products'
import styles from './product.module.css'

export default function ProductPageClient({ product }: { product: Product }) {
  const { addItem } = useCart()
  const badge = product.tags.includes('new') ? 'NEW' : product.tags.includes('best-seller') ? 'BEST SELLER' : null
  const fullStars = Math.floor(product.rating)
  const starsDisplay = '\u2605'.repeat(fullStars) + '\u2606'.repeat(5 - fullStars)

  return (
    <div className={styles.page}>
      <div className={styles.gallery}>Product Image</div>
      <div className={styles.info}>
        {badge && <span className={styles.badge}>{badge}</span>}
        <h1 className={styles.title}>{product.name}</h1>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.compareAtPrice && <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</span>}
        </div>
        <div className={styles.stars}>{starsDisplay} ({product.reviewCount} reviews)</div>
        <p className={styles.description}>{product.description}</p>
        <button className={styles.addToCart} onClick={() => addItem(product)}>Add to Cart</button>
        <div className={styles.details}>
          <div className={styles.detailItem}>{'\u2713'} Free shipping over $50</div>
          <div className={styles.detailItem}>{'\u2713'} Cruelty free</div>
          <div className={styles.detailItem}>{'\u2713'} Dermatologist tested</div>
          <div className={styles.detailItem}>{'\u2713'} Clean ingredients</div>
        </div>
      </div>
    </div>
  )
}
