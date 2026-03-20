import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import TrustRing from '../components/TrustRing'
import ShareCard from '../components/ShareCard'
import AvatarUpload from '../components/AvatarUpload'
import Avatar from '../components/Avatar'

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
      supabase.from('vouches').select('*, voucher:profiles!vouches_voucher_id_fkey(id,full_name,skill,trust_score,avatar_url)').eq('vouchee_id', user.id).order('created_at', { ascending: false }),
      supabase.from('vouches').select('*, vouchee:profiles!vouches_vouchee_id_fkey(id,full_name,skill,avatar_url)').eq('voucher_id', user.id).order('created_at', { ascending: false })
    ])
    setReceived(r.data || [])
    setGiven(g.data || [])
    setLoading(false)
  }

  if (loading) return <div className="loader"><div className="spin" style={{ width: 36, height: 36 }} /></div>

  const score = profile?.trust_score || 0
  const next = score >= 70 ? 100 : score >= 40 ? 70 : 40
  const pct = Math.min(100, Math.round((score / next) * 100))
  const levelLabel = score >= 70 ? 'Highly Trusted' : score >= 40 ? 'Growing' : score >= 20 ? 'Building Trust' : 'New Member'
  const levelColor = score >= 70 ? 'var(--green-mid)' : score >= 40 ? '#9A6700' : 'var(--muted)'

  return (
    <div className="page">
      <style>{`
        .dash-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; }
        .dash-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .vouch-row { display: flex; align-items: center; gap: 14px; padding: 1rem 0; border-bottom: 1px solid var(--border); }
        .vouch-row:last-child { border-bottom: none; }
        @media(max-width:480px) { .dash-stats { grid-template-columns: 1fr 1fr; } .dash-actions .btn { flex: 1; min-width: 120px; } }
      `}</style>

      {/* ── PROFILE HEADER ── */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <AvatarUpload size={80} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, color: 'var(--green)', marginBottom: 4 }}>{profile?.full_name}</h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 10 }}>{profile?.email}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {profile?.skill && <span className="badge badge-green">{profile.skill}</span>}
              {profile?.location && <span className="badge badge-gray">{profile.location}</span>}
              <span style={{ fontSize: 13, fontWeight: 500, color: levelColor }}>{levelLabel}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <TrustRing score={score} size={80} />
          </div>
        </div>

        {/* Progress bar */}
        {score < 100 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>Progress to <strong style={{ color: 'var(--dark)' }}>{next === 40 ? 'Growing' : next === 70 ? 'Highly Trusted' : 'Maximum'}</strong></p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>{score} / {next} pts</p>
            </div>
            <div style={{ height: 7, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green-light)', borderRadius: 99, transition: 'width 1s ease' }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
              {next - score} more points needed — get people to vouch for you
            </p>
          </div>
        )}
      </div>

      {/* ── STATS ── */}
      <div className="dash-stats" style={{ marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--green-pale)', border: '1px solid #c3e8d8', borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: 8 }}>Trust Score</p>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{score}<span style={{ fontSize: 16, color: 'var(--muted)' }}>/100</span></p>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Vouches Received</p>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{received.length}</p>
        </div>
        <div style={{ background: 'var(--amber-light)', border: '1px solid #f5dba8', borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A6700', marginBottom: 8 }}>Vouches Given</p>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: '#9A6700', lineHeight: 1 }}>{given.length}</p>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="dash-actions" style={{ marginBottom: '2rem' }}>
        <Link to="/vouch"><button className="btn btn-green">+ Vouch for someone</button></Link>
        <Link to="/search"><button className="btn btn-ghost">Find services</button></Link>
        <Link to="/edit-profile"><button className="btn btn-ghost">Edit profile</button></Link>
        <Link to={`/profile/${user?.id}`}><button className="btn btn-ghost">My public profile</button></Link>
      </div>

      {/* ── SHARE CARD ── */}
      <div style={{ marginBottom: '2rem' }}>
        <ShareCard profileId={user?.id} name={profile?.full_name} />
      </div>

      {/* ── VOUCHES RECEIVED ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: 18, color: 'var(--green)' }}>Vouches received</h2>
          <span className="badge badge-green">{received.length}</span>
        </div>
        {received.length === 0 ? (
          <div className="empty-state">
            <p style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--dark)' }}>No vouches yet</p>
            <p>Share your profile link with people who know your work and ask them to vouch for you.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: '0.5rem 1.5rem' }}>
            {received.map(v => (
              <div key={v.id} className="vouch-row">
                <Link to={`/profile/${v.voucher?.id}`}>
                  <Avatar profile={v.voucher} size={44} />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: v.message ? 5 : 0 }}>
                    <Link to={`/profile/${v.voucher?.id}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--dark)' }}>{v.voucher?.full_name}</Link>
                    {v.voucher?.skill && <span className="badge badge-gray" style={{ fontSize: 11 }}>{v.voucher.skill}</span>}
                  </div>
                  {v.message && (
                    <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.55, borderLeft: '2px solid var(--green-light)', paddingLeft: 10 }}>"{v.message}"</p>
                  )}
                </div>
                <span className="badge badge-green" style={{ flexShrink: 0, fontWeight: 600 }}>+{v.weight} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── VOUCHES GIVEN ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: 18, color: 'var(--green)' }}>People I've vouched for</h2>
          <span className="badge badge-amber">{given.length}</span>
        </div>
        {given.length === 0 ? (
          <div className="empty-state">
            <p style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--dark)' }}>You haven't vouched for anyone yet</p>
            <p>Know a great mechanic, lawyer or designer? <Link to="/vouch" style={{ color: 'var(--green)', fontWeight: 500 }}>Vouch for them →</Link></p>
          </div>
        ) : (
          <div className="card" style={{ padding: '0.5rem 1.5rem' }}>
            {given.map(v => (
              <div key={v.id} className="vouch-row">
                <Link to={`/profile/${v.vouchee?.id}`}>
                  <Avatar profile={v.vouchee} size={44} />
                </Link>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--dark)' }}>{v.vouchee?.full_name}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>{v.vouchee?.skill || 'No skill set'}</p>
                </div>
                <span className="badge badge-amber">Vouched</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
