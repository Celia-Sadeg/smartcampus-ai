// SmartCampus AI - espace technicien (US-03)

const elFile = document.getElementById('file');

function badge(statut) {
  const cls = {
    Ouvert: 'badge badge-ouvert',
    'En cours': 'badge badge-encours',
    Resolu: 'badge badge-resolu',
  }[statut] || 'badge';
  return `<span class="${cls}">${statut}</span>`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

// Charge la file de tous les tickets
async function chargerFile() {
  try {
    const res = await fetch('/api/tickets');
    const tickets = await res.json();

    if (!tickets.length) {
      elFile.innerHTML = '<p class="empty">Aucun ticket a traiter.</p>';
      return;
    }

    elFile.innerHTML = tickets.map((t) => `
      <div class="ticket-card" data-id="${t.id}">
        <div class="ticket-row-head">
          <strong>#${t.id} - ${t.categorie}</strong>
          ${badge(t.statut)}
        </div>
        <div class="ticket-row-sub">
          <span>Lieu : ${t.lieu}</span>
          <span>Maj : ${formatDate(t.dateMaj)}</span>
        </div>
        <p class="ticket-desc">${t.description}</p>

        <div class="tech-actions">
          <select class="statut-select">
            <option value="Ouvert" ${t.statut === 'Ouvert' ? 'selected' : ''}>Ouvert</option>
            <option value="En cours" ${t.statut === 'En cours' ? 'selected' : ''}>En cours</option>
            <option value="Resolu" ${t.statut === 'Resolu' ? 'selected' : ''}>Resolu</option>
          </select>
          <input type="text" class="commentaire-input" placeholder="Commentaire (obligatoire pour Resolu)" />
          <button class="action-btn btn-small maj-btn">Mettre a jour</button>
        </div>
        <p class="error maj-error"></p>
      </div>
    `).join('');

    document.querySelectorAll('.ticket-card').forEach((card) => {
      const btn = card.querySelector('.maj-btn');
      btn.addEventListener('click', () => majStatut(card));
    });
  } catch (err) {
    elFile.innerHTML = '<p class="error">Erreur de chargement.</p>';
    console.error(err);
  }
}

// Envoie le changement de statut (US-03)
async function majStatut(card) {
  const id = card.dataset.id;
  const statut = card.querySelector('.statut-select').value;
  const commentaire = card.querySelector('.commentaire-input').value;
  const errEl = card.querySelector('.maj-error');
  errEl.textContent = '';

  try {
    const res = await fetch(`/api/tickets/${id}/statut`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut, commentaire, par: 'Karim (technicien)' }),
    });
    const result = await res.json();

    if (!res.ok) {
      errEl.textContent = result.message || 'Erreur.';
      return;
    }
    // Succes -> on recharge la file
    chargerFile();
  } catch (err) {
    errEl.textContent = 'Erreur reseau.';
    console.error(err);
  }
}

chargerFile();
