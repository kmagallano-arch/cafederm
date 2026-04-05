'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/data/products'
import ProductCard from '@/components/shared/ProductCard'
import styles from './product.module.css'

interface Props {
  product: Product
  relatedProducts: Product[]
}

export default function ProductPageClient({ product, relatedProducts }: Props) {
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<string | null>('description')

  // Badge logic
  const badge = product.tags.includes('new') ? 'NEW' : product.tags.includes('best-seller') ? 'BEST SELLER' : null

  // Stars
  const fullStars = Math.floor(product.rating)
  const starsDisplay = '\u2605'.repeat(fullStars) + '\u2606'.repeat(5 - fullStars)

  // Handle add to cart (adds quantity times)
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
  }

  // Toggle accordion
  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  // Accordion sections — only show if content exists
  const accordionSections = [
    { id: 'description', title: 'Description', content: product.description },
    { id: 'ingredients', title: 'Ingredients', content: product.ingredients },
    { id: 'howToUse', title: 'How to Use', content: product.howToUse },
  ].filter(s => s.content)

  const hasImages = product.images.length > 0 && product.images[0] !== '' && !product.images[0].includes('/images/products/')

  return (
    <div className={styles.page}>
      {/* TOP SECTION: Gallery + Info */}
      <div className={styles.topSection}>
        {/* Image Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageContainer}>
            {hasImages ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[selectedImage] || product.images[0]} alt={product.name} className={styles.mainImage} />
            ) : (
              <div className={styles.mainImagePlaceholder}>Product Image</div>
            )}
          </div>
          {hasImages && product.images.length > 1 && (
            <div className={styles.thumbnails}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumbnail} ${i === selectedImage ? styles.thumbnailActive : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={styles.info}>
          {badge && <span className={styles.badge}>{badge}</span>}
          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.priceRow}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          <div className={styles.rating}>
            <span className={styles.stars}>{starsDisplay}</span>
            <span className={styles.reviewCount}>({product.reviewCount} reviews)</span>
          </div>

          <p className={styles.shortDescription}>{product.description}</p>

          {/* Key Benefits */}
          {product.keyBenefits && product.keyBenefits.length > 0 && (
            <div className={styles.benefits}>
              {product.keyBenefits.map((benefit, i) => (
                <div key={i} className={styles.benefitItem}>
                  <span className={styles.benefitIcon}>{'\u2713'}</span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          )}

          {/* Variant Picker */}
          {product.variants && product.variants.length > 0 && product.variants.map((variant, vi) => (
            <div key={vi} className={styles.variantSection}>
              <span className={styles.variantLabel}>{variant.name}</span>
              <div className={styles.variantOptions}>
                {variant.options.map((opt, oi) => (
                  <button key={oi} className={`${styles.variantOption} ${oi === 0 ? styles.variantOptionActive : ''}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity + Add to Cart */}
          <div className={styles.quantityRow}>
            <div className={styles.quantitySelector}>
              <button className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>{'\u2212'}</button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button className={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className={styles.addToCartBtn} onClick={handleAddToCart}>
              ADD TO CART {'\u2014'} {formatPrice(product.price * quantity)}
            </button>
          </div>

          {/* Trust Badges */}
          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <span className={styles.trustIcon}>{'\uD83D\uDE9A'}</span>
              <span>Free Shipping<br/>Over $50</span>
            </div>
            <div className={styles.trustBadge}>
              <span className={styles.trustIcon}>{'\uD83D\uDC30'}</span>
              <span>Cruelty<br/>Free</span>
            </div>
            <div className={styles.trustBadge}>
              <span className={styles.trustIcon}>{'\uD83D\uDD2C'}</span>
              <span>Dermatologist<br/>Tested</span>
            </div>
            <div className={styles.trustBadge}>
              <span className={styles.trustIcon}>{'\uD83C\uDF3F'}</span>
              <span>Clean<br/>Ingredients</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACCORDION SECTIONS */}
      {accordionSections.length > 0 && (
        <div className={styles.accordions}>
          {accordionSections.map(section => (
            <div key={section.id} className={styles.accordion}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === section.id ? styles.accordionHeaderActive : ''}`}
                onClick={() => toggleAccordion(section.id)}
              >
                <span>{section.title}</span>
                <span className={styles.accordionArrow}>{openAccordion === section.id ? '\u2212' : '+'}</span>
              </button>
              {openAccordion === section.id && (
                <div className={styles.accordionBody}>
                  <div className={styles.accordionContent}>
                    {section.content!.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>You May Also Like</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} onQuickAdd={addItem} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
