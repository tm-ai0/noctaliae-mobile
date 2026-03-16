import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/theme';

/**
 * 🔒 Banner affiché quand la limite de 10 analyses/heure est atteinte
 * 
 * @param {Object} limitInfo - Info sur la limite (depuis apiService)
 * @param {Function} onDismiss - Callback pour fermer le banner
 */
export default function RateLimitBanner({ limitInfo, onDismiss }) {
  if (!limitInfo || !limitInfo.limited) {
    return null; // Ne rien afficher si pas de limite
  }

  const handleKofiPress = () => {
    if (limitInfo.kofi_link) {
      Linking.openURL(limitInfo.kofi_link);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FFD700" />
          <Text style={styles.title}>Mode gratuit activé</Text>
        </View>
        
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="close" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Message */}
      <Text style={styles.message}>{limitInfo.message}</Text>
      
      {/* Suggestion */}
      {limitInfo.suggestion && (
        <Text style={styles.suggestion}>
          ✨ {limitInfo.suggestion}
        </Text>
      )}

      {/* Bouton Ko-fi */}
      {limitInfo.kofi_link && (
        <TouchableOpacity 
          style={styles.kofiButton} 
          onPress={handleKofiPress}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="coffee" size={18} color="#FFFFFF" />
          <Text style={styles.kofiButtonText}>Soutenez Noctaliæ</Text>
          <MaterialIcons name="open-in-new" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a3e', // Mauve foncé
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#FFD700',
  },
  message: {
    fontSize: 14,
    color: THEME.colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  suggestion: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  kofiButton: {
    backgroundColor: '#FF5E5B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  kofiButtonText: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#FFFFFF',
  },
});
