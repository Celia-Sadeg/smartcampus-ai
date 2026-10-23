// SmartCampus AI - tableau de bord (US-06)

const el = document.getElementById('dashboard');

function barres(titre, donnees) {
  const entries = Object.entries(donnees);
  if (!entries.length) return '';
  const max = Math.max(...entries.map(([, v]) => v), 1);
  const lignes = entries.map(([cle, val]) => `
    <div class="bar-row">
      <span class="bar-label">${cle}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(val / max) * 100}%"></div></div>
      <span class="bar-val">${val}</span>
    </div>`).join('');
  return `<div class="card"><h3>${titre}</h3>${lignes}</div>`;
}

async function charger() {
  try {
    const res = await fetch('/api/stats');
    const s = await res.json();

    if (!s.total) {
      el.innerHTML = '<p class="empty">Aucun incident sur la periode.</p>';
      return;
    }

    el.innerHTML = `
      <div class="kpis">
        <div class="kpi"><span class="kpi-val">${s.total}</span><span class="kpi-lib">Tickets</span></div>
        <div class="kpi"><span class="kpi-val">${s.parStatut.Ouvert || 0}</span><span class="kpi-lib">Ouverts</span></div>
        <div class="kpi"><span class="kpi-val">${s.parStatut['En cours'] || 0}</span><span class="kpi-lib">En cours</span></div>
        <div class="kpi"><span class="kpi-val">${s.parStatut.Resolu || 0}</span><span class="kpi-lib">Resolus</span></div>
        <div class="kpi"><span class="kpi-val">${s.delaiMoyenHeures !== null ? s.delaiMoyenHeures + ' h' : '-'}</span><span class="kpi-lib">Delai moyen</span></div>
      </div>
      <div class="cards">
        ${barres('Par categorie', s.parCategorie)}
        ${barres('Par lieu', s.parLieu)}
        ${barres('Par statut', s.parStatut)}
      </div>
    `;
  } catch (err) {
    el.innerHTML = '<p class="error">Erreur de chargement.</p>';
    console.error(err);
  }
}

charger();
