import { Alert } from 'react-native';

export const showSuccessAlert = (message, duration = '') => {
  Alert.alert(
    '✅ Succès',
    duration ? `${message} (${duration})` : message,
    [{ text: 'OK' }]
  );
};

export const showErrorAlert = (message) => {
  Alert.alert(
    '❌ Erreur',
    message,
    [{ text: 'OK' }]
  );
};

export const showConfirmAlert = (title, message, onConfirm) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: onConfirm, style: 'destructive' }
    ]
  );
};