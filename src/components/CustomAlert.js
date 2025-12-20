import { Alert } from 'react-native';

/**
 * CustomAlert - Alertes avec dark mode forcé
 * Toutes les alertes utilisent userInterfaceStyle: 'dark' pour éviter les popups blanches
 */

export const showSuccessAlert = (message, duration = '') => {
  Alert.alert(
    '✅ Succès',
    duration ? `${message} (${duration})` : message,
    [{ text: 'OK' }],
    { userInterfaceStyle: 'dark' }
  );
};

export const showErrorAlert = (message) => {
  Alert.alert(
    '❌ Erreur',
    message,
    [{ text: 'OK' }],
    { userInterfaceStyle: 'dark' }
  );
};

export const showConfirmAlert = (title, message, onConfirm) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: onConfirm, style: 'destructive' }
    ],
    { userInterfaceStyle: 'dark' }
  );
};

// 🆕 Alert générique avec dark mode
export const showAlert = (title, message, buttons = [{ text: 'OK' }]) => {
  Alert.alert(
    title,
    message,
    buttons,
    { userInterfaceStyle: 'dark' }
  );
};
