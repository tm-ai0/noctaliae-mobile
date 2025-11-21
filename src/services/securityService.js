/**
 * 🔒 Security Service
 * Gestion des paramètres de sécurité et confidentialité
 * Utilise expo-secure-store pour le stockage chiffré
 */

import { secureStorageService } from './secureStorageService';

export const securityService = {
  async shouldKeepAudio() {
    try {
      return await secureStorageService.getKeepAudio();
    } catch (error) {
      console.error('❌ Erreur lecture préférence audio:', error);
      return true;
    }
  },

  async setKeepAudio(keepAudio) {
    try {
      await secureStorageService.setKeepAudio(keepAudio);
      console.log(keepAudio ? '🔊 Audio conservés' : '🗑️ Audio supprimés après analyse');
    } catch (error) {
      console.error('❌ Erreur sauvegarde préférence audio:', error);
    }
  },

  async deleteAudioIfNeeded(audioUri, FileSystem) {
    try {
      const keepAudio = await this.shouldKeepAudio();
      
      if (!keepAudio && audioUri) {
        console.log('🗑️ Suppression audio post-analyse:', audioUri);
        await FileSystem.deleteAsync(audioUri, { idempotent: true });
        console.log('✅ Audio supprimé');
      } else {
        console.log('💾 Audio conservé pour réécoute');
      }
    } catch (error) {
      console.error('❌ Erreur suppression audio:', error);
    }
  }
};