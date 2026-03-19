'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const MermaidBlock = dynamic(() => import('./MermaidBlock'), { ssr: false })

interface BlogRendererProps {
  content: string
}

/**
 * Detects whether content is HTML (from Tiptap) or Markdown (legacy).
 * Simple heuristic: if it starts with a block-level HTML tag, treat as HTML.
 */
function isHtmlContent(content: string): boolean {
  const trimmed = content.trim()
  return /^<(p|h[1-6]|div|ul|ol|blockquote|pre|img|hr|figure|table)\b/i.test(trimmed)
}

/**
 * Renders HTML content from Tiptap, extracting mermaid code blocks
 * and rendering them as interactive diagrams.
 */
function HtmlRenderer({ content }: { content: string }) {
  const { htmlParts, mermaidBlocks } = useMemo(() => {
    const parts: string[] = []
    const diagrams: { id: string; code: string }[] = []

    // Match <pre><code class="language-mermaid">...</code></pre> blocks
    const mermaidRegex = /<pre[^>]*>\s*<code[^>]*class="language-mermaid"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = mermaidRegex.exec(content)) !== null) {
      // Push HTML before this block
      parts.push(content.slice(lastIndex, match.index))

      // Extract mermaid code, decode HTML entities
      const code = match[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .trim()

      const id = `mermaid-${diagrams.length}`
      diagrams.push({ id, code })
      parts.push(`<div data-mermaid-placeholder="${id}"></div>`)

      lastIndex = match.index + match[0].length
    }

    parts.push(content.slice(lastIndex))

    return { htmlParts: parts.join(''), mermaidBlocks: diagrams }
  }, [content])

  if (mermaidBlocks.length === 0) {
    return (
      <div
        className="md-body"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // Split rendered HTML at mermaid placeholders and interleave diagram components
  const segments = htmlParts.split(/<div data-mermaid-placeholder="(mermaid-\d+)"><\/div>/g)

  return (
    <div className="md-body">
      {segments.map((segment, i) => {
        // Even indices are HTML fragments, odd indices are mermaid IDs
        if (i % 2 === 0) {
          return segment ? (
            <div key={i} dangerouslySetInnerHTML={{ __html: segment }} />
          ) : null
        }
        const diagram = mermaidBlocks.find(d => d.id === segment)
        return diagram ? <MermaidBlock key={diagram.id} code={diagram.code} /> : null
      })}
    </div>
  )
}

/**
 * Renders legacy Markdown content with mermaid support via custom code block rendering.
 */
function MarkdownRendererWithMermaid({ content }: { content: string }) {
  return (
    <div className="md-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? '')
            const lang = match?.[1]

            if (lang === 'mermaid') {
              const code = String(children).trim()
              return <MermaidBlock code={code} />
            }

            // Inline code vs block code
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }

            return <code {...props}>{children}</code>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default function BlogRenderer({ content }: BlogRendererProps) {
  if (isHtmlContent(content)) {
    return <HtmlRenderer content={content} />
  }
  return <MarkdownRendererWithMermaid content={content} />
}