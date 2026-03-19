import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icon'

export default function Notifications() {
  const { user } = useAuth()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      load()
      const ch = supabase.channel('vouches-rt')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vouches', filter: `vouchee_id=eq.${user.id}` }, () => load())
        .subscribe()
      return () => supabase.removeChannel(ch)
    }
  }, [user])

  async function load() {
    const { data } = await supabase.from('vouches')
      .select('*, voucher:profiles!vouches_voucher_id_fkey(id,full_name,skill,trust_score)')
      .eq('vouchee_id', user.id).order('created_at', { ascending: false }).limit(30)
    setNotifs(data || []); setLoading(false)
  }

  function ago(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    if (m < 1440) return `${Math.floor(m/60)}h ago`
    return `${Math.floor(m/1440)}d ago`
  }

  if (loading) return <div className="loader"><div className="spin" style={{ width: 32, height: 32 }} /></div>

  return (
    <div className="page-sm" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 8 }}>Notifications</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: '1.5rem' }}>Every time someone vouches for you it shows here.</p>

      {notifs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ display:"flex",justifyContent:"center",marginBottom:"1rem" }}><div style={{ width:64,height:64,borderRadius:"50%",background:"var(--green-pale)",display:"flex",alignItems:"center",justifyContent:"center" }}><Icon name="bell" size={28} color="var(--green)" /></div></div>
          <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 6 }}>No notifications yet</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Share your profile link and ask people who know your work to vouch for you.</p>
          <Link to="/dashboard"><button className="btn btn-green">Go to dashboard</button></Link>
        </div>
      ) : notifs.map((n, i) => (
        <div key={n.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.75rem', padding: '1rem', borderLeft: i === 0 ? '3px solid var(--green-light)' : '1px solid var(--border)' }}>
          <Link to={`/profile/${n.voucher?.id}`} style={{ flexShrink: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>
              {n.voucher?.full_name?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, marginBottom: 4, lineHeight: 1.5 }}>
              <Link to={`/profile/${n.voucher?.id}`} style={{ fontWeight: 600, color: 'var(--green)' }}>{n.voucher?.full_name}</Link>
              {' '}vouched for you{' '}
              <span className="badge badge-green" style={{ fontSize: 11 }}>+{n.weight}pts</span>
            </p>
            {n.message && <p style={{ fontSize: 13, fontStyle: 'italic', borderLeft: '2px solid var(--green-light)', paddingLeft: 10, lineHeight: 1.6, marginBottom: 4 }}>"{n.message}"</p>}
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>{n.voucher?.skill} · Score: {n.voucher?.trust_score} · {ago(n.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
