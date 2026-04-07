import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Transporteurs from './pages/Transporteurs'
import TransporteurDetail from './pages/TransporteurDetail'
import CreateCommande from './pages/CreateCommande'
import TrackCommande from './pages/TrackCommande'
import Dashboard from './pages/Dashboard'
import TransporteurDashboard from './pages/TransporteurDashboard'
import Profile from './pages/Profile'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loading"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/transporteurs" element={<Transporteurs />} />
        <Route path="/transporteurs/:id" element={<TransporteurDetail />} />
        <Route path="/tracking" element={<TrackCommande />} />
        <Route path="/tracking/:numero" element={<TrackCommande />} />
        <Route path="/commande/new" element={
          <ProtectedRoute roles={['client']}>
            <CreateCommande />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {user?.role === 'transporteur' ? <TransporteurDashboard /> : <Dashboard />}
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
