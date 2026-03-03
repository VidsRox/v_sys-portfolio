import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Blog' }

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '120px 48px 80px' }}>
      <div className="sec-header">
        <span className="sec-label">Writing</span>
        <h1 className="sec-title">Blog</h1>
        <span className="sec-count">{posts.length} posts</span>
      </div>

      {posts.length === 0 ? (
        <div className="empty">
          <p>No posts yet.</p>
          <small>Write your first post from the Admin panel.</small>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)' }}>
          {posts.map((post, i) => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr auto',
              alignItems: 'start',
              gap: '24px',
              padding: '28px 32px',
              borderBottom: i < posts.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background .2s',
              color: 'inherit',
              textDecoration: 'none',
            }}
            className="blog-row"
            >
              <div style={{ fontSize: '11px', color: 'var(--muted)', paddingTop: '4px', letterSpacing: '.05em' }}>
                {formatDate(post.createdAt)}
              </div>
              <div>
                <div style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '20px', color: 'var(--text)',
                  letterSpacing: '-.01em', marginBottom: '6px',
                }}>
                  {post.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
                  {post.excerpt}
                </div>
              </div>
              <div style={{ fontSize: '18px', color: 'var(--border)', paddingTop: '4px' }}>→</div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .blog-row:hover { background: var(--surface) !important; }
      `}</style>
    </main>
  )
}
