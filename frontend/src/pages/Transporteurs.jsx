import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { transporteursService } from '../services/api'
import { Search, Filter, Star, MapPin, Weight, Truck, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

const TYPES = ['camion', 'camionnette', 'moto', 'voiture', 'bateau']
const VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour', 'Louga', 'Tambacounda', 'Matam']

function Stars({ note }) {
  return (
    <span className="tc-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`star ${i <= Math.round(note) ? '' : 'empty'}`}>★</span>
      ))}
      <span style={{ fontSize: '13px', color: 'var(--text-2)', marginLeft: '4px' }}>{note?.toFixed(1) || '–'}</span>
    </span>
  )
}

const TYPE_ICONS = { camion: '🚛', camionnette: '🚐', moto: '🏍️', voiture: '🚗', bateau: '⛵' }

export default function Transporteurs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [transporteurs, setTransporteurs] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    ville: searchParams.get('ville') || '',
    typeTransport: searchParams.get('typeTransport') || '',
    poidsMin: '',
    prixMax: '',
    page: 1,
  })

  const fetchTransporteurs = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.ville) params.ville = filters.ville
      if (filters.typeTransport) params.typeTransport = filters.typeTransport
      if (filters.poidsMin) params.poidsMin = filters.poidsMin
      if (filters.prixMax) params.prixMax = filters.prixMax
      params.page = filters.page
      params.limit = 12

      const { data } = await transporteursService.getAll(params)
      setTransporteurs(data.transporteurs)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchTransporteurs() }, [fetchTransporteurs])

  const applyFilters = (e) => {
    e.preventDefault()
    setFilters(f => ({ ...f, page: 1 }))
  }
  const resetFilters = () => setFilters({ ville: '', typeTransport: '', poidsMin: '', prixMax: '', page: 1 })

  return (
    <div className="page" style={{ paddingTop: '88px', paddingBottom: '64px' }}>
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ marginBottom: '8px' }}>Transporteurs</h1>
          <p>{pagination.total} transporteur{pagination.total > 1 ? 's' : ''} disponible{pagination.total > 1 ? 's' : ''}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px', alignItems: 'start' }}>
          {/* ── Filtres sidebar ── */}
          <aside className="card" style={{ position: 'sticky', top: '88px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4><Filter size={16} style={{ marginRight: '6px' }} />Filtres</h4>
              <button onClick={resetFilters} className="btn btn-ghost btn-sm">Réinitialiser</button>
            </div>
            <form onSubmit={applyFilters} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Ville</label>
                <select className="form-control" value={filters.ville} onChange={e => setFilters(f => ({ ...f, ville: e.target.value }))}>
                  <option value="">Toutes les villes</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type de transport</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-2)' }}>
                    <input type="radio" name="type" value="" checked={filters.typeTransport === ''} onChange={e => setFilters(f => ({ ...f, typeTransport: e.target.value }))} />
                    Tous les types
                  </label>
                  {TYPES.map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-2)' }}>
                      <input type="radio" name="type" value={t} checked={filters.typeTransport === t} onChange={e => setFilters(f => ({ ...f, typeTransport: e.target.value }))} />
                      {TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Poids min. (kg)</label>
                <input type="number" className="form-control" placeholder="ex: 100" value={filters.poidsMin} onChange={e => setFilters(f => ({ ...f, poidsMin: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Prix max. /km (FCFA)</label>
                <input type="number" className="form-control" placeholder="ex: 300" value={filters.prixMax} onChange={e => setFilters(f => ({ ...f, prixMax: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                <Search size={16} /> Appliquer
              </button>
            </form>
          </aside>

          {/* ── Liste ── */}
          <div>
            {loading ? (
              <div className="page-loading"><div className="spinner" /><p>Chargement...</p></div>
            ) : transporteurs.length === 0 ? (
              <div className="empty-state card">
                <div className="empty-icon">🚛</div>
                <div className="empty-title">Aucun transporteur trouvé</div>
                <div className="empty-desc">Modifiez vos filtres pour voir plus de résultats.</div>
                <button onClick={resetFilters} className="btn btn-secondary">Réinitialiser les filtres</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {transporteurs.map(t => (
                    <Link key={t._id} to={`/transporteurs/${t._id}`} style={{ textDecoration: 'none' }}>
                      <div className="transporteur-card">
                        <div className="tc-header">
                          <div className="tc-logo">{TYPE_ICONS[t.typeTransport]}</div>
                          <div className="tc-info">
                            <div className="tc-name">
                              {t.nomEntreprise}
                              {t.verified && <span className="verified-badge ml-8"><CheckCircle size={10} /> Vérifié</span>}
                            </div>
                            <div className="tc-meta">
                              <span><Truck size={12} /> {t.typeTransport}</span>
                              <span><Weight size={12} /> {t.capaciteKg.toLocaleString()} kg</span>
                            </div>
                          </div>
                        </div>
                        <Stars note={t.noteMoyenne} />
                        <div className="tc-zones">
                          {t.zonesCouvertes?.slice(0, 3).map(z => <span key={z} className="zone-tag"><MapPin size={10} /> {z}</span>)}
                          {t.zonesCouvertes?.length > 3 && <span className="zone-tag">+{t.zonesCouvertes.length - 3}</span>}
                        </div>
                        <div className="tc-footer">
                          <div className="tc-price">
                            <span className="amount">{t.prixParKm?.toLocaleString()}</span>
                            <span className="unit"> FCFA/km</span>
                          </div>
                          <span className="btn btn-primary btn-sm">Voir détails →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                    <button className="btn btn-ghost btn-sm" disabled={pagination.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{ padding: '6px 16px', fontSize: '14px', color: 'var(--text-2)' }}>
                      {pagination.page} / {pagination.pages}
                    </span>
                    <button className="btn btn-ghost btn-sm" disabled={pagination.page >= pagination.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
