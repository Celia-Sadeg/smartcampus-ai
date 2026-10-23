// SmartCampus AI - interface de chat de l'assistant (US-04)

const chat = document.getElementById('chat');
const form = document.getElementById('chat-form');
const input = document.getElementById('question');

// Ajoute un message dans la conversation
function ajouterMessage(texte, qui, meta) {
  const div = document.createElement('div');
  div.className = `msg msg-${qui}`;
  let html = `<p>${texte}</p>`;
  if (meta) html += `<span class="msg-meta">${meta}</span>`;
  div.innerHTML = html;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

// Message d'accueil
ajouterMessage(
  "Bonjour ! Posez-moi une question sur le campus (Wi-Fi, horaires, reservation de salle...).",
  'bot'
);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question) return;

  ajouterMessage(question, 'user');
  input.value = '';

  const enCours = ajouterMessage('...', 'bot');

  try {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const result = await res.json();

    const meta = [result.origine, result.source].filter(Boolean).join(' - ');
    enCours.innerHTML = `<p>${result.reponse}</p>`
      + (meta ? `<span class="msg-meta">${meta}</span>` : '');
    chat.scrollTop = chat.scrollHeight;
  } catch (err) {
    enCours.innerHTML = '<p>Desole, une erreur est survenue.</p>';
    console.error(err);
  }
});
