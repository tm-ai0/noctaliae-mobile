// ============================================================
// 🔒 CODE À COPIER-COLLER POUR QUICK WIN #3
// ============================================================

// ═══════════════════════════════════════════════════════════
// BLOC 1 : IMPORT (à ajouter après "const axios = require('axios');")
// ═══════════════════════════════════════════════════════════

const rateLimit = require('express-rate-limit');


// ═══════════════════════════════════════════════════════════
// BLOC 2 : LIMITEURS (à ajouter après "app.use(express.json({ limit: '10mb' }));")
// ═══════════════════════════════════════════════════════════

// ============================================================
// 🔒 RATE LIMITING - Protection anti-spam
// ============================================================

// Limiteur général (toutes les routes)
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requêtes par minute
  message: {
    error: 'Trop de requêtes',
    details: 'Limite : 30 requêtes par minute. Réessayez dans quelques instants.'
  }
});

// Limiteur pour transcription (coûteux en ressources)
const transcribeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 transcriptions par minute
  message: {
    error: 'Trop de requêtes de transcription',
    details: 'Limite : 10 transcriptions par minute.'
  }
});

// Limiteur pour analyses Claude (coûteux en API)
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 analyses Claude par minute
  message: {
    error: 'Trop d\'analyses premium',
    details: 'Limite : 5 analyses Claude par minute.'
  }
});

// Limiteur pour analyses gratuites Llama
const analyzeFreeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 analyses Llama par minute
  message: {
    error: 'Trop d\'analyses gratuites',
    details: 'Limite : 10 analyses Llama par minute.'
  }
});

// Limiteur pour chat (conversations)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages par minute
  message: {
    error: 'Trop de messages',
    details: 'Limite : 20 messages par minute.'
  }
});

// Limiteur pour synthèse vocale (TTS)
const synthesizeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 synthèses par minute
  message: {
    error: 'Trop de synthèses vocales',
    details: 'Limite : 10 synthèses par minute.'
  }
});

// Appliquer le limiteur général à toutes les routes
app.use(generalLimiter);

console.log('✅ Rate limiting activé');


// ═══════════════════════════════════════════════════════════
// BLOC 3 : MODIFICATIONS DES ENDPOINTS
// ═══════════════════════════════════════════════════════════

// ⚠️ REMPLACER LES LIGNES DE DÉCLARATION DES ENDPOINTS PAR :

// Transcription
app.post('/transcribe', transcribeLimiter, async (req, res) => {
  // ... (garder le reste du code inchangé)

// Analyse Claude (premium)
app.post('/analyze-dream', analyzeLimiter, async (req, res) => {
  // ... (garder le reste du code inchangé)

// Analyse Llama (gratuit)
app.post('/analyze-dream-free', analyzeFreeLimiter, async (req, res) => {
  // ... (garder le reste du code inchangé)

// Chat texte
app.post('/chat-text', chatLimiter, async (req, res) => {
  // ... (garder le reste du code inchangé)

// Assistant NoctaliaeAI+
app.post('/noctaliae-assistant', chatLimiter, async (req, res) => {
  // ... (garder le reste du code inchangé)

// Synthèse vocale
app.post('/synthesize', synthesizeLimiter, async (req, res) => {
  // ... (garder le reste du code inchangé)

// Chat vocal (si existe)
app.post('/voice-chat-text', chatLimiter, async (req, res) => {
  // ... (garder le reste du code inchangé)


// ═══════════════════════════════════════════════════════════
// FIN DU CODE
// ═══════════════════════════════════════════════════════════
