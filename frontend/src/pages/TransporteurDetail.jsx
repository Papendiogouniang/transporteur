import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { transporteursService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { MapPin, Phone, Mail, Package, Star, CheckCircle, Truck, Weight, ArrowLeft, Calendar } from 'lucide-react'

const TYPE_ICONS = { camion: '🚛', camionnette: '🚐', moto: '🏍️', voiture: '🚗', bateau: '⛵' }

function Stars({ note, size = 16 }) {
  return (
    <span className="tc-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(note) ? 'var(--amber)' : 'var(--border-2)', fontSize: size }}>★</span>
      ))}
    </span>
  )
}

export default function TransporteurDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [transporteur, setTransporteur] = useState(null)
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    transporteursService.getById(id)
      .then(({ data }) => { 
        setTransporteur(data.transporteur); 
        setAvis(data.transporteur.avis || []) 
      })
      .catch((err) => {
        console.error('Erreur transporteur:', err)
        setError('Transporteur non trouvé ou erreur de chargement')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-loading"><div className="spinner" /></div>
  if (error) return (
    <div className="page" style={{ paddingTop: '88px', paddingBottom: '64px' }}>
      <div className="container">
        <div className="empty-state card">
          <div className="empty-icon">🚛</div>
          <div className="empty-title">Transporteur non trouvé</div>
          <div className="empty-desc">{error}</div>
          <button onClick={() => navigate('/transporteurs')} className="btn btn-primary">
            ← Retour aux transporteurs
          </button>
        </div>
      </div>
    </div>
  )
  if (!transporteur) return null

  const { user: owner } = transporteur

  return (
    <div className="page" style={{ paddingTop: '88px', paddingBottom: '64px' }}>
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-24">
          <ArrowLeft size={16} /> Retour
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px', alignItems: 'start' }}>
          {/* ── Colonne principale ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div className="card">
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '20px',
                  background: 'var(--amber)', color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.2rem', flexShrink: 0
                }}>
                  {TYPE_ICONS[transporteur.typeTransport]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <h2 style={{ margin: 0 }}>{transporteur.nomEntreprise}</h2>
                    {transporteur.verified && (
                      <span className="verified-badge"><CheckCircle size={12} /> Vérifié</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-2)' }}>
                      <Truck size={14} /> {transporteur.typeTransport}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-2)' }}>
                      <Weight size={14} /> Jusqu'à {transporteur.capaciteKg?.toLocaleString()} kg
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-2)' }}>
                      <MapPin size={14} /> {owner?.adresse}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stars note={transporteur.noteMoyenne} />
                    <span style={{ fontWeight: 700, color: 'var(--amber)' }}>{transporteur.noteMoyenne?.toFixed(1)}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>({transporteur.nombreAvis} avis)</span>
                  </div>
                </div>
              </div>
              {transporteur.description && (
                <>
                  <div className="divider" />
                  <p style={{ fontSize: '15px', lineHeight: '1.8' }}>{transporteur.description}</p>
                </>
              )}
            </div>

            {/* Zones couvertes */}
            <div className="card">
              <h4 style={{ marginBottom: '16px' }}><MapPin size={16} style={{ marginRight: '6px', color: 'var(--amber)' }} />Zones couvertes</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {transporteur.zonesCouvertes?.map(z => (
                  <span key={z} className="badge badge-gray">{z}</span>
                ))}
              </div>
            </div>

            {/* Avis */}
            <div className="card">
              <h4 style={{ marginBottom: '20px' }}><Star size={16} style={{ marginRight: '6px', color: 'var(--amber)' }} />Avis clients ({avis.length})</h4>
              {avis.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <div className="empty-icon">⭐</div>
                  <div className="empty-title">Pas encore d'avis</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {avis.map((a, i) => (
                    <div key={i} style={{ padding: '16px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                          {a.client?.prenom} {a.client?.nom?.charAt(0)}.
                        </div>
                        <Stars note={a.note} size={14} />
                      </div>
                      {a.commentaire && <p style={{ fontSize: '14px', margin: 0 }}>{a.commentaire}</p>}
                      <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '8px' }}>
                        {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar commande ── */}
          <div style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tarifs */}
            <div className="card">
              <h4 style={{ marginBottom: '20px' }}>Tarification</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--surface)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>Prix au km</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--amber)' }}>
                    {transporteur.prixParKm?.toLocaleString()} FCFA
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--surface)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>Frais de base</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    {transporteur.prixFixe?.toLocaleString()} FCFA
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--surface)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>Capacité max.</span>
                  <span style={{ fontWeight: 600 }}>{transporteur.capaciteKg?.toLocaleString()} kg</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="card">
              <h4 style={{ marginBottom: '16px' }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <Phone size={16} color="var(--amber)" />
                  <span>{owner?.telephone || 'Non renseigné'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                  <Mail size={16} color="var(--amber)" />
                  <span style={{ color: 'var(--text-2)' }}>{owner?.email}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            {user?.role === 'client' ? (
              <Link
                to={`/commande/new?transporteurId=${transporteur._id}`}
                className="btn btn-primary btn-block btn-lg"
              >
                <Package size={18} /> Commander ce transporteur
              </Link>
            ) : !user ? (
              <Link to="/login" className="btn btn-primary btn-block btn-lg">
                Se connecter pour commander
              </Link>
            ) : null}

            {transporteur.disponible ? (
              <div className="badge badge-green" style={{ justifyContent: 'center', padding: '8px' }}>
                <CheckCircle size={14} /> Disponible maintenant
              </div>
            ) : (
              <div className="badge badge-red" style={{ justifyContent: 'center', padding: '8px' }}>
                Indisponible
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
