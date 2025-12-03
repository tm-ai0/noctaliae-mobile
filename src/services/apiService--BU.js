import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { premiumService } from './premiumService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FINGERPRINTS_KEY = '@noctaliae_user_fingerprints';

export async function checkBackendHealth() {
  try {
    console.log('🔍 Test connexion backend:', API_BASE_URL);
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.health}`, {
      timeout: 5000,
    });
    console.log('✅ Backend répond:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Backend inaccessible:', error.message);
    return null;
  }
}

// 🆕 Fonction pour obtenir le bon endpoint selon le mode Premium
async function getAnalyzeEndpoint() {
  const isPremium = await premiumService.isPremium();
  
  if (isPremium) {
    console.log('⭐ Mode Premium - Utilisation de Claude Sonnet 4.5');
    return API_ENDPOINTS.analyze; // /analyze-dream (Claude)
  } else {
    console.log('🆓 Mode Gratuit - Utilisation de Llama 3.3 70B');
    return API_ENDPOINTS.analyzeFree; // /analyze-dream-free (Llama)
  }
}

// 🆕 Fonction helper pour charger les empreintes
async function loadUserFingerprints() {
  try {
    const stored = await AsyncStorage.getItem(FINGERPRINTS_KEY);
    if (stored) {
      const fingerprints = JSON.parse(stored);
      // Extraire uniquement le texte de chaque empreinte
      return fingerprints.map(f => f.text);
    }
    return [];
  } catch (error) {
    console.error('❌ Erreur chargement empreintes:', error);
    return [];
  }
}

// Analyser un rêve depuis du texte
export async function analyzeDreamFromText(dreamText, isPremium = false) {
  try {
    console.log('📤 Envoi du rêve pour analyse');
    
    // 🆕 Charger les empreintes utilisateur
    const userFingerprints = await loadUserFingerprints();
    if (userFingerprints.length >= 3) {
      console.log(`👣 ${userFingerprints.length} empreintes chargées`);
    } else {
      console.log('⚠️ Moins de 3 empreintes, analyse standard');
    }
    
    const endpoint = isPremium ? API_ENDPOINTS.analyze : API_ENDPOINTS.analyzeFree;
    
    const response = await axios.post(
      `${API_BASE_URL}${endpoint}`,
      {
        transcript: dreamText,  // ✅ CORRIGÉ : Le backend v2.3 attend "transcript"
        userFingerprints: userFingerprints  // 🆕 AJOUT - Envoyer les empreintes
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    
    console.log('✅ Analyse reçue');
    
    // 🔒 Vérifier si limite atteinte
    const limitInfo = response.data.limitInfo || null;
    if (limitInfo && limitInfo.limited) {
      console.log('⚠️ Limite atteinte:', limitInfo.message);
    }
    
    return {
      transcription: dreamText,
      analysis: response.data.analysis,
      model: response.data.model || (isPremium ? 'claude-sonnet-4' : 'llama-3.3-70b'),
      limitInfo: limitInfo  // 🆕 AJOUT - Info sur la limite
    };
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw new Error(error.response?.data?.message || 'Erreur d\'analyse');
  }
}

/**
 * Transcrit un fichier audio en texte via Whisper (Groq)
 */
export async function transcribeAudio(audioUri) {
  try {
    console.log('🎤 Début transcription:', audioUri);

    // Vérifier que le fichier existe (utiliser legacy API)
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    console.log('📁 Fichier info:', fileInfo);
    
    if (!fileInfo.exists) {
      throw new Error('Fichier audio introuvable');
    }

    // 1️⃣ Lire le fichier audio et le convertir en base64
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64', // ✅ FIX: Utiliser string au lieu de EncodingType
    });

    console.log('📦 Audio converti en base64:', audioBase64.length, 'chars');
    console.log('📤 Envoi vers le backend...');

    // 2️⃣ Envoyer en JSON avec le champ "audio_base64"
    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        audio_base64: audioBase64,
      }),
    });

    console.log('📥 Réponse reçue:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur backend:', data);
      throw new Error(data.error || data.details || 'Erreur transcription');
    }

    // ✅ FIX: Le backend renvoie 'text' pas 'transcript'
    const transcriptText = data.transcript || data.text;
    console.log('✅ Transcription réussie:', transcriptText.substring(0, 50) + '...');
    
    return transcriptText;

  } catch (error) {
    console.error('❌ Erreur transcription complète:', error);
    throw new Error(`Erreur lors de la transcription audio`);
  }
}

/**
 * Conversation texte avec le rêve analysé
 */
export async function chatWithDream(dreamTranscription, dreamAnalysis, conversationHistory, userMessage, isPremium) {
  try {
    console.log('💬 Envoi message chat:', {
      isPremium,
      historyLength: conversationHistory.length,
      messageLength: userMessage.length,
      hasDreamContext: !!dreamTranscription && !!dreamAnalysis
    });

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.chatText}`,
      {
        message: userMessage,  // ✅ CORRIGÉ : Le backend attend "message"
        dreamTranscription: dreamTranscription,  // 🆕 AJOUTÉ - Transcription originale du rêve
        dreamAnalysis: dreamAnalysis,  // 🆕 AJOUTÉ - Analyse complète du rêve
        conversation_history: conversationHistory  // ✅ CORRIGÉ : snake_case
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('✅ Réponse chat reçue');
    return {
      response: response.data.reply,  // ✅ Le backend renvoie "reply"
      model: isPremium ? 'claude' : 'llama'
    };

  } catch (error) {
    console.error('❌ Erreur chat:', error);
    throw new Error(error.response?.data?.error || 'Erreur de conversation');
  }
}

/**
 * 🔊 Synthétise du texte en audio via Google Cloud TTS
 * Limitation : 10 requêtes/minute
 */
export async function synthesizeText(text) {
  try {
    console.log('🔊 Début synthèse vocale:', text.substring(0, 50) + '...');
    
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.synthesize}`,
      {
        text: text
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
        responseType: 'arraybuffer', // ✅ Important pour recevoir l'audio
      }
    );
    
    console.log('✅ Audio synthétisé, taille:', response.data.byteLength, 'octets');
    
    // Convertir ArrayBuffer en base64
    const base64Audio = btoa(
      new Uint8Array(response.data)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    return base64Audio;
    
  } catch (error) {
    console.error('❌ Erreur synthèse vocale:', error);
    
    // Vérifier si c'est une erreur de rate limit
    if (error.response?.status === 429) {
      throw new Error('Trop de requêtes. Limite : 10 par minute. Réessayez dans quelques instants.');
    }
    
    throw new Error(error.response?.data?.error || 'Erreur de synthèse vocale');
  }
}

/**
 * 🎙️ NoctaliaeChat - Chat vocal avec Claude Sonnet 4 (nouvel endpoint optimisé)
 * 
 * Endpoint : /noctaliae-chat
 * Modèle : Claude Sonnet 4 (toujours, pas de mode gratuit)
 * Cas d'usage : Chat vocal interactif avec contexte complet du rêve
 * 
 * @param {string} dreamTranscription - Transcription originale du rêve
 * @param {string} dreamAnalysis - Analyse complète du rêve
 * @param {Array} conversationHistory - Historique de conversation
 * @param {string} userMessage - Message de l'utilisateur
 * @returns {Object} { response, model }
 */
export async function callNoctaliaeChat(dreamTranscription, dreamAnalysis, conversationHistory, userMessage) {
  try {
    console.log('🎙️ Appel NoctaliaeChat (Claude Sonnet 4)...');

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.noctaliaeChat}`,
      {
        userMessage,
        dreamAnalysis,
        dreamTranscription,
        conversationHistory
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('✅ NoctaliaeChat réponse reçue');
    return {
      response: response.data.response,
      model: response.data.model || 'claude-sonnet-4'
    };

  } catch (error) {
    console.error('❌ Erreur NoctaliaeChat:', error);
    throw new Error(error.response?.data?.error || 'Erreur NoctaliaeChat');
  }
}

/**
 * 🌙 NoctaliaeAI+ - Analyse approfondie avec Gemini 2.0 Flash
 * 
 * @param {string} dreamTranscription - Transcription originale du rêve
 * @param {string} dreamAnalysis - Analyse complète du rêve
 * @param {Array} conversationHistory - Historique de conversation
 * @param {string} userMessage - Message de l'utilisateur
 * @returns {Object} { response }
 */
export async function callNoctaliaeAssistant(dreamTranscription, dreamAnalysis, conversationHistory, userMessage) {
  try {
    console.log('🌙 Appel NoctaliaeAI+ (Gemini)...');

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.noctaliaeAssistant}`,
      {
        message: userMessage,
        dreamAnalysis,
        dreamTranscription,
        conversationHistory
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('✅ NoctaliaeAI+ réponse reçue');
    return {
      response: response.data.response
    };

  } catch (error) {
    console.error('❌ Erreur NoctaliaeAI+:', error);
    throw new Error(error.response?.data?.error || 'Erreur NoctaliaeAI+');
  }
}

/**
 * 🎙️ Envoie un message vocal à l'assistant (2 appels séparés)
 * 1. Transcription audio via /transcribe
 * 2. Génération réponse + TTS via /voice-chat-text
 * 
 * @param {string} audioUri - URI du fichier audio enregistré
 * @param {string} dreamId - ID du rêve
 * @param {string} dreamTranscription - Transcription ORIGINALE du rêve
 * @param {string} dreamAnalysis - Analyse complète du rêve
 * @param {Array} conversationHistory - Historique de la conversation
 * @returns {Object} { userTranscription, textResponse, audioUrl }
 */
export async function sendVoiceMessage(audioUri, dreamId, dreamTranscription, dreamAnalysis, conversationHistory) {
  try {
    console.log('🎙️ [1/2] Transcription audio...');

    // 1️⃣ APPEL SÉPARÉ : Transcription via /transcribe
    const userTranscription = await transcribeAudio(audioUri);
    console.log('✅ Transcription:', userTranscription.substring(0, 50) + '...');

    // 2️⃣ APPEL SÉPARÉ : Génération réponse + TTS (sans audio)
    console.log('🎙️ [2/2] Génération réponse vocale...');
    
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await axios.post(
      `${API_BASE_URL}/voice-chat-text`,
      {
        userMessage: userTranscription,
        dreamTranscription: dreamTranscription,  // 🆕 AJOUTÉ - Transcription originale du rêve
        dreamAnalysis: dreamAnalysis,
        conversationHistory: formattedHistory
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 45000, // 45s timeout (Claude + TTS seulement)
      }
    );

    console.log('✅ Réponse vocale reçue');

    return {
      userTranscription: userTranscription,
      textResponse: response.data.textResponse,
      audioUrl: response.data.audioUrl,
      timestamp: response.data.timestamp
    };

  } catch (error) {
    console.error('❌ Erreur sendVoiceMessage:', error);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
      throw new Error(error.response.data?.error || error.response.data?.details || 'Erreur backend');
    } else if (error.request) {
      throw new Error('Pas de réponse du serveur. Vérifiez votre connexion.');
    } else {
      throw new Error(error.message || 'Erreur lors de l\'envoi du message vocal');
    }
  }
}