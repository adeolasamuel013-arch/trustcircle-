import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [unreadVouches, setUnreadVouches] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    if (user) {
      loadUnread()
      const ch = supabase.channel('navbar-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
          () => loadUnread())
        .subscribe()
      return () => supabase.removeChannel(ch)
    }
  }, [user])

  async function loadUnread() {
    const [{ count: v }, { count: m }] = await Promise.all([
      supabase.from('vouches').select('*', { count: 'exact', head: true })
        .eq('vouchee_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      supabase.from('messages').select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id).eq('read', false)
    ])
    setUnreadVouches(v || 0)
    setUnreadMessages(m || 0)
  }

  async function handleSignOut() {
    await signOut(); navigate('/'); setOpen(false)
  }

  const Logo = () => (
    <Link to={user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3" stroke="white" strokeWidth="2"/>
          <circle cx="6" cy="16" r="2.5" stroke="white" strokeWidth="1.8"/>
          <circle cx="18" cy="16" r="2.5" stroke="white" strokeWidth="1.8"/>
          <line x1="9" y1="10" x2="7" y2="14" stroke="white" strokeWidth="1.5"/>
          <line x1="15" y1="10" x2="17" y2="14" stroke="white" strokeWidth="1.5"/>
        </svg>
      </div>
      <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 18, color: 'var(--green)' }}>TrustCircle</span>
    </Link>
  )

  const IconBtn = ({ to, icon, count }) => (
    <Link to={to} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon}
      {count > 0 && (
        <span style={{ position: 'absolute', top: -5, right: -5, width: 17, height: 17, borderRadius: '50%', background: 'var(--amber)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(250,248,243,0.97)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border)', padding: '0 1rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />

        {/* Desktop */}
        <div style={{ display: 'none', alignItems: 'center', gap: 20 }} id="desktop-nav">
          <Link to="/search" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>Search</Link>
          <Link to="/leaderboard" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>Leaderboard</Link>
          <Link to="/posts" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>Showcase</Link>
          {!user && <Link to="/how-it-works" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>How it works</Link>}
          {user && <Link to="/vouch" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>Vouch</Link>}
          {user && (
            <>
              <IconBtn to="/messages" count={unreadMessages} icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              } />
              <IconBtn to="/notifications" count={unreadVouches} icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              } />
              <Link to="/dashboard">
                <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--green-light)', cursor: 'pointer', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{profile?.full_name?.charAt(0).toUpperCase() || 'U'}</span>
                  }
                </div>
              </Link>
              <button onClick={handleSignOut} className="btn btn-outline" style={{ padding: '7px 14px', fontSize: 13 }}>Sign out</button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login"><button className="btn btn-outline" style={{ padding: '8px 18px' }}>Login</button></Link>
              <Link to="/signup"><button className="btn btn-green" style={{ padding: '8px 18px' }}>Join free</button></Link>
            </>
          )}
        </div>

        {/* Mobile right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }} id="mobile-right">
          {user && (
            <>
              <IconBtn to="/messages" count={unreadMessages} icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              } />
              <IconBtn to="/notifications" count={unreadVouches} icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              } />
            </>
          )}
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ display: 'block', width: 24, height: 2.5, background: 'var(--dark)', borderRadius: 2, transition: 'all 0.25s', transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ display: 'block', width: 24, height: 2.5, background: 'var(--dark)', borderRadius: 2, transition: 'all 0.25s', opacity: open ? 0 : 1 }} />
            <span style={{ display: 'block', width: 24, height: 2.5, background: 'var(--dark)', borderRadius: 2, transition: 'all 0.25s', transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, top: 64, background: 'rgba(0,0,0,0.5)', zIndex: 98 }} />
          <div style={{ position: 'fixed', top: 64, left: 0, right: 0, background: 'var(--cream)', zIndex: 99, borderBottom: '1px solid var(--border)', padding: '1rem' }}>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem', background: 'var(--green-pale)', borderRadius: 12, marginBottom: '1rem' }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{profile?.full_name?.charAt(0).toUpperCase() || 'U'}</span>
                  }
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--green)' }}>{profile?.full_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>Trust score: {profile?.trust_score || 0}/100</p>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { to: '/search', label: 'Search services', show: true },
                { to: '/leaderboard', label: 'Leaderboard', show: true },
              { to: '/posts', label: 'Work Showcase', show: true },
                { to: '/how-it-works', label: 'How it works', show: true },
                { to: '/dashboard', label: 'My dashboard', show: !!user },
                { to: '/vouch', label: 'Vouch for someone', show: !!user },
                { to: '/messages', label: unreadMessages > 0 ? `Messages (${unreadMessages} new)` : 'Messages', show: !!user },
                { to: '/notifications', label: unreadVouches > 0 ? `Notifications (${unreadVouches})` : 'Notifications', show: !!user },
                { to: '/edit-profile', label: 'Edit profile', show: !!user },
              ].filter(i => i.show).map(({ to, label }) => (
                <Link key={to} to={to}>
                  <div style={{ padding: '13px 16px', fontSize: 16, fontWeight: 500, color: location.pathname === to ? 'var(--green)' : 'var(--dark)', background: location.pathname === to ? 'var(--green-pale)' : 'transparent', borderRadius: 10 }}>
                    {label}
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
              {user ? (
                <button onClick={handleSignOut} className="btn btn-green btn-full">Sign out</button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/login"><button className="btn btn-outline btn-full">Login</button></Link>
                  <Link to="/signup"><button className="btn btn-green btn-full">Join TrustCircle free</button></Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (min-width: 769px) { #mobile-right { display: none !important; } #desktop-nav { display: flex !important; } }
        @media (max-width: 768px) { #desktop-nav { display: none !important; } #mobile-right { display: flex !important; } }
      `}</style>
    </>
  )
}
