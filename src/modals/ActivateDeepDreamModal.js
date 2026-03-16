/**
 * 🌙 ActivateDeepDreamModal
 * Modal réutilisable pour proposer l'activation de DeepDream
 * Utilisé dans : PostRecordingScreen, ConversationScreen, DeepChatScreen
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal 
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/theme';

export function ActivateDeepDreamModal({ visible, onClose, onActivate }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons name="electron-framework" size={40} color="#4F8DFF" />
            <Text style={styles.modalTitle}>Activer DeepDream ?</Text>
          </View>
          
          {/* Body */}
          <Text style={styles.modalDescription}>
            DeepDream Engine offre des analyses plus profondes et personnalisées grâce à un modèle premium.
          </Text>
          
          <View style={styles.modalFeatures}>
            <View style={styles.modalFeatureRow}>
              <MaterialIcons name="check" size={18} color="#4F8DFF" />
              <Text style={styles.modalFeatureText}>6 grilles d'analyse scientifiques</Text>
            </View>
            <View style={styles.modalFeatureRow}>
              <MaterialIcons name="check" size={18} color="#4F8DFF" />
              <Text style={styles.modalFeatureText}>Réponses détaillées et nuancées</Text>
            </View>
            <View style={styles.modalFeatureRow}>
              <MaterialIcons name="check" size={18} color="#4F8DFF" />
              <Text style={styles.modalFeatureText}>Personnalisation avec vos empreintes</Text>
            </View>
          </View>
          
          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalButtonSecondary}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonSecondaryText}>Rester sur QuickDream</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButtonPrimary}
              onPress={onActivate}
              activeOpacity={0.8}
            >
              <MaterialIcons name="auto-awesome" size={18} color="#0c0e27" />
              <Text style={styles.modalButtonPrimaryText}>Activer DeepDream</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#4F8DFF30',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'CormorantUpright-Bold',
    color: THEME.colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 15,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalFeatures: {
    backgroundColor: 'rgba(79, 141, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  modalFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  modalFeatureText: {
    fontSize: 14,
    color: THEME.colors.text,
  },
  modalButtons: {
    gap: 12,
  },
  modalButtonSecondary: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
  },
  modalButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4F8DFF',
    gap: 8,
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#0c0e27',
  },
});
