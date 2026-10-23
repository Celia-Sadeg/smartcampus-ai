// SmartCampus AI - serveur Express
// Etape 1 : squelette (page d'accueil + 3 boutons).
// PostgreSQL et les services AWS seront ajoutes dans les etapes suivantes.

const path = require('path');
const express = require('express');
const ticketsRouter = require('./src/tickets');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques (page d'accueil, CSS, JS client)
app.use(express.static(path.join(__dirname, 'public')));

// Point de sante (utile pour les checks AWS plus tard)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartCampus AI', time: new Date().toISOString() });
});

// API des tickets (US-01 : signaler un incident)
app.use('/api', ticketsRouter);

// Page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SmartCampus AI demarre sur http://localhost:${PORT}`);
});
