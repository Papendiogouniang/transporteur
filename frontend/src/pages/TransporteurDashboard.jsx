import { useState, useEffect } from 'react'
import { commandesService, transporteursService, rendezvousService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { CheckCircle, XCircle, Truck, Package, Calendar, TrendingUp, Plus, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUT_LABELS = {
  en_attente: { label: 'En attente', cls: 'status-en_attente' },
  accepte:    { label: 'Acceptée',   cls: 'status-accepte' },
  en_cours:   { label: 'En cours',   cls: 'status-en_cours' },
  livre:      { label: 'Livré ✓',    cls: 'status-livre' },
  annule:     { label: 'Annulée',    cls: 'status-annule' },
  refuse:     { label: 'Refusée',    cls: 'status-refuse' },
}

const TABS = [
  { key: 'commandes', label: 'Commandes', icon: <Package size={16} /> },
  { key: 'rendezvous', label: 'Rendez-vous', icon: <Calendar size={16} /> },
  { key: 'stats', label: 'Statistiques', icon: <TrendingUp size={16} /> },
]

export default function TransporteurDashboard() {
  const { user, transporteurProfile } = useAuth()
  const [tab, setTab] = useState('commandes')
  const [commandes, setCommandes] = useState([])
  const [rendezvous, setRendezvous] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterStatut, setFilterStatut] = useState('')
  const [rdvModal, setRdvModal] = useState(null)
  const [rdvForm, setRdvForm] = useState({ dateRdv: '', lieu: '', type: 'prise_en_charge', notes: '' })
  const [actionLoading, setActionLoading] = useState(null)

  const tId = transporteurProfile?._id

  useEffect(() => {
    if (!tId) return
    setLoading(true)
    Promise.all([
      commandesService.getAll(),
      rendezvousService.getAll(),
      transporteursService.getStats(tId),
    ]).then(([c, r, s]) => {
      setCommandes(c.data.commandes)
      setRendezvous(r.data.rendezvous)
      setStats(s.data.stats)
    }).catch(console.error).finally(() => setLoading(false))
  }, [tId])

  const updateStatut = async (id, statut, label) => {
    setActionLoading(id + statut)
    try {
      await commandesService.updateStatut(id, { statut })
      setCommandes(prev => prev.map(c => c._id === id ? { ...c, statut } : c))
      toast.success(`Commande ${label}.`)
    } catch {
      toast.error('Erreur lors de la mise à jour.')
    } finally {
      setActionLoading(null)
    }
  }

  const createRdv = async (e) => {
    e.preventDefault()
    try {
      await rendezvousService.create({ commandeId: rdvModal, ...rdvForm })
      toast.success('Rendez-vous créé !')
      const { data } = await rendezvousService.getAll()
      setRendezvous(data.rendezvous)
      setRdvModal(null)
    } catch {
      toast.error('Erreur création rendez-vous.')
    }
  }

  const filteredCommandes = filterStatut ? commandes.filter(c => c.statut === filterStatut) : commandes

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <div className="page" style={{ paddingTop: '88px', paddingBottom: '64px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ marginBottom: '4px' }}>Dashboard Transporteur</h1>
            <p>
              <span style={{ color: 'var(--amber)', fontWeight: 600 }}>
                🚛 {transporteurProfile?.nomEntreprise}
              </span>
              {transporteurProfile?.verified && <span className="verified-badge" style={{ marginLeft: '8px' }}><CheckCircle size={10} /> Vérifié</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`badge ${transporteurProfile?.disponible ? 'badge-green' : 'badge-red'}`}>
              {transporteurProfile?.disponible ? '● Disponible' : '● Indisponible'}
            </span>
          </div>
        </div>

        {/* Stats rapides */}
        {stats && (
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
              <div className="stat-label">En cours</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.livrees}</div>
              <div className="stat-label">Livrées</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: 'var(--green)', fontSize: '1.2rem' }}>
                {stats.revenus?.toLocaleString()} F
              </div>
              <div className="stat-label">Revenus</div>
            </div>
          </div>
        )}

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

        {/* ── Tab commandes ── */}
        {tab === 'commandes' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['', 'en_attente', 'accepte', 'en_cours', 'livre', 'refuse'].map(s => (
                <button key={s} onClick={() => setFilterStatut(s)}
                  className={`btn btn-sm ${filterStatut === s ? 'btn-primary' : 'btn-ghost'}`}>
                  {s ? STATUT_LABELS[s]?.label : 'Toutes'}
                  {s === 'en_attente' && commandes.filter(c => c.statut === 'en_attente').length > 0 && (
                    <span className="badge badge-amber" style={{ marginLeft: '4px', padding: '1px 6px', fontSize: '10px' }}>
                      {commandes.filter(c => c.statut === 'en_attente').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {filteredCommandes.length === 0 ? (
              <div className="empty-state card">
                <div className="empty-icon">📭</div>
                <div className="empty-title">Aucune commande</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredCommandes.map(c => {
                  const s = STATUT_LABELS[c.statut]
                  return (
                    <div key={c._id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--amber)' }}>{c.numero}</span>
                            <span className={`badge ${s.cls}`}>{s.label}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                              {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text)' }}>{c.description}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-2)' }}>
                            <span>
                              👤 {c.client?.prenom} {c.client?.nom} • {c.client?.telephone}
                            </span>
                            <span>📍 {c.villeDepart} → {c.villeDestination}</span>
                            {c.poidsKg && <span>⚖️ {c.poidsKg} kg</span>}
                            <span style={{ color: 'var(--amber)', fontWeight: 700 }}>
                              💰 {c.prixPropose?.toLocaleString()} FCFA
                            </span>
                          </div>
                          {c.notesClient && (
                            <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--surface)', borderRadius: '6px', fontSize: '13px', color: 'var(--text-2)' }}>
                              📝 {c.notesClient}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {c.statut === 'en_attente' && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                disabled={actionLoading === c._id + 'accepte'}
                                onClick={() => updateStatut(c._id, 'accepte', 'acceptée')}
                              >
                                <CheckCircle size={14} /> Accepter
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={actionLoading === c._id + 'refuse'}
                                onClick={() => updateStatut(c._id, 'refuse', 'refusée')}
                              >
                                <XCircle size={14} /> Refuser
                              </button>
                            </>
                          )}
                          {c.statut === 'accepte' && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => updateStatut(c._id, 'en_cours', 'en cours')}
                              >
                                <Truck size={14} /> Démarrer
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setRdvModal(c._id)}
                              >
                                <Plus size={14} /> Rendez-vous
                              </button>
                            </>
                          )}
                          {c.statut === 'en_cours' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => updateStatut(c._id, 'livre', 'livrée')}
                            >
                              <CheckCircle size={14} /> Marquer livré
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
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
                <div className="empty-title">Aucun rendez-vous planifié</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rendezvous.map(r => (
                  <div key={r._id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: '6px' }}>
                          {r.type === 'prise_en_charge' ? '📦 Prise en charge' : '🚛 Livraison'}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '2px' }}>
                          <strong>Client :</strong> {r.client?.prenom} {r.client?.nom} • {r.client?.telephone}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '2px' }}>
                          <strong>Lieu :</strong> {r.lieu}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--amber)' }}>
                          🕐 {new Date(r.dateRdv).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`badge ${r.statut === 'confirme' ? 'badge-green' : r.statut === 'annule' ? 'badge-red' : 'badge-amber'}`}>
                          {r.statut}
                        </span>
                        {r.statut === 'planifie' && (
                          <button className="btn btn-success btn-sm"
                            onClick={async () => {
                              await rendezvousService.updateStatut(r._id, { statut: 'confirme' })
                              setRendezvous(prev => prev.map(x => x._id === r._id ? { ...x, statut: 'confirme' } : x))
                              toast.success('Rendez-vous confirmé.')
                            }}>
                            <CheckCircle size={13} /> Confirmer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab stats ── */}
        {tab === 'stats' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { label: 'Commandes total', value: stats.total, color: 'var(--text)', icon: '📦' },
              { label: 'Livrées', value: stats.livrees, color: 'var(--green)', icon: '✅' },
              { label: 'En cours', value: stats.enCours, color: '#9B59B6', icon: '🚛' },
              { label: 'En attente', value: stats.enAttente, color: 'var(--amber)', icon: '⏳' },
              { label: 'Annulées', value: stats.annulees, color: 'var(--red)', icon: '❌' },
              { label: 'Revenus totaux', value: `${stats.revenus?.toLocaleString() || 0} FCFA`, color: 'var(--green)', icon: '💰' },
              { label: 'Note moyenne', value: `${transporteurProfile?.noteMoyenne?.toFixed(1) || '—'} ★`, color: 'var(--amber)', icon: '⭐' },
              { label: 'Nombre d\'avis', value: transporteurProfile?.nombreAvis || 0, color: 'var(--blue)', icon: '💬' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: s.color, marginBottom: '6px' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal rendez-vous */}
      {rdvModal && (
        <div className="modal-overlay" onClick={() => setRdvModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Planifier un rendez-vous</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setRdvModal(null)}>✕</button>
            </div>
            <form onSubmit={createRdv} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={rdvForm.type} onChange={e => setRdvForm({ ...rdvForm, type: e.target.value })}>
                  <option value="prise_en_charge">📦 Prise en charge</option>
                  <option value="livraison">🚛 Livraison</option>
                  <option value="inspection">🔍 Inspection</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date et heure *</label>
                <input type="datetime-local" className="form-control" required
                  value={rdvForm.dateRdv} onChange={e => setRdvForm({ ...rdvForm, dateRdv: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Lieu *</label>
                <input className="form-control" placeholder="Adresse du rendez-vous" required
                  value={rdvForm.lieu} onChange={e => setRdvForm({ ...rdvForm, lieu: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-control" placeholder="Instructions..." rows={2}
                  value={rdvForm.notes} onChange={e => setRdvForm({ ...rdvForm, notes: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setRdvModal(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary"><Plus size={16} /> Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
