import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { premiumService } from './premiumService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthHeaders, handleTokenError } from './authTokenService';
import { freeTierService } from './freeTierService';
import { getDeviceId } from './deviceIdService';

const FINGERPRINTS_KEY = '@noctaliae_user_fingerprints';

export async function checkBackendHealth() {
  try {
    console.log('🔍 Test connexion backend:', API_BASE_URL);
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.health}`, {
      headers,
      timeout: 5000,
    });
    console.log('✅ Backend répond:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Backend inaccessible:', error.message);
    handleTokenError(error.response);
    return null;
  }
}

// 🆕 Fonction pour obtenir le bon endpoint selon le mode Premium
async function getAnalyzeEndpoint() {
  const isPremium = await premiumService.isPremium();
  
  if (isPremium) {
    console.log('⭐ Mode Premium - Utilisation de Claude Sonnet 4.5');
    return API_ENDPOINTS.analyze;
  } else {
    console.log('🆓 Mode Gratuit - Utilisation de Llama 3.3 70B');
    return API_ENDPOINTS.analyzeFree;
  }
}

// 🆕 Fonction helper pour charger les empreintes
async function loadUserFingerprints() {
  try {
    const stored = await AsyncStorage.getItem(FINGERPRINTS_KEY);
    if (stored) {
      const fingerprints = JSON.parse(stored);
      return fingerprints.map(f => f.text);
    }
    return [];
  } catch (error) {
    console.error('❌ Erreur chargement empreintes:', error);
    return [];
  }
}

// Analyser un rêve depuis du texte
// useClaude : quel moteur/endpoint utiliser (true pour DeepDream, y compris les taste tests gratuits)
// realIsPremium : statut premium réel de l'utilisateur, envoyé au backend pour le suivi/rate limiting
//   (distinct de useClaude : un utilisateur gratuit qui consomme un taste test utilise Claude sans être premium)
export async function analyzeDreamFromText(dreamText, useClaude = false, dreamMetadata = null, realIsPremium = useClaude) {
  try {
    console.log('📤 Envoi du rêve pour analyse');

    const userFingerprints = await loadUserFingerprints();
    if (userFingerprints.length >= 3) {
      console.log(`👣 ${userFingerprints.length} empreintes chargées`);
    } else {
      console.log('⚠️ Moins de 3 empreintes, analyse standard');
    }

    const endpoint = useClaude ? API_ENDPOINTS.analyze : API_ENDPOINTS.analyzeFree;
    const headers = await getAuthHeaders();
    const deviceId = await getDeviceId();

    // 🩺 DEBUG TEMPORAIRE — confirme la config réseau réellement utilisée
    // (endpoint + timeout) au moment de l'appel, pour écarter tout bundle
    // JS obsolète ou chemin de code parallèle.
    console.log('🩺 [DIAG] axios.post config:', {
      url: `${API_BASE_URL}${endpoint}`,
      timeout: 60000,
      textLength: dreamText.length,
    });

    const response = await axios.post(
      `${API_BASE_URL}${endpoint}`,
      {
        transcript: dreamText,
        userFingerprints: userFingerprints,
        isPremium: realIsPremium,
        dreamMetadata: dreamMetadata,  // 🌙 Métadonnées optionnelles (lucidité, qualité, émotions, thèmes)
        deviceId,
      },
      {
        headers,
        // 60s (comme generateDreamImage) : 30s coupait prématurément l'analyse
        // DeepDream (Claude Sonnet 4) sur les rêves longs, Claude ayant plus de
        // texte à générer (analyse + titre + tags + palette + prompt image).
        timeout: 60000,
      }
    );

    console.log('✅ Analyse reçue');
    console.log('📦 Backend response:', {
      emoji: response.data.emoji,
      title: response.data.title,
      tags: response.data.tags,
      hasAnalysis: !!response.data.analysis
    });
    
    const limitInfo = response.data.limitInfo || null;
    if (limitInfo && limitInfo.limited) {
      console.log('⚠️ Limite atteinte:', limitInfo.message);
    }

    // Le backend répond parfois 200 avec analysis: null quand la limite est atteinte
    // (pas d'erreur HTTP) — sans ce garde-fou, l'app affiche un échec générique
    // ou enregistre un rêve sans analyse au lieu du message de limite.
    if (!response.data.analysis) {
      const err = new Error(limitInfo?.message || 'Limite de rêves atteinte');
      err.code = 'DAILY_LIMIT';
      err.limitInfo = limitInfo;
      throw err;
    }

    return {
      transcription: dreamText,
      analysis: response.data.analysis,
      emoji: response.data.emoji || '💭',
      title: response.data.title || 'Rêve sans titre',
      tags: response.data.tags || [],
      imagePrompt: response.data.imagePrompt || '',
      palette: response.data.palette || ['#00FFB0', '#4F8DFF', '#D2B14C'],
      suggestedQuestions: response.data.suggestedQuestions || [],
      model: response.data.model || (useClaude ? 'claude-sonnet-4' : 'llama-3.3-70b'),
      limitInfo: limitInfo
    };
    
  } catch (error) {
    console.error('❌ Erreur:', error);

    // Erreur déjà qualifiée (DAILY_LIMIT levée ci-dessus pour un 200 sans analysis) — ne pas la ré-emballer
    // ⚠️ Ne pas tester `error.code` seul : axios pose lui-même error.code
    // (ERR_BAD_REQUEST/ERR_BAD_RESPONSE sur tout 4xx/5xx, ERR_NETWORK, ECONNABORTED)
    // sur quasi toutes ses erreurs, ce qui court-circuiterait handleTokenError()
    // et le mapping 429→DAILY_LIMIT juste en dessous.
    if (error.code === 'DAILY_LIMIT') {
      throw error;
    }

    const tokenError = handleTokenError(error.response);
    if (tokenError) {
      throw new Error(tokenError.message);
    }

    // 🚨 Rate limit global (IP) — code spécifique pour fallback QuickDream
    if (error.response?.status === 429) {
      const err = new Error(error.response?.data?.message || 'Limite quotidienne atteinte');
      err.code = 'DAILY_LIMIT';
      throw err;
    }
    
    throw new Error(error.response?.data?.message || 'Erreur d\'analyse');
  }
}

/**
 * Transcrit un fichier audio en texte via Whisper (Groq)
 */
export async function transcribeAudio(audioUri) {
  try {
    console.log('🎤 Début transcription:', audioUri);

    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    console.log('📁 Fichier info:', fileInfo);
    
    if (!fileInfo.exists) {
      throw new Error('Fichier audio introuvable');
    }

    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64',
    });

    console.log('📦 Audio converti en base64:', audioBase64.length, 'chars');
    console.log('📤 Envoi vers le backend...');

    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        audioBase64: audioBase64,
      }),
    });

    console.log('📥 Réponse reçue:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur backend:', data);
      
      const tokenError = handleTokenError({ status: response.status, data });
      if (tokenError) {
        throw new Error(tokenError.message);
      }
      
      throw new Error(data.error || data.details || 'Erreur transcription');
    }

    const transcriptText = data.transcript || data.text;
    console.log('✅ Transcription réussie:', transcriptText.substring(0, 50) + '...');
    
    return transcriptText;

  } catch (error) {
    console.error('❌ Erreur transcription complète:', error);
    throw new Error(`Erreur lors de la transcription audio`);
  }
}

/**
 * 🖼️ Conversation avec IMAGE (Claude Vision)
 */
export async function chatWithDreamAndImage(dreamTranscription, dreamAnalysis, conversationHistory, userMessage, imageBase64) {
  try {
    console.log('🖼️ Envoi message avec image vers Claude Vision...');

    const headers = await getAuthHeaders();

    const response = await axios.post(
      `${API_BASE_URL}/chat-with-image`,
      {
        message: userMessage,
        dreamTranscription: dreamTranscription,
        dreamAnalysis: dreamAnalysis,
        conversation_history: conversationHistory,
        imageBase64: imageBase64
      },
      {
        headers,
        timeout: 60000, // 60s pour Vision (plus lent)
      }
    );

    console.log('✅ Réponse Claude Vision reçue');
    return {
      response: response.data.reply,
      model: 'claude-vision'
    };

  } catch (error) {
    console.error('❌ Erreur Claude Vision:', error);
    
    const tokenError = handleTokenError(error.response);
    if (tokenError) {
      throw new Error(tokenError.message);
    }
    
    throw new Error(error.response?.data?.error || 'Erreur d\'analyse d\'image');
  }
}

/**
 * 📷 Analyse d'une image de carnet/dessin de rêve (Claude Vision)
 * Auto-détecte texte manuscrit ou dessin
 */
export async function analyzeImageDream(imageBase64) {
  try {
    console.log('📷 Envoi image pour analyse de rêve...');

    const userFingerprints = await loadUserFingerprints();
    const headers = await getAuthHeaders();

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.analyzeImage}`,
      {
        imageBase64: imageBase64,
        userFingerprints: userFingerprints
      },
      {
        headers,
        timeout: 90000, // 90s pour Vision + analyse complète
      }
    );

    console.log('✅ Analyse image rêve reçue');
    console.log('📦 Backend response:', {
      type: response.data.type,
      emoji: response.data.emoji,
      title: response.data.title,
      hasTranscription: !!response.data.transcription,
      hasAnalysis: !!response.data.analysis
    });

    return {
      type: response.data.type, // 'text' ou 'drawing'
      transcription: response.data.transcription,
      analysis: response.data.analysis,
      emoji: response.data.emoji || '📷',
      title: response.data.title || 'Rêve capturé',
      tags: response.data.tags || [],
      suggestedQuestions: response.data.suggestedQuestions || [],
      model: 'claude-vision'
    };

  } catch (error) {
    console.error('❌ Erreur analyse image rêve:', error);
    
    const tokenError = handleTokenError(error.response);
    if (tokenError) {
      throw new Error(tokenError.message);
    }
    
    throw new Error(error.response?.data?.error || 'Erreur d\'analyse d\'image');
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

    const headers = await getAuthHeaders();

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.chatText}`,
      {
        message: userMessage,
        dreamTranscription: dreamTranscription,
        dreamAnalysis: dreamAnalysis,
        conversation_history: conversationHistory,
        isPremium: isPremium,
      },
      {
        headers,
        timeout: 30000,
      }
    );

    console.log('✅ Réponse chat reçue');
    return {
      response: response.data.reply,
      model: isPremium ? 'claude' : 'llama'
    };

  } catch (error) {
    console.error('❌ Erreur chat:', error);
    
    const tokenError = handleTokenError(error.response);
    if (tokenError) {
      throw new Error(tokenError.message);
    }
    
    throw new Error(error.response?.data?.error || 'Erreur de conversation');
  }
}

/**
 * 🔊 Synthétise du texte en audio via Google Cloud TTS
 */
export async function synthesizeText(text) {
  try {
    console.log('🔊 Début synthèse vocale:', text.substring(0, 50) + '...');
    
    const headers = await getAuthHeaders();
    
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.synthesize}`,
      {
        text: text
      },
      {
        headers,
        timeout: 30000,
        responseType: 'arraybuffer',
      }
    );
    
    console.log('✅ Audio synthétisé, taille:', response.data.byteLength, 'octets');
    
    const base64Audio = btoa(
      new Uint8Array(response.data)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    return base64Audio;
    
  } catch (error) {
    console.error('❌ Erreur synthèse vocale:', error);
    
    const tokenError = handleTokenError(error.response);
    if (tokenError) {
      throw new Error(tokenError.message);
    }
    
    if (error.response?.status === 429) {
      throw new Error('Trop de requêtes. Limite : 10 par minute. Réessayez dans quelques instants.');
    }
    
    throw new Error(error.response?.data?.error || 'Erreur de synthèse vocale');
  }
}

/**
 * 🎙️ NoctaliaeChat - Chat vocal avec Claude Sonnet 4
 */
export async function callNoctaliaeChat(dreamTranscription, dreamAnalysis, conversationHistory, userMessage) {
  try {
    console.log('🎙️ Appel NoctaliaeChat (Claude Sonnet 4)...');

    const headers = await getAuthHeaders();

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.noctaliaeChat}`,
      {
        userMessage,
        dreamAnalysis,
        dreamTranscription,
        conversationHistory
      },
      {
        headers,
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
    
    const tokenError = handleTokenError(error.response);
    if (tokenError) {
      throw new Error(tokenError.message);
    }
    
    throw new Error(error.response?.data?.error || 'Erreur NoctaliaeChat');
  }
}

/**
 * 🌙 NoctaliaeAI+ - Analyse approfondie avec Gemini 2.0 Flash
 */
export async function callNoctaliaeAssistant(dreamTranscription, dreamAnalysis, conversationHistory, userMessage) {
  try {
    console.log('🌙 Appel NoctaliaeAI+ (Gemini)...');

    const headers = await getAuthHeaders();

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.noctaliaeAssistant}`,
      {
        message: userMessage,
        dreamAnalysis,
        dreamTranscription,
        conversationHistory
      },
      {
        headers,
        timeout: 30000,
      }
    );

    console.log('✅ NoctaliaeAI+ réponse reçue');
    return {
      response: response.data.response
    };

  } catch (error) {
    console.error('❌ Erreur NoctaliaeAI+:', error);
    
    const tokenError = handleTokenError(error.response);
    if (tokenError) {
      throw new Error(tokenError.message);
    }
    
    throw new Error(error.response?.data?.error || 'Erreur NoctaliaeAI+');
  }
}

/**
 * 🎨 Génère un visuel pour un rêve analysé
 * Envoie imagePrompt au backend Gemini, reçoit base64, sauvegarde en fichier local
 * @param {string} imagePrompt - Le prompt de génération (retourné par l'analyse)
 * @param {string} dreamId - ID du rêve (pour nommer le fichier)
 * @param {string} dreamTitle - Titre du rêve
 * @returns {{ imageUrl: string, imagePrompt: string }} ou null si erreur
 */
export async function generateDreamImage(imagePrompt, dreamId, dreamTitle = '') {
  try {
    if (!imagePrompt) {
      console.warn('⚠️ Pas de imagePrompt, skip génération');
      return null;
    }

    console.log('🎨 Génération visuelle du rêve...');
    console.log('🎨 Prompt:', imagePrompt.substring(0, 80) + '...');

    // 🎯 Vérifier la limite free tier AVANT d'appeler Gemini
    const imageAllowance = await freeTierService.checkImageAllowance();
    if (!imageAllowance.allowed) {
      console.log(`🎨 Limite images Gemini atteinte (${imageAllowance.count}/${imageAllowance.limit}) — skip génération`);
      return null; // Pas d'image, la carte s'affichera sans hero
    }

    // 🏧 Envoyer le statut premium au backend pour le free tier tracking
    const isPremiumUser = await premiumService.isPremium();
    const headers = await getAuthHeaders();
    const deviceId = await getDeviceId();

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.generateDreamImage}`,
      {
        imagePrompt,
        dreamTitle,
        isPremium: isPremiumUser,
        deviceId,
      },
      {
        headers,
        timeout: 60000,
      }
    );

    const { imageBase64, mimeType, limited, limitInfo } = response.data;

    // 🏧 Vérifier si limite free tier atteinte
    if (limited || !imageBase64) {
      if (limitInfo?.code === 'IMAGE_LIMIT') {
        console.log(`🏧 Limite images Gemini atteinte (${limitInfo.count}/${limitInfo.limit})`);
      } else {
        console.warn('⚠️ Backend n\'a pas retourné d\'image');
      }
      return null;
    }

    // 💾 Sauvegarder en fichier local persistant
    const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const imageDir = `${FileSystem.documentDirectory}dream-images/`;
    const imagePath = `${imageDir}${dreamId}.${ext}`;

    // Créer le dossier si nécessaire
    const dirInfo = await FileSystem.getInfoAsync(imageDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
    }

    // Écrire le fichier
    await FileSystem.writeAsStringAsync(imagePath, imageBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log(`✅ Image sauvegardée: ${imagePath} (${(imageBase64.length / 1024).toFixed(0)}KB)`);

    // 🎯 Incrémenter le compteur free tier
    await freeTierService.incrementImageCount();

    return {
      imageUrl: imagePath,
      imagePrompt: response.data.prompt || imagePrompt,
    };

  } catch (error) {
    console.error('❌ Erreur génération visuelle:', error);

    const tokenError = handleTokenError(error.response);
    if (tokenError) {
      console.error('🔐 Token error:', tokenError.message);
    }

    // Non-bloquant — le rêve s'affiche sans image
    console.warn('⚠️ Visuel non disponible, fallback placeholder');
    return null;
  }
}

/**
 * 🎙️ Envoie un message vocal à l'assistant
 */
export async function sendVoiceMessage(audioUri, dreamId, dreamTranscription, dreamAnalysis, conversationHistory) {
  try {
    console.log('🎙️ [1/2] Transcription audio...');

    const userTranscription = await transcribeAudio(audioUri);
    console.log('✅ Transcription:', userTranscription.substring(0, 50) + '...');

    console.log('🎙️ [2/2] Génération réponse vocale...');
    
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const headers = await getAuthHeaders();

    const response = await axios.post(
      `${API_BASE_URL}/voice-chat-text`,
      {
        userMessage: userTranscription,
        dreamTranscription: dreamTranscription,
        dreamAnalysis: dreamAnalysis,
        conversationHistory: formattedHistory
      },
      {
        headers,
        timeout: 45000,
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
    
    const tokenError = handleTokenError(error.response);
    if (tokenError) {
      throw new Error(tokenError.message);
    }
    
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