import { Link } from 'react-router-dom'

export default function HowItWorks() {
  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', color: 'var(--green)', marginBottom: '1rem' }}>How TrustCircle works</h1>
        <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>TrustCircle digitises the way Nigerians already find trusted people — through referrals — and uses AI to scale it to millions.</p>
      </div>

      {[
        { n: '01', e: '👤', t: 'Create your profile', d: 'Sign up free in 2 minutes. Tell us your name, email and what service you offer. Your trust score starts at zero — it only grows through real vouches.' },
        { n: '02', e: '🤝', t: 'Vouch for people you know', d: 'Know a great electrician or lawyer? Vouch for them. Your reputation is tied to every vouch you give — so only vouch for people you truly trust.' },
        { n: '03', e: '🔍', t: 'Search trusted services', d: 'Need help? Search by skill. We show the most trusted people ranked by real vouches from real people in your network.' },
        { n: '04', e: '🤖', t: 'AI calculates trust chains', d: 'Our algorithm weighs each vouch by the voucher\'s own trust score. A vouch from a highly trusted person carries more weight — just like in real life.' },
        { n: '05', e: '⭐', t: 'Build your reputation', d: 'The more vouches you receive, the higher your score. A high score attracts more clients and more opportunities across Nigeria.' },
      ].map(({ n, e, t, d }, i, arr) => (
        <div key={n} style={{ display: 'flex', gap: '1.25rem', paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'var(--green)', fontSize: 14 }}>{n}</div>
          <div>
            <p style={{ fontSize: 24, marginBottom: 6 }}>{e}</p>
            <h3 style={{ fontSize: 17, color: 'var(--green)', marginBottom: 8 }}>{t}</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75 }}>{d}</p>
          </div>
        </div>
      ))}

      {/* Trust score explainer */}
      <div className="card" style={{ background: 'var(--amber-light)', border: '1px solid #F5A62344', marginTop: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 20, color: 'var(--green)', marginBottom: '1rem' }}>Understanding the trust score</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '0.75rem' }}>
          {[
            { r: '0–20', l: 'New member', c: 'var(--muted)' },
            { r: '20–40', l: 'Building trust', c: '#9A6700' },
            { r: '40–70', l: 'Growing', c: 'var(--amber)' },
            { r: '70–100', l: 'Highly trusted ⭐', c: 'var(--green-mid)' },
          ].map(({ r, l, c }) => (
            <div key={r} style={{ background: 'white', borderRadius: 10, padding: '0.875rem' }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 18, color: c, marginBottom: 4 }}>{r}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <h2 style={{ fontSize: 22, color: 'var(--green)', marginBottom: '1.25rem' }}>Frequently asked questions</h2>
      {[
        { q: 'Is TrustCircle free?', a: 'Yes — joining, vouching for people and searching for services is completely free. Always.' },
        { q: 'How is the trust score calculated?', a: 'Each vouch adds points based on the voucher\'s own score. A vouch from someone with 80 points adds more than someone at 10 — just like real life.' },
        { q: 'What stops people vouching for strangers?', a: 'Your own reputation. Every vouch you give is visible on your profile. Vouching for unreliable people reflects badly on you.' },
        { q: 'Why can\'t I log in after signing up?', a: 'Check your email for a confirmation email from Supabase. Click the link inside it and then you can log in.' },
        { q: 'What services can I find?', a: 'Mechanics, electricians, plumbers, lawyers, doctors, accountants, designers, developers, chefs, tailors, photographers, drivers, carpenters and more across Nigeria.' },
      ].map(({ q, a }) => (
        <details key={q} style={{ background: 'var(--cream)', borderRadius: 12, padding: '1.1rem 1.25rem', border: '1px solid var(--border)', marginBottom: '0.75rem', cursor: 'pointer' }}>
          <summary style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none' }}>
            {q}<span style={{ color: 'var(--muted)', fontSize: 22, fontWeight: 300, marginLeft: 12, flexShrink: 0 }}>+</span>
          </summary>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>{a}</p>
        </details>
      ))}

      <div style={{ background: 'var(--green)', borderRadius: 16, padding: '2.5rem', textAlign: 'center', marginTop: '2rem' }}>
        <h2 style={{ color: 'white', marginBottom: '0.75rem', fontSize: 22 }}>Ready to build your trust?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: 15 }}>Join TrustCircle free today.</p>
        <Link to="/signup"><button className="btn btn-amber">Get started free</button></Link>
      </div>
    </div>
  )
}
