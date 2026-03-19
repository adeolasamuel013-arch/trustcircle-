import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { useNavigate, Link } from 'react-router-dom'

const ADMIN_EMAIL = 'adeolasamuel013@gmail.com'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({ users: 0, vouches: 0, messages: 0, todayUsers: 0, todayVouches: 0 })
  const [users, setUsers] = useState([])
  const [vouches, setVouches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!user) return
    if (user.email !== ADMIN_EMAIL) { navigate('/dashboard'); return }
    loadAll()
  }, [user])

  async function loadAll() {
    setLoading(true)
    const today = new Date(); today.setHours(0, 0, 0, 0)

    const [
      { count: totalUsers },
      { count: totalVouches },
      { count: totalMessages },
      { count: todayUsers },
      { count: todayVouches },
      { data: allUsers },
      { data: allVouches }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('vouches').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('vouches').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('vouches').select('*, voucher:profiles!vouches_voucher_id_fkey(full_name,email), vouchee:profiles!vouches_vouchee_id_fkey(id,full_name,email)').order('created_at', { ascending: false }).limit(200)
    ])

    setStats({ users: totalUsers || 0, vouches: totalVouches || 0, messages: totalMessages || 0, todayUsers: todayUsers || 0, todayVouches: todayVouches || 0 })
    setUsers(allUsers || [])
    setVouches(allVouches || [])
    setLoading(false)
  }

  async function deleteUser(id, name) {
    if (!confirm(`Delete ${name}? This will also delete all their vouches.`)) return
    await supabase.from('vouches').delete().or(`voucher_id.eq.${id},vouchee_id.eq.${id}`)
    await supabase.from('messages').delete().or(`sender_id.eq.${id},receiver_id.eq.${id}`)
    await supabase.from('profiles').delete().eq('id', id)
    setUsers(u => u.filter(x => x.id !== id))
    setMsg('User deleted successfully.')
  }

  async function resetScore(id, name) {
    if (!confirm(`Reset ${name} trust score to 0?`)) return
    await supabase.from('profiles').update({ trust_score: 0, vouch_count: 0 }).eq('id', id)
    setUsers(u => u.map(x => x.id === id ? { ...x, trust_score: 0, vouch_count: 0 } : x))
    setMsg('Score reset successfully.')
  }

  async function deleteVouch(id, voucheeId, weight) {
    if (!confirm('Delete this vouch? The trust score will be reduced.')) return
    await supabase.from('vouches').delete().eq('id', id)
    const { data: p } = await supabase.from('profiles').select('trust_score,vouch_count').eq('id', voucheeId).single()
    if (p) await supabase.from('profiles').update({ trust_score: Math.max(0, (p.trust_score || 0) - weight), vouch_count: Math.max(0, (p.vouch_count || 0) - 1) }).eq('id', voucheeId)
    setVouches(v => v.filter(x => x.id !== id))
    setMsg('Vouch deleted and score updated.')
  }

  function timeAgo(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    if (m < 1440) return `${Math.floor(m / 60)}h ago`
    return `${Math.floor(m / 1440)}d ago`
  }

  const filteredUsers = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.skill?.toLowerCase().includes(search.toLowerCase())
  )

  const topUsers = [...users].sort((a, b) => b.trust_score - a.trust_score).slice(0, 5)
  const skillBreakdown = Object.entries(users.reduce((acc, u) => { const s = u.skill || 'No skill'; acc[s] = (acc[s] || 0) + 1; return acc }, {})).sort((a, b) => b[1] - a[1]).slice(0, 8)

  if (loading) return <div className="loader"><div className="spin" style={{ width: 32, height: 32 }} /></div>

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
      <style>{`
        .admin-tab { padding: 9px 18px; border-radius: 999px; font-size: 14px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: white; font-family: DM Sans, sans-serif; transition: all 0.15s; }
        .admin-tab.active { background: var(--green); color: white; border-color: var(--green); }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 600px; }
        .admin-table th { text-align: left; padding: 10px 12px; background: var(--green); color: white; font-weight: 500; font-size: 12px; }
        .admin-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .admin-table tr:hover td { background: var(--cream); }
        .table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); }
        .stats-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .overview-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width:640px) { .stats-grid { grid-template-columns: repeat(5,1fr); } }
        @media(min-width:768px) { .overview-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>TrustCircle platform management</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadAll} className="btn btn-outline" style={{ padding: '9px 18px', fontSize: 13 }}>Refresh</button>
          <Link to="/dashboard"><button className="btn btn-green" style={{ padding: '9px 18px', fontSize: 13 }}>My profile</button></Link>
        </div>
      </div>

      {msg && (
        <div style={{ background: 'var(--green-pale)', border: '1px solid #B8E8D4', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--green-mid)', fontWeight: 500 }}>{msg}</p>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16 }}>x</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total users', value: stats.users, sub: `+${stats.todayUsers} today`, color: 'var(--green)' },
          { label: 'Total vouches', value: stats.vouches, sub: `+${stats.todayVouches} today`, color: 'var(--green)' },
          { label: 'Total messages', value: stats.messages, sub: 'all time', color: 'var(--green)' },
          { label: 'Avg vouches/user', value: stats.users > 0 ? (stats.vouches / stats.users).toFixed(1) : 0, sub: 'per person', color: 'var(--amber)' },
          { label: 'Platform health', value: stats.vouches >= stats.users ? 'Good' : 'Early', sub: 'based on activity', color: stats.vouches >= stats.users ? 'var(--green-mid)' : 'var(--amber)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 26, color, marginBottom: 4, lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: `Users (${users.length})` },
          { id: 'vouches', label: `Vouches (${vouches.length})` },
          { id: 'suspicious', label: 'Suspicious Activity' },
        ].map(t => (
          <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div className="overview-grid">
          <div className="card">
            <h3 style={{ fontSize: 16, color: 'var(--green)', marginBottom: '1rem' }}>Top trusted users</h3>
            {topUsers.length === 0 ? <p style={{ fontSize: 13, color: 'var(--muted)' }}>No users yet</p> : topUsers.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i < topUsers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 14, color: 'var(--muted)', minWidth: 24 }}>#{i + 1}</span>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>{u.full_name?.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{u.full_name}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>{u.skill}</p>
                </div>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 18, color: 'var(--green)', flexShrink: 0 }}>{u.trust_score}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, color: 'var(--green)', marginBottom: '1rem' }}>Users by skill</h3>
            {skillBreakdown.map(([skill, count]) => (
              <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <p style={{ flex: 1, fontSize: 13 }}>{skill}</p>
                <div style={{ width: 80, height: 6, background: 'var(--border)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (count / (users.length || 1)) * 300)}%`, background: 'var(--green-light)', borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 20, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, color: 'var(--green)', marginBottom: '1rem' }}>Recent signups</h3>
            {users.slice(0, 6).map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>{u.full_name?.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{u.full_name}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>{u.skill || 'No skill set'}</p>
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{timeAgo(u.created_at)}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, color: 'var(--green)', marginBottom: '1rem' }}>Recent vouches</h3>
            {vouches.slice(0, 6).map((v, i) => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {v.voucher?.full_name} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>vouched for</span> {v.vouchee?.full_name}
                  </p>
                  {v.message && <p style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>"{v.message}"</p>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className="badge badge-green" style={{ fontSize: 11 }}>+{v.weight}pts</span>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{timeAgo(v.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div>
          <input placeholder="Search by name, email or skill..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '0.75rem' }}>{filteredUsers.length} users</p>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Skill</th>
                  <th>Location</th>
                  <th>Score</th>
                  <th>Vouches</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                          {u.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.full_name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                    <td>{u.skill ? <span className="badge badge-green" style={{ fontSize: 11 }}>{u.skill}</span> : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td style={{ color: 'var(--muted)' }}>{u.location || '—'}</td>
                    <td>
                      <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 16, color: u.trust_score >= 70 ? 'var(--green-mid)' : u.trust_score >= 40 ? '#9A6700' : 'var(--muted)' }}>
                        {u.trust_score || 0}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{u.vouch_count || 0}</td>
                    <td style={{ color: 'var(--muted)' }}>{timeAgo(u.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/profile/${u.id}`}>
                          <button style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, background: 'var(--green-pale)', color: 'var(--green-mid)', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>View</button>
                        </Link>
                        <button onClick={() => resetScore(u.id, u.full_name)} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, background: 'var(--amber-light)', color: '#9A6700', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Reset</button>
                        <button onClick={() => deleteUser(u.id, u.full_name)} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, background: '#FEE2E2', color: '#991B1B', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VOUCHES TAB */}
      {tab === 'vouches' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '0.75rem' }}>{vouches.length} vouches total</p>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Message</th>
                  <th>Points</th>
                  <th>When</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vouches.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 500 }}>{v.voucher?.full_name}</td>
                    <td style={{ fontWeight: 500 }}>{v.vouchee?.full_name}</td>
                    <td style={{ color: 'var(--muted)', maxWidth: 200 }}>
                      {v.message ? <em>"{v.message.length > 50 ? v.message.slice(0, 50) + '...' : v.message}"</em> : <span>No message</span>}
                    </td>
                    <td><span className="badge badge-green">+{v.weight}pts</span></td>
                    <td style={{ color: 'var(--muted)' }}>{timeAgo(v.created_at)}</td>
                    <td>
                      <button onClick={() => deleteVouch(v.id, v.vouchee?.id, v.weight)} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, background: '#FEE2E2', color: '#991B1B', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUSPICIOUS ACTIVITY TAB */}
      {tab === 'suspicious' && (
        <div>
          <div className="card" style={{ marginBottom: '1rem', background: 'var(--amber-light)', border: '1px solid #F5A62344' }}>
            <p style={{ fontSize: 14, color: '#9A6700', lineHeight: 1.7 }}>
              This section flags potentially fake vouching activity. Review these carefully and delete suspicious vouches if needed.
            </p>
          </div>

          <h3 style={{ fontSize: 16, color: 'var(--green)', marginBottom: '1rem' }}>Mutual vouches (A vouched B and B vouched A)</h3>
          {(() => {
            const mutual = []
            vouches.forEach(v => {
              const reverse = vouches.find(x => x.voucher?.email === v.vouchee?.email && x.vouchee?.email === v.voucher?.email)
              if (reverse && !mutual.find(m => m.id === v.id || m.id === reverse.id)) {
                mutual.push(v, reverse)
              }
            })
            return mutual.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                <p style={{ fontSize: 14 }}>No mutual vouches detected</p>
              </div>
            ) : (
              <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
                <table className="admin-table">
                  <thead><tr><th>From</th><th>To</th><th>Points</th><th>When</th><th>Action</th></tr></thead>
                  <tbody>
                    {mutual.map(v => (
                      <tr key={v.id} style={{ background: '#FEF3DC' }}>
                        <td style={{ fontWeight: 500 }}>{v.voucher?.full_name}</td>
                        <td style={{ fontWeight: 500 }}>{v.vouchee?.full_name}</td>
                        <td><span className="badge badge-amber">+{v.weight}pts</span></td>
                        <td style={{ color: 'var(--muted)' }}>{timeAgo(v.created_at)}</td>
                        <td>
                          <button onClick={() => deleteVouch(v.id, v.vouchee?.id, v.weight)} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, background: '#FEE2E2', color: '#991B1B', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })()}

          <h3 style={{ fontSize: 16, color: 'var(--green)', marginBottom: '1rem' }}>Users with 0 score but many vouches given</h3>
          {(() => {
            const suspicious = users.filter(u => u.trust_score === 0 && (u.vouch_count || 0) === 0 && vouches.filter(v => v.voucher?.email === u.email).length >= 3)
            return suspicious.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                <p style={{ fontSize: 14 }}>No suspicious accounts detected</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Score</th><th>Vouches Given</th><th>Action</th></tr></thead>
                  <tbody>
                    {suspicious.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.full_name}</td>
                        <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                        <td style={{ color: 'var(--muted)' }}>{u.trust_score}</td>
                        <td>{vouches.filter(v => v.voucher?.email === u.email).length}</td>
                        <td>
                          <button onClick={() => deleteUser(u.id, u.full_name)} style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, background: '#FEE2E2', color: '#991B1B', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
