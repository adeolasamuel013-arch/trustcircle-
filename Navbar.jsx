import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user) fetchUnread()
  }, [user])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  async function fetchUnread() {
    const { count } = await supabase
      .from('vouches')
      .select('*', { count: 'exact', head: true })
      .eq('vouchee_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    setUnread(count || 0)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,248,243,0.97)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
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

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, '@media(max-width:768px)': { display: 'none' } }} className="desktop-nav">
          <Link to="/search" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>Search</Link>
          <Link to="/leaderboard" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>Leaderboard</Link>
          {!user && <Link to="/how-it-works" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>How it works</Link>}
          {user && <Link to="/vouch" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>Vouch</Link>}
          {user && (
            <Link to="/notifications" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unread > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: 'var(--amber)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <>
              <Link to="/dashboard">
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </Link>
              <button onClick={handleSignOut} style={{ background: 'transparent', color: 'var(--green)', border: '1.5px solid var(--green)', padding: '7px 14px', fontSize: 13, borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"><button style={{ background: 'transparent', color: 'var(--green)', border: '1.5px solid var(--green)', padding: '8px 18px', fontSize: 14, borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Login</button></Link>
              <Link to="/signup"><button style={{ background: 'var(--green)', color: 'white', border: 'none', padding: '8px 18px', fontSize: 14, borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Join free</button></Link>
            </>
          )}
        </div>

        {/* Mobile right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="mobile-nav-right">
          {user && (
            <Link to="/notifications" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unread > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: 'var(--amber)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )}
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexDirection: 'column', gap: 5, justifyContent: 'center' }}
            aria-label="Menu"
          >
            <span style={{ display: 'block', width: 24, height: 2, background: menuOpen ? 'transparent' : 'var(--dark)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ display: 'block', width: 24, height: 2, background: menuOpen ? 'transparent' : 'var(--dark)', borderRadius: 2, transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 24, height: 2, background: menuOpen ? 'transparent' : 'var(--dark)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 99
        }} onClick={() => setMenuOpen(false)}>
          <div style={{
            background: 'var(--cream)', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.25rem',
            borderBottom: '1px solid var(--border)'
          }} onClick={e => e.stopPropagation()}>

            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem', background: 'var(--green-pale)', borderRadius: 12, marginBottom: '0.5rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--green)' }}>{profile?.full_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>Trust score: {profile?.trust_score || 0}</p>
                </div>
              </div>
            )}

            {[
              { to: '/search', label: 'Search services', show: true },
              { to: '/leaderboard', label: 'Leaderboard', show: true },
              { to: '/how-it-works', label: 'How it works', show: true },
              { to: '/dashboard', label: 'My dashboard', show: !!user },
              { to: '/vouch', label: 'Vouch for someone', show: !!user },
              { to: '/notifications', label: `Notifications${unread > 0 ? ` (${unread})` : ''}`, show: !!user },
              { to: '/edit-profile', label: 'Edit profile', show: !!user },
            ].filter(i => i.show).map(({ to, label }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px 16px', fontSize: 16, color: 'var(--dark)', borderRadius: 10, fontWeight: 500, background: location.pathname === to ? 'var(--green-pale)' : 'transparent', color: location.pathname === to ? 'var(--green)' : 'var(--dark)' }}>
                  {label}
                </div>
              </Link>
            ))}

            <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '1rem' }}>
              {user ? (
                <button onClick={handleSignOut} style={{ width: '100%', padding: '14px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Sign out
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: '14px', background: 'transparent', color: 'var(--green)', border: '1.5px solid var(--green)', borderRadius: 10, fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      Login
                    </button>
                  </Link>
                  <Link to="/signup" style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: '14px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      Join free
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .mobile-nav-right { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}
