import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';

const { width } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

export default function WaveAnimation({ isRecording, audioLevel = 0 }) {
  // Animations pour chaque wave
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;
  
  // Opacité réactive au son
  const opacity1 = useRef(new Animated.Value(0.6)).current;
  const opacity2 = useRef(new Animated.Value(0.4)).current;
  const opacity3 = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    if (isRecording) {
      // Animation continue des waves
      const wave1Loop = Animated.loop(
        Animated.sequence([
          Animated.timing(wave1Anim, {
            toValue: -100,
            duration: 15000, // 15s comme dans le CSS
            useNativeDriver: true,
          }),
          Animated.timing(wave1Anim, {
            toValue: 0,
            duration: 15000,
            useNativeDriver: true,
          }),
        ])
      );

      const wave2Loop = Animated.loop(
        Animated.sequence([
          Animated.delay(5000), // animation-delay: -5s
          Animated.timing(wave2Anim, {
            toValue: -100,
            duration: 20000, // 20s
            useNativeDriver: true,
          }),
          Animated.timing(wave2Anim, {
            toValue: 0,
            duration: 20000,
            useNativeDriver: true,
          }),
        ])
      );

      const wave3Loop = Animated.loop(
        Animated.sequence([
          Animated.timing(wave3Anim, {
            toValue: -100,
            duration: 12000, // 12s plus rapide
            useNativeDriver: true,
          }),
          Animated.timing(wave3Anim, {
            toValue: 0,
            duration: 12000,
            useNativeDriver: true,
          }),
        ])
      );

      // Animation opacité pour effet pulse
      const opacity1Loop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity1, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity1, {
            toValue: 0.4,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      const opacity2Loop = Animated.loop(
        Animated.sequence([
          Animated.delay(1000),
          Animated.timing(opacity2, {
            toValue: 0.6,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity2, {
            toValue: 0.2,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      );

      const opacity3Loop = Animated.loop(
        Animated.sequence([
          Animated.delay(1500),
          Animated.timing(opacity3, {
            toValue: 0.4,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity3, {
            toValue: 0.1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );

      wave1Loop.start();
      wave2Loop.start();
      wave3Loop.start();
      opacity1Loop.start();
      opacity2Loop.start();
      opacity3Loop.start();

      return () => {
        wave1Loop.stop();
        wave2Loop.stop();
        wave3Loop.stop();
        opacity1Loop.stop();
        opacity2Loop.stop();
        opacity3Loop.stop();
      };
    }
  }, [isRecording]);

  // Réaction au niveau audio
  useEffect(() => {
    if (audioLevel > 0) {
      Animated.parallel([
        Animated.timing(opacity1, {
          toValue: 0.2 + (audioLevel * 0.6),
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 0.1 + (audioLevel * 0.5),
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity3, {
          toValue: 0.05 + (audioLevel * 0.35),
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [audioLevel]);

  return (
    <Svg 
      width={width} 
      height={250} 
      viewBox="0 0 1000 250" 
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
    >
      <Defs>
        {/* Gradient principal (effet liquid glass) */}
        <LinearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#00FFB0" stopOpacity="0.05" />
          <Stop offset="30%" stopColor="#00FFB0" stopOpacity="0.12" />
          <Stop offset="50%" stopColor="#00FFB0" stopOpacity="0.15" />
          <Stop offset="70%" stopColor="#00FFB0" stopOpacity="0.12" />
          <Stop offset="100%" stopColor="#00FFB0" stopOpacity="0.05" />
        </LinearGradient>

        {/* Gradient secondaire */}
        <LinearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#00FFB0" stopOpacity="0.03" />
          <Stop offset="50%" stopColor="#00FFB0" stopOpacity="0.10" />
          <Stop offset="100%" stopColor="#00FFB0" stopOpacity="0.03" />
        </LinearGradient>

        {/* Gradient tertiaire */}
        <LinearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#00FFB0" stopOpacity="0.02" />
          <Stop offset="50%" stopColor="#00FFB0" stopOpacity="0.08" />
          <Stop offset="100%" stopColor="#00FFB0" stopOpacity="0.02" />
        </LinearGradient>
      </Defs>

      {/* Wave 1 - Avant-plan */}
      <AnimatedG 
        style={{ 
          transform: [{ translateX: wave1Anim }],
          opacity: opacity1 
        }}
      >
        <Path
          d="M0,100 C 150,50 350,150 500,100 C 650,50 850,150 1000,100 V 250 H 0 Z"
          fill="url(#waveGradient1)"
        />
        {/* Dupliquer pour effet continu */}
        <Path
          d="M1000,100 C 1150,50 1350,150 1500,100 C 1650,50 1850,150 2000,100 V 250 H 1000 Z"
          fill="url(#waveGradient1)"
        />
      </AnimatedG>

      {/* Wave 2 - Milieu */}
      <AnimatedG 
        style={{ 
          transform: [{ translateX: wave2Anim }],
          opacity: opacity2 
        }}
      >
        <Path
          d="M0,120 C 120,70 300,130 480,80 C 660,30 880,110 1000,60 V 250 H 0 Z"
          fill="url(#waveGradient2)"
        />
        <Path
          d="M1000,120 C 1120,70 1300,130 1480,80 C 1660,30 1880,110 2000,60 V 250 H 1000 Z"
          fill="url(#waveGradient2)"
        />
      </AnimatedG>

      {/* Wave 3 - Arrière-plan */}
      <AnimatedG 
        style={{ 
          transform: [{ translateX: wave3Anim }],
          opacity: opacity3 
        }}
      >
        <Path
          d="M0,80 C 100,130 280,70 450,120 C 630,170 820,90 1000,140 V 250 H 0 Z"
          fill="url(#waveGradient3)"
        />
        <Path
          d="M1000,80 C 1100,130 1280,70 1450,120 C 1630,170 1820,90 2000,140 V 250 H 1000 Z"
          fill="url(#waveGradient3)"
        />
      </AnimatedG>
    </Svg>
  );
}
