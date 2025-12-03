/**
 * 🔐 BiometricService - Authentification biométrique avec fallback PIN
 * Utilise expo-local-authentication (inclus dans Expo)
 * 
 * @version 1.0.0
 * @date 2024-12-04
 */
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Platform } from 'react-native';

const BiometricService = {
  /**
   * Vérifie si la biométrie est disponible sur l'appareil
   * @returns {Promise<{available: boolean, biometryType: string}>}
   */
  checkAvailability: async () => {
    try {
      // Vérifier si le hardware est compatible
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return { available: false, biometryType: null, reason: 'no_hardware' };
      }

      // Vérifier si des empreintes/face sont enregistrées
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return { available: false, biometryType: null, reason: 'not_enrolled' };
      }

      // Récupérer le type de biométrie
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      let biometryType = 'Biométrie';
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometryType = Platform.OS === 'ios' ? 'Face ID' : 'Reconnaissance faciale';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometryType = Platform.OS === 'ios' ? 'Touch ID' : 'Empreinte digitale';
      }

      return { available: true, biometryType, reason: null };
    } catch (error) {
      console.error('❌ Erreur vérification biométrie:', error);
      return { available: false, biometryType: null, reason: 'error' };
    }
  },

  /**
   * Demande l'authentification biométrique avec fallback PIN
   * @param {string} promptMessage - Message affiché à l'utilisateur
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  authenticate: async (promptMessage = 'Confirmer votre identité') => {
    try {
      const { available, biometryType } = await BiometricService.checkAvailability();

      if (!available) {
        // Pas de biométrie → fallback vers code PIN de l'appareil
        console.log('ℹ️ Biométrie non disponible, fallback PIN');
        
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: promptMessage,
          fallbackLabel: 'Utiliser le code',
          disableDeviceFallback: false, // Autoriser le code PIN
          cancelLabel: 'Annuler',
        });

        return {
          success: result.success,
          error: result.error || null,
          method: 'passcode'
        };
      }

      // Biométrie disponible → demander authentification
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage,
        fallbackLabel: 'Utiliser le code',
        disableDeviceFallback: false, // Fallback vers PIN si biométrie échoue
        cancelLabel: 'Annuler',
      });

      if (result.success) {
        console.log(`✅ Authentification réussie via ${biometryType}`);
        return { success: true, method: biometryType };
      } else {
        console.log('❌ Authentification échouée:', result.error);
        return { 
          success: false, 
          error: result.error,
          method: biometryType
        };
      }
    } catch (error) {
      console.error('❌ Erreur authentification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Authentification simplifiée pour les rêves secrets
   * @returns {Promise<boolean>} true si succès, false sinon
   */
  authenticateForSecrets: async () => {
    const result = await BiometricService.authenticate('Accéder aux rêves protégés');
    
    if (!result.success && result.error === 'user_cancel') {
      // L'utilisateur a annulé → pas d'alerte
      return false;
    }
    
    if (!result.success) {
      Alert.alert(
        '🔒 Accès refusé',
        'Authentification requise pour accéder aux rêves protégés.',
        [{ text: 'OK' }],
        { userInterfaceStyle: 'dark' }
      );
      return false;
    }
    
    return true;
  }
};

export default BiometricService;
