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

## Deploiement avec Docker (industrialisation)

L'app peut tourner dans un conteneur Docker, ce qui garantit qu'elle fonctionne
de maniere identique partout (PC, EC2, autre serveur) sans installer Node.js a la main.

### Construire l'image

```bash
docker build -t smartcampus-ai .
```

### Lancer le conteneur

```bash
docker run -d --name smartcampus -p 80:80 -e AWS_REGION=us-east-1 \
  -e BEDROCK_MODEL_ID="us.anthropic.claude-haiku-4-5-20251001-v1:0" \
  smartcampus-ai
```

L'app est alors accessible sur le port 80.

### Commandes utiles

```bash
docker ps              # voir les conteneurs qui tournent
docker logs smartcampus  # voir les logs
docker stop smartcampus  # arreter
docker rm smartcampus    # supprimer le conteneur
```
