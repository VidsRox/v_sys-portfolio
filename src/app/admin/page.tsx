'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Incorrect password.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '40px',
        width: '100%',
        maxWidth: '380px',
      }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '28px' }}>Admin</span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '32px' }}>
          Enter your password to access the admin panel.
        </p>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoFocus
          />
          {error && <div className="form-error">{error}</div>}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Entering...' : 'Enter →'}
        </button>

        <p style={{ marginTop: '20px', fontSize: '11px', color: '#444', lineHeight: '1.6' }}>
        </p>
      </div>
    </div>
  )
}
