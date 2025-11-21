require('dotenv').config(); // Charge .env en priorité
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json({ limit: '10mb' }));

// ============================================================
// CONFIGURATION DES CLÉS API AVEC FALLBACK .ENV
// ============================================================
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;

// ============================================================
// PROMPT SYSTÈME SCIENTIFIQUE (Isabelle Arnulf)
// ============================================================
const SYSTEM_PROMPT = `Tu es un assistant d'analyse de rêves basé sur l'approche neuroscientifique d'Isabelle Arnulf et du DreamTeam de l'Institut du Cerveau de Paris (ICM). Ton rôle est d'approfondir l'analyse d'un rêve déjà transcrit et analysé, en adoptant une posture scientifique rigoureuse ancrée dans les neurosciences cognitives.

PRINCIPES SCIENTIFIQUES FONDAMENTAUX

1. Le rêve est une activité cognitive
Le rêve n'est pas purement symbolique, mais une activité cognitive au même titre que la mémoire ou l'apprentissage. Il permet de penser, d'apprendre et de traiter les émotions.

2. Principe de Continuité
Environ 65% des éléments dans les rêves sont liés aux événements de la journée précédente, bien que reconstruits et mélangés avec des souvenirs plus anciens (seulement 2% sont des reproductions exactes).

3. Fonction de Régulation Émotionnelle
Le cerveau utilise le sommeil pour trier et décomposer les émotions de la journée afin d'éliminer les sentiments négatifs. Jusqu'à 82% des rêves sont de nature négative ou violente, ce qui a un rôle adaptatif.

4. Simulation de Menaces
Les rêves simulent des situations menaçantes dans un environnement sûr, permettant de réduire l'anxiété et de mieux se préparer aux défis de la vie éveillée.

5. Créativité et Innovation
Le sommeil paradoxal permet aux traces mnésiques de se lier de manière nouvelle et abstraite, favorisant la formation d'associations non évidentes essentielles à la créativité.

6. Structure Typique des Rêves
- 90% des rêves sont banals et quotidiens (interactions avec famille, amis, collègues)
- 1% sont des "rêves typiques" marquants (perdre ses dents, être nu, voler)
- Ces derniers sont facilement mémorisés bien que rares

APPROCHE D'ANALYSE

Étape 1 : Analyse Phénoménologique
- Identifier le contenu thématique (quotidien vs. étrange)
- Repérer les résidus de la journée (continuité avec la vie éveillée)
- Évaluer la reconstruction narrative (comment le rêve mélange passé récent et ancien)

Étape 2 : Analyse Émotionnelle
- Identifier les émotions dominantes (joie, anxiété, peur, colère)
- Repérer les menaces simulées (conflits, échecs, dangers)
- Évaluer le rôle adaptatif (préparation à des situations réelles)

Étape 3 : Fonction Cognitive
- Digestion émotionnelle : Le rêve aide-t-il à traiter des émotions négatives ?
- Simulation de menaces : Prépare-t-il à des défis réels ?
- Créativité : Y a-t-il des associations nouvelles ou des solutions créatives ?
- Consolidation mnésique : Le rêve aide-t-il à mémoriser ou apprendre ?

Étape 4 : Interprétation Neurocognitive
Synthétiser les observations pour comprendre :
- La fonction principale du rêve (régulation émotionnelle, simulation, créativité)
- Les liens avec les préoccupations de la vie éveillée
- Les mécanismes adaptatifs à l'œuvre

CE QU'IL FAUT ÉVITER (PIÈGES SCIENTIFIQUES)

❌ Interprétations symboliques littérales
Ne pas attribuer de significations symboliques stéréotypées (ex: "perdre ses dents = mort d'un proche"). Ces interprétations sont considérées comme "tirées par les cheveux".

❌ Approche purement psychanalytique
Éviter la théorie de la "censure-déguisement" freudienne. Le caractère bizarre des rêves n'est pas un déguisement intentionnel mais résulte de l'hypo-activation du cortex préfrontal.

❌ Interprétations prémonitoires ou ésotériques
Les rêves ne prédisent pas l'avenir. Ils reflètent les préoccupations actuelles et aident à s'y préparer.

❌ Affirmations non étayées
Ne jamais affirmer quelque chose sans lien avec le contenu concret du rêve ou les principes neuroscientifiques établis.

STYLE DE COMMUNICATION

Ton approprié :
- Scientifique mais accessible : Utilise un langage clair sans jargon excessif
- Bienveillant et curieux : Pose des questions pour approfondir la compréhension
- Factuel et nuancé : Présente les hypothèses comme des possibilités, pas des certitudes

Structure des réponses :
1. Reconnaissance : Valider l'expérience du rêveur
2. Analyse : Appliquer les principes neurocognitifs
3. Questions : Inviter à explorer les liens avec la vie éveillée
4. Synthèse : Proposer une interprétation fonctionnelle

Exemples de formulations :

✅ BON
"Ce rêve semble refléter une préoccupation concernant [situation]. Le fait que tu [action dans le rêve] pourrait être une façon pour ton cerveau de simuler une situation stressante pour mieux t'y préparer. As-tu remarqué des liens avec des événements récents ?"

✅ BON
"L'intensité émotionnelle de ce rêve suggère que ton cerveau est en train de traiter activement des émotions liées à [thème]. Le sommeil paradoxal permet cette digestion émotionnelle, ce qui peut t'aider à te sentir plus serein·e au réveil."

❌ À ÉVITER
"Ce rêve symbolise clairement que tu as peur de l'autorité paternelle."

❌ À ÉVITER
"Ton rêve prédit que quelque chose d'important va se passer dans ta vie."

FORMAT DE RÉPONSE ATTENDU

Pour chaque question de l'utilisateur :
1. Lien avec le rêve initial (si pertinent)
2. Analyse neurocognitive (appliquer les principes scientifiques)
3. Questions exploratoires (inviter à réfléchir sur les liens avec la vie éveillée)
4. Synthèse fonctionnelle (résumer la fonction cognitive probable du rêve)

RAPPEL IMPORTANT

Tu n'analyses jamais le rêve seul·e. L'utilisateur vient avec un rêve déjà transcrit et analysé. Ton rôle est d'approfondir cette analyse à travers un dialogue interactif en appliquant les principes scientifiques d'Isabelle Arnulf.

Reste toujours :
- Factuel (basé sur les neurosciences)
- Bienveillant (soutenir l'utilisateur dans sa réflexion)
- Curieux (poser des questions pour explorer les liens avec la vie éveillée)
- Nuancé (présenter des hypothèses, pas des certitudes)`;

// ============================================================
// 🔑 DIAGNOSTIC - Clés API au démarrage
// ============================================================
console.log("============================================================");
console.log("🔑 DIAGNOSTIC - Clés API au démarrage");
console.log("============================================================");

if (ANTHROPIC_API_KEY) {
  console.log(`✅ ANTHROPIC_API_KEY: Présente (${ANTHROPIC_API_KEY.length} chars)`);
} else {
  console.log("❌ ANTHROPIC_API_KEY: ABSENTE");
}

if (GROQ_API_KEY) {
  console.log(`✅ GROQ_API_KEY: Présente (${GROQ_API_KEY.length} chars)`);
} else {
  console.log("❌ GROQ_API_KEY: ABSENTE");
}

if (GOOGLE_CLOUD_API_KEY) {
  const keyLength = GOOGLE_CLOUD_API_KEY.length;
  const keyStart = GOOGLE_CLOUD_API_KEY.substring(0, 8);
  const keyEnd = GOOGLE_CLOUD_API_KEY.substring(keyLength - 4);
  console.log(`✅ GOOGLE_CLOUD_API_KEY: Présente (${keyLength} chars)`);
  console.log(`   Format: ${keyStart}...${keyEnd}`);
  
  // Validation du format
  if (GOOGLE_CLOUD_API_KEY.startsWith('AIzaSy') && keyLength === 39) {
    console.log("   ✅ Format valide (commence par AIzaSy, 39 chars)");
  } else {
    console.log("   ⚠️ Format suspect (attendu: AIzaSy... 39 chars)");
  }
} else {
  console.log("❌ GOOGLE_CLOUD_API_KEY: ABSENTE");
  console.log("   ⚠️ La synthèse vocale ne fonctionnera pas!");
}

console.log("============================================================");
console.log("🧠 PROMPT SCIENTIFIQUE: Approche Isabelle Arnulf activée");
console.log("============================================================");

// ============================================================
// RATE LIMITING (10 req/min par IP)
// ============================================================
const synthesizeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requêtes par minute
  message: { 
    error: 'Trop de requêtes de synthèse vocale. Maximum 10 par minute.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

console.log("🔊 Endpoint /synthesize activé (Google Cloud TTS avec Rate Limiting)");
console.log("⏱️ Limite : 10 requêtes par minute par IP");

// ============================================================
// ENDPOINTS
// ============================================================

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.2-scientific-prompt',
    endpoints: {
      webhook: 'POST /webhook',
      analyze_premium: 'POST /analyze-dream',
      analyze_free: 'POST /analyze-dream-free',
      transcribe: 'POST /transcribe',
      chat: 'POST /chat-text',
      synthesize: 'POST /synthesize (Google Cloud TTS, 10 req/min)'
    }
  });
});

// Webhook Omi
app.post('/webhook', async (req, res) => {
  try {
    const { segments, session_id } = req.body;
    
    if (!segments || segments.length === 0) {
      return res.json({
        message: "💤 Pas de récit de rêve détecté. Raconte-moi ton rêve pour une analyse approfondie."
      });
    }

    const transcript = segments.map(s => s.text).join(' ');
    const prompt = `Tu es un expert en analyse de rêves. Analyse ce rêve de manière détaillée et empathique (max 250 mots) :\n\n"${transcript}"`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const analysis = response.data.content[0].text;
    res.json({ message: analysis });
  } catch (error) {
    console.error('Erreur webhook:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur analyse',
      details: error.message
    });
  }
});

// Analyze Dream (Premium - Claude Sonnet)
app.post('/analyze-dream', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({
        error: 'Le champ "transcript" est requis et ne peut pas être vide'
      });
    }

    const prompt = `Tu es un expert en analyse de rêves. Analyse ce rêve de manière détaillée et empathique (max 250 mots) :\n\n"${transcript}"`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const analysis = response.data.content[0].text;
    res.json({ analysis });
  } catch (error) {
    console.error('Erreur /analyze-dream:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur lors de l\'analyse du rêve',
      details: error.message
    });
  }
});

// Analyze Dream Free (Groq Llama)
app.post('/analyze-dream-free', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({
        error: 'Le champ "transcript" est requis et ne peut pas être vide'
      });
    }

    const prompt = `Tu es un expert en analyse de rêves. Analyse ce rêve de manière détaillée et empathique (max 250 mots) :\n\n"${transcript}"`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const analysis = response.data.choices[0].message.content;
    res.json({ analysis });
  } catch (error) {
    console.error('Erreur /analyze-dream-free:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur lors de l\'analyse du rêve (version gratuite)',
      details: error.message
    });
  }
});

// Transcription (Groq Whisper)
app.post('/transcribe', async (req, res) => {
  try {
    const { audio_base64 } = req.body;
    
    if (!audio_base64) {
      return res.status(400).json({
        error: 'Le champ "audio_base64" est requis'
      });
    }

    const audioBuffer = Buffer.from(audio_base64, 'base64');
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', audioBuffer, {
      filename: 'audio.m4a',
      contentType: 'audio/m4a'
    });
    form.append('model', 'whisper-large-v3');
    form.append('language', 'fr');
    form.append('response_format', 'json');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      form,
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          ...form.getHeaders()
        }
      }
    );

    res.json({ transcript: response.data.text });
  } catch (error) {
    console.error('Erreur /transcribe:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur lors de la transcription',
      details: error.message
    });
  }
});

// Chat Textuel (Claude Sonnet) - NOUVEAU PROMPT SCIENTIFIQUE
app.post('/chat-text', async (req, res) => {
  try {
    const { message, conversation_history } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Le champ "message" est requis et ne peut pas être vide'
      });
    }

    const messages = [];
    if (conversation_history && Array.isArray(conversation_history)) {
      messages.push(...conversation_history);
    }
    messages.push({ role: 'user', content: message });

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: messages,
        system: SYSTEM_PROMPT
      },
      {
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const reply = response.data.content[0].text;
    res.json({ reply });
  } catch (error) {
    console.error('Erreur /chat-text:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur lors du chat',
      details: error.message
    });
  }
});

// Synthèse Vocale (Google Cloud TTS avec Rate Limiting)
app.post('/synthesize', synthesizeLimiter, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Le champ "text" est requis et ne peut pas être vide'
      });
    }

    if (!GOOGLE_CLOUD_API_KEY) {
      return res.status(500).json({
        error: 'GOOGLE_CLOUD_API_KEY non configurée',
        details: 'La clé API Google Cloud n\'est pas définie dans les variables d\'environnement'
      });
    }

    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        input: { text: text },
        voice: {
          languageCode: 'fr-FR',
          name: 'fr-FR-Neural2-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: 0,
          speakingRate: 0.95
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const audioContent = response.data.audioContent;
    res.json({ audio_base64: audioContent });
  } catch (error) {
    console.error('Erreur /synthesize:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur lors de la synthèse vocale',
      details: error.response?.data || error.message
    });
  }
});

// Streaming audio direct (GET pour compatibilité expo-audio)
app.get('/stream-tts', async (req, res) => {
  try {
    const { text } = req.query;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Le paramètre "text" est requis et ne peut pas être vide'
      });
    }

    if (!GOOGLE_CLOUD_API_KEY) {
      return res.status(500).json({
        error: 'GOOGLE_CLOUD_API_KEY non configurée'
      });
    }

    console.log(`🎵 Streaming TTS pour ${text.length} caractères`);

    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        input: { text: text },
        voice: {
          languageCode: 'fr-FR',
          name: 'fr-FR-Neural2-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'LINEAR16',
          pitch: 0,
          speakingRate: 0.95
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const audioBuffer = Buffer.from(response.data.audioContent, 'base64');
    
    console.log(`✅ Audio généré: ${audioBuffer.length} octets`);
    
    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': audioBuffer.length,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache'
    });
    
    res.send(audioBuffer);
    
  } catch (error) {
    console.error('❌ Erreur stream TTS:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur lors du streaming audio',
      details: error.response?.data || error.message
    });
  }
});

// ============================================================
// SERVEUR
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌙 Noctaliæ actif sur le port ${PORT}`);
  console.log("📡 Webhook Omi: POST /webhook");
  console.log("📡 Endpoint Premium: POST /analyze-dream");
  console.log("📡 Endpoint Gratuit: POST /analyze-dream-free");
  console.log("📡 Endpoint Transcription: POST /transcribe");
  console.log("📡 Endpoint Chat: POST /chat-text (Prompt Scientifique Arnulf)");
  console.log("🔊 Endpoint Synthèse: POST /synthesize (Google Cloud TTS)");
  console.log("🎵 Endpoint Streaming: GET /stream-tts (WAV direct)");
  console.log("⏱️ Rate Limiting: 10 req/min activé");
  console.log("💰 Mode économique activé");
  console.log("🌍 Support multilingue activé");
});
