/**
 * 🎯 FREE TIER SERVICE - Compteurs d'utilisation gratuite
 * 
 * Limites free tier :
 * - 5 analyses DeepDream (Claude) gratuites → puis prompt vers Ko-fi
 * - 5 images Gemini gratuites → puis images génériques
 * 
 * Stockage : AsyncStorage (côté app)
 * Les compteurs persistent entre les sessions.
 * Les supporters (premium) n'ont PAS de limites.
 * 
 * 🤝 TRUST_MODE = true → pas de paywall tant que < 100 users
 * Passer à false pour réactiver les limites Ko-fi.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { premiumService } from './premiumService';

// ============================================
// 🤝 TRUST MODE — accès illimité tant que < 100 users
// Passer à false pour réactiver le paywall Ko-fi
// ============================================
const TRUST_MODE = false;

// ============================================
// CONSTANTES
// ============================================
const DEEPDREAM_COUNT_KEY = '@noctaliae_free_deepdream_count';
const GEMINI_IMAGE_COUNT_KEY = '@noctaliae_free_gemini_image_count';
// Clé journalière : @noctaliae_quick_count_YYYY-MM-DD → reset automatique le lendemain
const getQuickDreamKeyForToday = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `@noctaliae_quick_count_${ymd}`;
};

const FREE_DEEPDREAM_LIMIT = 5;
const FREE_GEMINI_IMAGE_LIMIT = 5;
const FREE_QUICKDREAM_DAILY_LIMIT = 10;

// ============================================
// 🧠 DEEPDREAM (CLAUDE) COUNTER
// ============================================

/**
 * Vérifier si l'utilisateur peut encore utiliser DeepDream gratuitement
 * @returns {{ allowed: boolean, count: number, limit: number, remaining: number }}
 */
async function checkDeepDreamAllowance() {
  try {
    if (TRUST_MODE) return { allowed: true, count: 0, limit: Infinity, remaining: Infinity, isPremium: true };
    // Les supporters n'ont PAS de limite
    const isPremium = await premiumService.isPremium();
    if (isPremium) {
      return { allowed: true, count: 0, limit: Infinity, remaining: Infinity, isPremium: true };
    }

    const stored = await AsyncStorage.getItem(DEEPDREAM_COUNT_KEY);
    const count = stored ? parseInt(stored, 10) : 0;
    const remaining = Math.max(0, FREE_DEEPDREAM_LIMIT - count);
    
    return {
      allowed: count < FREE_DEEPDREAM_LIMIT,
      count,
      limit: FREE_DEEPDREAM_LIMIT,
      remaining,
      isPremium: false,
    };
  } catch (error) {
    console.error('❌ Erreur check DeepDream allowance:', error);
    return { allowed: true, count: 0, limit: FREE_DEEPDREAM_LIMIT, remaining: FREE_DEEPDREAM_LIMIT, isPremium: false };
  }
}

/**
 * Incrémenter le compteur DeepDream après une analyse réussie
 */
async function incrementDeepDreamCount() {
  try {
    const isPremium = await premiumService.isPremium();
    if (isPremium) return; // Pas de compteur pour les supporters

    const stored = await AsyncStorage.getItem(DEEPDREAM_COUNT_KEY);
    const count = stored ? parseInt(stored, 10) : 0;
    await AsyncStorage.setItem(DEEPDREAM_COUNT_KEY, String(count + 1));
    console.log(`🧠 DeepDream free: ${count + 1}/${FREE_DEEPDREAM_LIMIT}`);
  } catch (error) {
    console.error('❌ Erreur increment DeepDream:', error);
  }
}

/**
 * Obtenir le nombre d'analyses DeepDream restantes
 */
async function getDeepDreamRemaining() {
  const { remaining, isPremium } = await checkDeepDreamAllowance();
  if (isPremium) return Infinity;
  return remaining;
}

// ============================================
// 🎨 GEMINI IMAGE COUNTER
// ============================================

/**
 * Vérifier si l'utilisateur peut encore générer des images Gemini
 * @returns {{ allowed: boolean, count: number, limit: number, remaining: number }}
 */
async function checkImageAllowance() {
  try {
    if (TRUST_MODE) return { allowed: true, count: 0, limit: Infinity, remaining: Infinity, isPremium: true };
    const isPremium = await premiumService.isPremium();
    if (isPremium) {
      return { allowed: true, count: 0, limit: Infinity, remaining: Infinity, isPremium: true };
    }

    const stored = await AsyncStorage.getItem(GEMINI_IMAGE_COUNT_KEY);
    const count = stored ? parseInt(stored, 10) : 0;
    const remaining = Math.max(0, FREE_GEMINI_IMAGE_LIMIT - count);
    
    return {
      allowed: count < FREE_GEMINI_IMAGE_LIMIT,
      count,
      limit: FREE_GEMINI_IMAGE_LIMIT,
      remaining,
      isPremium: false,
    };
  } catch (error) {
    console.error('❌ Erreur check Image allowance:', error);
    return { allowed: true, count: 0, limit: FREE_GEMINI_IMAGE_LIMIT, remaining: FREE_GEMINI_IMAGE_LIMIT, isPremium: false };
  }
}

/**
 * Incrémenter le compteur images Gemini après une génération réussie
 */
async function incrementImageCount() {
  try {
    const isPremium = await premiumService.isPremium();
    if (isPremium) return;

    const stored = await AsyncStorage.getItem(GEMINI_IMAGE_COUNT_KEY);
    const count = stored ? parseInt(stored, 10) : 0;
    await AsyncStorage.setItem(GEMINI_IMAGE_COUNT_KEY, String(count + 1));
    console.log(`🎨 Gemini free: ${count + 1}/${FREE_GEMINI_IMAGE_LIMIT}`);
  } catch (error) {
    console.error('❌ Erreur increment Image:', error);
  }
}

// ============================================
// ⚡ QUICKDREAM DAILY COUNTER
// ============================================

/**
 * Vérifier si l'utilisateur peut encore utiliser QuickDream aujourd'hui
 * @returns {{ allowed: boolean, count: number, limit: number, remaining: number }}
 */
async function checkQuickDreamAllowance() {
  try {
    if (TRUST_MODE) return { allowed: true, count: 0, limit: Infinity, remaining: Infinity, isPremium: true };
    const isPremium = await premiumService.isPremium();
    if (isPremium) {
      return { allowed: true, count: 0, limit: Infinity, remaining: Infinity, isPremium: true };
    }
    const key = getQuickDreamKeyForToday();
    const stored = await AsyncStorage.getItem(key);
    const count = stored ? parseInt(stored, 10) : 0;
    const remaining = Math.max(0, FREE_QUICKDREAM_DAILY_LIMIT - count);
    return {
      allowed: count < FREE_QUICKDREAM_DAILY_LIMIT,
      count,
      limit: FREE_QUICKDREAM_DAILY_LIMIT,
      remaining,
      isPremium: false,
    };
  } catch (error) {
    console.error('❌ Erreur check QuickDream allowance:', error);
    return { allowed: true, count: 0, limit: FREE_QUICKDREAM_DAILY_LIMIT, remaining: FREE_QUICKDREAM_DAILY_LIMIT, isPremium: false };
  }
}

/**
 * Incrémenter le compteur QuickDream du jour
 */
async function incrementQuickDreamCount() {
  try {
    const isPremium = await premiumService.isPremium();
    if (isPremium) return;
    const key = getQuickDreamKeyForToday();
    const stored = await AsyncStorage.getItem(key);
    const count = stored ? parseInt(stored, 10) : 0;
    await AsyncStorage.setItem(key, String(count + 1));
    console.log(`⚡ QuickDream today: ${count + 1}/${FREE_QUICKDREAM_DAILY_LIMIT}`);
  } catch (error) {
    console.error('❌ Erreur increment QuickDream:', error);
  }
}

/**
 * Obtenir le nombre de QuickDream restants aujourd'hui
 */
async function getQuickDreamRemainingToday() {
  const { remaining, isPremium } = await checkQuickDreamAllowance();
  if (isPremium) return Infinity;
  return remaining;
}

// ============================================
// 🔄 RESET (pour tests / après achat)
// ============================================

/**
 * Reset tous les compteurs (après achat Ko-fi par ex.)
 */
async function resetAllCounters() {
  try {
    await AsyncStorage.multiRemove([DEEPDREAM_COUNT_KEY, GEMINI_IMAGE_COUNT_KEY]);
    console.log('🔄 Compteurs free tier réinitialisés');
  } catch (error) {
    console.error('❌ Erreur reset compteurs:', error);
  }
}

/**
 * Obtenir un résumé complet du free tier
 */
async function getFreeTierStatus() {
  const deepDream = await checkDeepDreamAllowance();
  const images = await checkImageAllowance();
  
  return {
    deepDream,
    images,
    isPremium: deepDream.isPremium,
  };
}

// ============================================
// EXPORTS
// ============================================
export const freeTierService = {
  // DeepDream
  checkDeepDreamAllowance,
  incrementDeepDreamCount,
  getDeepDreamRemaining,
  
  // Images
  checkImageAllowance,
  incrementImageCount,
  
  // QuickDream daily
  checkQuickDreamAllowance,
  incrementQuickDreamCount,
  getQuickDreamRemainingToday,

  // Utils
  resetAllCounters,
  getFreeTierStatus,
  
  // Constantes
  FREE_DEEPDREAM_LIMIT,
  FREE_GEMINI_IMAGE_LIMIT,
  FREE_QUICKDREAM_DAILY_LIMIT,
};
