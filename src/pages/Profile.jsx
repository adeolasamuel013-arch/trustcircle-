import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import TrustRing from '../components/TrustRing'

export default function Profile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [vouches, setVouches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    const [{ data: p }, { data: v }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('vouches').select('*, voucher:profiles!vouches_voucher_id_fkey(id,full_name,skill,trust_score)').eq('vouchee_id', id).order('created_at', { ascending: false })
    ])
    setProfile(p); setVouches(v || []); setLoading(false)
  }

  if (loading) return <div className="loader"><div className="spin" style={{ width: 32, height: 32 }} /></div>
  if (!profile) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h2 style={{ color: 'var(--green)', marginBottom: '1rem' }}>Profile not found</h2>
      <Link to="/search"><button className="btn btn-green">Back to search</button></Link>
    </div>
  )

  const isOwnProfile = user?.id === id
  const trustLabel = profile.trust_score >= 70 ? 'Highly Trusted' : profile.trust_score >= 40 ? 'Growing' : profile.trust_score >= 20 ? 'Building Trust' : 'New Member'
  const trustColor = profile.trust_score >= 70 ? 'var(--green-mid)' : profile.trust_score >= 40 ? 'var(--amber)' : 'var(--muted)'

  return (
    <div className="page-sm" style={{ padding: '2rem 1rem' }}>

      {/* Profile card */}
      <div className="card" style={{ textAlign: 'center', padding: '2rem', borderTop: '4px solid var(--green-light)', marginBottom: '1.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'white', margin: '0 auto 1rem' }}>
          {profile.full_name?.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize: 24, color: 'var(--green)', marginBottom: 6 }}>{profile.full_name}</h1>
        {profile.skill && <span className="badge badge-green" style={{ marginBottom: 8 }}>{profile.skill}</span>}
        {profile.location && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>📍 {profile.location}</p>}
        <p style={{ fontSize: 13, fontWeight: 500, color: trustColor, marginTop: 6 }}>{trustLabel}</p>

        {profile.bio && (
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginTop: '1rem', padding: '0.875rem', background: 'var(--cream)', borderRadius: 10, textAlign: 'left' }}>
            {profile.bio}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
          <TrustRing score={profile.trust_score || 0} size={110} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 28, color: 'var(--green)' }}>{profile.trust_score || 0}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Trust score</p>
          </div>
          <div>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 28, color: 'var(--green)' }}>{profile.vouch_count || 0}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Vouches</p>
          </div>
        </div>

        {/* Action buttons */}
        {!isOwnProfile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {user ? (
              <button
                onClick={() => navigate(`/messages/${id}`)}
                style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 12, background: 'var(--green)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Message {profile.full_name?.split(' ')[0]}
              </button>
            ) : (
              <Link to="/login">
                <button style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 12, background: 'var(--green)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                  Sign in to message
                </button>
              </Link>
            )}
            <Link to={user ? `/vouch?to=${id}` : '/login'}>
              <button className="btn btn-outline btn-full">
                Vouch for {profile.full_name?.split(' ')[0]}
              </button>
            </Link>
          </div>
        )}

        {isOwnProfile && (
          <Link to="/edit-profile">
            <button className="btn btn-outline btn-full">Edit my profile</button>
          </Link>
        )}
      </div>

      {/* Vouches */}
      <h2 style={{ fontSize: 18, color: 'var(--green)', marginBottom: '1rem' }}>
        What people say ({vouches.length})
      </h2>

      {vouches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
          <p style={{ fontSize: 14 }}>No vouches yet — be the first to vouch for this person.</p>
        </div>
      ) : vouches.map(v => (
        <div key={v.id} className="card" style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', padding: '1rem' }}>
          <Link to={`/profile/${v.voucher?.id}`} style={{ flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>
              {v.voucher?.full_name?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
              <Link to={`/profile/${v.voucher?.id}`} style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark)' }}>{v.voucher?.full_name}</Link>
              <span className="badge badge-gray" style={{ fontSize: 11 }}>{v.voucher?.skill}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Score: {v.voucher?.trust_score}</span>
            </div>
            {v.message ? (
              <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--dark)', borderLeft: '3px solid var(--green-light)', paddingLeft: 10, lineHeight: 1.65 }}>
                "{v.message}"
              </p>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>Vouched without a message</p>
            )}
          </div>
          <span className="badge badge-green" style={{ flexShrink: 0, alignSelf: 'flex-start' }}>+{v.weight}pts</span>
        </div>
      ))}

      <Link to="/search" style={{ display: 'block', marginTop: '1rem' }}>
        <button className="btn btn-outline btn-full">Back to search</button>
      </Link>
    </div>
  )
}
