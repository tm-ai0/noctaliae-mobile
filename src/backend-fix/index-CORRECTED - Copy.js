require('dotenv').config();
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Configuration des clés API
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;

console.log("============================================================");
console.log("🔑 Clés API:");
if (ANTHROPIC_API_KEY) console.log(`✅ ANTHROPIC_API_KEY: OK (${ANTHROPIC_API_KEY.length} chars)`);
if (GROQ_API_KEY) console.log(`✅ GROQ_API_KEY: OK (${GROQ_API_KEY.length} chars)`);
if (GOOGLE_CLOUD_API_KEY) console.log(`✅ GOOGLE_CLOUD_API_KEY: OK (${GOOGLE_CLOUD_API_KEY.length} chars)`);
console.log("============================================================");

// Rate Limiting Intelligent (10 req/heure avec dégradation auto)
const ipRequestCounts = new Map();

const intelligentRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (!ipRequestCounts.has(ip)) ipRequestCounts.set(ip, []);
  
  const requests = ipRequestCounts.get(ip);
  const recentRequests = requests.filter(time => now - time < oneHour);
  
  if (recentRequests.length >= 10) {
    console.log(`⚠️ Limite atteinte pour IP ${ip}`);
    req.degradedMode = true;
    req.limitMessage = {
      limited: true,
      message: "Limite de 10 analyses/heure atteinte",
      suggestion: "Passage automatique en mode gratuit (Llama 3.3 70B)",
      kofi_link: "https://ko-fi.com/noctaliae"
    };
  }
  
  recentRequests.push(now);
  ipRequestCounts.set(ip, recentRequests);
  next();
};

app.use('/analyze-dream', intelligentRateLimiter);
app.use('/analyze-dream-free', intelligentRateLimiter);
app.use('/transcribe', intelligentRateLimiter);
app.use('/chat-text', intelligentRateLimiter);

const synthesizeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Trop de requêtes de synthèse vocale' }
});

console.log('✅ Rate limiting intelligent activé (10 req/heure)');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Noctaliæ', version: '2.0' });
});

// Transcription
app.post('/transcribe', async (req, res) => {
  try {
    const { audio_base64 } = req.body;
    if (!audio_base64) return res.status(400).json({ error: 'audio_base64 requis' });

    const audioBuffer = Buffer.from(audio_base64, 'base64');
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'audio.m4a', contentType: 'audio/m4a' });
    form.append('model', 'whisper-large-v3');
    form.append('language', 'fr');
    form.append('response_format', 'json');

    const response = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      form,
      {
        headers: { ...form.getHeaders(), 'Authorization': `Bearer ${GROQ_API_KEY}` },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    res.json({ success: true, text: response.data.text, limitInfo: req.limitMessage || null });
  } catch (error) {
    console.error('❌ Erreur transcription:', error.message);
    res.status(500).json({ error: 'Erreur transcription', details: error.message });
  }
});

// Analyse Premium (Claude ou Llama si limite atteinte)
app.post('/analyze-dream', async (req, res) => {
  try {
    const { dream_text } = req.body;
    if (!dream_text) return res.status(400).json({ error: 'dream_text requis' });

    if (req.degradedMode) {
      console.log('⚡ Mode dégradé → Llama');
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Expert en analyse de rêves (neurosciences).' },
            { role: 'user', content: `Analyse ce rêve : ${dream_text}` }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
      );

      return res.json({
        analysis: response.data.choices[0].message.content,
        model: 'llama-3.3-70b (mode gratuit)',
        limitInfo: req.limitMessage
      });
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: `Analyse ce rêve : ${dream_text}` }]
      },
      {
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    res.json({ analysis: response.data.content[0].text, model: 'claude-sonnet-4', limitInfo: req.limitMessage || null });
  } catch (error) {
    console.error('❌ Erreur analyse:', error.message);
    res.status(500).json({ error: 'Erreur analyse', details: error.message });
  }
});

// Analyse Gratuite (Llama)
app.post('/analyze-dream-free', async (req, res) => {
  try {
    const { dream_text } = req.body;
    if (!dream_text) return res.status(400).json({ error: 'dream_text requis' });

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Expert en analyse de rêves (neurosciences).' },
          { role: 'user', content: `Analyse ce rêve : ${dream_text}` }
        ],
        max_tokens: 2000,
        temperature: 0.7
      },
      { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );

    res.json({ analysis: response.data.choices[0].message.content, model: 'llama-3.3-70b', limitInfo: req.limitMessage || null });
  } catch (error) {
    console.error('❌ Erreur analyse gratuite:', error.message);
    res.status(500).json({ error: 'Erreur analyse', details: error.message });
  }
});

// Chat Texte ✨ CORRIGÉ
app.post('/chat-text', async (req, res) => {
  try {
    const { message, dreamTranscription, dreamAnalysis, conversation_history = [], isPremium = false } = req.body;
    if (!message) return res.status(400).json({ error: 'message requis' });
    
    // Construction historique
    let hist = '';
    if (conversation_history && conversation_history.length > 0) {
      hist = '\n\nHistorique:\n' + conversation_history.slice(-10).map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');
    }
    
    // Prompt système avec contexte du rêve
    const systemPrompt = `Tu es Noctaliæ, assistant d'analyse de rêves basé sur les neurosciences (Isabelle Arnulf, Matthew Walker, Domhoff).

${dreamTranscription ? `RÊVE ORIGINAL:\n${dreamTranscription}\n` : ''}
${dreamAnalysis ? `ANALYSE COMPLÈTE:\n${dreamAnalysis}` : ''}${hist}

INSTRUCTIONS:
- Base-toi sur l'analyse ci-dessus pour répondre
- Réponds de manière CONCISE (2-4 phrases max)
- Ton CHALEUREUX et empathique
- Références scientifiques si pertinent
- Lie ta réponse au rêve ET à l'analyse fournie`;

    const model = (isPremium && !req.degradedMode) ? 'claude' : 'llama';
    
    if (model === 'claude') {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: 'user', content: message }]
        },
        { headers: { 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' } }
      );
      res.json({ reply: response.data.content[0].text, model: 'claude-sonnet-4', limitInfo: req.limitMessage || null });
    } else {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
      );
      res.json({ reply: response.data.choices[0].message.content, model: 'llama-3.3-70b', limitInfo: req.limitMessage || null });
    }
  } catch (error) {
    console.error('❌ Erreur chat:', error.message);
    res.status(500).json({ error: 'Erreur chat', details: error.message });
  }
});

// Synthèse Vocale
app.post('/synthesize', synthesizeLimiter, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text requis' });

    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        input: { text },
        voice: { languageCode: 'fr-FR', name: 'fr-FR-Neural2-A', ssmlGender: 'FEMALE' },
        audioConfig: { audioEncoding: 'MP3', pitch: 0, speakingRate: 0.95 }
      }
    );

    res.json({ audio_base64: response.data.audioContent });
  } catch (error) {
    console.error('❌ Erreur synthèse:', error.message);
    res.status(500).json({ error: 'Erreur synthèse', details: error.message });
  }
});

// 🌙 NoctaliaeAI+ avec Claude Sonnet 4 (mains libres)
app.post("/noctaliae-chat", async (req, res) => {
  const { dreamTranscription, dreamAnalysis, userMessage, conversationHistory } = req.body;
  
  try {
    if (!userMessage || !dreamAnalysis) {
      return res.status(400).json({ error: "userMessage et dreamAnalysis requis" });
    }
    
    const contextPrompt = `Tu es NoctaliaeAI+, expert en neurosciences oniriques (Arnulf, Walker, Domhoff). Style: Profond, empathique, scientifique. ZÉRO mysticisme.

ANALYSE ACTUELLE:
${dreamAnalysis}

TRANSCRIPTION RÊVE:
${dreamTranscription || "Aucune"}

Réponds de manière conversationnelle, scientifique, personnalisée. 200 mots max.`;

    let messages = [];
    if (conversationHistory?.length > 0) {
      messages = conversationHistory.slice(-10).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      }));
    }
    
    messages.push({
      role: "user",
      content: contextPrompt + "\n\n" + userMessage
    });
    
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: messages
      },
      {
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        }
      }
    );
    
    res.json({ response: response.data.content[0].text });
    
  } catch (error) {
    console.error("❌ NoctaliaeAI+:", error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("============================================================");
  console.log(`🌙 Noctaliæ actif sur le port ${PORT}`);
  console.log("📡 Endpoints: /health /transcribe /analyze-dream /analyze-dream-free /chat-text /synthesize /noctaliae-chat");
  console.log("⏱️ Rate Limiting: 10 req/heure avec dégradation auto");
  console.log("============================================================");
});