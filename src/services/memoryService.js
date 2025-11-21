import AsyncStorage from '@react-native-async-storage/async-storage';

const MEMORY_KEY = '@noctaliae_user_memory';

// Système de mémoire utilisateur inspiré d'OMI
export const memoryService = {
  // Sauvegarder une information dans la mémoire
  async saveMemory(key, value) {
    try {
      const memory = await this.getAllMemory();
      memory[key] = {
        value,
        timestamp: Date.now(),
        date: new Date().toISOString()
      };
      await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
      console.log('✅ Mémoire sauvegardée:', key);
    } catch (error) {
      console.error('❌ Erreur sauvegarde mémoire:', error);
    }
  },

  // Récupérer une information spécifique
  async getMemory(key) {
    try {
      const memory = await this.getAllMemory();
      return memory[key] || null;
    } catch (error) {
      console.error('❌ Erreur lecture mémoire:', error);
      return null;
    }
  },

  // Récupérer toute la mémoire
  async getAllMemory() {
    try {
      const data = await AsyncStorage.getItem(MEMORY_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('❌ Erreur lecture mémoire complète:', error);
      return {};
    }
  },

  // Supprimer une information
  async deleteMemory(key) {
    try {
      const memory = await this.getAllMemory();
      delete memory[key];
      await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
      console.log('✅ Mémoire supprimée:', key);
    } catch (error) {
      console.error('❌ Erreur suppression mémoire:', error);
    }
  },

  // Effacer toute la mémoire
  async clearAllMemory() {
    try {
      await AsyncStorage.removeItem(MEMORY_KEY);
      console.log('✅ Toute la mémoire effacée');
    } catch (error) {
      console.error('❌ Erreur effacement mémoire:', error);
    }
  },

  // Obtenir le contexte pour l'analyse (résumé mémoire)
  async getContextForAnalysis() {
    try {
      const memory = await this.getAllMemory();
      const context = [];
      
      // Construire un contexte textuel
      for (const [key, data] of Object.entries(memory)) {
        context.push(`${key}: ${data.value}`);
      }
      
      return context.join('\n');
    } catch (error) {
      console.error('❌ Erreur contexte:', error);
      return '';
    }
  }
};
