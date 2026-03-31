import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const OB = {
  bg: '#060A14',
  accent: '#D2B14C',
  accentGlow: 'rgba(210, 177, 76, 0.12)',
  text: '#F0EBE0',
  textSub: 'rgba(240, 235, 224, 0.55)',
  textMuted: 'rgba(240, 235, 224, 0.22)',
  violet: 'rgba(100, 60, 180, 0.20)',
  indigo: 'rgba(60, 80, 200, 0.13)',
  green: 'rgba(57, 255, 136, 0.07)',
};

// ============================================
// ✨ PHOSPHÈNES
// ============================================
const PHOSPHENE_DATA = [
  { x: 0.08, y: 0.10, size: 2,   dur: 7000, delay: 0 },
  { x: 0.88, y: 0.08, size: 1.5, dur: 8500, delay: 1200 },
  { x: 0.92, y: 0.42, size: 2,   dur: 6500, delay: 400 },
  { x: 0.05, y: 0.60, size: 1.5, dur: 9000, delay: 2000 },
  { x: 0.82, y: 0.75, size: 2.5, dur: 7500, delay: 800 },
  { x: 0.18, y: 0.85, size: 1.5, dur: 6000, delay: 1600 },
];

function Phosphene({ x, y, size, dur, delay }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 0.5, duration: dur / 2, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.04, duration: dur / 2, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute',
      left: x * SCREEN_W, top: y * SCREEN_H,
      width: size, height: size, borderRadius: size,
      backgroundColor: OB.accent, opacity,
    }} />
  );
}

// ============================================
// 🌙 ONBOARDING WELCOME
// ============================================
export default function OnboardingWelcome({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // Animations séquencées
  const fadeLogo    = useRef(new Animated.Value(0)).current;
  const scaleLogo   = useRef(new Animated.Value(0.88)).current;
  const fadeTitle   = useRef(new Animated.Value(0)).current;
  const slideTitle  = useRef(new Animated.Value(14)).current;
  const fadeSub     = useRef(new Animated.Value(0)).current;
  const fadePillars = useRef(new Animated.Value(0)).current;
  const fadeButton  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(150),
      // Logo apparaît
      Animated.parallel([
        Animated.timing(fadeLogo,  { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(scaleLogo, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
      Animated.delay(100),
      // Titre slide up
      Animated.parallel([
        Animated.timing(fadeTitle,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideTitle, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      // Sous-titre
      Animated.timing(fadeSub, { toValue: 1, duration: 500, useNativeDriver: true }),
      // Piliers
      Animated.timing(fadePillars, { toValue: 1, duration: 500, useNativeDriver: true }),
      // Bouton
      Animated.timing(fadeButton, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Lueurs de fond */}
      <View style={styles.glowViolet} />
      <View style={styles.glowIndigo} />
      <View style={styles.glowGreen} />
      {PHOSPHENE_DATA.map((p, i) => <Phosphene key={i} {...p} />)}

      {/* Layout fixe — pas de ScrollView */}
      <View style={[styles.inner, {
        paddingTop: Math.max(insets.top, 24) + 16,
        paddingBottom: Math.max(insets.bottom, 24) + 16,
      }]}>

        {/* ── ZONE HAUTE : logo + titre ── */}
        <View style={styles.topZone}>

          {/* Logo splash */}
          <Animated.View style={{
            opacity: fadeLogo,
            transform: [{ scale: scaleLogo }],
            alignItems: 'center',
          }}>
            <Image
              source={require('../../../assets/splash.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Titre Noctaliæ */}
          <Animated.View style={{
            opacity: fadeTitle,
            transform: [{ translateY: slideTitle }],
            alignItems: 'center',
          }}>
            <Text style={styles.welcomeText}>{t('onboarding.welcome.intro')}</Text>
            <Svg height="62" width="300">
              <Defs>
                <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0.3">
                  <Stop offset="0"    stopColor="#C9A84C" />
                  <Stop offset="0.35" stopColor="#F5E6A3" />
                  <Stop offset="0.65" stopColor="#D4B85A" />
                  <Stop offset="1"    stopColor="#A8893A" />
                </LinearGradient>
              </Defs>
              <SvgText
                fill="url(#goldGrad)"
                fontSize="50"
                fontFamily="CormorantUpright-Bold"
                x="150"
                y="50"
                textAnchor="middle"
              >
                Noctaliæ
              </SvgText>
            </Svg>
            {/* Ligne décorative or */}
            <View style={styles.titleLine} />
          </Animated.View>

          {/* Phrase forte */}
          <Animated.Text style={[styles.tagline, { opacity: fadeSub }]}>
            {t('onboarding.welcome.tagline')}{'\n'}
            <Text style={styles.taglineSub}>{t('onboarding.welcome.taglineSub')}</Text>
          </Animated.Text>
        </View>

        {/* ── ZONE MILIEU : 3 piliers compacts ── */}
        <Animated.View style={[styles.pillars, { opacity: fadePillars }]}>
          {[
            { icon: 'head-snowflake-outline', label: t('onboarding.welcome.pillar1') },
            { icon: 'fingerprint',            label: t('onboarding.welcome.pillar2') },
            { icon: 'shield-lock-outline',    label: t('onboarding.welcome.pillar3') },
          ].map((p, i) => (
            <View key={i} style={styles.pillarChip}>
              <MaterialCommunityIcons name={p.icon} size={15} color={OB.accent} />
              <Text style={styles.pillarLabel}>{p.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── ZONE BASSE : boutons ── */}
        <Animated.View style={[styles.bottomZone, { opacity: fadeButton }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('OnboardingMarkers')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>{t('onboarding.welcome.cta')}</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={OB.bg} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={async () => {
              await AsyncStorage.setItem('@noctaliae_onboarding_completed', 'true');
              navigation.dispatch(
                CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
              );
            }}
            activeOpacity={0.6}
          >
            <Text style={styles.skipButtonText}>{t('onboarding.welcome.skip')}</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OB.bg,
  },
  // Lueurs
  glowViolet: {
    position: 'absolute', top: -80, right: -60,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: OB.violet,
  },
  glowIndigo: {
    position: 'absolute', bottom: -40, left: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: OB.indigo,
  },
  glowGreen: {
    position: 'absolute',
    top: SCREEN_H * 0.18,
    left: SCREEN_W * 0.5 - 120,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: OB.green,
  },

  // Layout fixe
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },

  // Zone haute
  topZone: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 0,
  },
  logoImage: {
    width: SCREEN_W * 0.42,
    height: SCREEN_W * 0.42,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 15,
    color: OB.textMuted,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  titleLine: {
    width: 48,
    height: 1,
    backgroundColor: OB.accent,
    opacity: 0.5,
    marginTop: 10,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 18,
    color: OB.text,
    fontFamily: 'CormorantUpright-SemiBold',
    textAlign: 'center',
    lineHeight: 26,
  },
  taglineSub: {
    fontSize: 16,
    color: OB.textSub,
    fontFamily: 'CormorantUpright-Regular',
  },

  // Piliers compacts (chips horizontaux)
  pillars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  pillarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: OB.accentGlow,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(210, 177, 76, 0.15)',
  },
  pillarLabel: {
    fontSize: 12,
    color: OB.textSub,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },

  // Zone basse
  bottomZone: {
    gap: 4,
    paddingTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OB.accent,
    paddingVertical: 18,
    borderRadius: 14,
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: OB.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14 },
      android: { elevation: 8 },
    }),
  },
  primaryButtonText: {
    fontSize: 17,
    color: OB.bg,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    letterSpacing: 0.3,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  skipButtonText: {
    fontSize: 13,
    color: OB.textMuted,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    letterSpacing: 0.3,
  },
});
