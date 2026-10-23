// SmartCampus AI - formulaire de signalement (US-01)

const form = document.getElementById('incident-form');
const selectCategorie = document.getElementById('categorie');

// 1. Charger les categories depuis l'API pour remplir le menu deroulant
async function chargerCategories() {
  try {
    const res = await fetch('/api/categories');
    const categories = await res.json();
    categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      selectCategorie.appendChild(option);
    });
  } catch (err) {
    console.error('Impossible de charger les categories', err);
  }
}

// Efface les messages d'erreur affiches
function resetErreurs() {
  ['categorie', 'lieu', 'description'].forEach((champ) => {
    const el = document.getElementById(`error-${champ}`);
    if (el) el.textContent = '';
    const input = document.getElementById(champ);
    if (input) input.classList.remove('input-error');
  });
}

// Affiche les erreurs renvoyees par le serveur (champ en rouge)
function afficherErreurs(erreurs) {
  Object.entries(erreurs).forEach(([champ, message]) => {
    const el = document.getElementById(`error-${champ}`);
    if (el) el.textContent = message;
    const input = document.getElementById(champ);
    if (input) input.classList.add('input-error');
  });
}

// 2. Envoyer le formulaire a l'API
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  resetErreurs();

  const data = {
    categorie: selectCategorie.value,
    lieu: document.getElementById('lieu').value,
    description: document.getElementById('description').value,
  };

  try {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (!res.ok) {
      // Champs manquants -> on affiche les erreurs en rouge
      afficherErreurs(result.erreurs || {});
      return;
    }

    // Succes -> on redirige vers la confirmation avec le numero du ticket
    window.location.href = `/confirmation.html?id=${result.ticket.id}`;
  } catch (err) {
    alert('Une erreur est survenue. Reessayez.');
    console.error(err);
  }
});

chargerCategories();
