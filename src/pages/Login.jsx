import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try { await signIn(form.email, form.password); navigate('/dashboard') }
    catch { setError('Invalid email or password. Make sure you confirmed your email first.') }
    finally { setLoading(false) }
  }

  return (
    <div className="page-sm" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 28, color: 'var(--green)', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>Sign in to your TrustCircle account</p>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email address</label>
              <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="Your password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-green btn-full" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <span className="spin" style={{ width: 18, height: 18 }} /> : 'Sign in'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: 'var(--muted)' }}>
          No account? <Link to="/signup" style={{ color: 'var(--green)', fontWeight: 500 }}>Create one free</Link>
        </p>
        <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: '1rem', marginTop: '1rem', border: '1px solid #F5A62355' }}>
          <p style={{ fontSize: 13, color: '#9A6700', lineHeight: 1.6 }}>
            <strong>Can't log in?</strong> Check your email inbox for a confirmation email from Supabase and click the link inside it first.
          </p>
        </div>
      </div>
    </div>
  )
}
