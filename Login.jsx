import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 5%' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 28, color: 'var(--green)', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sign in to your TrustCircle account.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
              <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Password</label>
              <input name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 4 }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: 'var(--muted)' }}>
          New to TrustCircle? <Link to="/signup" style={{ color: 'var(--green)', fontWeight: 500 }}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}
