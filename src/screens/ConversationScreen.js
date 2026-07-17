import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Share,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { THEME } from '../config/theme'
import { MarkdownText } from '../components/MarkdownText'
import {
  analyzeDreamFromText,
  generateDreamImage,
} from '../services/apiService'
import {
  saveAnalysis,
  saveDreamImage,
  deleteDream,
  archiveDream,
  setDreamSecret,
  getDream,
} from '../services/storageService'
import { premiumService } from '../services/premiumService'
import { ActivateDeepDreamModal } from '../modals/ActivateDeepDreamModal'
// SupportModal supprimé — fichier absent (feature Ko-fi abandonnée)
import { freeTierService } from '../services/freeTierService'
import DebugScreenLabel from '../components/DebugScreenLabel'
import { useNoctaliaeAlert } from '../components/NoctaliaeAlert'
import DreamImageViewer from '../components/DreamImageViewer'
import DreamFallbackHero from '../components/DreamFallbackHero'
import { useDreamShare } from '../hooks/useDreamShare'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'


export default function ConversationScreen({ route, navigation }) {
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const {
    dreamId,
    dreamAnalysis,
    dreamTranscription,
    dreamTitle,
    dreamDate,
    modelUsed,
    dreamTags,
    dreamImageUrl,
    dreamImagePalette,
    readOnly = false,
  } = route.params
  const { showAlert, AlertComponent } = useNoctaliaeAlert()

  const [activeTab, setActiveTab] = useState('analysis')
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState(dreamAnalysis)
  const [reanalyzeDropdownOpen, setReanalyzeDropdownOpen] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [deepDreamRemaining, setDeepDreamRemaining] = useState(null)
  const [isSecret, setIsSecret] = useState(false)
  const [heroImageError, setHeroImageError] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [currentDreamTitle, setCurrentDreamTitle] = useState(dreamTitle)
  const [currentImageUrl, setCurrentImageUrl] = useState(dreamImageUrl)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isImageLimited, setIsImageLimited] = useState(false)

  // ── Partage Friendly avec branding — hook centralisé ─────────────────────
  const dreamForShare = {
    dreamTitle: currentDreamTitle,
    date: dreamDate,
    tags: dreamTags,
    analysis: currentAnalysis,
    imageUrl: currentImageUrl,
    imagePalette: dreamImagePalette,
  }
  const { ShareOverlay, handleShareFriendly: handleShareFriendlyCapture } = useDreamShare(dreamForShare)

  // 🔄 Helper : convertit "Vous/Votre" → 1ère personne (pour partage)
  const toFirstPerson = (text) => {
    if (!text) return ''
    return text
      .replace(/\bVous ressentez\b/gi, 'Je ressens')
      .replace(/\bVous vous\b/gi, 'Je me')
      .replace(/\bVous avez\b/gi, "J'ai")
      .replace(/\bVous \u00eates\b/gi, 'Je suis')
      .replace(/\bVous semblez\b/gi, 'Je semble')
      .replace(/\bVous pouvez\b/gi, 'Je peux')
      .replace(/\bVous vivez\b/gi, 'Je vis')
      .replace(/\bVous traversez\b/gi, 'Je traverse')
      .replace(/\bVotre\b/gi, 'Mon')
      .replace(/\bvotre\b/gi, 'mon')
      .replace(/\bVos\b/gi, 'Mes')
      .replace(/\bvos\b/gi, 'mes')
      .replace(/\bVous\b/gi, 'Je')
      .replace(/\bvous\b/gi, 'me')
  }

  // 📤 Caption pour le partage friendly — même logique que DreamCard.handleShareFriendly
  const shareCaptionText = useMemo(() => {
    if (!currentAnalysis) return ''
    const rawAnalysis = typeof currentAnalysis === 'string'
      ? currentAnalysis
      : (currentAnalysis?.shortSummary || currentAnalysis?.fullAnalysis || '')
    const summaryMatch = rawAnalysis
      .replace(/[#*]/g, '')
      .replace(/[\n\r]+/g, ' ')
      .match(/[^.!?]+[.!?]/)
    return summaryMatch ? summaryMatch[0].trim() : ''
  }, [currentAnalysis])

  // 💡 Questions d'approfondissement parsées depuis l'analyse (réutilisées partout)
  const parsedAnalysisQuestions = useMemo(() => {
    if (!currentAnalysis) return []
    const match = currentAnalysis.match(
      /Questions d'approfondissement[^:]*:?([\s\S]*?)(?:\n---|\n##|\n\*\*[A-Z]|$)/i
    )
    if (!match) return []
    return match[1]
      .split('\n')
      .map((l) => l.replace(/^[-•*\d.]+\s*/, '').trim())
      .filter((l) => l.length > 8 && l.includes('?'))
      .slice(0, 4)
  }, [currentAnalysis])

  // 🎬 Helper : extrait le contexte du rêve en style scène (impersonnel/fragmenté)
  const toSceneStyle = (text) => {
    if (!text) return ''
    const raw = text.replace(/[\n\r]+/g, ' ').trim()
    const sentMatch = raw.match(/^.{20,200}?[.!?]/)
    const excerpt = sentMatch ? sentMatch[0] : raw.slice(0, 180)
    let s = excerpt
      .replace(/^Je me (retrouvais?|trouvais?|retrouve|trouve)\s+/gi, '')
      .replace(/^Je me\s+/gi, '')
      .replace(/^J'(étais?|avais?|aperçus?|entendais?|entends?|voyais?|vois|suis|ressentais?)\s+/gi, '')
      .replace(/^Je (suis|suis|vois|voyais?|sens|ressentais?|cours?|courais?|marche|marchais?|vole|volais?|flotte|flottais?|tombe|tombais?)\s+/gi, '')
      .replace(/^Je\s+\w+ais?\s+/gi, '')
      .replace(/^Je\s+\w+e\s+/gi, '')
      .replace(/,?\s+et (je|j')[^,]+[,]?/gi, '.')
      .replace(/,?\s+(puis |ensuite )?(je|j')\s+\w+(ais?|e)\s*/gi, '. ')
      .replace(/^Il y avait\s+/gi, '')
      .replace(/\bIl y avait\s+/gi, '')
      .replace(/\.\s*\./g, '.')
      .replace(/\s{2,}/g, ' ')
      .trim()
    s = s.replace(/\.\s+([a-zàâéèêëîïôùûüç])/g, (m, c) => '. ' + c.toUpperCase())
    s = s.charAt(0).toUpperCase() + s.slice(1)
    if (s.length > 150) s = s.slice(0, 147).replace(/\s+\S*$/, '') + '…'
    return s
  }

  // 🔄 Helper : convertit "Vous/Votre" → 3ème personne neutre
  const toThirdPerson = (text) => {
    if (!text) return ''
    return text
      .replace(/\bVous vous\b/gi, 'Le rêveur se')
      .replace(/\bVous avez\b/gi, 'Le rêveur a')
      .replace(/\bVous êtes\b/gi, 'Le rêveur est')
      .replace(/\bVous semblez\b/gi, 'Il semble')
      .replace(/\bVous pouvez\b/gi, 'Le rêveur peut')
      .replace(/\bVotre\b/gi, 'Son')
      .replace(/\bvotre\b/gi, 'son')
      .replace(/\bvous\b/gi, 'le rêveur')
  }

  // 🔐 Charger le statut secret au montage
  useEffect(() => {
    const loadSecretStatus = async () => {
      try {
        const dream = await getDream(dreamId)
        if (dream) setIsSecret(dream.isSecret || false)
      } catch (error) {
        console.error('❌ Erreur chargement statut secret:', error)
      }
    }
    loadSecretStatus()
  }, [dreamId])

  // 🏧 Vérifier quota image au mount (pour afficher CTA seulement si épuisé)
  useEffect(() => {
    const checkImageQuota = async () => {
      try {
        const allowance = await freeTierService.checkImageAllowance()
        setIsImageLimited(!allowance.allowed)
      } catch (e) {
        setIsImageLimited(false)
      }
    }
    checkImageQuota()
  }, [])

  // 🔐 Toggle secret
  const handleToggleSecret = async () => {
    try {
      const newStatus = !isSecret
      await setDreamSecret(dreamId, newStatus)
      setIsSecret(newStatus)
      showAlert({
        type: 'success',
        title: newStatus ? t('conversation.secret_protected_title') : t('conversation.secret_unlocked_title'),
        message: newStatus
          ? t('conversation.secret_protected_msg')
          : t('conversation.secret_unlocked_msg'),
        confirmText: t('common.ok'),
      })
    } catch (error) {
      console.error('❌ Erreur toggle secret:', error)
    }
  }

  // 🔄 Charger le statut Premium au montage
  useEffect(() => {
    const loadPremiumStatus = async () => {
      const status = await premiumService.isPremium()
      setIsPremium(status)
    }
    loadPremiumStatus()
  }, [])

  // 🎯 Charger deepDreamRemaining si pas premium
  useEffect(() => {
    const loadDeepDreamRemaining = async () => {
      if (isPremium) return
      try {
        const remaining = await freeTierService.getDeepDreamRemaining()
        setDeepDreamRemaining(remaining)
      } catch (e) {
        setDeepDreamRemaining(0)
      }
    }
    loadDeepDreamRemaining()
  }, [isPremium])

  const date = new Date(dreamDate)
  const formattedTime = date.toLocaleTimeString(i18next.language, { hour: '2-digit', minute: '2-digit' })
  const formattedDate = date.toLocaleDateString(i18next.language)

  async function handleSelectReanalyzeModel(useClaude) {
    if (useClaude && !isPremium) {
      setReanalyzeDropdownOpen(false)
      setShowActivateModal(true)
      return
    }
    reanalyzeWithModel(useClaude)
  }

  function handlePurchaseSuccess() {
    setIsPremium(true)
    setShowActivateModal(false)
    reanalyzeWithModel(true)
  }

  async function reanalyzeWithModel(useClaude) {
    setReanalyzeDropdownOpen(false)
    setIsReanalyzing(true)
    try {
      const result = await analyzeDreamFromText(dreamTranscription, useClaude)
      await saveAnalysis(dreamId, result, useClaude ? 'claude' : 'llama')
      setCurrentAnalysis(result.analysis)
      if (result.title && result.title !== 'Rêve sans titre') setCurrentDreamTitle(result.title)
      showAlert({ type: 'success', title: t('conversation.reanalyze_success_title'), message: t('conversation.reanalyze_success_msg'), confirmText: t('conversation.reanalyze_success_confirm') })
      if (result.imagePrompt) {
        setCurrentImageUrl(null)
        generateDreamImage(result.imagePrompt, dreamId, result.title || currentDreamTitle)
          .then((imageResult) => {
            if (imageResult) {
              saveDreamImage(dreamId, { imageUrl: imageResult.imageUrl, imagePrompt: imageResult.imagePrompt })
              setCurrentImageUrl(imageResult.imageUrl)
            }
          })
          .catch((err) => console.warn('⚠️ Image non re-générée:', err.message))
      }
    } catch (error) {
      console.error('❌ Erreur re-analyse:', error)
      if (error.code === 'DAILY_LIMIT') {
        showAlert({ type: 'info', title: t('conversation.limitReached_title'), message: t('conversation.limitReached_msg'), confirmText: t('conversation.limitReached_confirm') })
      } else {
        showAlert({ type: 'error', title: t('common.error'), message: t('conversation.reanalyze_error_msg'), confirmText: t('conversation.limitReached_confirm') })
      }
    } finally {
      setIsReanalyzing(false)
    }
  }

  // ============================================
  // EXPORT PDF PRO
  // ============================================
  const generatePdfHtml = () => {
    let analysisType = 'Non analysé'
    let analysisColor = '#64748B'
    if (modelUsed) {
      if (modelUsed.toLowerCase().includes('claude')) { analysisType = 'DeepDream'; analysisColor = '#8A2BE2' }
      else if (modelUsed.toLowerCase().includes('llama')) { analysisType = 'QuickDream'; analysisColor = '#10B981' }
    }
    const transcription = dreamTranscription?.trim() || 'Récit non disponible'
    let analysisText = currentAnalysis || 'Analyse non disponible'
    analysisText = analysisText
      .replace(/### (.*)/g, '<h4>$1</h4>').replace(/## (.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/---/g, '<hr/>').replace(/\n/g, '<br/>')
    let tagsHtml = ''
    if (dreamTags && Array.isArray(dreamTags) && dreamTags.length > 0) {
      tagsHtml = `<div class="section"><h2>🏷️ Thèmes détectés</h2><div class="tags">${dreamTags.map((t) => `<span class="tag">${t}</span>`).join('')}</div></div>`
    }
    const reflectionQuestions = [
      'Quelle émotion ce rêve a-t-il suscité au réveil ?',
      'Y a-t-il un lien avec des événements récents de votre vie ?',
      'Ce thème revient-il souvent dans vos rêves ?',
      "Qu'aimeriez-vous explorer davantage ?",
    ]
    const reflectionHtml = reflectionQuestions.map((q) => `<div class="reflection-item">• ${q}</div>`).join('')
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapport de rêve - Noctaliæ</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0c0e27;color:#FFF;padding:40px;line-height:1.6}.container{max-width:800px;margin:0 auto;background:#0f1130;border-radius:20px;padding:40px;border:1px solid #1a1f3a}.header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #D2B14C}.logo{font-size:32px;font-weight:700;color:#D2B14C;margin-bottom:10px}.title{font-size:24px;font-weight:600;color:#00FFB0;margin-bottom:10px}.subtitle{color:#A0B4D4;font-size:14px}.meta{display:flex;justify-content:space-between;margin-bottom:30px;padding:15px;background:#1a1f3a;border-radius:12px}.meta-label{color:#A0B4D4;font-size:12px}.meta-value{color:#FFF;font-weight:600}.analysis-badge{background:${analysisColor};color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}.section{margin-bottom:30px}.section h2{color:#D2B14C;font-size:18px;margin-bottom:15px}.section-content{background:#1a1f3a;padding:20px;border-radius:12px;color:#E0E0E0}.tags{display:flex;flex-wrap:wrap;gap:10px}.tag{background:#D2B14C20;color:#D2B14C;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600}.reflection-container{background:#1a1f3a;padding:20px;border-radius:12px}.reflection-item{color:#A0B4D4;margin-bottom:12px;font-size:14px}.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #1a1f3a;color:#A0B4D4;font-size:12px}</style></head><body><div class="container"><div class="header"><div class="logo">🌙 Noctaliæ</div><div class="title">${dreamTitle}</div><div class="subtitle">Rapport de rêve</div></div><div class="meta"><div><span class="meta-label">📅 Date</span> <span class="meta-value">${formattedDate} à ${formattedTime}</span></div><div><span class="analysis-badge">${analysisType}</span></div></div><div class="section"><h2>📝 Récit du rêve</h2><div class="section-content">${transcription}</div></div><div class="section"><h2>🧠 Analyse scientifique</h2><div class="section-content">${analysisText}</div></div>${tagsHtml}<div class="section"><h2>💡 Questions de réflexion</h2><div class="reflection-container">${reflectionHtml}</div></div><div class="footer">Analysé avec <strong>Noctaliæ</strong> • Science du rêve<br/><small>Ce rapport peut être partagé avec un professionnel de santé</small></div></div></body></html>`
  }

  const handleExportPdf = async () => {
    setIsExportingPdf(true)
    try {
      const html = generatePdfHtml()
      const { uri } = await Print.printToFileAsync({ html, base64: false })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Rapport: ${dreamTitle}`, UTI: 'com.adobe.pdf' })
      }
    } catch (error) {
      console.error('❌ Erreur export PDF:', error)
      showAlert({ type: 'error', title: t('common.error'), message: t('conversation.pdf_error_msg'), confirmText: t('common.ok') })
    } finally {
      setIsExportingPdf(false)
    }
  }

  // ============================================
  // 📤 PARTAGE FRIENDLY — image + caption texte
  // ============================================
  const buildShareCaption = () => {
    const title   = currentDreamTitle || 'Mon rêve'
    const date    = new Date(dreamDate).toLocaleDateString(i18next.language, { weekday: 'long', day: 'numeric', month: 'long' })
    const dateStr = date.charAt(0).toUpperCase() + date.slice(1)
    const tags    = (dreamTags || []).slice(0, 3).map(t => `#${t}`).join(' ')
    const lines   = [
      `🌙 ${title}`,
      `📅 ${dateStr}`,
      shareCaptionText ? `\n"${shareCaptionText}"` : '',
      tags ? `\n${tags}` : '',
      `\nAnalysé avec Noctaliæ`,
    ].filter(Boolean).join('\n')
    return lines
  }

  // handleShareFriendlyDirect → remplacé par useDreamShare hook
  const handleShareFriendlyDirect = async () => {
    setShowShareMenu(false)
    await handleShareFriendlyCapture()
  }

  // ============================================
  // 📦 ARCHIVER LE RÊVE
  // ============================================
  const handleArchive = () => {
    showAlert({
      type: 'confirm',
      title: t('conversation.archiveAlert_title'),
      message: t('conversation.archiveAlert_msg_full'),
      confirmText: t('conversation.archiveAlert_confirm'),
      cancelText: t('common.cancel'),
      onConfirm: async () => {
        try {
          await archiveDream(dreamId)
          navigation.navigate('MainTabs', { screen: 'Analysis' })
        } catch (error) {
          console.error('❌ Erreur archivage:', error)
          showAlert({ type: 'error', title: t('common.error'), message: t('conversation.archive_error_msg'), confirmText: t('common.ok') })
        }
      },
    })
  }

  const ContainerComponent = Platform.OS === 'ios' ? KeyboardAvoidingView : View
  const containerProps = Platform.OS === 'ios' ? { behavior: 'padding', keyboardVerticalOffset: 0 } : {}

  return (
    <ContainerComponent style={[styles.container, { paddingTop: insets.top }]} {...containerProps}>
      <DebugScreenLabel screenName="💬 Conversation" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        {readOnly ? (
          <TouchableOpacity
            style={[styles.restoreHeaderBtn]}
            onPress={async () => {
              const { restoreDream } = await import('../services/storageService')
              await restoreDream(dreamId)
              navigation.goBack()
            }}
          >
            <MaterialIcons name="restore" size={16} color={THEME.colors.success} />
            <Text style={styles.restoreHeaderText}>{t('conversation.restoreBtn')}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity onPress={() => setShowShareMenu(true)} style={styles.iconButton} disabled={isExportingPdf}>
              {isExportingPdf ? (
                <ActivityIndicator size="small" color={THEME.colors.primary} />
              ) : (
                <MaterialIcons name="ios-share" size={24} color={THEME.colors.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleSecret} style={styles.iconButton}>
              <MaterialCommunityIcons name={isSecret ? 'lock' : 'lock-open-outline'} size={24} color={isSecret ? '#8B5CF6' : THEME.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleArchive} style={styles.iconButton}>
              <MaterialIcons name="archive" size={24} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('transcription')}>
            <View style={[styles.tabContent, activeTab === 'transcription' && styles.tabContentActive]}>
              <MaterialIcons name="text-fields" size={18} color={activeTab === 'transcription' ? THEME.colors.primary : THEME.colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'transcription' && styles.tabTextActive]}>{t('conversation.tabTranscription')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('analysis')}>
            <View style={[styles.tabContent, activeTab === 'analysis' && styles.tabContentActive]}>
              <MaterialCommunityIcons name="brain" size={18} color={activeTab === 'analysis' ? THEME.colors.primary : THEME.colors.textSecondary} />
              <Text style={[styles.tabText, activeTab === 'analysis' && styles.tabTextActive]}>{t('conversation.tabAnalysis')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Boutons actions (mode Analyse) — cachés en readOnly */}
      {activeTab === 'analysis' && !readOnly && (
        <View style={styles.actionsSection}>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.smallButton, { borderColor: THEME.colors.primary }]}
              onPress={() => navigation.navigate('DeepChat', { dreamId, dreamAnalysis: currentAnalysis, dreamTranscription, dreamTitle, modelUsed, suggestedQuestions: parsedAnalysisQuestions, dreamImagePalette })}
            >
              <MaterialCommunityIcons name="chat-processing" size={16} color={THEME.colors.primary} />
              <Text style={[styles.smallButtonText, { color: THEME.colors.primary }]}>{t('conversation.btnApprofondir')}</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, position: 'relative' }}>
              <TouchableOpacity
                style={[styles.smallButton, { borderColor: THEME.colors.warmGold }]}
                onPress={() => setReanalyzeDropdownOpen(!reanalyzeDropdownOpen)}
                disabled={isReanalyzing}
              >
                {isReanalyzing ? (
                  <ActivityIndicator color={THEME.colors.warmGold} size="small" />
                ) : (
                  <>
                    <MaterialIcons name="refresh" size={16} color={THEME.colors.warmGold} />
                    <Text style={[styles.smallButtonText, { color: THEME.colors.warmGold }]}>{t('conversation.btnReanalyse')}</Text>
                    <MaterialIcons name={reanalyzeDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={16} color={THEME.colors.warmGold} />
                  </>
                )}
              </TouchableOpacity>
              {reanalyzeDropdownOpen && (
                <View style={styles.reanalyzeDropdown}>
                  <TouchableOpacity style={styles.dropdownOption} onPress={() => handleSelectReanalyzeModel(true)}>
                    <MaterialCommunityIcons name="electron-framework" size={24} color="#4F8DFF" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownOptionTitle}>DeepDream</Text>
                      <Text style={styles.dropdownOptionDesc}>{t('conversation.dropdown_deepDesc')}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.dropdownOption, styles.dropdownOptionBorder]} onPress={() => handleSelectReanalyzeModel(false)}>
                    <MaterialCommunityIcons name="flash" size={24} color="#00FFB0" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownOptionTitle}>QuickDream</Text>
                      <Text style={styles.dropdownOptionDesc}>{t('conversation.dropdown_quickDesc')}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={[styles.content, { backgroundColor: THEME.colors.cardBackground }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentImageUrl && !heroImageError ? (
          <TouchableOpacity activeOpacity={0.92} onPress={() => setShowImageViewer(true)}>
            <View style={styles.conversationHeroImageContainer}>
              <Image source={{ uri: currentImageUrl }} style={styles.conversationHeroImage} resizeMode="cover" onError={() => setHeroImageError(true)} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', THEME.colors.cardBackground]} locations={[0.2, 0.65, 1]} style={styles.conversationHeroGradient} />
              <View style={styles.heroExpandHint}>
                <MaterialIcons name="fullscreen" size={18} color="rgba(255,255,255,0.7)" />
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <DreamFallbackHero
            tags={dreamTags}
            title={currentDreamTitle}
            analysis={currentAnalysis}
            height={200}
            style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
            onPress={isImageLimited ? () => setShowSupportModal(true) : null}
          />
        )}

        <View style={[styles.heroSection, currentImageUrl && !heroImageError && styles.heroSectionWithImage]}>
          <Text style={styles.heroTitle} numberOfLines={5}>{currentDreamTitle}</Text>
          <View style={styles.metaInline}>
            <Text style={styles.metaText}>{formattedDate}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{formattedTime}</Text>
          </View>
          {modelUsed?.toLowerCase().includes('llama') && !isPremium && (
            <TouchableOpacity
              onPress={() => setShowActivateModal(true)}
              activeOpacity={0.7}
              style={{ marginLeft: 8 }}
            >
              <Text style={{ fontSize: 11, color: '#4F8DFF', fontFamily: 'AtkinsonHyperlegibleNext-Bold' }}>
                {t('conversation.tryDeepDream')}
              </Text>
            </TouchableOpacity>
          )}
          {dreamTags && dreamTags.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.heroTags}>
              {dreamTags.map((tag, index) => {
                const tagColor = THEME.colors.coolGrayGreen
                return (
                  <View key={index} style={[styles.heroTag, { backgroundColor: tagColor + '20', borderColor: tagColor }]}>
                    <Text style={[styles.heroTagText, { color: tagColor }]}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</Text>
                  </View>
                )
              })}
            </ScrollView>
          )}
        </View>

        {activeTab === 'analysis' ? (
          currentAnalysis ? (
            <>
              <MarkdownText style={styles.analysisText}>{currentAnalysis}</MarkdownText>

              {/* ⚠️ Disclaimer IA */}
              <View style={styles.aiDisclaimer}>
                <MaterialCommunityIcons name="information-outline" size={13} color={THEME.colors.textTertiary} />
                <Text style={styles.aiDisclaimerText}>
                  {t('conversation.disclaimer')}
                </Text>
              </View>

              {parsedAnalysisQuestions.length > 0 && (
                <View style={styles.tapQuestionsContainer}>
                  <Text style={styles.tapQuestionsLabel}>{t('conversation.exploreQuestions')}</Text>
                  {parsedAnalysisQuestions.map((q, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.tapQuestionChip}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('DeepChat', { dreamId, dreamAnalysis: currentAnalysis, dreamTranscription, dreamTitle, modelUsed, suggestedQuestions: parsedAnalysisQuestions, dreamImagePalette, initialMessage: q, dreamImageUrl: currentImageUrl, dreamDate, dreamTags })}
                    >
                      <Text style={styles.tapQuestionText}>{q}</Text>
                      <MaterialIcons name="arrow-forward" size={14} color={THEME.colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>{t('conversation.emptyAnalysis')}</Text>
          )
        ) : dreamTranscription ? (
          <Text style={styles.transcriptionText}>{dreamTranscription}</Text>
        ) : (
          <Text style={styles.emptyText}>{t('conversation.emptyTranscription')}</Text>
        )}
      </ScrollView>

      {/* 🔑 CTA Approfondir sticky */}
      {activeTab === 'analysis' && !readOnly && (
        <View style={styles.stickyCtaWrapper}>
          <TouchableOpacity
            style={styles.stickyCtaButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('DeepChat', { dreamId, dreamAnalysis: currentAnalysis, dreamTranscription, dreamTitle, modelUsed, suggestedQuestions: parsedAnalysisQuestions, dreamImagePalette, dreamImageUrl: currentImageUrl, dreamDate, dreamTags })}
          >
            <MaterialCommunityIcons name="chat-processing" size={20} color={THEME.colors.background} />
            <Text style={styles.stickyCtaText}>{t('conversation.stickyCtaApprofondir')}</Text>
            <MaterialIcons name="arrow-forward" size={18} color={THEME.colors.background} />
          </TouchableOpacity>
        </View>
      )}

      <ActivateDeepDreamModal visible={showActivateModal} onClose={() => setShowActivateModal(false)} onPurchaseSuccess={handlePurchaseSuccess} hasFreeTrials={deepDreamRemaining !== null && deepDreamRemaining > 0} freeTrialsRemaining={deepDreamRemaining || 0} />

      {/* 📤 Share Action Sheet */}
      {showShareMenu && (
        <TouchableOpacity style={styles.shareMenuOverlay} activeOpacity={1} onPress={() => setShowShareMenu(false)}>
          <TouchableOpacity style={styles.shareActionSheet} activeOpacity={1} onPress={() => {}}>
            <View style={styles.shareSheetHandle} />
            <Text style={styles.shareSheetTitle}>{t('conversation.shareSheet_title')}</Text>

            <TouchableOpacity style={styles.shareSheetOption} activeOpacity={0.7} onPress={() => { setShowShareMenu(false); setTimeout(handleShareFriendlyDirect, 200) }}>
              <View style={[styles.shareSheetIconWrap, { backgroundColor: 'rgba(255,153,102,0.1)', borderColor: 'rgba(255,153,102,0.3)' }]}>
                <MaterialCommunityIcons name="heart-outline" size={22} color="#FF9966" />
              </View>
              <View style={styles.shareSheetOptionText}>
                <Text style={styles.shareSheetOptionTitle}>{t('conversation.shareSheet_friendly')}</Text>
                <Text style={styles.shareSheetOptionDesc}>{t('conversation.shareSheet_friendlyDescShort')}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={THEME.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareSheetOption} activeOpacity={0.7} onPress={() => { setShowShareMenu(false); setTimeout(handleExportPdf, 200) }}>
              <View style={[styles.shareSheetIconWrap, { backgroundColor: 'rgba(210,177,76,0.1)', borderColor: 'rgba(210,177,76,0.3)' }]}>
                <MaterialIcons name="picture-as-pdf" size={22} color={THEME.colors.warmGold} />
              </View>
              <View style={styles.shareSheetOptionText}>
                <Text style={styles.shareSheetOptionTitle}>{t('conversation.shareSheet_pdfTitle')}</Text>
                <Text style={styles.shareSheetOptionDesc}>{t('conversation.shareSheet_pdfDescShort')}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={THEME.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareSheetCancel} onPress={() => setShowShareMenu(false)}>
              <Text style={styles.shareSheetCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <DreamImageViewer
        visible={showImageViewer}
        dream={{ imageUrl: currentImageUrl, imagePalette: dreamImagePalette, dreamTitle: currentDreamTitle, date: dreamDate, tags: dreamTags, analysis: currentAnalysis }}
        shareCaption={shareCaptionText}
        onClose={() => setShowImageViewer(false)}
        onSharePro={handleExportPdf}
      />

      <AlertComponent />
      {/* ── Template hors-écran pour capture branding ── */}
      <ShareOverlay />
    </ContainerComponent>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  conversationHeroImageContainer: { width: '100%', height: 200, position: 'relative', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  conversationHeroImage: { width: '100%', height: '100%' },
  conversationHeroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' },
  heroExpandHint: { position: 'absolute', bottom: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  heroSection: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  heroSectionWithImage: { marginTop: -24, paddingTop: 0 },
  heroTitle: { fontSize: 30, fontFamily: 'CormorantUpright-Bold', color: THEME.colors.primary, lineHeight: 40, paddingBottom: 4, marginBottom: 12 },
  metaInline: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  metaText: { fontSize: 13, color: THEME.colors.textSecondary, fontFamily: 'AtkinsonHyperlegibleNext-Medium' },
  metaDot: { fontSize: 13, color: THEME.colors.textTertiary, marginHorizontal: 8 },
  heroTags: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  heroTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, opacity: 0.6, gap: 4 },
  heroTagText: { fontSize: 11, fontFamily: 'AtkinsonHyperlegibleNext-Medium' },
  tabsWrapper: { backgroundColor: THEME.colors.background, borderBottomWidth: 1, borderBottomColor: THEME.colors.cardBorder },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20 },
  tab: { flex: 1, paddingVertical: 12 },
  tabContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabContentActive: { borderBottomColor: THEME.colors.primary },
  tabText: { fontSize: 14, fontFamily: 'AtkinsonHyperlegibleNext-Medium', color: THEME.colors.textSecondary },
  tabTextActive: { color: THEME.colors.primary, fontFamily: 'AtkinsonHyperlegibleNext-SemiBold' },
  actionsSection: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: THEME.colors.cardBackground, borderBottomWidth: 1, borderBottomColor: THEME.colors.cardBorder },
  buttonsRow: { flexDirection: 'row', gap: 8 },
  smallButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, gap: 6 },
  smallButtonText: { fontSize: 14, fontFamily: 'AtkinsonHyperlegibleNext-Bold' },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 220 },
  analysisText: { fontSize: 15, lineHeight: 24, color: THEME.colors.textSecondary, fontFamily: 'AtkinsonHyperlegibleNext-Regular' },
  transcriptionText: { fontSize: 15, lineHeight: 24, color: THEME.colors.textSecondary, fontFamily: 'AtkinsonHyperlegibleNext-Regular' },
  emptyText: { fontSize: 15, color: THEME.colors.textTertiary, fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
  aiDisclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 24, marginBottom: 8, paddingTop: 14, paddingBottom: 14, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: THEME.colors.cardBorder, borderRadius: 8, backgroundColor: 'rgba(160, 180, 212, 0.06)', opacity: 0.85 },
  aiDisclaimerText: { flex: 1, fontSize: 11, lineHeight: 16, color: THEME.colors.textTertiary, fontFamily: 'AtkinsonHyperlegibleNext-Regular', fontStyle: 'italic' },
  tapQuestionsContainer: { marginTop: 24, gap: 10 },
  tapQuestionsLabel: { fontSize: 12, fontFamily: 'AtkinsonHyperlegibleNext-Medium', color: THEME.colors.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  tapQuestionChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0, 255, 176, 0.06)', borderWidth: 1, borderColor: 'rgba(0, 255, 176, 0.25)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  tapQuestionText: { flex: 1, fontSize: 14, fontFamily: 'AtkinsonHyperlegibleNext-Regular', color: THEME.colors.text, lineHeight: 20 },
  stickyCtaWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28, backgroundColor: 'transparent' },
  stickyCtaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.colors.primary, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, gap: 10, ...Platform.select({ ios: { shadowColor: THEME.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16 }, android: { elevation: 12 } }) },
  stickyCtaText: { fontSize: 16, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: THEME.colors.background, letterSpacing: 0.3 },
  shareCardModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  restoreHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: THEME.colors.success, backgroundColor: THEME.colors.success + '15' },
  restoreHeaderText: { fontSize: 14, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: THEME.colors.success },
  reanalyzeDropdown: { position: 'absolute', top: 40, left: 0, right: 0, backgroundColor: THEME.colors.backgroundElevated, borderRadius: 12, borderWidth: 1, borderColor: THEME.colors.dividerStrong, zIndex: 1000, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, android: { elevation: 8 } }) },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  dropdownOptionBorder: { borderTopWidth: 1, borderColor: THEME.colors.divider },
  dropdownOptionTitle: { fontSize: 14, fontFamily: 'AtkinsonHyperlegibleNext-SemiBold', color: THEME.colors.textPrimary },
  dropdownOptionDesc: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2, fontFamily: 'AtkinsonHyperlegibleNext-Regular' },
  shareMenuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', zIndex: 2000 },
  shareActionSheet: { backgroundColor: THEME.colors.cardBackground, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, borderTopWidth: 1, borderColor: THEME.colors.cardBorder },
  shareSheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: THEME.colors.textTertiary, alignSelf: 'center', marginBottom: 16 },
  shareSheetTitle: { fontSize: 15, fontFamily: 'AtkinsonHyperlegibleNext-SemiBold', color: THEME.colors.textSecondary, textAlign: 'center', marginBottom: 16, letterSpacing: 0.3 },
  shareSheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14, borderBottomWidth: 1, borderBottomColor: THEME.colors.cardBorder },
  shareSheetIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  shareSheetOptionText: { flex: 1 },
  shareSheetOptionTitle: { fontSize: 15, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: THEME.colors.text },
  shareSheetOptionDesc: { fontSize: 12, fontFamily: 'AtkinsonHyperlegibleNext-Regular', color: THEME.colors.textSecondary, marginTop: 2 },
  shareSheetCancel: { alignItems: 'center', paddingVertical: 16, marginTop: 4 },
  shareSheetCancelText: { fontSize: 15, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: THEME.colors.textSecondary },
})
