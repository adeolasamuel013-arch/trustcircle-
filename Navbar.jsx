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
  }

  const isActive = (path) => location.pathname === path

  const linkStyle = (path) => ({
    fontSize: 14,
    color: isActive(path) ? 'var(--green)' : 'var(--muted)',
    fontWeight: isActive(path) ? 500 : 400,
    textDecoration: 'none'
  })

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(250,248,243,0.96)',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {!user && <Link to="/how-it-works" style={linkStyle('/how-it-works')}>How it works</Link>}
        <Link to="/search" style={linkStyle('/search')}>Search</Link>
        <Link to="/leaderboard" style={linkStyle('/leaderboard')}>Leaderboard</Link>

        {user ? (
          <>
            <Link to="/vouch" style={linkStyle('/vouch')}>Vouch</Link>

            {/* Notification bell */}
            <Link to="/notifications" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isActive('/notifications') ? 'var(--green)' : 'var(--muted)'} strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--amber)', color: 'white',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>

            {/* Avatar */}
            <Link to="/dashboard">
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--green)', border: '2px solid var(--green-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer'
              }}>
                {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>

            <button onClick={handleSignOut} className="btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login"><button className="btn-secondary" style={{ padding: '8px 18px' }}>Login</button></Link>
            <Link to="/signup"><button className="btn-primary" style={{ padding: '8px 18px' }}>Join free</button></Link>
          </>
        )}
      </div>
    </nav>
  )
}
