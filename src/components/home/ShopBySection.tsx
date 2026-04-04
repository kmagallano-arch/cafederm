'use client'

import { useState, useRef, useEffect } from 'react'
import { products } from '@/data/products'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import ProductCard from '@/components/shared/ProductCard'
import styles from './ShopBySection.module.css'

type Category = 'trending' | 'new-arrivals' | 'face-care' | 'body-care' | 'bundles'

const categories: { key: Category; label: string }[] = [
  { key: 'trending', label: 'Trending' },
  { key: 'new-arrivals', label: 'New Arrivals' },
  { key: 'face-care', label: 'Face Care' },
  { key: 'body-care', label: 'Body Care' },
  { key: 'bundles', label: 'Bundles' },
]

function getProductsForCategory(cat: Category): Product[] {
  switch (cat) {
    case 'trending':
      return products.filter(p => p.tags.includes('best-seller')).slice(0, 4)
    case 'new-arrivals':
      return products.filter(p => p.tags.includes('new')).slice(0, 4)
    case 'face-care':
      return products.filter(p => p.category === 'face-care').slice(0, 4)
    case 'body-care':
      return products.filter(p => p.category === 'body-care').slice(0, 4)
    case 'bundles':
      return products.filter(p => p.category === 'bundles').slice(0, 4)
    default:
      return products.slice(0, 4)
  }
}

export default function ShopBySection() {
  const [active, setActive] = useState<Category>('trending')
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeLabel = categories.find(c => c.key === active)?.label || 'Trending'
  const displayProducts = getProductsForCategory(active)

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Shop by</h2>
        <div className={styles.dropdown} ref={dropdownRef}>
          <button
            className={styles.dropdownBtn}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {activeLabel}
            <span className={`${styles.arrow} ${menuOpen ? styles.arrowOpen : ''}`}>&#9660;</span>
          </button>
          {menuOpen && (
            <div className={styles.menu}>
              {categories.map(cat => (
                <button
                  key={cat.key}
                  className={`${styles.menuItem} ${cat.key === active ? styles.menuItemActive : ''}`}
                  onClick={() => { setActive(cat.key); setMenuOpen(false); }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.grid}>
        {displayProducts.map(product => (
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
