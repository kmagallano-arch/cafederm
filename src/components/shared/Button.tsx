import Link from 'next/link'
import styles from './Button.module.css'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  variant?: 'dark' | 'outline' | 'outlineLight'
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
}

export default function Button({ children, href, variant = 'dark', onClick, type = 'button', className = '' }: ButtonProps) {
  const cls = `${styles.btn} ${styles[variant]} ${className}`
  if (href) return <Link href={href} className={cls}>{children}</Link>
  return <button type={type} className={cls} onClick={onClick}>{children}</button>
}
