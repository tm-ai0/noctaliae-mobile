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

  // Compatibilité SettingsScreen (toggle dev)
  async enablePremium() {
    await AsyncStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({ isPremium: true, checkedAt: new Date().toISOString(), devOverride: true }));
  },
  async disablePremium() {
    await AsyncStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify({ isPremium: false, checkedAt: new Date().toISOString(), devOverride: true }));
  },
};
