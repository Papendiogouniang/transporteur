import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Truck, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form)
      toast.success(`Bienvenue, ${data.user.prenom} !`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (email) => setForm({ email, password: 'password123' })

  return (
    <div className="page flex-center" style={{ minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '440px', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Truck size={28} color="var(--amber)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
              GP<span style={{ color: 'var(--amber)' }}>Transporteurs</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Connectez-vous à votre compte</p>
        </div>

        <div className="card slide-up">
          {error && <div className="alert alert-error mb-16">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" className="form-control"
                placeholder="votre@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: '44px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Connexion...</> : <><LogIn size={18} /> Se connecter</>}
            </button>
          </form>

          <div className="divider" />

          {/* Comptes démo */}
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '10px', textAlign: 'center' }}>COMPTES DE DÉMONSTRATION</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: '👤 Client', email: 'moussa.diallo@gmail.com' },
                { label: '🚛 Transporteur', email: 'ibrahima.sall@transport.sn' },
                { label: '🔧 Admin', email: 'admin@gp-transport.sn' },
              ].map(d => (
                <button key={d.email} className="btn btn-ghost btn-sm" onClick={() => fillDemo(d.email)}>
                  {d.label} <span style={{ color: 'var(--text-3)', fontSize: '11px' }}>{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-2)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--amber)', fontWeight: 600 }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}
