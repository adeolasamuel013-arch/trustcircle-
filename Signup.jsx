import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SKILLS = [
  'Mechanic', 'Electrician', 'Plumber', 'Lawyer', 'Doctor', 'Accountant',
  'Graphic Designer', 'Web Developer', 'Chef / Caterer', 'Tailor / Fashion',
  'Hair Stylist', 'Photographer', 'Driver', 'Carpenter', 'Painter',
  'Real Estate Agent', 'Teacher / Tutor', 'Other'
]

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', skill: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.fullName || !form.email || !form.password || !form.skill) {
      setError('Please fill in all fields.'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.fullName, form.skill)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 5%' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 28, color: 'var(--green)', marginBottom: 8 }}>Join TrustCircle</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Build your trusted reputation in Nigeria.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark)', display: 'block', marginBottom: 6 }}>Full name</label>
              <input name="fullName" placeholder="Chidi Okonkwo" value={form.fullName} onChange={handleChange} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark)', display: 'block', marginBottom: 6 }}>Email</label>
              <input name="email" type="email" placeholder="chidi@email.com" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark)', display: 'block', marginBottom: 6 }}>Password</label>
              <input name="password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark)', display: 'block', marginBottom: 6 }}>What service do you offer?</label>
              <select name="skill" value={form.skill} onChange={handleChange}>
                <option value="">Select your skill / service</option>
                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 4 }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> : 'Create my account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: 'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--green)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
