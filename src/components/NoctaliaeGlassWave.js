import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { THEME } from '../config/theme';

const { width, height } = Dimensions.get('window');

/**
 * NoctaliaeGlassWave - Animation Liquid Glass réactive
 * Charte scientifique : Or (#D2B14C) / Brun (#88735C) / Gris-vert (#A0B4D4)
 */
export default function NoctaliaeGlassWave({ isActive = false, audioLevel = 0 }) {
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  // Rotation continue
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Pulse réactif à l'audio
  useEffect(() => {
    if (isActive && audioLevel > 0) {
      const scale = 1 + audioLevel * 0.3; // Scale entre 1.0 et 1.3
      Animated.spring(pulseAnim, {
        toValue: scale,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(pulseAnim, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [audioLevel, isActive]);

  // Glow réactif
  useEffect(() => {
    if (isActive) {
      const glowIntensity = 0.3 + audioLevel * 0.7; // Entre 0.3 et 1.0
      Animated.timing(glowAnim, {
        toValue: glowIntensity,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [audioLevel, isActive]);

  // Vagues animées
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim1, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(waveAnim2, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(waveAnim3, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim3, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const wave1Scale = waveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const wave1Opacity = waveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  const wave2Scale = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const wave2Opacity = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  const wave3Scale = waveAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const wave3Opacity = waveAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  return (
    <View style={styles.container}>
      {/* Gradient de fond */}
      <LinearGradient
        colors={['#1A1A1A', '#0A0A0A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Vagues expansives (réactives à l'audio) */}
      {isActive && (
        <>
          <Animated.View
            style={[
              styles.wave,
              {
                transform: [{ scale: wave1Scale }],
                opacity: wave1Opacity,
              },
            ]}
          >
            <LinearGradient
              colors={[THEME.colors.warmGold + '40', 'transparent']}
              style={styles.waveGradient}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.wave,
              {
                transform: [{ scale: wave2Scale }],
                opacity: wave2Opacity,
              },
            ]}
          >
            <LinearGradient
              colors={[THEME.colors.warmBrown + '30', 'transparent']}
              style={styles.waveGradient}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.wave,
              {
                transform: [{ scale: wave3Scale }],
                opacity: wave3Opacity,
              },
            ]}
          >
            <LinearGradient
              colors={[THEME.colors.scientificBlueGreen + '20', 'transparent']}
              style={styles.waveGradient}
            />
          </Animated.View>
        </>
      )}

      {/* Cercle central animé */}
      <Animated.View
        style={[
          styles.centerOrb,
          {
            transform: [{ scale: pulseAnim }, { rotate: rotation }],
          },
        ]}
      >
        <Svg width={200} height={200} viewBox="0 0 200 200">
          {/* Cercle extérieur or */}
          <Circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={THEME.colors.warmGold}
            strokeWidth="2"
            opacity="0.6"
          />

          {/* Cercle moyen brun */}
          <Circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke={THEME.colors.warmBrown}
            strokeWidth="1.5"
            opacity="0.5"
          />

          {/* Cercle intérieur gris-vert */}
          <Circle
            cx="100"
            cy="100"
            r="40"
            fill={THEME.colors.warmGold + '20'}
            stroke={THEME.colors.scientificBlueGreen}
            strokeWidth="1"
            opacity="0.4"
          />

          {/* Noyau central pulsant */}
          <Circle
            cx="100"
            cy="100"
            r="20"
            fill={THEME.colors.warmGold}
            opacity="0.8"
          />
        </Svg>

        {/* Glow réactif */}
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowAnim,
              shadowColor: THEME.colors.warmGold,
            },
          ]}
        />
      </Animated.View>

      {/* Particules flottantes */}
      <View style={styles.particles}>
        {[...Array(12)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: `${(i * 8 + 10) % 90}%`,
                top: `${(i * 7 + 20) % 80}%`,
                opacity: isActive ? 0.3 : 0.1,
              },
            ]}
          >
            <View
              style={[
                styles.particleDot,
                {
                  backgroundColor:
                    i % 3 === 0
                      ? THEME.colors.warmGold
                      : i % 3 === 1
                      ? THEME.colors.warmBrown
                      : THEME.colors.scientificBlueGreen,
                },
              ]}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  waveGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  centerOrb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 20,
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
  },
  particleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
