'use client'

import { useState, useMemo } from 'react'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/data/products'
import ProductCard from '@/components/shared/ProductCard'
import styles from './product.module.css'

interface Props {
  product: Product
  relatedProducts: Product[]
  ritualProducts: Product[]
}

const PLACEHOLDER_REVIEWS = [
  {
    author: 'Sarah M.',
    date: 'March 12, 2026',
    rating: 5,
    text: 'I have been using this for two weeks and can already see a noticeable difference in my skin texture. Lightweight and absorbs quickly without any greasiness.',
  },
  {
    author: 'Jessica L.',
    date: 'February 28, 2026',
    rating: 5,
    text: 'Finally found a product that actually delivers on its promises. My skin looks brighter and more even-toned. Will definitely be repurchasing.',
  },
  {
    author: 'Amanda K.',
    date: 'February 15, 2026',
    rating: 4,
    text: 'Great formula and pleasant texture. I love that it is clean and cruelty-free. Takes a bit to absorb on my oily skin, but results are worth it.',
  },
]

const TRUST_BADGES = [
  { icon: '\uD83D\uDC30', label: 'Cruelty Free' },
  { icon: '\uD83D\uDD2C', label: 'Dermatologist Tested' },
  { icon: '\uD83C\uDF31', label: 'Vegan Friendly' },
  { icon: '\u2705', label: 'Clinically Tested' },
]

const INGREDIENT_DESCRIPTIONS: Record<string, { desc: string; benefits: string[] }> = {
  Caffeine: {
    desc: 'A natural stimulant that boosts circulation and reduces puffiness. Sourced from premium coffee beans for maximum potency.',
    benefits: ['Reduces under-eye puffiness', 'Boosts microcirculation', 'Antioxidant protection'],
  },
  'Vitamin C': {
    desc: 'A powerful antioxidant that brightens skin tone and protects against environmental damage. Stabilized form for optimal absorption.',
    benefits: ['Brightens complexion', 'Fades dark spots', 'Collagen synthesis support'],
  },
  'Hyaluronic Acid': {
    desc: 'A moisture-binding molecule that holds up to 1000x its weight in water. Multi-weight formula for deep and surface hydration.',
    benefits: ['Intense hydration', 'Plumps fine lines', 'Strengthens skin barrier'],
  },
  Niacinamide: {
    desc: 'Also known as Vitamin B3, this powerhouse ingredient minimizes pores and evens skin tone while strengthening the moisture barrier.',
    benefits: ['Minimizes pores', 'Reduces redness', 'Balances oil production'],
  },
  Retinol: {
    desc: 'A gold-standard anti-aging ingredient that accelerates cell turnover and stimulates collagen production for smoother, firmer skin.',
    benefits: ['Reduces fine lines', 'Improves texture', 'Promotes cell renewal'],
  },
  Squalane: {
    desc: 'A plant-derived emollient that mirrors skin natural oils. Lightweight yet deeply nourishing for all skin types.',
    benefits: ['Deep moisturization', 'Non-comedogenic', 'Softens and smooths'],
  },
  Ceramides: {
    desc: 'Essential lipids that form the skin protective barrier. Help lock in moisture and shield against environmental stressors.',
    benefits: ['Barrier repair', 'Moisture retention', 'Protects from irritants'],
  },
  default: {
    desc: 'A carefully selected active ingredient chosen for its proven efficacy and compatibility with all skin types.',
    benefits: ['Targeted treatment', 'Clean formulation', 'Gentle yet effective'],
  },
}

function getIngredientInfo(name: string) {
  const trimmed = name.trim()
  return INGREDIENT_DESCRIPTIONS[trimmed] || INGREDIENT_DESCRIPTIONS.default
}

export default function ProductPageClient({ product, relatedProducts, ritualProducts }: Props) {
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set(['details']))
  const [purchaseType, setPurchaseType] = useState<'one-time' | 'subscribe'>('one-time')
  const [frequency, setFrequency] = useState(30)
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({})
  const [ritualSelected, setRitualSelected] = useState<Set<number>>(() => new Set(ritualProducts.map((_, i) => i)))

  const hasImages = product.images.length > 0 && product.images[0] !== '' && !product.images[0].includes('/images/products/')

  // Stars display
  const fullStars = Math.floor(product.rating)
  const starsDisplay = '\u2605'.repeat(fullStars) + '\u2606'.repeat(5 - fullStars)

  // Subscribe discount
  const discountPct = product.subscribeDiscount || 20
  const subscribePrice = Math.round(product.price * (1 - discountPct / 100))
  const displayPrice = purchaseType === 'subscribe' ? subscribePrice : product.price

  // Parse ingredients for the Key Ingredients section
  const parsedIngredients = useMemo(() => {
    if (!product.ingredients) return []
    return product.ingredients.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
  }, [product.ingredients])

  // Recommended For tags
  const recommendedFor = product.recommendedFor || []

  // Handle add to cart
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }
  }

  // Toggle accordion
  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Ritual total
  const ritualTotal = useMemo(() => {
    let total = 0
    ritualSelected.forEach(i => {
      if (ritualProducts[i]) total += ritualProducts[i].price
    })
    return total
  }, [ritualSelected, ritualProducts])

  const handleRitualToggle = (idx: number) => {
    setRitualSelected(prev => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  const handleAddRitualToCart = () => {
    ritualSelected.forEach(i => {
      if (ritualProducts[i]) {
        addItem(ritualProducts[i])
      }
    })
  }

  // Accordion sections
  const accordionSections = [
    {
      id: 'details',
      title: 'Product Details',
      render: () => (
        <div className={styles.accordionContent}>
          {product.description.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ),
    },
    {
      id: 'benefits',
      title: 'Key Benefits',
      show: !!(product.keyBenefits && product.keyBenefits.length > 0),
      render: () => (
        <div className={styles.accordionContent}>
          <ul className={styles.benefitsList}>
            {product.keyBenefits!.map((b, i) => (
              <li key={i}>
                <span className={styles.benefitCheckmark}>{'\u2713'}</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className={styles.freeFromList}>
            Free from: Parabens, Sulfates, Phthalates, Artificial Fragrances
          </div>
        </div>
      ),
    },
    {
      id: 'recommended',
      title: 'Recommended For',
      show: recommendedFor.length > 0,
      render: () => (
        <div className={styles.accordionContent}>
          <div className={styles.recommendedTags}>
            {recommendedFor.map((tag, i) => (
              <span key={i} className={styles.recommendedTag}>{tag}</span>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'howToUse',
      title: 'How to Use',
      show: !!product.howToUse,
      render: () => (
        <div className={styles.accordionContent}>
          {product.howToUse!.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ),
    },
    {
      id: 'awards',
      title: 'Awards',
      show: !!product.awards,
      render: () => (
        <div className={styles.accordionContent}>
          <p>{product.awards}</p>
        </div>
      ),
    },
  ].filter(s => s.show !== false)

  return (
    <div className={styles.page}>
      {/* ─── SECTION 1: Main Product Area ─── */}
      <div className={styles.topSection}>
        {/* Left: Image Gallery */}
        <div className={styles.galleryWrapper}>
          {hasImages && product.images.length > 1 && (
            <div className={styles.thumbnailStrip}>
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
          <div className={styles.mainImageContainer}>
            {hasImages ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className={styles.mainImage}
              />
            ) : (
              <div className={styles.mainImagePlaceholder}>Product Image</div>
            )}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className={styles.info}>
          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.ratingRow}>
            <span className={styles.stars}>{starsDisplay}</span>
            <span className={styles.reviewCountLink}>{product.reviewCount} reviews</span>
          </div>

          <div className={styles.priceDisplay}>
            {formatPrice(displayPrice)}
            {product.compareAtPrice && (
              <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          {/* Variant Picker */}
          {product.variants && product.variants.length > 0 && product.variants.map((variant, vi) => (
            <div key={vi} className={styles.variantSection}>
              <span className={styles.variantLabel}>{variant.name}</span>
              <div className={styles.variantPills}>
                {variant.options.map((opt, oi) => (
                  <button
                    key={oi}
                    className={`${styles.variantPill} ${(selectedVariants[vi] ?? 0) === oi ? styles.variantPillActive : ''}`}
                    onClick={() => setSelectedVariants(prev => ({ ...prev, [vi]: oi }))}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Purchase Options */}
          <div className={styles.purchaseOptions}>
            <div
              className={`${styles.purchaseOption} ${purchaseType === 'one-time' ? styles.purchaseOptionActive : ''}`}
              onClick={() => setPurchaseType('one-time')}
            >
              <div className={styles.purchaseOptionRadio}>
                <div className={styles.purchaseOptionRadioDot} />
              </div>
              <span className={styles.purchaseOptionLabel}>One-time purchase</span>
              <span className={styles.purchaseOptionPrice}>{formatPrice(product.price)}</span>
            </div>
            <div
              className={`${styles.purchaseOption} ${purchaseType === 'subscribe' ? styles.purchaseOptionActive : ''}`}
              onClick={() => setPurchaseType('subscribe')}
            >
              <div className={styles.purchaseOptionRadio}>
                <div className={styles.purchaseOptionRadioDot} />
              </div>
              <span className={styles.purchaseOptionLabel}>
                Subscribe &amp; Save
                <span className={styles.saveBadge}>Save {discountPct}%</span>
              </span>
              <span className={styles.purchaseOptionPrice}>{formatPrice(subscribePrice)}</span>
            </div>
          </div>

          {purchaseType === 'subscribe' && (
            <div className={styles.subscribeFrequency}>
              <select value={frequency} onChange={e => setFrequency(Number(e.target.value))}>
                <option value={30}>Deliver every 30 days</option>
                <option value={60}>Deliver every 60 days</option>
                <option value={90}>Deliver every 90 days</option>
              </select>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className={styles.quantityRow}>
            <div className={styles.quantitySelector}>
              <button className={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>{'\u2212'}</button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button className={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className={styles.addToCartBtn} onClick={handleAddToCart}>
              ADD TO CART {'\u2014'} {formatPrice(displayPrice * quantity)}
            </button>
          </div>

          {/* Accordions */}
          <div className={styles.accordions}>
            {accordionSections.map(section => (
              <div key={section.id} className={styles.accordion}>
                <button
                  className={styles.accordionHeader}
                  onClick={() => toggleAccordion(section.id)}
                >
                  <span>{section.title}</span>
                  <span className={styles.accordionArrow}>{openAccordions.has(section.id) ? '\u2212' : '+'}</span>
                </button>
                {openAccordions.has(section.id) && (
                  <div className={styles.accordionBody}>
                    {section.render()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: Recommended Ritual ─── */}
      {ritualProducts.length > 0 && (
        <div className={styles.ritualSection}>
          <div className={styles.ritualInner}>
            <div className={styles.ritualHeader}>
              <h2 className={styles.ritualTitle}>Your Recommended Ritual</h2>
              {ritualSelected.size > 0 && (
                <button className={styles.ritualAddAllBtn} onClick={handleAddRitualToCart}>
                  Add {ritualSelected.size} {ritualSelected.size === 1 ? 'Item' : 'Items'} to Cart {'\u2014'} {formatPrice(ritualTotal)}
                </button>
              )}
            </div>
            <div className={styles.ritualGrid}>
              {ritualProducts.slice(0, 4).map((rp, i) => {
                const rpHasImage = rp.images.length > 0 && rp.images[0] !== '' && !rp.images[0].includes('/images/products/')
                return (
                  <div key={rp.id} className={styles.ritualCard}>
                    <span className={styles.ritualStep}>Step {i + 1}</span>
                    <div className={styles.ritualCardImage}>
                      {rpHasImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rp.images[0]} alt={rp.name} />
                      ) : (
                        <span className={styles.ritualCardImagePlaceholder}>Product Image</span>
                      )}
                    </div>
                    <div className={styles.ritualCardBody}>
                      <span className={styles.ritualCardName}>{rp.name}</span>
                      <span className={styles.ritualCardPrice}>{formatPrice(rp.price)}</span>
                    </div>
                    <label className={styles.ritualCheckbox}>
                      <input
                        type="checkbox"
                        checked={ritualSelected.has(i)}
                        onChange={() => handleRitualToggle(i)}
                      />
                      <span>Select Item</span>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── SECTION 3: Trust Badges ─── */}
      <div className={styles.trustSection}>
        <div className={styles.trustGrid}>
          {TRUST_BADGES.map((badge, i) => (
            <div key={i} className={styles.trustBadge}>
              <div className={styles.trustIcon}>{badge.icon}</div>
              <span className={styles.trustLabel}>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 4: Key Ingredients ─── */}
      {parsedIngredients.length > 0 && (
        <div className={styles.ingredientsSection}>
          <div className={styles.ingredientsSectionInner}>
            <div className={styles.ingredientsHeader}>
              <h2 className={styles.ingredientsTitle}>Key Ingredients</h2>
              <button
                className={styles.ingredientsViewAll}
                onClick={() => {
                  setOpenAccordions(prev => { const next = new Set(prev); next.add('details'); return next })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                View Full Ingredient List
              </button>
            </div>
            <div className={styles.ingredientsGrid}>
              {parsedIngredients.map((ingredient, i) => {
                const info = getIngredientInfo(ingredient)
                return (
                  <div key={i} className={styles.ingredientCard}>
                    <div className={styles.ingredientImage}>
                      <span className={styles.ingredientImagePlaceholder}>{ingredient}</span>
                    </div>
                    <h3 className={styles.ingredientName}>{ingredient}</h3>
                    <p className={styles.ingredientDesc}>{info.desc}</p>
                    <ul className={styles.ingredientBenefits}>
                      {info.benefits.map((b, bi) => (
                        <li key={bi}>
                          <span className={styles.ingredientBenefitDot}>{'\u2022'}</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── SECTION 5: Brand Story ─── */}
      <div className={styles.brandSection}>
        <div className={styles.brandImage}>
          <span className={styles.brandImagePlaceholder}>Brand Image</span>
        </div>
        <div className={styles.brandContent}>
          <h2 className={styles.brandTitle}>Clean &amp; Potent Skincare</h2>
          <p className={styles.brandText}>
            At CafeDerm, we believe effective skincare should never compromise on
            safety. Every formula is crafted with clinically-proven concentrations
            of active ingredients, free from parabens, sulfates, and artificial
            fragrances. Our coffee-inspired approach to skincare delivers
            energizing, results-driven products that wake up your skin and reveal
            its natural radiance.
          </p>
          <button className={styles.brandCta}>Learn More</button>
        </div>
      </div>

      {/* ─── SECTION 6: Customer Reviews ─── */}
      <div className={styles.reviewsSection}>
        <div className={styles.reviewsSectionInner}>
          <h2 className={styles.reviewsTitle}>What Our Customers Are Saying</h2>
          <div className={styles.reviewsSummary}>
            <span className={styles.reviewsSummaryStars}>{starsDisplay}</span>
            <span className={styles.reviewsSummaryText}>
              Based on {product.reviewCount} reviews
            </span>
          </div>
          <div className={styles.reviewsGrid}>
            {PLACEHOLDER_REVIEWS.map((review, i) => (
              <div key={i} className={styles.reviewCard}>
                <div className={styles.reviewStars}>
                  {'\u2605'.repeat(review.rating)}{'\u2606'.repeat(5 - review.rating)}
                </div>
                <p className={styles.reviewText}>&ldquo;{review.text}&rdquo;</p>
                <div className={styles.reviewMeta}>
                  <span className={styles.reviewAuthor}>{review.author}</span>
                  <span className={styles.reviewDate}>{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SECTION 7: You May Also Like ─── */}
      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
          <div className={styles.relatedInner}>
            <h2 className={styles.relatedTitle}>You May Also Like</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} onQuickAdd={addItem} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
