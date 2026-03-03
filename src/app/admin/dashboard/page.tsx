'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'profile' | 'projects' | 'blog'

interface Profile {
  name: string; tagline: string; bio: string; about: string;
  skills: string; github: string; twitter: string; linkedin: string; email: string;
}

interface Project {
  id: string; title: string; description: string; tags: string[];
  liveUrl: string; githubUrl: string; year: string;
}

interface Post {
  id: string; title: string; slug: string; excerpt: string;
  content: string; published: boolean; createdAt: string;
}

const EMPTY_PROFILE: Profile = {
  name: '', tagline: '', bio: '', about: '', skills: '',
  github: '', twitter: '', linkedin: '', email: '',
}

const EMPTY_PROJECT = { title: '', description: '', tags: '', liveUrl: '', githubUrl: '', year: '' }
const EMPTY_POST = { title: '', excerpt: '', content: '', published: true }

export default function DashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('profile')
  const [toast, setToast] = useState('')
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE)
  const [projects, setProjects] = useState<Project[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  // Project form state
  const [showProjForm, setShowProjForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projForm, setProjForm] = useState(EMPTY_PROJECT)

  // Blog form state
  const [showBlogForm, setShowBlogForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [blogForm, setBlogForm] = useState(EMPTY_POST)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const checkAuth = useCallback(async () => {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    if (!data.isAdmin) router.push('/admin')
  }, [router])

  const loadProfile = useCallback(async () => {
    const res = await fetch('/api/admin/profile')
    if (res.ok) {
      const data = await res.json()
      // Merge with EMPTY_PROFILE so no field is ever null/undefined
      setProfile({ ...EMPTY_PROFILE, ...data })
    }
  }, [])

  const loadProjects = useCallback(async () => {
    const res = await fetch('/api/admin/projects')
    if (res.ok) setProjects(await res.json())
  }, [])

  const loadPosts = useCallback(async () => {
    const res = await fetch('/api/admin/blogs')
    if (res.ok) setPosts(await res.json())
  }, [])

  useEffect(() => {
    checkAuth()
    loadProfile()
    loadProjects()
    loadPosts()
  }, [checkAuth, loadProfile, loadProjects, loadPosts])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin')
  }

  // ── PROFILE ──
  async function saveProfile() {
    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    if (res.ok) showToast('Profile saved!')
    else showToast('Error saving profile.')
  }

  // ── PROJECTS ──
  function openNewProject() {
    setEditingProject(null)
    setProjForm(EMPTY_PROJECT)
    setShowProjForm(true)
  }

  function openEditProject(p: Project) {
    setEditingProject(p)
    setProjForm({ title: p.title, description: p.description, tags: p.tags.join(', '), liveUrl: p.liveUrl, githubUrl: p.githubUrl, year: p.year })
    setShowProjForm(true)
  }

  async function saveProject() {
    const payload = {
      ...projForm,
      tags: projForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    const url = editingProject ? `/api/admin/projects/${editingProject.id}` : '/api/admin/projects'
    const method = editingProject ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      loadProjects()
      setShowProjForm(false)
      showToast(editingProject ? 'Project updated!' : 'Project added!')
    } else {
      const d = await res.json()
      showToast(d.error ?? 'Error')
    }
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    loadProjects()
    showToast('Project deleted.')
  }

  // ── BLOG ──
  function openNewPost() {
    setEditingPost(null)
    setBlogForm(EMPTY_POST)
    setShowBlogForm(true)
  }

  function openEditPost(p: Post) {
    setEditingPost(p)
    setBlogForm({ title: p.title, excerpt: p.excerpt, content: p.content, published: p.published })
    setShowBlogForm(true)
  }

  async function savePost() {
    const url = editingPost ? `/api/admin/blogs/${editingPost.id}` : '/api/admin/blogs'
    const method = editingPost ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blogForm),
    })
    if (res.ok) {
      loadPosts()
      setShowBlogForm(false)
      showToast(editingPost ? 'Post updated!' : 'Post published!')
    } else {
      const d = await res.json()
      showToast(d.error ?? 'Error')
    }
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' })
    loadPosts()
    showToast('Post deleted.')
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Admin Nav */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto', padding: '0 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <span style={{ fontFamily: "'DM Serif Display',serif", color: 'var(--accent)', fontSize: '18px' }}>✦ Admin</span>
            {(['profile', 'projects', 'blog'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: 'none', border: 'none', padding: '0 0 2px',
                fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase',
                color: tab === t ? 'var(--text)' : 'var(--muted)',
                borderBottom: tab === t ? '1px solid var(--accent)' : '1px solid transparent',
                cursor: 'pointer', transition: 'color .2s',
              }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a href="/" target="_blank" style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
              View Site →
            </a>
            <button className="btn btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 40px' }}>

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div>
            <div className="sec-header">
              <span className="sec-label">Identity</span>
              <h2 className="sec-title">Profile</h2>
            </div>
            <div style={{ maxWidth: '640px' }}>
              <div className="form-group">
                <label>Display Name</label>
                <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Your Name" />
              </div>
              <div className="form-group">
                <label>Hero Tagline</label>
                <input type="text" value={profile.tagline} onChange={e => setProfile({ ...profile, tagline: e.target.value })} placeholder="Available for work" />
              </div>
              <div className="form-group">
                <label>Short Bio (hero section)</label>
                <textarea rows={3} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="One-liner about you..." />
              </div>
              <div className="form-group">
                <label>About Page — Long Bio</label>
                <textarea style={{ minHeight: '160px' }} value={profile.about} onChange={e => setProfile({ ...profile, about: e.target.value })} placeholder={"Paragraph 1...\n\nParagraph 2..."} />
              </div>
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input type="text" value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} placeholder="React, TypeScript, Go..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input type="url" value={profile.github} onChange={e => setProfile({ ...profile, github: e.target.value })} placeholder="https://github.com/you" />
                </div>
                <div className="form-group">
                  <label>Twitter URL</label>
                  <input type="url" value={profile.twitter} onChange={e => setProfile({ ...profile, twitter: e.target.value })} placeholder="https://twitter.com/you" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input type="url" value={profile.linkedin} onChange={e => setProfile({ ...profile, linkedin: e.target.value })} placeholder="https://linkedin.com/in/you" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="text" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="you@email.com" />
                </div>
              </div>
              <button className="btn btn-primary" onClick={saveProfile}>Save Profile</button>
            </div>
          </div>
        )}

        {/* ── PROJECTS TAB ── */}
        {tab === 'projects' && (
          <div>
            <div className="sec-header">
              <span className="sec-label">Work</span>
              <h2 className="sec-title">Projects</h2>
              <span className="sec-count">{projects.length} total</span>
            </div>

            {!showProjForm ? (
              <>
                {projects.length === 0 ? (
                  <div className="empty" style={{ marginBottom: '24px' }}>
                    <p>No projects yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {projects.map(p => (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px', background: 'var(--surface)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius)', gap: '12px',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '2px' }}>{p.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{p.tags.join(', ')} {p.year && `· ${p.year}`}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-sm" onClick={() => openEditProject(p)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteProject(p.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary" onClick={openNewProject}>+ Add Project</button>
              </>
            ) : (
              <div style={{ maxWidth: '600px' }}>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '22px', marginBottom: '28px', color: 'var(--text)' }}>
                  {editingProject ? 'Edit Project' : 'New Project'}
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={projForm.title} onChange={e => setProjForm({ ...projForm, title: e.target.value })} placeholder="My Awesome Project" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={4} value={projForm.description} onChange={e => setProjForm({ ...projForm, description: e.target.value })} placeholder="What does it do?" />
                </div>
                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input type="text" value={projForm.tags} onChange={e => setProjForm({ ...projForm, tags: e.target.value })} placeholder="React, Node.js, PostgreSQL" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Live URL</label>
                    <input type="url" value={projForm.liveUrl} onChange={e => setProjForm({ ...projForm, liveUrl: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="form-group">
                    <label>GitHub URL</label>
                    <input type="url" value={projForm.githubUrl} onChange={e => setProjForm({ ...projForm, githubUrl: e.target.value })} placeholder="https://github.com/..." />
                  </div>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input type="text" value={projForm.year} onChange={e => setProjForm({ ...projForm, year: e.target.value })} placeholder="2024" />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" onClick={saveProject}>Save Project</button>
                  <button className="btn" onClick={() => setShowProjForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BLOG TAB ── */}
        {tab === 'blog' && (
          <div>
            <div className="sec-header">
              <span className="sec-label">Writing</span>
              <h2 className="sec-title">Blog Posts</h2>
              <span className="sec-count">{posts.length} total</span>
            </div>

            {!showBlogForm ? (
              <>
                {posts.length === 0 ? (
                  <div className="empty" style={{ marginBottom: '24px' }}>
                    <p>No posts yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {posts.map(p => (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px', background: 'var(--surface)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius)', gap: '12px',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '2px' }}>{p.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            {new Date(p.createdAt).toLocaleDateString()} · /blog/{p.slug}
                            {!p.published && <span style={{ color: 'var(--danger)', marginLeft: '8px' }}>Draft</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a href={`/blog/${p.slug}`} target="_blank" className="btn btn-sm">View</a>
                          <button className="btn btn-sm" onClick={() => openEditPost(p)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => deletePost(p.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary" onClick={openNewPost}>+ Write Post</button>
              </>
            ) : (
              <div style={{ maxWidth: '700px' }}>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '22px', marginBottom: '28px', color: 'var(--text)' }}>
                  {editingPost ? 'Edit Post' : 'New Post'}
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} placeholder="Your post title..." />
                </div>
                <div className="form-group">
                  <label>Excerpt (shown in blog list)</label>
                  <textarea rows={2} value={blogForm.excerpt} onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })} placeholder="A short teaser..." />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea style={{ minHeight: '280px' }} value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} placeholder={"Write your post here.\n\nSeparate paragraphs with a blank line."} />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="pub"
                    checked={blogForm.published}
                    onChange={e => setBlogForm({ ...blogForm, published: e.target.checked })}
                    style={{ width: 'auto', accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="pub" style={{ margin: 0, cursor: 'pointer', textTransform: 'none', letterSpacing: 0, fontSize: '13px', color: 'var(--muted)' }}>
                    Published (visible to public)
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" onClick={savePost}>
                    {editingPost ? 'Update Post' : 'Publish Post'}
                  </button>
                  <button className="btn" onClick={() => setShowBlogForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: '32px', right: '32px',
        background: 'var(--surface)', border: '1px solid var(--accent)',
        color: 'var(--accent)', padding: '12px 20px',
        borderRadius: 'var(--radius)', fontSize: '12px', letterSpacing: '.08em',
        zIndex: 9000, transition: 'all .3s',
        opacity: toast ? 1 : 0,
        transform: toast ? 'translateY(0)' : 'translateY(20px)',
        pointerEvents: 'none',
      }}>
        {toast}
      </div>
    </div>
  )
}