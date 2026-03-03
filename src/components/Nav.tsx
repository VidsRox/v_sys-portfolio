'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const path = usePathname()
  const isAdmin = path.startsWith('/admin')

  if (isAdmin) return null

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">✦</Link>
        <ul className="nav-links">
          <li><Link href="/projects" className={path === '/projects' ? 'active' : ''}>Projects</Link></li>
          <li><Link href="/blog" className={path.startsWith('/blog') ? 'active' : ''}>Blog</Link></li>
          <li><Link href="/about" className={path === '/about' ? 'active' : ''}>About</Link></li>
        </ul>
      </div>
    </nav>
  )
}
