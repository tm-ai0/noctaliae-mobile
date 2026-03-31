import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  LayoutAnimation,
  UIManager,
} from 'react-native'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { premiumService } from '../services/premiumService'
import { useTheme } from '../config/ThemeContext'
import DebugScreenLabel from '../components/DebugScreenLabel'
import { DeepDreamInfoModal } from '../components/DeepDreamInfoModal'
import { ContributeResearchModal } from '../components/ContributeResearchModal'
import { ActivateDeepDreamModal } from '../modals/ActivateDeepDreamModal'
import { useNoctaliaeAlert } from '../components/NoctaliaeAlert'
import { ResearchOptInVIP } from '../components/ResearchOptInVIP'
import { useGlow } from '../contexts/GlowContext'
import { getAllDreams, deleteDream } from '../services/storageService'
import BiometricService from '../services/biometricService'
import { getCurrentAppVersion } from '../services/updateService'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import {
  notificationService,
  DEFAULT_NOTIF_SETTINGS,
} from '../services/notificationService'
import { streakService } from '../services/streakService'

const FINGERPRINTS_KEY = '@noctaliae_user_fingerprints'
const ONBOARDING_COMPLETED_KEY = '@noctaliae_onboarding_completed'
const PLAYGROUND_KOFI_KEY = '@noctaliae_playground_kofi'
const MENU_HINT_KEY = '@noctaliae_menu_hint_shown'
const APP_VERSION = getCurrentAppVersion()
const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe9TVWMzCk761X4jLwoGBR53WNyfPirQD_EjdWhxRvvOlhaNg/viewform'

export default function SettingsScreen({ navigation }) {
  const { theme, currentThemeId, changeTheme, availableThemes } = useTheme()
  const { refreshGlowStates } = useGlow()
  const insets = useSafeAreaInsets()
  const { showAlert, AlertComponent } = useNoctaliaeAlert()

  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [appearanceExpanded, setAppearanceExpanded] = useState(false)
  const [kofiExpanded, setKofiExpanded] = useState(false)
  const [fingerprintCount, setFingerprintCount] = useState(0)
  const [showDeepDreamModal, setShowDeepDreamModal] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [kofiStyles, setKofiStyles] = useState(null)
  const [devTapCount, setDevTapCount] = useState(0)

  // 🔔 Notifications & Streak
  const [notifSettings, setNotifSettings] = useState(DEFAULT_NOTIF_SETTINGS)
  const [streak, setStreak] = useState({ current: 0, max: 0, totalDreams: 0 })
  const [hasNotifPerm, setHasNotifPerm] = useState(false)

  // 🪗 Accordéon sections
  const [secApparence, setSecApparence] = useState(false)
  const [secAnalyse, setSecAnalyse] = useState(true)
  const [secRappels, setSecRappels] = useState(true)
  const [secConfidentialite, setSecConfidentialite] = useState(false)
  const [secRecherche, setSecRecherche] = useState(false)
  const [secSoutenir, setSecSoutenir] = useState(false)
  const [secAide, setSecAide] = useState(false)

  if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }

  const toggleSection = (setter) => {
    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    })
    setter((v) => !v)
  }

  useEffect(() => {
    loadPremiumStatus()
    loadFingerprintCount()
    loadNotifData()
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFingerprintCount()
      loadKofiStyles()
      loadNotifData()
    })
    return unsubscribe
  }, [navigation])

  // ─── LOADERS ──────────────────────────────────────────────────────────────

  const loadNotifData = async () => {
    try {
      const [settings, streakData, perm] = await Promise.all([
        notificationService.getSettings(),
        streakService.getStreak(),
        notificationService.hasPermission(),
      ])
      setNotifSettings(settings)
      setStreak(streakData)
      setHasNotifPerm(perm)
    } catch (error) {
      console.error('❌ [Settings] Chargement notif/streak:', error)
    }
  }

  const loadKofiStyles = async () => {
    try {
      const stored = await AsyncStorage.getItem(PLAYGROUND_KOFI_KEY)
      if (stored) setKofiStyles(JSON.parse(stored))
    } catch (error) {
      console.error('❌ Erreur chargement styles Ko-fi:', error)
    }
  }

  const loadPremiumStatus = async () => {
    try {
      const status = await premiumService.isPremium()
      setIsPremium(status)
    } catch (error) {
      console.error('Erreur chargement statut Premium:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFingerprintCount = async () => {
    try {
      const stored = await AsyncStorage.getItem(FINGERPRINTS_KEY)
      if (stored) {
        let count = 0
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) count = parsed.length
          else if (parsed && typeof parsed === 'object')
            count = Object.keys(parsed).length
          else count = 1
        } catch {
          count = 1
        }
        setFingerprintCount(count)
      } else {
        setFingerprintCount(0)
      }
    } catch (error) {
      console.error('❌ Erreur chargement empreintes:', error)
      setFingerprintCount(0)
    }
  }

  // ─── HANDLERS NOTIFS ──────────────────────────────────────────────────────

  const handleNotifToggle = async (key, value) => {
    if (!hasNotifPerm && value) {
      const granted = await notificationService.requestPermissions()
      if (!granted) {
        showAlert({
          type: 'info',
          title: 'Notifications bloquées',
          message:
            'Autorisez les notifications dans les réglages de votre téléphone pour activer les rappels.',
          confirmText: 'Ouvrir les réglages',
          cancelText: 'Plus tard',
          onConfirm: () => Linking.openSettings(),
        })
        return
      }
      setHasNotifPerm(true)
    }
    const updated = await notificationService.updateSettings({ [key]: value })
    setNotifSettings(updated)
  }

  const handleOpenTimePicker = (key) => {
    const hourField = key === 'morning' ? 'morningHour' : 'eveningHour'
    const minField = key === 'morning' ? 'morningMinute' : 'eveningMinute'

    const currentTime = new Date()
    currentTime.setHours(
      notifSettings[hourField],
      notifSettings[minField],
      0,
      0
    )

    DateTimePickerAndroid.open({
      value: currentTime,
      mode: 'time',
      is24Hour: true,
      onChange: async (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          const updated = await notificationService.updateSettings({
            [hourField]: selectedDate.getHours(),
            [minField]: selectedDate.getMinutes(),
          })
          setNotifSettings(updated)
        }
      },
    })
  }

  const formatTime = (hour, minute) =>
    `${String(hour).padStart(2, '0')}h${String(minute).padStart(2, '0')}`

  // ─── AUTRES HANDLERS ──────────────────────────────────────────────────────

  const handlePurchaseSuccess = async () => {
    setIsPremium(true)
    setShowActivateModal(false)
    refreshGlowStates()
  }

  const handleThemeChange = async (themeId) => {
    await changeTheme(themeId)
  }

  const handleRestartOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY)
      navigation.navigate('OnboardingWelcome')
    } catch (error) {
      console.error('❌ Erreur redémarrage onboarding:', error)
    }
  }

  const handleResetNewUser = async () => {
    try {
      await AsyncStorage.multiRemove([
        ONBOARDING_COMPLETED_KEY,
        MENU_HINT_KEY,
        FINGERPRINTS_KEY,
      ])
      showAlert({
        type: 'success',
        title: 'Reset effectué !',
        message:
          "Vous pouvez maintenant tester comme un nouveau utilisateur. Relancez l'app.",
        confirmText: 'OK',
      })
    } catch (error) {
      console.error('❌ Erreur reset:', error)
    }
  }

  const handleClearConversationsCache = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const conversationKeys = keys.filter((key) =>
        key.startsWith('@noctaliae_conversation_')
      )
      if (conversationKeys.length > 0) {
        await AsyncStorage.multiRemove(conversationKeys)
        alert(
          `Cache nettoyé : ${conversationKeys.length} conversations supprimées`
        )
      } else {
        alert('Aucune conversation en cache')
      }
    } catch (error) {
      console.error('❌ Erreur clear cache conversations:', error)
    }
  }

  const handleKofi = (amount) => {
    const url =
      amount === 1.99
        ? 'https://ko-fi.com/tm_ai0?amount=1.99'
        : 'https://ko-fi.com/tm_ai0?amount=3.39'
    Linking.openURL(url).catch((err) =>
      console.error('❌ Erreur ouverture Ko-fi:', err)
    )
  }

  const handleSupport = () => {
    setShowDeepDreamModal(false)
    handleKofi(1.99)
  }

  const handleDeleteAllDreams = async () => {
    try {
      const allDreams = await getAllDreams()
      for (const dream of allDreams) await deleteDream(dream.id)
      showAlert({
        type: 'success',
        title: 'Terminé',
        message: 'Tous vos rêves ont été supprimés.',
        confirmText: 'OK',
      })
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer les rêves',
        confirmText: 'OK',
      })
    }
  }


  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <DebugScreenLabel
        screenName="⚙️ Paramètres"
        fileName="SettingsScreen.js"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 15) + 15 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons
            name="settings"
            size={32}
            color={theme.colors.primary}
          />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Paramètres
          </Text>
        </View>

        {/* === SECTION PERSONA === */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              ...theme.shadow.md,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons
                name="dna"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Persona
              </Text>
            </View>
            {fingerprintCount > 0 && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[styles.badgeText, { color: theme.colors.background }]}
                >
                  {fingerprintCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Pour des analyses sur-mesure et rien qu'a vous.
          </Text>
          <TouchableOpacity
            style={[
              styles.personaButton,
              {
                backgroundColor: theme.colors.primaryGlow,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => navigation.navigate('Persona')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="fingerprint"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.personaButtonContent}>
              <Text
                style={[
                  styles.personaButtonTitle,
                  { color: theme.colors.text },
                ]}
              >
                Gérer mes empreintes
              </Text>
              <Text
                style={[
                  styles.personaButtonSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {fingerprintCount === 0
                  ? 'Aucune empreinte'
                  : `${fingerprintCount} empreinte${fingerprintCount > 1 ? 's' : ''}`}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* === SECTION RAPPELS & HABITUDES === */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              ...theme.shadow.md,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection(setSecRappels)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Rappels & Habitudes
              </Text>
            </View>
            <MaterialIcons
              name={secRappels ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          {secRappels && (
            <View>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.textSecondary, marginBottom: 16 },
                ]}
              >
                Le rêve s'efface en moins de 10 minutes. Un rappel au réveil
                change tout.
              </Text>

              {/* 🔥 Streak card */}
              <View
                style={[
                  notifStyles.streakCard,
                  {
                    backgroundColor:
                      streak.current > 0
                        ? 'rgba(255, 153, 102, 0.08)'
                        : 'rgba(255,255,255,0.03)',
                    borderColor:
                      streak.current > 0
                        ? 'rgba(255, 153, 102, 0.3)'
                        : theme.colors.cardBorder,
                  },
                ]}
              >
                <Text style={notifStyles.streakEmoji}>
                  {streak.current > 0 ? '🔥' : '💤'}
                </Text>
                <View style={notifStyles.streakInfo}>
                  <Text
                    style={[
                      notifStyles.streakValue,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {streak.current > 0
                      ? `${streak.current} jour${streak.current > 1 ? 's' : ''} de suite`
                      : 'Aucune série en cours'}
                  </Text>
                  <Text
                    style={[
                      notifStyles.streakSub,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {streak.max > 0
                      ? `Record : ${streak.max} j. · ${streak.totalDreams} rêve${streak.totalDreams > 1 ? 's' : ''} au total`
                      : 'Enregistrez votre premier rêve pour commencer'}
                  </Text>
                </View>
              </View>

              {/* Toggle matin */}
              <View style={notifStyles.toggleRow}>
                <View style={notifStyles.toggleLeft}>
                  <MaterialCommunityIcons
                    name="weather-sunset-up"
                    size={20}
                    color="#FFD580"
                  />
                  <View>
                    <Text
                      style={[
                        notifStyles.toggleLabel,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      Rappel matinal
                    </Text>
                    <Text
                      style={[
                        notifStyles.toggleSub,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Avant que le rêve s'efface
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notifSettings.morningEnabled}
                  onValueChange={(v) => handleNotifToggle('morningEnabled', v)}
                  trackColor={{
                    false: theme.colors.cardBorder,
                    true: theme.colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {notifSettings.morningEnabled && (
                <TouchableOpacity
                  style={notifStyles.timePicker}
                  onPress={() => handleOpenTimePicker('morning')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      notifStyles.timeDisplay,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {formatTime(
                      notifSettings.morningHour,
                      notifSettings.morningMinute
                    )}
                  </Text>
                  <MaterialIcons
                    name="edit"
                    size={15}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              )}

              {/* Toggle soir */}
              <View style={[notifStyles.toggleRow, { marginTop: 8 }]}>
                <View style={notifStyles.toggleLeft}>
                  <MaterialCommunityIcons
                    name="weather-night"
                    size={20}
                    color="#A0B4D4"
                  />
                  <View>
                    <Text
                      style={[
                        notifStyles.toggleLabel,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      Rappel du soir
                    </Text>
                    <Text
                      style={[
                        notifStyles.toggleSub,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Pour ne pas briser votre série
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notifSettings.eveningEnabled}
                  onValueChange={(v) => handleNotifToggle('eveningEnabled', v)}
                  trackColor={{
                    false: theme.colors.cardBorder,
                    true: '#FF9966',
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {notifSettings.eveningEnabled && (
                <TouchableOpacity
                  style={notifStyles.timePicker}
                  onPress={() => handleOpenTimePicker('evening')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={18}
                    color="#FF9966"
                  />
                  <Text style={[notifStyles.timeDisplay, { color: '#FF9966' }]}>
                    {formatTime(
                      notifSettings.eveningHour,
                      notifSettings.eveningMinute
                    )}
                  </Text>
                  <MaterialIcons
                    name="edit"
                    size={15}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              )}

              {/* Banner permission refusée */}
              {!hasNotifPerm &&
                (notifSettings.morningEnabled ||
                  notifSettings.eveningEnabled) && (
                  <TouchableOpacity
                    style={notifStyles.permBanner}
                    onPress={() =>
                      notificationService
                        .requestPermissions()
                        .then(loadNotifData)
                    }
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name="notifications-off"
                      size={18}
                      color="#FF9966"
                    />
                    <Text style={notifStyles.permBannerText}>
                      Autoriser les notifications pour activer les rappels
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          )}
        </View>

        {/* === SECTION MODÈLE D'ANALYSE === */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              ...theme.shadow.md,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection(setSecAnalyse)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons
                name="brain"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Modèle d'Analyse
              </Text>
            </View>
            <MaterialIcons
              name={secAnalyse ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          {secAnalyse && (
            <View>
              <View
                style={[
                  styles.engineToggleContainer,
                  {
                    backgroundColor: isPremium
                      ? 'rgba(79, 141, 255, 0.08)'
                      : 'rgba(57, 255, 136, 0.08)',
                    borderColor: isPremium
                      ? 'rgba(79, 141, 255, 0.3)'
                      : 'rgba(57, 255, 136, 0.3)',
                  },
                ]}
              >
                <View style={styles.optionInfo}>
                  <View style={styles.optionTitleRow}>
                    <MaterialIcons
                      name={isPremium ? 'auto-awesome' : 'flash-on'}
                      size={22}
                      color={isPremium ? '#4F8DFF' : '#39FF88'}
                    />
                    <Text
                      style={[
                        styles.optionTitle,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {isPremium ? 'DeepDream Engine' : 'QuickDream'}
                    </Text>
                    {isPremium && (
                      <View style={{ backgroundColor: '#4F8DFF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: '#FFFFFF' }}>Actif</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.optionDescription,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {isPremium
                      ? 'Analyses approfondies et sur-mesure pour explorer vos rêves en profondeur.'
                      : 'Gratuit et illimité pour des analyses rapides et efficaces.'}
                  </Text>
                  {!isPremium && (
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(79, 141, 255, 0.1)',
                        borderWidth: 1.5,
                        borderColor: '#4F8DFF',
                        borderRadius: 12,
                        paddingVertical: 12,
                        gap: 8,
                        marginTop: 12,
                      }}
                      onPress={() => setShowActivateModal(true)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="favorite" size={16} color="#4F8DFF" />
                      <Text style={{ fontSize: 15, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: '#4F8DFF' }}>
                        Débloquer DeepDream
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.engineInfoButton,
                  { borderColor: theme.colors.cardBorder },
                ]}
                onPress={() => setShowDeepDreamModal(true)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="info-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.engineInfoText,
                    { color: theme.colors.primary },
                  ]}
                >
                  En savoir plus sur DeepDream Engine
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isPremium && (
          <View
            style={[
              styles.premiumBadge,
              {
                backgroundColor: theme.colors.deepAnalysisSubtle,
                borderColor: theme.colors.deepAnalysis,
              },
            ]}
          >
            <Text
              style={[
                styles.premiumBadgeText,
                { color: theme.colors.textPrimary },
              ]}
            >
              DeepDream Engine activé
            </Text>
            <Text
              style={[
                styles.premiumBadgeSubtext,
                { color: theme.colors.textSecondary },
              ]}
            >
              Merci pour votre soutien
            </Text>
          </View>
        )}

        {/* === SECTION CONFIDENTIALITÉ === */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              ...theme.shadow.md,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection(setSecConfidentialite)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons
                name="key-variant"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Confidentialité
              </Text>
            </View>
            <MaterialIcons
              name={
                secConfidentialite ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
              }
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          {secConfidentialite && (
            <View>
              <Text
                style={[
                  styles.journalIntimeText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Noctaliæ fonctionne comme un journal intime. Vos données restent
                sur votre appareil.
              </Text>
              <TouchableOpacity
                style={[
                  styles.privacyActionButton,
                  {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                  },
                ]}
                onPress={async () => {
                  const authenticated =
                    await BiometricService.authenticateForSecrets()
                  if (authenticated)
                    navigation.navigate('AnalysesStack', {
                      showOnlySecrets: true,
                    })
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="lock" size={24} color="#8B5CF6" />
                <View style={styles.privacyActionContent}>
                  <Text
                    style={[
                      styles.privacyActionTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Rêves protégés
                  </Text>
                  <Text
                    style={[
                      styles.privacyActionSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Vos rêves les plus personnels
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.privacyActionButton,
                  {
                    backgroundColor: 'rgba(57, 255, 136, 0.1)',
                    borderColor: 'rgba(57, 255, 136, 0.3)',
                  },
                ]}
                onPress={() =>
                  navigation.navigate('AnalysesStack', {
                    startInSelectionMode: true,
                  })
                }
                activeOpacity={0.7}
              >
                <MaterialIcons name="checklist" size={24} color="#39FF88" />
                <View style={styles.privacyActionContent}>
                  <Text
                    style={[
                      styles.privacyActionTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Gérer mes rêves
                  </Text>
                  <Text
                    style={[
                      styles.privacyActionSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Sélectionner, supprimer ou archiver
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
              <View style={styles.storageNote}>
                <MaterialIcons
                  name="smartphone"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.storageNoteText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Stocké seulement sur votre appareil.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* === SECTION RECHERCHE === */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              ...theme.shadow.md,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection(setSecRecherche)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleRow}>
              <MaterialIcons
                name="science"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Recherche
              </Text>
            </View>
            <MaterialIcons
              name={secRecherche ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          {secRecherche && <ResearchOptInVIP />}
        </View>

        {/* === SECTION SOUTENIR === */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              ...theme.shadow.md,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection(setSecSoutenir)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="favorite" size={20} color="#ff004cff" />
              <Text style={[styles.sectionTitle, { color: '#D2B14C' }]}>
                Soutenir Noctaliæ
              </Text>
            </View>
            <MaterialIcons
              name={secSoutenir ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          {secSoutenir && (
            <View>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Noctaliæ est gratuit et le restera. Soutiens le projet à partir
                de 0,99€ — tu choisis le montant — et obtiens l'accès DeepDream
                à vie en retour.
              </Text>
              <TouchableOpacity
                style={styles.learnMoreLink}
                onPress={() =>
                  Linking.openURL(
                    'https://noctaliae-app.notion.site/Soutient-et-mon-tisation-Noctali-29b976346b3681b596a3e0fdc0584cdf'
                  )
                }
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.learnMoreText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  En savoir plus sur la philosophie Noctaliæ
                </Text>
                <MaterialIcons
                  name="open-in-new"
                  size={13}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.kofiButton}
                onPress={() => handleKofi(1.99)}
                activeOpacity={0.8}
              >
                <View style={styles.kofiContent}>
                  <View style={styles.kofiLeft}>
                    <MaterialIcons
                      name="local-cafe"
                      size={28}
                      color="#39FF88"
                    />
                    <View style={styles.kofiTextContainer}>
                      <Text
                        style={[
                          styles.kofiTitle,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        Un café
                      </Text>
                      <Text
                        style={[
                          styles.kofiSubtitle,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        Accès DeepDream à vie en retour
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="heart-outline"
                    size={22}
                    color="#39FF8860"
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* === SECTION APPARENCE / THÈMES === */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              ...theme.shadow.md,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection(setSecApparence)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons
                name="palette-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Apparence
              </Text>
            </View>
            <MaterialIcons
              name={secApparence ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          {secApparence && (
            <View>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: theme.colors.textSecondary, marginBottom: 12 },
                ]}
              >
                Choisissez l'ambiance visuelle de votre journal.
              </Text>

              {availableThemes.map((t) => {
                const isActive = currentThemeId === t.id
                const isComingSoon = t.isAvailable === false
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.themeRow,
                      {
                        backgroundColor: isActive
                          ? theme.colors.primaryGlow
                          : 'transparent',
                        borderColor: isActive
                          ? theme.colors.primary
                          : theme.colors.cardBorder,
                        opacity: isComingSoon ? 0.35 : 1,
                      },
                    ]}
                    onPress={() => !isComingSoon && handleThemeChange(t.id)}
                    activeOpacity={isComingSoon ? 1 : 0.7}
                    disabled={isComingSoon}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                      <MaterialIcons name={t.icon} size={20} color={isActive ? theme.colors.primary : theme.colors.textSecondary} />
                      <View>
                        <Text style={[styles.themeRowTitle, { color: isActive ? theme.colors.primary : theme.colors.textPrimary }]}>
                          {t.name}
                        </Text>
                        <Text style={[styles.themeRowDesc, { color: theme.colors.textSecondary }]}>
                          {t.description}
                        </Text>
                      </View>
                    </View>
                    {isComingSoon && (
                      <Text style={{ fontSize: 11, color: theme.colors.textMuted, fontFamily: 'AtkinsonHyperlegibleNext-Regular' }}>Bientôt</Text>
                    )}
                    {isActive && !isComingSoon && (
                      <MaterialIcons name="check-circle" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                )
              })}

              {/* Disclaimer soutien */}
              <View style={[
                styles.themeDisclaimer,
                { backgroundColor: 'rgba(210, 177, 76, 0.08)', borderColor: 'rgba(210, 177, 76, 0.15)' },
              ]}>
                <MaterialCommunityIcons name="heart-outline" size={14} color="#D2B14C" />
                <Text style={[styles.themeDisclaimerText, { color: theme.colors.textSecondary }]}>
                  Les thèmes premium seront réservés aux soutiens à l'avenir.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* === SECTION AIDE === */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
              ...theme.shadow.md,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection(setSecAide)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleRow}>
              <MaterialIcons
                name="help-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Aide
              </Text>
            </View>
            <MaterialIcons
              name={secAide ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          {secAide && (
            <View>
              <TouchableOpacity
                style={[
                  styles.helpButton,
                  { borderBottomColor: theme.colors.cardBorder },
                ]}
                onPress={handleRestartOnboarding}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="restart"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.helpButtonContent}>
                  <Text
                    style={[
                      styles.helpButtonTitle,
                      { color: theme.colors.text },
                    ]}
                  >
                    Refaire l'onboarding
                  </Text>
                  <Text
                    style={[
                      styles.helpButtonSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Recommencer la configuration initiale
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.helpButton,
                  { borderBottomColor: theme.colors.cardBorder },
                ]}
                onPress={() => {
                  const marketUrl = 'market://details?id=com.noctaliae.mobile'
                  const fallbackUrl = 'https://play.google.com/store/apps/details?id=com.noctaliae.mobile'
                  Linking.canOpenURL(marketUrl)
                    .then((supported) =>
                      Linking.openURL(supported ? marketUrl : fallbackUrl)
                    )
                    .catch(() => Linking.openURL(fallbackUrl))
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="star-outline"
                  size={24}
                  color="#D2B14C"
                />
                <View style={styles.helpButtonContent}>
                  <Text
                    style={[
                      styles.helpButtonTitle,
                      { color: theme.colors.text },
                    ]}
                  >
                    Noter Noctaliæ ⭐
                  </Text>
                  <Text
                    style={[
                      styles.helpButtonSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Un avis, ça change tout pour un projet solo
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.helpButton,
                  { borderBottomColor: 'transparent' },
                ]}
                onPress={() => Linking.openURL(FEEDBACK_FORM_URL)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="feedback"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.helpButtonContent}>
                  <Text
                    style={[
                      styles.helpButtonTitle,
                      { color: theme.colors.text },
                    ]}
                  >
                    Donner mon avis
                  </Text>
                  <Text
                    style={[
                      styles.helpButtonSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Suggestions, bugs, idées — tout est utile
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* === INFOS === */}
        <View
          style={[
            styles.infoSection,
            { borderTopColor: theme.colors.dividerStrong },
          ]}
        >
          <View style={styles.sectionTitleRow}>
            <MaterialIcons
              name="info-outline"
              size={24}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[styles.infoTitle, { color: theme.colors.textPrimary }]}
            >
              À propos
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              const newCount = devTapCount + 1
              setDevTapCount(newCount)
              if (newCount >= 5) {
                setDevTapCount(0)
                handleResetNewUser()
              }
              setTimeout(() => setDevTapCount(0), 3000)
            }}
          >
            <Text
              style={[
                styles.infoTextBottom,
                { color: theme.colors.textSecondary },
              ]}
            >
              Noctaliæ - Analyse scientifique des rêves{'\n'}Version{' '}
              {APP_VERSION}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL('https://nocty.thomasmaury.fr/privacy.html')
            }
            activeOpacity={0.7}
            style={[
              styles.privacyLink,
              { borderBottomColor: theme.colors.cardBorder },
            ]}
          >
            <MaterialIcons
              name="privacy-tip"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.privacyLinkText, { color: theme.colors.primary }]}
            >
              Politique de confidentialité
            </Text>
            <MaterialIcons
              name="open-in-new"
              size={14}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://linktr.ee/thomasmaury')}
            activeOpacity={0.7}
            style={styles.creatorLink}
          >
            <Text
              style={[
                styles.creatorText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Conçu par{' '}
            </Text>
            <Text style={[styles.creatorName, { color: theme.colors.primary }]}>
              Thomas Maury
            </Text>
            <MaterialIcons
              name="open-in-new"
              size={14}
              color={theme.colors.primary}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      <DeepDreamInfoModal
        visible={showDeepDreamModal}
        onClose={() => setShowDeepDreamModal(false)}
        isPremium={isPremium}
        onOpenPaywall={() => setShowActivateModal(true)}
      />
      <ActivateDeepDreamModal
        visible={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
        hasFreeTrials={false}
        freeTrialsRemaining={0}
      />
      <AlertComponent />
    </View>
  )
}

// ─── STYLES NOTIFS (séparés pour lisibilité) ─────────────────────────────────

const notifStyles = StyleSheet.create({
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  streakEmoji: { fontSize: 32 },
  streakInfo: { flex: 1 },
  streakValue: {
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 2,
  },
  streakSub: { fontSize: 13, fontFamily: 'AtkinsonHyperlegibleNext-Regular' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  toggleLabel: { fontSize: 16, fontFamily: 'AtkinsonHyperlegibleNext-Bold' },
  toggleSub: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    marginTop: 1,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    marginBottom: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  timeDisplay: {
    fontSize: 22,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    minWidth: 70,
    textAlign: 'center',
    flex: 1,
  },
  permBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 153, 102, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 102, 0.25)',
  },
  permBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: '#FF9966',
    lineHeight: 18,
  },
})

// ─── STYLES PRINCIPAUX ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  title: { fontSize: 38, fontFamily: 'CormorantUpright-Bold' },
  section: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: {
    fontSize: 26,
    fontFamily: 'CormorantUpright-Bold',
    marginBottom: 4,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 4,
  },
  sectionSubtitle: { fontSize: 14, marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 14, fontFamily: 'AtkinsonHyperlegibleNext-Bold' },
  engineToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  engineInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  engineInfoText: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    flex: 1,
  },
  personaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  personaButtonContent: { flex: 1 },
  personaButtonTitle: {
    fontSize: 18,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 4,
  },
  personaButtonSubtitle: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  helpButtonContent: { flex: 1 },
  helpButtonTitle: {
    fontSize: 18,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 4,
  },
  helpButtonSubtitle: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  optionInfo: { flex: 1, marginRight: 15 },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  premiumBadge: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  premiumBadgeText: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    textAlign: 'center',
  },
  premiumBadgeSubtext: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  journalIntimeText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
    marginBottom: 20,
  },
  privacyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  privacyActionContent: { flex: 1 },
  privacyActionTitle: {
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 2,
  },
  privacyActionSubtitle: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  storageNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  storageNoteText: { fontSize: 13 },
  kofiButton: {
    backgroundColor: '#39ff8826',
    borderWidth: 1.5,
    borderColor: '#39FF88',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  kofiContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kofiLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  kofiTextContainer: { flex: 1, marginRight: 8 },
  kofiTitle: { fontSize: 18, fontFamily: 'AtkinsonHyperlegibleNext-Bold' },
  kofiSubtitle: { fontSize: 12, marginTop: 2 },
  learnMoreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
    paddingVertical: 2,
  },
  learnMoreText: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    textDecorationLine: 'underline',
  },
  infoSection: { marginTop: 20, paddingTop: 20, borderTopWidth: 1 },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 10,
  },
  infoTextBottom: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  privacyLinkText: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-SemiBold',
    flex: 1,
  },
  creatorLink: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  creatorText: { fontSize: 14, fontFamily: 'AtkinsonHyperlegibleNext-Regular' },
  creatorName: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-SemiBold',
  },
  // 🎨 Thèmes
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  themeRowTitle: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  themeRowDesc: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    marginTop: 1,
  },
  themeDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  themeDisclaimerText: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    flex: 1,
  },
})
