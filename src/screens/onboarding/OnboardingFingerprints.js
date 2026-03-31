import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlow } from '../../contexts/GlowContext';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const FINGERPRINTS_KEY = '@noctaliae_user_fingerprints';
const ONBOARDING_COMPLETED_KEY = '@noctaliae_onboarding_completed';

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
  cardSelected: 'rgba(210, 177, 76, 0.13)',
  cardBorderSelected: '#D2B14C',
  violet: 'rgba(100, 60, 180, 0.18)',
  indigo: 'rgba(60, 80, 200, 0.12)',
  divider: 'rgba(255,255,255,0.06)',
};

const PHOSPHENE_DATA = [
  { x: 0.82, y: 0.04, size: 2,   dur: 7500, delay: 500 },
  { x: 0.10, y: 0.22, size: 1.5, dur: 8000, delay: 1400 },
  { x: 0.60, y: 0.45, size: 2.5, dur: 6200, delay: 0 },
  { x: 0.93, y: 0.62, size: 1.5, dur: 9000, delay: 2000 },
  { x: 0.28, y: 0.78, size: 2,   dur: 7000, delay: 800 },
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
// 🏷️ CATÉGORIES DE TAGS
// ============================================
const TAG_CATEGORIES_BASE = [
  {
    id: 'personality',
    labelKey: 'onboarding.fingerprints.catPersonality',
    icon: '🧠',
    tags: ['Introverti', 'Extraverti', 'Analytique', 'Empathique', 'Créatif', 'Intuitif', 'Rationnel', 'Sensible'],
  },
  {
    id: 'life',
    labelKey: 'onboarding.fingerprints.catLife',
    icon: '🌱',
    tags: ['Parent', 'Étudiant', 'Artiste', 'Entrepreneur', 'Soignant', 'En transition', 'Voyageur', 'Télétravaill.'],
  },
  {
    id: 'inner',
    labelKey: 'onboarding.fingerprints.catInner',
    icon: '🌊',
    tags: ['Anxiété', 'Nostalgie', 'Ambition', 'Deuil', 'Transformation', 'Sérénité', 'Doute', 'Curiosité'],
  },
  {
    id: 'habits',
    labelKey: 'onboarding.fingerprints.catHabits',
    icon: '⚡',
    tags: ['Méditation', 'Sport intense', 'Travail de nuit', 'Voyage fréquent', 'Lecture', 'Musique', 'Nature', 'Tech'],
  },
];

// ============================================
// Tag chip
// ============================================
function TagChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.tag,
        selected
          ? { backgroundColor: OB.cardSelected, borderColor: OB.cardBorderSelected }
          : { backgroundColor: OB.card, borderColor: OB.cardBorder },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.75}
    >
      <Text style={[styles.tagText, { color: selected ? OB.accent : OB.textSub }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================
// Section avec accordion
// ============================================
function TagSection({ category, selectedTags, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const rotate = useRef(new Animated.Value(1)).current;

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(rotate, {
      toValue: expanded ? 0 : 1, duration: 200, useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const selectedCount = category.tags.filter(t => selectedTags.includes(t)).length;

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.sectionIcon}>{category.icon}</Text>
        <Text style={styles.sectionTitle}>{category.label}</Text>
        {selectedCount > 0 && (
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{selectedCount}</Text>
          </View>
        )}
        <Animated.View style={{ transform: [{ rotate: spin }], marginLeft: 'auto' }}>
          <MaterialIcons name="keyboard-arrow-down" size={20} color={OB.textMuted} />
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.tagsWrap}>
          {category.tags.map(tag => (
            <TagChip
              key={tag}
              label={tag}
              selected={selectedTags.includes(tag)}
              onPress={() => onToggle(tag)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================
// Helper validation
// ============================================
function hasValidUserData(markers, selectedTags, customTags) {
  let count = 0;
  if (markers) {
    ['ageRange', 'rhythm', 'mood'].forEach(f => { if (markers[f] && markers[f] !== 'not_sure') count++; });
  }
  count += selectedTags.length + customTags.length;
  return { hasData: count > 0, count };
}

// ============================================
// 🌙 ONBOARDING FINGERPRINTS
// ============================================
export default function OnboardingFingerprints({ route, navigation }) {
  const { triggerCelebration } = useGlow();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const TAG_CATEGORIES = TAG_CATEGORIES_BASE.map(cat => ({ ...cat, label: t(cat.labelKey) }));
  const { markers } = route.params || {};

  const [selectedTags, setSelectedTags] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTagText, setNewTagText] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleToggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = newTagText.trim();
    if (!trimmed || customTags.includes(trimmed)) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCustomTags(prev => [...prev, trimmed]);
    setNewTagText('');
    setShowAddModal(false);
  };

  const handleRemoveCustomTag = (tag) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomTags(prev => prev.filter(t => t !== tag));
  };

  const handleFinish = async () => {
    const userData = hasValidUserData(markers, selectedTags, customTags);
    if (!userData.hasData) {
      setShowConfirmModal(true);
      return;
    }
    await saveFingerprints();
  };

  const saveFingerprints = async () => {
    setIsSaving(true);
    try {
      const fingerprints = [];
      if (markers) {
        const markerMap = {
          ageRange: "Tranche d'âge",
          rhythm: 'Rythme de vie',
          mood: "État d'esprit",
        };
        Object.entries(markerMap).forEach(([key, label]) => {
          if (markers[key] && markers[key] !== 'not_sure') {
            fingerprints.push({
              id: `marker_${key}_${Date.now()}`,
              text: `${label} : ${markers[key]}`,
              createdAt: new Date().toISOString(),
              source: 'onboarding',
            });
          }
        });
      }
      [...selectedTags, ...customTags].forEach((tag, i) => {
        fingerprints.push({
          id: `tag_${Date.now()}_${i}`,
          text: tag,
          createdAt: new Date().toISOString(),
          source: 'onboarding',
        });
      });
      await completeOnboarding(fingerprints);
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder', [{ text: 'OK' }], { userInterfaceStyle: 'dark' });
      setIsSaving(false);
    }
  };

  const completeOnboarding = async (fingerprints) => {
    await AsyncStorage.setItem(FINGERPRINTS_KEY, JSON.stringify(fingerprints));
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    triggerCelebration(5000);
    navigation.replace('OnboardingDeepDream');
  };

  const totalSelected = selectedTags.length + customTags.length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.glowViolet} />
      <View style={styles.glowIndigo} />
      {PHOSPHENE_DATA.map((p, i) => <Phosphene key={i} {...p} />)}

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={OB.textSub} />
        </TouchableOpacity>
        <ProgressDots current={2} total={3} />
        <TouchableOpacity onPress={() => completeOnboarding([])} style={styles.skipBtn}>
          <Text style={styles.skipBtnText}>{t('onboarding.fingerprints.skip')}</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('onboarding.fingerprints.title')}</Text>
        <Text style={styles.subtitle}>
          {t('onboarding.fingerprints.subtitle')}{'\n'}
          <Text style={{ color: OB.textMuted }}>{t('onboarding.fingerprints.subtitleSub')}</Text>
        </Text>

        {/* Catégories de tags */}
        {TAG_CATEGORIES.map(cat => (
          <TagSection
            key={cat.id}
            category={cat}
            selectedTags={selectedTags}
            onToggle={handleToggleTag}
          />
        ))}

        {/* Tags custom */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>✏️</Text>
            <Text style={styles.sectionTitle}>{t('onboarding.fingerprints.custom')}</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={16} color={OB.bg} />
              <Text style={styles.addBtnText}>{t('onboarding.fingerprints.addBtn')}</Text>
            </TouchableOpacity>
          </View>

          {customTags.length > 0 ? (
            <View style={styles.tagsWrap}>
              {customTags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, { backgroundColor: OB.cardSelected, borderColor: OB.cardBorderSelected }]}
                  onPress={() => handleRemoveCustomTag(tag)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tagText, { color: OB.accent }]}>{tag}</Text>
                  <MaterialIcons name="close" size={13} color={OB.accent} style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyCustom}>{t('onboarding.fingerprints.emptyCustom')}</Text>
          )}
        </View>

        {/* Note */}
        {totalSelected > 0 && (
          <View style={styles.noteRow}>
            <MaterialCommunityIcons name="check-circle-outline" size={16} color={OB.accent} />
            <Text style={styles.noteText}>
              {t('onboarding.fingerprints.note', { count: totalSelected })}
            </Text>
          </View>
        )}

        <View style={{ height: 140 }} />
      </Animated.ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleFinish}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <Text style={styles.primaryButtonText}>{t('onboarding.fingerprints.saving')}</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={22} color={OB.bg} />
              <Text style={styles.primaryButtonText}>{t('onboarding.fingerprints.finish')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal: ajouter tag custom */}
      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('onboarding.fingerprints.modalAdd_title')}</Text>
              <Text style={styles.modalSub}>{t('onboarding.fingerprints.modalAdd_subtitle')}</Text>
              <TextInput
                style={styles.modalInput}
                placeholder={t('onboarding.fingerprints.modalAdd_placeholder')}
                placeholderTextColor={OB.textMuted}
                value={newTagText}
                onChangeText={setNewTagText}
                maxLength={40}
                autoFocus
                onSubmitEditing={handleAddCustomTag}
                returnKeyType="done"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { borderColor: OB.cardBorder }]}
                  onPress={() => { setShowAddModal(false); setNewTagText(''); }}
                >
                  <Text style={[styles.modalBtnText, { color: OB.textSub }]}>{t('onboarding.fingerprints.modalAdd_cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: newTagText.trim() ? OB.accent : OB.card, borderColor: 'transparent' }]}
                  onPress={handleAddCustomTag}
                  disabled={!newTagText.trim()}
                >
                  <Text style={[styles.modalBtnText, { color: newTagText.trim() ? OB.bg : OB.textMuted }]}>{t('onboarding.fingerprints.modalAdd_confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal: confirmer sans données */}
      <Modal visible={showConfirmModal} transparent animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('onboarding.fingerprints.modalConfirm_title')}</Text>
            <Text style={styles.modalSub}>
              {t('onboarding.fingerprints.modalConfirm_subtitle')}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: OB.cardBorder }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: OB.textSub }]}>{t('onboarding.fingerprints.modalConfirm_back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: OB.accent, borderColor: 'transparent' }]}
                onPress={() => { setShowConfirmModal(false); completeOnboarding([]); }}
              >
                <Text style={[styles.modalBtnText, { color: OB.bg }]}>{t('onboarding.fingerprints.modalConfirm_finish')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  skipBtn: { paddingHorizontal: 4, paddingVertical: 8 },
  skipBtnText: { fontSize: 15, color: OB.textMuted, fontFamily: 'AtkinsonHyperlegibleNext-Regular' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  title: {
    fontSize: 34, color: OB.text, fontFamily: 'CormorantUpright-Bold',
    marginBottom: 8, lineHeight: 40,
  },
  subtitle: {
    fontSize: 15, color: OB.textSub, lineHeight: 22,
    marginBottom: 28, fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },

  // Section
  section: {
    marginBottom: 20,
    backgroundColor: OB.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: OB.cardBorder,
    overflow: 'hidden',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: {
    fontSize: 14, color: OB.text,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  sectionBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: OB.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionBadgeText: {
    fontSize: 11, color: OB.bg,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },

  // Tags
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  tagText: {
    fontSize: 13, fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },

  // Bouton + ajouter
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: OB.accent,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, marginLeft: 'auto',
  },
  addBtnText: {
    fontSize: 12, color: OB.bg,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  emptyCustom: {
    fontSize: 13, color: OB.textMuted,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    fontStyle: 'italic',
  },

  // Note
  noteRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: OB.accentGlow, borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(210, 177, 76, 0.15)',
    marginBottom: 8,
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

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 28,
  },
  modalContent: {
    width: '100%', maxWidth: 340,
    backgroundColor: '#0E1525',
    borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: OB.cardBorder,
  },
  modalTitle: {
    fontSize: 22, color: OB.text,
    fontFamily: 'CormorantUpright-Bold', marginBottom: 8,
  },
  modalSub: {
    fontSize: 14, color: OB.textSub, lineHeight: 20,
    marginBottom: 20, fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  modalInput: {
    backgroundColor: OB.card, borderColor: OB.cardBorder, borderWidth: 1,
    borderRadius: 10, padding: 14, fontSize: 15, color: OB.text,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular', marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', borderWidth: 1,
  },
  modalBtnText: { fontSize: 15, fontFamily: 'AtkinsonHyperlegibleNext-Bold' },
});
