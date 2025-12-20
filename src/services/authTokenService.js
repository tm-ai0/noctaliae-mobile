// ============================================
// 🔒 SERVICE D'AUTHENTIFICATION PAR TOKEN OPAQUE
// ============================================
// src/services/authTokenService.js

import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// 📱 Récupérer la version de l'app
const getAppVersion = () => {
  return Constants.expoConfig?.version || Constants.manifest?.version || '0.0.0';
};

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
      'Content-Type': 'application/json',
      'X-App-Version': getAppVersion() // 📱 Envoie la version pour le kill switch
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du token:', error);
    return {
      'x-api-token': DEFAULT_DEV_TOKEN,
      'Content-Type': 'application/json',
      'X-App-Version': getAppVersion() // 📱 Envoie la version pour le kill switch
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
  
  // 🆕 426 = Mise à jour requise (version trop ancienne)
  if (error.status === 426) {
    console.error('🚨 Mise à jour requise - version trop ancienne');
    return { 
      type: 'UPDATE_REQUIRED', 
      message: error.data?.message || 'Nouvelle version disponible !\n\nTélécharge-la sur :\nhttps://nocty.thomasmaury.fr',
      downloadUrl: error.data?.downloadUrl || 'https://nocty.thomasmaury.fr'
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