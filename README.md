# CryptoFolio — Gestionnaire de portefeuille crypto

Projet de fin d'année réalisé dans le cadre du cours de développement web à l'ESILV (4A FinTech). L'idée était de créer une application web complète autour de la gestion de cryptomonnaies : suivre ses investissements, voir les performances en temps réel, et rester informé des dernières actus.

## Ce que fait l'appli

- **Authentification** complète avec JWT (inscription, connexion, déconnexion, vérification email)
- **Gestion de portefeuilles** : jusqu'à 5 portefeuilles par utilisateur
- **Positions** : ajout de cryptos avec recherche autocomplete via CoinGecko, prix d'achat, quantité, date
- **Calcul des gains/pertes** depuis l'ouverture de chaque position, basé sur le prix actuel du marché
- **Camembert** de répartition du portefeuille (regroupement par crypto)
- **Dashboard** avec indicateurs globaux et tableau des marchés avec graphiques sparkline 7j
- **Actus crypto** depuis Cryptoast et Journal du Coin (flux RSS proxysés côté backend)
- **Mode sombre / clair** persisté en localStorage
- **Rôles** : utilisateur et administrateur

## Stack

- **Frontend** : Vue.js 3, Vite, Pinia, Vue Router, Space Grotesk
- **Backend** : Fastify, Mongoose, Node.js
- **Base de données** : MongoDB (Docker en local, Atlas en prod)
- **Auth** : JWT en cookie httpOnly, 30 min d'expiration
- **APIs** : CoinGecko (prix, marchés, recherche), RSS Cryptoast & JDC (actus)

## Installation en local

### Prérequis

- Node.js 18+
- Docker & Docker Compose

### 1. Cloner et installer

```bash
git clone <url-du-repo>
cd webdev-esilv-starter
cd server && npm install
cd ../client && npm install
```

### 2. Configurer MongoDB

Dans `mongo-init/init.js`, mets tes propres credentials à la place des miens :

```js
db.createUser({
  user: 'tonuser',
  pwd: 'tonmotdepasse',
  roles: [{ role: 'readWrite', db: 'myapp' }]
})
```

Lance MongoDB :

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
JWT_SECRET=une-chaine-secrete-longue-et-random
CLIENT_URL=http://localhost:5173
APP_BASE_URL=http://localhost:3000
```

### 4. Lancer

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

L'appli tourne sur [http://localhost:5173](http://localhost:5173).

> **Note** : les données persistent tant que tu ne fais pas `docker-compose down -v`.

## Déploiement

- **Backend** : Render — configurer `MONGODB_URI` (Atlas), `JWT_SECRET`, `CLIENT_URL` (URL Netlify)
- **Frontend** : Netlify — configurer `VITE_API_URL` (URL Render), ajouter un fichier `_redirects` avec `/* /index.html 200`

## Structure

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
├── mongo-init/              # Init MongoDB (créer ici ton utilisateur)
└── docker-compose.yml       # MongoDB en conteneur
```
