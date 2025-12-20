/**
 * ✨ GlowContext - Global Inset Glow System
 * 
 * Glow TOUJOURS actif avec vert permanent + mix diagonal :
 * - Normal → Vert partout 🌿 (dreamy)
 * - Recherche seule → Bleu ↖️ + Vert ↘️
 * - DeepDream seul → Vert ↖️ + Violet ↘️
 * - Les deux → Bleu ↖️ + Violet ↘️
 * - Célébration → Violet partout (5s post-onboarding)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { premiumService } from '../services/premiumService';

// 🎨 Couleurs Glow (STYLE_GUIDE.md)
export const GLOW_COLORS = {
  ambient: '#00FFB0',        // Vert néon (ambiance dreamy par défaut)
  contributor: '#4F8DFF',    // Bleu électrique (Recherche)
  deepDream: '#8B5CF6',      // Violet (DeepDream - cohérence badge)
  celebration: '#8B5CF6',    // Violet (célébration post-onboarding)
  mixed: '#3CF0FF',          // Arctic Cyan (recherche + DeepDream)
};

const GlowContext = createContext();

const RESEARCH_OPT_IN_KEY = '@noctaliae_research_opt_in';

export function GlowProvider({ children }) {
  const [isContributor, setIsContributor] = useState(false);
  const [isDeepDream, setIsDeepDream] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false); // 🎉 Glow temporaire post-onboarding
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Charger les états au démarrage
  useEffect(() => {
    loadGlowStates();
  }, []);

  async function loadGlowStates() {
    try {
      // Vérifier contributeur recherche
      const contributorValue = await AsyncStorage.getItem(RESEARCH_OPT_IN_KEY);
      setIsContributor(contributorValue === 'true');

      // Vérifier DeepDream Premium
      const premium = await premiumService.isPremium();
      setIsDeepDream(premium);
    } catch (error) {
      console.error('❌ Erreur chargement états Glow:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // 🔄 Rafraîchir les états (appelé après changement de settings)
  const refreshGlowStates = useCallback(async () => {
    try {
      const contributorValue = await AsyncStorage.getItem(RESEARCH_OPT_IN_KEY);
      setIsContributor(contributorValue === 'true');

      const premium = await premiumService.isPremium();
      setIsDeepDream(premium);
      
      console.log('✨ Glow states refreshed:', { 
        contributor: contributorValue === 'true', 
        deepDream: premium 
      });
    } catch (error) {
      console.error('❌ Erreur refresh Glow:', error);
    }
  }, []);

  // 🎉 Déclencher le glow de célébration (post-onboarding)
  const triggerCelebration = useCallback((durationMs = 5000) => {
    console.log('🎉 Celebration glow activé !');
    setIsCelebrating(true);
    
    // Auto-désactiver après la durée
    setTimeout(() => {
      setIsCelebrating(false);
      console.log('🎉 Celebration glow terminé');
    }, durationMs);
  }, []);

  // 🎨 Calculer la couleur du glow (priorité décroissante)
  const getGlowColor = useCallback(() => {
    // 🎉 1. Célébration post-onboarding (violet 5s)
    if (isCelebrating) {
      return 'celebration';
    }
    // 🔵🟣 2. Les deux actifs (recherche + DeepDream)
    if (isContributor && isDeepDream) {
      return 'mixed';
    }
    // 🔵 3. Recherche seule
    if (isContributor) {
      return 'contributor';
    }
    // 🟣 4. DeepDream seul
    if (isDeepDream) {
      return 'deepDream';
    }
    // 🟢 5. Sinon → Ambiance dreamy (vert permanent)
    return 'ambient';
  }, [isContributor, isDeepDream, isCelebrating]);

  // ✅ Glow TOUJOURS actif (ambiance dreamy par défaut)
  const isGlowActive = true;

  return (
    <GlowContext.Provider
      value={{
        isContributor,
        isDeepDream,
        isCelebrating,
        isGlowActive,
        glowType: getGlowColor(),
        refreshGlowStates,
        triggerCelebration,
        isLoading,
        GLOW_COLORS,
      }}
    >
      {children}
    </GlowContext.Provider>
  );
}

export function useGlow() {
  const context = useContext(GlowContext);
  if (!context) {
    throw new Error('useGlow doit être utilisé dans un GlowProvider');
  }
  return context;
}
