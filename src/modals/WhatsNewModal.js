import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../config/ThemeContext';

export function WhatsNewModal({ visible, onDismiss }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.card,
          {
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder,
          },
        ]}>
          {/* Globe emoji */}
          <Text style={styles.emoji}>🌍</Text>

          {/* Titre */}
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            {t('whatsNew.title')}
          </Text>

          {/* Sous-titre */}
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('whatsNew.subtitle')}
          </Text>

          {/* Bullets */}
          <View style={styles.bullets}>
            <Text style={[styles.bullet, { color: theme.colors.text }]}>
              {t('whatsNew.bullet1')}
            </Text>
            <Text style={[styles.bullet, { color: theme.colors.text }]}>
              {t('whatsNew.bullet2')}
            </Text>
            <Text style={[styles.bullet, { color: theme.colors.text }]}>
              {t('whatsNew.bullet3')}
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: theme.colors.primary }]}
            onPress={onDismiss}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaText, { color: theme.colors.background }]}>
              {t('whatsNew.cta')}
            </Text>
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
    padding: 28,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: 'CormorantUpright-Bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  bullets: {
    width: '100%',
    marginBottom: 24,
  },
  bullet: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    lineHeight: 24,
    marginBottom: 8,
  },
  cta: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
});
