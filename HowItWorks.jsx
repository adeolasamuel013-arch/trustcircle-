import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SKILLS = ['Mechanic','Electrician','Plumber','Lawyer','Doctor','Accountant','Graphic Designer','Web Developer','Chef / Caterer','Tailor / Fashion','Hair Stylist','Photographer','Driver','Carpenter','Painter','Real Estate Agent','Teacher / Tutor','Other']

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = choose type, 2 = fill form
  const [accountType, setAccountType] = useState('')
  const [form, setForm] = useState({ fullName: '', email: '', password: '', skill: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.fullName || !form.email || !form.password) { setError('Please fill in all fields.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (accountType === 'provider' && !form.skill) { setError('Please select your skill.'); return }
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.fullName, accountType === 'provider' ? form.skill : null)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const types = [
    {
      id: 'provider',
      title: 'I offer a service',
      desc: 'Mechanic, lawyer, designer, chef — I want to build my reputation and get more clients.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      )
    },
    {
      id: 'user',
      title: 'I want to find or vouch',
      desc: 'I want to find trusted professionals or vouch for people I know. I may not offer a service.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      )
    }
  ]

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem', background: 'var(--cream)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 6 }}>Join Pruv</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>Free to join. Always.</p>
        </div>

        {/* STEP 1 — Choose type */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark)', textAlign: 'center', marginBottom: '1.25rem' }}>What brings you here?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
              {types.map(t => (
                <button key={t.id} onClick={() => { setAccountType(t.id); setStep(2) }}
                  style={{ background: 'var(--white)', border: `1.5px solid ${accountType === t.id ? 'var(--green)' : 'var(--border)'}`, borderRadius: 14, padding: '1.25rem 1.5rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', display: 'flex', alignItems: 'flex-start', gap: 14, boxShadow: 'var(--shadow-sm)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green-light)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = accountType === t.id ? 'var(--green)' : 'var(--border)'}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', flexShrink: 0 }}>
                    {t.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--dark)', marginBottom: 4 }}>{t.title}</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        )}

        {/* STEP 2 — Fill form */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans, sans-serif', padding: 0 }}>
              ← Back
            </button>

            {/* Type badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--green-pale)', borderRadius: 10, padding: '10px 14px', marginBottom: '1.5rem', border: '1px solid #c3e8d8' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {accountType === 'provider'
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                }
              </div>
              <p style={{ fontSize: 13, color: 'var(--green-mid)', fontWeight: 600 }}>
                {accountType === 'provider' ? 'Service provider account' : 'Regular user account'}
              </p>
            </div>

            <div className="card">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 7, color: 'var(--dark)' }}>Full name</label>
                  <input placeholder="Chidi Okonkwo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 7, color: 'var(--dark)' }}>Email address</label>
                  <input type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 7, color: 'var(--dark)' }}>Password</label>
                  <input type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                {accountType === 'provider' && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 7, color: 'var(--dark)' }}>Your skill or service</label>
                    <select value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))}>
                      <option value="">Select what you do</option>
                      {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                {error && (
                  <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>
                  </div>
                )}
                <button type="submit" className="btn btn-green btn-full" disabled={loading} style={{ padding: '14px', fontSize: 15, marginTop: 4 }}>
                  {loading ? <span className="spin" style={{ width: 18, height: 18 }} /> : 'Create my account'}
                </button>
              </form>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: 'var(--muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
