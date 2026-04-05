'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import styles from './admin.module.css'

// ─── Product types ───────────────────────────────────────────────

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
  created_at?: string
  updated_at?: string
}

interface FormData {
  name: string
  slug: string
  description: string
  priceDollars: string
  compareAtPriceDollars: string
  category: 'face-care' | 'body-care' | 'bundles'
  tagNew: boolean
  tagBestSeller: boolean
  inStock: boolean
  rating: string
  reviewCount: string
  images: string
}

const emptyForm: FormData = {
  name: '',
  slug: '',
  description: '',
  priceDollars: '',
  compareAtPriceDollars: '',
  category: 'face-care',
  tagNew: false,
  tagBestSeller: false,
  inStock: true,
  rating: '4.5',
  reviewCount: '0',
  images: '',
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// ─── Main component ─────────────────────────────────────────────

export default function AdminClient() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Tab state
  const [activeTab, setActiveTab] = useState<'products' | 'auto-import'>('products')

  // Product state
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DbProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Auto-import state
  const [importUrl, setImportUrl] = useState('')
  const [importCategory, setImportCategory] = useState<'face-care' | 'body-care' | 'bundles'>('face-care')
  const [importing, setImporting] = useState(false)
  const [importStep, setImportStep] = useState(0)
  const [importResult, setImportResult] = useState<{ name: string; slug: string; price: number; images: string[] } | null>(null)
  const [importError, setImportError] = useState('')

  // Check session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('cafederm_admin_auth')
    if (saved === 'true') {
      setAuthenticated(true)
    }
    setCheckingSession(false)
  }, [])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchProducts()
    }
  }, [authenticated, fetchProducts])

  // Login handler
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

  function handleLogout() {
    sessionStorage.removeItem('cafederm_admin_auth')
    setAuthenticated(false)
    setPassword('')
  }

  // ─── Product form helpers ─────────────────────────────────────

  function openAddModal() {
    setEditingProduct(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEditModal(product: DbProduct) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceDollars: (product.price / 100).toFixed(2),
      compareAtPriceDollars: product.compare_at_price ? (product.compare_at_price / 100).toFixed(2) : '',
      category: product.category,
      tagNew: product.tags.includes('new'),
      tagBestSeller: product.tags.includes('best-seller'),
      inStock: product.in_stock,
      rating: String(product.rating),
      reviewCount: String(product.review_count),
      images: product.images.join(', '),
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingProduct(null)
  }

  function updateForm(field: keyof FormData, value: string | boolean) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && typeof value === 'string' && !editingProduct) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const tags: string[] = []
    if (form.tagNew) tags.push('new')
    if (form.tagBestSeller) tags.push('best-seller')

    const priceInCents = Math.round(parseFloat(form.priceDollars || '0') * 100)
    const compareAtPriceInCents = form.compareAtPriceDollars
      ? Math.round(parseFloat(form.compareAtPriceDollars) * 100)
      : null

    const images = form.images
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const payload: Record<string, unknown> = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: priceInCents,
      compare_at_price: compareAtPriceInCents,
      category: form.category,
      tags,
      in_stock: form.inStock,
      rating: parseFloat(form.rating) || 0,
      review_count: parseInt(form.reviewCount) || 0,
      images: images.length > 0 ? images : ['/images/products/placeholder.jpg'],
    }

    try {
      if (editingProduct) {
        payload.id = editingProduct.id
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
      } else {
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
      }
      closeModal()
      fetchProducts()
    } catch {
      alert('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(`Error: ${err.error}`)
        return
      }
      setDeleteTarget(null)
      fetchProducts()
    } catch {
      alert('Network error')
    } finally {
      setDeleting(false)
    }
  }

  // ─── Auto-import handler ───────────────────────────────────────

  const [importMode, setImportMode] = useState<'create' | 'update'>('create')
  const [importTargetProduct, setImportTargetProduct] = useState('')

  async function handleAutoImport() {
    if (!importUrl.trim()) return
    if (importMode === 'update' && !importTargetProduct) {
      setImportError('Please select a product to update')
      return
    }
    setImporting(true)
    setImportStep(1)
    setImportResult(null)
    setImportError('')

    // Simulate step progression while waiting for the API
    const stepTimer1 = setTimeout(() => setImportStep(2), 3000)
    const stepTimer2 = setTimeout(() => setImportStep(3), 8000)
    const stepTimer3 = setTimeout(() => setImportStep(4), 15000)

    try {
      const res = await fetch('/api/admin/auto-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: importUrl.trim(),
          category: importCategory,
          mode: importMode,
          existingProductId: importMode === 'update' ? importTargetProduct : undefined,
        }),
        signal: AbortSignal.timeout(5 * 60 * 1000), // 5 minute timeout
      })

      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)
      clearTimeout(stepTimer3)

      if (!res.ok) {
        const err = await res.json()
        setImportError(err.error || 'Import failed')
        setImportStep(0)
        return
      }

      const data = await res.json()
      setImportStep(5) // done
      setImportResult({
        name: data.product.name,
        slug: data.slug,
        price: data.product.price,
        images: data.product.images || [],
      })
      // Refresh product list
      fetchProducts()
    } catch (err) {
      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)
      clearTimeout(stepTimer3)
      setImportError(err instanceof Error ? err.message : 'Import failed')
      setImportStep(0)
    } finally {
      setImporting(false)
    }
  }

  // ─── Renders ──────────────────────────────────────────────────

  if (checkingSession) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <p className={styles.loading}>Loading...</p>
        </div>
      </div>
    )
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className={styles.loginPage}>
        <form className={styles.loginCard} onSubmit={handleLogin}>
          <h1 className={styles.loginTitle}>CafeDerm Admin</h1>
          <p className={styles.loginSubtitle}>Enter password to continue</p>
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

  // Admin dashboard
  return (
    <div className={styles.container}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.topBarTitle}>CafeDerm Admin</span>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 1.5rem' }}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'auto-import' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('auto-import')}
          >
            Auto-Import
          </button>
          <Link
            href="/admin/page-editor"
            className={styles.tab}
            style={{ textDecoration: 'none' }}
          >
            Page Editor &rarr;
          </Link>
        </div>
      </div>

      {/* Content area */}
      <div className={styles.content}>
        {activeTab === 'products' && (
          <>
            <div className={styles.toolbar}>
              <h2 className={styles.toolbarTitle}>Products</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href="/admin/products/new" className={styles.addBtn} style={{ textDecoration: 'none' }}>
                  + New Product
                </Link>
                <button className={styles.addBtn} onClick={openAddModal}>
                  + Quick Add
                </button>
              </div>
            </div>

            {loading ? (
              <div className={styles.loading}>Loading products...</div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>
                No products found. Add your first product to get started.
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Category</th>
                      <th className={styles.th}>Price</th>
                      <th className={styles.th}>Tags</th>
                      <th className={styles.th}>Stock</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td className={styles.td}>
                          <Link
                            href={`/admin/products/${product.slug}`}
                            className={styles.productName}
                            style={{ textDecoration: 'none', cursor: 'pointer' }}
                          >
                            {product.name}
                          </Link>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.badge}>{product.category}</span>
                        </td>
                        <td className={styles.td}>
                          {formatPrice(product.price)}
                          {product.compare_at_price && (
                            <span style={{ color: 'var(--gray)', textDecoration: 'line-through', marginLeft: 6, fontSize: '0.8em' }}>
                              {formatPrice(product.compare_at_price)}
                            </span>
                          )}
                        </td>
                        <td className={styles.td}>
                          <div className={styles.tagList}>
                            {product.tags.map(tag => (
                              <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.stockBadge} ${product.in_stock ? styles.stockIn : styles.stockOut}`}>
                            {product.in_stock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.actions}>
                            <Link
                              href={`/admin/products/${product.slug}`}
                              className={styles.editBtn}
                              style={{ textDecoration: 'none', display: 'inline-block' }}
                            >
                              Edit
                            </Link>
                            <button className={styles.editBtn} onClick={() => openEditModal(product)}>
                              Quick
                            </button>
                            <button className={styles.deleteBtn} onClick={() => setDeleteTarget(product)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'auto-import' && (
          <div className={styles.autoImportSection}>
            <h2 className={styles.autoImportTitle}>Auto-Import from Alibaba</h2>
            <p className={styles.autoImportSubtitle}>
              Paste an Alibaba product URL below. The system will scrape all product data,
              rewrite it for the CafeDerm brand using AI, recreate clean product images,
              and create a complete product entry automatically.
            </p>

            <div className={styles.autoImportForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Alibaba Product URL</label>
                <input
                  className={styles.formInput}
                  type="url"
                  placeholder="https://www.alibaba.com/product-detail/..."
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  disabled={importing}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Import Mode</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--brown-dark)' }}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'create'}
                      onChange={() => { setImportMode('create'); setImportTargetProduct('') }}
                      disabled={importing}
                      style={{ accentColor: 'var(--brown-dark)' }}
                    />
                    Create New Product
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--brown-dark)' }}>
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'update'}
                      onChange={() => setImportMode('update')}
                      disabled={importing}
                      style={{ accentColor: 'var(--brown-dark)' }}
                    />
                    Update Existing Product
                  </label>
                </div>
              </div>

              {importMode === 'update' && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Select Product to Update</label>
                  <select
                    className={styles.formSelect}
                    value={importTargetProduct}
                    onChange={e => setImportTargetProduct(e.target.value)}
                    disabled={importing}
                  >
                    <option value="">-- Select a product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <select
                  className={styles.formSelect}
                  value={importCategory}
                  onChange={e => setImportCategory(e.target.value as 'face-care' | 'body-care' | 'bundles')}
                  disabled={importing}
                >
                  <option value="face-care">Face Care</option>
                  <option value="body-care">Body Care</option>
                  <option value="bundles">Bundles</option>
                </select>
              </div>

              <button
                className={styles.autoImportBtn}
                onClick={handleAutoImport}
                disabled={importing || !importUrl.trim() || (importMode === 'update' && !importTargetProduct)}
              >
                {importing ? 'Importing...' : importMode === 'create' ? 'Import & Create Product' : 'Import & Update Product'}
              </button>
            </div>

            {importing && importStep > 0 && (
              <div className={styles.autoImportProgress}>
                {[
                  { step: 1, label: 'Scraping Alibaba page...' },
                  { step: 2, label: 'Rewriting content for CafeDerm...' },
                  { step: 3, label: 'Enhancing product images...' },
                  { step: 4, label: 'Creating product...' },
                ].map(({ step, label }) => (
                  <div
                    key={step}
                    className={`${styles.autoImportStep} ${
                      importStep === step ? styles.autoImportStepActive :
                      importStep > step ? styles.autoImportStepDone : ''
                    }`}
                  >
                    <span className={styles.autoImportStepIcon}>
                      {importStep > step ? '\u2713' : importStep === step ? '\u25CB' : '\u2022'}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            )}

            {importError && (
              <div className={styles.autoImportError}>{importError}</div>
            )}

            {importResult && (
              <div className={styles.autoImportResult}>
                <h3 className={styles.autoImportResultTitle}>{importResult.name}</h3>
                <p className={styles.autoImportResultMeta}>
                  Price: ${(importResult.price / 100).toFixed(2)} &middot;{' '}
                  {importResult.images.length} image{importResult.images.length !== 1 ? 's' : ''} imported
                </p>
                <Link
                  href={`/admin/products/${importResult.slug}`}
                  className={styles.autoImportResultLink}
                >
                  View in Editor &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className={styles.modal} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button className={styles.modalClose} onClick={closeModal}>&times;</button>
            </div>
            <form className={styles.form} onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={form.name}
                  onChange={e => updateForm('name', e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Slug</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={form.slug}
                  onChange={e => updateForm('slug', e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formTextarea}
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Price ($)</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.priceDollars}
                    onChange={e => updateForm('priceDollars', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Compare-at Price ($)</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.compareAtPriceDollars}
                    onChange={e => updateForm('compareAtPriceDollars', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <select
                  className={styles.formSelect}
                  value={form.category}
                  onChange={e => updateForm('category', e.target.value)}
                >
                  <option value="face-care">Face Care</option>
                  <option value="body-care">Body Care</option>
                  <option value="bundles">Bundles</option>
                </select>
              </div>
              <div className={styles.formCheckboxRow}>
                <label className={styles.formCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.tagNew}
                    onChange={e => updateForm('tagNew', e.target.checked)}
                  />
                  New
                </label>
                <label className={styles.formCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.tagBestSeller}
                    onChange={e => updateForm('tagBestSeller', e.target.checked)}
                  />
                  Best Seller
                </label>
                <label className={styles.formCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={e => updateForm('inStock', e.target.checked)}
                  />
                  In Stock
                </label>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Rating</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={e => updateForm('rating', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Review Count</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    min="0"
                    value={form.reviewCount}
                    onChange={e => updateForm('reviewCount', e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Images (comma-separated paths)</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={form.images}
                  onChange={e => updateForm('images', e.target.value)}
                  placeholder="/images/products/example.jpg"
                />
              </div>
            </form>
            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className={styles.modal} onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Delete Product</h3>
              <button className={styles.modalClose} onClick={() => setDeleteTarget(null)}>&times;</button>
            </div>
            <div className={styles.confirmText}>
              Are you sure you want to delete <span className={styles.confirmName}>{deleteTarget.name}</span>? This action cannot be undone.
            </div>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className={styles.confirmDeleteBtn} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
