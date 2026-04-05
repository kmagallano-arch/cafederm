'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './editor.module.css'

interface DbProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_at_price: number | null
  images: string[]
  category: 'face-care' | 'body-care' | 'bundles'
  tags: string[]
  rating: number
  review_count: number
  in_stock: boolean
  ingredients: string
  how_to_use: string
  key_benefits: string[]
  related_product_ids: string[]
  variants: { name: string; options: string[] }[]
  recommended_for: string[]
  awards: string
  subscribe_discount: number
  ritual_product_ids: string[]
  trust_badges: { icon: string; label: string }[]
  ingredient_images: { name: string; image: string; description: string; benefits: string[] }[]
  brand_story_image: string
  brand_story_title: string
  brand_story_text: string
  sample_reviews: { name: string; rating: number; date: string; text: string }[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function renderStars(rating: number): string {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return '\u2605'.repeat(full) + (half ? '\u00BD' : '') + '\u2606'.repeat(empty)
}

export default function ProductEditorClient({ slug }: { slug: string }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isNew = slug === 'new'

  // Auth state
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Product state
  const [loadingProduct, setLoadingProduct] = useState(!isNew)
  const [notFound, setNotFound] = useState(false)
  const [productId, setProductId] = useState<string | null>(null)

  // All products (for related products picker)
  const [allProducts, setAllProducts] = useState<DbProduct[]>([])

  // Form state
  const [name, setName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [description, setDescription] = useState('')
  const [priceDollars, setPriceDollars] = useState('')
  const [compareAtPriceDollars, setCompareAtPriceDollars] = useState('')
  const [category, setCategory] = useState<'face-care' | 'body-care' | 'bundles'>('face-care')
  const [tagNew, setTagNew] = useState(false)
  const [tagBestSeller, setTagBestSeller] = useState(false)
  const [inStock, setInStock] = useState(true)
  const [rating, setRating] = useState('4.5')
  const [reviewCount, setReviewCount] = useState('0')
  const [images, setImages] = useState<string[]>([])

  // Product details fields
  const [ingredients, setIngredients] = useState('')
  const [howToUse, setHowToUse] = useState('')
  const [keyBenefits, setKeyBenefits] = useState<string[]>([])
  const [newBenefit, setNewBenefit] = useState('')
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([])
  const [recommendedFor, setRecommendedFor] = useState<string[]>([])
  const [newRecommendedFor, setNewRecommendedFor] = useState('')
  const [awards, setAwards] = useState('')
  const [subscribeDiscount, setSubscribeDiscount] = useState('20')

  // New funnel fields
  const [trustBadges, setTrustBadges] = useState<{ icon: string; label: string }[]>([
    { icon: '\uD83D\uDE9A', label: 'Free Shipping\nOver $50' },
    { icon: '\uD83D\uDC30', label: 'Cruelty\nFree' },
    { icon: '\uD83D\uDD2C', label: 'Dermatologist\nTested' },
    { icon: '\uD83C\uDF3F', label: 'Clean\nIngredients' },
  ])
  const [ingredientImages, setIngredientImages] = useState<{ name: string; image: string; description: string; benefits: string[] }[]>([])
  const [brandStoryImage, setBrandStoryImage] = useState('')
  const [brandStoryTitle, setBrandStoryTitle] = useState('Clean & Potent Skincare')
  const [brandStoryText, setBrandStoryText] = useState('')
  const [sampleReviews, setSampleReviews] = useState<{ name: string; rating: number; date: string; text: string }[]>([])

  // UI state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [previewAccordion, setPreviewAccordion] = useState<string | null>('description')

  // Alibaba import state
  const [alibabaUrl, setAlibabaUrl] = useState('')
  const [alibabaImporting, setAlibabaImporting] = useState(false)
  const [alibabaError, setAlibabaError] = useState('')

  // Check session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('cafederm_admin_auth')
    if (saved === 'true') {
      setAuthenticated(true)
    }
    setCheckingSession(false)
  }, [])

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products')
      if (!res.ok) {
        if (!isNew) setNotFound(true)
        return
      }
      const products: DbProduct[] = await res.json()
      setAllProducts(products)

      if (isNew) return

      const product = products.find(p => p.slug === slug)
      if (!product) {
        setNotFound(true)
        return
      }
      setProductId(product.id)
      setName(product.name)
      setFormSlug(product.slug)
      setDescription(product.description)
      setPriceDollars((product.price / 100).toFixed(2))
      setCompareAtPriceDollars(product.compare_at_price ? (product.compare_at_price / 100).toFixed(2) : '')
      setCategory(product.category)
      setTagNew(product.tags.includes('new'))
      setTagBestSeller(product.tags.includes('best-seller'))
      setInStock(product.in_stock)
      setRating(String(product.rating))
      setReviewCount(String(product.review_count))
      setImages(product.images || [])
      setIngredients(product.ingredients || '')
      setHowToUse(product.how_to_use || '')
      setKeyBenefits(product.key_benefits || [])
      setRelatedProductIds(product.related_product_ids || [])
      setRecommendedFor(product.recommended_for || [])
      setAwards(product.awards || '')
      setSubscribeDiscount(String(product.subscribe_discount || 20))
      // New fields
      if (product.trust_badges?.length) setTrustBadges(product.trust_badges)
      if (product.ingredient_images?.length) setIngredientImages(product.ingredient_images)
      if (product.brand_story_image) setBrandStoryImage(product.brand_story_image)
      if (product.brand_story_title) setBrandStoryTitle(product.brand_story_title)
      if (product.brand_story_text) setBrandStoryText(product.brand_story_text)
      if (product.sample_reviews?.length) setSampleReviews(product.sample_reviews)
    } catch {
      if (!isNew) setNotFound(true)
    } finally {
      setLoadingProduct(false)
    }
  }, [slug, isNew])

  useEffect(() => {
    if (authenticated) {
      fetchProduct()
    }
  }, [authenticated, fetchProduct])

  // Auto-generate slug from name for new products
  function handleNameChange(value: string) {
    setName(value)
    if (isNew) {
      setFormSlug(slugify(value))
    }
  }

  // Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        sessionStorage.setItem('cafederm_admin_auth', 'true')
        setAuthenticated(true)
      } else {
        setLoginError('Invalid password')
      }
    } catch {
      setLoginError('Connection error')
    } finally {
      setLoginLoading(false)
    }
  }

  // Image upload
  async function uploadFile(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        alert(`Upload failed: ${err.error}`)
        return
      }
      const data = await res.json()
      setImages(prev => [...prev, data.url])
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      uploadFile(file)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(true)
  }

  function handleDragLeave() {
    setDragActive(false)
  }

  // Paste image from clipboard (Cmd+V / Ctrl+V)
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) uploadFile(file)
          return
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null)
  const [enhancePrompt, setEnhancePrompt] = useState('')
  const [showEnhancePrompt, setShowEnhancePrompt] = useState<number | null>(null)
  const [generatePrompt, setGeneratePrompt] = useState('')
  const [generating, setGenerating] = useState(false)

  async function enhanceImage(index: number) {
    const url = images[index]
    if (!url) return
    setEnhancingIndex(index)
    try {
      const res = await fetch('/api/admin/enhance-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url, prompt: enhancePrompt || undefined }),
        signal: AbortSignal.timeout(120000),
      })
      const data = await res.json()
      if (data.enhancedUrl) {
        setImages(prev => prev.map((u, i) => i === index ? data.enhancedUrl : u))
        setShowEnhancePrompt(null)
        setEnhancePrompt('')
      } else if (data.error) {
        alert(`Enhancement failed: ${data.error}`)
      }
    } catch {
      alert('Enhancement failed — try again')
    }
    setEnhancingIndex(null)
  }

  // Generate new image based on product details + existing images
  async function generateNewImage() {
    setGenerating(true)
    try {
      const referenceImage = images.length > 0 ? images[0] : null
      const productContext = `Product: ${name}. Description: ${description}. Category: ${category}.`
      const prompt = generatePrompt
        ? `${generatePrompt}. Context: ${productContext}`
        : `Generate a professional product photography image for a skincare product called "${name}" by CafeDerm. ${description}. Clean white background, luxury aesthetic, high quality commercial photography. No text on the image.`

      const res = await fetch('/api/admin/enhance-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: referenceImage || undefined,
          prompt,
          generateNew: !referenceImage,
        }),
        signal: AbortSignal.timeout(120000),
      })
      const data = await res.json()
      if (data.enhancedUrl) {
        setImages(prev => [...prev, data.enhancedUrl])
        setGeneratePrompt('')
      } else if (data.error) {
        alert(`Generation failed: ${data.error}`)
      }
    } catch {
      alert('Generation failed — try again')
    }
    setGenerating(false)
  }

  // Key benefits helpers
  function addBenefit() {
    const trimmed = newBenefit.trim()
    if (trimmed && !keyBenefits.includes(trimmed)) {
      setKeyBenefits(prev => [...prev, trimmed])
      setNewBenefit('')
    }
  }

  function removeBenefit(index: number) {
    setKeyBenefits(prev => prev.filter((_, i) => i !== index))
  }

  function handleBenefitKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addBenefit()
    }
  }

  // Recommended For helpers
  function addRecommendedFor() {
    const trimmed = newRecommendedFor.trim()
    if (trimmed && !recommendedFor.includes(trimmed)) {
      setRecommendedFor(prev => [...prev, trimmed])
      setNewRecommendedFor('')
    }
  }

  function removeRecommendedFor(index: number) {
    setRecommendedFor(prev => prev.filter((_, i) => i !== index))
  }

  // Alibaba import — auto-fills all fields
  const handleAlibabaImport = async () => {
    if (!alibabaUrl) return
    setAlibabaImporting(true)
    setAlibabaError('')
    try {
      const res = await fetch('/api/admin/auto-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: alibabaUrl, category }),
        signal: AbortSignal.timeout(300000),
      })
      const data = await res.json()
      if (data.error) {
        setAlibabaError(data.error)
        return
      }

      // Auto-fill all form fields from the imported data
      const pd = data.product || data.productData
      if (pd) {
        if (pd.name) {
          setName(pd.name)
          if (isNew) setFormSlug(slugify(pd.name))
        }
        if (pd.description) setDescription(pd.description)
        if (pd.price) setPriceDollars((pd.price / 100).toFixed(2))
        if (pd.ingredients) setIngredients(pd.ingredients)
        if (pd.how_to_use) setHowToUse(pd.how_to_use)
        if (pd.howToUse) setHowToUse(pd.howToUse)
        if (pd.key_benefits?.length) setKeyBenefits(pd.key_benefits)
        if (pd.keyBenefits?.length) setKeyBenefits(pd.keyBenefits)
        if (pd.tags?.includes('new')) setTagNew(true)
        if (pd.tags?.includes('best-seller')) setTagBestSeller(true)
        // Images from auto-import (if available)
        if (pd.images?.length > 0) {
          setImages(prev => [...prev.filter((u: string) => u), ...pd.images])
        }
      }
    } catch (e) {
      setAlibabaError(e instanceof Error ? e.message : 'Import failed')
    }
    setAlibabaImporting(false)
  }

  // Related products toggle
  function toggleRelatedProduct(id: string) {
    setRelatedProductIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    )
  }

  // Trust badge helpers
  function updateTrustBadge(index: number, field: 'icon' | 'label', value: string) {
    setTrustBadges(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b))
  }

  function removeTrustBadge(index: number) {
    setTrustBadges(prev => prev.filter((_, i) => i !== index))
  }

  function addTrustBadge() {
    setTrustBadges(prev => [...prev, { icon: '', label: '' }])
  }

  // Ingredient images helpers
  function updateIngredientImage(index: number, field: string, value: string | string[]) {
    setIngredientImages(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function removeIngredientImage(index: number) {
    setIngredientImages(prev => prev.filter((_, i) => i !== index))
  }

  function addIngredientImage() {
    setIngredientImages(prev => [...prev, { name: '', image: '', description: '', benefits: [] }])
  }

  // Sample reviews helpers
  function updateSampleReview(index: number, field: string, value: string | number) {
    setSampleReviews(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function removeSampleReview(index: number) {
    setSampleReviews(prev => prev.filter((_, i) => i !== index))
  }

  function addSampleReview() {
    setSampleReviews(prev => [...prev, { name: '', rating: 5, date: '', text: '' }])
  }

  // Scroll to form section
  function scrollToFormSection(sectionId: string) {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Save
  async function handleSave() {
    if (!name.trim() || !formSlug.trim()) {
      alert('Name and slug are required')
      return
    }
    setSaving(true)
    setSaved(false)

    const tags: string[] = []
    if (tagNew) tags.push('new')
    if (tagBestSeller) tags.push('best-seller')

    const priceInCents = Math.round(parseFloat(priceDollars || '0') * 100)
    const compareAtPriceInCents = compareAtPriceDollars
      ? Math.round(parseFloat(compareAtPriceDollars) * 100)
      : null

    const payload: Record<string, unknown> = {
      name: name.trim(),
      slug: formSlug.trim(),
      description: description.trim(),
      price: priceInCents,
      compare_at_price: compareAtPriceInCents,
      category,
      tags,
      in_stock: inStock,
      rating: parseFloat(rating) || 0,
      review_count: parseInt(reviewCount) || 0,
      images: images.length > 0 ? images : ['/images/products/placeholder.jpg'],
      ingredients: ingredients.trim(),
      how_to_use: howToUse.trim(),
      key_benefits: keyBenefits,
      related_product_ids: relatedProductIds,
      recommended_for: recommendedFor,
      awards: awards.trim(),
      subscribe_discount: parseInt(subscribeDiscount) || 20,
      trust_badges: trustBadges,
      ingredient_images: ingredientImages,
      brand_story_image: brandStoryImage.trim(),
      brand_story_title: brandStoryTitle.trim(),
      brand_story_text: brandStoryText.trim(),
      sample_reviews: sampleReviews,
    }

    try {
      if (isNew) {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json()
          alert(`Error: ${err.error}`)
          return
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.push(`/admin/products/${formSlug.trim()}`)
      } else {
        payload.id = productId
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json()
          alert(`Error: ${err.error}`)
          return
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      alert('Network error')
    } finally {
      setSaving(false)
    }
  }

  // Delete
  async function handleDelete() {
    if (!productId) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(`Error: ${err.error}`)
        return
      }
      router.push('/admin')
    } catch {
      alert('Network error')
    } finally {
      setDeleting(false)
    }
  }

  // Preview computed values
  const previewPrice = parseFloat(priceDollars || '0')
  const previewComparePrice = parseFloat(compareAtPriceDollars || '0')
  const previewRating = parseFloat(rating || '0')
  const previewReviewCount = parseInt(reviewCount || '0')
  const previewImage = images.length > 0 ? images[0] : null
  const previewBadge = tagNew ? 'NEW' : tagBestSeller ? 'BEST SELLER' : null

  // Preview accordion sections
  const previewAccordions = [
    { id: 'description', title: 'Product Details', content: description },
    { id: 'benefits', title: 'Key Benefits', content: keyBenefits.length > 0 ? keyBenefits.join(', ') : '' },
    { id: 'recommended', title: 'Recommended For', content: recommendedFor.length > 0 ? recommendedFor.join(', ') : '' },
    { id: 'howToUse', title: 'How to Use', content: howToUse },
    { id: 'awards', title: 'Awards', content: awards },
  ].filter(s => s.content.trim())

  // Other products for related picker (exclude current)
  const otherProducts = allProducts.filter(p => p.id !== productId)

  // Render states

  if (checkingSession) {
    return <div className={styles.loading}>Loading...</div>
  }

  if (!authenticated) {
    return (
      <div className={styles.loginPage}>
        <form className={styles.loginCard} onSubmit={handleLogin}>
          <h1 className={styles.loginTitle}>CafeDerm Admin</h1>
          {loginError && <div className={styles.loginError}>{loginError}</div>}
          <input
            type="password"
            className={styles.loginInput}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" className={styles.loginBtn} disabled={loginLoading || !password}>
            {loginLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    )
  }

  if (loadingProduct) {
    return <div className={styles.loading}>Loading product...</div>
  }

  if (notFound) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundTitle}>Product not found</div>
        <button className={styles.notFoundBack} onClick={() => router.push('/admin')}>
          Back to Admin
        </button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/admin')}>
            &larr; Back
          </button>
          <span className={styles.topBarTitle}>
            {isNew ? 'New Product' : name || 'Edit Product'}
          </span>
        </div>
        <div className={styles.topBarActions}>
          {saved && <span className={styles.savedMsg}>Saved!</span>}
          {!isNew && (
            <button
              className={styles.previewBtn}
              onClick={() => window.open(`/products/${formSlug}`, '_blank')}
            >
              Preview ↗
            </button>
          )}
          {!isNew && (
            <button
              className={styles.deleteBtn}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </button>
          )}
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        {/* Left - Editor */}
        <div className={styles.editor}>
          {/* Alibaba Import — at the very top */}
          <div className={styles.alibabaImportSection}>
            <div className={styles.alibabaImportTitle}>Import from Alibaba</div>
            <p className={styles.alibabaImportDesc}>Paste a product URL to auto-fill name, description, ingredients, and benefits. Copy images from the Alibaba page and paste here with Cmd+V.</p>
            <div className={styles.alibabaImportRow}>
              <input
                type="url"
                className={styles.alibabaImportInput}
                placeholder="https://www.alibaba.com/product-detail/..."
                value={alibabaUrl}
                onChange={(e) => setAlibabaUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAlibabaImport() } }}
              />
              <button
                className={styles.alibabaImportBtn}
                onClick={handleAlibabaImport}
                disabled={alibabaImporting || !alibabaUrl}
              >
                {alibabaImporting ? 'Importing...' : 'Import'}
              </button>
            </div>
            {alibabaImporting && (
              <div className={styles.alibabaImportProgress}>
                Scraping product data and images...
              </div>
            )}
            {alibabaError && (
              <div className={styles.alibabaImportError}>{alibabaError}</div>
            )}
          </div>

          {/* Basic info */}
          <div id="section-basic" className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Basic Information</div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Product Name</label>
              <input
                className={styles.formInput}
                type="text"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. CafeDerm Moisturizer"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>URL Slug</label>
              <input
                className={styles.formInput}
                type="text"
                value={formSlug}
                onChange={e => setFormSlug(e.target.value)}
                placeholder="e.g. cafederm-moisturizer"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                className={styles.formTextarea}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Product description..."
              />
            </div>
          </div>

          {/* Product Details */}
          <div id="section-details" className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Product Details</div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ingredients (comma-separated for Key Ingredients display)</label>
              <textarea
                className={styles.formTextarea}
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
                placeholder="Caffeine, Vitamin C, Hyaluronic Acid..."
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>How to Use</label>
              <textarea
                className={styles.formTextarea}
                value={howToUse}
                onChange={e => setHowToUse(e.target.value)}
                placeholder="Usage instructions..."
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Key Benefits</label>
              {keyBenefits.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  {keyBenefits.map((benefit, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--brown)' }}>
                      <span>{'\u2713'} {benefit}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(i)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e74c3c',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '0 4px',
                          lineHeight: 1,
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className={styles.formInput}
                  type="text"
                  value={newBenefit}
                  onChange={e => setNewBenefit(e.target.value)}
                  onKeyDown={handleBenefitKeyDown}
                  placeholder="Add a benefit and press Enter"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--brown-dark)',
                    color: 'var(--cream)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase' as const,
                    flexShrink: 0,
                  }}
                >
                  Add
                </button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Recommended For</label>
              {recommendedFor.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {recommendedFor.map((tag, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: 'var(--cream-dark)', padding: '4px 10px', borderRadius: '12px',
                      fontSize: '12px', color: 'var(--brown-dark)',
                    }}>
                      {tag}
                      <button type="button" onClick={() => removeRecommendedFor(i)} style={{
                        background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer',
                        fontSize: '12px', padding: '0 2px', lineHeight: 1,
                      }}>&times;</button>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className={styles.formInput}
                  type="text"
                  value={newRecommendedFor}
                  onChange={e => setNewRecommendedFor(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRecommendedFor() } }}
                  placeholder="e.g. Oily Skin, Acne-Prone"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={addRecommendedFor} style={{
                  padding: '8px 16px', background: 'var(--brown-dark)', color: 'var(--cream)',
                  border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '1px',
                  textTransform: 'uppercase' as const, flexShrink: 0,
                }}>Add</button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Awards</label>
              <textarea
                className={styles.formTextarea}
                value={awards}
                onChange={e => setAwards(e.target.value)}
                placeholder="Awards and recognitions..."
                style={{ minHeight: '60px' }}
              />
            </div>
          </div>

          {/* Pricing */}
          <div id="section-pricing" className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Pricing</div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Price ($)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceDollars}
                  onChange={e => setPriceDollars(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Compare-at Price ($)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  step="0.01"
                  min="0"
                  value={compareAtPriceDollars}
                  onChange={e => setCompareAtPriceDollars(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Subscribe & Save Discount (%)</label>
              <input
                className={styles.formInput}
                type="number"
                min="0"
                max="100"
                value={subscribeDiscount}
                onChange={e => setSubscribeDiscount(e.target.value)}
                placeholder="20"
              />
            </div>
          </div>

          {/* Organization */}
          <div className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Organization</div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category</label>
              <select
                className={styles.formSelect}
                value={category}
                onChange={e => setCategory(e.target.value as typeof category)}
              >
                <option value="face-care">Face Care</option>
                <option value="body-care">Body Care</option>
                <option value="bundles">Bundles</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tags</label>
              <div className={styles.formCheckboxRow}>
                <label className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    checked={tagNew}
                    onChange={e => setTagNew(e.target.checked)}
                  />
                  New
                </label>
                <label className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    checked={tagBestSeller}
                    onChange={e => setTagBestSeller(e.target.checked)}
                  />
                  Best Seller
                </label>
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.toggleRow}>
                <label className={styles.formLabel} style={{ marginBottom: 0 }}>In Stock</label>
                <button
                  type="button"
                  className={`${styles.toggle} ${inStock ? styles.toggleOn : ''}`}
                  onClick={() => setInStock(!inStock)}
                />
              </div>
            </div>
          </div>

          {/* Reviews Summary */}
          <div id="section-reviews-summary" className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Reviews Summary</div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Rating (0-5)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={rating}
                  onChange={e => setRating(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Review Count</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min="0"
                  value={reviewCount}
                  onChange={e => setReviewCount(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div id="section-images" className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Images</div>

            <div className={styles.imageSection}>
              {images.length > 0 && (
                <div className={styles.imageGrid}>
                  {images.map((url, i) => (
                    <div key={i} className={styles.imageItemWrapper}>
                      <div className={styles.imageItem}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Product image ${i + 1}`} />
                        <button
                          className={styles.imageRemoveBtn}
                          onClick={() => removeImage(i)}
                          type="button"
                        >
                          &times;
                        </button>
                        <button
                          className={styles.imageEnhanceBtn}
                          onClick={() => {
                            if (showEnhancePrompt === i) {
                              setShowEnhancePrompt(null)
                            } else {
                              setShowEnhancePrompt(i)
                              setEnhancePrompt('')
                            }
                          }}
                          type="button"
                          disabled={enhancingIndex !== null}
                        >
                          {enhancingIndex === i ? '...' : '\u2728'}
                        </button>
                      </div>
                      {showEnhancePrompt === i && (
                        <div className={styles.enhancePromptBox}>
                          <textarea
                            className={styles.enhancePromptInput}
                            placeholder="Tell AI what to do, e.g. 'Replace brand name with CafeDerm, keep everything else the same' or 'Remove background and add white background'"
                            value={enhancePrompt}
                            onChange={e => setEnhancePrompt(e.target.value)}
                            rows={3}
                          />
                          <button
                            className={styles.enhancePromptBtn}
                            onClick={() => enhanceImage(i)}
                            disabled={enhancingIndex !== null}
                          >
                            {enhancingIndex === i ? 'Enhancing...' : 'Enhance'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div
                className={`${styles.uploadArea} ${dragActive ? styles.uploadAreaActive : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className={styles.uploadIcon}>+</div>
                <div className={styles.uploadText}>
                  {uploading ? 'Uploading...' : 'Click, drag, or paste (Cmd+V) image'}
                </div>
                {uploading && <div className={styles.uploadProgress}>Please wait...</div>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {/* Generate new image with AI */}
              <div className={styles.generateSection}>
                <div className={styles.generateTitle}>Generate New Image with AI</div>
                <textarea
                  className={styles.generateInput}
                  placeholder={`Describe the image you want, e.g. "CafeDerm serum bottle with coffee beans on marble surface" or "Before and after skin comparison" or "Product being applied to face"`}
                  value={generatePrompt}
                  onChange={e => setGeneratePrompt(e.target.value)}
                  rows={3}
                />
                <button
                  className={styles.generateBtn}
                  onClick={generateNewImage}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : '\u2728 Generate Image'}
                </button>
                {images.length > 0 && (
                  <p className={styles.generateHint}>
                    Uses the first uploaded image as reference for style consistency
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div id="section-trust-badges" className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Trust Badges</div>
            <div className={styles.badgeEditor}>
              {trustBadges.map((badge, i) => (
                <div key={i} className={styles.badgeRow}>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={badge.icon}
                    onChange={e => updateTrustBadge(i, 'icon', e.target.value)}
                    placeholder="Icon"
                    style={{ textAlign: 'center', fontSize: '18px', padding: '6px' }}
                  />
                  <input
                    className={styles.formInput}
                    type="text"
                    value={badge.label}
                    onChange={e => updateTrustBadge(i, 'label', e.target.value)}
                    placeholder="Label text"
                  />
                  <button type="button" className={styles.badgeRowRemove} onClick={() => removeTrustBadge(i)}>&times;</button>
                </div>
              ))}
              <button type="button" className={styles.addItemBtn} onClick={addTrustBadge}>+ Add Badge</button>
            </div>
          </div>

          {/* Key Ingredients (with images) */}
          <div id="section-ingredients" className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Key Ingredients (Cards)</div>
            <p style={{ fontSize: '11px', color: 'var(--brown-light)', marginBottom: '12px' }}>
              These are the visual ingredient cards shown below the product. The comma-separated ingredients above are used for accordion text.
            </p>
            <div className={styles.ingredientEditor}>
              {ingredientImages.map((item, i) => (
                <div key={i} className={styles.ingredientEntry}>
                  <div className={styles.ingredientEntryHeader}>
                    <span className={styles.ingredientEntryTitle}>Ingredient {i + 1}</span>
                    <button type="button" className={styles.ingredientEntryRemove} onClick={() => removeIngredientImage(i)}>&times;</button>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Name</label>
                    <input className={styles.formInput} type="text" value={item.name}
                      onChange={e => updateIngredientImage(i, 'name', e.target.value)} placeholder="e.g. Caffeine" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Image URL</label>
                    <input className={styles.formInput} type="text" value={item.image}
                      onChange={e => updateIngredientImage(i, 'image', e.target.value)} placeholder="https://..." />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description</label>
                    <textarea className={styles.formTextarea} value={item.description}
                      onChange={e => updateIngredientImage(i, 'description', e.target.value)}
                      placeholder="Ingredient description..." style={{ minHeight: '60px' }} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Benefits (comma-separated)</label>
                    <input className={styles.formInput} type="text"
                      value={item.benefits.join(', ')}
                      onChange={e => updateIngredientImage(i, 'benefits', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      placeholder="Reduces puffiness, Boosts circulation" />
                  </div>
                </div>
              ))}
              <button type="button" className={styles.addItemBtn} onClick={addIngredientImage}>+ Add Ingredient Card</button>
            </div>
          </div>

          {/* Brand Story */}
          <div id="section-brand-story" className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Brand Story</div>
            <div className={styles.brandStoryEditor}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Image URL</label>
                <input className={styles.formInput} type="text" value={brandStoryImage}
                  onChange={e => setBrandStoryImage(e.target.value)} placeholder="https://..." />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input className={styles.formInput} type="text" value={brandStoryTitle}
                  onChange={e => setBrandStoryTitle(e.target.value)} placeholder="Clean & Potent Skincare" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Text</label>
                <textarea className={styles.formTextarea} value={brandStoryText}
                  onChange={e => setBrandStoryText(e.target.value)}
                  placeholder="Brand story text..." style={{ minHeight: '120px' }} />
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div id="section-reviews" className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Customer Reviews</div>
            <div className={styles.reviewEditor}>
              {sampleReviews.map((review, i) => (
                <div key={i} className={styles.reviewEntry}>
                  <div className={styles.reviewEntryHeader}>
                    <span className={styles.reviewEntryTitle}>Review {i + 1}</span>
                    <button type="button" className={styles.reviewEntryRemove} onClick={() => removeSampleReview(i)}>&times;</button>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Name</label>
                      <input className={styles.formInput} type="text" value={review.name}
                        onChange={e => updateSampleReview(i, 'name', e.target.value)} placeholder="Sarah M." />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Rating (1-5)</label>
                      <input className={styles.formInput} type="number" min="1" max="5" value={review.rating}
                        onChange={e => updateSampleReview(i, 'rating', parseInt(e.target.value) || 5)} />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Date</label>
                    <input className={styles.formInput} type="text" value={review.date}
                      onChange={e => updateSampleReview(i, 'date', e.target.value)} placeholder="March 12, 2026" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Review Text</label>
                    <textarea className={styles.formTextarea} value={review.text}
                      onChange={e => updateSampleReview(i, 'text', e.target.value)}
                      placeholder="Review text..." style={{ minHeight: '60px' }} />
                  </div>
                </div>
              ))}
              <button type="button" className={styles.addItemBtn} onClick={addSampleReview}>+ Add Review</button>
            </div>
          </div>

          {/* Related Products */}
          <div id="section-related" className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Related Products</div>
            {otherProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {otherProducts.map(p => (
                  <label
                    key={p.id}
                    className={styles.formCheckbox}
                    style={{ padding: '6px 0' }}
                  >
                    <input
                      type="checkbox"
                      checked={relatedProductIds.includes(p.id)}
                      onChange={() => toggleRelatedProduct(p.id)}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--gray)' }}>
                No other products available
              </div>
            )}
          </div>
        </div>

        {/* Right - Full Funnel Preview */}
        <div className={styles.preview}>
          <div className={styles.previewLabel}>Full Funnel Preview</div>
          <div className={styles.previewCard}>
            <div className={styles.funnelPreview}>

              {/* 1. Gallery Preview */}
              <div className={styles.funnelSection} style={{ padding: 0 }}>
                <div style={{ position: 'relative' }}>
                  <div className={styles.funnelSectionLabel} style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, margin: 0 }}>
                    <button className={styles.funnelEditLink} onClick={() => scrollToFormSection('section-images')}>Edit</button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', padding: '12px' }}>
                    {images.length > 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '48px', flexShrink: 0 }}>
                        {images.slice(0, 5).map((img, i) => (
                          <div key={i} style={{
                            width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden',
                            border: i === 0 ? '2px solid var(--brown-dark)' : '1px solid var(--cream-dark)',
                          }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{
                      flex: 1, aspectRatio: '1', background: '#f0ebe5', borderRadius: '8px',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {previewImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewImage} alt={name || 'Product'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'var(--brown-light)', fontSize: '14px' }}>No image</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Product Info Preview */}
              <div className={styles.funnelSection} style={{ padding: '16px' }}>
                <div className={styles.funnelSectionLabel}>
                  <span className={styles.funnelSectionLabelText}>Product Info</span>
                  <button className={styles.funnelEditLink} onClick={() => scrollToFormSection('section-basic')}>Edit</button>
                </div>
                {previewBadge && (
                  <span className={styles.previewBadge}>{previewBadge}</span>
                )}
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: 'var(--brown-dark)', marginBottom: '6px' }}>
                  {name || 'Product Name'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--brown-light)', marginBottom: '6px' }}>
                  {renderStars(previewRating)} ({previewReviewCount} reviews)
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--brown-dark)' }}>${previewPrice.toFixed(2)}</span>
                  {previewComparePrice > 0 && previewComparePrice > previewPrice && (
                    <span style={{ fontSize: '13px', color: 'var(--gray)', textDecoration: 'line-through' }}>${previewComparePrice.toFixed(2)}</span>
                  )}
                </div>
                {/* Subscribe option */}
                <div style={{
                  display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '11px',
                }}>
                  <span style={{
                    padding: '4px 10px', border: '1px solid var(--brown-dark)', borderRadius: '4px',
                    color: 'var(--brown-dark)', fontWeight: 500,
                  }}>One-time</span>
                  <span style={{
                    padding: '4px 10px', border: '1px solid var(--cream-dark)', borderRadius: '4px',
                    color: 'var(--brown-light)',
                  }}>Subscribe & Save {subscribeDiscount}%</span>
                </div>
                {/* Quantity + ATC */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', border: '1px solid var(--cream-dark)',
                    borderRadius: '6px', overflow: 'hidden',
                  }}>
                    <span style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--brown-light)' }}>{'\u2212'}</span>
                    <span style={{ padding: '6px 8px', fontSize: '12px', fontWeight: 500 }}>1</span>
                    <span style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--brown-light)' }}>+</span>
                  </div>
                  <div style={{
                    flex: 1, padding: '10px', background: 'var(--brown-dark)', color: 'var(--cream)',
                    fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600,
                    textAlign: 'center', borderRadius: '6px',
                  }}>
                    ADD TO CART &mdash; ${previewPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* 3. Accordions Preview */}
              <div className={styles.funnelSection} style={{ padding: '0 16px 16px' }}>
                <div className={styles.funnelSectionLabel}>
                  <span className={styles.funnelSectionLabelText}>Accordions</span>
                  <button className={styles.funnelEditLink} onClick={() => scrollToFormSection('section-details')}>Edit</button>
                </div>
                {previewAccordions.length > 0 ? (
                  <div style={{ borderTop: '1px solid #eee' }}>
                    {previewAccordions.map(section => (
                      <div key={section.id} style={{ borderBottom: '1px solid #eee' }}>
                        <button
                          onClick={() => setPreviewAccordion(previewAccordion === section.id ? null : section.id)}
                          style={{
                            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 0', background: 'none', border: 'none', fontSize: '11px', fontWeight: 500,
                            color: 'var(--brown-dark)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                          }}
                        >
                          <span>{section.title}</span>
                          <span style={{ color: 'var(--brown-light)', fontSize: '13px' }}>
                            {previewAccordion === section.id ? '\u2212' : '+'}
                          </span>
                        </button>
                        {previewAccordion === section.id && (
                          <div style={{ padding: '0 0 10px', fontSize: '11px', lineHeight: 1.6, color: 'var(--brown)', whiteSpace: 'pre-wrap' }}>
                            {section.id === 'benefits' && keyBenefits.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {keyBenefits.map((b, i) => (
                                  <div key={i} style={{ display: 'flex', gap: '6px' }}>
                                    <span style={{ color: 'var(--brown-dark)', fontWeight: 700 }}>{'\u2713'}</span>
                                    <span>{b}</span>
                                  </div>
                                ))}
                              </div>
                            ) : section.id === 'recommended' && recommendedFor.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {recommendedFor.map((tag, i) => (
                                  <span key={i} style={{
                                    padding: '3px 8px', background: 'var(--cream)', borderRadius: '10px',
                                    fontSize: '10px', color: 'var(--brown-dark)',
                                  }}>{tag}</span>
                                ))}
                              </div>
                            ) : (
                              section.content
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--brown-light)', fontStyle: 'italic' }}>
                    No accordion content set
                  </div>
                )}
              </div>

              {/* 4. Trust Badges Preview */}
              <div className={styles.funnelSection} style={{ padding: '16px' }}>
                <div className={styles.funnelSectionLabel}>
                  <span className={styles.funnelSectionLabelText}>Trust Badges</span>
                  <button className={styles.funnelEditLink} onClick={() => scrollToFormSection('section-trust-badges')}>Edit</button>
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: `repeat(${Math.min(trustBadges.length, 4)}, 1fr)`,
                  gap: '8px', textAlign: 'center',
                }}>
                  {trustBadges.map((badge, i) => (
                    <div key={i} style={{ fontSize: '9px', color: 'var(--brown)', lineHeight: 1.3 }}>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{badge.icon}</div>
                      <div style={{ whiteSpace: 'pre-line' }}>{badge.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Key Ingredients Preview */}
              <div className={styles.funnelSection} style={{ padding: '16px' }}>
                <div className={styles.funnelSectionLabel}>
                  <span className={styles.funnelSectionLabelText}>Key Ingredients</span>
                  <button className={styles.funnelEditLink} onClick={() => scrollToFormSection('section-ingredients')}>Edit</button>
                </div>
                {ingredientImages.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(ingredientImages.length, 3)}, 1fr)`, gap: '10px' }}>
                    {ingredientImages.map((item, i) => (
                      <div key={i} style={{
                        background: 'var(--cream)', borderRadius: '8px', overflow: 'hidden',
                        border: '1px solid var(--cream-dark)',
                      }}>
                        <div style={{
                          height: '60px', background: '#f0ebe5', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        }}>
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '10px', color: 'var(--brown-light)' }}>{item.name || 'Image'}</span>
                          )}
                        </div>
                        <div style={{ padding: '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brown-dark)', marginBottom: '3px' }}>
                            {item.name || 'Ingredient'}
                          </div>
                          <div style={{ fontSize: '9px', color: 'var(--brown)', lineHeight: 1.4 }}>
                            {item.description ? item.description.slice(0, 60) + (item.description.length > 60 ? '...' : '') : 'No description'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--brown-light)', fontStyle: 'italic' }}>
                    {ingredients ? `Auto-generated from: ${ingredients.split(',').slice(0, 3).join(', ')}` : 'No ingredient cards set'}
                  </div>
                )}
              </div>

              {/* 6. Brand Story Preview */}
              <div className={styles.funnelSection} style={{ padding: '16px' }}>
                <div className={styles.funnelSectionLabel}>
                  <span className={styles.funnelSectionLabelText}>Brand Story</span>
                  <button className={styles.funnelEditLink} onClick={() => scrollToFormSection('section-brand-story')}>Edit</button>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '8px', background: '#f0ebe5',
                    flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {brandStoryImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={brandStoryImage} alt="Brand" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '9px', color: 'var(--brown-light)' }}>Image</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown-dark)', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
                      {brandStoryTitle || 'Brand Story Title'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--brown)', lineHeight: 1.5 }}>
                      {brandStoryText ? brandStoryText.slice(0, 120) + (brandStoryText.length > 120 ? '...' : '') : 'Add brand story text...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. Reviews Preview */}
              <div className={styles.funnelSection} style={{ padding: '16px' }}>
                <div className={styles.funnelSectionLabel}>
                  <span className={styles.funnelSectionLabelText}>Customer Reviews</span>
                  <button className={styles.funnelEditLink} onClick={() => scrollToFormSection('section-reviews')}>Edit</button>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--brown-dark)' }}>{renderStars(previewRating)}</div>
                  <div style={{ fontSize: '10px', color: 'var(--brown-light)' }}>Based on {previewReviewCount} reviews</div>
                </div>
                {sampleReviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sampleReviews.slice(0, 3).map((review, i) => (
                      <div key={i} style={{
                        background: 'var(--cream)', borderRadius: '6px', padding: '10px',
                        border: '1px solid var(--cream-dark)',
                      }}>
                        <div style={{ fontSize: '11px', color: 'var(--brown-dark)', marginBottom: '4px' }}>
                          {'\u2605'.repeat(review.rating)}{'\u2606'.repeat(5 - review.rating)}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--brown)', lineHeight: 1.4, marginBottom: '4px' }}>
                          &ldquo;{review.text ? review.text.slice(0, 80) + (review.text.length > 80 ? '...' : '') : 'Review text'}&rdquo;
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--brown-light)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{review.name || 'Reviewer'}</span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--brown-light)', fontStyle: 'italic', textAlign: 'center' }}>
                    No sample reviews added
                  </div>
                )}
              </div>

              {/* 8. Related Products Preview */}
              <div className={styles.funnelSection} style={{ padding: '16px', borderBottom: 'none' }}>
                <div className={styles.funnelSectionLabel}>
                  <span className={styles.funnelSectionLabelText}>You May Also Like</span>
                  <button className={styles.funnelEditLink} onClick={() => scrollToFormSection('section-related')}>Edit</button>
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
                }}>
                  {relatedProductIds.length > 0 ? (
                    relatedProductIds.slice(0, 4).map((id, i) => {
                      const rp = allProducts.find(p => p.id === id)
                      return (
                        <div key={i} style={{
                          background: 'var(--cream)', borderRadius: '6px', padding: '8px',
                          textAlign: 'center', border: '1px solid var(--cream-dark)',
                        }}>
                          <div style={{
                            height: '40px', background: '#f0ebe5', borderRadius: '4px', marginBottom: '4px',
                            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {rp?.images?.[0] && !rp.images[0].includes('/images/products/') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={rp.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '8px', color: 'var(--brown-light)' }}>IMG</span>
                            )}
                          </div>
                          <div style={{ fontSize: '8px', color: 'var(--brown-dark)', fontWeight: 500 }}>
                            {rp?.name || 'Product'}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    [0, 1, 2, 3].map(i => (
                      <div key={i} style={{
                        background: 'var(--cream)', borderRadius: '6px', padding: '8px',
                        textAlign: 'center', border: '1px dashed var(--cream-dark)',
                      }}>
                        <div style={{ height: '40px', background: '#f0ebe5', borderRadius: '4px', marginBottom: '4px' }} />
                        <div style={{ fontSize: '8px', color: 'var(--brown-light)' }}>Product</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className={styles.confirmOverlay} onClick={e => { if (e.target === e.currentTarget) setShowDeleteConfirm(false) }}>
          <div className={styles.confirmCard}>
            <div className={styles.confirmTitle}>Delete Product</div>
            <div className={styles.confirmText}>
              Are you sure you want to delete <span className={styles.confirmName}>{name}</span>? This action cannot be undone.
            </div>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancel}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDelete}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
