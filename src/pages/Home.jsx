import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon, { SKILL_ICONS } from '../components/Icon'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const tickerRef = useRef()

  useEffect(() => { if (user) navigate('/dashboard') }, [user])

  // Intersection observer for scroll reveals
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target) } })
    }, { threshold: 0.12 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const services = [
    { skill: 'Mechanic' }, { skill: 'Electrician' }, { skill: 'Plumber' },
    { skill: 'Lawyer' }, { skill: 'Doctor' }, { skill: 'Accountant' },
    { skill: 'Graphic Designer' }, { skill: 'Web Developer' },
    { skill: 'Chef / Caterer' }, { skill: 'Tailor / Fashion' },
    { skill: 'Hair Stylist' }, { skill: 'Photographer' },
    { skill: 'Driver' }, { skill: 'Carpenter' },
    { skill: 'Real Estate Agent' }, { skill: 'Teacher / Tutor' },
  ]

  const tickerItems = ['Mechanic', 'Lawyer', 'Electrician', 'Doctor', 'Photographer', 'Accountant', 'Chef', 'Designer', 'Tailor', 'Plumber', 'Driver', 'Developer']

  return (
    <div style={{ background: 'var(--sand)' }}>
      <style>{`
        /* Reveal animation */
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
        .revealed { opacity: 1; transform: translateY(0); }

        /* Ticker */
        .ticker-wrap { overflow: hidden; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--forest); padding: 0; }
        .ticker-track { display: flex; gap: 0; animation: ticker 22s linear infinite; width: max-content; }
        .ticker-item { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.7); padding: 12px 28px; border-right: 1px solid rgba(255,255,255,0.1); white-space: nowrap; display: flex; align-items: center; gap: 10px; }
        .ticker-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--leaf); flex-shrink: 0; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* Hero */
        .hero { min-height: calc(100vh - 64px); display: grid; grid-template-columns: 1fr; position: relative; overflow: hidden; background: var(--forest); }
        @media(min-width: 900px) { .hero { grid-template-columns: 1fr 1fr; min-height: calc(100vh - 64px); } }

        .hero-left { display: flex; flex-direction: column; justify-content: center; padding: 4rem 3rem 4rem 4rem; position: relative; z-index: 2; }
        @media(max-width: 900px) { .hero-left { padding: 3rem 1.5rem; } }

        .hero-right { position: relative; display: none; }
        @media(min-width: 900px) { .hero-right { display: block; } }

        .hero-bg-pattern {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle at 20% 50%, rgba(82,183,136,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(201,168,76,0.06) 0%, transparent 40%);
        }
        .hero-grid-lines {
          position: absolute; inset: 0; opacity: 0.04;
          background-image:
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 2rem; }
        .eyebrow-line { width: 32px; height: 1.5px; background: var(--leaf); }
        .eyebrow-text { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--leaf); }

        .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 6vw, 5.5rem); font-weight: 900; color: white; line-height: 1.0; margin-bottom: 1.5rem; }
        .hero-title em { font-style: italic; color: var(--gold); }

        .hero-body { font-size: clamp(1rem, 2vw, 1.1rem); color: rgba(255,255,255,0.55); line-height: 1.8; max-width: 460px; margin-bottom: 2.5rem; font-weight: 300; }

        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 3rem; }
        .hero-btn-primary { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.05em; background: var(--terracotta); color: white; border: none; padding: 14px 28px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .hero-btn-primary:hover { background: #b3562f; transform: translateY(-1px); }
        .hero-btn-secondary { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.03em; background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); padding: 14px 28px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .hero-btn-secondary:hover { border-color: rgba(255,255,255,0.5); color: white; }

        .hero-proof { display: flex; gap: 2.5rem; flex-wrap: wrap; }
        .proof-item { }
        .proof-num { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: white; line-height: 1; }
        .proof-label { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 3px; font-family: 'Syne', sans-serif; font-weight: 500; letter-spacing: 0.05em; }

        /* Hero right panel */
        .hero-panel { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 3rem 3rem 3rem 1.5rem; }
        .trust-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(8px); width: 100%; max-width: 340px; }
        .trust-card-header { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 1.25rem; }
        .trust-person { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .trust-person:last-child { border-bottom: none; }
        .trust-avatar { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-weight: 700; font-size: 16px; color: white; flex-shrink: 0; }
        .trust-info { flex: 1; }
        .trust-name { font-size: 14px; font-weight: 500; color: white; margin-bottom: 2px; }
        .trust-skill { font-size: 12px; color: rgba(255,255,255,0.4); font-family: 'Syne', sans-serif; }
        .trust-score-badge { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--leaf); }
        .trust-vouch-line { font-size: 12px; color: rgba(255,255,255,0.35); padding: 10px 0 0; font-style: italic; }

        /* Problem section */
        .problem-section { background: var(--parchment); padding: 6rem 1.5rem; position: relative; overflow: hidden; }
        .problem-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 4rem; }
        @media(min-width: 900px) { .problem-inner { grid-template-columns: 1fr 1fr; align-items: center; } }
        .problem-text-col { }
        .problem-quote { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 700; color: var(--forest); line-height: 1.2; margin-bottom: 1.5rem; }
        .problem-quote em { font-style: italic; color: var(--terracotta); }
        .problem-sub { font-size: 16px; color: var(--mist); line-height: 1.8; font-weight: 300; }
        .problem-cards-col { display: flex; flex-direction: column; gap: 12px; }
        .prob-item { display: flex; gap: 16px; align-items: flex-start; background: var(--white); border-radius: 10px; padding: 18px; border: 1px solid var(--border); }
        .prob-num { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: var(--border); line-height: 1; flex-shrink: 0; width: 44px; }
        .prob-text { font-size: 15px; color: var(--ink); line-height: 1.6; }
        .prob-text strong { color: var(--forest); font-weight: 600; }

        /* Solution section */
        .solution-section { background: var(--white); padding: 6rem 1.5rem; }
        .solution-inner { max-width: 1100px; margin: 0 auto; }
        .solution-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 3rem; flex-wrap: wrap; gap: 1rem; }
        .solution-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; color: var(--forest); line-height: 1.1; max-width: 600px; }
        .solution-title em { font-style: italic; color: var(--terracotta); }
        .steps-row { display: grid; grid-template-columns: 1fr; gap: 1px; background: var(--border); border-radius: 12px; overflow: hidden; }
        @media(min-width: 640px) { .steps-row { grid-template-columns: repeat(2, 1fr); } }
        @media(min-width: 1000px) { .steps-row { grid-template-columns: repeat(4, 1fr); } }
        .step-item { background: var(--white); padding: 2rem 1.75rem; position: relative; transition: background 0.2s; }
        .step-item:hover { background: var(--sand); }
        .step-count { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 900; color: var(--parchment); line-height: 1; margin-bottom: 1rem; }
        .step-icon-wrap { width: 44px; height: 44px; border-radius: 8px; background: var(--sand); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; border: 1px solid var(--border); }
        .step-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: var(--forest); margin-bottom: 8px; }
        .step-desc { font-size: 14px; color: var(--mist); line-height: 1.7; }

        /* Services section */
        .services-section { background: var(--forest); padding: 6rem 1.5rem; }
        .services-inner { max-width: 1100px; margin: 0 auto; }
        .services-header { margin-bottom: 2.5rem; }
        .services-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3rem); color: white; font-weight: 900; margin-bottom: 8px; }
        .services-title em { font-style: italic; color: var(--gold); }
        .services-sub { font-size: 15px; color: rgba(255,255,255,0.4); }
        .services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
        @media(min-width: 640px) { .services-grid { grid-template-columns: repeat(4, 1fr); } }
        @media(min-width: 900px) { .services-grid { grid-template-columns: repeat(8, 1fr); } }
        .svc-item { background: rgba(255,255,255,0.03); padding: 1.25rem 0.75rem; text-align: center; cursor: pointer; transition: background 0.15s; text-decoration: none; display: block; }
        .svc-item:hover { background: rgba(255,255,255,0.08); }
        .svc-icon-wrap { width: 40px; height: 40px; border-radius: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
        .svc-label { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.03em; color: rgba(255,255,255,0.6); line-height: 1.3; }

        /* Testimonials */
        .testimonials-section { background: var(--sand); padding: 6rem 1.5rem; }
        .testimonials-inner { max-width: 1100px; margin: 0 auto; }
        .testimonials-header { display: grid; grid-template-columns: 1fr; gap: 3rem; margin-bottom: 3rem; }
        @media(min-width: 900px) { .testimonials-header { grid-template-columns: 1fr 1fr; align-items: end; } }
        .testimonials-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3rem); font-weight: 900; color: var(--forest); line-height: 1.1; }
        .testimonials-body { font-size: 15px; color: var(--mist); line-height: 1.8; }
        .testimonials-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @media(min-width: 640px) { .testimonials-grid { grid-template-columns: repeat(2, 1fr); } }
        @media(min-width: 900px) { .testimonials-grid { grid-template-columns: repeat(3, 1fr); } }
        .testi-card { background: var(--white); border-radius: 12px; padding: 1.75rem; border: 1px solid var(--border); transition: transform 0.2s, box-shadow 0.2s; }
        .testi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(27,58,45,0.08); }
        .testi-stars { display: flex; gap: 3px; margin-bottom: 1rem; }
        .testi-quote { font-size: 15px; color: var(--ink); line-height: 1.75; margin-bottom: 1.5rem; font-style: italic; font-family: 'DM Sans', sans-serif; font-weight: 300; }
        .testi-author { display: flex; align-items: center; gap: 10px; }
        .testi-av { width: 38px; height: 38px; border-radius: 8px; background: var(--forest); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .testi-name { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: var(--forest); }
        .testi-loc { font-size: 12px; color: var(--mist); }

        /* FAQ */
        .faq-section { background: var(--white); padding: 6rem 1.5rem; }
        .faq-inner { max-width: 740px; margin: 0 auto; }
        .faq-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3rem); color: var(--forest); margin-bottom: 2.5rem; text-align: center; }
        .faq-item { border-bottom: 1px solid var(--border); }
        .faq-item summary { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; color: var(--ink); cursor: pointer; padding: 1.25rem 0; display: flex; justify-content: space-between; align-items: center; gap: 1rem; list-style: none; }
        .faq-item summary:hover { color: var(--forest); }
        .faq-item p { font-size: 15px; color: var(--mist); line-height: 1.8; padding-bottom: 1.25rem; }

        /* CTA */
        .cta-section { background: var(--ink); padding: 7rem 1.5rem; text-align: center; position: relative; overflow: hidden; }
        .cta-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(82,183,136,0.12) 0%, transparent 60%); pointer-events: none; }
        .cta-inner { max-width: 700px; margin: 0 auto; position: relative; z-index: 1; }
        .cta-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 1.5rem; }
        .cta-title { font-family: 'Playfair Display', serif; font-size: clamp(2.2rem, 6vw, 4rem); font-weight: 900; color: white; line-height: 1.08; margin-bottom: 1.5rem; }
        .cta-title em { font-style: italic; color: var(--gold); }
        .cta-sub { font-size: 17px; color: rgba(255,255,255,0.45); line-height: 1.8; margin-bottom: 2.5rem; font-weight: 300; }
        .cta-buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* Footer */
        .footer { background: var(--ink); border-top: 1px solid rgba(255,255,255,0.06); padding: 2rem 1.5rem; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
        .footer-brand { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: white; }
        .footer-links { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .footer-link { font-size: 13px; color: rgba(255,255,255,0.35); font-family: 'Syne', sans-serif; transition: color 0.15s; }
        .footer-link:hover { color: rgba(255,255,255,0.7); }
        .footer-copy { font-size: 12px; color: rgba(255,255,255,0.2); font-family: 'Syne', sans-serif; width: 100%; margin-top: 0.5rem; }
      `}</style>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="ticker-item">
              <div className="ticker-dot" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="hero grain">
        <div className="hero-bg-pattern" />
        <div className="hero-grid-lines" />

        <div className="hero-left">
          <div className="hero-eyebrow fade-up">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Nigeria's Trust Network</span>
          </div>

          <h1 className="hero-title fade-up-2">
            Find people<br />you can<br /><em>actually trust.</em>
          </h1>

          <p className="hero-body fade-up-3">
            Every Nigerian knows the pain of trusting the wrong person. Prov fixes that — with real vouches from real people whose own reputation is on the line.
          </p>

          <div className="hero-actions fade-up-4">
            <Link to="/signup">
              <button className="hero-btn-primary">Join free — 2 minutes</button>
            </Link>
            <Link to="/search">
              <button className="hero-btn-secondary">Search services</button>
            </Link>
          </div>

          <div className="hero-proof fade-up-4">
            {[{ n: '100%', l: 'Real vouches' }, { n: '18+', l: 'Service categories' }, { n: '0', l: 'Fake reviews' }].map(({ n, l }) => (
              <div key={l} className="proof-item">
                <div className="proof-num">{n}</div>
                <div className="proof-label">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-panel">
            <div className="trust-card fade-up-3">
              <div className="trust-card-header">Trusted in your area</div>
              {[
                { name: 'Chidi Okonkwo', skill: 'Mechanic', score: 87, bg: '#2D6A4F' },
                { name: 'Funke Adeyemi', skill: 'Lawyer', score: 92, bg: '#C4623A' },
                { name: 'Emeka Nwosu', skill: 'Electrician', score: 74, bg: '#1B3A2D' },
              ].map(({ name, skill, score, bg }) => (
                <div key={name} className="trust-person">
                  <div className="trust-avatar" style={{ background: bg }}>{name.charAt(0)}</div>
                  <div className="trust-info">
                    <div className="trust-name">{name}</div>
                    <div className="trust-skill">{skill}</div>
                  </div>
                  <div className="trust-score-badge">{score}</div>
                </div>
              ))}
              <div className="trust-vouch-line">"14 real people vouched for Chidi — all with their reputation on the line."</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem-section">
        <div className="problem-inner">
          <div className="problem-text-col reveal">
            <div className="overline" style={{ marginBottom: '1rem' }}>The problem</div>
            <h2 className="problem-quote">
              "Do you know anyone who can do this and <em>will not cheat me?</em>"
            </h2>
            <p className="problem-sub">
              Every Nigerian has asked this question. You post on WhatsApp, get ten different names, pick one randomly and hope for the best. Prov ends that cycle — permanently.
            </p>
          </div>
          <div className="problem-cards-col">
            {[
              { n: '01', text: 'You need a mechanic. <strong>You have no idea who to trust.</strong>' },
              { n: '02', text: 'You post on WhatsApp. <strong>20 people, 20 different names.</strong>' },
              { n: '03', text: 'You pick one randomly. <strong>He collects money and does a bad job.</strong>' },
              { n: '04', text: 'This happens every single day <strong>across Nigeria.</strong>' },
            ].map(({ n, text }, i) => (
              <div key={n} className="prob-item reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="prob-num">{n}</div>
                <p className="prob-text" dangerouslySetInnerHTML={{ __html: text }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="solution-section">
        <div className="solution-inner">
          <div className="solution-header">
            <h2 className="solution-title reveal">
              Simple.<br />Trusted.<br /><em>Nigerian.</em>
            </h2>
            <Link to="/how-it-works" className="reveal">
              <button className="btn btn-outline" style={{ alignSelf: 'flex-end' }}>See full guide</button>
            </Link>
          </div>
          <div className="steps-row">
            {[
              { n: '01', icon: 'user', title: 'Create your profile', desc: 'Join free in 2 minutes. Tell us your service — or just join to find and vouch for people you trust.' },
              { n: '02', icon: 'vouch', title: 'Vouch for people', desc: 'Know a great mechanic or lawyer? Vouch for them. Your reputation is on the line with every vouch you give.' },
              { n: '03', icon: 'search', title: 'Find trusted services', desc: 'Search by skill. We rank the most trusted people by real vouches from real people in your community.' },
              { n: '04', icon: 'award', title: 'Build your reputation', desc: 'Every vouch grows your score. Higher score means more clients find you and trust you before you even meet.' },
            ].map(({ n, icon, title, desc }, i) => (
              <div key={n} className="step-item reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="step-count">{n}</div>
                <div className="step-icon-wrap">
                  <Icon name={icon} size={20} color="var(--forest)" />
                </div>
                <div className="step-title">{title}</div>
                <p className="step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services-section">
        <div className="services-inner">
          <div className="services-header reveal">
            <h2 className="services-title">Find trusted help<br />for <em>anything.</em></h2>
            <p className="services-sub">18 verified service categories across Nigeria</p>
          </div>
          <div className="services-grid reveal">
            {services.map(({ skill }) => (
              <Link key={skill} to="/search" className="svc-item">
                <div className="svc-icon-wrap">
                  <Icon name={SKILL_ICONS[skill] || 'user'} size={20} color="rgba(255,255,255,0.7)" />
                </div>
                <div className="svc-label">{skill.replace(' / Fashion', '').replace(' Agent', '').replace(' / Tutor', '').replace(' / Caterer', '')}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="testimonials-inner">
          <div className="testimonials-header">
            <h2 className="testimonials-title reveal">What Nigerians<br />are saying.</h2>
            <p className="testimonials-body reveal">Real stories from real people who found trusted professionals — or built their own trusted reputation — on Prov.</p>
          </div>
          <div className="testimonials-grid">
            {[
              { q: 'I found my mechanic through Prov. He was vouched by three people I personally know. Transparent pricing, excellent work, on time.', name: 'Funke A.', loc: 'Lagos' },
              { q: 'As a lawyer, my reputation is everything. Prov lets clients see my real vouches before they call. My client base has grown massively.', name: 'Emeka O.', loc: 'Abuja' },
              { q: 'I was scammed by a fake electrician before. Now I only use Prov. Real referrals from people with skin in the game — it works.', name: 'Blessing I.', loc: 'Port Harcourt' },
            ].map(({ q, name, loc }, i) => (
              <div key={name} className="testi-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="testi-stars">
                  {[1,2,3,4,5].map(i => <Icon key={i} name="star" size={14} color="var(--gold)" />)}
                </div>
                <p className="testi-quote">"{q}"</p>
                <div className="testi-author">
                  <div className="testi-av">
                    <Icon name="user" size={16} color="white" />
                  </div>
                  <div>
                    <div className="testi-name">{name}</div>
                    <div className="testi-loc">{loc}, Nigeria</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="faq-inner">
          <h2 className="faq-title reveal">Common questions</h2>
          {[
            { q: 'Is Prov free to join?', a: 'Yes — completely free. Joining, vouching for people and searching for services costs nothing. Always.' },
            { q: 'How does the trust score work?', a: 'Every vouch adds points based on the voucher\'s own score. A vouch from someone with a high score carries more weight — just like real life recommendations.' },
            { q: 'What stops people from giving fake vouches?', a: 'Your own reputation. Every vouch you give is publicly visible on your profile. If you vouch for someone unreliable, it reflects directly on you.' },
            { q: 'Do I need to offer a service to join?', a: 'No. You can join just to find trusted service providers, or to vouch for people you know. The skill field is only required if you want to appear in search results as a provider.' },
          ].map(({ q, a }) => (
            <details key={q} className="faq-item reveal">
              <summary className="faq-item">
                {q}
                <Icon name="plus" size={18} color="var(--mist)" style={{ flexShrink: 0 }} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="cta-inner">
          <div className="cta-eyebrow reveal">
            <div style={{ width: 28, height: 1.5, background: 'var(--leaf)' }} />
            <span style={{ fontFamily: 'Syne', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--leaf)' }}>Get started today</span>
          </div>
          <h2 className="cta-title reveal-2">
            Nigeria runs on<br />"who you know."<br /><em>Now it runs on Prov.</em>
          </h2>
          <p className="cta-sub reveal-3">Join free. Build your reputation. Find trusted help — without guessing.</p>
          <div className="cta-buttons reveal-4">
            <Link to="/signup">
              <button className="hero-btn-primary" style={{ fontSize: 15, padding: '15px 32px' }}>Join free now</button>
            </Link>
            <Link to="/search">
              <button className="hero-btn-secondary" style={{ fontSize: 15, padding: '15px 32px' }}>Search services</button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">Prov</div>
          <div className="footer-links">
            {[['/', 'Home'], ['/search', 'Search'], ['/leaderboard', 'Leaderboard'], ['/how-it-works', 'How it works'], ['/posts', 'Showcase'], ['/signup', 'Sign up']].map(([to, label]) => (
              <Link key={to} to={to} className="footer-link">{label}</Link>
            ))}
          </div>
          <div className="footer-copy">© 2026 Prov — Built for Nigeria</div>
        </div>
      </footer>
    </div>
  )
}
