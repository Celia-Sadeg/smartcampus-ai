// SmartCampus AI - routes API (tickets, suivi, traitement, assistant, stats)

const express = require('express');
const store = require('./store');
const assistant = require('./assistant');

const router = express.Router();

// GET /api/categories -> liste des categories (pour le formulaire US-01)
router.get('/categories', (req, res) => {
  res.json(store.CATEGORIES);
});

// GET /api/statuts -> liste des statuts possibles (pour l'ecran technicien US-03)
router.get('/statuts', (req, res) => {
  res.json(store.STATUSES);
});

// POST /api/tickets -> cree un ticket (US-01)
router.post('/tickets', (req, res) => {
  const { categorie, lieu, description, auteur } = req.body || {};

  const erreurs = {};
  if (!categorie || !categorie.trim()) erreurs.categorie = 'La categorie est obligatoire.';
  if (!lieu || !lieu.trim()) erreurs.lieu = 'Le lieu est obligatoire.';
  if (!description || !description.trim()) erreurs.description = 'La description est obligatoire.';
  if (categorie && !store.CATEGORIES.includes(categorie)) {
    erreurs.categorie = 'Categorie invalide.';
  }

  if (Object.keys(erreurs).length > 0) {
    return res.status(400).json({ ok: false, erreurs });
  }

  const ticket = store.createTicket({
    categorie: categorie.trim(),
    lieu: lieu.trim(),
    description: description.trim(),
    auteur,
  });

  return res.status(201).json({ ok: true, ticket });
});

// GET /api/tickets -> liste de tous les tickets (file du technicien US-03)
// GET /api/tickets?auteur=lea -> tickets d'un etudiant (Mes demandes US-02)
router.get('/tickets', (req, res) => {
  const { auteur } = req.query;
  if (auteur) {
    return res.json(store.listTicketsByAuteur(auteur));
  }
  return res.json(store.listTickets());
});

// GET /api/tickets/:id -> detail d'un ticket avec historique (US-02)
router.get('/tickets/:id', (req, res) => {
  const ticket = store.getTicket(req.params.id);
  if (!ticket) {
    return res.status(404).json({ ok: false, message: 'Ticket introuvable.' });
  }
  return res.json({ ok: true, ticket });
});

// PATCH /api/tickets/:id/statut -> change le statut + commentaire (US-03)
router.patch('/tickets/:id/statut', (req, res) => {
  const { statut, commentaire, par } = req.body || {};
  const result = store.updateStatut(req.params.id, { statut, commentaire, par });
  if (!result.ok) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

// POST /api/assistant -> pose une question a l'assistant IA (US-04)
router.post('/assistant', async (req, res) => {
  const { question } = req.body || {};
  try {
    const result = await assistant.repondre(question);
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Erreur assistant :', err);
    return res.status(500).json({ ok: false, message: 'Erreur de l assistant.' });
  }
});

// GET /api/stats -> statistiques pour le tableau de bord (US-06)
router.get('/stats', (req, res) => {
  res.json(store.stats());
});

module.exports = router;
