/**
 * QuickRecordScreen — Écran "mode réveil"
 * Minimaliste, pensé pour être utilisé à moitié endormi.
 * Accessible depuis la notification quotidienne.
 *
 * Flux : [Gros bouton] → Enregistrement → Transcription → PostRecordingScreen
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../config/theme';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { saveDream } from '../services/storageService';
import { transcribeAudio, analyzeImageDream } from '../services/apiService';

const { width, height } = Dimensions.get('window');

// --- Petite étoile scintillante ---
function Star({ x, y, size, delay }) {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.2, duration: 1200, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#fff',
        opacity,
      }}
    />
  );
}

// Génération déterministe des étoiles (pas de random au render)
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: ((i * 137.5) % 1) * width,   // distribution pseudo-aléatoire
  y: ((i * 97.3) % 1) * height * 0.7,
  size: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5,
  delay: (i * 200) % 2000,
}));

export default function QuickRecordScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // États enregistrement
  const [phase, setPhase] = useState('idle'); // idle | recording | transcribing | writing
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef(null);
  const timerRef = useRef(null);

  // Écriture manuelle
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writtenText, setWrittenText] = useState('');

  // Choix source photo
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Animation pulse du bouton
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  // Heure actuelle
  const [currentTime, setCurrentTime] = useState(getTime());
  function getTime() {
    return new Date().toLocaleTimeString(i18next.language, { hour: '2-digit', minute: '2-digit' });
  }
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(getTime()), 10000);
    return () => clearInterval(id);
  }, []);

  // Animation idle : léger pulse permanent
  useEffect(() => {
    if (phase === 'idle') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 1400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.8, duration: 1400, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      glowAnim.stopAnimation();
      // Recording : pulse plus rapide
      if (phase === 'recording') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          ])
        ).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0.5, duration: 600, useNativeDriver: true }),
          ])
        ).start();
      }
    }
  }, [phase]);

  // Timer enregistrement
  useEffect(() => {
    if (phase === 'recording') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  function formatDuration(s) {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  }

  async function handleStartRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setDuration(0);
      setPhase('recording');
    } catch (err) {
      console.error('❌ QuickRecord start:', err);
    }
  }

  async function handleStopRecording() {
    if (!recordingRef.current) return;
    try {
      setPhase('transcribing');
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error('URI invalide');

      const transcript = await transcribeAudio(uri);
      const newDream = await saveDream(uri, transcript);

      navigation.replace('PostRecording', {
        dreamId: newDream.id,
        audioUri: uri,
        transcription: transcript,
        duration,
        source: 'quick-record',
      });
    } catch (err) {
      console.error('❌ QuickRecord stop:', err);
      setPhase('idle');
    }
  }

  async function handlePickFromGallery() {
    setShowPhotoModal(false);
    try {
      // Le Photo Picker natif Android (API 33+) ne nécessite aucune permission :
      // ne pas appeler requestMediaLibraryPermissionsAsync() ici (policy Google Play).
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.7,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setPhase('transcribing');
      const transcript = await analyzeImageDream(asset.base64, asset.mimeType || 'image/jpeg');
      const newDream = await saveDream(null, transcript);
      navigation.replace('PostRecording', {
        dreamId: newDream.id,
        audioUri: null,
        transcription: transcript,
        duration: 0,
        source: 'photo-gallery',
      });
    } catch (err) {
      console.error('❌ QuickRecord galerie:', err);
      setPhase('idle');
    }
  }

  async function handlePickFromCamera() {
    setShowPhotoModal(false);
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) return;
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.7,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setPhase('transcribing');
      const transcript = await analyzeImageDream(asset.base64, asset.mimeType || 'image/jpeg');
      const newDream = await saveDream(null, transcript);
      navigation.replace('PostRecording', {
        dreamId: newDream.id,
        audioUri: null,
        transcription: transcript,
        duration: 0,
        source: 'photo-camera',
      });
    } catch (err) {
      console.error('❌ QuickRecord camera:', err);
      setPhase('idle');
    }
  }

  async function handleWriteSubmit() {
    const text = writtenText.trim();
    if (!text) return;
    setShowWriteModal(false);
    setWrittenText('');
    setPhase('transcribing');
    try {
      const newDream = await saveDream(null, text);
      navigation.replace('PostRecording', {
        dreamId: newDream.id,
        audioUri: null,
        transcription: text,
        duration: 0,
        source: 'write',
      });
    } catch (err) {
      console.error('❌ QuickRecord write:', err);
      setPhase('idle');
    }
  }

  function handleClose() {
    if (phase === 'recording') {
      handleStopRecording();
    } else {
      navigation.goBack();
    }
  }

  // --- RENDU ---
  return (
    <View style={styles.container}>
      {/* Fond gradient */}
      <LinearGradient
        colors={['#070914', '#0c0e27', '#0f1235']}
        style={StyleSheet.absoluteFill}
      />

      {/* Halo central ambiant */}
      <Animated.View
        style={[
          styles.halo,
          {
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Étoiles */}
      {STARS.map(s => (
        <Star key={s.id} x={s.x} y={s.y} size={s.size} delay={s.delay} />
      ))}

      {/* Bouton fermer */}
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 16 }]}
        onPress={handleClose}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialIcons
          name={phase === 'recording' ? 'check' : 'close'}
          size={24}
          color={phase === 'recording' ? THEME.colors.primary : THEME.colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Contenu central */}
      <View style={styles.content}>

        {/* Heure */}
        <Text style={styles.time}>{currentTime}</Text>
        <Text style={styles.label}>
          {phase === 'idle'
            ? t('quickRecord.label_idle')
            : phase === 'recording'
            ? t('quickRecord.label_recording')
            : t('quickRecord.label_transcribing')}
        </Text>

        {/* Timer enregistrement */}
        {phase === 'recording' && (
          <Text style={styles.timer}>{formatDuration(duration)}</Text>
        )}

        {/* Bouton principal */}
        <View style={styles.btnWrapper}>
          {/* Glow ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowAnim,
                transform: [{ scale: pulseAnim }],
                borderColor: phase === 'recording'
                  ? 'rgba(255, 80, 80, 0.5)'
                  : 'rgba(0, 255, 176, 0.4)',
              },
            ]}
          />

          {phase === 'transcribing' ? (
            // Loader transcription
            <View style={[styles.mainBtn, styles.mainBtnTranscribing]}>
              <ActivityIndicator size="large" color={THEME.colors.primary} />
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={phase === 'idle' ? handleStartRecording : handleStopRecording}
            >
              <Animated.View
                style={[
                  styles.mainBtn,
                  phase === 'recording' && styles.mainBtnRecording,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <MaterialIcons
                  name={phase === 'idle' ? 'mic' : 'stop'}
                  size={52}
                  color={phase === 'recording' ? '#fff' : THEME.colors.background}
                />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>

        {/* Sous-label */}
        <Text style={styles.hint}>
          {phase === 'idle'
            ? t('quickRecord.hint_idle')
            : phase === 'recording'
            ? t('quickRecord.hint_recording')
            : ' '}
        </Text>

        {/* Boutons secondaires — photo & écrire */}
        {phase === 'idle' && (
          <View style={styles.secondaryRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowPhotoModal(true)} activeOpacity={0.7}>
              <MaterialIcons name="photo-camera" size={22} color={THEME.colors.textSecondary} />
              <Text style={styles.secondaryLabel}>{t('quickRecord.tabPhoto')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowWriteModal(true)} activeOpacity={0.7}>
              <MaterialIcons name="edit" size={22} color={THEME.colors.textSecondary} />
              <Text style={styles.secondaryLabel}>{t('quickRecord.tabWrite')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal choix source photo */}
      <Modal visible={showPhotoModal} transparent animationType="slide" onRequestClose={() => setShowPhotoModal(false)}>
        <View style={styles.writeOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowPhotoModal(false)} />
          <View style={styles.writeContainer}>
            <Text style={styles.writeTitle}>{t('quickRecord.sourceTitle')}</Text>
            <TouchableOpacity style={styles.photoChoiceBtn} onPress={handlePickFromCamera} activeOpacity={0.8}>
              <MaterialIcons name="photo-camera" size={24} color={THEME.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.photoChoiceLabel}>{t('quickRecord.camera')}</Text>
                <Text style={styles.photoChoiceHint}>{t('quickRecord.cameraDesc')}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoChoiceBtn} onPress={handlePickFromGallery} activeOpacity={0.8}>
              <MaterialIcons name="photo-library" size={24} color={THEME.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.photoChoiceLabel}>{t('quickRecord.gallery')}</Text>
                <Text style={styles.photoChoiceHint}>{t('quickRecord.galleryDesc')}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.writeCancelBtn} onPress={() => setShowPhotoModal(false)}>
              <Text style={styles.writeCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal écriture */}
      <Modal visible={showWriteModal} transparent animationType="slide" onRequestClose={() => setShowWriteModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.writeOverlay}>
          <View style={styles.writeContainer}>
            <Text style={styles.writeTitle}>{t('quickRecord.voiceTitle')}</Text>
            <TextInput
              style={styles.writeInput}
              multiline
              autoFocus
              placeholder={t('quickRecord.placeholder')}
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={writtenText}
              onChangeText={setWrittenText}
              textAlignVertical="top"
            />
            <View style={styles.writeActions}>
              <TouchableOpacity style={styles.writeCancelBtn} onPress={() => { setShowWriteModal(false); setWrittenText(''); }}>
                <Text style={styles.writeCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.writeSubmitBtn, !writtenText.trim() && { opacity: 0.4 }]}
                onPress={handleWriteSubmit}
                disabled={!writtenText.trim()}
              >
                <MaterialIcons name="arrow-forward" size={20} color="#0c0e27" />
                <Text style={styles.writeSubmitText}>{t('quickRecord.analyzeCta')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Bas de l'écran : credit */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.footerText}>🌙 Noctaliæ</Text>
      </View>
    </View>
  );
}

const BTN_SIZE = 120;
const GLOW_SIZE = BTN_SIZE + 48;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070914',
  },
  halo: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 255, 176, 0.06)',
    alignSelf: 'center',
    top: height / 2 - 160,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  time: {
    fontSize: 72,
    fontFamily: 'CormorantUpright-Regular',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
    marginBottom: 8,
  },
  label: {
    fontSize: 18,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  timer: {
    fontSize: 44,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.primary,
    marginBottom: 16,
    letterSpacing: 2,
  },
  btnWrapper: {
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  glowRing: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    borderWidth: 1.5,
  },
  mainBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
    }),
  },
  mainBtnRecording: {
    backgroundColor: '#FF4444',
    ...Platform.select({
      ios: {
        shadowColor: '#FF4444',
        shadowOpacity: 0.7,
        shadowRadius: 24,
      },
    }),
  },
  mainBtnTranscribing: {
    backgroundColor: 'rgba(0,255,176,0.1)',
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
  },
  hint: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'CormorantUpright-Regular',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 2,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 28,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondaryLabel: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.5,
  },
  writeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  writeContainer: {
    backgroundColor: '#12153a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  writeTitle: {
    fontSize: 20,
    fontFamily: 'CormorantUpright-SemiBold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  writeInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    minHeight: 160,
    maxHeight: 280,
  },
  writeActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  writeCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  photoChoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  photoChoiceLabel: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#fff',
    marginBottom: 2,
  },
  photoChoiceHint: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
  },
  writeCancelText: {
    color: THEME.colors.textSecondary,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    fontSize: 15,
  },
  writeSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  writeSubmitText: {
    color: '#0c0e27',
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    fontSize: 15,
  },
});
