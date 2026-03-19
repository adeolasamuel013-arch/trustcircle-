import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Vouch from './pages/Vouch'
import Search from './pages/Search'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import Notifications from './pages/Notifications'
import EditProfile from './pages/EditProfile'
import HowItWorks from './pages/HowItWorks'
import './index.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loader"><div className="spin" style={{ width: 32, height: 32 }} /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/search" element={<Search />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/vouch" element={<ProtectedRoute><Vouch /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="*" element={
            <div className="page" style={{ textAlign: 'center', paddingTop: '5rem' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, color: 'var(--green)', marginBottom: '1rem' }}>Page not found</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>The page you are looking for does not exist.</p>
              <a href="/"><button className="btn btn-green">Go home</button></a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
