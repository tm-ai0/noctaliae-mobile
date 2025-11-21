import AsyncStorage from '@react-native-async-storage/async-storage';

const CONVERSATIONS_KEY = '@noctaliae_conversations';

/**
 * Sauvegarde une conversation pour un rêve spécifique
 * @param {string} dreamId - ID du rêve
 * @param {Array} messages - Tableau des messages
 * @param {string} dreamTitle - Titre du rêve
 */
export async function saveConversation(dreamId, messages, dreamTitle) {
  try {
    // Charger toutes les conversations existantes
    const allConversations = await getAllConversations();
    
    // Mettre à jour la conversation pour ce rêve
    allConversations[dreamId] = {
      messages: messages,
      lastUpdate: Date.now(),
      dreamTitle: dreamTitle
    };
    
    // Sauvegarder
    await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(allConversations));
    
    console.log(`✅ Conversation sauvegardée pour rêve ${dreamId}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur saveConversation:', error);
    return false;
  }
}

/**
 * Charge une conversation pour un rêve spécifique
 * @param {string} dreamId - ID du rêve
 * @returns {Array|null} - Messages ou null si aucune conversation
 */
export async function loadConversation(dreamId) {
  try {
    const allConversations = await getAllConversations();
    
    if (allConversations[dreamId]) {
      console.log(`✅ Conversation chargée pour rêve ${dreamId}`);
      return allConversations[dreamId].messages;
    }
    
    console.log(`ℹ️ Aucune conversation trouvée pour rêve ${dreamId}`);
    return null;
  } catch (error) {
    console.error('❌ Erreur loadConversation:', error);
    return null;
  }
}

/**
 * Supprime une conversation pour un rêve spécifique
 * @param {string} dreamId - ID du rêve
 */
export async function clearConversation(dreamId) {
  try {
    const allConversations = await getAllConversations();
    
    if (allConversations[dreamId]) {
      delete allConversations[dreamId];
      await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(allConversations));
      console.log(`✅ Conversation effacée pour rêve ${dreamId}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erreur clearConversation:', error);
    return false;
  }
}

/**
 * Récupère toutes les conversations
 * @returns {Object} - Objet avec toutes les conversations
 */
async function getAllConversations() {
  try {
    const data = await AsyncStorage.getItem(CONVERSATIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('❌ Erreur getAllConversations:', error);
    return {};
  }
}

/**
 * Compte le nombre total de conversations sauvegardées
 * @returns {number}
 */
export async function getConversationCount() {
  try {
    const allConversations = await getAllConversations();
    return Object.keys(allConversations).length;
  } catch (error) {
    console.error('❌ Erreur getConversationCount:', error);
    return 0;
  }
}

/**
 * Supprime toutes les conversations (pour debug/reset)
 */
export async function clearAllConversations() {
  try {
    await AsyncStorage.removeItem(CONVERSATIONS_KEY);
    console.log('✅ Toutes les conversations effacées');
    return true;
  } catch (error) {
    console.error('❌ Erreur clearAllConversations:', error);
    return false;
  }
}
