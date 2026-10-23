// SmartCampus AI - Assistant IA (US-04)
//
// Strategie :
//  - Si Bedrock est accessible (identifiants AWS presents) -> on appelle Claude.
//  - Sinon -> on repond avec une FAQ locale (pour que la demo marche sans AWS).
//
// Conformement a US-04 : l'assistant repond uniquement a partir de la base de
// connaissances (FAQ) validee par l'ecole, et dit "je ne sais pas" hors perimetre.

// --- Base de connaissances (FAQ de l'ecole) ---
const FAQ = [
  {
    motsCles: ['wifi', 'wi-fi', 'internet', 'reseau', 'connecter', 'connexion'],
    reponse:
      "Pour vous connecter au Wi-Fi du campus : selectionnez le reseau \"Campus-Etudiants\", "
      + "puis identifiez-vous avec votre identifiant ecole (prenom.nom) et votre mot de passe ENT. "
      + "En cas d'echec, oubliez le reseau et reconnectez-vous.",
    source: 'FAQ - Acces Wi-Fi',
  },
  {
    motsCles: ['horaire', 'horaires', 'ouverture', 'ferme', 'ouvert', 'bibliotheque'],
    reponse:
      "Le campus est ouvert du lundi au vendredi de 8h00 a 20h00, et le samedi de 9h00 a 13h00. "
      + "La bibliotheque ferme 30 minutes avant le campus.",
    source: 'FAQ - Horaires',
  },
  {
    motsCles: ['salle', 'reserver', 'reservation', 'reserver une salle'],
    reponse:
      "Pour reserver une salle, rendez-vous sur l'intranet, rubrique \"Reservation de salles\". "
      + "Les salles de groupe se reservent jusqu'a 7 jours a l'avance, par creneaux d'une heure.",
    source: 'FAQ - Reservation de salles',
  },
  {
    motsCles: ['mot de passe', 'ent', 'identifiant', 'compte', 'oublie'],
    reponse:
      "Pour reinitialiser votre mot de passe ENT, cliquez sur \"Mot de passe oublie\" sur la page "
      + "de connexion, ou contactez le service informatique au batiment A.",
    source: 'FAQ - Compte et identifiants',
  },
];

// Message par defaut quand l'assistant ne trouve pas de reponse (US-04)
const JE_NE_SAIS_PAS =
  "Je ne sais pas repondre a cette question pour le moment. "
  + "Si vous rencontrez un probleme sur le campus, vous pouvez le signaler via le bouton \"Signaler un incident\".";

// Cherche une reponse dans la FAQ locale
function reponseFAQ(question) {
  const q = (question || '').toLowerCase();
  for (const item of FAQ) {
    if (item.motsCles.some((mot) => q.includes(mot))) {
      return { reponse: item.reponse, source: item.source, origine: 'FAQ locale' };
    }
  }
  return { reponse: JE_NE_SAIS_PAS, source: null, origine: 'FAQ locale' };
}

// Construit le prompt systeme : l'IA ne repond QUE sur la base de la FAQ (US-04 R2)
function construirePrompt(question) {
  const faqTexte = FAQ
    .map((item, i) => `${i + 1}. ${item.reponse} (Source: ${item.source})`)
    .join('\n');

  return (
    "Tu es l'assistant du campus SmartCampus AI. Reponds en francais, de maniere claire et concise.\n"
    + "Tu dois repondre UNIQUEMENT a partir de la base de connaissances ci-dessous.\n"
    + "Si la question n'est pas couverte, reponds exactement : \"" + JE_NE_SAIS_PAS + "\"\n\n"
    + "BASE DE CONNAISSANCES :\n" + faqTexte + "\n\n"
    + "QUESTION DE L'ETUDIANT : " + question
  );
}

// Appelle Amazon Bedrock (Claude). Retourne la reponse texte, ou lance une erreur.
async function reponseBedrock(question) {
  // Import dynamique : si le SDK n'est pas installe, on bascule sur la FAQ locale.
  const {
    BedrockRuntimeClient,
    InvokeModelCommand,
  } = require('@aws-sdk/client-bedrock-runtime');

  const region = process.env.AWS_REGION || 'us-east-1';
  const modelId = process.env.BEDROCK_MODEL_ID
    || 'anthropic.claude-3-haiku-20240307-v1:0';

  const client = new BedrockRuntimeClient({ region });

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 500,
    messages: [
      { role: 'user', content: [{ type: 'text', text: construirePrompt(question) }] },
    ],
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await client.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));
  // Format de reponse Claude sur Bedrock
  const texte = body.content && body.content[0] && body.content[0].text;
  return texte || JE_NE_SAIS_PAS;
}

// Point d'entree : repond a une question (Bedrock si possible, sinon FAQ locale)
async function repondre(question) {
  if (!question || !question.trim()) {
    return { reponse: 'Posez-moi une question sur le campus.', origine: 'systeme', source: null };
  }

  // On tente Bedrock seulement si des identifiants AWS semblent presents
  const aDesCredentials =
    process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE || process.env.AWS_SESSION_TOKEN;

  if (aDesCredentials) {
    try {
      const texte = await reponseBedrock(question);
      return { reponse: texte, origine: 'Amazon Bedrock', source: 'Base de connaissances' };
    } catch (err) {
      // En cas d'erreur Bedrock (pas de droits, SDK absent...), on retombe sur la FAQ
      console.warn('Bedrock indisponible, bascule FAQ locale :', err.message);
    }
  }

  return reponseFAQ(question);
}

module.exports = { repondre, FAQ };
