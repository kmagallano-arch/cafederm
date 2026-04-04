'use client'

import Link from 'next/link'
import { Product } from '@/types'
import { formatPrice } from '@/data/products'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
  onQuickAdd?: (product: Product) => void
}

export default function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const badge = product.tags.includes('new') ? 'NEW' : product.tags.includes('best-seller') ? 'BEST SELLER' : null
  const fullStars = Math.floor(product.rating)
  const hasHalf = product.rating % 1 >= 0.5
  const starsDisplay = '★'.repeat(fullStars) + (hasHalf ? '★' : '') + '☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0))

  return (
    <div className={styles.card}>
      <div className={styles.figure}>
        {badge && <span className={styles.badge}>{badge}</span>}
        <span className={styles.placeholder}>Product Image</span>
        <button className={styles.quickAdd} onClick={(e) => { e.preventDefault(); onQuickAdd?.(product) }} aria-label={`Add ${product.name} to cart`}>+</button>
      </div>
      <Link href={`/products/${product.slug}`}>
        <div className={styles.title}>{product.name}</div>
      </Link>
      <div className={styles.priceRow}>
        <span className={styles.price}>{formatPrice(product.price)}</span>
        {product.compareAtPrice && <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</span>}
      </div>
      <div className={styles.stars}>{starsDisplay} ({product.reviewCount})</div>
    </div>
  )
}
