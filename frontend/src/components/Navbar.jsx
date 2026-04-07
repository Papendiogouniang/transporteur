import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Truck, User, LayoutDashboard, LogOut, ChevronDown, Search, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Déconnexion réussie')
    navigate('/')
    setDropdownOpen(false)
  }

  const initials = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : ''

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
          <Truck size={22} color="var(--amber)" />
          GP<span>Transporteurs</span>
        </Link>

        {/* Nav links - desktop */}
        <div className="navbar-nav">
          <NavLink to="/transporteurs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Transporteurs
          </NavLink>
          <NavLink to="/tracking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Suivi colis
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <div
                className="user-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', padding: '6px 12px', borderRadius: '8px', fontSize: '13px' }}
              >
                {initials}
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, color: '#000' }}>
                  {user.prenom}
                </span>
                <ChevronDown size={14} style={{ color: '#000' }} />
              </div>
              {dropdownOpen && (
                <div className="dropdown">
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{user.prenom} {user.nom}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{user.email}</div>
                    <div className="badge badge-amber mt-8" style={{ fontSize: '10px' }}>{user.role}</div>
                  </div>
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> Mon profil
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={16} /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Se connecter</Link>
              <Link to="/register" className="btn btn-primary btn-sm">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
