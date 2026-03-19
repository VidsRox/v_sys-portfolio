'use client'

import React, { useEffect, useRef } from 'react'

interface SocialLinkProps {
  label: string
  url: string
}

export default function SocialLink({ label, url }: SocialLinkProps) {
  const isMail = url.startsWith('mailto:')
  const anchorRef = useRef<HTMLAnchorElement>(null)

  // apply target/rel attributes after mount to avoid mismatches between
  // server-rendered HTML and client; mailto links are left untouched.
  useEffect(() => {
    if (!isMail && anchorRef.current) {
      anchorRef.current.setAttribute('target', '_blank')
      anchorRef.current.setAttribute('rel', 'noreferrer')
    }
  }, [isMail])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMail) {
      // fallback navigation for mail links; prevents blank-tab issue
      e.preventDefault()
      window.location.href = url
    }
  }

  return (
    <a
      ref={anchorRef}
      href={url}
      onClick={handleClick}
      style={{
        fontSize: '12px',
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        border: '1px solid var(--border)',
        padding: '8px 16px',
        borderRadius: 'var(--radius)',
        transition: 'all .2s',
      }}
    >
      {label} →
    </a>
  )
}
