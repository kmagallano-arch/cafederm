'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import styles from './admin.module.css'
import { defaultContent } from '@/lib/content'
import type { SiteContent } from '@/lib/content'

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

// ─── Content section config ──────────────────────────────────────

type SectionKey = keyof SiteContent

const sectionLabels: Record<SectionKey, string> = {
  announcement: 'Announcement Bar',
  hero: 'Hero',
  marquee: 'Marquee',
  featuredBanner: 'Featured Banner',
  about: 'About',
  mediaGrid: 'Media Grid',
  footer: 'Footer',
}

const sectionOrder: SectionKey[] = ['announcement', 'hero', 'marquee', 'featuredBanner', 'about', 'mediaGrid', 'footer']

// ─── Main component ─────────────────────────────────────────────

export default function AdminClient() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Tab state
  const [activeTab, setActiveTab] = useState<'products' | 'content' | 'auto-import'>('products')

  // Product state
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DbProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Content state
  const [contentData, setContentData] = useState<SiteContent>({ ...defaultContent })
  const [contentLoading, setContentLoading] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const [newMarqueeItem, setNewMarqueeItem] = useState('')

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

  // Fetch content
  const fetchContent = useCallback(async () => {
    setContentLoading(true)
    try {
      const res = await fetch('/api/admin/content')
      if (res.ok) {
        const data = await res.json()
        const merged = { ...defaultContent }
        for (const key of sectionOrder) {
          if (data[key]) {
            (merged as any)[key] = { ...(merged as any)[key], ...data[key] }
          }
        }
        setContentData(merged)
      }
    } catch {
      // use defaults
    } finally {
      setContentLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchProducts()
    }
  }, [authenticated, fetchProducts])

  useEffect(() => {
    if (authenticated && activeTab === 'content') {
      fetchContent()
    }
  }, [authenticated, activeTab, fetchContent])

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

  // ─── Content helpers ──────────────────────────────────────────

  function toggleSection(key: string) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function updateContent<K extends SectionKey>(section: K, field: string, value: any) {
    setContentData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  function updateNestedContent<K extends SectionKey>(section: K, path: string[], value: any) {
    setContentData(prev => {
      const sectionData = { ...(prev[section] as any) }
      let obj = sectionData
      for (let i = 0; i < path.length - 1; i++) {
        obj[path[i]] = { ...obj[path[i]] }
        obj = obj[path[i]]
      }
      obj[path[path.length - 1]] = value
      return { ...prev, [section]: sectionData }
    })
  }

  async function saveSection(section: SectionKey) {
    setSavingSection(section)
    setSavedSection(null)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data: contentData[section] }),
      })
      if (res.ok) {
        setSavedSection(section)
        setTimeout(() => setSavedSection(null), 2000)
      } else {
        const err = await res.json()
        alert(`Error saving: ${err.error}`)
      }
    } catch {
      alert('Network error')
    } finally {
      setSavingSection(null)
    }
  }

  // ─── Auto-import handler ───────────────────────────────────────

  async function handleAutoImport() {
    if (!importUrl.trim()) return
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
        body: JSON.stringify({ url: importUrl.trim(), category: importCategory }),
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

  // ─── Render helpers ───────────────────────────────────────────

  function renderInput(label: string, value: string, onChange: (v: string) => void) {
    return (
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{label}</label>
        <input className={styles.formInput} type="text" value={value} onChange={e => onChange(e.target.value)} />
      </div>
    )
  }

  function renderTextarea(label: string, value: string, onChange: (v: string) => void) {
    return (
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{label}</label>
        <textarea className={styles.formTextarea} value={value} onChange={e => onChange(e.target.value)} />
      </div>
    )
  }

  function renderToggle(label: string, value: boolean, onChange: (v: boolean) => void) {
    return (
      <div className={styles.toggleRow}>
        <button
          type="button"
          className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
          onClick={() => onChange(!value)}
        />
        <span className={styles.toggleLabel}>{label}</span>
      </div>
    )
  }

  function renderSaveButton(section: SectionKey) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
        <button
          className={styles.sectionSaveBtn}
          onClick={() => saveSection(section)}
          disabled={savingSection === section}
        >
          {savingSection === section ? 'Saving...' : 'Save'}
        </button>
        {savedSection === section && <span className={styles.savedMessage}>Saved!</span>}
      </div>
    )
  }

  // ─── Content section forms ────────────────────────────────────

  function renderAnnouncementForm() {
    const d = contentData.announcement
    return (
      <div className={styles.sectionForm}>
        {renderInput('Announcement Text', d.text, v => updateContent('announcement', 'text', v))}
        {renderToggle('Enabled', d.enabled, v => updateContent('announcement', 'enabled', v))}
        {renderSaveButton('announcement')}
      </div>
    )
  }

  function renderHeroForm() {
    const d = contentData.hero
    return (
      <div className={styles.sectionForm}>
        {renderInput('Label', d.label, v => updateContent('hero', 'label', v))}
        {renderTextarea('Title (use \\n for line breaks)', d.title, v => updateContent('hero', 'title', v))}
        {renderInput('Subtitle', d.subtitle, v => updateContent('hero', 'subtitle', v))}
        <div className={styles.formRow}>
          {renderInput('Button Text', d.buttonText, v => updateContent('hero', 'buttonText', v))}
          {renderInput('Button Link', d.buttonLink, v => updateContent('hero', 'buttonLink', v))}
        </div>
        {renderInput('Background Image URL', d.backgroundImage, v => updateContent('hero', 'backgroundImage', v))}
        {renderSaveButton('hero')}
      </div>
    )
  }

  function renderMarqueeForm() {
    const d = contentData.marquee
    return (
      <div className={styles.sectionForm}>
        {renderToggle('Enabled', d.enabled, v => updateContent('marquee', 'enabled', v))}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Marquee Items</label>
          <div className={styles.contentTagList}>
            {d.items.map((item, i) => (
              <span key={i} className={styles.contentTag}>
                {item}
                <button
                  className={styles.contentTagRemove}
                  onClick={() => {
                    const next = [...d.items]
                    next.splice(i, 1)
                    updateContent('marquee', 'items', next)
                  }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className={styles.addItemRow}>
            <input
              className={styles.formInput}
              type="text"
              placeholder="Add new item..."
              value={newMarqueeItem}
              onChange={e => setNewMarqueeItem(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newMarqueeItem.trim()) {
                  e.preventDefault()
                  updateContent('marquee', 'items', [...d.items, newMarqueeItem.trim()])
                  setNewMarqueeItem('')
                }
              }}
            />
            <button
              className={styles.addItemBtn}
              onClick={() => {
                if (newMarqueeItem.trim()) {
                  updateContent('marquee', 'items', [...d.items, newMarqueeItem.trim()])
                  setNewMarqueeItem('')
                }
              }}
            >
              + Add
            </button>
          </div>
        </div>
        {renderSaveButton('marquee')}
      </div>
    )
  }

  function renderFeaturedBannerForm() {
    const d = contentData.featuredBanner
    return (
      <div className={styles.sectionForm}>
        {renderInput('Label', d.label, v => updateContent('featuredBanner', 'label', v))}
        {renderTextarea('Title (use \\n for line breaks)', d.title, v => updateContent('featuredBanner', 'title', v))}
        {renderTextarea('Subtitle', d.subtitle, v => updateContent('featuredBanner', 'subtitle', v))}
        <div className={styles.formRow}>
          {renderInput('Button Text', d.buttonText, v => updateContent('featuredBanner', 'buttonText', v))}
          {renderInput('Button Link', d.buttonLink, v => updateContent('featuredBanner', 'buttonLink', v))}
        </div>
        {renderInput('Product Image URL', d.productImage, v => updateContent('featuredBanner', 'productImage', v))}
        <div className={styles.formRow}>
          {renderInput('Product Name', d.productName, v => updateContent('featuredBanner', 'productName', v))}
          {renderInput('Product Price', d.productPrice, v => updateContent('featuredBanner', 'productPrice', v))}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Features</label>
          {d.features.map((feat, i) => (
            <div key={i} className={styles.featureRow}>
              <input
                className={styles.formInput}
                type="text"
                value={feat.icon}
                onChange={e => {
                  const next = [...d.features]
                  next[i] = { ...next[i], icon: e.target.value }
                  updateContent('featuredBanner', 'features', next)
                }}
                placeholder="Icon"
              />
              <input
                className={styles.formInput}
                type="text"
                value={feat.label}
                onChange={e => {
                  const next = [...d.features]
                  next[i] = { ...next[i], label: e.target.value }
                  updateContent('featuredBanner', 'features', next)
                }}
                placeholder="Label"
              />
              <button
                className={styles.featureRemoveBtn}
                onClick={() => {
                  const next = [...d.features]
                  next.splice(i, 1)
                  updateContent('featuredBanner', 'features', next)
                }}
              >
                &times;
              </button>
            </div>
          ))}
          <button
            className={styles.addItemBtn}
            onClick={() => {
              updateContent('featuredBanner', 'features', [...d.features, { icon: '', label: '' }])
            }}
          >
            + Add Feature
          </button>
        </div>
        {renderSaveButton('featuredBanner')}
      </div>
    )
  }

  function renderAboutForm() {
    const d = contentData.about
    return (
      <div className={styles.sectionForm}>
        {renderInput('Label', d.label, v => updateContent('about', 'label', v))}
        {renderTextarea('Title (use \\n for line breaks)', d.title, v => updateContent('about', 'title', v))}
        <div className={styles.formRow}>
          {renderInput('Button Text', d.buttonText, v => updateContent('about', 'buttonText', v))}
          {renderInput('Button Link', d.buttonLink, v => updateContent('about', 'buttonLink', v))}
        </div>
        {renderSaveButton('about')}
      </div>
    )
  }

  function renderMediaGridForm() {
    const d = contentData.mediaGrid
    return (
      <div className={styles.sectionForm}>
        <div className={styles.subSectionLabel}>Left Card</div>
        {renderInput('Label', d.left.label, v => updateNestedContent('mediaGrid', ['left', 'label'], v))}
        {renderTextarea('Title', d.left.title, v => updateNestedContent('mediaGrid', ['left', 'title'], v))}
        {renderInput('Subtitle', d.left.subtitle, v => updateNestedContent('mediaGrid', ['left', 'subtitle'], v))}
        <div className={styles.formRow}>
          {renderInput('Button Text', d.left.buttonText, v => updateNestedContent('mediaGrid', ['left', 'buttonText'], v))}
          {renderInput('Button Link', d.left.buttonLink, v => updateNestedContent('mediaGrid', ['left', 'buttonLink'], v))}
        </div>

        <div className={styles.subSectionLabel}>Right Card</div>
        {renderInput('Label', d.right.label, v => updateNestedContent('mediaGrid', ['right', 'label'], v))}
        {renderTextarea('Title', d.right.title, v => updateNestedContent('mediaGrid', ['right', 'title'], v))}
        {renderInput('Subtitle', d.right.subtitle, v => updateNestedContent('mediaGrid', ['right', 'subtitle'], v))}
        <div className={styles.formRow}>
          {renderInput('Button Text', d.right.buttonText, v => updateNestedContent('mediaGrid', ['right', 'buttonText'], v))}
          {renderInput('Button Link', d.right.buttonLink, v => updateNestedContent('mediaGrid', ['right', 'buttonLink'], v))}
        </div>
        {renderSaveButton('mediaGrid')}
      </div>
    )
  }

  function renderFooterForm() {
    const d = contentData.footer
    return (
      <div className={styles.sectionForm}>
        {renderInput('Newsletter Title', d.newsletterTitle, v => updateContent('footer', 'newsletterTitle', v))}
        {renderTextarea('Newsletter Text', d.newsletterText, v => updateContent('footer', 'newsletterText', v))}
        {renderSaveButton('footer')}
      </div>
    )
  }

  const sectionRenderers: Record<SectionKey, () => JSX.Element> = {
    announcement: renderAnnouncementForm,
    hero: renderHeroForm,
    marquee: renderMarqueeForm,
    featuredBanner: renderFeaturedBannerForm,
    about: renderAboutForm,
    mediaGrid: renderMediaGridForm,
    footer: renderFooterForm,
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
            className={`${styles.tab} ${activeTab === 'content' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Page Content
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'auto-import' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('auto-import')}
          >
            Auto-Import
          </button>
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

        {activeTab === 'content' && (
          <>
            <div className={styles.toolbar}>
              <h2 className={styles.toolbarTitle}>Page Content</h2>
            </div>

            {contentLoading ? (
              <div className={styles.loading}>Loading content...</div>
            ) : (
              sectionOrder.map(key => (
                <div key={key} className={styles.accordion}>
                  <button
                    className={styles.accordionHeader}
                    onClick={() => toggleSection(key)}
                  >
                    {sectionLabels[key]}
                    <span className={`${styles.accordionArrow} ${openSections[key] ? styles.accordionArrowOpen : ''}`}>
                      &#9660;
                    </span>
                  </button>
                  {openSections[key] && (
                    <div className={styles.accordionBody}>
                      {sectionRenderers[key]()}
                    </div>
                  )}
                </div>
              ))
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
                disabled={importing || !importUrl.trim()}
              >
                {importing ? 'Importing...' : 'Import & Create Product'}
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
