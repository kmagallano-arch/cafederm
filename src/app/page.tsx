import Hero from '@/components/home/Hero'
import Marquee from '@/components/home/Marquee'
import CollectionCards from '@/components/home/CollectionCards'
import ProductGrid from '@/components/home/ProductGrid'
import FeaturedBanner from '@/components/home/FeaturedBanner'
import ShopBySection from '@/components/home/ShopBySection'
import AboutSection from '@/components/home/AboutSection'
import MediaGrid from '@/components/home/MediaGrid'
import { getProductsByCategory } from '@/data/products'
import { fetchSiteContent } from '@/lib/content'

export const revalidate = 60 // revalidate every 60 seconds

export default async function Home() {
  const trending = getProductsByCategory('best-sellers')
  const content = await fetchSiteContent()

  return (
    <>
      <Hero content={content.hero} />
      <Marquee content={content.marquee} />
      <CollectionCards />
      <ProductGrid title="Trending Now" products={trending} />
      <FeaturedBanner content={content.featuredBanner} />
      <ShopBySection />
      <AboutSection content={content.about} />
      <MediaGrid content={content.mediaGrid} />
    </>
  )
}
