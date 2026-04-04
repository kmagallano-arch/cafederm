'use client'

import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import ProductCard from '@/components/shared/ProductCard'
import styles from './ProductGrid.module.css'

interface ProductGridProps {
  title: string
  products: Product[]
}

export default function ProductGrid({ title, products }: ProductGridProps) {
  const { addItem } = useCart()

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickAdd={(p) => addItem(p)}
          />
        ))}
      </div>
    </section>
  )
}
