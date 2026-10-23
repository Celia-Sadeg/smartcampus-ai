// SmartCampus AI - stockage des tickets, historique et utilisateurs
//
// Etape actuelle : stockage EN MEMOIRE (les donnees vivent tant que le serveur tourne).
// Prochaine etape : on remplacera ce fichier par une connexion PostgreSQL (RDS),
// sans changer le reste du code.

// Categories autorisees (cf US-01)
const CATEGORIES = [
  'Materiel defectueux',
  'Salle fermee',
  'Probleme reseau',
];

// Statuts possibles du cycle de vie d'un ticket (US-02 / US-03)
const STATUSES = ['Ouvert', 'En cours', 'Resolu'];

// "Base de donnees" en memoire
const tickets = [];
let sequence = 0;

// Genere le prochain numero de ticket (unique, incremental)
function nextId() {
  sequence += 1;
  return sequence;
}

// Cree et enregistre un ticket. Retourne le ticket cree. (US-01)
function createTicket({ categorie, lieu, description, auteur }) {
  const now = new Date().toISOString();
  const ticket = {
    id: nextId(),
    categorie,
    lieu,
    description,
    auteur: auteur || 'anonyme',
    statut: 'Ouvert', // statut initial impose par US-01
    photo: null, // gere plus tard avec S3
    dateCreation: now,
    dateMaj: now,
    // Historique des changements (US-02 / US-03)
    historique: [
      {
        date: now,
        statut: 'Ouvert',
        commentaire: 'Ticket cree.',
        par: auteur || 'anonyme',
      },
    ],
  };
  tickets.push(ticket);
  return ticket;
}

// Retrouve un ticket par son id (ou undefined)
function getTicket(id) {
  return tickets.find((t) => t.id === Number(id));
}

// Liste tous les tickets (les plus recents d'abord)
function listTickets() {
  return [...tickets].reverse();
}

// Liste les tickets d'un auteur donne (US-02 : "Mes demandes")
function listTicketsByAuteur(auteur) {
  return tickets
    .filter((t) => t.auteur === auteur)
    .reverse();
}

// Met a jour le statut d'un ticket + ajoute une entree d'historique (US-03)
// Retourne { ok, ticket } ou { ok:false, message }
function updateStatut(id, { statut, commentaire, par }) {
  const ticket = getTicket(id);
  if (!ticket) return { ok: false, message: 'Ticket introuvable.' };

  if (!STATUSES.includes(statut)) {
    return { ok: false, message: 'Statut invalide.' };
  }

  // Regle metier US-03 : commentaire obligatoire pour passer a "Resolu"
  if (statut === 'Resolu' && (!commentaire || !commentaire.trim())) {
    return { ok: false, message: 'Un commentaire est obligatoire pour resoudre un ticket.' };
  }

  const now = new Date().toISOString();
  ticket.statut = statut;
  ticket.dateMaj = now;
  ticket.historique.push({
    date: now,
    statut,
    commentaire: (commentaire || '').trim() || `Statut change en "${statut}".`,
    par: par || 'technicien',
  });

  return { ok: true, ticket };
}

// --- Statistiques pour le tableau de bord (US-06) ---
function stats() {
  const parCategorie = {};
  const parLieu = {};
  const parStatut = { Ouvert: 0, 'En cours': 0, Resolu: 0 };

  let totalResolu = 0;
  let sommeDelaisMs = 0;

  tickets.forEach((t) => {
    parCategorie[t.categorie] = (parCategorie[t.categorie] || 0) + 1;
    parLieu[t.lieu] = (parLieu[t.lieu] || 0) + 1;
    parStatut[t.statut] = (parStatut[t.statut] || 0) + 1;

    // Delai moyen de resolution = dateMaj - dateCreation sur les tickets resolus (US-06 R2)
    if (t.statut === 'Resolu') {
      totalResolu += 1;
      sommeDelaisMs += new Date(t.dateMaj) - new Date(t.dateCreation);
    }
  });

  const delaiMoyenHeures = totalResolu > 0
    ? Math.round((sommeDelaisMs / totalResolu / 3600000) * 10) / 10
    : null;

  return {
    total: tickets.length,
    parCategorie,
    parLieu,
    parStatut,
    delaiMoyenHeures,
  };
}

module.exports = {
  CATEGORIES,
  STATUSES,
  createTicket,
  getTicket,
  listTickets,
  listTicketsByAuteur,
  updateStatut,
  stats,
};
