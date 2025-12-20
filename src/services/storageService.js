import AsyncStorage from '@react-native-async-storage/async-storage';

const DREAMS_KEY = '@noctaliae_dreams';

// Sauvegarder un nouveau rêve
export async function saveDream(audioUri, transcription = '') {
  try {
    const dreams = await getAllDreams();
    
    const newDream = {
      id: Date.now().toString(),
      audioUri: audioUri,
      transcription: transcription,
      date: new Date().toISOString(),
      title: `Rêve du ${new Date().toLocaleDateString('fr-FR')}`,
    };
    
    dreams.unshift(newDream);
    await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
    
    return newDream;
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    throw error;
  }
}

// Récupérer tous les rêves
export async function getAllDreams() {
  try {
    const data = await AsyncStorage.getItem(DREAMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur récupération:', error);
    return [];
  }
}

// Récupérer un rêve par ID
export async function getDream(id) {
  try {
    const dreams = await getAllDreams();
    return dreams.find(d => d.id === id) || null;
  } catch (error) {
    console.error('Erreur récupération rêve:', error);
    return null;
  }
}

// Archiver un rêve (30 jours)
export async function archiveDream(id) {
  try {
    const dreams = await getAllDreams();
    const dreamIndex = dreams.findIndex(d => d.id === id);
    
    if (dreamIndex !== -1) {
      dreams[dreamIndex].archived = true;
      dreams[dreamIndex].archivedAt = new Date().toISOString();
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
    }
  } catch (error) {
    console.error('Erreur archivage:', error);
    throw error;
  }
}

// Restaurer un rêve archivé
export async function restoreDream(id) {
  try {
    const dreams = await getAllDreams();
    const dreamIndex = dreams.findIndex(d => d.id === id);
    
    if (dreamIndex !== -1) {
      dreams[dreamIndex].archived = false;
      dreams[dreamIndex].archivedAt = null;
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
    }
  } catch (error) {
    console.error('Erreur restauration:', error);
    throw error;
  }
}

// Supprimer définitivement un rêve
export async function deleteDream(id) {
  try {
    const dreams = await getAllDreams();
    const filtered = dreams.filter(dream => dream.id !== id);
    await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Erreur suppression:', error);
    throw error;
  }
}

// 🔐 Marquer un rêve comme secret
export async function setDreamSecret(id, isSecret = true) {
  try {
    const dreams = await getAllDreams();
    const dreamIndex = dreams.findIndex(d => d.id === id);
    
    if (dreamIndex !== -1) {
      dreams[dreamIndex].isSecret = isSecret;
      dreams[dreamIndex].secretAt = isSecret ? new Date().toISOString() : null;
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
    }
  } catch (error) {
    console.error('Erreur marquage secret:', error);
    throw error;
  }
}

// 🔓 Retirer le statut secret d'un rêve
export async function removeDreamSecret(id) {
  return setDreamSecret(id, false);
}

// Nettoyer les archives expirées (30 jours)
export async function cleanExpiredArchives() {
  try {
    const dreams = await getAllDreams();
    const now = new Date();
    
    const filtered = dreams.filter(dream => {
      if (!dream.archived) return true;
      
      const archivedDate = new Date(dream.archivedAt);
      const daysSinceArchived = (now - archivedDate) / (1000 * 60 * 60 * 24);
      
      return daysSinceArchived < 30;
    });
    
    await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(filtered));
    console.log('✅ Archives expirées nettoyées');
  } catch (error) {
    console.error('Erreur nettoyage archives:', error);
  }
}

// Sauvegarder la transcription d'un rêve
export async function saveTranscription(dreamId, transcription) {
  try {
    const dreams = await getAllDreams();
    const dreamIndex = dreams.findIndex(d => d.id === dreamId);
    
    if (dreamIndex !== -1) {
      dreams[dreamIndex].transcription = transcription;
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
    }
  } catch (error) {
    console.error('Erreur sauvegarde transcription:', error);
    throw error;
  }
}

// Sauvegarder l'analyse d'un rêve + métadonnées
export async function saveAnalysis(dreamId, analysisData, modelUsed = 'llama') {
  try {
    const dreams = await getAllDreams();
    const dreamIndex = dreams.findIndex(d => d.id === dreamId);
    
    if (dreamIndex !== -1) {
      // Si analysisData est un string (ancien format)
      if (typeof analysisData === 'string') {
        dreams[dreamIndex].analysis = analysisData;
      } else {
        // Nouveau format avec métadonnées (backend v2.3+)
        dreams[dreamIndex].analysis = analysisData.analysis || analysisData;
        dreams[dreamIndex].emoji = analysisData.emoji; // 🆕
        dreams[dreamIndex].dreamTitle = analysisData.title; // 🆕
        dreams[dreamIndex].tags = analysisData.tags; // 🆕
        dreams[dreamIndex].suggestedQuestions = analysisData.suggestedQuestions; // 🆕
        
        // Override le titre générique si on a un titre IA
        if (analysisData.title && analysisData.title !== 'Rêve sans titre') {
          dreams[dreamIndex].title = analysisData.title;
        }
      }
      
      dreams[dreamIndex].analyzedAt = new Date().toISOString();
      dreams[dreamIndex].modelUsed = modelUsed; // claude ou llama
      dreams[dreamIndex].isPremium = modelUsed === 'claude';
      
      // Supprimer l'audioUri pour économiser de l'espace
      dreams[dreamIndex].audioUri = null;
      
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
    }
  } catch (error) {
    console.error('Erreur sauvegarde analyse:', error);
    throw error;
  }
}

