import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import TrustRing from '../components/TrustRing'
import ShareCard from '../components/ShareCard'
import AvatarUpload from '../components/AvatarUpload'

export default function Dashboard() {
  const { user, profile, fetchProfile } = useAuth()
  const [received, setReceived] = useState([])
  const [given, setGiven] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    setLoading(true)
    await fetchProfile(user.id)
    const [r, g] = await Promise.all([
      supabase.from('vouches').select('*, voucher:profiles!vouches_voucher_id_fkey(id,full_name,skill,trust_score)').eq('vouchee_id', user.id).order('created_at', { ascending: false }),
      supabase.from('vouches').select('*, vouchee:profiles!vouches_vouchee_id_fkey(id,full_name,skill)').eq('voucher_id', user.id).order('created_at', { ascending: false })
    ])
    setReceived(r.data || []); setGiven(g.data || [])
    setLoading(false)
  }

  if (loading) return <div className="loader"><div className="spin" style={{ width: 32, height: 32 }} /></div>

  const score = profile?.trust_score || 0
  const next = score >= 70 ? 100 : score >= 40 ? 70 : 40
  const pct = Math.min(100, Math.round((score / next) * 100))

  return (
    <div className="page">
      <style>{`
        .dash-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1.25rem; }
        .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        @media(min-width:480px) { .dash-grid { grid-template-columns: repeat(3,1fr); } }
      `}</style>

      {/* Profile header */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', borderTop: '3px solid var(--green-light)', padding: '1.5rem' }}>
        <AvatarUpload size={72} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 20, color: 'var(--green)', marginBottom: 4 }}>{profile?.full_name}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>{profile?.email}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {profile?.skill && <span className="badge badge-green">{profile.skill}</span>}
            {profile?.location && <span className="badge badge-gray">{profile.location}</span>}
          </div>
        </div>
        <TrustRing score={score} size={85} />
      </div>

      {/* Progress bar */}
      {score < 100 && (
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Progress to next level</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--green)' }}>{score} / {next}</p>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green-light)', borderRadius: 99, transition: 'width 0.8s ease' }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{next - score} more points to reach {next === 40 ? 'Growing' : next === 70 ? 'Highly Trusted' : 'Maximum'} status</p>
        </div>
      )}

      {/* Stats */}
      <div className="dash-grid">
        {[
          { label: 'Trust score', value: `${score}/100`, bg: 'var(--green-pale)', color: 'var(--green)' },
          { label: 'Vouches received', value: received.length, bg: 'var(--green-pale)', color: 'var(--green)' },
          { label: 'Vouches given', value: given.length, bg: 'var(--amber-light)', color: '#9A6700' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} style={{ background: bg, borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color, marginBottom: 4, opacity: 0.8 }}>{label}</p>
            <p style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="actions">
        <Link to="/vouch"><button className="btn btn-green">+ Vouch for someone</button></Link>
        <Link to="/search"><button className="btn btn-outline">Search services</button></Link>
        <Link to="/edit-profile"><button className="btn btn-outline">Edit profile</button></Link>
        <Link to={`/profile/${user?.id}`}><button className="btn btn-outline">Public profile</button></Link>
      </div>

      <ShareCard profileId={user?.id} name={profile?.full_name} />

      {/* Vouches received */}
      <h3 style={{ fontSize: 17, color: 'var(--green)', margin: '2rem 0 1rem' }}>Vouches received ({received.length})</h3>
      {received.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
          <p style={{ fontSize: 14 }}>No vouches yet. Share your profile link and ask people who know your work!</p>
        </div>
      ) : received.map(v => (
        <div key={v.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <Link to={`/profile/${v.voucher?.id}`} style={{ flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>
              {v.voucher?.full_name?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
              <Link to={`/profile/${v.voucher?.id}`} style={{ fontWeight: 500, fontSize: 14 }}>{v.voucher?.full_name}</Link>
              <span className="badge badge-gray" style={{ fontSize: 11 }}>{v.voucher?.skill}</span>
            </div>
            {v.message && <p style={{ fontSize: 13, fontStyle: 'italic', borderLeft: '2px solid var(--green-light)', paddingLeft: 10, lineHeight: 1.6 }}>"{v.message}"</p>}
          </div>
          <span className="badge badge-green" style={{ flexShrink: 0 }}>+{v.weight}pts</span>
        </div>
      ))}

      {/* Vouches given */}
      <h3 style={{ fontSize: 17, color: 'var(--green)', margin: '2rem 0 1rem' }}>Vouches I gave ({given.length})</h3>
      {given.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
          <p style={{ fontSize: 14 }}>You haven't vouched for anyone yet. <Link to="/vouch" style={{ color: 'var(--green)', fontWeight: 500 }}>Vouch for someone →</Link></p>
        </div>
      ) : given.map(v => (
        <div key={v.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <Link to={`/profile/${v.vouchee?.id}`} style={{ flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#9A6700' }}>
              {v.vouchee?.full_name?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 500, fontSize: 14 }}>{v.vouchee?.full_name}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>{v.vouchee?.skill}</p>
          </div>
          <span className="badge badge-amber">Vouched</span>
        </div>
      ))}
    </div>
  )
}
