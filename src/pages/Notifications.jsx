import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadNotifications()
      // Real-time subscription for new vouches
      const channel = supabase
        .channel('vouches-realtime')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'vouches',
          filter: `vouchee_id=eq.${user.id}`
        }, payload => {
          loadNotifications()
        })
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [user])

  async function loadNotifications() {
    const { data } = await supabase
      .from('vouches')
      .select('*, voucher:profiles!vouches_voucher_id_fkey(id, full_name, skill, trust_score)')
      .eq('vouchee_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
    setNotifications(data || [])
    setLoading(false)
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '2.5rem 5%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 8 }}>Notifications</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Every time someone vouches for you, it shows up here.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: 28, height: 28 }}></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: 40, marginBottom: '1rem' }}>🔔</div>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark)', marginBottom: 6 }}>No notifications yet</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            Share your profile link and ask people who know your work to vouch for you.
          </p>
          <Link to="/dashboard">
            <button className="btn-primary" style={{ marginTop: '1.25rem' }}>Go to dashboard</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n, i) => (
            <div key={n.id} className="card" style={{
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
              borderLeft: i === 0 ? '3px solid var(--green-light)' : '1px solid var(--border)'
            }}>
              <Link to={`/profile/${n.voucher?.id}`} style={{ flexShrink: 0 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: 'var(--green-pale)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--green)'
                }}>
                  {n.voucher?.full_name?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, marginBottom: 4, lineHeight: 1.5 }}>
                  <Link to={`/profile/${n.voucher?.id}`} style={{ fontWeight: 600, color: 'var(--green)' }}>
                    {n.voucher?.full_name}
                  </Link>
                  <span style={{ color: 'var(--dark)' }}> vouched for you</span>
                  <span style={{ marginLeft: 8 }} className="badge badge-green">+{n.weight} pts</span>
                </p>
                {n.message && (
                  <p style={{
                    fontSize: 13, fontStyle: 'italic', color: 'var(--dark)',
                    borderLeft: '2px solid var(--green-light)', paddingLeft: 10,
                    lineHeight: 1.6, marginBottom: 4
                  }}>
                    "{n.message}"
                  </p>
                )}
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {n.voucher?.skill} · Score: {n.voucher?.trust_score} · {timeAgo(n.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
