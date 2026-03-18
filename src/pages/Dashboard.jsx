import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import TrustRing from '../components/TrustRing'
import ShareCard from '../components/ShareCard'

export default function Dashboard() {
  const { user, profile, fetchProfile } = useAuth()
  const [vouches, setVouches] = useState([])
  const [givenVouches, setGivenVouches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  async function loadData() {
    setLoading(true)
    const [{ data: received }, { data: given }] = await Promise.all([
      supabase.from('vouches')
        .select('*, voucher:profiles!vouches_voucher_id_fkey(id, full_name, skill, trust_score)')
        .eq('vouchee_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('vouches')
        .select('*, vouchee:profiles!vouches_vouchee_id_fkey(id, full_name, skill, trust_score)')
        .eq('voucher_id', user.id)
        .order('created_at', { ascending: false })
    ])
    setVouches(received || [])
    setGivenVouches(given || [])
    await fetchProfile(user.id)
    setLoading(false)
  }

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32 }}></div></div>

  const nextMilestone = profile?.trust_score >= 70 ? 100 : profile?.trust_score >= 40 ? 70 : 40
  const progressPct = Math.min(100, Math.round(((profile?.trust_score || 0) / nextMilestone) * 100))

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 5%' }}>

      {/* Profile header */}
      <div className="card" style={{
        display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center',
        marginBottom: '1.25rem', borderTop: '3px solid var(--green-light)'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'white', flexShrink: 0
        }}>
          {profile?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 22, color: 'var(--green)', marginBottom: 3 }}>{profile?.full_name}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>{profile?.email}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {profile?.skill && <span className="badge badge-green">{profile.skill}</span>}
            {profile?.location && <span className="badge badge-gray">{profile.location}</span>}
          </div>
          {profile?.bio && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>{profile.bio}</p>}
        </div>
        <TrustRing score={profile?.trust_score || 0} size={90} />
      </div>

      {/* Progress to next milestone */}
      {(profile?.trust_score || 0) < 100 && (
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Progress to next milestone</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--green)' }}>{profile?.trust_score || 0} / {nextMilestone}</p>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: 'var(--green-light)', borderRadius: 99,
              transition: 'width 0.8s ease'
            }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
            {nextMilestone - (profile?.trust_score || 0)} more points to reach {nextMilestone === 40 ? 'Growing' : nextMilestone === 70 ? 'Highly Trusted' : 'maximum'} status — get more people to vouch for you!
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Trust score', value: profile?.trust_score || 0, suffix: '/100', bg: 'var(--green-pale)', color: 'var(--green)' },
          { label: 'Vouches received', value: vouches.length, bg: 'var(--green-pale)', color: 'var(--green)' },
          { label: 'Vouches given', value: givenVouches.length, bg: 'var(--amber-light)', color: '#9A6700' },
        ].map(({ label, value, suffix, bg, color }) => (
          <div key={label} style={{ background: bg, borderRadius: 'var(--radius)', padding: '1.25rem' }}>
            <p style={{ fontSize: 12, color, marginBottom: 4, opacity: 0.8 }}>{label}</p>
            <p style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 700, color, lineHeight: 1 }}>
              {value}<span style={{ fontSize: 14, fontWeight: 400 }}>{suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <Link to="/vouch"><button className="btn-primary">+ Vouch for someone</button></Link>
        <Link to="/search"><button className="btn-secondary">Search services</button></Link>
        <Link to="/edit-profile"><button className="btn-secondary">Edit profile</button></Link>
        <Link to={`/profile/${user?.id}`}><button className="btn-secondary">Public profile</button></Link>
        <Link to="/notifications"><button className="btn-secondary">Notifications</button></Link>
      </div>

      {/* Share card */}
      <ShareCard profileId={user?.id} name={profile?.full_name} />

      {/* Vouches received */}
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: 17, color: 'var(--green)', marginBottom: '1rem' }}>
          Vouches received ({vouches.length})
        </h3>
        {vouches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted)' }}>
            <p style={{ fontSize: 14, marginBottom: 8 }}>No vouches yet.</p>
            <p style={{ fontSize: 13 }}>Share your profile link and ask people who know your work to vouch for you.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {vouches.map(v => (
              <div key={v.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Link to={`/profile/${v.voucher?.id}`} style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', background: 'var(--green-pale)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: 'var(--green)', cursor: 'pointer'
                  }}>
                    {v.voucher?.full_name?.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                    <Link to={`/profile/${v.voucher?.id}`} style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark)' }}>
                      {v.voucher?.full_name}
                    </Link>
                    <span className="badge badge-gray" style={{ fontSize: 11 }}>{v.voucher?.skill}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Score: {v.voucher?.trust_score}</span>
                  </div>
                  {v.message && (
                    <p style={{ fontSize: 13, color: 'var(--dark)', fontStyle: 'italic', borderLeft: '2px solid var(--green-light)', paddingLeft: 10, lineHeight: 1.6 }}>
                      "{v.message}"
                    </p>
                  )}
                </div>
                <span className="badge badge-green" style={{ fontSize: 11, flexShrink: 0 }}>+{v.weight} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vouches given */}
      <div>
        <h3 style={{ fontSize: 17, color: 'var(--green)', marginBottom: '1rem' }}>
          Vouches I gave ({givenVouches.length})
        </h3>
        {givenVouches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
            <p style={{ fontSize: 14 }}>
              You haven't vouched for anyone yet.{' '}
              <Link to="/vouch" style={{ color: 'var(--green)', fontWeight: 500 }}>Vouch for someone →</Link>
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {givenVouches.map(v => (
              <div key={v.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link to={`/profile/${v.vouchee?.id}`} style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', background: 'var(--amber-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: '#9A6700', cursor: 'pointer'
                  }}>
                    {v.vouchee?.full_name?.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <div style={{ flex: 1 }}>
                  <Link to={`/profile/${v.vouchee?.id}`} style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark)' }}>
                    {v.vouchee?.full_name}
                  </Link>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>{v.vouchee?.skill}</p>
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
