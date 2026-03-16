import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const OB = {
  bg: '#060A14',
  bgSheet: '#0D1220',
  accent: '#D2B14C',
  accentGlow: 'rgba(210, 177, 76, 0.12)',
  text: '#F0EBE0',
  textSub: 'rgba(240, 235, 224, 0.55)',
  textMuted: 'rgba(240, 235, 224, 0.28)',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  cardSelected: 'rgba(210, 177, 76, 0.10)',
  cardBorderSelected: '#D2B14C',
  violet: 'rgba(100, 60, 180, 0.18)',
  indigo: 'rgba(60, 80, 200, 0.12)',
  divider: 'rgba(255,255,255,0.06)',
};

// ============================================
// ✨ PHOSPHÈNES
// ============================================
const PHOSPHENE_DATA = [
  { x: 0.88, y: 0.06, size: 2,   dur: 7000, delay: 300 },
  { x: 0.15, y: 0.18, size: 1.5, dur: 8500, delay: 1000 },
  { x: 0.70, y: 0.35, size: 2.5, dur: 6000, delay: 200 },
  { x: 0.05, y: 0.52, size: 1.5, dur: 9000, delay: 1800 },
  { x: 0.92, y: 0.70, size: 2,   dur: 7500, delay: 600 },
  { x: 0.40, y: 0.82, size: 1.5, dur: 6500, delay: 2200 },
];

function Phosphene({ x, y, size, dur, delay }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 0.4, duration: dur / 2, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.05, duration: dur / 2, useNativeDriver: true }),
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
// 🔘 PROGRESS DOTS
// ============================================
function ProgressDots({ current, total }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{
          width: i === current ? 20 : 7, height: 7, borderRadius: 4,
          backgroundColor: i <= current ? OB.accent : OB.textMuted,
        }} />
      ))}
    </View>
  );
}

// ============================================
// 📋 BOTTOM SHEET PICKER
// ============================================
function BottomSheetPicker({ visible, title, options, selected, onSelect, onClose }) {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.sheetOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Handle */}
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>

          {options.map((opt, i) => {
            const isSelected = selected === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.sheetOption, i < options.length - 1 && styles.sheetOptionBorder]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(isSelected ? null : opt.id);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.sheetOptionEmoji}>{opt.emoji}</Text>
                <Text style={[styles.sheetOptionLabel, isSelected && { color: OB.accent }]}>
                  {opt.label}
                </Text>
                {isSelected && (
                  <MaterialCommunityIcons name="check" size={18} color={OB.accent} />
                )}
              </TouchableOpacity>
            );
          })}

          {/* Option "Pas trop sûr" / "Préfère ne pas dire" */}
          <TouchableOpacity
            style={[styles.sheetOption, { marginTop: 8, borderTopWidth: 1, borderTopColor: OB.divider }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(selected === 'not_sure' ? null : 'not_sure');
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View style={{ width: 28 }} />
            <Text style={[
              styles.sheetOptionLabel,
              { color: 'rgba(100, 180, 140, 0.5)', fontFamily: 'AtkinsonHyperlegibleNext-Regular' },
              selected === 'not_sure' && { color: 'rgba(100, 180, 140, 0.85)' }
            ]}>
              {title === "Tranche d'âge" ? 'Préfère ne pas dire' : 'Pas trop sûr'}
            </Text>
            {selected === 'not_sure' && (
              <MaterialCommunityIcons name="check" size={16} color="rgba(100, 180, 140, 0.85)" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ============================================
// 🎚️ SELECTOR ROW (déclenche le bottom sheet)
// ============================================
function SelectorRow({ label, icon, options, value, onPress }) {
  const selectedOption = options.find(o => o.id === value);
  const hasValue = value && value !== 'not_sure';
  const isNotSure = value === 'not_sure';

  return (
    <TouchableOpacity
      style={[
        styles.selectorRow,
        (hasValue || isNotSure) && styles.selectorRowSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.selectorLeft}>
        <Text style={styles.selectorIcon}>{icon}</Text>
        <View>
          <Text style={styles.selectorLabel}>{label}</Text>
          {selectedOption ? (
            <Text style={styles.selectorValue}>
              {selectedOption.emoji} {selectedOption.label}
            </Text>
          ) : isNotSure ? (
            <Text style={[styles.selectorValue, { color: OB.textMuted }]}>Pas trop sûr</Text>
          ) : (
            <Text style={styles.selectorPlaceholder}>Appuyez pour choisir</Text>
          )}
        </View>
      </View>
      <MaterialIcons
        name="keyboard-arrow-down"
        size={22}
        color={hasValue ? OB.accent : OB.textMuted}
      />
    </TouchableOpacity>
  );
}

// ============================================
// 🌙 ONBOARDING MARKERS
// ============================================
export default function OnboardingMarkers({ navigation }) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [selectedMarkers, setSelectedMarkers] = useState({
    ageRange: null,
    rhythm: null,
    mood: null,
  });

  const [openSheet, setOpenSheet] = useState(null); // 'age' | 'rhythm' | 'mood' | null

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const ageRanges = [
    { id: '18-25', label: '18–25 ans', emoji: '🌱' },
    { id: '26-35', label: '26–35 ans', emoji: '🌿' },
    { id: '36-50', label: '36–50 ans', emoji: '🌳' },
    { id: '50+',   label: '50+ ans',   emoji: '🌲' },
  ];

  const rhythms = [
    { id: 'calm',     label: 'Calme',     emoji: '🧘' },
    { id: 'balanced', label: 'Équilibré', emoji: '⚖️' },
    { id: 'dynamic',  label: 'Dynamique', emoji: '⚡' },
    { id: 'intense',  label: 'Intense',   emoji: '🔥' },
  ];

  const moods = [
    { id: 'serene',  label: 'Serein',  emoji: '😌' },
    { id: 'curious', label: 'Curieux', emoji: '🤔' },
    { id: 'anxious', label: 'Anxieux', emoji: '😰' },
    { id: 'joyful',  label: 'Joyeux',  emoji: '😊' },
  ];

  const hasSelection = selectedMarkers.ageRange || selectedMarkers.rhythm || selectedMarkers.mood;

  return (
    <View style={styles.container}>
      <View style={styles.glowViolet} />
      <View style={styles.glowIndigo} />
      {PHOSPHENE_DATA.map((p, i) => <Phosphene key={i} {...p} />)}

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={OB.textSub} />
        </TouchableOpacity>
        <ProgressDots current={1} total={3} />
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Quelques repères</Text>
        <Text style={styles.subtitle}>
          Tout est facultatif. Ce que vous partagez reste sur votre téléphone — et enrichit les analyses qui vous sont destinées.
        </Text>

        {/* Sélecteurs */}
        <View style={styles.selectorsCard}>
          <SelectorRow
            label="Tranche d'âge"
            icon="🌱"
            options={ageRanges}
            value={selectedMarkers.ageRange}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOpenSheet('age'); }}
          />
          <View style={styles.selectorDivider} />
          <SelectorRow
            label="Rythme de vie"
            icon="⚡"
            options={rhythms}
            value={selectedMarkers.rhythm}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOpenSheet('rhythm'); }}
          />
          <View style={styles.selectorDivider} />
          <SelectorRow
            label="État d'esprit"
            icon="🧠"
            options={moods}
            value={selectedMarkers.mood}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOpenSheet('mood'); }}
          />
        </View>

        {/* Note */}
        <View style={styles.noteRow}>
          <MaterialCommunityIcons name="shield-lock-outline" size={16} color={OB.accent} />
          <Text style={styles.noteText}>
            Ces informations restent uniquement sur votre téléphone et ne sont jamais partagées.
          </Text>
        </View>

        <View style={{ height: 140 }} />
      </Animated.ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('OnboardingFingerprints', { markers: selectedMarkers })}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>{hasSelection ? 'Continuer' : 'Passer'}</Text>
          <MaterialCommunityIcons name="arrow-right" size={22} color={OB.bg} />
        </TouchableOpacity>
        {!hasSelection && (
          <Text style={styles.skipHint}>Vous pourrez compléter dans Persona à tout moment</Text>
        )}
      </View>

      {/* Bottom Sheets */}
      <BottomSheetPicker
        visible={openSheet === 'age'}
        title="Tranche d'âge"
        options={ageRanges}
        selected={selectedMarkers.ageRange}
        onSelect={v => setSelectedMarkers(m => ({ ...m, ageRange: v }))}
        onClose={() => setOpenSheet(null)}
      />
      <BottomSheetPicker
        visible={openSheet === 'rhythm'}
        title="Rythme de vie"
        options={rhythms}
        selected={selectedMarkers.rhythm}
        onSelect={v => setSelectedMarkers(m => ({ ...m, rhythm: v }))}
        onClose={() => setOpenSheet(null)}
      />
      <BottomSheetPicker
        visible={openSheet === 'mood'}
        title="État d'esprit"
        options={moods}
        selected={selectedMarkers.mood}
        onSelect={v => setSelectedMarkers(m => ({ ...m, mood: v }))}
        onClose={() => setOpenSheet(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: OB.bg },
  glowViolet: {
    position: 'absolute', top: -60, right: -40,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: OB.violet,
  },
  glowIndigo: {
    position: 'absolute', bottom: 40, left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: OB.indigo,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 28 },
  title: {
    fontSize: 34, color: OB.text, fontFamily: 'CormorantUpright-Bold',
    marginBottom: 10, lineHeight: 40,
  },
  subtitle: {
    fontSize: 15, color: OB.textSub, lineHeight: 22,
    marginBottom: 32, fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },

  // Card des sélecteurs
  selectorsCard: {
    backgroundColor: OB.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: OB.cardBorder,
    overflow: 'hidden',
    marginBottom: 24,
  },
  selectorDivider: { height: 1, backgroundColor: OB.divider, marginHorizontal: 20 },

  // Selector row
  selectorRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 18, paddingHorizontal: 20,
  },
  selectorRowSelected: { backgroundColor: OB.cardSelected },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  selectorIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  selectorLabel: {
    fontSize: 13, color: OB.accent, fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2,
  },
  selectorValue: {
    fontSize: 15, color: OB.text, fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  selectorPlaceholder: {
    fontSize: 14, color: OB.textMuted, fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },

  // Note
  noteRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: OB.accentGlow, borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(210, 177, 76, 0.15)',
  },
  noteText: {
    flex: 1, fontSize: 13, color: OB.textSub, lineHeight: 19,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },

  // Footer
  footer: {
    paddingHorizontal: 28, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: OB.divider,
    backgroundColor: OB.bg,
  },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: OB.accent, paddingVertical: 18, borderRadius: 14, gap: 8,
    ...Platform.select({
      ios: { shadowColor: OB.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  primaryButtonText: {
    fontSize: 17, color: OB.bg, fontFamily: 'AtkinsonHyperlegibleNext-Bold', letterSpacing: 0.3,
  },
  skipHint: {
    fontSize: 13, color: OB.textMuted, textAlign: 'center', marginTop: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },

  // Bottom Sheet
  sheetOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: OB.bgSheet,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 40, paddingTop: 12,
    borderWidth: 1, borderBottomWidth: 0,
    borderColor: OB.cardBorder,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: OB.textMuted,
    alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 13, color: OB.accent,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    letterSpacing: 1.2, textTransform: 'uppercase',
    paddingHorizontal: 24, marginBottom: 8,
  },
  sheetOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 24, gap: 16,
  },
  sheetOptionBorder: {
    borderBottomWidth: 1, borderBottomColor: OB.divider,
  },
  sheetOptionEmoji: { fontSize: 22, width: 28, textAlign: 'center' },
  sheetOptionLabel: {
    flex: 1, fontSize: 16, color: OB.text,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
});
