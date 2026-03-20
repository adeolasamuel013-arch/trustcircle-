import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'

export default function Notifications() {
  const { user, profile, fetchProfile } = useAuth()
  const [notifs, setNotifs] = useState([])
  const [lastRead, setLastRead] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    load()
    const ch = supabase.channel('vouches-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vouches', filter: `vouchee_id=eq.${user.id}` }, () => load())
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [user])

  async function load() {
    const [{ data: vouches }, { data: p }] = await Promise.all([
      supabase.from('vouches')
        .select('*, voucher:profiles!vouches_voucher_id_fkey(id,full_name,skill,trust_score,avatar_url)')
        .eq('vouchee_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('notifs_last_read').eq('id', user.id).single()
    ])
    setNotifs(vouches || [])
    setLastRead(p?.notifs_last_read || null)
    setLoading(false)

    // Mark all as read — update last_read to now
    await supabase.from('profiles')
      .update({ notifs_last_read: new Date().toISOString() })
      .eq('id', user.id)

    // Refresh profile so navbar badge clears
    await fetchProfile(user.id)
  }

  function ago(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    if (m < 1440) return `${Math.floor(m / 60)}h ago`
    return `${Math.floor(m / 1440)}d ago`
  }

  const isUnread = (v) => lastRead ? new Date(v.created_at) > new Date(lastRead) : false
  const unreadCount = notifs.filter(isUnread).length

  if (loading) return <div className="loader"><div className="spin" style={{ width: 32, height: 32 }} /></div>

  return (
    <div className="page-sm">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 24, color: 'var(--green)', marginBottom: 4 }}>Notifications</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Every time someone vouches for you it shows here.</p>
        </div>
        {unreadCount > 0 && (
          <span style={{ background: 'var(--green-light)', color: 'white', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 999, flexShrink: 0 }}>
            {unreadCount} new
          </span>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem 1.5rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, color: 'var(--dark)' }}>No notifications yet</p>
          <p style={{ lineHeight: 1.7 }}>Share your profile link and ask people who know your work to vouch for you.</p>
          <Link to="/dashboard" style={{ display: 'inline-block', marginTop: '1.25rem' }}>
            <button className="btn btn-green">Go to dashboard</button>
          </Link>
        </div>
      ) : (
        <div>
          {notifs.map((n, i) => {
            const unread = isUnread(n)
            return (
              <div key={n.id} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                padding: '1rem 1.25rem',
                marginBottom: 8,
                background: unread ? 'var(--green-pale)' : 'var(--white)',
                border: `1px solid ${unread ? '#c3e8d8' : 'var(--border)'}`,
                borderRadius: 14,
                borderLeft: unread ? '3px solid var(--green-light)' : `1px solid var(--border)`,
                transition: 'background 0.3s'
              }}>
                <Link to={`/profile/${n.voucher?.id}`} style={{ flexShrink: 0 }}>
                  <Avatar profile={n.voucher} size={44} />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, marginBottom: 4, lineHeight: 1.5 }}>
                    <Link to={`/profile/${n.voucher?.id}`} style={{ fontWeight: 700, color: 'var(--green)' }}>
                      {n.voucher?.full_name}
                    </Link>
                    {' '}vouched for you{' '}
                    <span className="badge badge-green" style={{ fontSize: 11 }}>+{n.weight}pts</span>
                  </p>
                  {n.message && (
                    <p style={{ fontSize: 13, fontStyle: 'italic', borderLeft: '2px solid var(--green-light)', paddingLeft: 10, lineHeight: 1.6, marginBottom: 6, color: 'var(--dark)' }}>
                      "{n.message}"
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {n.voucher?.skill}{n.voucher?.skill && ' · '}Score: {n.voucher?.trust_score} · {ago(n.created_at)}
                  </p>
                </div>
                {unread && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-light)', flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
