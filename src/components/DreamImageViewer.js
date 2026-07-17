import React, { useRef, useState, useEffect } from 'react'
import i18next from 'i18next'
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  ScrollView,
  Share,
} from 'react-native'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system/legacy'
import ViewShot from 'react-native-view-shot'
import { useTheme } from '../config/ThemeContext'

const { width, height } = Dimensions.get('window')

/**
 * DreamImageViewer
 * Modal fullscreen image viewer.
 * Share Friendly = capture ViewShot → image avec branding → expo-sharing.
 * Compatible prod build (react-native-view-shot).
 */
export default function DreamImageViewer({
  visible,
  dream,
  onClose,
  onSharePro,
  shareCaption,
}) {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  const captureRef = useRef(null)
  const backdropOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(1)
    }
  }, [visible])

  // ── Fermeture animée ──────────────────────────────────────────────────────
  const closeWithAnimation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Animated.timing(backdropOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      backdropOpacity.setValue(1)
      onClose()
    })
  }

  // ── Share : télécharger l'image directement → shareAsync ─────────────────
  // Bypass ViewShot (instable en prod Android). Télécharge l'image depuis son URL.
  const handleShareFriendly = async () => {
    setShowShareMenu(false)
    try {
      if (!dream?.imageUrl) {
        await Share.share({ message: buildShareCaption() }, { dialogTitle: getTitle() })
        return
      }
      // Télécharger l'image dans le cache Expo
      const ext = dream.imageUrl.includes('.png') ? 'png' : 'jpg'
      const cacheUri = FileSystem.cacheDirectory + `noctaliae-share.${ext}`
      const download = await FileSystem.downloadAsync(dream.imageUrl, cacheUri)
      if (download.status === 200) {
        const canShare = await Sharing.isAvailableAsync()
        if (canShare) {
          await Sharing.shareAsync(download.uri, {
            mimeType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
            dialogTitle: getTitle(),
            UTI: ext === 'png' ? 'public.png' : 'public.jpeg',
          })
        }
      } else {
        await Share.share({ message: buildShareCaption() }, { dialogTitle: getTitle() })
      }
    } catch (err) {
      console.error('❌ Share image error:', err)
      try {
        await Share.share({ message: buildShareCaption() }, { dialogTitle: getTitle() })
      } catch (e) {
        console.error('❌ Share fallback error:', e)
      }
    }
  }

  // ── Texte fallback si Sharing indisponible ────────────────────────────────
  const buildShareCaption = () => {
    const title = getTitle()
    const date = new Date(dream.date).toLocaleDateString(i18next.language, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    const dateStr = date.charAt(0).toUpperCase() + date.slice(1)
    const tags = getTags()
      .slice(0, 3)
      .map((t) => `#${t}`)
      .join(' ')
    const rawAnalysis =
      typeof dream.analysis === 'string'
        ? dream.analysis
        : dream.analysis?.shortSummary || dream.analysis?.fullAnalysis || ''
    const summaryMatch = rawAnalysis
      .replace(/[#*]/g, '')
      .replace(/[\n\r]+/g, ' ')
      .match(/[^.!?]+[.!?]/)
    const oneLiner = summaryMatch ? summaryMatch[0].trim() : shareCaption || ''
    return [
      `🌙 ${title}`,
      `📅 ${dateStr}`,
      oneLiner ? `\n"${oneLiner}"` : '',
      tags ? `\n${tags}` : '',
      `\nAnalysé avec Noctaliæ 🔗\nhttps://play.google.com/store/apps/details?id=com.noctaliae.mobile`,
    ]
      .filter(Boolean)
      .join('\n')
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getTitle = () => {
    const t = dream?.dreamTitle || dream?.title
    return t && t !== 'Mon rêve' && t !== 'Rêve sans titre' && t.length > 3
      ? t
      : 'Rêve sans titre'
  }

  const getOneLiner = () => {
    const rawAnalysis =
      typeof dream.analysis === 'string'
        ? dream.analysis
        : dream.analysis?.shortSummary || dream.analysis?.fullAnalysis || ''
    if (!rawAnalysis) return shareCaption || ''
    const match = rawAnalysis
      .replace(/[#*]/g, '')
      .replace(/[\n\r]+/g, ' ')
      .match(/[^.!?]+[.!?]/)
    const sentence = match ? match[0].trim() : ''
    return sentence.length > 120 ? sentence.slice(0, 117) + '…' : sentence
  }

  const formatFullDate = () => {
    if (!dream?.date) return ''
    return new Date(dream.date).toLocaleDateString(i18next.language, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getPalette = () =>
    Array.isArray(dream?.imagePalette) ? dream.imagePalette.slice(0, 5) : []
  const getTags = () =>
    Array.isArray(dream?.tags) ? dream.tags.slice(0, 4) : []

  if (!dream?.imageUrl) return null

  const palette = getPalette()
  const tags = getTags()
  const title = getTitle()
  const oneLiner = getOneLiner()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar hidden />

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

      {/* ── Zone capturée par ViewShot ── */}
      <ViewShot
        ref={captureRef}
        style={styles.container}
        options={{ format: 'png', quality: 0.95 }}
      >
        {/* Image plein écran */}
        <ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={styles.zoomContainer}
          maximumZoomScale={4}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          centerContent
          scrollEnabled={!isCapturing}
        >
          <Image
            source={{ uri: dream.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </ScrollView>

        {/* Gradients */}
        <LinearGradient
          colors={['rgba(12,14,39,0.75)', 'transparent']}
          style={styles.topGradient}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(12,14,39,0.88)', '#0c0e27']}
          locations={[0.25, 0.7, 1]}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        {/* Infos bas — toujours dans la capture */}
        <View
          style={[
            styles.bottomInfo,
            { paddingBottom: isCapturing ? 28 : insets.bottom + 28 },
          ]}
        >
          {palette.length > 0 && (
            <View style={styles.paletteRow}>
              {palette.map((color, i) => (
                <View
                  key={i}
                  style={[
                    styles.paletteCircle,
                    { backgroundColor: color, zIndex: palette.length - i },
                    i > 0 && { marginLeft: -8 },
                  ]}
                />
              ))}
              <Text style={styles.paletteLabel}>Palette générée</Text>
            </View>
          )}

          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {oneLiner ? (
            <Text style={styles.oneLiner} numberOfLines={3}>
              "{oneLiner}"
            </Text>
          ) : null}

          <Text style={styles.date}>{formatFullDate()}</Text>

          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {String(tag).charAt(0).toUpperCase() + String(tag).slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Branding discret ── */}
          <View style={styles.brandingRow}>
            <Text style={styles.brandingName}>Noctaliæ</Text>
            <View style={styles.brandingBadge}>
              <MaterialIcons
                name="android"
                size={10}
                color="rgba(255,255,255,0.55)"
              />
              <Text style={styles.brandingBadgeText}>
                Disponible sur Google Play
              </Text>
            </View>
          </View>
        </View>

        {/* Boutons top — masqués pendant la capture */}
        {!isCapturing && (
          <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              style={styles.ctrlBtn}
              onPress={closeWithAnimation}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctrlBtn, styles.shareCtrlBtn]}
              onPress={handleShareFriendly}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialCommunityIcons name="share-variant" size={22} color="#00FFB0" />
            </TouchableOpacity>
          </View>
        )}
      </ViewShot>


    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  container: { flex: 1, width, height, backgroundColor: '#0c0e27' },
  zoomContainer: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width, height },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 130 },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 20,
  },
  ctrlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCtrlBtn: {
    backgroundColor: 'rgba(0,255,176,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,176,0.4)',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 20,
  },
  paletteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  paletteCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  paletteLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    marginLeft: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 36,
    fontFamily: 'CormorantUpright-Bold',
    color: '#00FFB0',
    lineHeight: 42,
    paddingBottom: 4,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  oneLiner: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 19,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  date: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: 'rgba(255,255,255,0.65)',
  },

  // ── Branding discret ──────────────────────────────────────────────────────
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  brandingName: {
    fontSize: 13,
    fontFamily: 'CormorantUpright-Bold',
    color: 'rgba(210,177,76,0.65)',
    letterSpacing: 1,
  },
  brandingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  brandingBadgeText: {
    fontSize: 9,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.3,
  },

  // ── Sheet ─────────────────────────────────────────────────────────────────
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 22,
    fontFamily: 'CormorantUpright-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  sheetOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sheetOptionTexts: { flex: 1 },
  sheetOptionTitle: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 2,
  },
  sheetOptionDesc: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
  },
  sheetCancel: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  sheetCancelText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Medium',
  },
})
