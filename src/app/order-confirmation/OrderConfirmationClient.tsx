'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import Button from '@/components/shared/Button'
import styles from './confirmation.module.css'

export default function OrderConfirmationClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()

  useEffect(() => { if (sessionId) clearCart() }, [sessionId, clearCart])

  return (
    <div className={styles.page}>
      <div className={styles.icon}>{'\u2713'}</div>
      <h1 className={styles.title}>Thank You!</h1>
      <p className={styles.subtitle}>Your order has been confirmed. We&apos;ll send you a confirmation email with tracking details shortly.</p>
      {sessionId && (
        <div className={styles.details}>
          <div className={styles.detailRow}><span>Order Reference</span><span>{sessionId.slice(-8).toUpperCase()}</span></div>
        </div>
      )}
      <Button href="/collections/all">Continue Shopping</Button>
    </div>
  )
}
