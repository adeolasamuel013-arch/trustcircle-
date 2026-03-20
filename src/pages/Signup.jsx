import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

const SKILLS = ['Mechanic','Electrician','Plumber','Lawyer','Doctor','Accountant','Graphic Designer','Web Developer','Chef / Caterer','Tailor / Fashion','Hair Stylist','Photographer','Driver','Carpenter','Painter','Real Estate Agent','Teacher / Tutor','Other']

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState('') // 'provider' or 'user'
  const [form, setForm] = useState({ fullName: '', email: '', password: '', skill: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.fullName || !form.email || !form.password) { setError('Please fill in all fields.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (accountType === 'provider' && !form.skill) { setError('Please select your skill or service.'); return }
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.fullName, accountType === 'provider' ? form.skill : null)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 30, color: 'var(--green)', marginBottom: 8 }}>Join Prov</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>Free to join. Always.</p>
        </div>

        {/* Account type selection */}
        {!accountType ? (
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark)', textAlign: 'center', marginBottom: '1.25rem' }}>
              What brings you to Prov?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => setAccountType('provider')} style={{
                background: 'white', border: '2px solid var(--border)', borderRadius: 14,
                padding: '1.25rem 1.5rem', cursor: 'pointer', textAlign: 'left',
                fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green-light)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width:44,height:44,borderRadius:10,background:"var(--green-pale)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name="mechanic" size={22} color="var(--green)" /></div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--dark)', marginBottom: 3 }}>I offer a service</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>I am a mechanic, lawyer, designer, chef or any skilled professional. I want to build my reputation and get clients.</p>
                  </div>
                </div>
              </button>

              <button onClick={() => setAccountType('user')} style={{
                background: 'white', border: '2px solid var(--border)', borderRadius: 14,
                padding: '1.25rem 1.5rem', cursor: 'pointer', textAlign: 'left',
                fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green-light)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width:44,height:44,borderRadius:10,background:"var(--green-pale)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name="search" size={22} color="var(--green)" /></div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--dark)', marginBottom: 3 }}>I want to find or vouch for people</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>I want to find trusted service providers or vouch for people I know. I may not offer a service myself.</p>
                  </div>
                </div>
              </button>
            </div>
            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: 'var(--muted)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--green)', fontWeight: 500 }}>Sign in</Link>
            </p>
          </div>
        ) : (
          <div>
            {/* Back button */}
            <button onClick={() => setAccountType('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans, sans-serif' }}>
              ← Back
            </button>

            {/* Type badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--green-pale)', borderRadius: 10, padding: '10px 14px', marginBottom: '1.25rem', border: '1px solid #B8E8D4' }}>
              <Icon name={accountType === "provider" ? "mechanic" : "search"} size={20} color="var(--green-mid)" />
              <p style={{ fontSize: 13, color: 'var(--green-mid)', fontWeight: 500 }}>
                {accountType === 'provider' ? 'Service provider account' : 'Regular user account'}
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Full name</label>
                  <input placeholder="Chidi Okonkwo" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email address</label>
                  <input type="email" placeholder="chidi@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Password</label>
                  <input type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                {accountType === 'provider' && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Your skill or service *</label>
                    <select value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))}>
                      <option value="">Select what you do</option>
                      {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                {error && <p className="error">{error}</p>}
                <button type="submit" className="btn btn-green btn-full" disabled={loading} style={{ marginTop: 4, padding: '14px' }}>
                  {loading ? <span className="spin" style={{ width: 18, height: 18 }} /> : 'Create my account'}
                </button>
              </form>
            </div>
            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: 'var(--muted)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--green)', fontWeight: 500 }}>Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
