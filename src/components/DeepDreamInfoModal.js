/**
 * 🌙 DeepDreamInfoModal — Modal informatif adaptatif
 * FREE  : comparaison moteurs + CTA paywall + Ko-fi + contact
 * PREMIUM : comparaison moteurs + statut palier + Ko-fi + contact
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { THEME } from '../config/theme';
import { premiumService } from '../services/premiumService';
import { useTranslation } from 'react-i18next';

export function DeepDreamInfoModal({ visible, onClose, isPremium, onOpenPaywall }) {
  const { t } = useTranslation();
  const [tierInfo, setTierInfo] = useState(null);

  useEffect(() => {
    if (visible && isPremium) {
      premiumService.getPremiumTierInfo().then(setTierInfo);
    }
  }, [visible, isPremium]);

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/33645003566?text=Salut%20Thomas%20!%20%F0%9F%8C%99');
  };

  const handleKofi = () => {
    Linking.openURL('https://ko-fi.com/tm_ai0');
  };

  const handlePaywall = () => {
    onClose();
    setTimeout(() => onOpenPaywall?.(), 300);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="electron-framework" size={28} color="#4F8DFF" />
            <Text style={styles.headerTitle}>{t('deepDreamInfoModal.header')}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <MaterialIcons name="close" size={22} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* Badge statut premium */}
            {isPremium && tierInfo && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumEmoji}>{tierInfo.emoji}</Text>
                <View style={styles.premiumBadgeText}>
                  <Text style={styles.premiumLabel}>{t('deepDreamInfoModal.premium_label', { tier: tierInfo.label })}</Text>
                  <Text style={styles.premiumSub}>{t('deepDreamInfoModal.premium_sub')}</Text>
                </View>
              </View>
            )}

            {/* Comparaison moteurs */}
            <View style={styles.comparisonContainer}>
              {/* QuickDream */}
              <View style={styles.engineCard}>
                <View style={styles.engineHeader}>
                  <Text style={styles.engineIcon}>⚡</Text>
                  <Text style={styles.engineName}>QuickDream</Text>
                </View>
                <View style={styles.engineBadge}>
                  <Text style={styles.engineBadgeText}>{t('deepDreamInfoModal.quick_free')}</Text>
                </View>
                <View style={styles.featureList}>
                  <FeatureItem icon="check" color={THEME.colors.textSecondary} text={t('deepDreamInfoModal.quick_feature1')} />
                  <FeatureItem icon="check" color={THEME.colors.textSecondary} text={t('deepDreamInfoModal.quick_feature2')} />
                  <FeatureItem icon="check" color={THEME.colors.textSecondary} text={t('deepDreamInfoModal.quick_feature3')} />
                </View>
              </View>

              {/* DeepDream */}
              <View style={[styles.engineCard, styles.engineCardDeep]}>
                <View style={styles.engineHeader}>
                  <Text style={styles.engineIcon}>🧠</Text>
                  <Text style={[styles.engineName, { color: '#4F8DFF' }]}>DeepDream</Text>
                </View>
                <View style={[styles.engineBadge, styles.engineBadgeDeep]}>
                  <Text style={[styles.engineBadgeText, { color: '#4F8DFF' }]}>{t('deepDreamInfoModal.deep_badge')}</Text>
                </View>
                <View style={styles.featureList}>
                  <FeatureItem icon="auto-awesome" color="#4F8DFF" text={t('deepDreamInfoModal.deep_feature1')} />
                  <FeatureItem icon="camera-alt" color="#4F8DFF" text={t('deepDreamInfoModal.deep_feature2')} />
                  <FeatureItem icon="image" color="#4F8DFF" text={t('deepDreamInfoModal.deep_feature3')} />
                  <FeatureItem icon="palette" color="#4F8DFF" text={t('deepDreamInfoModal.deep_feature4')} />
                </View>
              </View>
            </View>

            {/* Section science */}
            <View style={styles.scienceSection}>
              <Text style={styles.scienceTitle}>{t('deepDreamInfoModal.scienceTitle')}</Text>
              <Text style={styles.scienceText}>
                {t('deepDreamInfoModal.scienceText')}
              </Text>
            </View>

            {/* Section soutien */}
            <View style={styles.supportSection}>
              <Text style={styles.supportTitle}>❤️  {t('deepDreamInfoModal.supportTitle')}</Text>
              <Text style={styles.supportText}>
                {t('deepDreamInfoModal.supportText')}
              </Text>
            </View>
          </ScrollView>

          {/* Footer adaptatif */}
          <View style={styles.footer}>
            {/* CTA Paywall (free only) */}
            {!isPremium && (
              <TouchableOpacity style={styles.paywallButton} onPress={handlePaywall} activeOpacity={0.8}>
                <MaterialIcons name="favorite" size={18} color="#FFFFFF" />
                <Text style={styles.paywallButtonText}>{t('deepDreamInfoModal.unlockCta')}</Text>
              </TouchableOpacity>
            )}

            {/* Ko-fi + WhatsApp */}
            <View style={styles.footerButtons}>
              <TouchableOpacity style={styles.footerBtn} onPress={handleKofi} activeOpacity={0.7}>
                <Text style={styles.footerBtnEmoji}>☕</Text>
                <Text style={styles.footerBtnText}>{isPremium ? t('deepDreamInfoModal.kofi_premium') : t('deepDreamInfoModal.kofi_free')}</Text>
              </TouchableOpacity>

              <View style={styles.footerDivider} />

              <TouchableOpacity style={styles.footerBtn} onPress={handleWhatsApp} activeOpacity={0.7}>
                <MaterialCommunityIcons name="whatsapp" size={18} color="#25D366" />
                <Text style={styles.footerBtnText}>{t('deepDreamInfoModal.contact')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FeatureItem({ icon, color, text }) {
  return (
    <View style={styles.featureRow}>
      <MaterialIcons name={icon} size={16} color={color} />
      <Text style={[styles.featureText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(79, 141, 255, 0.15)',
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 4,
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: 'CormorantUpright-Bold',
    color: THEME.colors.text,
  },
  closeButton: {
    padding: 4,
  },

  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },

  // Premium badge
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(210, 177, 76, 0.1)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(210, 177, 76, 0.25)',
    gap: 12,
  },
  premiumEmoji: {
    fontSize: 32,
  },
  premiumBadgeText: {
    flex: 1,
  },
  premiumLabel: {
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#D2B14C',
  },
  premiumSub: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },

  // Comparaison moteurs
  comparisonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  engineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  engineCardDeep: {
    backgroundColor: 'rgba(79, 141, 255, 0.05)',
    borderColor: 'rgba(79, 141, 255, 0.2)',
  },
  engineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  engineIcon: {
    fontSize: 20,
  },
  engineName: {
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
  },
  engineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 255, 176, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  engineBadgeDeep: {
    backgroundColor: 'rgba(79, 141, 255, 0.1)',
  },
  engineBadgeText: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#00FFB0',
    letterSpacing: 0.3,
  },
  featureList: {
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    lineHeight: 18,
  },

  // Science
  scienceSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  scienceTitle: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#00FFB0',
    marginBottom: 6,
  },
  scienceText: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },

  // Support
  supportSection: {
    backgroundColor: 'rgba(210, 177, 76, 0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(210, 177, 76, 0.12)',
  },
  supportTitle: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#D2B14C',
    marginBottom: 6,
  },
  supportText: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },

  // Footer
  footer: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    gap: 10,
  },
  paywallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F8DFF',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  paywallButtonText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#FFFFFF',
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  footerBtnEmoji: {
    fontSize: 16,
  },
  footerBtnText: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
  },
  footerDivider: {
    width: 1,
    height: 20,
    backgroundColor: THEME.colors.cardBorder,
  },
});
