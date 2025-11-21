/**
 * 🔒 Secure Storage Service
 * Stockage chiffré pour données sensibles via expo-secure-store
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés pour le stockage sécurisé
const SECURE_KEYS = {
  KEEP_AUDIO: 'secure_keep_audio',
  PREMIUM_MODE: 'secure_premium_mode',
  PREMIUM_EXPIRY: 'secure_premium_expiry',
};

export const secureStorageService = {
  /**
   * Sauvegarder une valeur de façon sécurisée
   * @param {string} key - Clé de stockage
   * @param {string} value - Valeur à stocker
   */
  async setItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
      console.log(`🔒 Stockage sécurisé: ${key}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur stockage sécurisé:', error);
      // Fallback vers AsyncStorage si échec
      await AsyncStorage.setItem(key, value);
      return false;
    }
  },

  /**
   * Récupérer une valeur sécurisée
   * @param {string} key - Clé de stockage
   * @returns {Promise<string|null>}
   */
  async getItem(key) {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error('❌ Erreur lecture sécurisée:', error);
      // Fallback vers AsyncStorage si échec
      return await AsyncStorage.getItem(key);
    }
  },

  /**
   * Supprimer une valeur sécurisée
   * @param {string} key - Clé de stockage
   */
  async deleteItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log(`🗑️ Suppression sécurisée: ${key}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression sécurisée:', error);
      await AsyncStorage.removeItem(key);
      return false;
    }
  },

  // ═══════════════════════════════════════════════════════════
  // MÉTHODES SPÉCIFIQUES POUR NOCTALIÆ
  // ═══════════════════════════════════════════════════════════

  /**
   * Sauvegarder la préférence "Conserver les audios"
   * @param {boolean} keepAudio
   */
  async setKeepAudio(keepAudio) {
    await this.setItem(SECURE_KEYS.KEEP_AUDIO, keepAudio.toString());
  },

  /**
   * Récupérer la préférence "Conserver les audios"
   * @returns {Promise<boolean>}
   */
  async getKeepAudio() {
    const value = await this.getItem(SECURE_KEYS.KEEP_AUDIO);
    // Par défaut : true (on garde les audios)
    return value === null ? true : value === 'true';
  },

  /**
   * Sauvegarder le statut Premium
   * @param {boolean} isPremium
   * @param {string|null} expiryDate - Date d'expiration (ISO string)
   */
  async setPremiumStatus(isPremium, expiryDate = null) {
    await this.setItem(SECURE_KEYS.PREMIUM_MODE, isPremium.toString());
    if (expiryDate) {
      await this.setItem(SECURE_KEYS.PREMIUM_EXPIRY, expiryDate);
    }
  },

  /**
   * Récupérer le statut Premium
   * @returns {Promise<{isPremium: boolean, expiryDate: string|null}>}
   */
  async getPremiumStatus() {
    const isPremium = await this.getItem(SECURE_KEYS.PREMIUM_MODE);
    const expiryDate = await this.getItem(SECURE_KEYS.PREMIUM_EXPIRY);
    
    return {
      isPremium: isPremium === 'true',
      expiryDate: expiryDate
    };
  },

  /**
   * Migration : Transférer les données d'AsyncStorage vers SecureStore
   */
  async migrateFromAsyncStorage() {
    try {
      console.log('🔄 Migration vers stockage sécurisé...');
      
      // Migrer la préférence audio
      const oldKeepAudio = await AsyncStorage.getItem('@noctaliae_keep_audio');
      if (oldKeepAudio !== null) {
        await this.setKeepAudio(oldKeepAudio === 'true');
        await AsyncStorage.removeItem('@noctaliae_keep_audio');
        console.log('✅ Préférence audio migrée');
      }

      // Migrer le statut Premium
      const oldPremium = await AsyncStorage.getItem('@noctaliae_premium');
      if (oldPremium !== null) {
        await this.setPremiumStatus(oldPremium === 'true');
        await AsyncStorage.removeItem('@noctaliae_premium');
        console.log('✅ Statut Premium migré');
      }

      console.log('✅ Migration terminée');
      return true;
    } catch (error) {
      console.error('❌ Erreur migration:', error);
      return false;
    }
  }
};
