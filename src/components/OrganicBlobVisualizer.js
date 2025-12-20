/**
 * 🌊 OrganicBlobVisualizer - Animation Blob Organique V6
 * OPTIMISÉ - Sans pulse, moins de particules
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 🎨 Configuration visuelle - OPTIMISÉE
const CONFIG = {
  rings: 14,           // 🔥 Réduit (20 → 14)
  baseRadius: 20,
  ringSpacing: 28,
  points: 60,          // 🔥 Réduit (80 → 60)
  animSpeed: 0.0008,   // 🔥 Légèrement plus lent
};

// 🎨 Couleurs dynamiques (plus de constante fixe)

// 🌀 Générateur de bruit organique
function noise(x, y, t, seed = 0) {
  const n1 = Math.sin(x * 0.8 + t + seed) * Math.cos(y * 0.6 - t * 0.7);
  const n2 = Math.sin(x * 1.3 - t * 1.2 + seed * 0.5) * Math.cos(y * 1.1 + t * 0.9);
  const n3 = Math.cos(x * 0.5 + t * 0.5 + seed * 1.5) * Math.sin(y * 0.9 - t * 0.6);
  return (n1 + n2 * 0.5 + n3 * 0.3) / 1.8;
}

/**
 * Génère le path SVG pour un anneau déformé organiquement
 */
function generateBlobPath(centerX, centerY, baseRadius, time, ringIndex, audioBoost, totalRings) {
  const points = [];
  const angleStep = (Math.PI * 2) / CONFIG.points;
  
  const deformAmplitude = 0.18 + (ringIndex / totalRings) * 0.10;
  const audioMultiplier = 1 + audioBoost * 1.2;
  
  for (let i = 0; i <= CONFIG.points; i++) {
    const angle = i * angleStep;
    
    const noiseValue = noise(
      Math.cos(angle) * 2.5,
      Math.sin(angle) * 2.5,
      time,
      ringIndex * 0.7
    );
    
    const deformation = 1 + noiseValue * deformAmplitude * audioMultiplier;
    const radius = baseRadius * deformation;
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    points.push({ x, y });
  }
  
  if (points.length < 3) return '';
  
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  
  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    path += ` Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ${((p1.x + p2.x) / 2).toFixed(1)} ${((p1.y + p2.y) / 2).toFixed(1)}`;
  }
  
  path += ' Z';
  return path;
}

/**
 * Composant principal
 */
export default function OrganicBlobVisualizer({ isRecording, isTranscribing = false, audioLevel = 0 }) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [time, setTime] = useState(0);
  const [smoothAudioLevel, setSmoothAudioLevel] = useState(0);
  const animationRef = useRef(null);
  
  // 🎨 Couleur dynamique : vert néon (recording) ou doré (transcription)
  const activeColor = isTranscribing ? '#D2B14C' : '#00FFB0';
  
  // Helper pour rgba avec la couleur active
  const getActiveRgba = (opacity) => {
    if (isTranscribing) {
      return `rgba(210, 177, 76, ${opacity})`; // Doré
    }
    return `rgba(0, 255, 176, ${opacity})`; // Vert néon
  };
  
  // Smooth audio level
  useEffect(() => {
    setSmoothAudioLevel(prev => prev + (audioLevel - prev) * 0.4);
  }, [audioLevel]);
  
  // Animation principale - active si recording OU transcribing
  useEffect(() => {
    const isActive = isRecording || isTranscribing;
    
    if (isActive) {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      
      let startTime = Date.now();
      const animate = () => {
        const elapsed = (Date.now() - startTime) * CONFIG.animSpeed;
        setTime(elapsed);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording, isTranscribing]);
  
  // 📐 Taille SVG
  const size = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT) * 1.5;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Générer les anneaux
  const rings = [];
  for (let i = 0; i < CONFIG.rings; i++) {
    const radius = CONFIG.baseRadius + (i * CONFIG.ringSpacing);
    const path = generateBlobPath(centerX, centerY, radius, time, i, smoothAudioLevel, CONFIG.rings);
    
    const ringOpacity = Math.max(0.06, 0.65 - (i / CONFIG.rings) * 0.59);
    const strokeWidth = Math.max(0.5, 1.6 - (i / CONFIG.rings) * 1.1);
    
    rings.push({ index: i, path, opacity: ringOpacity, strokeWidth });
  }
  
  // 🔥 PARTICULES RÉDUITES (30 au lieu de 60+40)
  const glowParticles = [];
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2 + time * 0.15;
    const baseDistance = 50 + (i % 6) * 40;
    const noiseOffset = noise(i, time * 0.3, time, i * 0.3) * 35;
    const distance = baseDistance + noiseOffset;
    
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const particleOpacity = 0.10 + Math.sin(time * 1.2 + i) * 0.06;
    const particleSize = 2 + Math.sin(time * 0.6 + i * 0.3) * 1;
    
    glowParticles.push({ x, y, opacity: particleOpacity, size: particleSize, key: i });
  }

  // 🚫 Ne rien afficher si ni recording ni transcribing
  if (!isRecording && !isTranscribing) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: opacityAnim }
      ]}
    >
      <Svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={styles.svg}
      >
        {/* 🔥 GLOW - 2 couches seulement */}
        {rings.slice(0, 10).map((ring) => (
          <Path
            key={`glow2-${ring.index}`}
            d={ring.path}
            fill="none"
            stroke={getActiveRgba(0.04 + (10 - ring.index) * 0.008)}
            strokeWidth={18 - ring.index * 1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        
        {rings.slice(0, 7).map((ring) => (
          <Path
            key={`glow1-${ring.index}`}
            d={ring.path}
            fill="none"
            stroke={getActiveRgba(0.08 + (7 - ring.index) * 0.015)}
            strokeWidth={8 - ring.index * 0.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        
        {/* 🔥 PARTICULES */}
        {glowParticles.map((p) => (
          <Circle
            key={`particle-${p.key}`}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill={getActiveRgba(p.opacity)}
          />
        ))}
        
        {/* Anneaux organiques */}
        {rings.map((ring) => (
          <Path
            key={ring.index}
            d={ring.path}
            fill="none"
            stroke={getActiveRgba(ring.opacity)}
            strokeWidth={ring.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    top: SCREEN_HEIGHT * 0.48, // 🌊 Épicentre mi-bas - vagues visibles
  },
  svg: {
    position: 'absolute',
  },
});
