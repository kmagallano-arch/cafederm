import type { Metadata } from 'next'
import { CartProvider } from '@/context/CartContext'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/layout/CartDrawer'
import './globals.css'

export const metadata: Metadata = {
  title: 'CafeDerm — Premium Skincare, Real Results',
  description: 'CafeDerm offers premium, clinically-tested skincare and body care. Discover luxurious formulas with real results.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
