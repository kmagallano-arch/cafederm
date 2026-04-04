'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './admin.module.css'

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

export default function AdminClient() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<DbProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  // Form helpers
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
      // Auto-generate slug from name
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

  // --- Renders ---

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

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.toolbar}>
          <h2 className={styles.toolbarTitle}>Products</h2>
          <button className={styles.addBtn} onClick={openAddModal}>
            + Add Product
          </button>
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
                      <span className={styles.productName}>{product.name}</span>
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
                        <button className={styles.editBtn} onClick={() => openEditModal(product)}>
                          Edit
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
