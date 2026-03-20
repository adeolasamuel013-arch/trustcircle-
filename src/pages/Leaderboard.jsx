import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import Avatar from '../components/Avatar'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id,full_name,skill,trust_score,vouch_count,avatar_url')
      .order('trust_score', { ascending: false })
      .gt('trust_score', 0)
      .limit(50)
    setLeaders(data || [])
    setLoading(false)
  }

  const medals = ['#F5A623', '#9CA3AF', '#CD7F32']

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p>The most trusted people on Prov — ranked by real community vouches.</p>
      </div>

      {loading ? (
        <div className="loader"><div className="spin" style={{ width: 28, height: 28 }} /></div>
      ) : leaders.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--dark)' }}>No one on the board yet</p>
          <p>Be the first to get vouched and claim the top spot.</p>
        </div>
      ) : leaders.map((p, i) => (
        <Link key={p.id} to={`/profile/${p.id}`}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '14px 16px', marginBottom: 8, borderRadius: 12,
            background: i < 3 ? `${['#FEF3DC','#F3F4F6','#FDF3E7'][i]}` : 'var(--white)',
            border: `1px solid ${i < 3 ? medals[i] + '55' : 'var(--border)'}`,
            borderLeft: i < 3 ? `3px solid ${medals[i]}` : '1px solid var(--border)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {/* Rank */}
            <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
              {i < 3
                ? <div style={{ width: 24, height: 24, borderRadius: '50%', background: medals[i], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{i + 1}</span>
                  </div>
                : <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 14, color: 'var(--muted)' }}>#{i + 1}</span>
              }
            </div>

            {/* Avatar */}
            <Avatar profile={p} size={44} />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.full_name}</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {p.skill && <span className="badge badge-green" style={{ fontSize: 11 }}>{p.skill}</span>}
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.vouch_count || 0} vouches</span>
              </div>
            </div>

            {/* Score */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 24, color: 'var(--green)', lineHeight: 1 }}>{p.trust_score}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>/ 100</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
