import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Truck, MapPin, Package, Shield, Clock, Star, ArrowRight, Search, CheckCircle } from 'lucide-react'

const TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'camion', label: '🚛 Camion' },
  { value: 'camionnette', label: '🚐 Camionnette' },
  { value: 'moto', label: '🏍️ Moto' },
  { value: 'voiture', label: '🚗 Voiture' },
]

const VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour', 'Louga', 'Tambacounda', 'Matam']

export default function Home() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ ville: '', typeTransport: '' })

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (form.ville) params.set('ville', form.ville)
    if (form.typeTransport) params.set('typeTransport', form.typeTransport)
    navigate(`/transporteurs?${params.toString()}`)
  }

  return (
    <div className="page">
      {/* ── HERO ────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">
            <Truck size={14} /> Plateforme N°1 au Sénégal
          </div>
          <h1 className="hero-title">
            Trouvez le bon<br />
            <span className="highlight">transporteur</span> en minutes
          </h1>
          <p className="hero-subtitle">
            Connectez-vous aux meilleurs transporteurs du Sénégal. Livraison sécurisée,
            prix transparents, suivi en temps réel.
          </p>
          <div className="hero-cta">
            <Link to="/transporteurs" className="btn btn-primary btn-lg">
              Chercher un transporteur <ArrowRight size={18} />
            </Link>
            <Link to="/tracking" className="btn btn-secondary btn-lg">
              Suivre ma livraison
            </Link>
          </div>
        </div>
      </section>

      {/* ── SEARCH BOX ──────────────────────────── */}
      <section style={{ padding: '0 0 64px', marginTop: '-24px' }}>
        <div className="container">
          <div className="search-box slide-up">
            <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
              🔍 Recherche rapide
            </h3>
            <form onSubmit={handleSearch}>
              <div className="search-grid search-grid-3">
                <div className="form-group">
                  <label className="form-label">Ville de départ / destination</label>
                  <select
                    className="form-control"
                    value={form.ville}
                    onChange={e => setForm({ ...form, ville: e.target.value })}
                  >
                    <option value="">Toutes les villes</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Type de transport</label>
                  <select
                    className="form-control"
                    value={form.typeTransport}
                    onChange={e => setForm({ ...form, typeTransport: e.target.value })}
                  >
                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <label className="form-label">&nbsp;</label>
                  <button type="submit" className="btn btn-primary" style={{ height: '44px' }}>
                    <Search size={18} /> Rechercher
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-value">200+</div>
              <div className="stat-label">Transporteurs actifs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">5 000+</div>
              <div className="stat-label">Livraisons effectuées</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">14</div>
              <div className="stat-label">Régions couvertes</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">4.7★</div>
              <div className="stat-label">Note moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Comment ça marche ?</h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>3 étapes simples pour envoyer votre colis</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { num: '01', icon: <Search size={28} />, title: 'Recherchez', desc: 'Entrez votre destination et filtrez par type de transport. Comparez les prix et les avis.' },
              { num: '02', icon: <Package size={28} />, title: 'Commandez', desc: 'Choisissez votre transporteur, créez votre commande et convenez d\'un rendez-vous.' },
              { num: '03', icon: <MapPin size={28} />, title: 'Suivez', desc: 'Recevez votre numéro de suivi et suivez votre livraison en temps réel.' },
            ].map((step, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', gap: '0' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px',
                  background: 'var(--amber-glow)', border: '1px solid rgba(245,166,35,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', color: 'var(--amber)'
                }}>
                  {step.icon}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--amber)', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  ÉTAPE {step.num}
                </div>
                <h3 style={{ marginBottom: '12px' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.7' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY GP ──────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
            <div>
              <div className="hero-eyebrow"><Star size={14} /> Pourquoi nous choisir</div>
              <h2 style={{ margin: '16px 0 20px' }}>La plateforme de confiance<br />au Sénégal</h2>
              <p style={{ marginBottom: '32px', lineHeight: '1.8' }}>
                GP Transporteurs met en relation clients et transporteurs vérifiés. Transparence des prix, assurance des colis et support 7j/7.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: <Shield size={20} />, title: 'Transporteurs vérifiés', desc: 'Chaque transporteur est vérifié et noté par notre communauté' },
                  { icon: <Clock size={20} />, title: 'Suivi en temps réel', desc: 'Suivez votre colis à chaque étape de la livraison' },
                  { icon: <CheckCircle size={20} />, title: 'Prix garantis', desc: 'Pas de mauvaises surprises, le prix affiché est le prix payé' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'var(--amber-glow)', border: '1px solid rgba(245,166,35,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--amber)', flexShrink: 0
                    }}>{f.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text)' }}>{f.title}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-2)' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Livraisons réussies', value: '98%', color: 'var(--green)' },
                { label: 'Transporteurs vérifiés', value: '100%', color: 'var(--amber)' },
                { label: 'Support client', value: '7j/7', color: 'var(--blue)' },
                { label: 'Satisfaction', value: '4.7★', color: 'var(--amber)' },
              ].map((s, i) => (
                <div key={i} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: s.color, marginBottom: '8px' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ──────────────────────────── */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, var(--bg-2) 0%, var(--bg-3) 100%)',
        borderTop: '1px solid var(--border)', textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ marginBottom: '16px' }}>Prêt à expédier votre colis ?</h2>
          <p style={{ marginBottom: '32px', fontSize: '1.1rem' }}>Rejoignez des milliers de Sénégalais qui font confiance à GP Transporteurs.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Créer un compte gratuit</Link>
            <Link to="/transporteurs" className="btn btn-secondary btn-lg">Voir les transporteurs</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
