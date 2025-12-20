/**
 * ✨ GlobalGlowOverlay - Effet Vignette Inset Glow
 * Overlay visuel permanent sur les bords de l'écran
 * 
 * 🎨 Logique des couleurs par coin :
 * - Normal → Vert partout 🌿 (dreamy)
 * - Recherche seule → Bleu ↖️ + Vert ↘️
 * - DeepDream seul → Vert ↖️ + Violet ↘️
 * - Les deux → Bleu ↖️ + Violet ↘️
 * - Célébration → Violet partout (5s)
 * 
 * V6 : Vert permanent + mix diagonal par fonctionnalité
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useGlow, GLOW_COLORS } from '../contexts/GlowContext';

const { width, height } = Dimensions.get('window');

// 🎨 Paramètres visuels V6 - VERT PERMANENT + MIX DIAGONAL
const GLOW_CONFIG = {
  opacity: 0.20,           // Opacité de base (20%)
  pulseMin: 0.12,          // Opacité min pulsation (12%)
  pulseMax: 0.28,          // Opacité max pulsation (28%)
  pulseDuration: 6000,     // Durée cycle pulsation (6s - smooth)
  edgeSize: 50,            // Taille du glow sur les bords (50px)
};

export default function GlobalGlowOverlay() {
  const { isGlowActive, glowType, isContributor, isDeepDream, isCelebrating } = useGlow();
  const pulseAnim = useRef(new Animated.Value(GLOW_CONFIG.opacity)).current;

  // 🌊 Animation pulsation SMOOTH (avec easing)
  useEffect(() => {
    if (!isGlowActive) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: GLOW_CONFIG.pulseMax,
          duration: GLOW_CONFIG.pulseDuration / 2,
          easing: Easing.inOut(Easing.ease), // ✨ Smooth in/out
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: GLOW_CONFIG.pulseMin,
          duration: GLOW_CONFIG.pulseDuration / 2,
          easing: Easing.inOut(Easing.ease), // ✨ Smooth in/out
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [isGlowActive, pulseAnim]);

  // ❌ Pas de glow si rien d'actif
  if (!isGlowActive) return null;

  // 🎨 Couleurs par coin (vert toujours en fond !)
  // ↖️ Haut + Gauche : Bleu si recherche, sinon Vert
  const topLeftColor = isContributor ? GLOW_COLORS.contributor : GLOW_COLORS.ambient;
  // ↘️ Bas + Droite : Violet si DeepDream, sinon Vert  
  const bottomRightColor = isDeepDream ? GLOW_COLORS.deepDream : GLOW_COLORS.ambient;
  // 🎉 Célébration : Violet partout temporairement
  const celebrationColor = isCelebrating ? GLOW_COLORS.celebration : null;
  
  // Couleur pour la vignette radiale (priorité célébration > mix)
  const vignetteColor = celebrationColor || (
    isContributor && isDeepDream ? GLOW_COLORS.mixed :
    isContributor ? GLOW_COLORS.contributor :
    isDeepDream ? GLOW_COLORS.deepDream :
    GLOW_COLORS.ambient
  );

  // 🎨 Couleurs avec transparence pour dégradés
  const getColorWithAlpha = (color, alpha) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <Animated.View 
      style={[styles.container, { opacity: pulseAnim }]}
      pointerEvents="none"
    >
      {/* 🌌 Vignette radiale centrale (effet organique) */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="vignette" cx="50%" cy="50%" rx="70%" ry="60%">
            <Stop offset="0%" stopColor="transparent" stopOpacity="0" />
            <Stop offset="60%" stopColor="transparent" stopOpacity="0" />
            <Stop offset="85%" stopColor={vignetteColor} stopOpacity="0.15" />
            <Stop offset="100%" stopColor={vignetteColor} stopOpacity="0.4" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#vignette)" />
      </Svg>

      {/* 🔝 Bord supérieur - ↖️ topLeftColor */}
      <LinearGradient
        colors={[
          getColorWithAlpha(celebrationColor || topLeftColor, 0.5),
          getColorWithAlpha(celebrationColor || topLeftColor, 0.15),
          'transparent',
        ]}
        locations={[0, 0.5, 1]}
        style={[styles.edge, styles.edgeTop]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* 🔽 Bord inférieur - ↘️ bottomRightColor */}
      <LinearGradient
        colors={[
          'transparent',
          getColorWithAlpha(celebrationColor || bottomRightColor, 0.15),
          getColorWithAlpha(celebrationColor || bottomRightColor, 0.5),
        ]}
        locations={[0, 0.5, 1]}
        style={[styles.edge, styles.edgeBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* ◀️ Bord gauche - ↖️ topLeftColor */}
      <LinearGradient
        colors={[
          getColorWithAlpha(celebrationColor || topLeftColor, 0.4),
          getColorWithAlpha(celebrationColor || topLeftColor, 0.1),
          'transparent',
        ]}
        locations={[0, 0.5, 1]}
        style={[styles.edge, styles.edgeLeft]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />

      {/* ▶️ Bord droit - ↘️ bottomRightColor */}
      <LinearGradient
        colors={[
          'transparent',
          getColorWithAlpha(celebrationColor || bottomRightColor, 0.1),
          getColorWithAlpha(celebrationColor || bottomRightColor, 0.4),
        ]}
        locations={[0, 0.5, 1]}
        style={[styles.edge, styles.edgeRight]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    overflow: 'hidden',
  },
  edge: {
    position: 'absolute',
    zIndex: 2,
  },
  edgeTop: {
    top: 0,
    left: 0,
    right: 0,
    height: GLOW_CONFIG.edgeSize,
  },
  edgeBottom: {
    bottom: 0,
    left: 0,
    right: 0,
    height: GLOW_CONFIG.edgeSize,
  },
  edgeLeft: {
    top: 0,
    left: 0,
    bottom: 0,
    width: GLOW_CONFIG.edgeSize,
  },
  edgeRight: {
    top: 0,
    right: 0,
    bottom: 0,
    width: GLOW_CONFIG.edgeSize,
  },
});
