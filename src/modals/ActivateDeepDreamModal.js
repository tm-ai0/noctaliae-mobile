/**
 * 🌙 ActivateDeepDreamModal — Paywall avec paliers RevenueCat
 * Modal réutilisable pour proposer l'achat de DeepDream
 * Utilisé dans : PostRecordingScreen, ConversationScreen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../config/theme';
import { premiumService } from '../services/premiumService';
import { useTranslation } from 'react-i18next';

const FALLBACK_TIERS_BASE = [
  { emoji: '☕', price: '1,99\u00a0€', nameKey: 'activateDeepDreamModal.tier1_name' },
  { emoji: '🌙', price: '4,99\u00a0€', nameKey: 'activateDeepDreamModal.tier2_name' },
  { emoji: '✨', price: '9,99\u00a0€', nameKey: 'activateDeepDreamModal.tier3_name' },
  { emoji: '🔮', price: '19,99\u00a0€', nameKey: 'activateDeepDreamModal.tier4_name' },
];
// Note : ces prix sont les fallback TTC affichés si RevenueCat est offline.
// Les vrais prix viennent de RevenueCat/Google Play (dynamiques).

export function ActivateDeepDreamModal({ visible, onClose, onPurchaseSuccess, hasFreeTrials, freeTrialsRemaining }) {
  const { t } = useTranslation();
  const FALLBACK_TIERS = FALLBACK_TIERS_BASE.map(ft => ({ ...ft, name: t(ft.nameKey) }));
  const [packages, setPackages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!visible) return;
    loadOfferings();
  }, [visible]);

  async function loadOfferings() {
    setLoading(true);
    try {
      const pkgs = await premiumService.getOfferings();
      if (pkgs.length > 0) {
        setPackages(pkgs);
        // Pré-sélectionner le tier 2 (index 1) si disponible
        setSelectedIndex(pkgs.length > 1 ? 1 : 0);
      }
    } catch (e) {
      console.warn('⚠️ Impossible de charger les offerings:', e);
    }
    setLoading(false);
  }

  async function handlePurchase() {
    if (packages.length === 0) {
      Alert.alert(t('common.error'), t('activateDeepDreamModal.errorBilling'));
      return;
    }
    setPurchasing(true);
    try {
      const result = await premiumService.purchaseDeepDream(packages[selectedIndex]);
      if (result.success || result.isPremium) {
        onPurchaseSuccess();
      }
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert(t('common.error'), t('activateDeepDreamModal.errorPurchase'));
      }
    }
    setPurchasing(false);
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const result = await premiumService.restorePurchases();
      if (result.isPremium) {
        Alert.alert(t('activateDeepDreamModal.restoredTitle'), t('activateDeepDreamModal.restoredMsg'));
        onPurchaseSuccess();
      } else {
        Alert.alert(t('activateDeepDreamModal.notFoundTitle'), t('activateDeepDreamModal.notFoundMsg'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('activateDeepDreamModal.errorRestore'));
    }
    setRestoring(false);
  }

  // Données d'affichage : packages RevenueCat ou fallback
  const tiers = packages.length > 0
    ? packages.map((pkg, i) => ({
        emoji: FALLBACK_TIERS[i]?.emoji || '💎',
        price: pkg.product.priceString,
        name: FALLBACK_TIERS[i]?.name || pkg.product.title,
      }))
    : FALLBACK_TIERS;

  const selectedPrice = tiers[selectedIndex]?.price || '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <MaterialCommunityIcons name="electron-framework" size={40} color="#4F8DFF" />
              <Text style={styles.title}>{t('activateDeepDreamModal.title')}</Text>
              <Text style={styles.subtitle}>
                {t('activateDeepDreamModal.subtitle')}
              </Text>
            </View>

            {/* Comparaison Quick vs Deep */}
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>{t('activateDeepDreamModal.compareTitle')}</Text>

              {/* QuickDream */}
              <View style={styles.comparisonSection}>
                <Text style={styles.comparisonEngine}>⚡ QuickDream</Text>
                <Text style={styles.comparisonItem}>✓  {t('activateDeepDreamModal.quick_free')}</Text>
                <Text style={styles.comparisonItem}>✓  {t('activateDeepDreamModal.quick_feature1')}</Text>
                <Text style={styles.comparisonItem}>✓  {t('activateDeepDreamModal.quick_feature2')}</Text>
              </View>

              {/* DeepDream */}
              <View style={[styles.comparisonSection, styles.comparisonSectionDeep]}>
                <Text style={[styles.comparisonEngine, { color: '#4F8DFF' }]}>🧠 DeepDream</Text>
                <Text style={styles.comparisonItemDeep}>✦  {t('activateDeepDreamModal.deep_feature1')}</Text>
                <Text style={styles.comparisonItemDeep}>✦  {t('activateDeepDreamModal.deep_feature2')}</Text>
                <Text style={styles.comparisonItemDeep}>✦  {t('activateDeepDreamModal.deep_feature3')}</Text>
                <Text style={styles.comparisonItemDeep}>✦  {t('activateDeepDreamModal.deep_feature4')}</Text>
                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(79, 141, 255, 0.15)' }}>
                  <Text style={{ fontSize: 13, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: '#D2B14C', lineHeight: 20 }}>❤️  {t('activateDeepDreamModal.deep_support')}</Text>
                  <Text style={{ fontSize: 11, fontFamily: 'AtkinsonHyperlegibleNext-Regular', color: THEME.colors.textSecondary, marginTop: 2 }}>{t('activateDeepDreamModal.deep_supportSub')}</Text>
                </View>
              </View>
            </View>

            {/* Paliers */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#4F8DFF" size="small" />
                <Text style={styles.loadingText}>{t('activateDeepDreamModal.loading')}</Text>
              </View>
            ) : (
              <View style={styles.tiersContainer}>
                {tiers.map((tier, index) => {
                  const isSelected = index === selectedIndex;
                  const isPopular = index === 1;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.tierCard,
                        isSelected && styles.tierCardSelected,
                      ]}
                      onPress={() => setSelectedIndex(index)}
                      activeOpacity={0.7}
                    >
                      {isPopular && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularBadgeText}>{t('activateDeepDreamModal.popularBadge')}</Text>
                        </View>
                      )}
                      <View style={styles.tierRow}>
                        <Text style={styles.tierEmoji}>{tier.emoji}</Text>
                        <View style={styles.tierInfo}>
                          <Text style={[
                            styles.tierPrice,
                            isSelected && styles.tierPriceSelected,
                          ]}>{tier.price}</Text>
                          <Text style={styles.tierName}>{tier.name}</Text>
                        </View>
                        {isSelected && (
                          <MaterialIcons name="check-circle" size={24} color="#4F8DFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              {t('activateDeepDreamModal.disclaimer')}
            </Text>

            {/* CTA Soutenir */}
            <TouchableOpacity
              style={[styles.purchaseButton, purchasing && styles.buttonDisabled]}
              onPress={handlePurchase}
              disabled={purchasing || loading}
              activeOpacity={0.8}
            >
              {purchasing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialIcons name="favorite" size={18} color="#FFFFFF" />
                  <Text style={styles.purchaseButtonText}>{t('activateDeepDreamModal.purchaseCta', { price: selectedPrice })}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Bouton secondaire */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>{t('activateDeepDreamModal.skipBtn')}</Text>
            </TouchableOpacity>

            {/* Restaurer */}
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={restoring}
              activeOpacity={0.7}
            >
              <Text style={styles.restoreText}>
                {restoring ? t('activateDeepDreamModal.restoring') : t('activateDeepDreamModal.restoreBtn')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
    padding: 16,
  },
  container: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(79, 141, 255, 0.15)',
  },
  scrollContent: {
    padding: 24,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: 'CormorantUpright-Bold',
    color: THEME.colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },

  // Comparaison
  comparisonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  comparisonTitle: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  comparisonSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  comparisonSectionDeep: {
    backgroundColor: 'rgba(79, 141, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(79, 141, 255, 0.15)',
    marginBottom: 0,
  },
  comparisonItemDeep: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: '#4F8DFF',
    lineHeight: 20,
  },
  comparisonEngine: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
    marginBottom: 8,
  },
  comparisonItem: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    lineHeight: 20,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },

  // Tiers / Paliers
  tiersContainer: {
    gap: 10,
    marginBottom: 16,
  },
  tierCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: THEME.colors.cardBorder,
    position: 'relative',
  },
  tierCardSelected: {
    backgroundColor: 'rgba(79, 141, 255, 0.08)',
    borderColor: '#4F8DFF',
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tierEmoji: {
    fontSize: 28,
  },
  tierInfo: {
    flex: 1,
  },
  tierPrice: {
    fontSize: 20,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
  },
  tierPriceSelected: {
    color: '#4F8DFF',
  },
  tierName: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#4F8DFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  popularBadgeText: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#FFFFFF',
  },

  // Disclaimer
  disclaimer: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    opacity: 0.7,
  },

  // CTA Purchase
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F8DFF',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#FFFFFF',
  },

  // Skip
  skipButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginBottom: 16,
  },
  skipButtonText: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
  },

  // Restore
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    textDecorationLine: 'underline',
    opacity: 0.6,
  },
});
