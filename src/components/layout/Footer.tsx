import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <h3 className={styles.newsletterTitle}>Stay in the know</h3>
          <p className={styles.newsletterText}>Sign up for exclusive offers, skincare tips, and new product launches.</p>
          <div className={styles.emailRow}>
            <input type="email" placeholder="Enter your email" className={styles.emailInput} />
            <button className={styles.emailBtn}>Subscribe</button>
          </div>
        </div>
        <div>
          <h4 className={styles.linksTitle}>Discover</h4>
          <ul>
            <li className={styles.linkItem}><Link href="/about" className={styles.link}>About Us</Link></li>
            <li className={styles.linkItem}><Link href="/collections/best-sellers" className={styles.link}>Best Sellers</Link></li>
            <li className={styles.linkItem}><Link href="/collections/new-arrivals" className={styles.link}>New Arrivals</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={styles.linksTitle}>Help</h4>
          <ul>
            <li className={styles.linkItem}><Link href="/contact" className={styles.link}>Contact</Link></li>
            <li className={styles.linkItem}><Link href="/shipping" className={styles.link}>Shipping &amp; Returns</Link></li>
            <li className={styles.linkItem}><Link href="/privacy" className={styles.link}>Privacy Policy</Link></li>
            <li className={styles.linkItem}><Link href="/terms" className={styles.link}>Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={styles.linksTitle}>Shop</h4>
          <ul>
            <li className={styles.linkItem}><Link href="/collections/face-care" className={styles.link}>Face Care</Link></li>
            <li className={styles.linkItem}><Link href="/collections/body-care" className={styles.link}>Body Care</Link></li>
            <li className={styles.linkItem}><Link href="/collections/bundles" className={styles.link}>Bundles</Link></li>
            <li className={styles.linkItem}><Link href="/collections/all" className={styles.link}>Shop All</Link></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>&copy; 2026 CafeDerm. All rights reserved.</span>
        <div className={styles.social}>
          <a href="#" className={styles.socialLink}>Instagram</a>
          <a href="#" className={styles.socialLink}>TikTok</a>
          <a href="#" className={styles.socialLink}>Facebook</a>
          <a href="#" className={styles.socialLink}>YouTube</a>
          <a href="#" className={styles.socialLink}>Pinterest</a>
        </div>
      </div>
    </footer>
  )
}
