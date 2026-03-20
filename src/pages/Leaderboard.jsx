import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

const SKILLS = ['All','Mechanic','Electrician','Plumber','Lawyer','Doctor','Accountant','Graphic Designer','Web Developer','Chef / Caterer','Tailor / Fashion','Hair Stylist','Photographer','Driver','Carpenter','Painter','Real Estate Agent','Teacher / Tutor','Other']

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [skill, setSkill] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [skill])

  async function load() {
    setLoading(true)
    let q = supabase.from('profiles').select('id,full_name,skill,trust_score,vouch_count,avatar_url').order('trust_score', { ascending: false }).gt('trust_score', 0).limit(50)
    if (skill !== 'All') q = q.eq('skill', skill)
    const { data } = await q
    setLeaders(data || []); setLoading(false)
  }

  return (
    <div className="page">
      <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 8 }}>Most Trusted in Nigeria</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem' }}>Ranked by real vouches from real people.</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {SKILLS.map(s => (
          <button key={s} onClick={() => setSkill(s)} style={{ padding: '7px 14px', fontSize: 13, borderRadius: 999, background: skill === s ? 'var(--green)' : 'white', color: skill === s ? 'white' : 'var(--dark)', border: `1px solid ${skill === s ? 'var(--green)' : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="loader"><div className="spin" style={{ width: 28, height: 28 }} /></div>
      ) : leaders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}><p>No results yet for this category.</p></div>
      ) : leaders.map((p, i) => (
        <Link key={p.id} to={`/profile/${p.id}`}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', padding: '1rem', borderLeft: i < 3 ? `4px solid ${['#F5A623','#9CA3AF','#CD7F32'][i]}` : '1px solid var(--border)' }}>
            <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
              {i < 3 ? <span style={{ fontSize: 22 }}>{['🥇','🥈','🥉'][i]}</span> : <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 15, color: 'var(--muted)' }}>#{i+1}</span>}
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
              {p.avatar_url ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.full_name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 500, fontSize: 15 }}>{p.full_name}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
                <span className="badge badge-green" style={{ fontSize: 11 }}>{p.skill}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.vouch_count || 0} vouches</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 22, color: 'var(--green)' }}>{p.trust_score}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>/ 100</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
