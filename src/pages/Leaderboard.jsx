import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import TrustRing from '../components/TrustRing'

const SKILLS = [
  'All', 'Mechanic', 'Electrician', 'Plumber', 'Lawyer', 'Doctor', 'Accountant',
  'Graphic Designer', 'Web Developer', 'Chef / Caterer', 'Tailor / Fashion',
  'Hair Stylist', 'Photographer', 'Driver', 'Carpenter', 'Painter',
  'Real Estate Agent', 'Teacher / Tutor', 'Other'
]

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [skill, setSkill] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLeaders() }, [skill])

  async function loadLeaders() {
    setLoading(true)
    let q = supabase
      .from('profiles')
      .select('id, full_name, skill, trust_score, vouch_count')
      .order('trust_score', { ascending: false })
      .gt('trust_score', 0)
      .limit(50)
    if (skill !== 'All') q = q.eq('skill', skill)
    const { data } = await q
    setLeaders(data || [])
    setLoading(false)
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 5%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 8 }}>Most Trusted in Nigeria</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Ranked by real vouches from real people in the network.</p>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {SKILLS.map(s => (
          <button key={s} onClick={() => setSkill(s)} style={{
            padding: '6px 14px', fontSize: 13, borderRadius: 999,
            background: skill === s ? 'var(--green)' : 'var(--white)',
            color: skill === s ? 'white' : 'var(--dark)',
            border: `1px solid ${skill === s ? 'var(--green)' : 'var(--border)'}`,
            cursor: 'pointer', transition: 'all 0.15s'
          }}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 28, height: 28 }}></div></div>
      ) : leaders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
          <p>No results yet for this category.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {leaders.map((p, i) => (
            <Link to={`/profile/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                transition: 'border-color 0.15s, transform 0.15s',
                borderLeft: i < 3 ? `4px solid ${['#F5A623','#9CA3AF','#CD7F32'][i]}` : '1px solid var(--border)'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-light)'; e.currentTarget.style.transform = 'translateX(3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = i < 3 ? ['#F5A623','#9CA3AF','#CD7F32'][i] : 'var(--border)'; e.currentTarget.style.transform = 'none' }}
              >
                {/* Rank */}
                <div style={{ width: 36, textAlign: 'center', flexShrink: 0 }}>
                  {i < 3
                    ? <span style={{ fontSize: 22 }}>{medals[i]}</span>
                    : <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 16, color: 'var(--muted)' }}>#{i + 1}</span>
                  }
                </div>

                {/* Avatar */}
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: i === 0 ? 'var(--amber-light)' : 'var(--green-pale)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 19, fontWeight: 700,
                  color: i === 0 ? '#9A6700' : 'var(--green)', flexShrink: 0
                }}>
                  {p.full_name?.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: 15, color: 'var(--dark)', marginBottom: 3 }}>{p.full_name}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="badge badge-green" style={{ fontSize: 11 }}>{p.skill}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.vouch_count || 0} vouches</span>
                  </div>
                </div>

                {/* Score */}
                <TrustRing score={p.trust_score || 0} size={56} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
