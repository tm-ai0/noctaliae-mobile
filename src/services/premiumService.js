/**
 * 💎 Premium Service — RevenueCat
 * Gestion du statut Premium via react-native-purchases
 * Cache AsyncStorage pour fallback offline
 */

import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_CACHE_KEY = '@noctaliae_premium_cache';
const ENTITLEMENT_ID = 'deepdream';

export const premiumService = {
  async isPremium() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const active = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      // Cache local pour fallback offline
      await AsyncStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({ isPremium: active, checkedAt: new Date().toISOString() }));
      return active;
    } catch (error) {
      console.warn('⚠️ RevenueCat offline, fallback cache');
      try {
        const cached = await AsyncStorage.getItem(PREMIUM_CACHE_KEY);
        if (cached) return JSON.parse(cached).isPremium;
      } catch {}
      return false;
    }
  },

  async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (error) {
      console.error('❌ getOfferings error:', error);
      return [];
    }
  },

  async purchaseDeepDream(pkg) {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const active = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      await AsyncStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({ isPremium: active, checkedAt: new Date().toISOString() }));
      return { isPremium: active, customerInfo };
    } catch (error) {
      if (error.userCancelled) {
        throw { userCancelled: true };
      }
      throw error;
    }
  },

  async restorePurchases() {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const active = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      await AsyncStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({ isPremium: active, checkedAt: new Date().toISOString() }));
      return { isPremium: active, customerInfo };
    } catch (error) {
      console.error('❌ Restore error:', error);
      throw error;
    }
  },

  // Détection du palier acheté
  async getPremiumTierInfo() {
    const TIER_MAP = [
      { id: 'tier1', emoji: '☕', name: 'Un café pour le projet', label: 'Supporter' },
      { id: 'tier2', emoji: '🌙', name: 'Soutenir Noctaliæ', label: 'Soutien' },
      { id: 'tier3', emoji: '✨', name: 'Encourager la recherche', label: 'Ambassadeur' },
      { id: 'tier4', emoji: '🔮', name: 'Mécène du rêve', label: 'Mécène' },
    ];
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
      if (!entitlement) return null;
      const productId = entitlement.productIdentifier || '';
      // Match par ID produit (tier1, tier2...) ou par position
      const tierIndex = TIER_MAP.findIndex(t => productId.toLowerCase().includes(t.id));
      if (tierIndex >= 0) return TIER_MAP[tierIndex];
      // Fallback : chercher par prix dans le productId
      if (productId.includes('199') || productId.includes('1_99')) return TIER_MAP[0];
      if (productId.includes('499') || productId.includes('4_99')) return TIER_MAP[1];
      if (productId.includes('999') || productId.includes('9_99')) return TIER_MAP[2];
      if (productId.includes('1999') || productId.includes('19_99')) return TIER_MAP[3];
      // Fallback générique
      return { emoji: '💎', name: 'DeepDream', label: 'Supporter' };
    } catch (error) {
      console.warn('⚠️ getPremiumTierInfo error:', error);
      // Fallback dev : si premium via cache (Expo Go), retourner un tier par défaut
      try {
        const cached = await AsyncStorage.getItem(PREMIUM_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.isPremium && parsed.devOverride) {
            return TIER_MAP[0]; // Simule Supporter en dev
          }
        }
      } catch {}
      return null;
    }
  },

  // Compatibilité SettingsScreen (toggle dev)
  async enablePremium() {
    await AsyncStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({ isPremium: true, checkedAt: new Date().toISOString(), devOverride: true }));
  },
  async disablePremium() {
    await AsyncStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({ isPremium: false, checkedAt: new Date().toISOString(), devOverride: true }));
  },
};
