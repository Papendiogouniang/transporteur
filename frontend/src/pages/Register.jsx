import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Truck, User, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const ZONES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour', 'Louga', 'Tambacounda', 'Matam', 'Fatick', 'Diourbel', 'Kédougou', 'Sédhiou', 'Kolda']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [zonesSelected, setZonesSelected] = useState([])

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', password: '', telephone: '', adresse: '',
    nomEntreprise: '', description: '', typeTransport: 'camionnette',
    capaciteKg: '', prixParKm: '', prixFixe: '',
  })

  const toggleZone = (z) => setZonesSelected(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        nom: form.nom, prenom: form.prenom, email: form.email,
        password: form.password, telephone: form.telephone,
        adresse: form.adresse, role,
      }
      if (role === 'transporteur') {
        payload.transporteurData = {
          nomEntreprise: form.nomEntreprise,
          description: form.description,
          typeTransport: form.typeTransport,
          capaciteKg: Number(form.capaciteKg),
          zonesCouvertes: zonesSelected,
          prixParKm: Number(form.prixParKm),
          prixFixe: Number(form.prixFixe),
        }
      }
      const data = await register(payload)
      toast.success('Compte créé avec succès !')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.')
    } finally {
      setLoading(false)
    }
  }

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })

  return (
    <div className="page" style={{ padding: '96px 24px 64px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Truck size={28} color="var(--amber)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800 }}>
              GP<span style={{ color: 'var(--amber)' }}>Transporteurs</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Créer un compte gratuit</p>
        </div>

        {/* STEP 1 — Choix du rôle */}
        {step === 1 && (
          <div className="card slide-up">
            <h3 style={{ marginBottom: '8px' }}>Vous êtes…</h3>
            <p style={{ marginBottom: '28px', fontSize: '14px' }}>Choisissez votre type de compte</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { value: 'client', icon: <User size={32} />, title: 'Client', desc: 'J\'envoie des colis et recherche des transporteurs' },
                { value: 'transporteur', icon: <Truck size={32} />, title: 'Transporteur', desc: 'Je propose des services de transport' },
              ].map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  style={{
                    padding: '24px 16px', borderRadius: '12px', border: `2px solid ${role === r.value ? 'var(--amber)' : 'var(--border)'}`,
                    background: role === r.value ? 'var(--amber-glow)' : 'var(--surface)',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ color: role === r.value ? 'var(--amber)' : 'var(--text-2)', marginBottom: '12px' }}>{r.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>{r.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.5' }}>{r.desc}</div>
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary btn-block btn-lg mt-24"
              disabled={!role}
              onClick={() => setStep(2)}
            >
              Continuer <span>→</span>
            </button>
          </div>
        )}

        {/* STEP 2 — Infos personnelles */}
        {step === 2 && (
          <div className="card slide-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm">←</button>
              <div>
                <h3 style={{ margin: 0 }}>Informations personnelles</h3>
                <p style={{ fontSize: '13px', margin: '2px 0 0' }}>
                  Compte {role === 'transporteur' ? 'transporteur' : 'client'}
                </p>
              </div>
            </div>
            {error && <div className="alert alert-error mb-16">{error}</div>}
            <form onSubmit={role === 'transporteur' ? (e) => { e.preventDefault(); setStep(3) } : handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <input className="form-control" placeholder="Moussa" required {...f('prenom')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input className="form-control" placeholder="Diallo" required {...f('nom')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" placeholder="votre@email.com" required {...f('email')} />
              </div>
              <div className="form-group">
                <label className="form-label">Mot de passe *</label>
                <input type="password" className="form-control" placeholder="Min. 6 caractères" minLength={6} required {...f('password')} />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-control" placeholder="+221 77 000 00 00" {...f('telephone')} />
              </div>
              <div className="form-group">
                <label className="form-label">Adresse</label>
                <input className="form-control" placeholder="Quartier, Ville" {...f('adresse')} />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {role === 'transporteur' ? 'Continuer →' : loading ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3 — Infos transporteur */}
        {step === 3 && role === 'transporteur' && (
          <div className="card slide-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <button onClick={() => setStep(2)} className="btn btn-ghost btn-sm">←</button>
              <div>
                <h3 style={{ margin: 0 }}>Profil transporteur</h3>
                <p style={{ fontSize: '13px', margin: '2px 0 0' }}>Informations sur votre activité</p>
              </div>
            </div>
            {error && <div className="alert alert-error mb-16">{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nom de l'entreprise *</label>
                <input className="form-control" placeholder="ex: Sall Express Transport" required {...f('nomEntreprise')} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" placeholder="Décrivez votre service..." rows={3} {...f('description')} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Type de transport *</label>
                  <select className="form-control" required {...f('typeTransport')}>
                    <option value="camion">🚛 Camion</option>
                    <option value="camionnette">🚐 Camionnette</option>
                    <option value="moto">🏍️ Moto</option>
                    <option value="voiture">🚗 Voiture</option>
                    <option value="bateau">⛵ Bateau</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Capacité (kg)</label>
                  <input type="number" className="form-control" placeholder="ex: 1500" {...f('capaciteKg')} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Prix/km (FCFA)</label>
                  <input type="number" className="form-control" placeholder="ex: 200" {...f('prixParKm')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Frais fixes (FCFA)</label>
                  <input type="number" className="form-control" placeholder="ex: 3000" {...f('prixFixe')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Zones couvertes</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {ZONES.map(z => (
                    <button
                      key={z} type="button"
                      onClick={() => toggleZone(z)}
                      className="btn btn-sm"
                      style={{
                        background: zonesSelected.includes(z) ? 'var(--amber)' : 'var(--surface)',
                        color: zonesSelected.includes(z) ? '#000' : 'var(--text-2)',
                        border: `1px solid ${zonesSelected.includes(z) ? 'var(--amber)' : 'var(--border)'}`,
                      }}
                    >{z}</button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? 'Création du compte...' : <><UserCheck size={18} /> Créer mon compte</>}
              </button>
            </form>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-2)' }}>
          Déjà un compte ? <Link to="/login" style={{ color: 'var(--amber)', fontWeight: 600 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
