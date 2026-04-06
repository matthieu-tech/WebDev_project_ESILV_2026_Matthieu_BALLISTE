# CryptoFolio — Gestionnaire de portefeuille crypto

Projet de Web Development dans le cadre du cours de développement web à l'ESILV (A4 FinTech). Application web complète de gestion de cryptomonnaies : suivi des investissements, performances en temps réel, et actualités crypto.

## Application en ligne

- **Frontend** : https://cozy-capybara-7fc814.netlify.app
- **Backend** : https://webdev-project-esilv-2026-matthieu.onrender.com

> Le backend tourne sur Render (plan gratuit) et peut mettre ~30 secondes à répondre lors du premier appel après une période d'inactivité (cold start).

## Fonctionnalités

### Authentification
- Inscription avec vérification email (token envoyé par mail ou affiché en dev)
- Connexion / déconnexion avec confirmation
- JWT stocké en cookie httpOnly, expiration 30 min
- Système de rôles : `user` et `admin`

### Portefeuilles
- Création de jusqu'à 5 portefeuilles par utilisateur
- Ajout de positions avec recherche autocomplete CoinGecko (symbole, nom, quantité, prix d'achat, date)
- Calcul automatique des gains/pertes depuis l'ouverture de chaque position (prix actuel vs prix d'achat)
- Camembert de répartition du portefeuille, regroupé par crypto
- Suppression de positions et de portefeuilles

### Dashboard
- Indicateurs globaux (valeur totale, montant investi, gain/perte global, nombre de portefeuilles)
- Résumé des portefeuilles avec leurs performances
- Tableau des marchés top 5 avec graphiques sparkline 7 jours (extensible à 30)

### Marchés
- Tableau des 30 premières cryptos par capitalisation
- Prix actuel, variations 24h/7j, graphique sparkline 7 jours

### Actualités
- 10 derniers articles depuis Cryptoast et Journal du Coin (flux RSS proxysés côté backend)
- Liens cliquables vers les articles originaux

### Interface
- Mode sombre / clair avec bouton toggle, persisté en localStorage
- Police Space Grotesk
- Design responsive

## Stack

- **Frontend** : Vue.js 3 (Composition API), Vite, Pinia, Vue Router
- **Backend** : Fastify, Mongoose, Node.js
- **Base de données** : MongoDB (Docker en local, Atlas en production)
- **Auth** : JWT en cookie httpOnly
- **APIs externes** : CoinGecko (prix, marchés, recherche), RSS Cryptoast & Journal du Coin

## Lancer en local

### Prérequis

- Node.js 18+
- Docker & Docker Compose

### 1. Cloner et installer

```bash
git clone https://github.com/matthieu-tech/WebDev_project_ESILV_2026_Matthieu_BALLISTE
cd WebDev_project_ESILV_2026_Matthieu_BALLISTE
cd server && npm install
cd ../client && npm install
```

### 2. Configurer MongoDB

Dans `mongo-init/init.js`, remplace les credentials par les tiens :

```js
db.createUser({
  user: 'tonuser',
  pwd: 'tonmotdepasse',
  roles: [{ role: 'readWrite', db: 'myapp' }]
})
```

Lance MongoDB avec Docker :

```bash
docker-compose up -d
```

### 3. Configurer le backend

```bash
cp server/.env-example server/.env.development.local
```

Édite `server/.env.development.local` :

```env
MONGODB_URI=mongodb://tonuser:tonmotdepasse@localhost:35115/myapp
JWT_SECRET=une-chaine-secrete-longue
CLIENT_URL=http://localhost:5173
APP_BASE_URL=http://localhost:3000
```

### 4. Lancer

```bash
# Terminal 1 — backend (port 3000)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

L'appli est accessible sur http://localhost:5173

> Les données persistent tant que tu ne fais pas `docker-compose down -v`.

## Structure du projet

```
webdev-esilv-starter/
├── client/                  # Frontend Vue.js
│   └── src/
│       ├── components/      # NavBar, SparkLine, ConfirmDialog
│       ├── composables/     # useTheme (dark/light mode)
│       ├── views/           # Dashboard, Portfolios, Markets, Actus, Auth...
│       ├── stores/          # Pinia : auth, portfolio
│       └── services/        # Appels CoinGecko
├── server/                  # Backend Fastify
│   └── src/
│       ├── users/           # Auth + gestion utilisateurs + rôles admin
│       ├── portfolios/      # CRUD portefeuilles et positions
│       ├── actus/           # Proxy RSS actualités crypto
│       └── plugins/         # JWT, Mongoose, Auth middleware
├── mongo-init/              # Script d'init MongoDB (modifier les credentials ici)
└── docker-compose.yml       # MongoDB en conteneur Docker
```
