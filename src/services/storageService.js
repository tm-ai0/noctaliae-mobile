import AsyncStorage from '@react-native-async-storage/async-storage';
import { streakService } from './streakService';
import i18next from 'i18next';

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
      title: i18next.t('common.defaultDreamTitle', { date: new Date().toLocaleDateString(i18next.language) }),
    };
    
    dreams.unshift(newDream);
    await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
    
    // 🔥 Streak — incrémenter à chaque rêve enregistré
    streakService.onDreamRecorded().catch(() => {});

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

// 🎨 Sauvegarder les données visuelles d'un rêve (appelé après génération image)
export async function saveDreamImage(dreamId, imageData) {
  try {
    const dreams = await getAllDreams();
    const dreamIndex = dreams.findIndex(d => d.id === dreamId);
    
    if (dreamIndex !== -1) {
      dreams[dreamIndex].imageUrl = imageData.imageUrl || null;
      dreams[dreamIndex].imagePrompt = imageData.imagePrompt || null;
      dreams[dreamIndex].imagePalette = imageData.palette || [];
      dreams[dreamIndex].imageStyle = imageData.style || null;
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
      console.log('🎨 Visuel sauvegardé pour rêve:', dreamId);
    }
  } catch (error) {
    console.error('Erreur sauvegarde visuel:', error);
    // Pas de throw — on ne bloque pas l'UX pour un visuel
  }
}

// 🌙 Sauvegarder les métadonnées manuelles (lucidité, qualité sommeil, émotions, thèmes)
export async function saveDreamMetadata(dreamId, metadata) {
  try {
    const dreams = await getAllDreams();
    const idx = dreams.findIndex(d => d.id === dreamId);
    if (idx !== -1) {
      if (metadata.lucidity != null)      dreams[idx].lucidity = metadata.lucidity;
      if (metadata.sleepQuality != null)  dreams[idx].sleepQuality = metadata.sleepQuality;
      if (metadata.emotions?.length)      dreams[idx].emotions = metadata.emotions;
      if (metadata.themes?.length)        dreams[idx].themes = metadata.themes;
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
      console.log('🌙 Métadonnées rêve sauvegardées:', dreamId);
    }
  } catch (error) {
    console.error('❌ Erreur sauvegarde métadonnées:', error);
    // Non-bloquant
  }
}

// ⭐ Toggle favori sur un rêve
export async function toggleFavoriteDream(id) {
  try {
    const dreams = await getAllDreams();
    const idx = dreams.findIndex(d => d.id === id);
    if (idx !== -1) {
      dreams[idx].isFavorite = !dreams[idx].isFavorite;
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
      return dreams[idx].isFavorite;
    }
    return false;
  } catch (error) {
    console.error('Erreur toggle favori:', error);
    return false;
  }
}

// 📌 Épingler un rêve (max 1 à la fois — désépingle les autres)
export async function setPinnedDream(id) {
  try {
    const dreams = await getAllDreams();
    const idx = dreams.findIndex(d => d.id === id);
    if (idx === -1) return false;
    const newPinned = !dreams[idx].isPinned;
    dreams.forEach(d => { d.isPinned = false; });
    dreams[idx].isPinned = newPinned;
    await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
    return newPinned;
  } catch (error) {
    console.error('Erreur épinglage:', error);
    return false;
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
        
        // 🎨 Données visuelles du rêve
        dreams[dreamIndex].imageUrl = analysisData.imageUrl || null;
        dreams[dreamIndex].imagePrompt = analysisData.imagePrompt || null;
        dreams[dreamIndex].imagePalette = analysisData.palette || analysisData.imagePalette || [];
        dreams[dreamIndex].imageStyle = analysisData.imageStyle || null;
        
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

