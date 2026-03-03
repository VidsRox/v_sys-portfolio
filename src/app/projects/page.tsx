import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Projects' }

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { order: 'asc' } })

  return (
    <main style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '120px 48px 80px' }}>
      <div className="sec-header">
        <span className="sec-label">Work</span>
        <h1 className="sec-title">Projects</h1>
        <span className="sec-count">{projects.length} projects</span>
      </div>

      {projects.length === 0 ? (
        <div className="empty">
          <p>No projects yet.</p>
          <small>Add projects from the Admin panel.</small>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
        }}>
          {projects.map(p => (
            <div key={p.id} className="project-card" style={{
              background: 'var(--bg)',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
              <div style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '22px',
                color: 'var(--text)',
                marginBottom: '10px',
                letterSpacing: '-.01em',
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
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noreferrer" style={{
                      fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase',
                      color: 'var(--muted)', transition: 'color .2s',
                    }}>
                      Live →
                    </a>
                  )}
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noreferrer" style={{
                      fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase',
                      color: 'var(--muted)', transition: 'color .2s',
                    }}>
                      GitHub →
                    </a>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--border)' }}>{p.year}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
