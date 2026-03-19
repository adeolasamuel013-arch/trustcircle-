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
    <div style={{ overflowX: 'hidden' }}>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '6rem 5% 4rem',
        background: 'linear-gradient(180deg, #E8F7F1 0%, #FAF8F3 100%)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 80, right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(46,204,138,0.08)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: 80, left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(245,166,35,0.08)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'white', color: 'var(--green-mid)',
            padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 500,
            marginBottom: '2rem', border: '1px solid #B8E8D4',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-light)', display: 'inline-block' }} />
            Now live across Nigeria
          </div>

          <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', lineHeight: 1.05, color: 'var(--green)', marginBottom: '1.5rem', fontFamily: 'Fraunces, serif' }}>
            Find people you can<br />
            <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>actually trust.</em>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--muted)', maxWidth: 560, lineHeight: 1.8, marginBottom: '2.5rem', margin: '0 auto 2.5rem' }}>
            TrustCircle is Nigeria's first trust network. Find verified mechanics, lawyers, doctors, designers and more — recommended by real people in your network, not fake reviews.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
            <Link to="/signup">
              <button style={{ background: 'var(--green)', color: 'white', border: 'none', fontSize: 16, fontWeight: 500, padding: '16px 36px', borderRadius: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Join TrustCircle free
              </button>
            </Link>
            <Link to="/search">
              <button style={{ background: 'white', color: 'var(--green)', border: '1.5px solid var(--green)', fontSize: 16, fontWeight: 500, padding: '16px 36px', borderRadius: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Search services
              </button>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ num: '100%', label: 'Real vouches only' }, { num: '18+', label: 'Service categories' }, { num: '0', label: 'Fake reviews' }].map(({ num, label }) => (
              <div key={label} style={{ background: 'white', borderRadius: 16, padding: '20px 28px', border: '1px solid var(--border)', textAlign: 'center', minWidth: 120 }}>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>{num}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ padding: '5rem 5%', background: 'var(--green)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: '1.5rem', color: 'white' }}>
            "Do you know a good mechanic?"
          </h2>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.75)', maxWidth: 600, margin: '0 auto 3rem', lineHeight: 1.8 }}>
            Every Nigerian asks this question. You post it on WhatsApp, get 10 different answers, and still don't know who to trust. TrustCircle solves this permanently.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '❌', title: 'Before TrustCircle', points: ['Random Google reviews', 'Strangers with fake ratings', 'Ask on WhatsApp and hope', 'Get scammed by imposters'] },
              { icon: '✅', title: 'With TrustCircle', points: ['Real people vouch for them', 'Trust score based on network', 'Find verified professionals', 'Safe transparent referrals'] },
            ].map(({ icon, title, points }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '2rem', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'left' }}>
                <p style={{ fontSize: 32, marginBottom: '1rem' }}>{icon}</p>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: '1rem' }}>{title}</h3>
                {points.map(p => (
                  <p key={p} style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8, lineHeight: 1.5 }}>{p}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '5rem 5%', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--green)', marginBottom: '3rem', textAlign: 'center' }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { num: '01', emoji: '👤', title: 'Create your profile', desc: 'Sign up free in 2 minutes. Tell us your name, email and what service you offer.' },
              { num: '02', emoji: '🤝', title: 'Vouch for people', desc: 'Know a great electrician or lawyer? Vouch for them. Your reputation is tied to every vouch.' },
              { num: '03', emoji: '🔍', title: 'Search trusted services', desc: 'Need help? Search by skill. We show the most trusted people ranked by real vouches.' },
              { num: '04', emoji: '⭐', title: 'Build your reputation', desc: 'The more vouches you get, the higher your score. Higher score means more clients find you.' },
            ].map(({ num, emoji, title, desc }) => (
              <div key={num} style={{ background: 'white', borderRadius: 16, padding: '2rem', border: '1px solid var(--border)', borderTop: '3px solid var(--green-light)' }}>
                <p style={{ fontSize: 36, marginBottom: '1rem' }}>{emoji}</p>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 13, color: 'var(--green-light)', fontWeight: 700, marginBottom: 8 }}>{num}</p>
                <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10, color: 'var(--green)' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: '5rem 5%', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--green)', marginBottom: '0.75rem', textAlign: 'center' }}>Find trusted help for anything</h2>
          <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: '2.5rem', fontSize: 16 }}>18 service categories across Nigeria</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
            {[
              { emoji: '🔧', name: 'Mechanic' }, { emoji: '⚡', name: 'Electrician' },
              { emoji: '🚿', name: 'Plumber' }, { emoji: '⚖️', name: 'Lawyer' },
              { emoji: '🩺', name: 'Doctor' }, { emoji: '📊', name: 'Accountant' },
              { emoji: '🎨', name: 'Designer' }, { emoji: '💻', name: 'Developer' },
              { emoji: '🍳', name: 'Chef' }, { emoji: '✂️', name: 'Tailor' },
              { emoji: '💇', name: 'Hair Stylist' }, { emoji: '📸', name: 'Photographer' },
              { emoji: '🚗', name: 'Driver' }, { emoji: '🪵', name: 'Carpenter' },
              { emoji: '🏠', name: 'Real Estate' }, { emoji: '📚', name: 'Teacher' },
            ].map(({ emoji, name }) => (
              <Link to="/search" key={name} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--cream)', borderRadius: 12, padding: '1.25rem 1rem', border: '1px solid var(--border)', textAlign: 'center', cursor: 'pointer' }}>
                  <p style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark)' }}>{name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '5rem 5%', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--green)', marginBottom: '2.5rem', textAlign: 'center' }}>Why Nigerians love TrustCircle</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              { quote: 'I found my mechanic through TrustCircle. He was vouched by 3 people I know. Best decision ever — transparent pricing and excellent work.', name: 'Funke A.', location: 'Lagos' },
              { quote: 'As a lawyer, my reputation is everything. TrustCircle lets clients verify my credibility before they even call me. My client base has grown massively.', name: 'Emeka O.', location: 'Abuja' },
              { quote: 'I was scammed by a fake electrician before. Now I only use TrustCircle. The trust score system actually works — real referrals from real people.', name: 'Blessing I.', location: 'Port Harcourt' },
            ].map(({ quote, name, location }) => (
              <div key={name} style={{ background: 'white', borderRadius: 16, padding: '2rem', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 32, color: 'var(--green-light)', marginBottom: '1rem' }}>"</p>
                <p style={{ fontSize: 14, color: 'var(--dark)', lineHeight: 1.8, marginBottom: '1.5rem', fontStyle: 'italic' }}>{quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white' }}>{name.charAt(0)}</div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 14 }}>{name}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>{location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '5rem 5%', background: 'white' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--green)', marginBottom: '2rem', textAlign: 'center' }}>Common questions</h2>
          {[
            { q: 'Is TrustCircle free?', a: 'Yes — completely free to join, vouch for people, and search for services. Always.' },
            { q: 'How is the trust score calculated?', a: 'Each vouch adds points based on the voucher\'s own score. A vouch from someone with 80 points adds more than someone with 10 — just like real life.' },
            { q: 'What stops people vouching for strangers?', a: 'Your own reputation. Every vouch you give is visible on your profile. If you vouch for someone unreliable, it reflects badly on you.' },
            { q: 'What services can I find?', a: 'Mechanics, electricians, plumbers, lawyers, doctors, accountants, designers, developers, chefs, tailors, photographers, drivers, carpenters and more across Nigeria.' },
          ].map(({ q, a }) => (
            <details key={q} style={{ background: 'var(--cream)', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid var(--border)', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <summary style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark)', listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                {q} <span style={{ color: 'var(--muted)' }}>+</span>
              </summary>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ margin: '0 5% 5rem', background: 'var(--green)', borderRadius: 24, padding: '5rem 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', maxWidth: 600 }}>
          Nigeria runs on "who you know."<br />
          <span style={{ color: 'var(--green-light)' }}>Now it runs on TrustCircle.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, maxWidth: 480, lineHeight: 1.7 }}>
          Join thousands of Nigerians building their digital reputation and finding trusted professionals.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/signup">
            <button style={{ background: 'var(--amber)', color: 'white', border: 'none', fontSize: 16, fontWeight: 500, padding: '16px 36px', borderRadius: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Get started free
            </button>
          </Link>
          <Link to="/how-it-works">
            <button style={{ background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', fontSize: 16, fontWeight: 500, padding: '16px 36px', borderRadius: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Learn more
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '2rem 5%', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 16, color: 'var(--green)', marginBottom: '0.5rem' }}>TrustCircle</p>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '0.75rem' }}>Built for Nigeria</p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/how-it-works" style={{ fontSize: 13, color: 'var(--muted)' }}>How it works</Link>
          <Link to="/search" style={{ fontSize: 13, color: 'var(--muted)' }}>Search</Link>
          <Link to="/leaderboard" style={{ fontSize: 13, color: 'var(--muted)' }}>Leaderboard</Link>
          <Link to="/signup" style={{ fontSize: 13, color: 'var(--muted)' }}>Sign up</Link>
        </div>
      </footer>
    </div>
  )
}


