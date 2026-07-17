// FORCE RELOAD - Build: 2025-12-20-SENTRY
// Theme version: 1.0.3 - Custom Fonts
import React, { useState, useCallback } from 'react'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { initSentry } from './src/config/sentry.config'
import Purchases from 'react-native-purchases'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
  Text,
  Animated,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Image,
} from 'react-native'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createNavigationContainerRef } from '@react-navigation/core'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Audio } from 'expo-av'
import { AudioModule } from 'expo-audio'
import * as ImagePicker from 'expo-image-picker'
import { ThemeProvider } from './src/config/ThemeContext'
import { THEME } from './src/config/theme'
import { GlowProvider } from './src/contexts/GlowContext'
import GlobalGlowOverlay from './src/components/GlobalGlowOverlay'
import { saveDream, saveAnalysis } from './src/services/storageService'
import { transcribeAudio, analyzeImageDream } from './src/services/apiService'
import OrganicBlobVisualizer from './src/components/OrganicBlobVisualizer'
import FABRecordButton from './src/components/FABRecordButton'
import CustomTabBar from './src/components/CustomTabBar'

import AnalysisScreen from './src/screens/AnalysisScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import AtlasScreen from './src/screens/AtlasScreen'
import TrendsScreen from './src/screens/TrendsScreen'
import ChatScreen from './src/screens/ChatScreen'
import VoiceAssistantScreen from './src/screens/VoiceAssistantScreen'
import PostRecordingScreen from './src/screens/PostRecordingScreen'
import ArchivesScreen from './src/screens/ArchivesScreen'
import ConversationScreen from './src/screens/ConversationScreen'
import DeepChatScreen from './src/screens/DeepChatScreen'
import GeminiLiveScreen from './src/screens/GeminiLiveScreen'
import MetaAnalysisScreen from './src/screens/MetaAnalysisScreen'
import PersonaScreen from './src/screens/PersonaScreen'
import OnboardingWelcome from './src/screens/onboarding/OnboardingWelcome'
import OnboardingMarkers from './src/screens/onboarding/OnboardingMarkers'
import OnboardingFingerprints from './src/screens/onboarding/OnboardingFingerprints'
import OnboardingDeepDream from './src/screens/onboarding/OnboardingDeepDream'
import OnboardingNotifications from './src/screens/onboarding/OnboardingNotifications'
import PlaygroundScreen from './src/screens/PlaygroundScreen'
import DecrypterScreen from './src/screens/DecrypterScreen'
import ExplorerScreen from './src/screens/ExplorerScreen'
import QuickRecordScreen from './src/screens/QuickRecordScreen'

export const navigationRef = createNavigationContainerRef()

import * as Notifications from 'expo-notifications'
import { secureStorageService } from './src/services/secureStorageService'
import { notificationService } from './src/services/notificationService'
import { streakService } from './src/services/streakService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sendInstallPing } from './src/services/installService'
import {
  shouldShowUpdateModal,
  dismissUpdate,
} from './src/services/updateService'
import { UpdateAvailableModal } from './src/modals/UpdateAvailableModal'
import { WhatsNewModal } from './src/modals/WhatsNewModal'
import { UpdateToast } from './src/components/UpdateToast'
import { freeTierService } from './src/services/freeTierService'
import { premiumService } from './src/services/premiumService'
import { ActivateDeepDreamModal } from './src/modals/ActivateDeepDreamModal'
import { initI18n } from './src/i18n'

const ONBOARDING_COMPLETED_KEY = '@noctaliae_onboarding_completed'
const WHATS_NEW_KEY = '@noctaliae_whats_new_1_4_0'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()
const { width } = Dimensions.get('window')

function MainTabsWithFAB({ navigation }) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('') // 🆕 Transcription live
  const [audioLevel, setAudioLevel] = useState(0) // 🆕 Niveau audio 0-1
  const [showWriteModal, setShowWriteModal] = useState(false) // ✏️ Modal écriture
  const [writtenDream, setWrittenDream] = useState('') // ✏️ Texte du rêve écrit

  // 📷 États photo
  const [showPhotoModal, setShowPhotoModal] = useState(false) // ActionSheet camera/galerie
  const [showPhotoPreview, setShowPhotoPreview] = useState(false) // Aperçu avant analyse
  const [selectedPhoto, setSelectedPhoto] = useState(null) // { uri, base64 }
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false) // Loader analyse
  const [showActivateModal, setShowActivateModal] = useState(false) // 🔒 Paywall photo

  // ✅ FIX: Utiliser Recording au lieu du hook
  const recordingRef = React.useRef(null)

  const intervalIdRef = React.useRef(null)
  const transcriptIntervalRef = React.useRef(null) // 🆕 Pour la transcription
  const audioLevelIntervalRef = React.useRef(null) // 🆕 Pour le niveau audio

  React.useEffect(() => {
    if (isRecording) {
      intervalIdRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
      if (transcriptIntervalRef.current) {
        clearInterval(transcriptIntervalRef.current)
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current)
      }
    }
  }, [isRecording])

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync()
      if (!granted) {
        Alert.alert(
          'Permission refusée',
          'Accès au microphone requis',
          [{ text: 'OK' }],
          { userInterfaceStyle: 'dark' }
        )
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      // ✅ Créer une nouvelle instance Recording avec expo-av
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )

      recordingRef.current = recording

      setIsRecording(true)
      setDuration(0)
      setLiveTranscript('') // Reset transcript
      setAudioLevel(0)

      // 🆕 Simuler la transcription live (remplacer par vraie API)
      startLiveTranscription()

      // 🆕 Simuler le niveau audio (remplacer par vraie API)
      startAudioLevelDetection()
    } catch (err) {
      console.error('❌ Erreur:', err)
      Alert.alert(
        'Erreur',
        "Impossible de démarrer l'enregistrement",
        [{ text: 'OK' }],
        { userInterfaceStyle: 'dark' }
      )
    }
  }

  // 🎤 Simulation niveau audio (expo-audio ne supporte pas metering pour l'instant)
  async function startAudioLevelDetection() {
    audioLevelIntervalRef.current = setInterval(() => {
      // Simulation : remplacer par vraie API quand expo-audio supportera metering
      const randomLevel = 0.2 + Math.random() * 0.5
      setAudioLevel(randomLevel)
    }, 100) // Update toutes les 100ms pour plus de fluidité
  }

  // 🆕 SIMULATION transcription live (remplacer par API réelle)
  function startLiveTranscription() {
    const words = [
      'Je',
      'me',
      'souviens',
      'de',
      'ce',
      'rêve...',
      'où',
      'je',
      'marchais',
      'dans',
      'un',
      'couloir',
      'sombre...',
      'Les',
      'murs',
      'étaient',
      'couverts',
      'de',
      'miroirs...',
      'et',
      'chaque',
      'reflet',
      'montrait',
      'une',
      'version',
      'différente',
      'de',
      'moi...',
    ]

    let index = 0
    transcriptIntervalRef.current = setInterval(() => {
      if (index < words.length) {
        setLiveTranscript((prev) => prev + (prev ? ' ' : '') + words[index])
        index++
      } else {
        if (transcriptIntervalRef.current) {
          clearInterval(transcriptIntervalRef.current)
          transcriptIntervalRef.current = null
        }
      }
    }, 800) // Un mot toutes les 800ms
  }

  async function stopRecording() {
    if (!isRecording || !recordingRef.current) return

    try {
      setIsRecording(false)

      // 🆕 Arrêter la transcription live et l'audio level
      if (transcriptIntervalRef.current) {
        clearInterval(transcriptIntervalRef.current)
        transcriptIntervalRef.current = null
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current)
        audioLevelIntervalRef.current = null
      }
      setAudioLevel(0)

      // ✅ Arrêter l'enregistrement et récupérer l'URI
      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()

      if (!uri || typeof uri !== 'string') {
        Alert.alert(
          'Erreur',
          'Fichier audio non créé ou URI invalide',
          [{ text: 'OK' }],
          { userInterfaceStyle: 'dark' }
        )
        return
      }

      setIsTranscribing(true)
      const transcript = await transcribeAudio(uri)
      const newDream = await saveDream(uri, transcript)
      setIsTranscribing(false)

      navigation.navigate('PostRecording', {
        dreamId: newDream.id,
        audioUri: uri,
        transcription: transcript,
        duration: duration,
        source: 'record', // 💡 Pour afficher le bon tooltip
      })

      setDuration(0)
      recordingRef.current = null
    } catch (err) {
      console.error('❌ Erreur:', err)
      Alert.alert('Erreur', 'Échec de la transcription', [{ text: 'OK' }], {
        userInterfaceStyle: 'dark',
      })
      setIsTranscribing(false)
    }
  }

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 📷 PHOTO - Prendre une photo
  async function handleTakePhoto() {
    setShowPhotoModal(false)

    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Autorisez l'accès à la caméra dans les paramètres.",
        [{ text: 'OK' }],
        { userInterfaceStyle: 'dark' }
      )
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    })

    if (!result.canceled && result.assets[0]) {
      setSelectedPhoto({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      })
      setShowPhotoPreview(true)
    }
  }

  // 📷 PHOTO - Choisir depuis la galerie
  async function handleChooseFromGallery() {
    setShowPhotoModal(false)

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Autorisez l'accès à la galerie dans les paramètres.",
        [{ text: 'OK' }],
        { userInterfaceStyle: 'dark' }
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    })

    if (!result.canceled && result.assets[0]) {
      setSelectedPhoto({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      })
      setShowPhotoPreview(true)
    }
  }

  // 📷 PHOTO - Reprendre (annuler preview)
  function handleRetakePhoto() {
    setSelectedPhoto(null)
    setShowPhotoPreview(false)
    setShowPhotoModal(true)
  }

  function handleCancelPhoto() {
    setSelectedPhoto(null)
    setShowPhotoPreview(false)
  }

  // 📷 PHOTO - Analyser l'image
  async function handleAnalyzePhoto() {
    if (!selectedPhoto?.base64) return

    // 🔒 Check free tier avant analyse photo (DeepDream)
    const premium = await premiumService.isPremium()
    if (!premium) {
      const allowance = await freeTierService.checkDeepDreamAllowance()
      if (allowance.remaining <= 0) {
        setShowActivateModal(true)
        return
      }
    }

    setIsAnalyzingPhoto(true)

    try {
      const result = await analyzeImageDream(selectedPhoto.base64)

      // Sauvegarder le rêve avec la transcription
      const newDream = await saveDream(null, result.transcription, {
        imageUri: selectedPhoto.uri,
        imageType: result.type,
        emoji: result.emoji,
        title: result.title,
        tags: result.tags,
      })

      // 🎯 Sauvegarder l'analyse directement (car déjà faite par le backend)
      await saveAnalysis(
        newDream.id,
        {
          analysis: result.analysis,
          title: result.title,
          emoji: result.emoji,
          tags: result.tags,
          suggestedQuestions: result.suggestedQuestions,
        },
        result.model || 'claude-vision'
      )

      setShowPhotoPreview(false)
      setSelectedPhoto(null)
      setIsAnalyzingPhoto(false)

      // 📊 Incrémenter le compteur DeepDream si free tier
      if (!premium) {
        await freeTierService.incrementDeepDreamCount()
      }

      // 🚀 Naviguer DIRECTEMENT vers Conversation (analyse déjà faite !)
      navigation.navigate('Conversation', {
        dreamId: newDream.id,
        dreamAnalysis: result.analysis,
        dreamTranscription: result.transcription,
        dreamTitle:
          result.title || `Rêve du ${new Date().toLocaleDateString('fr-FR')}`,
        dreamDate: new Date().toISOString(),
        suggestedQuestions: result.suggestedQuestions,
        source: result.type === 'text' ? 'photo-text' : 'photo-drawing',
      })
    } catch (error) {
      console.error('❌ Erreur analyse photo:', error)
      Alert.alert(
        'Erreur',
        error.message || "Impossible d'analyser l'image",
        [{ text: 'OK' }],
        { userInterfaceStyle: 'dark' }
      )
      setIsAnalyzingPhoto(false)
    }
  }

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Analyses"
          component={AnalysisScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="brain" size={32} color={color} />
            ),
            tabBarLabel: 'Analyses',
          }}
        />

        <Tab.Screen
          name="Trends"
          component={TrendsScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="trending-up"
                size={32}
                color={color}
              />
            ),
            tabBarLabel: 'Tendances',
          }}
        />

        <Tab.Screen
          name="Atlas"
          component={AtlasScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="map-marker-path"
                size={32}
                color={color}
              />
            ),
            tabBarLabel: 'Atlas',
          }}
        />

        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="cog-outline"
                size={32}
                color={color}
              />
            ),
            tabBarLabel: 'Paramètres',
          }}
        />
      </Tab.Navigator>

      {/* FAB Central + Boutons Photo & Écrire */}
      {!isRecording && !isTranscribing && !showPhotoPreview && (
        <View style={styles.fabContainer}>
          {/* 📷 Petit bouton Photo (à gauche) — Bevel Glass */}
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => setShowPhotoModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.smallBtnBevelTop} />
            <View style={styles.smallBtnBevelBottom} />
            <MaterialIcons
              name="photo-camera"
              size={22}
              color={THEME.colors.primary}
            />
          </TouchableOpacity>

          {/* ✏️ Petit bouton Écrire (à droite) — Bevel Glass */}
          <TouchableOpacity
            style={styles.writeButton}
            onPress={() => setShowWriteModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.smallBtnBevelTop} />
            <View style={styles.smallBtnBevelBottom} />
            <MaterialIcons
              name="edit"
              size={22}
              color={THEME.colors.primary}
            />
          </TouchableOpacity>

          {/* 🎤 Gros bouton Enregistrer (centre) */}
          <FABRecordButton onPress={startRecording} />
        </View>
      )}

      {/* ✏️ Modal Écriture */}
      <Modal visible={showWriteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.writeModal}>
            {/* Header avec icône */}
            <View style={styles.writeModalHeader}>
              <MaterialIcons
                name="edit-note"
                size={28}
                color={THEME.colors.primary}
              />
              <Text style={styles.writeModalTitle}>Écris ton rêve</Text>
            </View>

            {/* 💡 Tooltip instruction */}
            <View style={styles.writeTooltip}>
              <MaterialIcons
                name="lightbulb-outline"
                size={18}
                color={THEME.colors.primary}
              />
              <Text style={styles.writeTooltipText}>
                Raconte ton rêve naturellement, comme si tu le racontais à
                quelqu'un.
              </Text>
            </View>

            <View style={{ position: 'relative' }}>
              <ScrollView style={styles.writeInputContainer}>
                <TextInput
                  style={styles.writeInput}
                  placeholder="J'étais dans un endroit étrange..."
                  placeholderTextColor={THEME.colors.textSecondary}
                  value={writtenDream}
                  onChangeText={setWrittenDream}
                  multiline
                  textAlignVertical="top"
                  autoFocus
                />
              </ScrollView>
              <Text style={{ position: 'absolute', bottom: 28, right: 12, fontSize: 12, color: THEME.colors.textSecondary, opacity: 0.4, fontFamily: 'AtkinsonHyperlegibleNext-Regular' }}>
                {writtenDream.length} / 1 500
              </Text>
            </View>

            <View style={styles.writeModalButtons}>
              <TouchableOpacity
                style={styles.writeModalCancel}
                onPress={() => {
                  setShowWriteModal(false)
                  setWrittenDream('')
                }}
              >
                <Text style={styles.writeModalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.writeModalSubmit,
                  !writtenDream.trim() && styles.writeModalSubmitDisabled,
                ]}
                onPress={async () => {
                  if (!writtenDream.trim()) return
                  setShowWriteModal(false)
                  const newDream = await saveDream(null, writtenDream.trim())
                  setWrittenDream('')
                  navigation.navigate('PostRecording', {
                    dreamId: newDream.id,
                    audioUri: null,
                    transcription: writtenDream.trim(),
                    duration: 0,
                    source: 'write', // 💡 Pour afficher le bon tooltip
                  })
                }}
                disabled={!writtenDream.trim()}
              >
                <Text style={styles.writeModalSubmitText}>Analyser →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Enregistrement */}
      <Modal
        visible={isRecording || isTranscribing}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          {/* 🌊 Organic Blob Animation - DERRIÈRE TOUT */}
          {(isRecording || isTranscribing) && (
            <OrganicBlobVisualizer
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              audioLevel={audioLevel}
            />
          )}

          <View style={styles.recordingModal}>
            {/* 🔝 TEXTE EN HAUT */}
            {isTranscribing ? (
              <Text style={styles.recordingInstructionTop}>
                Transcription en cours...
              </Text>
            ) : (
              <Text style={styles.recordingInstructionTop}>
                Racontez votre rêve...
              </Text>
            )}

            {/* ⏱️ TIMER */}
            <Text style={styles.timer}>{formatDuration(duration)}</Text>

            {/* 🆕 TRANSCRIPTION LIVE */}
            {liveTranscript.length > 0 && (
              <View style={styles.liveTranscriptContainer}>
                <Text style={styles.liveTranscriptLabel}>
                  🗣️ Transcription en cours...
                </Text>
                <ScrollView
                  style={styles.liveTranscriptScroll}
                  contentContainerStyle={styles.liveTranscriptContent}
                >
                  <Text style={styles.liveTranscriptText}>
                    {liveTranscript}
                  </Text>
                </ScrollView>
              </View>
            )}

            {/* 🔴 BOUTON STOP EN BAS */}
            {isTranscribing ? (
              <ActivityIndicator
                color={THEME.colors.primary}
                size="large"
                style={styles.transcribingIndicator}
              />
            ) : (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopRecording}
                activeOpacity={0.8}
              >
                <MaterialIcons name="stop" size={48} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* 📷 Modal ActionSheet - Camera/Galerie */}
      <Modal visible={showPhotoModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.photoModalOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoModal(false)}
        >
          <View style={styles.photoActionSheet}>
            {/* Header */}
            <View style={styles.photoActionHeader}>
              <MaterialIcons
                name="photo-camera"
                size={28}
                color={THEME.colors.primary}
              />
              <Text style={styles.photoActionTitle}>Photo de rêve</Text>
            </View>

            {/* Tooltip */}
            <View style={styles.photoTooltip}>
              <MaterialIcons
                name="lightbulb-outline"
                size={18}
                color={THEME.colors.primary}
              />
              <Text style={styles.photoTooltipText}>
                Photographiez votre carnet de rêves ou un dessin. Claude Vision
                le transcrira automatiquement.
              </Text>
            </View>

            {/* Boutons */}
            <TouchableOpacity
              style={styles.photoActionButton}
              onPress={handleTakePhoto}
            >
              <MaterialIcons
                name="camera-alt"
                size={24}
                color={THEME.colors.primary}
              />
              <Text style={styles.photoActionButtonText}>
                Prendre une photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoActionButton}
              onPress={handleChooseFromGallery}
            >
              <MaterialIcons
                name="photo-library"
                size={24}
                color={THEME.colors.primary}
              />
              <Text style={styles.photoActionButtonText}>
                Choisir depuis la galerie
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.photoActionCancel}
              onPress={() => setShowPhotoModal(false)}
            >
              <Text style={styles.photoActionCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 📷 Modal Preview Photo */}
      <Modal visible={showPhotoPreview} transparent animationType="fade">
        <View style={styles.photoPreviewOverlay}>
          {isAnalyzingPhoto ? (
            // 🔄 Loader pendant l'analyse
            <View style={styles.photoAnalyzingContainer}>
              <ActivityIndicator size="large" color={THEME.colors.primary} />
              <Text style={styles.photoAnalyzingText}>Analyse en cours...</Text>
              <Text style={styles.photoAnalyzingSubtext}>
                Claude Vision transcrit votre image
              </Text>
            </View>
          ) : (
            // 🖼️ Aperçu de la photo
            <View style={styles.photoPreviewContainer}>
              <TouchableOpacity
                style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, padding: 4 }}
                onPress={handleCancelPhoto}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={24} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.photoPreviewTitle}>🖼️ Aperçu</Text>

              {selectedPhoto && (
                <Image
                  source={{ uri: selectedPhoto.uri }}
                  style={styles.photoPreviewImage}
                  resizeMode="contain"
                />
              )}

              {/* Info stockage local */}
              <View style={styles.photoStorageInfo}>
                <MaterialIcons
                  name="security"
                  size={16}
                  color={THEME.colors.textSecondary}
                />
                <Text style={styles.photoStorageText}>
                  Image stockée uniquement sur votre appareil
                </Text>
              </View>

              {/* Boutons */}
              <View style={styles.photoPreviewButtons}>
                <TouchableOpacity
                  style={styles.photoRetakeButton}
                  onPress={handleCancelPhoto}
                >
                  <Text style={[styles.photoRetakeText, { color: THEME.colors.textSecondary }]}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoRetakeButton}
                  onPress={handleRetakePhoto}
                >
                  <MaterialIcons
                    name="refresh"
                    size={20}
                    color={THEME.colors.textSecondary}
                  />
                  <Text style={styles.photoRetakeText}>Reprendre</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoAnalyzeButton}
                  onPress={handleAnalyzePhoto}
                >
                  <Text style={styles.photoAnalyzeText}>Analyser ✨</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      <ActivateDeepDreamModal
        visible={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onPurchaseSuccess={() => {
          setShowActivateModal(false)
          handleAnalyzePhoto()
        }}
        hasFreeTrials={false}
        freeTrialsRemaining={0}
      />
    </>
  )
}

function MainStack() {
  const [initialRoute, setInitialRoute] = React.useState(null)

  React.useEffect(() => {
    checkOnboardingStatus()
  }, [])

  async function checkOnboardingStatus() {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)
      setInitialRoute(completed === 'true' ? 'MainTabs' : 'OnboardingWelcome')
    } catch (error) {
      console.error('❌ Erreur vérification onboarding:', error)
      setInitialRoute('MainTabs') // Par défaut si erreur
    }
  }

  if (!initialRoute) {
    return null // Ou un splash screen
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MainTabs" component={MainTabsWithFAB} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ presentation: 'modal', title: 'ChatScreen.js' }}
      />
      <Stack.Screen
        name="VoiceAssistant"
        component={VoiceAssistantScreen}
        options={{ presentation: 'modal', title: 'VoiceAssistantScreen.js' }}
      />
      <Stack.Screen
        name="PostRecording"
        component={PostRecordingScreen}
        options={{ presentation: 'card', title: 'PostRecordingScreen.js' }}
      />
      <Stack.Screen
        name="Archives"
        component={ArchivesScreen}
        options={{ presentation: 'card', title: 'ArchivesScreen.js' }}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{ presentation: 'card', title: 'ConversationScreen.js' }}
      />
      <Stack.Screen
        name="DeepChat"
        component={DeepChatScreen}
        options={{ presentation: 'card', title: 'DeepChatScreen.js' }}
      />
      <Stack.Screen
        name="GeminiLive"
        component={GeminiLiveScreen}
        options={{ presentation: 'card', title: 'GeminiLiveScreen.js' }}
      />
      <Stack.Screen
        name="MetaAnalysis"
        component={MetaAnalysisScreen}
        options={{ presentation: 'card', title: 'MetaAnalysisScreen.js' }}
      />
      <Stack.Screen
        name="Persona"
        component={PersonaScreen}
        options={{ presentation: 'card', title: 'PersonaScreen.js' }}
      />
      <Stack.Screen
        name="OnboardingWelcome"
        component={OnboardingWelcome}
        options={{ headerShown: false, title: 'OnboardingWelcome.js' }}
      />
      <Stack.Screen
        name="OnboardingMarkers"
        component={OnboardingMarkers}
        options={{ headerShown: false, title: 'OnboardingMarkers.js' }}
      />
      <Stack.Screen
        name="OnboardingFingerprints"
        component={OnboardingFingerprints}
        options={{ headerShown: false, title: 'OnboardingFingerprints.js' }}
      />
      <Stack.Screen
        name="OnboardingDeepDream"
        component={OnboardingDeepDream}
        options={{ headerShown: false, title: 'OnboardingDeepDream.js' }}
      />
      <Stack.Screen
        name="OnboardingNotifications"
        component={OnboardingNotifications}
        options={{ headerShown: false, title: 'OnboardingNotifications.js' }}
      />
      <Stack.Screen
        name="AnalysesStack"
        component={AnalysisScreen}
        options={{ presentation: 'card', headerShown: false }}
      />
      <Stack.Screen
        name="Playground"
        component={PlaygroundScreen}
        options={{ presentation: 'card', title: '🎨 Playground' }}
      />
      <Stack.Screen
        name="Decrypter"
        component={DecrypterScreen}
        options={{ presentation: 'card', title: '🔓 Décrypter' }}
      />
      <Stack.Screen
        name="Explorer"
        component={ExplorerScreen}
        options={{ presentation: 'card', title: '🧭 Explorer' }}
      />
      <Stack.Screen
        name="QuickRecord"
        component={QuickRecordScreen}
        options={{ presentation: 'fullScreenModal', headerShown: false }}
      />
    </Stack.Navigator>
  )
}

// 🔤 Garder le splash visible pendant le chargement des fonts
SplashScreen.preventAutoHideAsync().catch(() => {})

export default function App() {
  // 🔤 Chargement des fonts custom
  const [i18nReady, setI18nReady] = useState(false)
  const [fontsLoaded, fontError] = useFonts({
    // Cormorant Upright — Display / Titres (serif gravure)
    'CormorantUpright-Regular': require('./assets/fonts/CormorantUpright-Regular.ttf'),
    'CormorantUpright-SemiBold': require('./assets/fonts/CormorantUpright-SemiBold.ttf'),
    'CormorantUpright-Bold': require('./assets/fonts/CormorantUpright-Bold.ttf'),
    // Atkinson Hyperlegible Next — Body / UI (accessibility-first sans-serif)
    'AtkinsonHyperlegibleNext-Regular': require('./assets/fonts/AtkinsonHyperlegibleNext-Regular.ttf'),
    'AtkinsonHyperlegibleNext-Medium': require('./assets/fonts/AtkinsonHyperlegibleNext-Medium.ttf'),
    'AtkinsonHyperlegibleNext-SemiBold': require('./assets/fonts/AtkinsonHyperlegibleNext-SemiBold.ttf'),
    'AtkinsonHyperlegibleNext-Bold': require('./assets/fonts/AtkinsonHyperlegibleNext-Bold.ttf'),
  })
  console.log('🔤 FONTS DEBUG:', { fontsLoaded, fontError: fontError?.message })
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      try {
        await SplashScreen.hideAsync()
      } catch (e) {
        console.log('SplashScreen.hideAsync error:', e)
      }
    }
  }, [fontsLoaded, fontError])
  // 🔤 Force hide splash quand fonts chargées
  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [fontsLoaded, fontError])
  // 🔄 État pour le modal de mise à jour
  const [updateInfo, setUpdateInfo] = React.useState(null)
  const [showUpdateModal, setShowUpdateModal] = React.useState(false)
  const [showUpdateToast, setShowUpdateToast] = React.useState(false)
  // 🌍 What's New modal (v1.4.0)
  const [showWhatsNew, setShowWhatsNew] = React.useState(false)

  // 🧪 TEST MODE - Mettre à true pour tester le modal
  const TEST_UPDATE_MODAL = false

  // 🔔 Deep link notif → QuickRecordScreen (friction zéro)
  // Gère COLD START + BACKGROUND de manière robuste
  const pendingNotifNavRef = React.useRef(null) // destination en attente
  const navReadyRef = React.useRef(false)
  const processedNotifRef = React.useRef(new Set()) // anti-doublon

  // Helper : détermine si une réponse notif doit naviguer vers QuickRecord
  const shouldNavigateFromNotif = React.useCallback((response) => {
    if (!response) return false;
    const id = response.notification.request.identifier;
    if (processedNotifRef.current.has(id)) return false; // déjà traité
    const data = response.notification.request.content.data;
    const actionId = response.actionIdentifier;
    return (
      actionId === 'RECORD_NOW' ||
      data?.action === 'RECORD_NOW' ||
      data?.type === 'morning' ||
      data?.type === 'streak_evening'
    );
  }, []);

  // Helper : exécute la navigation (ou la met en attente)
  const handleNotifNavigation = React.useCallback((response) => {
    const id = response.notification.request.identifier;
    processedNotifRef.current.add(id);
    console.log('🔔 [Notif] Réponse détectée, id:', id);

    if (navReadyRef.current && navigationRef.isReady()) {
      console.log('🔔 [Notif] Navigation prête → QuickRecord immédiat');
      navigationRef.navigate('QuickRecord');
    } else {
      console.log('🔔 [Notif] Navigation PAS prête → mise en attente');
      pendingNotifNavRef.current = 'QuickRecord';
    }
  }, []);

  // Callback quand NavigationContainer est prêt
  const onNavigationReady = React.useCallback(() => {
    navReadyRef.current = true;
    console.log('🧭 [Nav] NavigationContainer ready');
    // Consommer la navigation en attente (cold start)
    if (pendingNotifNavRef.current) {
      const dest = pendingNotifNavRef.current;
      pendingNotifNavRef.current = null;
      console.log('🔔 [Notif] Cold start → navigation différée vers', dest);
      // Petit délai pour laisser le Stack se stabiliser après initialRoute
      setTimeout(() => {
        if (navigationRef.isReady()) {
          navigationRef.navigate(dest);
        }
      }, 100);
    }
  }, []);

  React.useEffect(() => {
    // 1) COLD START : vérifier si une notif a lancé l'app
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (shouldNavigateFromNotif(response)) {
        console.log('🔔 [Notif] Cold start détecté via getLastNotificationResponseAsync');
        handleNotifNavigation(response);
      }
    });

    // 2) BACKGROUND / FOREGROUND : écouter les taps à venir
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      if (shouldNavigateFromNotif(response)) {
        handleNotifNavigation(response);
      }
    });

    return () => responseSub.remove();
  }, [shouldNavigateFromNotif, handleNotifNavigation]);

  // 🔄 Migration + Ping installation + Sentry + Vérification mise à jour au démarrage
  React.useEffect(() => {
    try {
      Purchases.configure({ apiKey: 'goog_vueROZxZrzKUspAiXpguacEaBXO' }) // 💎 RevenueCat
    } catch (e) {
      console.warn('RevenueCat configure skipped (Expo Go?):', e.message)
    }
    initI18n().then(() => setI18nReady(true)) // 🌍 i18n (FR/EN/ES)

    // 🌍 What's New v1.4.0 — afficher une seule fois après l'onboarding
    AsyncStorage.multiGet([ONBOARDING_COMPLETED_KEY, WHATS_NEW_KEY]).then(([[, onboarded], [, seen]]) => {
      if (onboarded === 'true' && seen !== 'true') {
        setTimeout(() => setShowWhatsNew(true), 1500)
      }
    })

    initSentry() // 🛡️ Crash reporting
    secureStorageService.migrateFromAsyncStorage()
    sendInstallPing() // Track les installations
    notificationService.initialize() // 🔔 Notifications
    streakService.checkIntegrity() // 🔥 Streak integrity check

    // 🧪 MODE TEST : afficher toast/modal avec données simulées
    if (TEST_UPDATE_MODAL) {
      setTimeout(() => {
        setUpdateInfo({
          available: true,
          currentVersion: '0.9.10',
          latestVersion: '0.9.11',
          downloadUrl: 'https://example.com/noctaliae-0.9.11.apk',
          releaseNotes:
            '• Vérification Premium sur DeepDream\n• Rate limiting IP (100 req/h)\n• Fix transcription audio\n• Correction typo "le cœur"',
          isCritical: false,
        })
        // Non-critique → toast discret, Critique → modal
        setShowUpdateToast(true)
        console.log('🧪 TEST: Toast mise à jour affiché')
      }, 1500)
      return // Skip la vraie vérification en mode test
    }

    // 🆕 Vérification mise à jour (après 2s pour ne pas bloquer le démarrage)
    const checkUpdate = async () => {
      const info = await shouldShowUpdateModal()
      if (info && info.available) {
        setUpdateInfo(info)
        if (info.isCritical || info.isKillSwitch) {
          // 🚨 Critique / Kill Switch → modal bloquant
          setShowUpdateModal(true)
          console.log('🚨 Mise à jour CRITIQUE:', info.latestVersion)
        } else {
          // ✅ Normale → toast discret en bas
          setShowUpdateToast(true)
          console.log('🆕 Mise à jour disponible (toast):', info.latestVersion)
        }
      }
    }

    setTimeout(checkUpdate, 2000)
  }, [])

  // Handler pour "Plus tard" (modal)
  const handleDismissUpdate = (version) => {
    dismissUpdate(version)
    setShowUpdateModal(false)
  }

  // Handler dismiss toast
  const handleDismissToast = (version) => {
    dismissUpdate(version)
    setShowUpdateToast(false)
  }

  // Handler dismiss What's New
  const handleDismissWhatsNew = () => {
    setShowWhatsNew(false)
    AsyncStorage.setItem(WHATS_NEW_KEY, 'true')
  }

  // 🔤 Attendre que les fonts soient chargées
  if ((!fontsLoaded && !fontError) || !i18nReady) {
    return null // Le SplashScreen reste visible
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
      <ThemeProvider>
        <GlowProvider>
          <GlobalGlowOverlay />
          <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
            <MainStack />
          </NavigationContainer>

          {/* 🚨 MODAL MISE À JOUR CRITIQUE (kill switch) */}
          {updateInfo && (
            <UpdateAvailableModal
              visible={showUpdateModal}
              onClose={() => setShowUpdateModal(false)}
              onDismiss={handleDismissUpdate}
              currentVersion={updateInfo.currentVersion}
              latestVersion={updateInfo.latestVersion}
              downloadUrl={updateInfo.downloadUrl}
              releaseNotes={updateInfo.releaseNotes}
              customMessage={updateInfo.customMessage}
              isCritical={updateInfo.isCritical}
            />
          )}

          {/* 🔔 TOAST MISE À JOUR DISCRET */}
          {updateInfo && (
            <UpdateToast
              visible={showUpdateToast}
              latestVersion={updateInfo.latestVersion}
              downloadUrl={updateInfo.downloadUrl}
              onDismiss={handleDismissToast}
            />
          )}

          {/* 🌍 WHAT'S NEW v1.4.0 */}
          <WhatsNewModal
            visible={showWhatsNew}
            onDismiss={handleDismissWhatsNew}
          />
        </GlowProvider>
      </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 105, // 150 - 45 = 105
    left: width / 2 - 45,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#00FFB0',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.8, // Plus intense !
        shadowRadius: 30, // Plus large !
      },
      android: {
        elevation: 20, // Plus élevé !
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#0A0F1C', // 100% opaque - cache tout derrière
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingModal: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingTop: 100,
    paddingBottom: 120,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  recordingText: {
    fontSize: 16,
    color: THEME.colors.textPrimary,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  liveTranscriptContainer: {
    marginTop: 30,
    width: width - 60,
    maxHeight: 200,
    backgroundColor: 'rgba(0, 255, 176, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 176, 0.2)',
    padding: 15,
  },
  liveTranscriptLabel: {
    fontSize: 14,
    color: THEME.colors.primary,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 10,
  },
  liveTranscriptScroll: {
    maxHeight: 150,
  },
  liveTranscriptContent: {
    paddingBottom: 10,
  },
  liveTranscriptText: {
    fontSize: 16,
    color: THEME.colors.textPrimary,
    lineHeight: 24,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  timer: {
    fontSize: 64,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.primary,
    marginBottom: 20,
  },
  recordingInstruction: {
    fontSize: 18,
    color: THEME.colors.textSecondary,
    marginBottom: 40,
  },
  // 🔝 TEXTE EN HAUT
  recordingInstructionTop: {
    fontSize: 20,
    fontFamily: 'AtkinsonHyperlegibleNext-Medium',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  transcribingIndicator: {
    marginBottom: 20,
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.error,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  // ✏️ BOUTON ÉCRIRE — Bevel Glass
  writeButton: {
    position: 'absolute',
    right: -60,
    top: 25,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.primary + '55',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: THEME.colors.primary + '50',
    overflow: 'hidden',
  },
  // ✏️ MODAL ÉCRITURE
  writeModal: {
    width: width - 40,
    maxHeight: '80%',
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  writeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  writeModalTitle: {
    fontSize: 24,
    fontFamily: 'CormorantUpright-Bold',
    color: THEME.colors.textPrimary,
  },
  writeTooltip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(57, 255, 136, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  writeTooltipText: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.primary,
    lineHeight: 20,
  },
  writeInputContainer: {
    maxHeight: 250,
    marginBottom: 20,
  },
  writeInput: {
    backgroundColor: THEME.colors.backgroundElevated,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: THEME.colors.textPrimary,
    minHeight: 150,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    lineHeight: 24,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  writeModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  writeModalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: THEME.colors.backgroundElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  writeModalCancelText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
  },
  writeModalSubmit: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
  },
  writeModalSubmitDisabled: {
    opacity: 0.5,
  },
  writeModalSubmitText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.background,
  },
  // 📷 BOUTON PHOTO — Bevel Glass
  photoButton: {
    position: 'absolute',
    left: -60,
    top: 25,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.primary + '55',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: THEME.colors.primary + '50',
    overflow: 'hidden',
  },
  // Reflet haut uniquement (pas de bottom = pas de ligne)
  smallBtnBevelTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '38%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  smallBtnBevelBottom: {
    display: 'none',
  },
  // 📷 MODAL ACTIONSHEET
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  photoActionSheet: {
    backgroundColor: THEME.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  photoActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  photoActionTitle: {
    fontSize: 22,
    fontFamily: 'CormorantUpright-Bold',
    color: THEME.colors.textPrimary,
  },
  photoTooltip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(57, 255, 136, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  photoTooltipText: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.primary,
    lineHeight: 20,
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.backgroundElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  photoActionButtonText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textPrimary,
  },
  photoActionCancel: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  photoActionCancelText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
  },
  // 📷 MODAL PREVIEW
  photoPreviewOverlay: {
    flex: 1,
    backgroundColor: '#0A0F1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreviewContainer: {
    width: width - 40,
    alignItems: 'center',
  },
  photoPreviewTitle: {
    fontSize: 24,
    fontFamily: 'CormorantUpright-Bold',
    color: THEME.colors.textPrimary,
    marginBottom: 20,
  },
  photoPreviewImage: {
    width: width - 60,
    height: width - 60,
    borderRadius: 16,
    backgroundColor: THEME.colors.cardBackground,
  },
  photoStorageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  photoStorageText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  photoPreviewButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  photoRetakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: THEME.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  photoRetakeText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
  },
  photoAnalyzeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: THEME.colors.primary,
  },
  photoAnalyzeText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.background,
  },
  // 📷 LOADER ANALYSE
  photoAnalyzingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAnalyzingText: {
    fontSize: 20,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textPrimary,
    marginTop: 20,
  },
  photoAnalyzingSubtext: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    marginTop: 8,
  },
})
