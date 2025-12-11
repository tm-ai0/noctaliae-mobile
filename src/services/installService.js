// ============================================
// 📲 INSTALL TRACKING SERVICE
// ============================================
// Envoie un ping unique au premier lancement
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

const API_URL = 'https://api.thomasmaury.fr';
const INSTALL_PING_KEY = '@noctaliae_install_pinged';

/**
 * Génère un ID unique pour ce device
 */
const getDeviceId = async () => {
  try {
    // Essaie de récupérer un ID existant
    let deviceId = await AsyncStorage.getItem('@noctaliae_device_id');
    
    if (!deviceId) {
      // Génère un nouvel ID unique
      deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      await AsyncStorage.setItem('@noctaliae_device_id', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    // Fallback si AsyncStorage échoue
    return `${Platform.OS}_${Date.now()}_fallback`;
  }
};

/**
 * Envoie le ping d'installation (une seule fois)
 */
export const sendInstallPing = async () => {
  try {
    // Vérifie si déjà envoyé
    const alreadyPinged = await AsyncStorage.getItem(INSTALL_PING_KEY);
    
    if (alreadyPinged === 'true') {
      console.log('📲 Install ping déjà envoyé');
      return { alreadySent: true };
    }
    
    const deviceId = await getDeviceId();
    const appVersion = Application.nativeApplicationVersion || '0.9.10';
    
    console.log('📲 Envoi install ping...');
    
    const response = await fetch(`${API_URL}/api/install-ping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId,
        platform: Platform.OS,
        appVersion,
        timestamp: new Date().toISOString()
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Marque comme envoyé
      await AsyncStorage.setItem(INSTALL_PING_KEY, 'true');
      console.log(`📲 Install ping OK! Total: ${data.totalInstalls}`);
    }
    
    return data;
    
  } catch (error) {
    console.log('📲 Install ping error (non-bloquant):', error.message);
    // Non-bloquant : l'app fonctionne même si le ping échoue
    return { error: error.message };
  }
};
