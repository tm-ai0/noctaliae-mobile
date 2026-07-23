/**
 * 🆔 Device ID — identifiant stable par installation
 * Généré une fois, persisté en AsyncStorage, envoyé au backend pour le
 * suivi d'usage DeepDream/images (remplace le tracking par req.ip, trop
 * fragile : IP partagée sur un même wifi, IP mobile qui change).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@noctaliae_device_id';

function generateId() {
  return `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

let cachedDeviceId = null;

export async function getDeviceId() {
  if (cachedDeviceId) return cachedDeviceId;
  try {
    let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = generateId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, id);
    }
    cachedDeviceId = id;
    return id;
  } catch (error) {
    console.error('❌ Erreur getDeviceId:', error);
    return generateId(); // fallback non persisté, mieux que rien
  }
}
