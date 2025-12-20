/**
 * 🔄 UPDATE SERVICE - Vérification des mises à jour in-app
 * Utilise l'endpoint /health pour comparer versions
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { getAuthHeaders } from './authTokenService';
import Constants from 'expo-constants';

const UPDATE_CHECK_KEY = '@noctaliae_last_update_check';
const UPDATE_DISMISSED_KEY = '@noctaliae_update_dismissed';
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 heures entre chaque vérification

// 🚩 Flag mémoire pour éviter logs multiples
let updateCheckDone = false;

/**
 * Obtenir la version actuelle de l'app
 */
export function getCurrentAppVersion() {
  return Constants.expoConfig?.version || Constants.manifest?.version || '0.0.0';
}

/**
 * Comparer deux versions semver (ex: "0.9.10" vs "0.9.11")
 * @returns -1 si v1 < v2, 0 si égal, 1 si v1 > v2
 */
export function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  
  return 0;
}

/**
 * Vérifier si une mise à jour est disponible
 * @returns {Object|null} { available: boolean, currentVersion, latestVersion, downloadUrl, releaseNotes, isCritical }
 */
export async function checkForUpdate() {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.health}`, {
      headers,
      timeout: 10000,
    });
    
    const { latestAppVersion, downloadUrl, releaseNotes, criticalUpdate, killSwitch, killMessage } = response.data;
    
    // 🚨 KILL SWITCH - Force la mise à jour depuis le .env backend
    if (killSwitch) {
      console.log('🚨 KILL SWITCH ACTIVÉ ! Mise à jour forcée.');
      const currentVersion = getCurrentAppVersion();
      return {
        available: true,
        currentVersion,
        latestVersion: latestAppVersion || 'Nouvelle version',
        downloadUrl: downloadUrl || null,
        releaseNotes: releaseNotes || 'Une mise à jour importante est disponible.',
        customMessage: killMessage || null, // Message personnalisé depuis le .env backend
        isCritical: true, // Toujours critique quand kill switch actif
        isKillSwitch: true, // Flag pour savoir que c'est un kill switch
      };
    }
    
    // Si le serveur ne renvoie pas d'info de version, pas de mise à jour
    if (!latestAppVersion) {
      console.log('ℹ️ Serveur ne fournit pas d\'info de version');
      return null;
    }
    
    const currentVersion = getCurrentAppVersion();
    const comparison = compareVersions(currentVersion, latestAppVersion);
    
    console.log(`🔄 Version actuelle: ${currentVersion}, Dernière: ${latestAppVersion}`);
    
    if (comparison < 0) {
      console.log('🆕 Mise à jour disponible !');
      return {
        available: true,
        currentVersion,
        latestVersion: latestAppVersion,
        downloadUrl: downloadUrl || null,
        releaseNotes: releaseNotes || null,
        customMessage: customMessage || null,
        isCritical: criticalUpdate || false,
        isKillSwitch: false,
      };
    }
    
    console.log('✅ App à jour');
    return {
      available: false,
      currentVersion,
      latestVersion: latestAppVersion,
    };
    
  } catch (error) {
    console.error('❌ Erreur vérification mise à jour:', error.message);
    return null;
  }
}

/**
 * Vérifier si on doit afficher le modal de mise à jour
 * (respecte l'intervalle et les dismissals)
 */
export async function shouldShowUpdateModal() {
  // 🚩 Skip si déjà checké dans cette session
  if (updateCheckDone) return null;
  updateCheckDone = true;
  
  try {
    // Vérifier le dernier check
    const lastCheck = await AsyncStorage.getItem(UPDATE_CHECK_KEY);
    const now = Date.now();
    
    if (lastCheck) {
      const elapsed = now - parseInt(lastCheck, 10);
      if (elapsed < CHECK_INTERVAL_MS) {
        console.log('⏳ Vérification trop récente, skip');
        return null;
      }
    }
    
    // Sauvegarder le timestamp du check
    await AsyncStorage.setItem(UPDATE_CHECK_KEY, now.toString());
    
    // Vérifier la mise à jour
    const updateInfo = await checkForUpdate();
    
    if (!updateInfo || !updateInfo.available) {
      return null;
    }
    
    // Vérifier si l'utilisateur a déjà refusé cette version
    // 🚨 Kill switch bypass TOUT - on affiche toujours le modal
    if (updateInfo.isKillSwitch) {
      console.log('🚨 Kill switch actif - modal forcé');
      return updateInfo;
    }
    
    const dismissed = await AsyncStorage.getItem(UPDATE_DISMISSED_KEY);
    if (dismissed === updateInfo.latestVersion && !updateInfo.isCritical) {
      console.log('🚫 Mise à jour déjà refusée pour cette version');
      return null;
    }
    
    return updateInfo;
    
  } catch (error) {
    console.error('❌ Erreur shouldShowUpdateModal:', error);
    return null;
  }
}

/**
 * Marquer une version comme "refusée" (l'utilisateur a cliqué "Plus tard")
 */
export async function dismissUpdate(version) {
  try {
    await AsyncStorage.setItem(UPDATE_DISMISSED_KEY, version);
    console.log(`🚫 Mise à jour ${version} refusée`);
  } catch (error) {
    console.error('❌ Erreur dismissUpdate:', error);
  }
}

/**
 * Forcer une nouvelle vérification (reset le timer)
 */
export async function forceUpdateCheck() {
  try {
    await AsyncStorage.removeItem(UPDATE_CHECK_KEY);
    await AsyncStorage.removeItem(UPDATE_DISMISSED_KEY);
    return await checkForUpdate();
  } catch (error) {
    console.error('❌ Erreur forceUpdateCheck:', error);
    return null;
  }
}
