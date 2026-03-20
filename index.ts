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
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    setLoading(true)
    await fetchProfile(user.id)
    const [r, g, p] = await Promise.all([
      supabase.from('vouches')
        .select('*, voucher:profiles!vouches_voucher_id_fkey(id,full_name,skill,trust_score,avatar_url)')
        .eq('vouchee_id', user.id).order('created_at', { ascending: false }),
      supabase.from('vouches')
        .select('*, vouchee:profiles!vouches_vouchee_id_fkey(id,full_name,skill,avatar_url)')
        .eq('voucher_id', user.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('notifs_last_read').eq('id', user.id).single()
    ])
    const lastRead = p.data?.notifs_last_read
    const vouches = r.data || []
    const unread = lastRead
      ? vouches.filter(v => new Date(v.created_at) > new Date(lastRead)).length
      : vouches.length
    setReceived(vouches)
    setGiven(g.data || [])
    setUnreadCount(unread)
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
        .dash-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 1.5rem; }
        .dash-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 2rem; }
        .action-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 12px; font-size: 14px; font-weight: 600; border-radius: 10px; cursor: pointer; transition: all 0.18s; font-family: DM Sans, sans-serif; text-align: center; white-space: nowrap; border: none; }
        .action-primary { background: var(--green); color: white; }
        .action-primary:hover { background: var(--green-mid); }
        .action-ghost { background: var(--white); color: var(--green); border: 1.5px solid var(--border); }
        .action-ghost:hover { border-color: var(--green-light); background: var(--green-pale); }
        .vouch-row { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border); }
        .vouch-row:last-child { border-bottom: none; }
        .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green-light); flex-shrink: 0; }
        @media(max-width:500px) {
          .dash-stats { grid-template-columns: 1fr 1fr; }
          .dash-stats .stat-third { grid-column: span 2; }
        }
      `}</style>

      {/* ── PROFILE HEADER ── */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AvatarUpload size={68} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, color: 'var(--green)', marginBottom: 3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{profile?.full_name}</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{profile?.email}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {profile?.skill && <span className="badge badge-green">{profile.skill}</span>}
              {profile?.location && <span className="badge badge-gray" style={{ fontSize: 11 }}>{profile.location}</span>}
            </div>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <TrustRing score={score} size={70} />
            <span style={{ fontSize: 11, fontWeight: 600, color: levelColor }}>{levelLabel}</span>
          </div>
        </div>

        {/* Progress */}
        {score < 100 && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                Next level: <strong style={{ color: 'var(--dark)' }}>{next === 40 ? 'Growing' : next === 70 ? 'Highly Trusted' : 'Maximum'}</strong>
              </p>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>{score}/{next}</p>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green-light)', borderRadius: 99, transition: 'width 1s ease' }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>{next - score} more points — ask people to vouch for you</p>
          </div>
        )}
      </div>

      {/* ── STATS ── */}
      <div className="dash-stats">
        <div style={{ background: 'var(--green-pale)', border: '1px solid #c3e8d8', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: 6 }}>Score</p>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{score}</p>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>out of 100</p>
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Received</p>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{received.length}</p>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>vouches</p>
        </div>
        <div className="stat-third" style={{ background: 'var(--amber-light)', border: '1px solid #f5dba8', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A6700', marginBottom: 6 }}>Given</p>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: '#9A6700', lineHeight: 1 }}>{given.length}</p>
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>vouches</p>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="dash-actions">
        <Link to="/vouch">
          <button className="action-btn action-primary" style={{ width: '100%' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Vouch someone
          </button>
        </Link>
        <Link to="/search">
          <button className="action-btn action-ghost" style={{ width: '100%' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Find services
          </button>
        </Link>
        <Link to="/edit-profile">
          <button className="action-btn action-ghost" style={{ width: '100%' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit profile
          </button>
        </Link>
        <Link to={`/profile/${user?.id}`}>
          <button className="action-btn action-ghost" style={{ width: '100%' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Public profile
          </button>
        </Link>
      </div>

      {/* ── SHARE CARD ── */}
      <div style={{ marginBottom: '2rem' }}>
        <ShareCard profileId={user?.id} name={profile?.full_name} />
      </div>

      {/* ── VOUCHES RECEIVED ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: 18, color: 'var(--green)' }}>Vouches received</h2>
          <div style={{ display: 'flex', align: 'center', gap: 8 }}>
            {unreadCount > 0 && (
              <span style={{ background: 'var(--green-light)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>
                {unreadCount} new
              </span>
            )}
            <span className="badge badge-green">{received.length}</span>
          </div>
        </div>
        {received.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontWeight: 500, marginBottom: 4, color: 'var(--dark)' }}>No vouches yet</p>
            <p>Share your profile link and ask people who know your work to vouch for you.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: '0 1.25rem' }}>
            {received.map((v, i) => {
              const isUnread = profile?.notifs_last_read
                ? new Date(v.created_at) > new Date(profile.notifs_last_read)
                : i === 0
              return (
                <div key={v.id} className="vouch-row">
                  {isUnread && <div className="unread-dot" />}
                  <Link to={`/profile/${v.voucher?.id}`} style={{ flexShrink: 0 }}>
                    <Avatar profile={v.voucher} size={42} />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: v.message ? 4 : 0 }}>
                      <Link to={`/profile/${v.voucher?.id}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--dark)' }}>{v.voucher?.full_name}</Link>
                      {v.voucher?.skill && <span className="badge badge-gray" style={{ fontSize: 11 }}>{v.voucher.skill}</span>}
                    </div>
                    {v.message && (
                      <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.5, borderLeft: '2px solid var(--green-light)', paddingLeft: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>"{v.message}"</p>
                    )}
                  </div>
                  <span className="badge badge-green" style={{ flexShrink: 0, fontSize: 11, fontWeight: 700 }}>+{v.weight}pts</span>
                </div>
              )
            })}
          </div>
        )}
        {received.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <Link to="/notifications">
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 13 }}>View all notifications →</button>
            </Link>
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
            <p style={{ fontWeight: 500, marginBottom: 4, color: 'var(--dark)' }}>You haven't vouched for anyone yet</p>
            <p>Know a great mechanic, lawyer or designer? <Link to="/vouch" style={{ color: 'var(--green)', fontWeight: 600 }}>Vouch for them →</Link></p>
          </div>
        ) : (
          <div className="card" style={{ padding: '0 1.25rem' }}>
            {given.map(v => (
              <div key={v.id} className="vouch-row">
                <Link to={`/profile/${v.vouchee?.id}`} style={{ flexShrink: 0 }}>
                  <Avatar profile={v.vouchee} size={42} />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{v.vouchee?.full_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{v.vouchee?.skill || 'No skill set'}</p>
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
