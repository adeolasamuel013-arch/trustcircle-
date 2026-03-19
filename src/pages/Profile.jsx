import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import TrustRing from '../components/TrustRing'

export default function Profile() {
  const { id } = useParams()
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

  return (
    <div className="page-sm" style={{ padding: '2rem 1rem' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2rem', borderTop: '4px solid var(--green-light)', marginBottom: '1.5rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'white', margin: '0 auto 1rem' }}>
          {profile.full_name?.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize: 22, color: 'var(--green)', marginBottom: 6 }}>{profile.full_name}</h1>
        {profile.skill && <span className="badge badge-green">{profile.skill}</span>}
        {profile.location && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>📍 {profile.location}</p>}
        {profile.bio && <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginTop: '1rem', padding: '0.75rem', background: 'var(--cream)', borderRadius: 8, textAlign: 'left' }}>{profile.bio}</p>}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
          <TrustRing score={profile.trust_score || 0} size={100} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 26, color: 'var(--green)' }}>{profile.trust_score || 0}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Trust score</p>
          </div>
          <div>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 26, color: 'var(--green)' }}>{profile.vouch_count || 0}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Vouches</p>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 18, color: 'var(--green)', marginBottom: '1rem' }}>Vouches ({vouches.length})</h2>
      {vouches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
          <p style={{ fontSize: 14 }}>No vouches yet.</p>
        </div>
      ) : vouches.map(v => (
        <div key={v.id} className="card" style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', padding: '1rem' }}>
          <Link to={`/profile/${v.voucher?.id}`} style={{ flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>
              {v.voucher?.full_name?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
              <Link to={`/profile/${v.voucher?.id}`} style={{ fontWeight: 500, fontSize: 14 }}>{v.voucher?.full_name}</Link>
              <span className="badge badge-gray" style={{ fontSize: 11 }}>{v.voucher?.skill}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Score: {v.voucher?.trust_score}</span>
            </div>
            {v.message && <p style={{ fontSize: 13, fontStyle: 'italic', borderLeft: '2px solid var(--green-light)', paddingLeft: 10, lineHeight: 1.6 }}>"{v.message}"</p>}
          </div>
          <span className="badge badge-green" style={{ flexShrink: 0 }}>+{v.weight}pts</span>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link to={`/vouch?to=${id}`} style={{ flex: 1 }}><button className="btn btn-green btn-full">Vouch for {profile.full_name?.split(' ')[0]}</button></Link>
        <Link to="/search"><button className="btn btn-outline">Back to search</button></Link>
      </div>
    </div>
  )
}
