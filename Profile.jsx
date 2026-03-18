import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import TrustRing from '../components/TrustRing'

export default function Profile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [vouches, setVouches] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [id])

  async function loadProfile() {
    setLoading(true)
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (!prof) { setNotFound(true); setLoading(false); return }
    setProfile(prof)
    const { data: v } = await supabase
      .from('vouches')
      .select('*, voucher:profiles!vouches_voucher_id_fkey(id, full_name, skill, trust_score)')
      .eq('vouchee_id', id)
      .order('created_at', { ascending: false })
    setVouches(v || [])
    setLoading(false)
  }

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32 }}></div></div>

  if (notFound) return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <h2 style={{ color: 'var(--green)', fontSize: 24 }}>Profile not found</h2>
      <Link to="/search"><button className="btn-primary">Back to search</button></Link>
    </div>
  )

  const trustLabel = profile.trust_score >= 70 ? 'Highly Trusted' : profile.trust_score >= 40 ? 'Growing Trust' : 'Building Trust'
  const trustColor = profile.trust_score >= 70 ? 'var(--green-mid)' : profile.trust_score >= 40 ? '#9A6700' : 'var(--muted)'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 5%' }}>

      {/* Hero card */}
      <div className="card" style={{ borderTop: '4px solid var(--green-light)', marginBottom: '1.5rem', textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'white',
          margin: '0 auto 1rem'
        }}>
          {profile.full_name?.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 6 }}>{profile.full_name}</h1>
        {profile.skill && <span className="badge badge-green" style={{ marginBottom: 12 }}>{profile.skill}</span>}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1.25rem 0' }}>
          <TrustRing score={profile.trust_score || 0} size={110} />
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, color: trustColor }}>{trustLabel}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 28, color: 'var(--green)' }}>{profile.trust_score || 0}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Trust score</p>
          </div>
          <div>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 28, color: 'var(--green)' }}>{profile.vouch_count || 0}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Vouches received</p>
          </div>
        </div>
      </div>

      {/* Vouches */}
      <h2 style={{ fontSize: 18, color: 'var(--green)', marginBottom: '1rem' }}>
        Vouches ({vouches.length})
      </h2>

      {vouches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
          <p style={{ fontSize: 14 }}>No vouches yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {vouches.map(v => (
            <div key={v.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <Link to={`/profile/${v.voucher?.id}`} style={{ flexShrink: 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 700, color: 'var(--green)', cursor: 'pointer'
                }}>
                  {v.voucher?.full_name?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                  <Link to={`/profile/${v.voucher?.id}`} style={{ fontWeight: 500, fontSize: 14, color: 'var(--dark)' }}>{v.voucher?.full_name}</Link>
                  <span className="badge badge-gray" style={{ fontSize: 11 }}>{v.voucher?.skill}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Score: {v.voucher?.trust_score}</span>
                </div>
                {v.message && (
                  <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--dark)', borderLeft: '2px solid var(--green-light)', paddingLeft: 10, lineHeight: 1.6 }}>
                    "{v.message}"
                  </p>
                )}
              </div>
              <span className="badge badge-green" style={{ fontSize: 11, flexShrink: 0 }}>+{v.weight} pts</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to={`/vouch?to=${id}`}><button className="btn-primary">Vouch for {profile.full_name?.split(' ')[0]}</button></Link>
        <Link to="/search"><button className="btn-secondary">Back to search</button></Link>
      </div>
    </div>
  )
}
