import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  Platform
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/theme';

const { width } = Dimensions.get('window');

export default function RateLimitModal({ visible, onClose, minutesLeft = 60 }) {
  const [timeRemaining, setTimeRemaining] = useState(minutesLeft * 60); // En secondes

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose(); // Fermer automatiquement quand le timer atteint 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, onClose]);

  // Reset le timer quand la modal s'ouvre
  useEffect(() => {
    if (visible) {
      setTimeRemaining(minutesLeft * 60);
    }
  }, [visible, minutesLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKofi = (amount) => {
    const url = amount === 1.99
      ? 'https://ko-fi.com/thomasmaury?amount=1.99'
      : 'https://ko-fi.com/thomasmaury?amount=3.39';
    
    Linking.openURL(url).catch(err => 
      console.error('❌ Erreur ouverture Ko-fi:', err)
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header avec icône */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="clock-alert-outline" size={48} color={THEME.colors.primary} />
            </View>
            <Text style={styles.title}>🌙 Limite DeepDream atteinte</Text>
            <Text style={styles.subtitle}>
              Les analyses DeepDream sont limitées pour les utilisateurs gratuits. Soutenez le projet pour un accès illimité !
            </Text>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <MaterialIcons name="timer" size={32} color={THEME.colors.primary} />
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>jusqu'à la prochaine analyse</Text>
          </View>

          {/* Explication coûts */}
          <View style={styles.costContainer}>
            <Text style={styles.costTitle}>💰 Calcul transparent</Text>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Coût réel par analyse DeepDream :</Text>
              <Text style={styles.costValue}>~0,15€</Text>
            </View>
            <Text style={styles.costNote}>
              Noctaliæ est gratuit. Votre soutien permet de couvrir les coûts API et d'améliorer l'app.
            </Text>
          </View>

          {/* Boutons Ko-fi */}
          <View style={styles.buttonsContainer}>
            <Text style={styles.buttonsTitle}>☕ Soutenez le projet</Text>
            
            {/* Café - 1,99€ */}
            <TouchableOpacity
              style={[styles.kofiButton, styles.kofiButtonCoffee]}
              onPress={() => handleKofi(1.99)}
              activeOpacity={0.8}
            >
              <View style={styles.kofiContent}>
                <View style={styles.kofiLeft}>
                  <Text style={styles.kofiEmoji}>☕</Text>
                  <View>
                    <Text style={styles.kofiTitle}>Un café</Text>
                    <Text style={styles.kofiSubtitle}>Analyses DeepDream illimitées</Text>
                  </View>
                </View>
                <Text style={styles.kofiPrice}>1,99€</Text>
              </View>
            </TouchableOpacity>


          </View>

          {/* Alternative gratuite */}
          <View style={styles.alternativeContainer}>
            <MaterialCommunityIcons name="information-outline" size={20} color={THEME.colors.textSecondary} />
            <Text style={styles.alternativeText}>
              En attendant, utilisez <Text style={styles.alternativeBold}>QuickDream</Text> - gratuit et illimité !
            </Text>
          </View>

          {/* Bouton fermer */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    width: width - 40,
    maxWidth: 500,
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(155, 91, 182, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'CormorantUpright-Bold',
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  timerContainer: {
    backgroundColor: 'rgba(155, 91, 182, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.primary,
    marginVertical: 8,
  },
  timerLabel: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  costContainer: {
    backgroundColor: 'rgba(0, 255, 176, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 176, 0.2)',
  },
  costTitle: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  costValue: {
    fontSize: 18,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.primary,
  },
  costNote: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  buttonsTitle: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  kofiButton: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  kofiButtonCoffee: {
    backgroundColor: '#8B4513',
  },
  kofiButtonBreakfast: {
    backgroundColor: '#D2691E',
    position: 'relative',
  },
  kofiContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kofiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kofiEmoji: {
    fontSize: 32,
  },
  kofiTitle: {
    fontSize: 18,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#FFFFFF',
  },
  kofiSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  kofiPrice: {
    fontSize: 24,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#FFFFFF',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#0c0e27',
  },
  alternativeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(155, 91, 182, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  alternativeText: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  alternativeBold: {
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.primary,
  },
  closeButton: {
    backgroundColor: 'rgba(155, 91, 182, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
  },
});
