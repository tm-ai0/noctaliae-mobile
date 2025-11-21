/**
 * 💎 Premium Service
 * Gestion du statut Premium de l'utilisateur
 * Utilise expo-secure-store pour le stockage chiffré
 */

import { secureStorageService } from './secureStorageService';

export const premiumService = {
  async isPremium() {
    try {
      const { isPremium, expiryDate } = await secureStorageService.getPremiumStatus();
      
      if (!expiryDate) {
        return isPremium;
      }
      
      const now = new Date();
      const expiry = new Date(expiryDate);
      
      if (now > expiry) {
        console.log('⏰ Premium expiré');
        await this.setPremium(false);
        return false;
      }
      
      return isPremium;
    } catch (error) {
      console.error('❌ Erreur vérification Premium:', error);
      return false;
    }
  },

  async setPremium(enabled, expiryDate = null) {
    try {
      const expiryString = expiryDate ? expiryDate.toISOString() : null;
      await secureStorageService.setPremiumStatus(enabled, expiryString);
      console.log(enabled ? '🌕 Mode Premium activé' : '🌑 Mode Premium désactivé');
      
      if (expiryDate) {
        console.log(`⏰ Expiration: ${expiryDate.toLocaleDateString('fr-FR')}`);
      }
    } catch (error) {
      console.error('❌ Erreur activation Premium:', error);
    }
  },

  async getExpiryDate() {
    try {
      const { expiryDate } = await secureStorageService.getPremiumStatus();
      return expiryDate ? new Date(expiryDate) : null;
    } catch (error) {
      console.error('❌ Erreur lecture expiration:', error);
      return null;
    }
  }
};