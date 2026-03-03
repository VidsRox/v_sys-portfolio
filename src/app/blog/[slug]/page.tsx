import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  return { title: post?.title ?? 'Post not found' }
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, published: true },
  })

  if (!post) notFound()

  return (
    <main style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '120px 48px 80px' }}>
      <Link href="/blog" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase',
        color: 'var(--muted)', marginBottom: '48px',
        transition: 'color .2s',
      }}>
        ← Back to Blog
      </Link>

      <article style={{ maxWidth: '720px' }}>
        <header style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(28px, 5vw, 52px)',
            color: 'var(--text)',
            letterSpacing: '-.03em',
            lineHeight: '1.05',
            marginBottom: '16px',
          }}>
            {post.title}
          </h1>
          <div style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '.05em' }}>
            {formatDate(post.createdAt)}
          </div>
        </header>

        <MarkdownRenderer content={post.content} />
      </article>
    </main>
  )
}