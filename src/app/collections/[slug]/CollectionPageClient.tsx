'use client'

import { Collection, Product } from '@/types'
import { useCart } from '@/context/CartContext'
import ProductCard from '@/components/shared/ProductCard'
import styles from './collections.module.css'

export default function CollectionPageClient({ collection, products }: { collection: Collection; products: Product[] }) {
  const { addItem } = useCart()
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{collection.name}</h1>
        <p className={styles.description}>{collection.description}</p>
        <p className={styles.count}>{products.length} products</p>
      </div>
      <div className={styles.grid}>
        {products.map(product => <ProductCard key={product.id} product={product} onQuickAdd={addItem} />)}
      </div>
    </div>
  )
}
