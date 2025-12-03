/**
 * ✨ GlobalGlowOverlay - Effet Vignette Inset Glow + Grain
 * Overlay visuel sur les bords de l'écran
 * - Contributeur : Bleu électrique #4F8DFF
 * - DeepDream : Vert néon #00FFB0
 * - Les deux : Effet mixte avec les deux couleurs
 * 
 * V2 : Opacité augmentée + texture grain subtile
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Filter, FeTurbulence, FeColorMatrix, Rect } from 'react-native-svg';
import { useGlow, GLOW_COLORS } from '../contexts/GlowContext';

const { width, height } = Dimensions.get('window');

// 🎨 Paramètres visuels V2 - PLUS VISIBLE
const GLOW_CONFIG = {
  opacity: 0.22,           // Opacité de base (22% - augmenté)
  pulseMin: 0.15,          // Opacité min pulsation (15%)
  pulseMax: 0.32,          // Opacité max pulsation (32%)
  pulseDuration: 4000,     // Durée cycle pulsation (4s)
  edgeSize: 100,           // Taille du glow sur les bords (100px - augmenté)
  grainOpacity: 0.04,      // Opacité du grain (4%)
};

// 🎨 Composant Grain SVG
function GrainOverlay({ color }) {
  // Générer une seed unique pour le turbulence
  const seed = useMemo(() => Math.floor(Math.random() * 1000), []);
  
  return (
    <View style={styles.grainContainer} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <Filter id="noise" x="0%" y="0%" width="100%" height="100%">
            <FeTurbulence 
              type="fractalNoise" 
              baseFrequency="0.9" 
              numOctaves="4" 
              seed={seed}
              result="noise"
            />
            <FeColorMatrix
              type="saturate"
              values="0"
            />
          </Filter>
        </Defs>
        <Rect 
          x="0" 
          y="0" 
          width="100%" 
          height="100%" 
          filter="url(#noise)" 
          opacity={GLOW_CONFIG.grainOpacity}
          fill={color}
        />
      </Svg>
    </View>
  );
}

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
      {/* 🎞️ Grain overlay */}
      <GrainOverlay color={primaryColor} />

      {/* 🔝 Bord supérieur */}
      <LinearGradient
        colors={[
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.contributor : primaryColor, 0.8),
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.contributor : primaryColor, 0.3),
          'transparent',
        ]}
        locations={[0, 0.4, 1]}
        style={[styles.edge, styles.edgeTop]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* 🔽 Bord inférieur */}
      <LinearGradient
        colors={[
          'transparent',
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.deepDream : primaryColor, 0.3),
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.deepDream : primaryColor, 0.8),
        ]}
        locations={[0, 0.6, 1]}
        style={[styles.edge, styles.edgeBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* ◀️ Bord gauche */}
      <LinearGradient
        colors={[
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.contributor : primaryColor, 0.7),
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.contributor : primaryColor, 0.25),
          'transparent',
        ]}
        locations={[0, 0.4, 1]}
        style={[styles.edge, styles.edgeLeft]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />

      {/* ▶️ Bord droit */}
      <LinearGradient
        colors={[
          'transparent',
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.deepDream : primaryColor, 0.25),
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.deepDream : primaryColor, 0.7),
        ]}
        locations={[0, 0.6, 1]}
        style={[styles.edge, styles.edgeRight]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />

      {/* 🔲 Coins renforcés */}
      {/* Coin haut-gauche */}
      <LinearGradient
        colors={[
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.contributor : primaryColor, 0.6),
          'transparent',
        ]}
        style={[styles.corner, styles.cornerTopLeft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Coin haut-droite */}
      <LinearGradient
        colors={[
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.mixed : primaryColor, 0.5),
          'transparent',
        ]}
        style={[styles.corner, styles.cornerTopRight]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* Coin bas-gauche */}
      <LinearGradient
        colors={[
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.mixed : primaryColor, 0.5),
          'transparent',
        ]}
        style={[styles.corner, styles.cornerBottomLeft]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
      />
      
      {/* Coin bas-droite */}
      <LinearGradient
        colors={[
          getColorWithAlpha(glowType === 'mixed' ? GLOW_COLORS.deepDream : primaryColor, 0.6),
          'transparent',
        ]}
        style={[styles.corner, styles.cornerBottomRight]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
      />

      {/* 🌟 Highlight central subtil pour le mode mixed */}
      {glowType === 'mixed' && (
        <View style={styles.mixedCenterGlow}>
          <LinearGradient
            colors={[
              'transparent',
              getColorWithAlpha(GLOW_COLORS.mixed, 0.08),
              'transparent',
            ]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  grainContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
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
  corner: {
    position: 'absolute',
    width: GLOW_CONFIG.edgeSize * 1.2,
    height: GLOW_CONFIG.edgeSize * 1.2,
    zIndex: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
  },
  mixedCenterGlow: {
    position: 'absolute',
    top: '30%',
    bottom: '30%',
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
