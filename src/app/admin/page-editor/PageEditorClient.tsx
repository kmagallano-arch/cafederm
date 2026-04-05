'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import styles from './editor.module.css'
import { defaultContent } from '@/lib/content'
import type { SiteContent } from '@/lib/content'

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

export default function PageEditorClient() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newMarqueeItem, setNewMarqueeItem] = useState('')

  // Auth check
  useEffect(() => {
    const saved = sessionStorage.getItem('cafederm_admin_auth')
    if (saved === 'true') setAuthenticated(true)
    setCheckingSession(false)
  }, [])

  // Fetch content
  const fetchContent = useCallback(async () => {
    setLoading(true)
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
        setContent(merged)
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated) fetchContent()
  }, [authenticated, fetchContent])

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

  // Content helpers
  function updateField<K extends SectionKey>(section: K, field: string, value: any) {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  function updateNested<K extends SectionKey>(section: K, path: string[], value: any) {
    setContent(prev => {
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
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data: content[section] }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        const err = await res.json()
        alert(`Error saving: ${err.error}`)
      }
    } catch {
      alert('Network error')
    } finally {
      setSaving(false)
    }
  }

  // ─── Preview renderers ───────────────────────────────────

  function renderPreviewAnnouncement() {
    const d = content.announcement
    if (!d.enabled) {
      return (
        <div style={{ background: '#555', padding: '10px 20px', textAlign: 'center', opacity: 0.4 }}>
          <p style={{ fontSize: 12, color: '#ccc', margin: 0 }}>Announcement (disabled)</p>
        </div>
      )
    }
    return (
      <div style={{ background: '#2C1810', padding: '10px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#F7F1EB', margin: 0, letterSpacing: 1 }}>{d.text}</p>
      </div>
    )
  }

  function renderPreviewHero() {
    const d = content.hero
    return (
      <div style={{ background: 'linear-gradient(135deg, #F7F1EB, #E8D5C0)', padding: '80px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#6B4226', marginBottom: 12, marginTop: 0 }}>{d.label}</p>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 42, color: '#2C1810', marginBottom: 12, marginTop: 0, lineHeight: 1.15 }}>
          {d.title.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
        </h2>
        <p style={{ fontSize: 14, color: '#6B4226', marginBottom: 24 }}>{d.subtitle}</p>
        <span style={{ display: 'inline-block', padding: '12px 32px', background: '#2C1810', color: '#F7F1EB', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
          {d.buttonText}
        </span>
      </div>
    )
  }

  function renderPreviewMarquee() {
    const d = content.marquee
    if (!d.enabled) {
      return (
        <div style={{ background: '#555', padding: '10px 20px', textAlign: 'center', opacity: 0.4 }}>
          <p style={{ fontSize: 12, color: '#ccc', margin: 0 }}>Marquee (disabled)</p>
        </div>
      )
    }
    return (
      <div style={{ background: '#2C1810', padding: '12px 20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'nowrap' }}>
          {d.items.map((item, i) => (
            <span key={i} style={{ fontSize: 11, color: '#F7F1EB', letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {item}
              {i < d.items.length - 1 && <span style={{ margin: '0 20px', opacity: 0.4 }}>|</span>}
            </span>
          ))}
        </div>
      </div>
    )
  }

  function renderPreviewFeaturedBanner() {
    const d = content.featuredBanner
    return (
      <div style={{ background: '#F7F1EB', padding: '60px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#A67C52', marginBottom: 8, marginTop: 0 }}>{d.label}</p>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, color: '#2C1810', marginBottom: 8, marginTop: 0, lineHeight: 1.2 }}>
            {d.title.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
          </h3>
          <p style={{ fontSize: 13, color: '#6B4226', marginBottom: 20 }}>
            {d.subtitle.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
          </p>
          <span style={{ display: 'inline-block', padding: '10px 28px', background: '#2C1810', color: '#F7F1EB', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
            {d.buttonText}
          </span>
          <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
            {d.features.map((f, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{f.icon}</div>
                <div style={{ fontSize: 10, color: '#6B4226', lineHeight: 1.3 }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#EDE4D8', borderRadius: 12, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          {d.productImage ? (
            <img src={d.productImage} alt={d.productName} style={{ maxHeight: 200, maxWidth: '80%', objectFit: 'contain' }} />
          ) : (
            <div style={{ color: '#A67C52', fontSize: 13 }}>Product Image</div>
          )}
          <p style={{ fontSize: 13, color: '#2C1810', fontWeight: 600, marginTop: 12, marginBottom: 2 }}>{d.productName}</p>
          <p style={{ fontSize: 14, color: '#6B4226', margin: 0 }}>{d.productPrice}</p>
        </div>
      </div>
    )
  }

  function renderPreviewAbout() {
    const d = content.about
    return (
      <div style={{ background: '#F7F1EB', padding: '80px 60px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#A67C52', marginBottom: 12, marginTop: 0 }}>{d.label}</p>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, color: '#2C1810', marginBottom: 24, marginTop: 0, lineHeight: 1.35, maxWidth: 500, margin: '0 auto 24px' }}>
          {d.title.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
        </h3>
        <span style={{ display: 'inline-block', padding: '10px 28px', border: '1px solid #2C1810', color: '#2C1810', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>
          {d.buttonText}
        </span>
      </div>
    )
  }

  function renderPreviewMediaGrid() {
    const d = content.mediaGrid
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '40px' }}>
        {(['left', 'right'] as const).map(side => {
          const card = d[side]
          return (
            <div key={side} style={{ background: side === 'left' ? '#EDE4D8' : '#2C1810', borderRadius: 12, padding: '48px 32px', textAlign: 'center' }}>
              <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: side === 'left' ? '#A67C52' : '#A67C52', marginBottom: 8, marginTop: 0 }}>{card.label}</p>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, color: side === 'left' ? '#2C1810' : '#F7F1EB', marginBottom: 8, marginTop: 0, lineHeight: 1.25 }}>
                {card.title.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
              </h4>
              <p style={{ fontSize: 12, color: side === 'left' ? '#6B4226' : 'rgba(247,241,235,0.7)', marginBottom: 16 }}>{card.subtitle}</p>
              <span style={{ display: 'inline-block', padding: '8px 22px', border: `1px solid ${side === 'left' ? '#2C1810' : '#F7F1EB'}`, color: side === 'left' ? '#2C1810' : '#F7F1EB', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>
                {card.buttonText}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  function renderPreviewFooter() {
    const d = content.footer
    return (
      <div style={{ background: '#2C1810', padding: '60px 40px', textAlign: 'center' }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, color: '#F7F1EB', marginBottom: 8, marginTop: 0 }}>{d.newsletterTitle}</h4>
        <p style={{ fontSize: 13, color: 'rgba(247,241,235,0.7)', maxWidth: 400, margin: '0 auto 20px' }}>{d.newsletterText}</p>
        <div style={{ display: 'flex', gap: 8, maxWidth: 360, margin: '0 auto' }}>
          <div style={{ flex: 1, padding: '10px 14px', background: 'rgba(247,241,235,0.1)', border: '1px solid rgba(247,241,235,0.2)', borderRadius: 6, fontSize: 12, color: 'rgba(247,241,235,0.4)' }}>
            Enter your email
          </div>
          <div style={{ padding: '10px 20px', background: '#A67C52', color: '#fff', fontSize: 11, borderRadius: 6, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
            Subscribe
          </div>
        </div>
      </div>
    )
  }

  const previewRenderers: Record<SectionKey, () => JSX.Element> = {
    announcement: renderPreviewAnnouncement,
    hero: renderPreviewHero,
    marquee: renderPreviewMarquee,
    featuredBanner: renderPreviewFeaturedBanner,
    about: renderPreviewAbout,
    mediaGrid: renderPreviewMediaGrid,
    footer: renderPreviewFooter,
  }

  // ─── Sidebar form renderers ──────────────────────────────

  function renderAnnouncementForm() {
    const d = content.announcement
    return (
      <>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Announcement Text</label>
          <input className={styles.formInput} type="text" value={d.text} onChange={e => updateField('announcement', 'text', e.target.value)} />
        </div>
        <div className={styles.toggleRow}>
          <button type="button" className={`${styles.toggle} ${d.enabled ? styles.toggleOn : ''}`} onClick={() => updateField('announcement', 'enabled', !d.enabled)} />
          <span className={styles.toggleLabel}>Enabled</span>
        </div>
      </>
    )
  }

  function renderHeroForm() {
    const d = content.hero
    return (
      <>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Label</label>
          <input className={styles.formInput} type="text" value={d.label} onChange={e => updateField('hero', 'label', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Title (use line breaks)</label>
          <textarea className={styles.formTextarea} value={d.title} onChange={e => updateField('hero', 'title', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Subtitle</label>
          <input className={styles.formInput} type="text" value={d.subtitle} onChange={e => updateField('hero', 'subtitle', e.target.value)} />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Button Text</label>
            <input className={styles.formInput} type="text" value={d.buttonText} onChange={e => updateField('hero', 'buttonText', e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Button Link</label>
            <input className={styles.formInput} type="text" value={d.buttonLink} onChange={e => updateField('hero', 'buttonLink', e.target.value)} />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Background Image URL</label>
          <input className={styles.formInput} type="text" value={d.backgroundImage} onChange={e => updateField('hero', 'backgroundImage', e.target.value)} />
        </div>
      </>
    )
  }

  function renderMarqueeForm() {
    const d = content.marquee
    return (
      <>
        <div className={styles.toggleRow}>
          <button type="button" className={`${styles.toggle} ${d.enabled ? styles.toggleOn : ''}`} onClick={() => updateField('marquee', 'enabled', !d.enabled)} />
          <span className={styles.toggleLabel}>Enabled</span>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Marquee Items</label>
          <div className={styles.tagList}>
            {d.items.map((item, i) => (
              <span key={i} className={styles.tagItem}>
                {item}
                <button className={styles.tagRemoveBtn} onClick={() => {
                  const next = [...d.items]
                  next.splice(i, 1)
                  updateField('marquee', 'items', next)
                }}>&times;</button>
              </span>
            ))}
          </div>
          <div className={styles.addTagRow}>
            <input
              className={styles.formInput}
              type="text"
              placeholder="Add new item..."
              value={newMarqueeItem}
              onChange={e => setNewMarqueeItem(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newMarqueeItem.trim()) {
                  e.preventDefault()
                  updateField('marquee', 'items', [...d.items, newMarqueeItem.trim()])
                  setNewMarqueeItem('')
                }
              }}
            />
            <button className={styles.addTagBtn} onClick={() => {
              if (newMarqueeItem.trim()) {
                updateField('marquee', 'items', [...d.items, newMarqueeItem.trim()])
                setNewMarqueeItem('')
              }
            }}>+ Add</button>
          </div>
        </div>
      </>
    )
  }

  function renderFeaturedBannerForm() {
    const d = content.featuredBanner
    return (
      <>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Label</label>
          <input className={styles.formInput} type="text" value={d.label} onChange={e => updateField('featuredBanner', 'label', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Title</label>
          <textarea className={styles.formTextarea} value={d.title} onChange={e => updateField('featuredBanner', 'title', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Subtitle</label>
          <textarea className={styles.formTextarea} value={d.subtitle} onChange={e => updateField('featuredBanner', 'subtitle', e.target.value)} />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Button Text</label>
            <input className={styles.formInput} type="text" value={d.buttonText} onChange={e => updateField('featuredBanner', 'buttonText', e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Button Link</label>
            <input className={styles.formInput} type="text" value={d.buttonLink} onChange={e => updateField('featuredBanner', 'buttonLink', e.target.value)} />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Product Image URL</label>
          <input className={styles.formInput} type="text" value={d.productImage} onChange={e => updateField('featuredBanner', 'productImage', e.target.value)} />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Product Name</label>
            <input className={styles.formInput} type="text" value={d.productName} onChange={e => updateField('featuredBanner', 'productName', e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Product Price</label>
            <input className={styles.formInput} type="text" value={d.productPrice} onChange={e => updateField('featuredBanner', 'productPrice', e.target.value)} />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Features</label>
          {d.features.map((feat, i) => (
            <div key={i} className={styles.featureRow}>
              <input className={styles.formInput} type="text" value={feat.icon} onChange={e => {
                const next = [...d.features]
                next[i] = { ...next[i], icon: e.target.value }
                updateField('featuredBanner', 'features', next)
              }} placeholder="Icon" />
              <input className={styles.formInput} type="text" value={feat.label} onChange={e => {
                const next = [...d.features]
                next[i] = { ...next[i], label: e.target.value }
                updateField('featuredBanner', 'features', next)
              }} placeholder="Label" />
              <button className={styles.featureRemoveBtn} onClick={() => {
                const next = [...d.features]
                next.splice(i, 1)
                updateField('featuredBanner', 'features', next)
              }}>&times;</button>
            </div>
          ))}
          <button className={styles.addTagBtn} onClick={() => {
            updateField('featuredBanner', 'features', [...d.features, { icon: '', label: '' }])
          }}>+ Add Feature</button>
        </div>
      </>
    )
  }

  function renderAboutForm() {
    const d = content.about
    return (
      <>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Label</label>
          <input className={styles.formInput} type="text" value={d.label} onChange={e => updateField('about', 'label', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Title</label>
          <textarea className={styles.formTextarea} value={d.title} onChange={e => updateField('about', 'title', e.target.value)} />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Button Text</label>
            <input className={styles.formInput} type="text" value={d.buttonText} onChange={e => updateField('about', 'buttonText', e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Button Link</label>
            <input className={styles.formInput} type="text" value={d.buttonLink} onChange={e => updateField('about', 'buttonLink', e.target.value)} />
          </div>
        </div>
      </>
    )
  }

  function renderMediaGridForm() {
    const d = content.mediaGrid
    return (
      <>
        <div className={styles.subSection}>
          <div className={styles.subSectionTitle}>Left Card</div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Label</label>
            <input className={styles.formInput} type="text" value={d.left.label} onChange={e => updateNested('mediaGrid', ['left', 'label'], e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Title</label>
            <textarea className={styles.formTextarea} value={d.left.title} onChange={e => updateNested('mediaGrid', ['left', 'title'], e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Subtitle</label>
            <input className={styles.formInput} type="text" value={d.left.subtitle} onChange={e => updateNested('mediaGrid', ['left', 'subtitle'], e.target.value)} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Button Text</label>
              <input className={styles.formInput} type="text" value={d.left.buttonText} onChange={e => updateNested('mediaGrid', ['left', 'buttonText'], e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Button Link</label>
              <input className={styles.formInput} type="text" value={d.left.buttonLink} onChange={e => updateNested('mediaGrid', ['left', 'buttonLink'], e.target.value)} />
            </div>
          </div>
        </div>
        <div className={styles.subSection}>
          <div className={styles.subSectionTitle}>Right Card</div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Label</label>
            <input className={styles.formInput} type="text" value={d.right.label} onChange={e => updateNested('mediaGrid', ['right', 'label'], e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Title</label>
            <textarea className={styles.formTextarea} value={d.right.title} onChange={e => updateNested('mediaGrid', ['right', 'title'], e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Subtitle</label>
            <input className={styles.formInput} type="text" value={d.right.subtitle} onChange={e => updateNested('mediaGrid', ['right', 'subtitle'], e.target.value)} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Button Text</label>
              <input className={styles.formInput} type="text" value={d.right.buttonText} onChange={e => updateNested('mediaGrid', ['right', 'buttonText'], e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Button Link</label>
              <input className={styles.formInput} type="text" value={d.right.buttonLink} onChange={e => updateNested('mediaGrid', ['right', 'buttonLink'], e.target.value)} />
            </div>
          </div>
        </div>
      </>
    )
  }

  function renderFooterForm() {
    const d = content.footer
    return (
      <>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Newsletter Title</label>
          <input className={styles.formInput} type="text" value={d.newsletterTitle} onChange={e => updateField('footer', 'newsletterTitle', e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Newsletter Text</label>
          <textarea className={styles.formTextarea} value={d.newsletterText} onChange={e => updateField('footer', 'newsletterText', e.target.value)} />
        </div>
      </>
    )
  }

  const formRenderers: Record<SectionKey, () => JSX.Element> = {
    announcement: renderAnnouncementForm,
    hero: renderHeroForm,
    marquee: renderMarqueeForm,
    featuredBanner: renderFeaturedBannerForm,
    about: renderAboutForm,
    mediaGrid: renderMediaGridForm,
    footer: renderFooterForm,
  }

  // ─── Render ──────────────────────────────────────────────

  if (checkingSession) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <p className={styles.loading}>Loading...</p>
        </div>
      </div>
    )
  }

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

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.topBarTitle}>Page Editor</span>
        <div className={styles.topBarActions}>
          <Link href="/admin" className={styles.backBtn}>Back to Admin</Link>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading content...</div>
      ) : (
        <div className={styles.layout}>
          {/* Preview area */}
          <div className={styles.preview}>
            {sectionOrder.map(key => (
              <div
                key={key}
                className={`${styles.previewSection} ${activeSection === key ? styles.previewSectionActive : ''}`}
                onClick={() => setActiveSection(key)}
              >
                <div className={styles.previewOverlay}>
                  <button className={styles.previewOverlayBtn} onClick={e => { e.stopPropagation(); setActiveSection(key) }}>
                    Edit {sectionLabels[key]}
                  </button>
                </div>
                {previewRenderers[key]()}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {activeSection === null ? (
              <div className={styles.sidebarEmpty}>
                Click a section in the preview to start editing
              </div>
            ) : (
              <>
                <div className={styles.sidebarHeader}>
                  <span className={styles.sidebarHeaderTitle}>{sectionLabels[activeSection]}</span>
                  <button className={styles.sidebarCloseBtn} onClick={() => setActiveSection(null)}>&times;</button>
                </div>
                <div className={styles.sidebarBody}>
                  {formRenderers[activeSection]()}
                  <button
                    className={styles.saveSectionBtn}
                    onClick={() => saveSection(activeSection)}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Section'}
                  </button>
                  {saved && <div className={styles.savedMsg}>Saved!</div>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
