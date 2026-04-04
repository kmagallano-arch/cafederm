import Hero from '@/components/home/Hero'
import Marquee from '@/components/home/Marquee'
import CollectionCards from '@/components/home/CollectionCards'
import ProductGrid from '@/components/home/ProductGrid'
import FeaturedBanner from '@/components/home/FeaturedBanner'
import ShopBySection from '@/components/home/ShopBySection'
import AboutSection from '@/components/home/AboutSection'
import MediaGrid from '@/components/home/MediaGrid'
import { getProductsByCategory } from '@/data/products'

export default function Home() {
  const trending = getProductsByCategory('best-sellers')
  return (
    <>
      <Hero />
      <Marquee />
      <CollectionCards />
      <ProductGrid title="Trending Now" products={trending} />
      <FeaturedBanner />
      <ShopBySection />
      <AboutSection />
      <MediaGrid />
    </>
  )
}
