import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { transporteursService, commandesService } from '../services/api'
import { Package, MapPin, ArrowRight, Calculator } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateCommande() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const transporteurId = searchParams.get('transporteurId') || ''

  const [transporteur, setTransporteur] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    transporteurId,
    description: '',
    poidsKg: '',
    volumeM3: '',
    adresseDepart: '',
    villeDepart: '',
    adresseDestination: '',
    villeDestination: '',
    distanceKm: '',
    prixPropose: '',
    dateSouhaitee: '',
    notesClient: '',
  })

  useEffect(() => {
    if (transporteurId) {
      transporteursService.getById(transporteurId)
        .then(({ data }) => setTransporteur(data.transporteur))
        .catch(() => {})
    }
  }, [transporteurId])

  // Calcul prix estimé
  useEffect(() => {
    if (transporteur && form.distanceKm) {
      const prix = Math.round(
        (transporteur.prixFixe || 0) + (transporteur.prixParKm || 0) * Number(form.distanceKm)
      )
      setForm(f => ({ ...f, prixPropose: prix.toString() }))
    }
  }, [form.distanceKm, transporteur])

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.transporteurId) return setError('Veuillez choisir un transporteur.')
    setError('')
    setLoading(true)
    try {
      const payload = {
        transporteurId: form.transporteurId,
        description: form.description,
        poidsKg: form.poidsKg ? Number(form.poidsKg) : undefined,
        volumeM3: form.volumeM3 ? Number(form.volumeM3) : undefined,
        adresseDepart: form.adresseDepart,
        villeDepart: form.villeDepart,
        adresseDestination: form.adresseDestination,
        villeDestination: form.villeDestination,
        distanceKm: form.distanceKm ? Number(form.distanceKm) : undefined,
        prixPropose: Number(form.prixPropose),
        dateSouhaitee: form.dateSouhaitee || undefined,
        notesClient: form.notesClient,
      }
      const { data } = await commandesService.create(payload)
      toast.success(`Commande ${data.commande.numero} créée !`)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création.')
    } finally {
      setLoading(false)
    }
  }

  const VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour', 'Louga', 'Tambacounda', 'Matam']

  return (
    <div className="page" style={{ paddingTop: '88px', paddingBottom: '64px' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <h1 style={{ marginBottom: '8px' }}>Nouvelle commande</h1>
        <p style={{ marginBottom: '32px' }}>Remplissez les informations pour créer votre commande de transport.</p>

        {/* Info transporteur sélectionné */}
        {transporteur && (
          <div className="card mb-24" style={{ borderColor: 'var(--amber)', background: 'var(--amber-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>🚛 {transporteur.nomEntreprise}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                  {transporteur.prixParKm?.toLocaleString()} FCFA/km • Base : {transporteur.prixFixe?.toLocaleString()} FCFA
                </div>
              </div>
              <button onClick={() => navigate(`/transporteurs/${transporteur._id}`)} className="btn btn-ghost btn-sm">
                Changer
              </button>
            </div>
          </div>
        )}

        {error && <div className="alert alert-error mb-24">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Section 1 — Description */}
          <div className="card">
            <h4 style={{ marginBottom: '20px' }}><Package size={16} style={{ marginRight: '8px', color: 'var(--amber)' }} />Description du colis</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-control" placeholder="ex: Électroménager, vêtements, matériaux de construction..." rows={3} required {...f('description')} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Poids (kg)</label>
                  <input type="number" className="form-control" placeholder="ex: 150" min="0" {...f('poidsKg')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Volume (m³)</label>
                  <input type="number" className="form-control" placeholder="ex: 2.5" min="0" step="0.1" {...f('volumeM3')} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Adresses */}
          <div className="card">
            <h4 style={{ marginBottom: '20px' }}><MapPin size={16} style={{ marginRight: '8px', color: 'var(--amber)' }} />Itinéraire</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: '8px', borderLeft: '3px solid var(--green)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>DÉPART</div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Adresse de départ *</label>
                    <input className="form-control" placeholder="Rue, Quartier" required {...f('adresseDepart')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ville *</label>
                    <select className="form-control" required {...f('villeDepart')}>
                      <option value="">Choisir une ville</option>
                      {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', color: 'var(--amber)', fontSize: '20px' }}>↓</div>

              <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: '8px', borderLeft: '3px solid var(--amber)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>DESTINATION</div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Adresse de destination *</label>
                    <input className="form-control" placeholder="Rue, Quartier" required {...f('adresseDestination')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ville *</label>
                    <select className="form-control" required {...f('villeDestination')}>
                      <option value="">Choisir une ville</option>
                      {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Distance estimée (km)</label>
                <input type="number" className="form-control" placeholder="ex: 70" min="0" {...f('distanceKm')} />
                <span className="form-hint">Entrez la distance pour calculer le prix automatiquement</span>
              </div>
            </div>
          </div>

          {/* Section 3 — Prix & Date */}
          <div className="card">
            <h4 style={{ marginBottom: '20px' }}><Calculator size={16} style={{ marginRight: '8px', color: 'var(--amber)' }} />Prix & Planification</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Prix proposé (FCFA) *</label>
                  <input type="number" className="form-control" placeholder="ex: 25000" min="0" required {...f('prixPropose')} />
                  {transporteur && form.distanceKm && (
                    <span className="form-hint" style={{ color: 'var(--amber)' }}>
                      ✓ Calculé automatiquement
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Date souhaitée</label>
                  <input type="date" className="form-control" min={new Date().toISOString().split('T')[0]} {...f('dateSouhaitee')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes pour le transporteur</label>
                <textarea className="form-control" placeholder="Instructions spéciales, fragile, etc." rows={2} {...f('notesClient')} />
              </div>
            </div>
          </div>

          {/* Résumé prix */}
          {transporteur && form.prixPropose && (
            <div className="card" style={{ borderColor: 'var(--amber)', background: 'var(--amber-glow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Prix total estimé</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--amber)' }}>
                  {Number(form.prixPropose).toLocaleString()} FCFA
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Annuler</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Envoi...</> : <><ArrowRight size={18} /> Envoyer la commande</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
