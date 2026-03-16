/**
 * 🔄 UPDATE AVAILABLE MODAL
 * Modal affichant qu'une nouvelle version est disponible
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { THEME } from '../config/theme';

export function UpdateAvailableModal({
  visible,
  onClose,
  onDismiss,
  currentVersion,
  latestVersion,
  downloadUrl,
  releaseNotes,
  customMessage,
  isCritical,
}) {
  
  const handleDownload = () => {
    if (downloadUrl) {
      Linking.openURL(downloadUrl).catch(err => {
        console.error('❌ Erreur ouverture URL:', err);
      });
    }
    onClose();
  };
  
  const handleLater = () => {
    if (onDismiss) {
      onDismiss(latestVersion);
    }
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={isCritical ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: THEME.colors.backgroundElevated }]}>
          
          {/* Header avec icône */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <MaterialIcons 
                name="system-update" 
                size={40} 
                color={THEME.colors.primary} 
              />
            </View>
          </View>
          
          {/* Titre */}
          <Text style={[styles.title, { color: THEME.colors.primary }]}>
            Nouvelle version disponible !
          </Text>
          
          {/* Versions */}
          <View style={styles.versionContainer}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionLabel}>Actuelle</Text>
              <Text style={styles.versionValue}>{currentVersion}</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={24} color={THEME.colors.textSecondary} />
            <View style={[styles.versionBadge, styles.versionBadgeNew]}>
              <Text style={styles.versionLabel}>Nouvelle</Text>
              <Text style={[styles.versionValue, { color: THEME.colors.primary }]}>{latestVersion}</Text>
            </View>
          </View>
          
          {/* Description */}
          <Text style={[styles.description, { color: THEME.colors.textPrimary }]}>
            {customMessage 
              ? customMessage
              : isCritical 
                ? "Une nouvelle version est disponible !\nTéléchargez-la pour continuer à utiliser Noctaliæ."
                : "Une nouvelle version de Noctaliæ est disponible avec des améliorations et corrections de bugs."}
          </Text>
          
          {/* Notes de version (si disponibles) */}
          {releaseNotes && (
            <View style={styles.releaseNotesContainer}>
              <Text style={styles.releaseNotesTitle}>✨ Ce qui est nouveau</Text>
              {String(releaseNotes).split('\n').filter(l => l.trim()).map((line, i) => (
                <View key={i} style={styles.releaseNoteLine}>
                  <Text style={styles.releaseNotesDot}>•</Text>
                  <Text style={styles.releaseNotesText}>{line.replace(/^[\u2022\-\*\+]\s*/, '').trim()}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Boutons */}
          <View style={styles.buttonsContainer}>
            {!isCritical && (
              <TouchableOpacity 
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleLater}
              >
                <Text style={styles.buttonSecondaryText}>Plus tard</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.buttonPrimary,
                !downloadUrl && styles.buttonDisabled
              ]}
              onPress={handleDownload}
              disabled={!downloadUrl}
            >
              <MaterialIcons name="download" size={20} color={THEME.colors.background} />
              <Text style={styles.buttonPrimaryText}>
                {downloadUrl ? "Télécharger" : "Bientôt disponible"}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Info plateforme */}
          <Text style={styles.platformNote}>
            {Platform.OS === 'android' 
              ? "📱 Le fichier APK sera téléchargé"
              : "📱 Vous serez redirigé vers le téléchargement"}
          </Text>
          
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
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...THEME.shadow.xl,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleCritical: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  title: {
    fontSize: 24,
    fontFamily: 'CormorantUpright-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  versionBadge: {
    backgroundColor: THEME.colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  versionBadgeNew: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryGlow,
  },
  versionLabel: {
    fontSize: 10,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  versionValue: {
    fontSize: 18,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  releaseNotesContainer: {
    width: '100%',
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  releaseNotesTitle: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.warmGold,
    marginBottom: 6,
  },
  releaseNoteLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 5,
  },
  releaseNotesDot: {
    fontSize: 13,
    color: THEME.colors.primary,
    lineHeight: 18,
    marginTop: 1,
  },
  releaseNotesText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: THEME.colors.textSecondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: THEME.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: THEME.colors.cardBackground,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  buttonDisabled: {
    backgroundColor: THEME.colors.cardBorder,
    opacity: 0.6,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.background,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textPrimary,
  },
  platformNote: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});
