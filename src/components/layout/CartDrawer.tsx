'use client'

import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/data/products'
import styles from './CartDrawer.module.css'

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, updateQuantity, removeItem, subtotal } = useCart()

  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map(item => ({ id: item.product.id, name: item.product.name, price: item.product.price, quantity: item.quantity })) }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <>
      <div className={`${styles.overlay} ${cartOpen ? styles.open : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`${styles.drawer} ${cartOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>Your Cart</span>
          <button className={styles.closeBtn} onClick={() => setCartOpen(false)}>&times;</button>
        </div>
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>Your cart is empty</div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className={styles.item}>
                <div className={styles.itemImage}>IMG</div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.product.name}</div>
                  <div className={styles.itemPrice}>{formatPrice(item.product.price)}</div>
                  <div className={styles.itemControls}>
                    <button className={styles.qtyBtn} onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>&minus;</button>
                    <span className={styles.qty}>{item.quantity}</span>
                    <button className={styles.qtyBtn} onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.product.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>Checkout</button>
          </div>
        )}
      </div>
    </>
  )
}
