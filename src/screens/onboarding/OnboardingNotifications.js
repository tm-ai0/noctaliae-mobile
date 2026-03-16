/**
 * OnboardingNotifications
 * Dernier écran onboarding — demande permission notifications.
 * Placé après OnboardingDeepDream → remplace le goHome() direct.
 * 
 * Design : cohérent avec OnboardingDeepDream (même palette OB).
 * Opt-in contextuel : explication claire avant la demande OS.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { notificationService } from '../../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Même palette que OnboardingDeepDream
const OB = {
  bg: '#060A14',
  accent: '#D2B14C',
  accentGlow: 'rgba(210, 177, 76, 0.12)',
  neon: '#00FFB0',
  neonGlow: 'rgba(0, 255, 176, 0.12)',
  text: '#F0EBE0',
  textSub: 'rgba(240, 235, 224, 0.55)',
  textMuted: 'rgba(240, 235, 224, 0.28)',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.06)',
  green: 'rgba(0, 255, 176, 0.10)',
};

const PHOSPHENE_DATA = [
  { x: 0.10, y: 0.12, size: 2,   dur: 8000, delay: 300 },
  { x: 0.88, y: 0.30, size: 1.5, dur: 7200, delay: 900 },
  { x: 0.45, y: 0.55, size: 2.5, dur: 6500, delay: 0 },
  { x: 0.75, y: 0.75, size: 1.5, dur: 9000, delay: 1800 },
];

function Phosphene({ x, y, size, dur, delay }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 0.35, duration: dur / 2, useNativeDriver: true }),
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
      backgroundColor: OB.neon, opacity,
    }} />
  );
}

// Ligne bénéfice
function BenefitRow({ icon, text, sub }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIconWrap}>
        <MaterialCommunityIcons name={icon} size={18} color={OB.neon} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.benefitText}>{text}</Text>
        {sub ? <Text style={styles.benefitSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

export default function OnboardingNotifications({ navigation }) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bellAnim = useRef(new Animated.Value(0)).current;
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(400),
        Animated.spring(bellAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const goHome = async () => {
    await AsyncStorage.setItem('@noctaliae_onboarding_completed', 'true');
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
    );
  };

  const handleActivate = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRequesting(true);
      const granted = await notificationService.requestPermissions();
      console.log(`🔔 Permission notifs onboarding: ${granted ? 'accordée' : 'refusée'}`);
      // Qu'elle soit accordée ou non, on continue
      await goHome();
    } catch (e) {
      console.error('❌ Permission notifs onboarding:', e);
      await goHome();
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Marquer comme demandé pour ne plus relancer au prochain lancement
    notificationService.getSettings().then(s =>
      notificationService.saveSettings({ ...s, permissionAsked: true })
    );
    await goHome();
  };

  const bellRotate = bellAnim.interpolate({
    inputRange: [0, 0.3, 0.6, 0.8, 1],
    outputRange: ['0deg', '18deg', '-14deg', '8deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background glows */}
      <View style={styles.glowGreen} />
      <View style={styles.glowGold} />
      {PHOSPHENE_DATA.map((p, i) => <Phosphene key={i} {...p} />)}

      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        {/* Progress dots */}
        <View style={[styles.progressRow, { paddingTop: Math.max(insets.top, 24) + 8 }]}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[styles.dot, i === 3 && styles.dotActive]} />
          ))}
        </View>

        {/* Bell animée */}
        <View style={styles.bellContainer}>
          <Animated.View style={{ transform: [{ rotate: bellRotate }, { scale: bellAnim }] }}>
            <View style={styles.bellWrap}>
              <MaterialCommunityIcons name="bell-ring-outline" size={52} color={OB.neon} />
            </View>
          </Animated.View>
        </View>

        {/* Headline */}
        <Text style={styles.title}>Ne laissez pas{'\n'}vos rêves s'effacer.</Text>
        <Text style={styles.subtitle}>
          La fenêtre hypnopompique dure{' '}
          <Text style={{ color: OB.neon }}>moins de 30 minutes</Text>
          {' '}après le réveil. Une notification au bon moment change tout.
        </Text>

        {/* Bénéfices */}
        <View style={styles.benefitsCard}>
          <BenefitRow
            icon="weather-sunset-up"
            text="Rappel au réveil"
            sub="Configurable dans les Paramètres"
          />
          <View style={styles.benefitDivider} />
          <BenefitRow
            icon="fire"
            text="Rappel de série le soir"
            sub="Ne cassez pas votre streak"
          />
          <View style={styles.benefitDivider} />
          <BenefitRow
            icon="microphone-outline"
            text="Bouton direct dans la notif"
            sub="Enregistrez en une touche, sans ouvrir l'app"
          />
        </View>

        {/* Note vie privée */}
        <View style={styles.privacyNote}>
          <MaterialIcons name="lock-outline" size={14} color={OB.textMuted} />
          <Text style={styles.privacyText}>
            Aucune donnée envoyée. Notifications entièrement locales.
          </Text>
        </View>
      </Animated.View>

      {/* Footer sticky */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
        <TouchableOpacity
          style={[styles.primaryButton, isRequesting && { opacity: 0.7 }]}
          onPress={handleActivate}
          disabled={isRequesting}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="bell-ring" size={20} color={OB.bg} />
          <Text style={styles.primaryButtonText}>
            {isRequesting ? 'Demande en cours…' : 'Activer les rappels'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>Pas maintenant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: OB.bg },
  glowGreen: {
    position: 'absolute', top: -60, left: -40,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: OB.green,
  },
  glowGold: {
    position: 'absolute', bottom: 80, right: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: OB.accentGlow,
  },
  inner: { flex: 1, paddingHorizontal: 24 },

  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 32,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: { backgroundColor: OB.neon, width: 18 },

  // Bell
  bellContainer: { alignItems: 'center', marginBottom: 28 },
  bellWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: OB.neonGlow,
    borderWidth: 1, borderColor: 'rgba(0,255,176,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Texts
  title: {
    fontSize: 36, color: OB.text,
    fontFamily: 'CormorantUpright-Bold',
    lineHeight: 42, marginBottom: 12,
  },
  subtitle: {
    fontSize: 15, color: OB.textSub,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    lineHeight: 22, marginBottom: 28,
  },

  // Benefits card
  benefitsCard: {
    backgroundColor: OB.card,
    borderRadius: 16, borderWidth: 1,
    borderColor: OB.cardBorder,
    padding: 16, marginBottom: 16,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 },
  benefitIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: OB.neonGlow,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  benefitText: {
    fontSize: 14, color: OB.text,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 2,
  },
  benefitSub: {
    fontSize: 12, color: OB.textMuted,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  benefitDivider: { height: 1, backgroundColor: OB.divider, marginVertical: 10 },

  // Privacy
  privacyNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center',
  },
  privacyText: {
    fontSize: 12, color: OB.textMuted,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },

  // Footer
  footer: {
    paddingHorizontal: 24, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: OB.divider,
    backgroundColor: OB.bg, gap: 12,
  },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: OB.neon,
    borderRadius: 14, paddingVertical: 17, gap: 8,
    ...Platform.select({
      ios: { shadowColor: OB.neon, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14 },
      android: { elevation: 10 },
    }),
  },
  primaryButtonText: {
    fontSize: 17, color: OB.bg,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold', letterSpacing: 0.3,
  },
  secondaryButton: { alignItems: 'center', paddingVertical: 12 },
  secondaryButtonText: {
    fontSize: 15, color: OB.textMuted,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
});
