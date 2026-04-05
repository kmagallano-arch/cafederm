'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { Product } from '@/types'
import styles from './Header.module.css'

export default function Header() {
  const { totalItems, setCartOpen } = useCart()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Fetch products for search
  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllProducts(data as Product[])
      })
      .catch(() => {})
  }, [])

  // Filter results as user types
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const q = query.toLowerCase()
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ).slice(0, 6)
    setResults(filtered)
  }, [query, allProducts])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  return (
    <header className={styles.header}>
      <button className={styles.mobileMenuBtn} aria-label="Menu">☰</button>
      <nav className={styles.nav}>
        <Link href="/collections/new-arrivals" className={styles.navLink}>New Arrivals</Link>
        <Link href="/collections/face-care" className={styles.navLink}>Face Care</Link>
        <Link href="/collections/body-care" className={styles.navLink}>Body Care</Link>
        <Link href="/collections/bundles" className={styles.navLink}>Bundles</Link>
        <Link href="/about" className={styles.navLink}>About</Link>
      </nav>
      <Link href="/" className={styles.logo}>CafeDerm</Link>
      <div className={styles.icons}>
        <button className={styles.iconBtn} aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}>
          🔍
        </button>
        <button className={styles.iconBtn} onClick={() => setCartOpen(true)} aria-label="Cart">
          🛒 {totalItems > 0 && <span className={styles.cartCount}>{totalItems}</span>}
        </button>
      </div>

      {searchOpen && (
        <div className={styles.searchOverlay} ref={searchRef}>
          <div className={styles.searchBox}>
            <input
              ref={inputRef}
              className={styles.searchInput}
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') { setSearchOpen(false); setQuery('') }
              }}
            />
            <button className={styles.searchClose} onClick={() => { setSearchOpen(false); setQuery('') }}>×</button>
          </div>
          {results.length > 0 && (
            <div className={styles.searchResults}>
              {results.map(p => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className={styles.searchResult}
                  onClick={() => { setSearchOpen(false); setQuery('') }}
                >
                  <span className={styles.searchResultName}>{p.name}</span>
                  <span className={styles.searchResultPrice}>${((p.price || 0) / 100).toFixed(2)}</span>
                </Link>
              ))}
            </div>
          )}
          {query.trim() && results.length === 0 && (
            <div className={styles.searchNoResults}>No products found</div>
          )}
        </div>
      )}
    </header>
  )
}
