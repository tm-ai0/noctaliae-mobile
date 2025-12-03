// ============================================
// 🔒 SERVICE D'AUTHENTIFICATION PAR TOKEN OPAQUE
// ============================================
// src/services/authTokenService.js

import * as SecureStore from 'expo-secure-store';

// ============================================
// 🔑 CONFIGURATION
// ============================================

const TOKEN_KEY = 'noctaliae_api_token';

// 🔧 TON TOKEN DÉVELOPPEUR (à garder secret!)
const DEFAULT_DEV_TOKEN = 'tok_dev_thomas_2025_main';

// ============================================
// 📦 FONCTIONS DE GESTION DU TOKEN
// ============================================

/**
 * Récupérer le token stocké (ou initialiser avec le token dev)
 */
export const getAuthHeaders = async () => {
  try {
    let token = await SecureStore.getItemAsync(TOKEN_KEY);
    
    if (!token) {
      console.log('🔑 Première utilisation - Initialisation du token dev');
      token = DEFAULT_DEV_TOKEN;
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    
    return {
      'x-api-token': token,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du token:', error);
    return {
      'x-api-token': DEFAULT_DEV_TOKEN,
      'Content-Type': 'application/json'
    };
  }
};

/**
 * Gérer les erreurs de token (limite atteinte, token invalide, etc.)
 */
export const handleTokenError = (error) => {
  if (!error) return null;
  
  if (error.status === 401) {
    console.error('🚫 Token invalide détecté');
    return { 
      type: 'INVALID_TOKEN', 
      message: 'Token d\'API invalide. Veuillez contacter le support.' 
    };
  }
  
  if (error.status === 403) {
    console.error('🚫 Token révoqué détecté');
    return { 
      type: 'REVOKED_TOKEN', 
      message: 'Votre accès a été révoqué. Veuillez contacter le support.' 
    };
  }
  
  if (error.status === 429) {
    console.error('⚠️ Limite d\'utilisation atteinte');
    return { 
      type: 'RATE_LIMIT', 
      message: 'Limite d\'utilisation atteinte. Veuillez réessayer plus tard.' 
    };
  }
  
  return null;
};