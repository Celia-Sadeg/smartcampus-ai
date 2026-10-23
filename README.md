# SmartCampus AI

Application de gestion centralisee des incidents du campus : signalement, suivi,
assistant IA et pilotage.

Cette premiere etape fournit le squelette : un serveur Express qui sert une page
d'accueil avec le titre **SmartCampus AI** et trois boutons (Signaler un incident,
Mes demandes, Assistant IA).

> PostgreSQL et les services AWS seront ajoutes dans les etapes suivantes.

## Prerequis

- Node.js 18 ou plus (recommande : 20+)

## Installation des dependances

```bash
npm install
```

## Lancer l'application en local

```bash
npm start
```

Puis ouvrir http://localhost:3000 dans le navigateur.

### Mode developpement (rechargement auto)

```bash
npm run dev
```

## Structure du projet

```
.
├── package.json        # dependances et scripts npm
├── server.js           # serveur Express
├── public/
│   ├── index.html      # page d'accueil + 3 boutons
│   ├── styles.css      # style responsive (mobile-first)
│   └── app.js          # interactions des boutons
└── README.md
```

## Point de sante

- `GET /api/health` renvoie l'etat du service (utile pour les checks AWS a venir).
