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

  // New fields
  const [ingredients, setIngredients] = useState('')
  const [howToUse, setHowToUse] = useState('')
  const [keyBenefits, setKeyBenefits] = useState<string[]>([])
  const [newBenefit, setNewBenefit] = useState('')
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([])

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
      // auto-import returns { product: {...}, slug }
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
    { id: 'description', title: 'Description', content: description },
    { id: 'ingredients', title: 'Ingredients', content: ingredients },
    { id: 'howToUse', title: 'How to Use', content: howToUse },
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
          <div className={styles.editorSection}>
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
          <div className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Product Details</div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ingredients</label>
              <textarea
                className={styles.formTextarea}
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
                placeholder="Full ingredients list..."
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
          </div>

          {/* Pricing */}
          <div className={styles.editorSection}>
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

          {/* Reviews */}
          <div className={styles.editorSection}>
            <div className={styles.editorSectionTitle}>Reviews</div>
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
          <div className={styles.editorSection}>
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
                          {enhancingIndex === i ? '...' : '✨'}
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
            </div>
          </div>

          {/* Related Products */}
          <div className={styles.editorSection}>
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

        {/* Right - Live Preview */}
        <div className={styles.preview}>
          <div className={styles.previewLabel}>Live Preview</div>
          <div className={styles.previewCard}>
            <div className={styles.previewImage}>
              {previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewImage} alt={name || 'Product'} />
              ) : (
                'No image'
              )}
            </div>
            <div className={styles.previewInfo}>
              {previewBadge && (
                <span className={styles.previewBadge}>{previewBadge}</span>
              )}
              <div className={styles.previewTitle}>
                {name || 'Product Name'}
              </div>
              <div className={styles.previewPriceRow}>
                <span className={styles.previewPrice}>
                  ${previewPrice.toFixed(2)}
                </span>
                {previewComparePrice > 0 && previewComparePrice > previewPrice && (
                  <span className={styles.previewComparePrice}>
                    ${previewComparePrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div className={styles.previewStars}>
                {renderStars(previewRating)} ({previewReviewCount})
              </div>
              {description && (
                <div className={styles.previewDescription}>
                  {description}
                </div>
              )}

              {/* Key Benefits Preview */}
              {keyBenefits.length > 0 && (
                <div style={{
                  background: 'var(--cream)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  {keyBenefits.map((b, i) => (
                    <div key={i} style={{ fontSize: '12px', color: 'var(--brown)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--brown-dark)', fontWeight: 700, flexShrink: 0 }}>{'\u2713'}</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.previewAddToCart}>
                ADD TO CART
              </div>

              {/* Trust Badges Preview */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                padding: '12px 0',
                borderTop: '1px solid #eee',
                marginBottom: '16px',
              }}>
                {[
                  { icon: '\uD83D\uDE9A', text: 'Free Shipping' },
                  { icon: '\uD83D\uDC30', text: 'Cruelty Free' },
                  { icon: '\uD83D\uDD2C', text: 'Derm Tested' },
                  { icon: '\uD83C\uDF3F', text: 'Clean' },
                ].map((badge, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '9px', color: 'var(--brown)' }}>
                    <div style={{ fontSize: '16px', marginBottom: '2px' }}>{badge.icon}</div>
                    {badge.text}
                  </div>
                ))}
              </div>

              {/* Accordion Preview */}
              {previewAccordions.length > 0 && (
                <div style={{ borderTop: '1px solid #eee' }}>
                  {previewAccordions.map(section => (
                    <div key={section.id} style={{ borderBottom: '1px solid #eee' }}>
                      <button
                        onClick={() => setPreviewAccordion(previewAccordion === section.id ? null : section.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 0',
                          background: 'none',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--brown-dark)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        <span>{section.title}</span>
                        <span style={{ color: 'var(--brown-light)', fontSize: '14px' }}>
                          {previewAccordion === section.id ? '\u2212' : '+'}
                        </span>
                      </button>
                      {previewAccordion === section.id && (
                        <div style={{ padding: '0 0 12px', fontSize: '12px', lineHeight: 1.7, color: 'var(--brown)', whiteSpace: 'pre-wrap' }}>
                          {section.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.previewDetails}>
                <div className={styles.previewDetailItem}>
                  Category: {category.replace('-', ' ')}
                </div>
                <div className={styles.previewDetailItem}>
                  Status: {inStock ? 'In Stock' : 'Out of Stock'}
                </div>
                {(tagNew || tagBestSeller) && (
                  <div className={styles.previewDetailItem}>
                    Tags: {[tagNew && 'New', tagBestSeller && 'Best Seller'].filter(Boolean).join(', ')}
                  </div>
                )}
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
