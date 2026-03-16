import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../config/ThemeContext';

const { width } = Dimensions.get('window');

/**
 * 🌙 NoctaliaeAlert - Modal custom premium
 * Remplace Alert.alert avec une UI cohérente dark mode
 * 
 * Usage:
 * const [alert, setAlert] = useState(null);
 * <NoctaliaeAlert config={alert} onClose={() => setAlert(null)} />
 * 
 * setAlert({
 *   type: 'success' | 'error' | 'warning' | 'confirm' | 'info',
 *   title: 'Titre',
 *   message: 'Message',
 *   confirmText: 'OK',
 *   cancelText: 'Annuler', // optionnel
 *   onConfirm: () => {},   // optionnel
 *   onCancel: () => {},    // optionnel
 * });
 */

const ALERT_CONFIGS = {
  success: {
    icon: 'check-circle',
    color: '#39FF88',
    haptic: Haptics.NotificationFeedbackType.Success,
  },
  error: {
    icon: 'error',
    color: '#EF4444',
    haptic: Haptics.NotificationFeedbackType.Error,
  },
  warning: {
    icon: 'warning',
    color: '#F59E0B',
    haptic: Haptics.NotificationFeedbackType.Warning,
  },
  confirm: {
    icon: 'help',
    color: '#D2B14C',
    haptic: Haptics.ImpactFeedbackStyle.Medium,
  },
  info: {
    icon: 'info',
    color: '#4F8DFF',
    haptic: Haptics.ImpactFeedbackStyle.Light,
  },
};

export default function NoctaliaeAlert({ config, onClose }) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (config) {
      // Haptic feedback
      const alertConfig = ALERT_CONFIGS[config.type] || ALERT_CONFIGS.info;
      if (config.type === 'confirm' || config.type === 'info') {
        Haptics.impactAsync(alertConfig.haptic);
      } else {
        Haptics.notificationAsync(alertConfig.haptic);
      }

      // Animation entrée
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [config]);

  const handleClose = (callback) => {
    // Animation sortie
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
      onClose();
    });
  };

  if (!config) return null;

  const alertStyle = ALERT_CONFIGS[config.type] || ALERT_CONFIGS.info;
  const hasCancel = config.cancelText || config.type === 'confirm';

  return (
    <Modal
      visible={!!config}
      transparent
      animationType="none"
      onRequestClose={() => handleClose(config.onCancel)}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { 
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          {/* Icône */}
          <View style={[styles.iconContainer, { backgroundColor: `${alertStyle.color}20` }]}>
            <MaterialIcons name={alertStyle.icon} size={40} color={alertStyle.color} />
          </View>

          {/* Titre */}
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {config.title}
          </Text>

          {/* Message */}
          {config.message && (
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              {config.message}
            </Text>
          )}

          {/* Boutons */}
          <View style={styles.buttonsContainer}>
            {hasCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: theme.colors.cardBorder }]}
                onPress={() => handleClose(config.onCancel)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                  {config.cancelText || 'Annuler'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button, 
                styles.confirmButton, 
                { backgroundColor: alertStyle.color },
                !hasCancel && styles.fullWidthButton
              ]}
              onPress={() => handleClose(config.onConfirm)}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>
                {config.confirmText || 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Hook helper pour utiliser facilement
export function useNoctaliaeAlert() {
  const [alertConfig, setAlertConfig] = React.useState(null);

  const showAlert = (config) => setAlertConfig(config);
  const hideAlert = () => setAlertConfig(null);

  const AlertComponent = () => (
    <NoctaliaeAlert config={alertConfig} onClose={hideAlert} />
  );

  return { showAlert, hideAlert, AlertComponent, alertConfig };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  container: {
    width: width - 60,
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'CormorantUpright-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  confirmButton: {
    // backgroundColor dynamique
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#0c0e27',
  },
});
