import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { useNavigate, Link } from 'react-router-dom'

const ADMIN_EMAIL = 'adeolasamuel013@gmail.com'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({ users: 0, vouches: 0, messages: 0, reports: 0, todayUsers: 0, todayVouches: 0 })
  const [users, setUsers] = useState([])
  const [vouches, setVouches] = useState([])
  const [reports, setReports] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!user) return
    if (user.email !== ADMIN_EMAIL) { navigate('/dashboard'); return }
    loadAll()
  }, [user])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function loadAll() {
    setLoading(true)
    const today = new Date(); today.setHours(0, 0, 0, 0)

    const [
      { count: totalUsers },
      { count: totalVouches },
      { count: totalMessages },
      { count: totalReports },
      { count: todayUsers },
      { count: todayVouches },
      { data: allUsers },
      { data: allVouches },
      { data: allReports },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('vouches').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('vouches').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('vouches').select('*, voucher:profiles!vouches_voucher_id_fkey(full_name,email), vouchee:profiles!vouches_vouchee_id_fkey(id,full_name,email)').order('created_at', { ascending: false }).limit(200),
      supabase.from('reports').select('*, reporter:profiles!reports_reporter_id_fkey(full_name,email), reported:profiles!reports_reported_id_fkey(full_name,email,skill,trust_score)').order('created_at', { ascending: false }),
    ])

    setStats({ users: totalUsers || 0, vouches: totalVouches || 0, messages: totalMessages || 0, reports: totalReports || 0, todayUsers: todayUsers || 0, todayVouches: todayVouches || 0 })
    setUsers(allUsers || [])
    setVouches(allVouches || [])
    setReports(allReports || [])

    // Load conversation metadata — who talked to who
    await loadConversations()
    setLoading(false)
  }

  async function loadConversations() {
    // Get all unique conversation pairs with message counts
    const { data: msgs } = await supabase.from('messages')
      .select('sender_id, receiver_id, created_at')
      .order('created_at', { ascending: false })

    if (!msgs || msgs.length === 0) { setConversations([]); return }

    // Group by conversation pairs
    const pairs = {}
    msgs.forEach(m => {
      const key = [m.sender_id, m.receiver_id].sort().join('_')
      if (!pairs[key]) {
        pairs[key] = { ids: [m.sender_id, m.receiver_id].sort(), count: 0, lastAt: m.created_at }
      }
      pairs[key].count++
      if (new Date(m.created_at) > new Date(pairs[key].lastAt)) pairs[key].lastAt = m.created_at
    })

    // Fetch profile names for all unique IDs
    const allIds = [...new Set(msgs.flatMap(m => [m.sender_id, m.receiver_id]))]
    const { data: profiles } = await supabase.from('profiles').select('id,full_name,skill').in('id', allIds)
    const profileMap = {}
    profiles?.forEach(p => { profileMap[p.id] = p })

    const convList = Object.values(pairs).map(pair => ({
      person1: profileMap[pair.ids[0]] || { full_name: 'Unknown', skill: '' },
      person2: profileMap[pair.ids[1]] || { full_name: 'Unknown', skill: '' },
      id1: pair.ids[0],
      id2: pair.ids[1],
      count: pair.count,
      lastAt: pair.lastAt
    }))

    convList.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
    setConversations(convList)
  }

async function deleteUser(id, name) {
  if (!confirm(`Delete ${name}? This will delete all their vouches, messages and reports.`)) return
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`https://bjcayozrlzogjkxniuee.supabase.co/functions/v1/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId: id }),
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Delete failed')

    setUsers(u => u.filter(x => x.id !== id))
    showToast(`${name} has been deleted.`)
  } catch (err) {
    showToast(`Error deleting user: ${err.message}`)
  }
}

  async function resetScore(id, name) {
    if (!confirm(`Reset ${name} trust score to 0?`)) return
    await supabase.from('profiles').update({ trust_score: 0, vouch_count: 0 }).eq('id', id)
    setUsers(u => u.map(x => x.id === id ? { ...x, trust_score: 0, vouch_count: 0 } : x))
    showToast(`Score reset for ${name}.`)
  }

  async function deleteVouch(id, voucheeId, weight) {
    if (!confirm('Delete this vouch? The trust score will be reduced.')) return
    await supabase.from('vouches').delete().eq('id', id)
    const { data: p } = await supabase.from('profiles').select('trust_score,vouch_count').eq('id', voucheeId).single()
    if (p) await supabase.from('profiles').update({ trust_score: Math.max(0, (p.trust_score || 0) - weight), vouch_count: Math.max(0, (p.vouch_count || 0) - 1) }).eq('id', voucheeId)
    setVouches(v => v.filter(x => x.id !== id))
    showToast('Vouch deleted and score updated.')
  }

  async function updateReportStatus(id, status) {
    await supabase.from('reports').update({ status }).eq('id', id)
    setReports(r => r.map(x => x.id === id ? { ...x, status } : x))
    showToast(`Report marked as ${status}.`)
  }

  async function deleteReport(id) {
    await supabase.from('reports').delete().eq('id', id)
    setReports(r => r.filter(x => x.id !== id))
    showToast('Report deleted.')
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
  const pendingReports = reports.filter(r => r.status === 'pending').length

  if (loading) return <div className="loader"><div className="spin" style={{ width: 32, height: 32 }} /></div>

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        .atab { padding: 9px 18px; border-radius: 999px; font-size: 14px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: white; font-family: DM Sans, sans-serif; transition: all 0.15s; white-space: nowrap; }
        .atab.active { background: var(--green); color: white; border-color: var(--green); }
        .atab.alert { border-color: #F5A623; color: #9A6700; }
        .atab.alert.active { background: #F5A623; color: white; border-color: #F5A623; }
        .atable { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 580px; }
        .atable th { text-align: left; padding: 10px 12px; background: var(--green); color: white; font-weight: 500; font-size: 12px; }
        .atable td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .atable tr:hover td { background: var(--cream); }
        .twrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); }
        .sgrid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .ogrid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        .abtn { padding: 5px 10px; font-size: 11px; border-radius: 6px; border: none; cursor: pointer; font-family: DM Sans, sans-serif; font-weight: 500; }
        @media(min-width:640px) { .sgrid { grid-template-columns: repeat(6,1fr); } }
        @media(min-width:768px) { .ogrid { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 20, background: 'var(--green)', color: 'white', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 4, fontFamily: 'Fraunces, serif' }}>Admin Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Logged in as {user?.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadAll} className="btn btn-outline" style={{ padding: '9px 18px', fontSize: 13 }}>Refresh</button>
          <Link to="/dashboard"><button className="btn btn-green" style={{ padding: '9px 18px', fontSize: 13 }}>My profile</button></Link>
        </div>
      </div>

      {/* Stats */}
      <div className="sgrid">
        {[
          { label: 'Total users', value: stats.users, sub: `+${stats.todayUsers} today`, color: 'var(--green)' },
          { label: 'Total vouches', value: stats.vouches, sub: `+${stats.todayVouches} today`, color: 'var(--green)' },
          { label: 'Total messages', value: stats.messages, sub: 'all time', color: 'var(--green)' },
          { label: 'Conversations', value: conversations.length, sub: 'unique pairs', color: 'var(--green)' },
          { label: 'Reports', value: stats.reports, sub: `${pendingReports} pending`, color: pendingReports > 0 ? '#DC2626' : 'var(--green)' },
          { label: 'Health', value: stats.vouches >= stats.users ? 'Good' : 'Early', sub: 'platform activity', color: stats.vouches >= stats.users ? 'var(--green-mid)' : 'var(--amber)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '1rem' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 24, color, marginBottom: 3, lineHeight: 1 }}>{value}</p>
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
          { id: 'conversations', label: `Conversations (${conversations.length})` },
          { id: 'reports', label: `Reports ${pendingReports > 0 ? `(${pendingReports} new)` : ''}`, alert: pendingReports > 0 },
          { id: 'suspicious', label: 'Suspicious' },
        ].map(t => (
          <button key={t.id} className={`atab ${tab === t.id ? 'active' : ''} ${t.alert && tab !== t.id ? 'alert' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="ogrid">
          <div className="card">
            <h3 style={{ fontSize: 16, color: 'var(--green)', marginBottom: '1rem' }}>Top trusted users</h3>
            {topUsers.length === 0 ? <p style={{ fontSize: 13, color: 'var(--muted)' }}>No users yet</p> : topUsers.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i < topUsers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 14, color: 'var(--muted)', minWidth: 24 }}>#{i + 1}</span>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>{u.full_name?.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{u.full_name}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>{u.skill}</p>
                </div>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 18, color: 'var(--green)' }}>{u.trust_score}</span>
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
            <h3 style={{ fontSize: 16, color: 'var(--green)', marginBottom: '1rem' }}>Most active conversations</h3>
            {conversations.slice(0, 6).length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>No conversations yet</p>
            ) : conversations.slice(0, 6).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {c.person1.full_name} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>↔</span> {c.person2.full_name}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>{c.count} messages · {timeAgo(c.lastAt)}</p>
                </div>
                <span className="badge badge-green" style={{ fontSize: 11, flexShrink: 0 }}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div>
          <input placeholder="Search by name, email or skill..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '0.75rem' }}>{filteredUsers.length} users found</p>
          <div className="twrap">
            <table className="atable">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Skill</th><th>Location</th>
                  <th>Score</th><th>Vouches</th><th>Joined</th><th>Actions</th>
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
                    <td><span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 16, color: u.trust_score >= 70 ? 'var(--green-mid)' : u.trust_score >= 40 ? '#9A6700' : 'var(--muted)' }}>{u.trust_score || 0}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{u.vouch_count || 0}</td>
                    <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeAgo(u.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <Link to={`/profile/${u.id}`}><button className="abtn" style={{ background: 'var(--green-pale)', color: 'var(--green-mid)' }}>View</button></Link>
                        <button onClick={() => resetScore(u.id, u.full_name)} className="abtn" style={{ background: 'var(--amber-light)', color: '#9A6700' }}>Reset</button>
                        <button onClick={() => deleteUser(u.id, u.full_name)} className="abtn" style={{ background: '#FEE2E2', color: '#991B1B' }}>Delete</button>
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
          <div className="twrap">
            <table className="atable">
              <thead><tr><th>From</th><th>To</th><th>Message</th><th>Points</th><th>When</th><th>Action</th></tr></thead>
              <tbody>
                {vouches.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 500 }}>{v.voucher?.full_name}</td>
                    <td style={{ fontWeight: 500 }}>{v.vouchee?.full_name}</td>
                    <td style={{ color: 'var(--muted)', maxWidth: 180 }}>
                      {v.message ? <em>"{v.message.length > 45 ? v.message.slice(0, 45) + '...' : v.message}"</em> : <span style={{ color: 'var(--border)' }}>No message</span>}
                    </td>
                    <td><span className="badge badge-green">+{v.weight}pts</span></td>
                    <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeAgo(v.created_at)}</td>
                    <td><button onClick={() => deleteVouch(v.id, v.vouchee?.id, v.weight)} className="abtn" style={{ background: '#FEE2E2', color: '#991B1B' }}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONVERSATIONS TAB */}
      {tab === 'conversations' && (
        <div>
          <div className="card" style={{ marginBottom: '1rem', background: 'var(--green-pale)', border: '1px solid #B8E8D4' }}>
            <p style={{ fontSize: 13, color: 'var(--green-mid)', lineHeight: 1.7 }}>
              You can see who messaged who and how many messages they exchanged. You cannot read the actual message content unless a user reports someone — this protects user privacy.
            </p>
          </div>
          {conversations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              <p>No conversations yet on the platform.</p>
            </div>
          ) : (
            <div className="twrap">
              <table className="atable">
                <thead>
                  <tr><th>Person 1</th><th>Person 2</th><th>Messages</th><th>Last active</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {conversations.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 13 }}>{c.person1.full_name}</p>
                          <p style={{ fontSize: 11, color: 'var(--muted)' }}>{c.person1.skill}</p>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 13 }}>{c.person2.full_name}</p>
                          <p style={{ fontSize: 11, color: 'var(--muted)' }}>{c.person2.skill}</p>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 18, color: 'var(--green)' }}>{c.count}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>msgs</span>
                      </td>
                      <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeAgo(c.lastAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <Link to={`/profile/${c.id1}`}><button className="abtn" style={{ background: 'var(--green-pale)', color: 'var(--green-mid)' }}>P1 profile</button></Link>
                          <Link to={`/profile/${c.id2}`}><button className="abtn" style={{ background: 'var(--green-pale)', color: 'var(--green-mid)' }}>P2 profile</button></Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {tab === 'reports' && (
        <div>
          {reports.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              <p style={{ fontSize: 32, marginBottom: '1rem' }}>✅</p>
              <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, color: 'var(--dark)' }}>No reports yet</p>
              <p style={{ fontSize: 13 }}>When users report someone it will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.map(r => (
                <div key={r.id} className="card" style={{ borderLeft: `4px solid ${r.status === 'pending' ? '#F5A623' : r.status === 'resolved' ? 'var(--green-light)' : 'var(--border)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 999, background: r.status === 'pending' ? 'var(--amber-light)' : r.status === 'resolved' ? 'var(--green-pale)' : '#F3F4F6', color: r.status === 'pending' ? '#9A6700' : r.status === 'resolved' ? 'var(--green-mid)' : 'var(--muted)' }}>
                          {r.status}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{timeAgo(r.created_at)}</span>
                      </div>
                      <p style={{ fontSize: 14 }}>
                        <strong>{r.reporter?.full_name}</strong>
                        <span style={{ color: 'var(--muted)' }}> reported </span>
                        <strong>{r.reported?.full_name}</strong>
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--muted)' }}>{r.reporter?.email} → {r.reported?.email}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link to={`/profile/${r.reported_id}`}><button className="abtn" style={{ background: 'var(--green-pale)', color: 'var(--green-mid)', padding: '7px 12px', fontSize: 12 }}>View profile</button></Link>
                      {r.status === 'pending' && <button onClick={() => updateReportStatus(r.id, 'resolved')} className="abtn" style={{ background: 'var(--green-pale)', color: 'var(--green-mid)', padding: '7px 12px', fontSize: 12 }}>Mark resolved</button>}
                      {r.status === 'pending' && <button onClick={() => updateReportStatus(r.id, 'dismissed')} className="abtn" style={{ background: '#F3F4F6', color: 'var(--muted)', padding: '7px 12px', fontSize: 12 }}>Dismiss</button>}
                      <button onClick={() => deleteUser(r.reported_id, r.reported?.full_name)} className="abtn" style={{ background: '#FEE2E2', color: '#991B1B', padding: '7px 12px', fontSize: 12 }}>Ban user</button>
                      <button onClick={() => deleteReport(r.id)} className="abtn" style={{ background: '#F3F4F6', color: 'var(--muted)', padding: '7px 12px', fontSize: 12 }}>Delete report</button>
                    </div>
                  </div>
                  <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '0.875rem' }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</p>
                    <p style={{ fontSize: 14, color: 'var(--dark)', fontWeight: 500, marginBottom: r.details ? 8 : 0 }}>{r.reason}</p>
                    {r.details && <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>{r.details}</p>}
                  </div>
                  {r.reported && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>Reported user skill: <strong>{r.reported.skill || 'Not set'}</strong></p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>Trust score: <strong>{r.reported.trust_score || 0}</strong></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUSPICIOUS TAB */}
      {tab === 'suspicious' && (
        <div>
          <div className="card" style={{ marginBottom: '1rem', background: 'var(--amber-light)', border: '1px solid #F5A62344' }}>
            <p style={{ fontSize: 14, color: '#9A6700', lineHeight: 1.7 }}>
              This section automatically flags potentially fake vouching. Review carefully and take action where needed.
            </p>
          </div>

          <h3 style={{ fontSize: 16, color: 'var(--green)', marginBottom: '1rem' }}>Mutual vouches — A vouched B and B vouched A</h3>
          {(() => {
            const mutual = []
            const seen = new Set()
            vouches.forEach(v => {
              const reverse = vouches.find(x => x.voucher?.email === v.vouchee?.email && x.vouchee?.email === v.voucher?.email)
              if (reverse) {
                const key = [v.id, reverse.id].sort().join('_')
                if (!seen.has(key)) { seen.add(key); mutual.push({ v1: v, v2: reverse }) }
              }
            })
            return mutual.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
                <p>No mutual vouches detected</p>
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                {mutual.map(({ v1, v2 }, i) => (
                  <div key={i} className="card" style={{ borderLeft: '4px solid #F5A623', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <p style={{ fontSize: 14 }}>
                        <strong>{v1.voucher?.full_name}</strong>
                        <span style={{ color: 'var(--muted)' }}> and </span>
                        <strong>{v1.vouchee?.full_name}</strong>
                        <span style={{ color: 'var(--muted)' }}> vouched for each other</span>
                      </p>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => deleteVouch(v1.id, v1.vouchee?.id, v1.weight)} className="abtn" style={{ background: '#FEE2E2', color: '#991B1B' }}>Delete vouch 1</button>
                        <button onClick={() => deleteVouch(v2.id, v2.vouchee?.id, v2.weight)} className="abtn" style={{ background: '#FEE2E2', color: '#991B1B' }}>Delete vouch 2</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          <h3 style={{ fontSize: 16, color: 'var(--green)', marginBottom: '1rem' }}>New accounts that vouched multiple times quickly</h3>
          {(() => {
            const suspicious = users.filter(u => {
              const given = vouches.filter(v => v.voucher?.email === u.email)
              const dayOld = (Date.now() - new Date(u.created_at)) < 86400000
              return dayOld && given.length >= 3
            })
            return suspicious.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                <p>No suspicious new accounts detected</p>
              </div>
            ) : (
              <div className="twrap">
                <table className="atable">
                  <thead><tr><th>Name</th><th>Email</th><th>Account age</th><th>Vouches given</th><th>Action</th></tr></thead>
                  <tbody>
                    {suspicious.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.full_name}</td>
                        <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                        <td style={{ color: 'var(--muted)' }}>{timeAgo(u.created_at)}</td>
                        <td><span className="badge badge-amber">{vouches.filter(v => v.voucher?.email === u.email).length} vouches</span></td>
                        <td><button onClick={() => deleteUser(u.id, u.full_name)} className="abtn" style={{ background: '#FEE2E2', color: '#991B1B' }}>Delete</button></td>
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
