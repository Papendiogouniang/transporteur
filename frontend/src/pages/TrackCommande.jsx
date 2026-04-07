import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { commandesService } from '../services/api'
import { Search, Package, MapPin, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

const STATUT_CONFIG = {
  en_attente: { label: 'En attente', icon: <Clock size={16} />, color: 'var(--amber)', step: 0 },
  accepte:    { label: 'Acceptée',   icon: <CheckCircle size={16} />, color: 'var(--blue)', step: 1 },
  en_cours:   { label: 'En cours',   icon: <Truck size={16} />, color: '#9B59B6', step: 2 },
  livre:      { label: 'Livré ✓',    icon: <CheckCircle size={16} />, color: 'var(--green)', step: 3 },
  annule:     { label: 'Annulée',    icon: <XCircle size={16} />, color: 'var(--red)', step: -1 },
  refuse:     { label: 'Refusée',    icon: <XCircle size={16} />, color: 'var(--red)', step: -1 },
}

const STEPS = [
  { key: 'en_attente', label: 'Commande créée',     icon: <Package size={16} /> },
  { key: 'accepte',    label: 'Acceptée',            icon: <CheckCircle size={16} /> },
  { key: 'en_cours',   label: 'En livraison',        icon: <Truck size={16} /> },
  { key: 'livre',      label: 'Livré',               icon: <CheckCircle size={16} /> },
]

export default function TrackCommande() {
  const { numero: paramNumero } = useParams()
  const navigate = useNavigate()
  const [numero, setNumero] = useState(paramNumero || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async (num) => {
    const n = (num || numero).trim().toUpperCase()
    if (!n) return setError('Entrez un numéro de commande.')
    setError(''); setResult(null); setLoading(true)
    try {
      const { data } = await commandesService.getByNumero(n)
      setResult(data)
      if (num) navigate(`/tracking/${n}`, { replace: true })
    } catch {
      setError('Aucune commande trouvée avec ce numéro.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (paramNumero) search(paramNumero) }, [paramNumero])

  const handleSubmit = (e) => { e.preventDefault(); search() }

  const commande = result?.commande
  const suivi = result?.commande?.suivi || []
  const cfg = commande ? STATUT_CONFIG[commande.statut] : null
  const currentStep = cfg?.step ?? 0
  const isAnnule = commande?.statut === 'annule' || commande?.statut === 'refuse'

  return (
    <div className="page" style={{ paddingTop: '88px', paddingBottom: '64px' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ marginBottom: '12px' }}>Suivi de livraison</h1>
          <p>Entrez votre numéro de commande pour suivre votre colis en temps réel.</p>
        </div>

        {/* Search bar */}
        <div className="card mb-32">
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
            <input
              className="form-control"
              placeholder="ex: GP2025001"
              value={numero}
              onChange={e => setNumero(e.target.value.toUpperCase())}
              style={{ flex: 1, fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.05em' }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <><Search size={18} /> Suivre</>}
            </button>
          </form>
          {error && <div className="alert alert-error mt-16">{error}</div>}
        </div>

        {/* Résultat */}
        {commande && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="fade-in">

            {/* Header statut */}
            <div className="card" style={{ borderColor: cfg?.color, background: `${cfg?.color}10` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Commande</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>{commande.numero}</div>
                </div>
                <span className="badge" style={{ background: `${cfg?.color}20`, color: cfg?.color, border: `1px solid ${cfg?.color}50`, fontSize: '14px', padding: '6px 14px' }}>
                  {cfg?.icon} {cfg?.label}
                </span>
              </div>
            </div>

            {/* Progression — seulement si pas annulé */}
            {!isAnnule && (
              <div className="card">
                <h4 style={{ marginBottom: '24px' }}>Progression</h4>
                <div className="steps">
                  {STEPS.map((step, i) => {
                    const done = currentStep > i
                    const active = currentStep === i
                    return (
                      <div key={step.key} className={`step-item ${done ? 'done' : active ? 'active' : ''}`}>
                        <div className="step-num">
                          {done ? <CheckCircle size={18} /> : step.icon}
                        </div>
                        <div className="step-label">{step.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Infos commande */}
            <div className="card">
              <h4 style={{ marginBottom: '16px' }}>Détails</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Description', value: commande.description },
                  { label: 'Poids', value: commande.poidsKg ? `${commande.poidsKg} kg` : '—' },
                  { label: 'Départ', value: `${commande.adresseDepart}, ${commande.villeDepart}` },
                  { label: 'Destination', value: `${commande.adresseDestination}, ${commande.villeDestination}` },
                  { label: 'Prix', value: `${commande.prixPropose?.toLocaleString()} FCFA` },
                  { label: 'Date commande', value: new Date(commande.createdAt).toLocaleDateString('fr-FR') },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '12px', background: 'var(--surface)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transporteur */}
            <div className="card">
              <h4 style={{ marginBottom: '12px' }}>Transporteur</h4>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                  🚛
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{commande.transporteur?.nomEntreprise}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                    {commande.transporteur?.user?.nom} {commande.transporteur?.user?.prenom} • {commande.transporteur?.user?.telephone}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline suivi */}
            <div className="card">
              <h4 style={{ marginBottom: '20px' }}>Historique du suivi</h4>
              <div className="timeline">
                {suivi.map((s, i) => {
                  const isLast = i === suivi.length - 1
                  const sCfg = STATUT_CONFIG[s.statut]
                  return (
                    <div key={i} className="timeline-item">
                      {!isLast && <div className={`timeline-line ${i < suivi.length - 1 ? 'done' : ''}`} />}
                      <div className={`timeline-dot ${isLast ? 'active' : 'done'}`}>
                        {sCfg?.icon}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-title">{s.description}</div>
                        {s.localisation && (
                          <div style={{ fontSize: '13px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                            <MapPin size={12} /> {s.localisation}
                          </div>
                        )}
                        <div className="timeline-time">{new Date(s.createdAt).toLocaleString('fr-FR')}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Placeholder quand vide */}
        {!commande && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-title">Suivez votre livraison</div>
            <div className="empty-desc">Entrez le numéro de commande reçu par email (format : GP2025XXXXX)</div>
          </div>
        )}
      </div>
    </div>
  )
}
