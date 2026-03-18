import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '4rem 5%',
        background: 'radial-gradient(ellipse at 50% 0%, #E8F7F1 0%, var(--cream) 60%)'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--green-pale)', color: 'var(--green-mid)',
          padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
          marginBottom: '1.5rem', border: '1px solid #B8E8D4'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green-light)', display: 'inline-block' }}></span>
          Now live across Nigeria
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, color: 'var(--green)', maxWidth: 800, marginBottom: '1.5rem' }}>
          Find people you can<br /><em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>actually trust.</em>
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--muted)', maxWidth: 520, lineHeight: 1.7, marginBottom: '2.5rem' }}>
          TrustCircle connects you to verified service providers through real referrals from people in your network — not strangers with fake reviews.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/signup"><button className="btn-primary" style={{ fontSize: 16, padding: '14px 32px', borderRadius: 10 }}>Join TrustCircle free</button></Link>
          <Link to="/search"><button className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px', borderRadius: 10 }}>Search services</button></Link>
        </div>

        {/* Trust stat pills */}
        <div style={{ display: 'flex', gap: 16, marginTop: '3.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['Verified profiles', '100% real'], ['AI trust scoring', 'Network-based'], ['Zero fake reviews', 'Vouches only']].map(([title, sub]) => (
            <div key={title} className="card" style={{ padding: '12px 20px', textAlign: 'left', minWidth: 150 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--green)', marginBottom: 2 }}>{title}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '6rem 5%', maxWidth: 1000, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--green-light)', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>How it works</p>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--green)', marginBottom: '3rem' }}>Trust that travels<br />through your network.</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[
            { num: '01', title: 'Create your profile', desc: 'Sign up and tell us what service you offer. Your trust score starts at zero — it only grows through real vouches.' },
            { num: '02', title: 'Vouch for people you know', desc: 'Know a great electrician, lawyer, or chef? Vouch for them. Your reputation is tied to every vouch you give.' },
            { num: '03', title: 'Search trusted services', desc: 'When you need help, search for a service. We surface people trusted by your network — not random strangers.' },
            { num: '04', title: 'AI calculates trust chains', desc: 'Our AI scores how trusted someone is across extended networks — like 6 degrees of separation, but for reliability.' },
          ].map(({ num, title, desc }) => (
            <div key={num} className="card" style={{ borderTop: '3px solid var(--green-light)' }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: 'var(--green-pale)', fontWeight: 900, marginBottom: '0.75rem', lineHeight: 1 }}>{num}</p>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--green)' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        margin: '0 5% 6rem',
        background: 'var(--green)',
        borderRadius: 20,
        padding: '4rem 5%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        gap: '1.5rem'
      }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', color: 'var(--white)' }}>
          Nigeria runs on "who you know."<br />
          <span style={{ color: 'var(--green-light)' }}>Now it runs on TrustCircle.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 480 }}>
          Join thousands of Nigerians building their reputation and finding trusted help.
        </p>
        <Link to="/signup">
          <button className="btn-amber" style={{ fontSize: 16, padding: '14px 36px', borderRadius: 10 }}>
            Get started — it's free
          </button>
        </Link>
      </section>
    </div>
  )
}
