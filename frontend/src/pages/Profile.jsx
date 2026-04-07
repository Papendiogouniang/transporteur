import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api, { authService, transporteursService } from '../services/api'
import { User, Truck, Lock, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ZONES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour', 'Louga', 'Tambacounda', 'Matam', 'Fatick', 'Diourbel', 'Kédougou', 'Sédhiou', 'Kolda']

export default function Profile() {
  const { user, transporteurProfile, updateUser, loadUser } = useAuth()

  const [tab, setTab] = useState('profil')
  const [saving, setSaving] = useState(false)

  const [userForm, setUserForm] = useState({
    nom: user?.nom || '', prenom: user?.prenom || '',
    telephone: user?.telephone || '', adresse: user?.adresse || '',
  })

  const [pwdForm, setPwdForm] = useState({ ancienPassword: '', nouveauPassword: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')

  const [tForm, setTForm] = useState({
    nomEntreprise: transporteurProfile?.nomEntreprise || '',
    description: transporteurProfile?.description || '',
    typeTransport: transporteurProfile?.typeTransport || 'camionnette',
    capaciteKg: transporteurProfile?.capaciteKg || '',
    prixParKm: transporteurProfile?.prixParKm || '',
    prixFixe: transporteurProfile?.prixFixe || '',
    disponible: transporteurProfile?.disponible ?? true,
    zonesCouvertes: transporteurProfile?.zonesCouvertes || [],
  })

  const toggleZone = (z) => setTForm(f => ({
    ...f,
    zonesCouvertes: f.zonesCouvertes.includes(z) ? f.zonesCouvertes.filter(x => x !== z) : [...f.zonesCouvertes, z]
  }))

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await authService.updateProfile(userForm)
      updateUser(data.user)
      toast.success('Profil mis à jour !')
    } catch {
      toast.error('Erreur lors de la mise à jour.')
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setPwdError('')
    if (pwdForm.nouveauPassword !== pwdForm.confirm)
      return setPwdError('Les mots de passe ne correspondent pas.')
    setSaving(true)
    try {
      await api.put('/auth/password', { ancienPassword: pwdForm.ancienPassword, nouveauPassword: pwdForm.nouveauPassword })
      toast.success('Mot de passe modifié !')
      setPwdForm({ ancienPassword: '', nouveauPassword: '', confirm: '' })
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  const saveTransporteur = async (e) => {
    e.preventDefault()
    if (!transporteurProfile?._id) return
    setSaving(true)
    try {
      await transporteursService.update(transporteurProfile._id, {
        ...tForm,
        capaciteKg: Number(tForm.capaciteKg),
        prixParKm: Number(tForm.prixParKm),
        prixFixe: Number(tForm.prixFixe),
      })
      await loadUser()
      toast.success('Profil transporteur mis à jour !')
    } catch {
      toast.error('Erreur lors de la mise à jour.')
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { key: 'profil', label: 'Informations', icon: <User size={16} /> },
    ...(user?.role === 'transporteur' ? [{ key: 'transporteur', label: 'Profil transporteur', icon: <Truck size={16} /> }] : []),
    { key: 'securite', label: 'Sécurité', icon: <Lock size={16} /> },
  ]

  return (
    <div className="page" style={{ paddingTop: '88px', paddingBottom: '64px' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ marginBottom: '4px' }}>Mon profil</h1>
          <p>Gérez vos informations personnelles et la sécurité de votre compte</p>
        </div>

        {/* Avatar card */}
        <div className="card mb-24">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'var(--amber)', color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, flexShrink: 0,
            }}>
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{user?.prenom} {user?.nom}</h3>
              <p style={{ margin: '4px 0 8px', fontSize: '14px' }}>{user?.email}</p>
              <span className={`badge ${user?.role === 'transporteur' ? 'badge-amber' : user?.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
                color: tab === t.key ? 'var(--amber)' : 'var(--text-2)',
                borderBottom: tab === t.key ? '2px solid var(--amber)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '-1px',
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab profil ── */}
        {tab === 'profil' && (
          <div className="card slide-up">
            <h4 style={{ marginBottom: '24px' }}>Informations personnelles</h4>
            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input className="form-control" value={userForm.prenom} onChange={e => setUserForm({ ...userForm, prenom: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input className="form-control" value={userForm.nom} onChange={e => setUserForm({ ...userForm, nom: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" value={user?.email} disabled style={{ opacity: 0.5 }} />
                <span className="form-hint">L'email ne peut pas être modifié</span>
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-control" placeholder="+221 77 000 00 00" value={userForm.telephone} onChange={e => setUserForm({ ...userForm, telephone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Adresse</label>
                <input className="form-control" placeholder="Quartier, Ville" value={userForm.adresse} onChange={e => setUserForm({ ...userForm, adresse: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Sauvegarde...' : <><Save size={16} /> Sauvegarder</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Tab transporteur ── */}
        {tab === 'transporteur' && transporteurProfile && (
          <div className="card slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h4 style={{ margin: 0 }}>Profil transporteur</h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="checkbox" checked={tForm.disponible} onChange={e => setTForm({ ...tForm, disponible: e.target.checked })} />
                <span style={{ color: tForm.disponible ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                  {tForm.disponible ? '● Disponible' : '● Indisponible'}
                </span>
              </label>
            </div>
            <form onSubmit={saveTransporteur} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nom de l'entreprise</label>
                <input className="form-control" value={tForm.nomEntreprise} onChange={e => setTForm({ ...tForm, nomEntreprise: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={tForm.description} onChange={e => setTForm({ ...tForm, description: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Type de transport</label>
                  <select className="form-control" value={tForm.typeTransport} onChange={e => setTForm({ ...tForm, typeTransport: e.target.value })}>
                    {['camion', 'camionnette', 'moto', 'voiture', 'bateau'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Capacité (kg)</label>
                  <input type="number" className="form-control" value={tForm.capaciteKg} onChange={e => setTForm({ ...tForm, capaciteKg: e.target.value })} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Prix/km (FCFA)</label>
                  <input type="number" className="form-control" value={tForm.prixParKm} onChange={e => setTForm({ ...tForm, prixParKm: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Frais fixes (FCFA)</label>
                  <input type="number" className="form-control" value={tForm.prixFixe} onChange={e => setTForm({ ...tForm, prixFixe: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Zones couvertes</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {ZONES.map(z => (
                    <button key={z} type="button" onClick={() => toggleZone(z)}
                      className="btn btn-sm"
                      style={{
                        background: tForm.zonesCouvertes.includes(z) ? 'var(--amber)' : 'var(--surface)',
                        color: tForm.zonesCouvertes.includes(z) ? '#000' : 'var(--text-2)',
                        border: `1px solid ${tForm.zonesCouvertes.includes(z) ? 'var(--amber)' : 'var(--border)'}`,
                      }}>
                      {z}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Sauvegarde...' : <><Save size={16} /> Sauvegarder</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Tab sécurité ── */}
        {tab === 'securite' && (
          <div className="card slide-up">
            <h4 style={{ marginBottom: '24px' }}>Changer le mot de passe</h4>
            {pwdError && <div className="alert alert-error mb-16">{pwdError}</div>}
            <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Mot de passe actuel</label>
                <input type="password" className="form-control" required value={pwdForm.ancienPassword} onChange={e => setPwdForm({ ...pwdForm, ancienPassword: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Nouveau mot de passe</label>
                <input type="password" className="form-control" required minLength={6} value={pwdForm.nouveauPassword} onChange={e => setPwdForm({ ...pwdForm, nouveauPassword: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmer le nouveau mot de passe</label>
                <input type="password" className="form-control" required value={pwdForm.confirm} onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Modification...' : <><Lock size={16} /> Modifier le mot de passe</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
