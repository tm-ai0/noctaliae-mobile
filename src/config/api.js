// URL de ton backend Replit
export const API_BASE_URL = 'https://api.thomasmaury.fr';

// Endpoints
export const API_ENDPOINTS = {
  transcribe: '/transcribe',
  analyze: '/analyze-dream',
  analyzeFree: '/analyze-dream-free',
  analyzeImage: '/analyze-image',  // 📷 Analyse image (carnet, dessin)
  health: '/health',
  chatText: '/chat-text',
  synthesize: '/synthesize',  // 🔊 Synthèse vocale
  noctaliaeAssistant: '/noctaliae-assistant',  // 🌙 NoctaliaeAI+ (Gemini)
  noctaliaeWebSocket: '/noctaliae-live',  // ⚡ WebSocket Live API
  noctaliaeChat: '/noctaliae-chat',  // 🎙️ Chat vocal Claude (mains libres)
  generateDreamImage: '/generate-dream-image',  // 🎨 Génération visuelle du rêve
  verifyCode: '/verify-code',                    // 🎟️ Activation code Ko-fi
};
