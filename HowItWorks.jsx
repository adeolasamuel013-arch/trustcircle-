import { Link } from 'react-router-dom'

const steps = [
  {
    num: '01', title: 'Sign up and set your skill',
    body: 'Create a free account and tell the network what service you offer — whether you\'re a mechanic in Lagos, a lawyer in Abuja, or a tailor in Port Harcourt.'
  },
  {
    num: '02', title: 'Build your trust through vouches',
    body: 'Your trust score starts at zero. It only grows when real people in the network vouch for your work. Every vouch carries a weight based on how trusted the voucher is.'
  },
  {
    num: '03', title: 'Vouch for people you know',
    body: 'Know someone who does great work? Vouch for them. Your reputation is linked to every vouch you give — so only vouch for people you genuinely trust.'
  },
  {
    num: '04', title: 'Search trusted services',
    body: 'When you need help, search by skill or name. TrustCircle surfaces the most trusted people available — ranked by real vouches, not paid promotions or fake reviews.'
  },
  {
    num: '05', title: 'AI calculates trust chains',
    body: 'Our algorithm weighs each vouch by the voucher\'s own trust score. A vouch from a highly trusted person carries more weight — just like in real life, reputation travels through networks.'
  },
]

const faqs = [
  {
    q: 'Is TrustCircle free?',
    a: 'Yes — creating a profile, vouching for people, and searching for services is completely free. We may introduce premium features in the future.'
  },
  {
    q: 'Can I remove a vouch I gave?',
    a: 'Currently vouches are permanent, which is by design — it encourages people to only vouch for people they truly trust. We may introduce vouch editing in future.'
  },
  {
    q: 'What stops people from vouching for strangers?',
    a: 'Your own reputation. Every vouch you give is publicly visible on your profile. If you vouch for someone unreliable, it reflects on you. The system is designed so that your vouches are an extension of your own credibility.'
  },
  {
    q: 'How is the trust score calculated?',
    a: 'Each vouch adds points to your score based on the voucher\'s own trust level. A vouch from someone with a score of 80 carries more weight than one from someone at 10. Your score is capped at 100.'
  },
  {
    q: 'What services can I find on TrustCircle?',
    a: 'Mechanics, electricians, plumbers, lawyers, doctors, accountants, designers, developers, chefs, tailors, photographers, drivers, carpenters, and more — any skilled service provider in Nigeria.'
  },
]

export default function HowItWorks() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 5%' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--green-light)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>How TrustCircle works</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--green)', marginBottom: '1rem', lineHeight: 1.15 }}>
          Nigeria runs on<br />"who you know."
        </h1>
        <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          TrustCircle digitises the way Nigerians already find trusted people — through referrals — and uses AI to scale it to millions.
        </p>
      </div>

      {/* Steps */}
      <div style={{ marginBottom: '4rem' }}>
        {steps.map((s, i) => (
          <div key={s.num} style={{
            display: 'flex', gap: '1.5rem', marginBottom: '1.5rem',
            paddingBottom: '1.5rem',
            borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{
              flexShrink: 0, width: 48, height: 48,
              borderRadius: '50%', background: 'var(--green-pale)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 16, color: 'var(--green)'
            }}>
              {s.num}
            </div>
            <div>
              <h3 style={{ fontSize: 17, color: 'var(--green)', marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust score explainer */}
      <div className="card" style={{ borderTop: '3px solid var(--amber)', marginBottom: '4rem', background: 'var(--amber-light)' }}>
        <h2 style={{ fontSize: 20, color: 'var(--green)', marginBottom: '1rem' }}>How the trust score works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { range: '0 – 20', label: 'New member', color: 'var(--muted)', desc: 'Just joined, no vouches yet.' },
            { range: '20 – 40', label: 'Building trust', color: '#9A6700', desc: 'A few vouches from new members.' },
            { range: '40 – 70', label: 'Growing', color: 'var(--amber)', desc: 'Vouched by established members.' },
            { range: '70 – 100', label: 'Highly trusted', color: 'var(--green-mid)', desc: 'Many vouches from trusted people.' },
          ].map(({ range, label, color, desc }) => (
            <div key={range} style={{ background: 'white', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, color, marginBottom: 4 }}>{range}</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark)', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: 22, color: 'var(--green)', marginBottom: '1.5rem' }}>Frequently asked questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map(({ q, a }) => (
            <details key={q} className="card" style={{ cursor: 'pointer' }}>
              <summary style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {q}
                <span style={{ fontSize: 18, color: 'var(--muted)', flexShrink: 0, marginLeft: 12 }}>+</span>
              </summary>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--green)', borderRadius: 16 }}>
        <h2 style={{ fontSize: 24, color: 'white', marginBottom: '0.75rem' }}>Ready to build your trust?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: 15 }}>Join TrustCircle free today.</p>
        <Link to="/signup"><button className="btn-amber" style={{ fontSize: 15, padding: '13px 32px', borderRadius: 10 }}>Get started</button></Link>
      </div>
    </div>
  )
}
