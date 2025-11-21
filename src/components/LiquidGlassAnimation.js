import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { THEME } from '../config/theme';

const { width } = Dimensions.get('window');

export default function LiquidGlassAnimation({ isRecording, audioLevel = 0 }) {
  // audioLevel entre 0 et 1 (volume du microphone)
  const wave1 = useRef(new Animated.Value(1)).current;
  const wave2 = useRef(new Animated.Value(1)).current;
  const wave3 = useRef(new Animated.Value(1)).current;
  const wave4 = useRef(new Animated.Value(1)).current;
  
  const rotation1 = useRef(new Animated.Value(0)).current;
  const rotation2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      // Animations de respiration basées sur le volume
      const baseScale = 1 + (audioLevel * 0.3); // Scale de 1 à 1.3 selon volume
      
      Animated.loop(
        Animated.parallel([
          // Wave 1 - Plus réactive
          Animated.sequence([
            Animated.timing(wave1, {
              toValue: baseScale + 0.15,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(wave1, {
              toValue: baseScale,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          // Wave 2 - Moyenne réactivité
          Animated.sequence([
            Animated.timing(wave2, {
              toValue: baseScale + 0.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(wave2, {
              toValue: baseScale,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          // Wave 3 - Moins réactive
          Animated.sequence([
            Animated.timing(wave3, {
              toValue: baseScale + 0.05,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(wave3, {
              toValue: baseScale,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          // Wave 4 - La plus lente
          Animated.sequence([
            Animated.timing(wave4, {
              toValue: baseScale + 0.02,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(wave4, {
              toValue: baseScale,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

      // Rotations continues
      Animated.loop(
        Animated.timing(rotation1, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(rotation2, {
          toValue: 1,
          duration: 15000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isRecording, audioLevel]);

  const rotate1 = rotation1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotate2 = rotation2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      {/* Wave 1 - Plus grande et externe */}
      <Animated.View
        style={[
          styles.wave,
          styles.wave1,
          {
            transform: [
              { scale: wave1 },
              { rotate: rotate1 },
            ],
          },
        ]}
      />

      {/* Wave 2 */}
      <Animated.View
        style={[
          styles.wave,
          styles.wave2,
          {
            transform: [
              { scale: wave2 },
              { rotate: rotate2 },
            ],
          },
        ]}
      />

      {/* Wave 3 */}
      <Animated.View
        style={[
          styles.wave,
          styles.wave3,
          {
            transform: [
              { scale: wave3 },
              { rotate: rotate1 },
            ],
          },
        ]}
      />

      {/* Wave 4 - La plus petite au centre */}
      <Animated.View
        style={[
          styles.wave,
          styles.wave4,
          {
            transform: [
              { scale: wave4 },
              { rotate: rotate2 },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 3,
  },
  wave1: {
    width: 320,
    height: 320,
    borderColor: 'rgba(0, 255, 176, 0.15)',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  wave2: {
    width: 260,
    height: 260,
    borderColor: 'rgba(0, 255, 176, 0.25)',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  wave3: {
    width: 200,
    height: 200,
    borderColor: 'rgba(0, 255, 176, 0.35)',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  wave4: {
    width: 140,
    height: 140,
    borderColor: 'rgba(0, 255, 176, 0.5)',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});
