import React, { useRef, useEffect } from 'react';
import { Animated, Easing, TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../config/ThemeContext';

const FABRecordButton = ({ onPress }) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    glowLoop.start();
    return () => { pulseLoop.stop(); glowLoop.stop(); };
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      {/* Outer glow ring */}
      <Animated.View 
        style={[
          styles.glowRing,
          {
            borderColor: theme.colors.primary,
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          }
        ]}
      />
      {/* Main button */}
      <Animated.View 
        style={[
          styles.fabButton, 
          { 
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            transform: [{ scale: pulseAnim }],
          }
        ]}
      >
        {/* Bevel highlight top (3D effect) */}
        <View style={styles.bevelHighlight} />
        {/* Bevel shadow bottom (3D depth) */}
        <View style={styles.bevelShadow} />
        <MaterialIcons name="mic" size={40} color={theme.colors.background} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fabButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  glowRing: {
    position: 'absolute',
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 1.5,
    top: -8,
    left: -8,
  },
  // Reflet subtil en haut uniquement (pas de layer bas = pas de ligne)
  bevelHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  // Désactivé — plus de ligne de jonction
  bevelShadow: {
    display: 'none',
  },
});

export default FABRecordButton;
