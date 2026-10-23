// SmartCampus AI - ecran "Mes demandes" (US-02)

const elListe = document.getElementById('liste');
const elDetail = document.getElementById('detail');

function badge(statut) {
  const cls = {
    Ouvert: 'badge badge-ouvert',
    'En cours': 'badge badge-encours',
    Resolu: 'badge badge-resolu',
  }[statut] || 'badge';
  return `<span class="${cls}">${statut}</span>`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

// Charge et affiche la liste des tickets
async function chargerListe() {
  try {
    const res = await fetch('/api/tickets');
    const tickets = await res.json();

    if (!tickets.length) {
      elListe.innerHTML = '<p class="empty">Aucune demande pour le moment. '
        + '<a href="/signaler.html">Signaler un incident</a></p>';
      return;
    }

    elListe.innerHTML = tickets.map((t) => `
      <button class="ticket-row" data-id="${t.id}">
        <div class="ticket-row-head">
          <strong>#${t.id} - ${t.categorie}</strong>
          ${badge(t.statut)}
        </div>
        <div class="ticket-row-sub">
          <span>Lieu : ${t.lieu}</span>
          <span>Maj : ${formatDate(t.dateMaj)}</span>
        </div>
      </button>
    `).join('');

    document.querySelectorAll('.ticket-row').forEach((row) => {
      row.addEventListener('click', () => afficherDetail(row.dataset.id));
    });
  } catch (err) {
    elListe.innerHTML = '<p class="error">Erreur de chargement.</p>';
    console.error(err);
  }
}

// Affiche le detail d'un ticket avec son historique
async function afficherDetail(id) {
  try {
    const res = await fetch(`/api/tickets/${id}`);
    const result = await res.json();
    if (!result.ok) return;
    const t = result.ticket;

    document.getElementById('detail-titre').textContent = `Ticket #${t.id} - ${t.categorie}`;
    document.getElementById('detail-infos').innerHTML = `
      <ul class="details-list">
        <li><span>Statut</span>${badge(t.statut)}</li>
        <li><span>Lieu</span><strong>${t.lieu}</strong></li>
        <li><span>Description</span><strong>${t.description}</strong></li>
        <li><span>Cree le</span><strong>${formatDate(t.dateCreation)}</strong></li>
      </ul>`;

    document.getElementById('detail-historique').innerHTML = t.historique
      .map((h) => `
        <li>
          <div class="histo-head">${badge(h.statut)} <span>${formatDate(h.date)}</span></div>
          <p>${h.commentaire} <em>(par ${h.par})</em></p>
        </li>`).join('');

    elDetail.classList.remove('hidden');
    elDetail.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('fermer-detail').addEventListener('click', () => {
  elDetail.classList.add('hidden');
});

chargerListe();
