# 🚛 GP Transporteurs — Laravel 11 + React

> Projet ISI M1 GL | **LARAVEL 11 API + React 18/Vite 5** | PHP 8.2 + MySQL

---

## ⚙️ Stack Réel
| Couche | Technologie |
|--------|-------------|
| Backend | **Laravel 11** + Sanctum/JWT |
| Frontend | **React 18 + Vite 5** |
| DB | **MySQL 8+** |
| Auth | JWT (tymon/jwt-auth) |

---

## 🚀 Installation 1-Clic (Windows)

**Double-clic** `deploy-windows.bat`:
```
✅ Backend: php artisan migrate:fresh
| Notifications | react-hot-toast |

---

## 📁 Structure du projet

```
gp-transporteurs/
├── backend/
│   ├── config/
│   │   ├── db.js          # Connexion MongoDB Atlas
│   │   └── seed.js        # Données de démonstration
│   ├── middleware/
│   │   └── auth.js        # Middleware JWT
│   ├── models/
│   │   ├── User.js        # Modèle utilisateur
│   │   ├── Transporteur.js # Modèle transporteur (avec avis)
│   │   ├── Commande.js    # Modèle commande (avec suivi)
│   │   └── Rendezvous.js  # Modèle rendez-vous
│   ├── routes/
│   │   ├── auth.js        # /api/auth
│   │   ├── transporteurs.js # /api/transporteurs
│   │   ├── commandes.js   # /api/commandes
│   │   └── rendezvous.js  # /api/rendezvous
│   ├── .env               # Variables d'environnement
│   ├── package.json
│   └── server.js          # Point d'entrée Express
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx  # Contexte global auth
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Transporteurs.jsx
    │   │   ├── TransporteurDetail.jsx
    │   │   ├── CreateCommande.jsx
    │   │   ├── TrackCommande.jsx
    │   │   ├── Dashboard.jsx         # Dashboard client
    │   │   ├── TransporteurDashboard.jsx
    │   │   └── Profile.jsx
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── services/
    │   │   └── api.js        # Couche API Axios
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css         # Design system complet
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js >= 18
- Un compte MongoDB Atlas (gratuit)
- Git

### 1. Cloner le projet
```bash
git clone https://github.com/VOTRE_USERNAME/gp-transporteurs.git
cd gp-transporteurs
```

### 2. Configurer MongoDB Atlas

1. Aller sur [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster gratuit (M0 - Free)
3. Créer un utilisateur DB avec mot de passe
4. Autoriser l'IP `0.0.0.0/0` (accès global)
5. Copier la chaîne de connexion

### 3. Configurer le backend
```bash
cd backend
cp .env.example .env   # ou créer .env manuellement
```

Modifier `.env` :
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gp_transporteurs?retryWrites=true&w=majority
JWT_SECRET=votre_secret_jwt_tres_long_et_securise
JWT_EXPIRES_IN=7d
```

```bash
npm install
npm run seed    # Insérer les données de démonstration
npm run dev     # Démarrer en développement
```

### 4. Démarrer le frontend
```bash
cd ../frontend
npm install
npm run dev
```

L'application sera disponible sur **http://localhost:5173**

---

## 👤 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Client | moussa.diallo@gmail.com | password123 |
| Client 2 | fatou.ndiaye@gmail.com | password123 |
| Transporteur | ibrahima.sall@transport.sn | password123 |
| Admin | admin@gp-transport.sn | password123 |

---

## 📡 API Endpoints

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil connecté |
| PUT | `/api/auth/profile` | Modifier profil |
| PUT | `/api/auth/password` | Changer mot de passe |

### Transporteurs
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/transporteurs` | Liste (filtres : ville, type, poids, prix) |
| GET | `/api/transporteurs/:id` | Détail + avis |
| PUT | `/api/transporteurs/:id` | Modifier profil (auth) |
| GET | `/api/transporteurs/:id/stats` | Statistiques (auth) |
| POST | `/api/transporteurs/:id/avis` | Laisser un avis (auth client) |

### Commandes
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/commandes` | Mes commandes (auth) |
| POST | `/api/commandes` | Créer une commande (client) |
| GET | `/api/commandes/numero/:numero` | Tracking public |
| GET | `/api/commandes/:id` | Détail (auth) |
| PUT | `/api/commandes/:id/statut` | Changer statut (auth) |

### Rendez-vous
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/rendezvous` | Mes rendez-vous (auth) |
| POST | `/api/rendezvous` | Créer un RDV (auth) |
| PUT | `/api/rendezvous/:id/statut` | Mettre à jour statut |

---

## 🗂️ Modèles de données MongoDB

### User
```json
{ nom, prenom, email, password (hashé), telephone, role, adresse, avatar, timestamps }
```

### Transporteur
```json
{ user (ref), nomEntreprise, description, typeTransport, capaciteKg, zonesCouvertes[], prixParKm, prixFixe, noteMoyenne, disponible, verified, avis[] }
```

### Commande
```json
{ numero, client (ref), transporteur (ref), description, adresseDepart, villeDepart, adresseDestination, villeDestination, prixPropose, statut, suivi[], timestamps }
```

### Rendezvous
```json
{ commande (ref), client (ref), transporteur (ref), dateRdv, lieu, type, statut, notes }
```

---

## 🔐 Sécurité

- Mots de passe hashés avec **bcryptjs** (salt rounds: 12)
- Authentification **JWT** avec expiration configurable
- Middleware de vérification des rôles (`client`, `transporteur`, `admin`)
- Validation des données côté serveur (Mongoose validators)
- CORS configuré pour les origines autorisées

---

## 🌍 Déploiement

### Backend (Railway / Render)
```bash
# Variables d'environnement à définir sur la plateforme :
MONGODB_URI=...
JWT_SECRET=...
PORT=5000
NODE_ENV=production
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Déployer le dossier dist/
# Variable d'environnement :
VITE_API_URL=https://votre-backend.railway.app/api
```

---

## 👥 Fonctionnalités

### Client
- ✅ Inscription / Connexion
- ✅ Recherche de transporteurs (filtres : ville, type, poids, prix)
- ✅ Consultation des profils et avis
- ✅ Création de commandes avec calcul de prix automatique
- ✅ Suivi de livraison (public ou connecté)
- ✅ Tableau de bord avec historique
- ✅ Annulation de commande
- ✅ Gestion du profil

### Transporteur
- ✅ Inscription avec profil complet
- ✅ Dashboard de gestion des commandes
- ✅ Accepter / Refuser / Démarrer / Livrer une commande
- ✅ Créer et gérer des rendez-vous
- ✅ Statistiques (total, revenus, avis)
- ✅ Modifier disponibilité et profil

---

## 📧 Soumission

**Email :** top.baba1627@gmail.com  
**Objet :** `Projet-React-ISI-M1GL: Nom_Prenom_Etudiant1 / Nom_Prenom_Etudiant2`

**Livrables :**
- [ ] Lien GitHub
- [ ] Lien du site déployé
- [ ] Rapport PDF (max 15 pages)
- [ ] Vidéo démonstration (max 5 min)
- [ ] Guide utilisateur (max 5 pages)

---

## 🐛 FIX Dashboard Transporteur AUTO

**Symptôme**: Login transporteur → dashboard vide/"noit"

**Cause**: Table `transporteurs` vide (seeders non exécutés)

**Solution 1 commande**:
```bash
chmod +x deploy.sh && ./deploy.sh
```

**Résultat**:
```
✅ Backend migré + seedé
✅ Frontend lancé: localhost:5173
✅ Transporteur: ibrahima.sall@transport.sn / password123
✅ Dashboard → stats/commandes OK
```

**Vérification**:
```
cd backend
php artisan tinker
>>> User::where('role','transporteur')->first()
>>> Transporteur::count()  # Doit = 4
```
