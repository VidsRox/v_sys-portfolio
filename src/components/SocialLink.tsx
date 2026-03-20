'use client'

import React, { useEffect, useRef, useState } from 'react'

interface SocialLinkProps {
  label: string
  url: string
}

export default function SocialLink({ label, url }: SocialLinkProps) {
  const isMail = url.startsWith('mailto:')
  const anchorRef = useRef<HTMLAnchorElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isMail && anchorRef.current) {
      anchorRef.current.setAttribute('target', '_blank')
      anchorRef.current.setAttribute('rel', 'noreferrer')
    }
  }, [isMail])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMail) {
      e.preventDefault()
      const email = decodeURIComponent(url.replace('mailto:', ''))
      navigator.clipboard.writeText(email).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
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
        color: copied ? 'var(--accent)' : 'var(--muted)',
        border: `1px solid ${copied ? 'var(--accent)' : 'var(--border)'}`,
        padding: '8px 16px',
        borderRadius: 'var(--radius)',
        transition: 'all .2s',
        cursor: 'pointer',
      }}
    >
      {copied ? 'Copied!' : `${label} →`}
    </a>
  )
}