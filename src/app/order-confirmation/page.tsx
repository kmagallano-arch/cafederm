import { Suspense } from 'react'
import OrderConfirmationClient from './OrderConfirmationClient'

export const metadata = { title: 'Order Confirmed — CafeDerm' }

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px' }}>Loading...</div>}>
      <OrderConfirmationClient />
    </Suspense>
  )
}
