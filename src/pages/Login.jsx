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
    try {
      await signIn(form.email, form.password)
      navigate('/dashboard')
    } catch {
      setError('Incorrect email or password. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem', background: 'var(--cream)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>Sign in to your Pruv account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 7, color: 'var(--dark)' }}>Email address</label>
              <input type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 7, color: 'var(--dark)' }}>Password</label>
              <input type="password" placeholder="Your password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            {error && (
              <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>
              </div>
            )}
            <button type="submit" className="btn btn-green btn-full" disabled={loading} style={{ padding: '14px', fontSize: 15, marginTop: 4 }}>
              {loading ? <span className="spin" style={{ width: 18, height: 18 }} /> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: 'var(--muted)' }}>
          No account?{' '}
          <Link to="/signup" style={{ color: 'var(--green)', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}
