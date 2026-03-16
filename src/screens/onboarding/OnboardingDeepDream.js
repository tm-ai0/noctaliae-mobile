import React, { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { premiumService } from '../../services/premiumService'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

const OB = {
  bg: '#060A14',
  accent: '#D2B14C',
  accentGlow: 'rgba(210, 177, 76, 0.12)',
  neon: '#00FFB0',
  neonGlow: 'rgba(0, 255, 176, 0.12)',
  blue: '#4F8DFF',
  blueGlow: 'rgba(79, 141, 255, 0.10)',
  text: '#F0EBE0',
  textSub: 'rgba(240, 235, 224, 0.55)',
  textMuted: 'rgba(240, 235, 224, 0.28)',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  cardSelectedBlue: 'rgba(79, 141, 255, 0.08)',
  cardBorderBlue: 'rgba(79, 141, 255, 0.5)',
  divider: 'rgba(255,255,255,0.06)',
  violet: 'rgba(100, 60, 180, 0.18)',
  indigo: 'rgba(60, 80, 200, 0.12)',
}

const PHOSPHENE_DATA = [
  { x: 0.85, y: 0.08, size: 2, dur: 7500, delay: 500 },
  { x: 0.12, y: 0.25, size: 1.5, dur: 8000, delay: 1400 },
  { x: 0.65, y: 0.48, size: 2.5, dur: 6200, delay: 0 },
  { x: 0.9, y: 0.65, size: 1.5, dur: 9000, delay: 2000 },
  { x: 0.3, y: 0.8, size: 2, dur: 7000, delay: 800 },
]

function Phosphene({ x, y, size, dur, delay }) {
  const opacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: dur / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.05,
          duration: dur / 2,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [])
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x * SCREEN_W,
        top: y * SCREEN_H,
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: OB.blue,
        opacity,
      }}
    />
  )
}

// ─── Feature row ──────────────────────────────────────────────────────────
function Feature({ icon, text }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconWrap}>
        <MaterialCommunityIcons name={icon} size={16} color={OB.blue} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────
export default function OnboardingDeepDream({ navigation }) {
  const insets = useSafeAreaInsets()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const cardScale = useRef(new Animated.Value(0.94)).current
  const [isActivating, setIsActivating] = useState(false)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // → OnboardingNotifications (demande permission notifs en dernier)
  const goHome = () => navigation.replace('OnboardingNotifications')

  const handleActivate = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setIsActivating(true)
      await premiumService.enablePremium()
      goHome()
    } catch (e) {
      console.error('❌ Activation DeepDream onboarding:', e)
      setIsActivating(false)
    }
  }

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    goHome()
  }

  return (
    <View style={styles.container}>
      {/* Background glows */}
      <View style={styles.glowBlue} />
      <View style={styles.glowIndigo} />
      {PHOSPHENE_DATA.map((p, i) => (
        <Phosphene key={i} {...p} />
      ))}

      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: Math.max(insets.top, 24) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Moon badge */}
          <View style={styles.moonBadge}>
            <Text style={styles.moonEmoji}>🌙</Text>
            <Text style={styles.moonLabel}>Noctaliæ</Text>
          </View>

          {/* Headline */}
          <Text style={styles.title}>Vous êtes prêt.</Text>
          <Text style={styles.subtitle}>
            Votre journal de rêves vous attend.{' '}
            <Text style={{ color: OB.textSub }}>
              Commencez dès maintenant — gratuit, sans limite.
            </Text>
          </Text>

          {/* QuickDream card — déjà actif */}
          <View style={styles.quickCard}>
            <View style={styles.quickCardLeft}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={20}
                color={OB.neon}
              />
              <View>
                <Text style={styles.quickTitle}>QuickDream</Text>
                <Text style={styles.quickSub}>
                  Gratuit · Illimité · Instantané
                </Text>
              </View>
            </View>
            <View style={styles.activeBadge}>
              <MaterialIcons name="check" size={13} color={OB.neon} />
              <Text style={styles.activeBadgeText}>Actif</Text>
            </View>
          </View>

          {/* Séparateur "aller plus loin" */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Ce qui vous attend</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* DeepDream card */}
          <Animated.View
            style={[styles.deepCard, { transform: [{ scale: cardScale }] }]}
          >
            {/* Barre accent gauche */}
            <View style={styles.deepAccentBar} />

            <View style={styles.deepHeader}>
              <MaterialCommunityIcons
                name="electron-framework"
                size={22}
                color={OB.blue}
              />
              <Text style={styles.deepTitle}>DeepDream Engine</Text>
            </View>

            <Text style={styles.deepTagline}>
              Analyse neuroscientifique avec les 6 frameworks de référence.
            </Text>

            <View style={styles.featureList}>
              <Feature icon="brain" text="6 grilles (Hobson, Domhoff, Jung…)" />
              <Feature
                icon="account-circle-outline"
                text="Réponses personnalisées à votre profil"
              />
              <Feature
                icon="image-outline"
                text="Image générée pour chaque rêve"
              />
              <Feature
                icon="coffee-outline"
                text="Soutient le développement du projet"
              />
              <Feature
                icon="message-text-outline"
                text="Exploration approfondie en conversation"
              />
            </View>

            {/* Teaser unlock — sans prix, sans friction */}
            <View style={styles.unlockTeaser}>
              <MaterialCommunityIcons name="lock-open-outline" size={14} color={OB.blue} />
              <Text style={styles.unlockTeaserText}>
                Disponible après votre première analyse — vous découvrirez la différence par vous-même.
              </Text>
            </View>
          </Animated.View>

          {/* Spacer */}
          <View style={{ height: 140 }} />
        </ScrollView>
      </Animated.View>

      {/* Footer sticky */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 20) + 20 },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSkip}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="moon-waning-crescent"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.primaryButtonText}>Commencer mon premier rêve</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: OB.bg },
  glowBlue: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: OB.blueGlow,
  },
  glowIndigo: {
    position: 'absolute',
    bottom: 60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: OB.indigo,
  },
  inner: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 20 },

  // Moon badge
  moonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  moonEmoji: { fontSize: 22 },
  moonLabel: {
    fontSize: 14,
    color: OB.textMuted,
    fontFamily: 'CormorantUpright-Bold',
    letterSpacing: 1.2,
  },

  // Headline
  title: {
    fontSize: 38,
    color: OB.text,
    fontFamily: 'CormorantUpright-Bold',
    lineHeight: 44,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: OB.text,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    lineHeight: 24,
    marginBottom: 28,
  },

  // QuickDream card
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: OB.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: OB.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  quickCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quickTitle: {
    fontSize: 15,
    color: OB.text,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 2,
  },
  quickSub: {
    fontSize: 12,
    color: OB.textMuted,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,255,176,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,176,0.25)',
  },
  activeBadgeText: {
    fontSize: 12,
    color: OB.neon,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: OB.divider },
  dividerText: {
    fontSize: 12,
    color: OB.textMuted,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    letterSpacing: 0.3,
  },

  // DeepDream card
  deepCard: {
    backgroundColor: OB.cardSelectedBlue,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: OB.cardBorderBlue,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: OB.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  deepAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: OB.blue,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  deepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  deepTitle: {
    fontSize: 18,
    color: OB.text,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  deepTagline: {
    fontSize: 14,
    color: OB.textSub,
    lineHeight: 20,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    marginBottom: 16,
  },

  // Features
  featureList: { gap: 10, marginBottom: 18 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: OB.blueGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 13,
    color: OB.text,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    flex: 1,
  },

  // Unlock teaser (remplace gift block)
  unlockTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(79,141,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(79,141,255,0.15)',
  },
  unlockTeaserText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: 'rgba(240,235,224,0.4)',
    lineHeight: 16,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: OB.divider,
    backgroundColor: OB.bg,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OB.blue,
    borderRadius: 14,
    paddingVertical: 17,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: OB.blue,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
      },
      android: { elevation: 10 },
    }),
  },
  primaryButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    letterSpacing: 0.3,
  },

})
