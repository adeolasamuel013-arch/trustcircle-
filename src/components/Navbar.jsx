import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import Icon from './Icon'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    if (!user) return
    fetchCounts()
    const channel = supabase.channel('navbar-counts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, fetchCounts)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vouches', filter: `vouchee_id=eq.${user.id}` }, fetchCounts)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user])

  async function fetchCounts() {
    if (!user) return
    const [{ count: msgs }, { count: notifs }] = await Promise.all([
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('read', false),
      supabase.from('vouches').select('*', { count: 'exact', head: true }).eq('vouchee_id', user.id).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
    ])
    setUnreadMessages(msgs || 0)
    setUnreadNotifs(notifs || 0)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const isAdmin = user?.email === 'adeolasamuel013@gmail.com'
  const active = (path) => location.pathname === path

  return (
    <>
      <style>{`
        .nav-root {
          position: sticky; top: 0; z-index: 50; height: 60px;
          background: var(--white); border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.5rem; gap: 2rem;
        }
        .nav-brand {
          font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900;
          color: var(--forest); display: flex; align-items: center; gap: 8px;
          text-decoration: none; flex-shrink: 0; letter-spacing: -0.02em;
        }
        .nav-brand-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--terracotta); flex-shrink: 0; }
        .nav-links { display: flex; align-items: center; gap: 1.75rem; }
        .nav-link {
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
          letter-spacing: 0.03em; color: var(--mist); text-decoration: none;
          transition: color 0.15s; white-space: nowrap;
        }
        .nav-link:hover, .nav-link.active { color: var(--forest); }
        .nav-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .nav-icon-btn {
          position: relative; width: 36px; height: 36px; border-radius: 7px;
          background: var(--sand); border: 1px solid var(--border); cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: background 0.15s;
          color: var(--mist);
        }
        .nav-icon-btn:hover { background: var(--parchment); color: var(--forest); }
        .nav-badge {
          position: absolute; top: -4px; right: -4px;
          background: var(--terracotta); color: white; font-size: 9px;
          font-family: 'Syne', sans-serif; font-weight: 700;
          min-width: 16px; height: 16px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px; border: 2px solid var(--white);
        }
        .nav-avatar {
          width: 32px; height: 32px; border-radius: 7px; overflow: hidden;
          border: 1.5px solid var(--border); cursor: pointer;
          background: var(--forest); display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
          font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: white;
        }
        .nav-join-btn {
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          letter-spacing: 0.04em; background: var(--forest); color: white;
          border: none; padding: 9px 18px; border-radius: 6px; cursor: pointer;
          transition: all 0.18s; white-space: nowrap;
        }
        .nav-join-btn:hover { background: var(--moss); }
        .nav-login-link {
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
          color: var(--mist); text-decoration: none; white-space: nowrap;
          transition: color 0.15s;
        }
        .nav-login-link:hover { color: var(--forest); }
        .nav-menu-btn {
          width: 36px; height: 36px; border-radius: 7px; border: 1px solid var(--border);
          background: var(--sand); cursor: pointer; display: flex; align-items: center;
          justify-content: center; color: var(--forest);
        }

        /* Mobile drawer */
        .nav-drawer-overlay {
          position: fixed; inset: 0; background: rgba(14,12,10,0.5);
          z-index: 98; backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease;
        }
        .nav-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; width: 280px;
          background: var(--white); z-index: 99; box-shadow: -8px 0 40px rgba(0,0,0,0.15);
          display: flex; flex-direction: column;
          animation: slideIn 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.25rem; border-bottom: 1px solid var(--border);
        }
        .drawer-links { flex: 1; overflow-y: auto; padding: 1rem 0; }
        .drawer-link {
          display: flex; align-items: center; gap: 12px; padding: 12px 1.25rem;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
          color: var(--mist); transition: all 0.15s; text-decoration: none;
          border-left: 2px solid transparent;
        }
        .drawer-link:hover, .drawer-link.active {
          color: var(--forest); background: var(--sand);
          border-left-color: var(--forest);
        }
        .drawer-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }

        @media(max-width: 768px) { .nav-links { display: none; } }
        @media(min-width: 769px) { .nav-menu-btn { display: none; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <nav className="nav-root">
        <Link to={user ? '/dashboard' : '/'} className="nav-brand">
          <div className="nav-brand-dot" />
          Prov
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          <Link to="/search" className={`nav-link ${active('/search') ? 'active' : ''}`}>Search</Link>
          <Link to="/leaderboard" className={`nav-link ${active('/leaderboard') ? 'active' : ''}`}>Leaderboard</Link>
          <Link to="/posts" className={`nav-link ${active('/posts') ? 'active' : ''}`}>Showcase</Link>
          <Link to="/vouch" className={`nav-link ${active('/vouch') ? 'active' : ''}`}>Vouch</Link>
          {isAdmin && <Link to="/admin" className={`nav-link ${active('/admin') ? 'active' : ''}`}>Admin</Link>}
        </div>

        {/* Desktop right */}
        <div className="nav-right">
          {user ? (
            <>
              <Link to="/messages">
                <div className="nav-icon-btn">
                  <Icon name="message" size={16} color="currentColor" />
                  {unreadMessages > 0 && <div className="nav-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</div>}
                </div>
              </Link>
              <Link to="/notifications">
                <div className="nav-icon-btn">
                  <Icon name="bell" size={16} color="currentColor" />
                  {unreadNotifs > 0 && <div className="nav-badge">{unreadNotifs > 9 ? '9+' : unreadNotifs}</div>}
                </div>
              </Link>
              <Link to="/dashboard">
                <div className="nav-avatar">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : profile?.full_name?.charAt(0).toUpperCase() || 'U'
                  }
                </div>
              </Link>
              <button onClick={handleSignOut} style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 600, background: 'none', border: '1px solid var(--border)', color: 'var(--mist)', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.03em' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--forest)'; e.currentTarget.style.borderColor = 'var(--forest)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--mist)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login-link">Sign in</Link>
              <Link to="/signup"><button className="nav-join-btn">Join free</button></Link>
            </>
          )}
          <button className="nav-menu-btn" onClick={() => setMenuOpen(true)}>
            <Icon name="menu" size={18} color="currentColor" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div className="nav-drawer-overlay" onClick={() => setMenuOpen(false)} />
          <div className="nav-drawer">
            <div className="drawer-header">
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 900, color: 'var(--forest)' }}>Prov</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mist)', display: 'flex' }}>
                <Icon name="x" size={20} color="currentColor" />
              </button>
            </div>

            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--sand)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 16, color: 'white' }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : profile?.full_name?.charAt(0).toUpperCase() || 'U'
                  }
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--forest)' }}>{profile?.full_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--mist)' }}>Score: {profile?.trust_score || 0}</div>
                </div>
              </div>
            )}

            <div className="drawer-links">
              {[
                { to: '/', label: 'Home' },
                { to: '/dashboard', label: 'My Dashboard', auth: true },
                { to: '/search', label: 'Search Services' },
                { to: '/vouch', label: 'Vouch for Someone', auth: true },
                { to: '/leaderboard', label: 'Leaderboard' },
                { to: '/posts', label: 'Work Showcase' },
                { to: '/messages', label: 'Messages', badge: unreadMessages, auth: true },
                { to: '/notifications', label: 'Notifications', badge: unreadNotifs, auth: true },
                { to: '/edit-profile', label: 'Edit Profile', auth: true },
                { to: '/how-it-works', label: 'How It Works' },
                { to: '/admin', label: 'Admin Dashboard', admin: true },
              ].filter(l => {
                if (l.auth && !user) return false
                if (l.admin && !isAdmin) return false
                return true
              }).map(({ to, label, badge }) => (
                <Link key={to} to={to} className={`drawer-link ${active(to) ? 'active' : ''}`}>
                  {label}
                  {badge > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'var(--terracotta)', color: 'white', fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>{badge}</span>
                  )}
                </Link>
              ))}
            </div>

            <div className="drawer-footer">
              {user ? (
                <button onClick={handleSignOut} className="btn btn-outline btn-full" style={{ fontSize: 13 }}>Sign out</button>
              ) : (
                <>
                  <Link to="/signup"><button className="btn btn-green btn-full">Join free</button></Link>
                  <Link to="/login"><button className="btn btn-outline btn-full" style={{ fontSize: 13 }}>Sign in</button></Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
