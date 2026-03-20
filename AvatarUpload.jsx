import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadMsgs, setUnreadMsgs] = useState(0)
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    if (!user) return
    fetchCounts()
    const ch = supabase.channel('nav')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, fetchCounts)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vouches', filter: `vouchee_id=eq.${user.id}` }, fetchCounts)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [user])

  async function fetchCounts() {
    if (!user) return
    const [{ count: m }, profileRes] = await Promise.all([
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('read', false),
      supabase.from('profiles').select('notifs_last_read').eq('id', user.id).single()
    ])
    setUnreadMsgs(m || 0)
    // Count vouches newer than last read time
    const lastRead = profileRes.data?.notifs_last_read
    if (lastRead) {
      const { count: n } = await supabase.from('vouches')
        .select('*', { count: 'exact', head: true })
        .eq('vouchee_id', user.id)
        .gt('created_at', lastRead)
      setUnreadNotifs(n || 0)
    } else {
      const { count: n } = await supabase.from('vouches')
        .select('*', { count: 'exact', head: true })
        .eq('vouchee_id', user.id)
      setUnreadNotifs(n || 0)
    }
  }

  async function handleSignOut() { await signOut(); navigate('/') }

  const isAdmin = user?.email === 'adeolasamuel013@gmail.com'
  const isActive = (p) => location.pathname === p

  const navLinks = [
    { to: '/search', label: 'Search' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/posts', label: 'Showcase' },
    { to: '/vouch', label: 'Vouch', auth: true },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  const Badge = ({ count }) => count > 0 ? (
    <span style={{ position: 'absolute', top: -4, right: -4, background: '#DC2626', color: 'white', fontSize: 9, fontWeight: 700, minWidth: 15, height: 15, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '2px solid var(--cream)' }}>
      {count > 9 ? '9+' : count}
    </span>
  ) : null

  return (
    <>
      <style>{`
        .nav { position: sticky; top: 0; z-index: 50; height: 62px; background: white; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 1.5rem; gap: 0; }
        .nav-brand { font-family: Fraunces, serif; font-size: 20px; font-weight: 900; color: var(--green); text-decoration: none; margin-right: auto; display: flex; align-items: center; gap: 8px; }
        .nav-brand-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green-light); }
        .nav-links { display: flex; align-items: center; gap: 4px; margin-right: 1.25rem; }
        .nav-link { font-size: 14px; font-weight: 500; color: var(--muted); padding: 7px 12px; border-radius: 8px; transition: all 0.15s; white-space: nowrap; text-decoration: none; }
        .nav-link:hover { color: var(--green); background: var(--green-pale); }
        .nav-link.active { color: var(--green); font-weight: 600; background: var(--green-pale); }
        .nav-right { display: flex; align-items: center; gap: 8px; }
        .nav-icon { position: relative; width: 36px; height: 36px; border-radius: 9px; background: var(--cream); border: 1px solid var(--border); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all 0.15s; text-decoration: none; }
        .nav-icon:hover { background: var(--green-pale); color: var(--green); border-color: var(--green-light); }
        .nav-avatar { width: 34px; height: 34px; border-radius: 9px; overflow: hidden; background: var(--green); display: flex; align-items: center; justify-content: center; font-family: Fraunces, serif; font-size: 14px; font-weight: 700; color: white; cursor: pointer; border: 1.5px solid var(--border); text-decoration: none; flex-shrink: 0; }
        .nav-signout { font-size: 13px; font-weight: 500; background: none; border: 1px solid var(--border); color: var(--muted); padding: 7px 14px; border-radius: 8px; cursor: pointer; font-family: DM Sans, sans-serif; transition: all 0.15s; white-space: nowrap; }
        .nav-signout:hover { color: var(--green); border-color: var(--green); }
        .hamburger { width: 36px; height: 36px; border-radius: 9px; background: var(--cream); border: 1px solid var(--border); cursor: pointer; display: none; align-items: center; justify-content: center; flex-direction: column; gap: 5px; }
        .ham-line { width: 16px; height: 1.5px; background: var(--dark); border-radius: 99; }
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 98; animation: fadeIn 0.2s ease; }
        .drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 272px; background: white; z-index: 99; display: flex; flex-direction: column; box-shadow: -4px 0 30px rgba(0,0,0,0.1); animation: slideRight 0.25s ease; }
        @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .drawer-head { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); }
        .drawer-body { flex: 1; overflow-y: auto; padding: 0.75rem 0; }
        .drawer-item { display: flex; align-items: center; gap: 12px; padding: 11px 1.25rem; font-size: 14px; font-weight: 500; color: var(--muted); text-decoration: none; transition: all 0.15s; border-left: 2.5px solid transparent; }
        .drawer-item:hover, .drawer-item.active { color: var(--green); background: var(--green-pale); border-left-color: var(--green); }
        .drawer-foot { padding: 1rem 1.25rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }
        @media(max-width: 720px) { .nav-links { display: none; } .hamburger { display: flex; } }
      `}</style>

      <nav className="nav">
        <Link to={user ? '/dashboard' : '/'} className="nav-brand">
          <div className="nav-brand-dot" />
          Pruv
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          {navLinks.filter(l => !l.auth || user).map(({ to, label }) => (
            <Link key={to} to={to} className={`nav-link ${isActive(to) ? 'active' : ''}`}>{label}</Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="nav-right">
          {user ? (
            <>
              <Link to="/messages" className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <Badge count={unreadMsgs} />
              </Link>
              <Link to="/notifications" className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <Badge count={unreadNotifs} />
              </Link>
              <Link to="/dashboard" className="nav-avatar">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : profile?.full_name?.charAt(0).toUpperCase() || 'U'
                }
              </Link>
              <button className="nav-signout" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', padding: '7px 12px', borderRadius: 8, transition: 'color 0.15s' }}>Sign in</Link>
              <Link to="/signup"><button className="btn btn-green btn-sm">Join free</button></Link>
            </>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(true)}>
            <div className="ham-line" /><div className="ham-line" /><div className="ham-line" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setMenuOpen(false)} />
          <div className="drawer">
            <div className="drawer-head">
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 900, color: 'var(--green)' }}>Pruv</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem 1.25rem', background: 'var(--green-pale)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--green)' }}>{profile?.full_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--green-mid)' }}>Score: {profile?.trust_score || 0}</p>
                </div>
              </div>
            )}
            <div className="drawer-body">
              {[
                { to: '/', label: 'Home' },
                { to: '/dashboard', label: 'My Dashboard', auth: true },
                { to: '/search', label: 'Search Services' },
                { to: '/vouch', label: 'Vouch for Someone', auth: true },
                { to: '/leaderboard', label: 'Leaderboard' },
                { to: '/posts', label: 'Work Showcase' },
                { to: '/messages', label: 'Messages', auth: true, badge: unreadMsgs },
                { to: '/notifications', label: 'Notifications', auth: true, badge: unreadNotifs },
                { to: '/edit-profile', label: 'Edit Profile', auth: true },
                { to: '/how-it-works', label: 'How It Works' },
                ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
              ].filter(l => !l.auth || user).map(({ to, label, badge }) => (
                <Link key={to} to={to} className={`drawer-item ${isActive(to) ? 'active' : ''}`}>
                  {label}
                  {badge > 0 && (
                    <span style={{ marginLeft: 'auto', background: '#DC2626', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>{badge}</span>
                  )}
                </Link>
              ))}
            </div>
            <div className="drawer-foot">
              {user
                ? <button onClick={handleSignOut} className="btn btn-ghost btn-full">Sign out</button>
                : <>
                    <Link to="/signup"><button className="btn btn-green btn-full">Join free</button></Link>
                    <Link to="/login"><button className="btn btn-ghost btn-full">Sign in</button></Link>
                  </>
              }
            </div>
          </div>
        </>
      )}
    </>
  )
}
