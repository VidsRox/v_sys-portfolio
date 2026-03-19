'use client'

import { useEffect, useRef, useState } from 'react'

interface MermaidBlockProps {
  code: string
}

export default function MermaidBlock({ code }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function renderDiagram() {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#1a1a2e',
            primaryTextColor: '#e8e8e4',
            primaryBorderColor: '#c8f542',
            lineColor: '#666',
            secondaryColor: '#141414',
            tertiaryColor: '#0c0c0c',
            fontFamily: "'DM Mono', monospace",
            fontSize: '13px',
          },
        })

        const id = `mermaid-${Math.random().toString(36).slice(2, 10)}`
        const { svg } = await mermaid.render(id, code)

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          setRendered(true)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram')
        }
      }
    }

    renderDiagram()
    return () => { cancelled = true }
  }, [code])

  if (error) {
    return (
      <div style={{
        background: '#1a1a1a',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '20px',
        margin: '1.6em 0',
      }}>
        <div style={{
          fontSize: '10px',
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--danger)',
          marginBottom: '12px',
        }}>
          Diagram Error
        </div>
        <pre style={{
          fontSize: '12px',
          color: 'var(--muted)',
          whiteSpace: 'pre-wrap',
          margin: 0,
        }}>
          {error}
        </pre>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        margin: '1.6em 0',
        padding: rendered ? '24px' : '40px',
        background: '#111',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        textAlign: 'center',
        overflow: 'auto',
      }}
    >
      {!rendered && (
        <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
          Loading diagram...
        </div>
      )}
    </div>
  )
}