/**
 * ✨ GlowContext - Global Inset Glow System
 * Gère les états visuels selon :
 * - Contributeur recherche (@noctaliae_research_opt_in) → Bleu électrique #4F8DFF
 * - DeepDream Premium (premiumService) → Vert néon #00FFB0
 * - Les deux → Mix dégradé bleu + vert
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { premiumService } from '../services/premiumService';

// 🎨 Couleurs Glow (STYLE_GUIDE.md)
export const GLOW_COLORS = {
  contributor: '#4F8DFF',    // Bleu électrique
  deepDream: '#00FFB0',      // Vert néon primary
  mixed: '#3CF0FF',          // Arctic Cyan (pour effet mix)
};

const GlowContext = createContext();

const RESEARCH_OPT_IN_KEY = '@noctaliae_research_opt_in';

export function GlowProvider({ children }) {
  const [isContributor, setIsContributor] = useState(false);
  const [isDeepDream, setIsDeepDream] = useState(false);
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

  // 🎨 Calculer la couleur du glow
  const getGlowColor = useCallback(() => {
    if (isContributor && isDeepDream) {
      return 'mixed'; // Les deux actifs
    }
    if (isContributor) {
      return 'contributor'; // Bleu seul
    }
    if (isDeepDream) {
      return 'deepDream'; // Vert seul
    }
    return null; // Pas de glow
  }, [isContributor, isDeepDream]);

  // ✅ État actif du glow
  const isGlowActive = isContributor || isDeepDream;

  return (
    <GlowContext.Provider
      value={{
        isContributor,
        isDeepDream,
        isGlowActive,
        glowType: getGlowColor(),
        refreshGlowStates,
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
