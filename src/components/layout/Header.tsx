'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import styles from './Header.module.css'

export default function Header() {
  const { totalItems, setCartOpen } = useCart()
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
        <button className={styles.iconBtn} aria-label="Search">&#128269;</button>
        <button className={styles.iconBtn} onClick={() => setCartOpen(true)} aria-label="Cart">
          &#128722; {totalItems > 0 && <span className={styles.cartCount}>{totalItems}</span>}
        </button>
      </div>
    </header>
  )
}
