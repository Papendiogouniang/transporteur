# 🚛 GP Transporteurs — Backend Laravel

> ISI M1 GL 2025-2026 | Pape Ndiogou Niang & Abdou Sarr | Encadrant : BABA TOP

## Stack Backend
- **PHP 8.2+** + **Laravel 11**
- **MySQL** (base de données relationnelle)
- **tymon/jwt-auth** (authentification JWT)
- **Eloquent ORM** (modèles, migrations, seeders)

---

## 🚀 Installation

### Prérequis
- PHP >= 8.2 avec extensions : mbstring, xml, zip, pdo_mysql
- Composer >= 2.x
- MySQL >= 8.0
- Node.js >= 18 (pour le frontend)

### 1. Installer les dépendances PHP
```bash
cd backend
composer install
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Modifier `.env` :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gp_transporteurs
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe

FRONTEND_URL=http://localhost:5173
```

### 3. Créer la base de données MySQL
```sql
CREATE DATABASE gp_transporteurs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Lancer les migrations et le seeder
```bash
php artisan migrate
php artisan db:seed
```

### 5. Démarrer le serveur
```bash
php artisan serve
# API disponible sur http://localhost:8000
```

---

## 👤 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Client 1 (Pape Ndiogou) | pape.niang@gmail.com | password123 |
| Client 2 (Abdou) | abdou.sarr@gmail.com | password123 |
| Transporteur | ibrahima.sall@transport.sn | password123 |
| Admin | admin@gp-transport.sn | password123 |

---

## 📡 Endpoints API

### Auth — `/api/auth`
| Méthode | Route | Accès |
|---------|-------|-------|
| POST | `/register` | Public |
| POST | `/login` | Public |
| GET | `/me` | JWT |
| PUT | `/profile` | JWT |
| PUT | `/password` | JWT |
| POST | `/logout` | JWT |

### Transporteurs — `/api/transporteurs`
| Méthode | Route | Accès |
|---------|-------|-------|
| GET | `/` | Public |
| GET | `/{id}` | Public |
| PUT | `/{id}` | JWT transporteur |
| GET | `/{id}/stats` | JWT transporteur |
| POST | `/{id}/avis` | JWT client |

### Commandes — `/api/commandes`
| Méthode | Route | Accès |
|---------|-------|-------|
| GET | `/` | JWT |
| POST | `/` | JWT client |
| GET | `/numero/{numero}` | Public |
| GET | `/{id}` | JWT |
| PUT | `/{id}/statut` | JWT |

### Rendez-vous — `/api/rendezvous`
| Méthode | Route | Accès |
|---------|-------|-------|
| GET | `/` | JWT |
| POST | `/` | JWT |
| PUT | `/{id}/statut` | JWT |

---

## 🗄️ Structure du projet

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── TransporteurController.php
│   │   │   ├── CommandeController.php
│   │   │   └── RendezvousController.php
│   │   └── Middleware/
│   │       └── JwtMiddleware.php
│   └── Models/
│       ├── User.php
│       ├── Transporteur.php
│       ├── Commande.php
│       ├── SuiviLivraison.php
│       ├── Rendezvous.php
│       └── Avis.php
├── database/
│   ├── migrations/        # 4 fichiers de migration
│   └── seeders/
│       └── DatabaseSeeder.php
├── routes/
│   └── api.php
├── config/
│   ├── cors.php
│   └── jwt.php
└── .env.example
```

---

## 🔐 Authentification JWT

```
1. POST /api/auth/login → { token: "eyJ..." }
2. Stocker le token côté client (localStorage)
3. Ajouter header : Authorization: Bearer <token>
4. POST /api/auth/logout pour invalider le token
```

---

## 📦 Connexion Frontend React

Dans `frontend/src/services/api.js`, le proxy Vite redirige
`/api/*` vers `http://localhost:8000/api/*`.

Pour la production, définir :
```env
VITE_API_URL=https://votre-backend.com/api
```
