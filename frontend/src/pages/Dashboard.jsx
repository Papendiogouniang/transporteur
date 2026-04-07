import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { commandesService, rendezvousService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Package, Calendar, Plus, Eye, Search, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUT_LABELS = {
  en_attente: { label: 'En attente', cls: 'status-en_attente' },
  accepte:    { label: 'Acceptée',   cls: 'status-accepte' },
  en_cours:   { label: 'En cours',   cls: 'status-en_cours' },
  livre:      { label: 'Livré',      cls: 'status-livre' },
  annule:     { label: 'Annulée',    cls: 'status-annule' },
  refuse:     { label: 'Refusée',    cls: 'status-refuse' },
}

const TABS = [
  { key: 'commandes', label: 'Mes commandes', icon: <Package size={16} /> },
  { key: 'rendezvous', label: 'Rendez-vous', icon: <Calendar size={16} /> },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('commandes')
  const [commandes, setCommandes] = useState([])
  const [rendezvous, setRendezvous] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatut, setFilterStatut] = useState('')
  const [cancelModal, setCancelModal] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      commandesService.getAll(),
      rendezvousService.getAll(),
    ]).then(([c, r]) => {
      setCommandes(c.data.commandes)
      setRendezvous(r.data.rendezvous)
    }).finally(() => setLoading(false))
  }, [])

  const cancelCommande = async (id) => {
    try {
      await commandesService.updateStatut(id, { statut: 'annule' })
      setCommandes(prev => prev.map(c => c._id === id ? { ...c, statut: 'annule' } : c))
      toast.success('Commande annulée.')
      setCancelModal(null)
    } catch {
      toast.error('Impossible d\'annuler.')
    }
  }

  const filteredCommandes = filterStatut ? commandes.filter(c => c.statut === filterStatut) : commandes

  const stats = {
    total: commandes.length,
    enCours: commandes.filter(c => c.statut === 'en_cours').length,
    livrees: commandes.filter(c => c.statut === 'livre').length,
    enAttente: commandes.filter(c => c.statut === 'en_attente').length,
  }

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <div className="page" style={{ paddingTop: '88px', paddingBottom: '64px' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Bonjour, {user?.prenom} 👋</h1>
            <p>Gérez vos commandes de transport</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/tracking" className="btn btn-secondary"><Search size={16} /> Suivre un colis</Link>
            <Link to="/transporteurs" className="btn btn-primary"><Plus size={16} /> Nouvelle commande</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-bar mb-32">
          <div className="stat-item">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total commandes</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: 'var(--amber)' }}>{stats.enAttente}</div>
            <div className="stat-label">En attente</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#9B59B6' }}>{stats.enCours}</div>
            <div className="stat-label">En livraison</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.livrees}</div>
            <div className="stat-label">Livrées</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
                color: tab === t.key ? 'var(--amber)' : 'var(--text-2)',
                borderBottom: tab === t.key ? '2px solid var(--amber)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s', marginBottom: '-1px',
              }}>
              {t.icon} {t.label}
              {t.key === 'commandes' && commandes.length > 0 && (
                <span className="badge badge-amber" style={{ padding: '1px 8px', fontSize: '11px' }}>{commandes.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab commandes ── */}
        {tab === 'commandes' && (
          <div>
            {/* Filtre statut */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['', 'en_attente', 'accepte', 'en_cours', 'livre', 'annule'].map(s => (
                <button key={s} onClick={() => setFilterStatut(s)}
                  className={`btn btn-sm ${filterStatut === s ? 'btn-primary' : 'btn-ghost'}`}>
                  {s ? STATUT_LABELS[s]?.label : 'Toutes'}
                </button>
              ))}
            </div>

            {filteredCommandes.length === 0 ? (
              <div className="empty-state card">
                <div className="empty-icon">📦</div>
                <div className="empty-title">Aucune commande</div>
                <div className="empty-desc">Commencez par trouver un transporteur</div>
                <Link to="/transporteurs" className="btn btn-primary mt-16">
                  <Plus size={16} /> Trouver un transporteur
                </Link>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Transporteur</th>
                      <th>Trajet</th>
                      <th>Prix</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCommandes.map(c => {
                      const s = STATUT_LABELS[c.statut]
                      return (
                        <tr key={c._id}>
                          <td>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--amber)' }}>
                              {c.numero}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
                              {c.transporteur?.nomEntreprise || '—'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px' }}>
                              <span style={{ color: 'var(--green)' }}>{c.villeDepart}</span>
                              {' → '}
                              <span style={{ color: 'var(--amber)' }}>{c.villeDestination}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{c.prixPropose?.toLocaleString()} F</span>
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td>
                            <span className={`badge ${s.cls}`}>{s.label}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <Link to={`/tracking/${c.numero}`} className="btn btn-ghost btn-sm">
                                <Eye size={13} />
                              </Link>
                              {c.statut === 'en_attente' && (
                                <button className="btn btn-danger btn-sm" onClick={() => setCancelModal(c._id)}>
                                  <XCircle size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab rendez-vous ── */}
        {tab === 'rendezvous' && (
          <div>
            {rendezvous.length === 0 ? (
              <div className="empty-state card">
                <div className="empty-icon">📅</div>
                <div className="empty-title">Aucun rendez-vous</div>
                <div className="empty-desc">Les rendez-vous seront créés lors de vos commandes</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rendezvous.map(r => (
                  <div key={r._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {r.type === 'prise_en_charge' ? '📦 Prise en charge' : r.type === 'livraison' ? '🚛 Livraison' : '🔍 Inspection'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '2px' }}>
                        {r.commande?.numero} • {r.lieu}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                        {new Date(r.dateRdv).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                        🚛 {r.transporteur?.nomEntreprise}
                      </div>
                      <span className={`badge ${r.statut === 'confirme' ? 'badge-green' : r.statut === 'annule' ? 'badge-red' : 'badge-amber'}`}>
                        {r.statut}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal annulation */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '12px' }}>Annuler la commande ?</h3>
            <p style={{ marginBottom: '24px' }}>Cette action est irréversible. La commande sera marquée comme annulée.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setCancelModal(null)}>Retour</button>
              <button className="btn btn-danger" onClick={() => cancelCommande(cancelModal)}>Confirmer l'annulation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
