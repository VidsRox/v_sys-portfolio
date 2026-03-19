import { prisma } from '@/lib/prisma'
import SocialLink from '@/components/SocialLink'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'About' }

export default async function AboutPage() {
  const profile = await prisma.profile.findUnique({ where: { id: 'main' } })
  const skills = (profile?.skills ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const aboutParagraphs = (profile?.about ?? '').split(/\n\n+/).filter(p => p.trim())

  const socials = [
    profile?.github && { label: 'GitHub', url: profile.github },
    profile?.twitter && { label: 'Twitter', url: profile.twitter },
    profile?.linkedin && { label: 'LinkedIn', url: profile.linkedin },
    profile?.email && {
      label: 'Email',
      url: (() => {
        const raw = profile.email.trim()
        return raw.startsWith('mailto:')
          ? raw
          : `mailto:${encodeURIComponent(raw)}`
      })(),
    },
  ].filter(Boolean) as { label: string; url: string }[]

  return (
    <main style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '120px 48px 80px' }}>
      <div className="sec-header">
        <span className="sec-label">Me</span>
        <h1 className="sec-title">About</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>
        {/* Bio */}
        <div>
          {aboutParagraphs.map((para, i) => (
            <p key={i} style={{ color: 'var(--muted)', lineHeight: '1.9', marginBottom: '16px' }}>
              {para.replace(/\n/g, ' ')}
            </p>
          ))}
          {socials.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '32px' }}>
              {socials.map(s => (
                <SocialLink key={s.label} label={s.label} url={s.url} />
              ))}
            </div>
          )}
        </div>

        {/* Skills */}
        <div>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '20px', color: 'var(--text)', marginBottom: '20px',
          }}>
            Skills &amp; Tools
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map(skill => (
              <span key={skill} style={{
                fontSize: '12px', padding: '5px 12px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', color: 'var(--muted)',
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
