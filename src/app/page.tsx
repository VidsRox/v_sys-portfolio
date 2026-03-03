import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const profile = await prisma.profile.findUnique({ where: { id: 'main' } })
  return {
    title: profile?.name ?? 'Portfolio',
    description: profile?.bio ?? '',
  }
}

export default async function HomePage() {
  const [profile, projects, posts] = await Promise.all([
    prisma.profile.findUnique({ where: { id: 'main' } }),
    prisma.project.findMany({ orderBy: { order: 'asc' }, take: 3 }),
    prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 3 }),
  ])

  const nameParts = (profile?.name ?? 'Your Name').split(' ')
  const firstName = nameParts[0]
  const rest = nameParts.slice(1).join(' ')

  return (
    <main style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '0 48px' }}>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '80px',
        position: 'relative',
      }}>
        <div style={{
          fontSize: '11px', letterSpacing: '.2em',
          textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '24px',
        }}>
          {profile?.tagline ?? 'Available for work'}
        </div>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 'clamp(52px, 8vw, 96px)',
          lineHeight: '.95', letterSpacing: '-.03em', marginBottom: '32px',
        }}>
          {firstName}<br/>
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{rest}</em>
        </h1>

        <p style={{
          maxWidth: '480px', color: 'var(--muted)',
          fontSize: '14px', lineHeight: '1.8', marginBottom: '48px',
        }}>
          {profile?.bio ?? ''}
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/projects" style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'var(--accent)', color: '#0c0c0c',
            padding: '10px 20px', borderRadius: 'var(--radius)',
            fontSize: '12px', letterSpacing: '.05em',
            fontWeight: '500', border: '1px solid var(--accent)',
          }}>
            View Projects
          </Link>
          <Link href="/blog" style={{
            display: 'inline-flex', alignItems: 'center',
            color: 'var(--text)', padding: '10px 20px',
            borderRadius: 'var(--radius)', fontSize: '12px',
            letterSpacing: '.05em', border: '1px solid var(--border)',
          }}>
            Read Blog
          </Link>
          {profile?.github && (
            <a href={profile.github} target="_blank" rel="noreferrer" style={{
              display: 'inline-flex', alignItems: 'center',
              color: 'var(--muted)', padding: '10px 20px',
              borderRadius: 'var(--radius)', fontSize: '12px',
              letterSpacing: '.05em', border: '1px solid var(--border)',
            }}>
              GitHub
            </a>
          )}
        </div>

        <div style={{
          position: 'absolute', bottom: '40px', left: 0,
          display: 'flex', alignItems: 'center', gap: '12px',
          color: 'var(--muted)', fontSize: '11px',
          letterSpacing: '.15em', textTransform: 'uppercase',
        }}>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--muted))' }} />
          Scroll
        </div>
      </section>

      {/* ── LATEST PROJECTS ── */}
      {projects.length > 0 && (
        <section style={{ paddingBottom: '80px' }}>
          <div className="sec-header">
            <span className="sec-label">Work</span>
            <h2 className="sec-title">Latest Projects</h2>
            <Link href="/projects" style={{
              marginLeft: 'auto', fontSize: '11px', letterSpacing: '.1em',
              textTransform: 'uppercase', color: 'var(--muted)',
              transition: 'color .2s',
            }}>
              All projects →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1px',
            background: 'var(--border)',
            border: '1px solid var(--border)',
          }}>
            {projects.map(p => (
              <div key={p.id} style={{ background: 'var(--bg)', padding: '28px', position: 'relative' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
                <div style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '20px', color: 'var(--text)',
                  marginBottom: '10px', letterSpacing: '-.01em',
                }}>
                  {p.title}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '20px' }}>
                  {p.description}
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: '16px', borderTop: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Live →</a>}
                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>GitHub →</a>}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--border)' }}>{p.year}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── LATEST POSTS ── */}
      {posts.length > 0 && (
        <section style={{ paddingBottom: '100px' }}>
          <div className="sec-header">
            <span className="sec-label">Writing</span>
            <h2 className="sec-title">Latest Posts</h2>
            <Link href="/blog" style={{
              marginLeft: 'auto', fontSize: '11px', letterSpacing: '.1em',
              textTransform: 'uppercase', color: 'var(--muted)',
              transition: 'color .2s',
            }}>
              All posts →
            </Link>
          </div>

          <div style={{ border: '1px solid var(--border)' }}>
            {posts.map((post, i) => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr auto',
                alignItems: 'start',
                gap: '24px',
                padding: '24px 32px',
                borderBottom: i < posts.length - 1 ? '1px solid var(--border)' : 'none',
                color: 'inherit', textDecoration: 'none',
              }}
              className="blog-row"
              >
                <div style={{ fontSize: '11px', color: 'var(--muted)', paddingTop: '4px', letterSpacing: '.05em' }}>
                  {post.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '18px', color: 'var(--text)',
                    letterSpacing: '-.01em', marginBottom: '4px',
                  }}>
                    {post.title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
                    {post.excerpt}
                  </div>
                </div>
                <div style={{ fontSize: '16px', color: 'var(--border)', paddingTop: '4px' }}>→</div>
              </Link>
            ))}
          </div>

          <style>{`.blog-row:hover { background: var(--surface) !important; }`}</style>
        </section>
      )}

    </main>
  )
}