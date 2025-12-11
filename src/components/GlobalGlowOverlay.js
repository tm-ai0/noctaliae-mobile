/**
 * ✨ GlobalGlowOverlay - Effet Vignette Inset Glow + Grain
 * Overlay visuel sur les bords de l'écran
 * - Contributeur : Bleu électrique #4F8DFF
 * - DeepDream : Vert néon #00FFB0
 * - Les deux : Effet mixte avec les deux couleurs
 * 
 * V4 : Suppression des corners rectangulaires - edges only + radial fade
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useGlow, GLOW_COLORS } from '../contexts/GlowContext';

const { width, height } = Dimensions.get('window');

// 🎨 Paramètres visuels V4 - CLEAN & ORGANIC
const GLOW_CONFIG = {
  opacity: 0.20,           // Opacité de base (20%)
  pulseMin: 0.12,          // Opacité min pulsation (12%)
  pulseMax: 0.28,          // Opacité max pulsation (28%)
  pulseDuration: 6000,     // Durée cycle pulsation (6s - encore plus lent)
  edgeSize: 50,            // Taille du glow sur les bords (50px)
};

export default function GlobalGlowOverlay() {
  const { isGlowActive, glowType, isContributor, isDeepDream } = useGlow();
  const pulseAnim = useRef(new Animated.Value(GLOW_CONFIG.opacity)).current;

  // 🌊 Animation pulsation
  useEffect(() => {
    if (!isGlowActive) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: GLOW_CONFIG.pulseMax,
          duration: GLOW_CONFIG.pulseDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: GLOW_CONFIG.pulseMin,
          duration: GLOW_CONFIG.pulseDuration / 2,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [isGlowActive, pulseAnim]);

  // ❌ Pas de glow si rien d'actif
  if (!isGlowActive) return null;

  // 🎨 Déterminer les couleurs
  const primaryColor = glowType === 'contributor' 
    ? GLOW_COLORS.contributor 
    : GLOW_COLORS.deepDream;

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
            <Stop offset="85%" stopColor={primaryColor} stopOpacity="0.15" />
            <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.4" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#vignette)" />
      </Svg>

      {/* 🔝 Bord supérieur - fade plus doux */}
      <LinearGradient
        colors={[
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.contributor : primaryColor, 0.5),
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.contributor : primaryColor, 0.15),
          'transparent',
        ]}
        locations={[0, 0.5, 1]}
        style={[styles.edge, styles.edgeTop]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* 🔽 Bord inférieur */}
      <LinearGradient
        colors={[
          'transparent',
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.deepDream : primaryColor, 0.15),
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.deepDream : primaryColor, 0.5),
        ]}
        locations={[0, 0.5, 1]}
        style={[styles.edge, styles.edgeBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* ◀️ Bord gauche */}
      <LinearGradient
        colors={[
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.contributor : primaryColor, 0.4),
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.contributor : primaryColor, 0.1),
          'transparent',
        ]}
        locations={[0, 0.5, 1]}
        style={[styles.edge, styles.edgeLeft]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />

      {/* ▶️ Bord droit */}
      <LinearGradient
        colors={[
          'transparent',
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.deepDream : primaryColor, 0.1),
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.deepDream : primaryColor, 0.4),
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
