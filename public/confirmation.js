// SmartCampus AI - ecran de confirmation (US-01)

// Recupere l'id du ticket depuis l'URL (?id=123)
const params = new URLSearchParams(window.location.search);
const ticketId = params.get('id');

const elId = document.getElementById('ticket-id');
const elDetails = document.getElementById('ticket-details');

async function afficherTicket() {
  if (!ticketId) {
    elId.textContent = 'inconnu';
    return;
  }

  elId.textContent = `#${ticketId}`;

  try {
    const res = await fetch(`/api/tickets/${ticketId}`);
    const result = await res.json();
    if (!res.ok || !result.ticket) return;

    const t = result.ticket;
    elDetails.innerHTML = `
      <ul class="details-list">
        <li><span>Categorie</span><strong>${t.categorie}</strong></li>
        <li><span>Lieu</span><strong>${t.lieu}</strong></li>
        <li><span>Statut</span><strong class="badge">${t.statut}</strong></li>
        <li><span>Description</span><strong>${t.description}</strong></li>
      </ul>
    `;
  } catch (err) {
    console.error('Impossible de charger le ticket', err);
  }
}

afficherTicket();
