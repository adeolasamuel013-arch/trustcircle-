import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 32, height: 32 }}></div></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}
