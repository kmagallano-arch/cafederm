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

  // UI state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
    if (isNew) return
    setLoadingProduct(true)
    try {
      const res = await fetch('/api/admin/products')
      if (!res.ok) {
        setNotFound(true)
        return
      }
      const products: DbProduct[] = await res.json()
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
    } catch {
      setNotFound(true)
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

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
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
        const created = await res.json()
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        // Navigate to the real edit page
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
                    <div key={i} className={styles.imageItem}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Product image ${i + 1}`} />
                      <button
                        className={styles.imageRemoveBtn}
                        onClick={() => removeImage(i)}
                        type="button"
                      >
                        &times;
                      </button>
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
                  {uploading ? 'Uploading...' : 'Click or drag image to upload'}
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
              <div className={styles.previewAddToCart}>
                ADD TO CART
              </div>
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
