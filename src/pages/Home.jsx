import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  useEffect(() => { if (user) navigate('/dashboard') }, [user])

  return (
    <div>
      <style>{`
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .stats-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 2.5rem; }
        .stat-box { background: white; border-radius: 14px; padding: 18px 24px; border: 1px solid var(--border); text-align: center; min-width: 110px; flex: 1; max-width: 160px; }
        .how-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .service-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .compare-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .testimonials-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .cta-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        @media(min-width: 480px) {
          .service-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media(min-width: 640px) {
          .how-grid { grid-template-columns: repeat(2, 1fr); }
          .compare-grid { grid-template-columns: repeat(2, 1fr); }
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
          .service-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media(min-width: 900px) {
          .how-grid { grid-template-columns: repeat(4, 1fr); }
          .testimonials-grid { grid-template-columns: repeat(3, 1fr); }
          .service-grid { grid-template-columns: repeat(8, 1fr); }
        }
        details summary::-webkit-details-marker { display: none; }
      `}</style>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(180deg, #C8EFE0 0%, #FAF8F3 100%)', padding: '5rem 1.25rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: 'var(--green-mid)', padding: '7px 18px', borderRadius: 999, fontSize: 13, fontWeight: 500, marginBottom: '1.5rem', border: '1px solid #B8E8D4' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-light)', display: 'inline-block' }} />
            Live across Nigeria 
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 8vw, 4.5rem)', lineHeight: 1.08, color: 'var(--green)', marginBottom: '1.25rem' }}>
            Find people you can<br /><em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>actually trust.</em>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            Nigeria's first trust network. Find mechanics, lawyers, doctors, designers and more — verified through real vouches from real people you know. No fake reviews.
          </p>
          <div className="hero-btns">
            <Link to="/signup"><button className="btn btn-green" style={{ fontSize: 16, padding: '15px 32px' }}>Join free — it takes 2 mins</button></Link>
            <Link to="/search"><button className="btn btn-outline" style={{ fontSize: 16, padding: '15px 32px' }}>Search services</button></Link>
          </div>
          <div className="stats-row">
            {[{ num: '100%', label: 'Real vouches' }, { num: '18+', label: 'Categories' }, { num: '0', label: 'Fake reviews' }].map(({ num, label }) => (
              <div key={label} className="stat-box">
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>{num}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section style={{ background: 'var(--green)', padding: '4rem 1.25rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', color: 'white', textAlign: 'center', marginBottom: '1rem' }}>
            "Do you know a good mechanic?"
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', textAlign: 'center', fontSize: 16, lineHeight: 1.8, maxWidth: 560, margin: '0 auto 2.5rem' }}>
            Every Nigerian asks this on WhatsApp. You get 10 different names. Still don't know who to trust. Prov fixes this forever.
          </p>
          <div className="compare-grid">
            {[
              { icon: '❌', title: 'Before Prov', bg: 'rgba(255,255,255,0.06)', points: ['Random Google reviews', 'Strangers with fake ratings', 'Post on WhatsApp and pray', 'Risk getting scammed'] },
              { icon: '✅', title: 'With Prov', bg: 'rgba(46,204,138,0.15)', points: ['Real people vouch for them', 'AI trust score from your network', 'Find verified professionals', 'Safe and transparent always'] },
            ].map(({ icon, title, bg, points }) => (
              <div key={title} style={{ background: bg, borderRadius: 16, padding: '1.75rem', border: '1px solid rgba(255,255,255,0.12)' }}>
                <p style={{ fontSize: 36, marginBottom: '1rem' }}>{icon}</p>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: '1rem' }}>{title}</h3>
                {points.map(p => <p key={p} style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8, lineHeight: 1.6 }}>• {p}</p>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '4rem 1.25rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--green-light)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', color: 'var(--green)', textAlign: 'center', marginBottom: '2.5rem' }}>Simple. Trusted. Nigerian.</h2>
          <div className="how-grid">
            {[
              { n: '01', e: '👤', t: 'Create your profile', d: 'Sign up free. Tell us your name and what service you offer. Takes 2 minutes.' },
              { n: '02', e: '🤝', t: 'Vouch for people', d: 'Know a great plumber or lawyer? Vouch for them. Your reputation is tied to every vouch you give.' },
              { n: '03', e: '🔍', t: 'Search trusted services', d: 'Search by skill. We show the most trusted people ranked by real vouches from real networks.' },
              { n: '04', e: '⭐', t: 'Build your reputation', d: 'Every vouch grows your trust score. Higher score means more clients find you.' },
            ].map(({ n, e, t, d }) => (
              <div key={n} style={{ background: 'white', borderRadius: 14, padding: '1.5rem', border: '1px solid var(--border)', borderTop: '3px solid var(--green-light)' }}>
                <p style={{ fontSize: 32, marginBottom: '0.75rem' }}>{e}</p>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 13, color: 'var(--green-light)', fontWeight: 700, marginBottom: 6 }}>{n}</p>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--green)', marginBottom: 8 }}>{t}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: '4rem 1.25rem', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', color: 'var(--green)', textAlign: 'center', marginBottom: 8 }}>Find trusted help for anything</h2>
          <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: '2rem', fontSize: 15 }}>18 service categories across Nigeria</p>
          <div className="service-grid">
            {[
              { e: '🔧', n: 'Mechanic' }, { e: '⚡', n: 'Electrician' }, { e: '🚿', n: 'Plumber' }, { e: '⚖️', n: 'Lawyer' },
              { e: '🩺', n: 'Doctor' }, { e: '📊', n: 'Accountant' }, { e: '🎨', n: 'Designer' }, { e: '💻', n: 'Developer' },
              { e: '🍳', n: 'Chef' }, { e: '✂️', n: 'Tailor' }, { e: '💇', n: 'Hair Stylist' }, { e: '📸', n: 'Photographer' },
              { e: '🚗', n: 'Driver' }, { e: '🪵', n: 'Carpenter' }, { e: '🏠', n: 'Real Estate' }, { e: '📚', n: 'Teacher' },
            ].map(({ e, n }) => (
              <Link key={n} to="/search">
                <div style={{ background: 'var(--cream)', borderRadius: 12, padding: '1rem 0.5rem', border: '1px solid var(--border)', textAlign: 'center', cursor: 'pointer' }}>
                  <p style={{ fontSize: 26, marginBottom: 6 }}>{e}</p>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark)' }}>{n}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '4rem 1.25rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', color: 'var(--green)', textAlign: 'center', marginBottom: '2rem' }}>Why Nigerians love Prov</h2>
          <div className="testimonials-grid">
            {[
              { q: 'I found my mechanic through Prov. He was vouched by 3 people I know personally. Transparent pricing and excellent work.', n: 'Funke A.', l: 'Lagos' },
              { q: 'As a lawyer, my reputation is everything. Prov lets clients verify me before they call. My client base has grown massively.', n: 'Emeka O.', l: 'Abuja' },
              { q: 'I was scammed by a fake electrician before. Now I only use Prov. The trust score system actually works — real referrals only.', n: 'Blessing I.', l: 'Port Harcourt' },
            ].map(({ q, n, l }) => (
              <div key={n} style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 30, color: 'var(--green-light)', marginBottom: '0.75rem', lineHeight: 1 }}>"</p>
                <p style={{ fontSize: 14, color: 'var(--dark)', lineHeight: 1.8, marginBottom: '1.25rem', fontStyle: 'italic' }}>{q}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>{n.charAt(0)}</div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 14 }}>{n}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>{l}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '4rem 1.25rem', background: 'white' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', color: 'var(--green)', textAlign: 'center', marginBottom: '1.75rem' }}>Common questions</h2>
          {[
            { q: 'Is Prov free to use?', a: 'Yes — joining, vouching for people and searching for services is completely free. Always.' },
            { q: 'How is the trust score calculated?', a: 'Every vouch adds points based on the voucher\'s own score. A vouch from someone with 80 points adds more than someone at 10 — just like real-life reputation.' },
            { q: 'What stops people vouching for strangers?', a: 'Your own reputation. Every vouch you give is public on your profile. Vouching for unreliable people reflects badly on you.' },
            { q: 'Is Prov free to join?', a: 'Yes — completely free to join, vouch for people and search for services. Always.' },
            { q: 'What services can I find?', a: 'Mechanics, electricians, plumbers, lawyers, doctors, accountants, designers, developers, chefs, tailors, photographers, drivers, carpenters and more across Nigeria.' },
          ].map(({ q, a }) => (
            <details key={q} style={{ background: 'var(--cream)', borderRadius: 12, padding: '1.1rem 1.25rem', border: '1px solid var(--border)', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <summary style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {q}<span style={{ color: 'var(--muted)', fontSize: 20, fontWeight: 300, marginLeft: 12, flexShrink: 0 }}>+</span>
              </summary>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ margin: '0 1rem 3rem', background: 'var(--green)', borderRadius: 20, padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)', color: 'white', marginBottom: '1rem', maxWidth: 560, margin: '0 auto 1rem' }}>
          Nigeria runs on "who you know."<br />
          <span style={{ color: 'var(--green-light)' }}>Now it runs on Prov.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, maxWidth: 440, margin: '0 auto 2rem', lineHeight: 1.7 }}>
          Join thousands of Nigerians building their digital reputation and finding trusted professionals.
        </p>
        <div className="cta-btns">
          <Link to="/signup"><button className="btn btn-amber" style={{ fontSize: 16, padding: '15px 32px' }}>Get started free</button></Link>
          <Link to="/how-it-works"><button style={{ background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', fontSize: 16, padding: '15px 32px', borderRadius: 10, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Learn more</button></Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '2rem 1.25rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 17, color: 'var(--green)', marginBottom: 6 }}>Prov</p>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1rem' }}>Built for Nigeria  © 2026</p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['/', 'Home'], ['/search', 'Search'], ['/leaderboard', 'Leaderboard'], ['/how-it-works', 'How it works'], ['/signup', 'Sign up']].map(([to, label]) => (
            <Link key={to} to={to} style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
