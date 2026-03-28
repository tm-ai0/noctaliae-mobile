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

const FALLBACK_TIERS = [
  { emoji: '☕', price: '1,99\u00a0€', name: 'Un café pour le projet' },
  { emoji: '🌙', price: '4,99\u00a0€', name: 'Soutenir Noctaliæ' },
  { emoji: '✨', price: '9,99\u00a0€', name: 'Encourager la recherche' },
  { emoji: '🔮', price: '19,99\u00a0€', name: 'Mécène du rêve' },
];
// Note : ces prix sont les fallback TTC affichés si RevenueCat est offline.
// Les vrais prix viennent de RevenueCat/Google Play (dynamiques).

export function ActivateDeepDreamModal({ visible, onClose, onPurchaseSuccess, hasFreeTrials, freeTrialsRemaining }) {
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
      Alert.alert('Erreur', 'La facturation n\'est pas disponible pour le moment. Réessayez plus tard.');
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
        Alert.alert('Erreur', 'L\'achat n\'a pas pu être finalisé.');
      }
    }
    setPurchasing(false);
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const result = await premiumService.restorePurchases();
      if (result.isPremium) {
        Alert.alert('Restauré !', 'DeepDream a été restauré avec succès.');
        onPurchaseSuccess();
      } else {
        Alert.alert('Aucun achat trouvé', 'Aucun achat précédent n\'a été trouvé pour ce compte Google.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de restaurer les achats.');
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
              <Text style={styles.title}>Soutenir Noctaliæ</Text>
              <Text style={styles.subtitle}>
                Soutenez le projet et débloquez DeepDream à vie.{' '}
                QuickDream reste gratuit et illimité, toujours.
              </Text>
            </View>

            {/* Comparaison Quick vs Deep */}
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonTitle}>ÇA CHANGE QUOI ?</Text>

              {/* QuickDream */}
              <View style={styles.comparisonSection}>
                <Text style={styles.comparisonEngine}>⚡ QuickDream</Text>
                <Text style={styles.comparisonItem}>✓  Gratuit · illimité</Text>
                <Text style={styles.comparisonItem}>✓  Analyse rapide</Text>
                <Text style={styles.comparisonItem}>✓  Résumé + thèmes</Text>
              </View>

              {/* DeepDream */}
              <View style={[styles.comparisonSection, styles.comparisonSectionDeep]}>
                <Text style={[styles.comparisonEngine, { color: '#4F8DFF' }]}>🧠 DeepDream</Text>
                <Text style={styles.comparisonItemDeep}>✦  6 grilles scientifiques</Text>
                <Text style={styles.comparisonItemDeep}>✦  Capture photo / OCR</Text>
                <Text style={styles.comparisonItemDeep}>✦  Génération d'image du rêve</Text>
                <Text style={styles.comparisonItemDeep}>✦  Thèmes exclusifs</Text>
                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(79, 141, 255, 0.15)' }}>
                  <Text style={{ fontSize: 13, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: '#D2B14C', lineHeight: 20 }}>❤️  Soutenir un projet indépendant</Text>
                  <Text style={{ fontSize: 11, fontFamily: 'AtkinsonHyperlegibleNext-Regular', color: THEME.colors.textSecondary, marginTop: 2 }}>Pas de pubs, pas de tracking, science first.</Text>
                </View>
              </View>
            </View>

            {/* Paliers */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#4F8DFF" size="small" />
                <Text style={styles.loadingText}>Chargement des formules...</Text>
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
                          <Text style={styles.popularBadgeText}>Le plus choisi</Text>
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
              Chaque formule débloque DeepDream à vie.{' '}
              La différence, c'est la valeur de votre soutien.
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
                  <Text style={styles.purchaseButtonText}>Soutenir · {selectedPrice}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Bouton secondaire */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>Pas maintenant, continuer gratuitement</Text>
            </TouchableOpacity>

            {/* Restaurer */}
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={restoring}
              activeOpacity={0.7}
            >
              <Text style={styles.restoreText}>
                {restoring ? 'Restauration...' : 'Déjà soutenu ? Restaurer mes achats'}
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
