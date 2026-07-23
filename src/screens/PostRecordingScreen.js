import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  TextInput
} from 'react-native';
import { ActivateDeepDreamModal } from '../modals/ActivateDeepDreamModal';
import { DeepDreamInfoModal } from '../components/DeepDreamInfoModal';
import { useNoctaliaeAlert } from '../components/NoctaliaeAlert';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyzeDreamFromText, generateDreamImage } from '../services/apiService';
import { saveAnalysis, saveDreamImage, saveDreamMetadata } from '../services/storageService';
import { securityService } from '../services/securityService';
import { premiumService } from '../services/premiumService';
import { freeTierService } from '../services/freeTierService';
import * as FileSystem from 'expo-file-system/legacy';
import { THEME } from '../config/theme';
import DebugScreenLabel from '../components/DebugScreenLabel';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

// 🏷️ Fonction pour extraire un titre intelligent depuis l'analyse
function extractDreamTitle(analysis, transcription) {
  const moonPatterns = [
    /^##\s*🌙\s*(.+?)(?:\n|$)/m,
    /^#\s*🌙\s*(.+?)(?:\n|$)/m,
    /^🌙\s*(.+?)(?:\n|$)/m,
    /\*\*🌙\s*(.+?)\*\*/,
  ];

  for (const pattern of moonPatterns) {
    const match = analysis.match(pattern);
    if (match && match[1].trim().length > 5 && match[1].trim().length < 80) {
      return match[1].trim();
    }
  }

  const analyseMatch = analysis.match(/Analyse de votre rêve[:\s]*["«]?([^"»\n]+)["»]?/i);
  if (analyseMatch && analyseMatch[1].trim().length > 5) {
    return analyseMatch[1].trim();
  }

  const cleanAnalysis = analysis
    .replace(/^[#*\s]+/gm, '')
    .replace(/[🌙📌📊🔗😊🧠💡✨🌟💫🌌😴🌃⚡💤🌈]/g, '')
    .trim();

  const sentences = cleanAnalysis.split(/[.!?\n]+/);
  for (const sentence of sentences) {
    const cleaned = sentence.trim();
    if (cleaned.length > 15 && cleaned.length < 70 && !cleaned.toLowerCase().includes('analyse')) {
      return cleaned;
    }
  }

  const firstTranscript = transcription.split(/[.!?]/)[0].trim();
  if (firstTranscript.length > 10 && firstTranscript.length < 60) {
    return firstTranscript;
  }

  return i18next.t('common.defaultDreamTitle', { date: new Date().toLocaleDateString(i18next.language) });
}


// ============================================
// MAIN COMPONENT
// ============================================
export default function PostRecordingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { dreamId, audioUri, transcription, duration, source } = route.params;

  const { showAlert, AlertComponent } = useNoctaliaeAlert();
  const { t } = useTranslation();

  const [editableTranscript, setEditableTranscript] = useState(transcription || '');

  const [isPremium, setIsPremium] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [deepDreamRemaining, setDeepDreamRemaining] = useState(null);
  const [selectedEngine, setSelectedEngine] = useState('deep');

  // 🌙 Métadonnées optionnelles (section dépliable)
  const [showMetadata, setShowMetadata] = useState(false);
  const [dreamMetadata, setDreamMetadata] = useState({ lucidity: null, sleepQuality: null, emotions: [], themes: [] });
  const EMOTIONS_LIST = ['Joie','Peur','Tristesse','Colère','Anxiété','Sérénité','Confusion','Excitation','Nostalgie','Amour'];
  const THEMES_LIST   = ['Vol','Chute','Eau','Poursuite','Animal','Famille','Travail','Nature','Ville','Lumière'];
  function toggleMeta(field, value) {
    setDreamMetadata(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value]
    }));
  }
  const hasMetadata = dreamMetadata.lucidity || dreamMetadata.sleepQuality || dreamMetadata.emotions.length || dreamMetadata.themes.length;

  const LOADING_MESSAGES = [
    t('postRecording.loading.msg1'),
    t('postRecording.loading.msg2'),
    t('postRecording.loading.msg3'),
    t('postRecording.loading.msg4'),
    t('postRecording.loading.msg5'),
    t('postRecording.loading.msg6'),
    t('postRecording.loading.msg7'),
    t('postRecording.loading.msg8'),
    t('postRecording.loading.msg9'),
    t('postRecording.loading.msg10'),
    t('postRecording.loading.msg11'),
    t('postRecording.loading.msg12'),
    t('postRecording.loading.msg13'),
    t('postRecording.loading.msg14'),
    t('postRecording.loading.msg15'),
  ];
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) return;
    setLoadingMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
    const interval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    async function loadPremiumAndSetModel() {
      try {
        const premium = await premiumService.isPremium();
        setIsPremium(premium);

        if (!premium) {
          const remaining = await freeTierService.getDeepDreamRemaining();
          setDeepDreamRemaining(remaining);
          // ⚠️ Ne pas basculer silencieusement sur 'quick' quand le quota est
          // épuisé : le défaut reste 'deep' pour que handleAnalyze déclenche
          // sa vérification de quota et affiche la modale paywall au premier
          // tap sur "Analyser", au lieu de partir sur Llama sans consentement.
        } else {
          setSelectedEngine('deep');
        }
      } catch (error) {
        console.error('❌ Erreur chargement Premium:', error);
      }
    }
    loadPremiumAndSetModel();
  }, []);

  function handlePurchaseSuccess() {
    setIsPremium(true);
    setShowActivateModal(false);
  }

  function handleContinueFree() {
    setShowActivateModal(false);
    setSelectedEngine('quick');
    handleAnalyze('quick');
  }

  const MIN_DURATION_SECONDS = 3;
  const MIN_TEXT_LENGTH = 10;

  async function handleAnalyze(forcedEngine) {
    const isPhotoSource = source?.startsWith('photo-');

    if (source === 'write' || isPhotoSource) {
      if (!editableTranscript || editableTranscript.trim().length < MIN_TEXT_LENGTH) {
        showAlert({
          type: 'warning',
          title: isPhotoSource ? t('postRecording.alertShortPhoto_title') : t('postRecording.alertShortWrite_title'),
          message: t('postRecording.alertShortContent_msg', { min: MIN_TEXT_LENGTH }),
          confirmText: t('postRecording.alertShortContent_confirm')
        });
        return;
      }
    } else {
      if (duration < MIN_DURATION_SECONDS) {
        showAlert({
          type: 'warning',
          title: t('postRecording.alertShortRec_title'),
          message: t('postRecording.alertShortRec_msg', { duration, plural: duration > 1 ? 's' : '', min: MIN_DURATION_SECONDS }),
          confirmText: t('postRecording.alertShortRec_confirm')
        });
        return;
      }
    }

    if (!editableTranscript || editableTranscript.trim().length === 0) {
      showAlert({
        type: 'error',
        title: t('postRecording.alertNoContent_title'),
        message: t('postRecording.alertNoContent_msg'),
        confirmText: t('common.ok')
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const premium = await premiumService.isPremium();
      const engine = forcedEngine || selectedEngine;
      let useDeepDream;

      if (premium) {
        useDeepDream = engine === 'deep';
      } else if (engine === 'deep') {
        const allowance = await freeTierService.checkDeepDreamAllowance();
        if (allowance.remaining <= 0) {
          setShowActivateModal(true);
          setIsAnalyzing(false);
          return;
        }
        useDeepDream = true;
      } else {
        useDeepDream = false;
      }

      const metaPayload = hasMetadata ? dreamMetadata : null;

      // 🩺 DEBUG TEMPORAIRE — à retirer une fois le bug écriture directe vs
      // transcript édité diagnostiqué (voir échange sur le timeout 470 chars)
      console.log('🩺 [DIAG] analyzeDreamFromText appel:', {
        source,
        endpoint: useDeepDream ? 'analyze (DeepDream/Claude)' : 'analyzeFree (QuickDream/Llama)',
        useDeepDream,
        premium,
        textLength: editableTranscript.length,
        newlineCount: (editableTranscript.match(/\n/g) || []).length,
      });

      const result = await analyzeDreamFromText(editableTranscript, useDeepDream, metaPayload, premium);

      await saveAnalysis(dreamId, result, result.model || (useDeepDream ? 'claude' : 'llama'));
      if (metaPayload) saveDreamMetadata(dreamId, metaPayload);

      if (!premium) {
        if (useDeepDream) {
          await freeTierService.incrementDeepDreamCount();
          const remaining = await freeTierService.getDeepDreamRemaining();
          setDeepDreamRemaining(remaining);
        }
      }

      const extractedTitle = (result.title && result.title !== 'Rêve sans titre')
        ? result.title
        : extractDreamTitle(result.analysis, transcription);

      const dreamPalette = result.palette || ['#00FFB0', '#4F8DFF', '#D2B14C'];

      // 🔊 Cleanup audio en fire-and-forget (ne doit pas bloquer la navigation)
      securityService.deleteAudioIfNeeded(audioUri, FileSystem)
        .catch(err => console.warn('⚠️ Audio cleanup failed:', err));

      if (result.imagePrompt && useDeepDream) {
        freeTierService.checkImageAllowance().then(allowance => {
          if (!allowance.allowed) {
            console.log('🎨 Quota images épuisé, génération sautée');
            return;
          }
          generateDreamImage(result.imagePrompt, dreamId, extractedTitle)
            .then(imageResult => {
              if (imageResult) {
                saveDreamImage(dreamId, {
                  imageUrl: imageResult.imageUrl,
                  imagePrompt: imageResult.imagePrompt,
                  palette: dreamPalette,
                });
                freeTierService.incrementImageCount();
                console.log('🎨 Image de rêve générée en background !');
              }
            })
            .catch(err => console.warn('⚠️ Image non générée:', err.message));
        }).catch(err => console.warn('⚠️ Check quota image échoué:', err.message));
      }

      navigation.reset({
        index: 1,
        routes: [
          { name: 'MainTabs' },
          { name: 'Conversation', params: {
            dreamId: dreamId,
            dreamAnalysis: result.analysis,
            dreamTranscription: editableTranscript,
            dreamTitle: extractedTitle,
            dreamDate: new Date().toISOString(),
            dreamImagePalette: dreamPalette,
          }},
        ],
      });
    } catch (error) {
      console.error('❌ Erreur analyse:', error);
      if (error.code === 'DAILY_LIMIT' || error.status === 429) {
        setShowActivateModal(true);
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network') || error.message?.includes('fetch')) {
        showAlert({
          type: 'error',
          title: t('postRecording.alertNetwork_title'),
          message: t('postRecording.alertNetwork_msg'),
          confirmText: t('postRecording.alertNetwork_retry'),
          cancelText: t('common.cancel'),
          onConfirm: () => handleAnalyze(),
        });
      } else if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
        showAlert({
          type: 'warning',
          title: t('postRecording.alertTimeout_title'),
          message: t('postRecording.alertTimeout_msg'),
          confirmText: t('postRecording.alertTimeout_retry'),
          cancelText: t('common.cancel'),
          onConfirm: () => handleAnalyze(),
        });
      } else {
        showAlert({
          type: 'error',
          title: t('postRecording.alertFailed_title'),
          message: t('postRecording.alertFailed_msg'),
          confirmText: t('postRecording.alertFailed_retry'),
          cancelText: t('common.cancel'),
          onConfirm: () => handleAnalyze(),
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Tooltip contextuel selon la source
  const getTooltipText = () => {
    if (source === 'write') return t('postRecording.tooltipWrite');
    if (source?.startsWith('photo-')) return t('postRecording.tooltipPhoto');
    return t('postRecording.tooltipDefault');
  };



  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DebugScreenLabel screenName="📝 Post-Enregistrement" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('postRecording.header')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* 💡 Tooltip contextuel */}
        <View style={styles.transcriptTooltip}>
          <MaterialIcons name="lightbulb-outline" size={16} color={THEME.colors.primary} />
          <Text style={styles.transcriptTooltipText}>{getTooltipText()}</Text>
        </View>

        {/* Transcription éditable */}
        <View style={styles.transcriptBox}>
          <TextInput
            style={[styles.transcriptInput, isAnalyzing && styles.transcriptInputDisabled]}
            value={editableTranscript}
            onChangeText={setEditableTranscript}
            editable={!isAnalyzing}
            multiline
            textAlignVertical="top"
            placeholder={t('postRecording.placeholder')}
            placeholderTextColor={THEME.colors.textSecondary}
          />
        </View>

        {/* 🌙 SECTION MÉTADONNÉES - DÉPLIABLE */}
        <TouchableOpacity
          style={styles.metaToggle}
          onPress={() => setShowMetadata(v => !v)}
          activeOpacity={0.8}
        >
          <View style={styles.metaToggleLeft}>
            <MaterialCommunityIcons name="tune-variant" size={18} color={hasMetadata ? THEME.colors.primary : THEME.colors.textSecondary} />
            <Text style={[styles.metaToggleText, hasMetadata && { color: THEME.colors.primary }]}>
              {hasMetadata
                ? `${t('postRecording.enrichPrefix')}${[dreamMetadata.lucidity && t('postRecording.meta.lucidityTag'), dreamMetadata.sleepQuality && t('postRecording.meta.sleepTag'), dreamMetadata.emotions.length && t('postRecording.meta.emotionsCount', {count: dreamMetadata.emotions.length}), dreamMetadata.themes.length && t('postRecording.meta.themesCount', {count: dreamMetadata.themes.length})].filter(Boolean).join(', ')}`
                : t('postRecording.enrichTitle')}
            </Text>
          </View>
          <MaterialIcons name={showMetadata ? 'expand-less' : 'expand-more'} size={20} color={THEME.colors.textSecondary} />
        </TouchableOpacity>

        {showMetadata && (
          <View style={styles.metaPanel}>
            {/* LUCIDITÉ */}
            <Text style={styles.metaLabel}>{t('postRecording.meta.lucidityLabel')}</Text>
            <View style={styles.metaRating}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setDreamMetadata(p => ({ ...p, lucidity: p.lucidity === n ? null : n }))} style={[styles.metaDot, dreamMetadata.lucidity >= n && styles.metaDotActive]} activeOpacity={0.7}>
                  <Text style={[styles.metaDotText, dreamMetadata.lucidity >= n && styles.metaDotTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.metaRatingLabel}>
                {dreamMetadata.lucidity ? t('postRecording.meta.lucidity_' + dreamMetadata.lucidity) : ''}
              </Text>
            </View>

            {/* QUALITÉ SOMMEIL */}
            <Text style={styles.metaLabel}>{t('postRecording.meta.sleepLabel')}</Text>
            <View style={styles.metaRating}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setDreamMetadata(p => ({ ...p, sleepQuality: p.sleepQuality === n ? null : n }))} style={[styles.metaDot, styles.metaDotSleep, dreamMetadata.sleepQuality >= n && styles.metaDotSleepActive]} activeOpacity={0.7}>
                  <Text style={[styles.metaDotText, dreamMetadata.sleepQuality >= n && styles.metaDotTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.metaRatingLabel}>
                {dreamMetadata.sleepQuality ? t('postRecording.meta.sleep_' + dreamMetadata.sleepQuality) : ''}
              </Text>
            </View>

            {/* ÉMOTIONS */}
            <Text style={styles.metaLabel}>{t('postRecording.meta.emotionsLabel')}</Text>
            <View style={styles.metaChips}>
              {EMOTIONS_LIST.map(e => (
                <TouchableOpacity key={e} onPress={() => toggleMeta('emotions', e)} style={[styles.metaChip, dreamMetadata.emotions.includes(e) && styles.metaChipActive]} activeOpacity={0.7}>
                  <Text style={[styles.metaChipText, dreamMetadata.emotions.includes(e) && styles.metaChipTextActive]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* THÈMES */}
            <Text style={styles.metaLabel}>{t('postRecording.meta.themesLabel')}</Text>
            <View style={styles.metaChips}>
              {THEMES_LIST.map(theme => (
                <TouchableOpacity key={theme} onPress={() => toggleMeta('themes', theme)} style={[styles.metaChip, dreamMetadata.themes.includes(theme) && styles.metaChipActive]} activeOpacity={0.7}>
                  <Text style={[styles.metaChipText, dreamMetadata.themes.includes(theme) && styles.metaChipTextActive]}>{theme}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.metaHint}>{t('postRecording.meta.hint')}</Text>
          </View>
        )}

        {/* Sélecteur moteur */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => setShowInfoModal(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ padding: 4 }}
          >
            <MaterialIcons name="info-outline" size={18} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.engineSelector, isAnalyzing && { opacity: 0.5 }]}>
          <TouchableOpacity
            style={[styles.engineOption, selectedEngine === 'quick' && styles.engineOptionActive]}
            onPress={() => setSelectedEngine('quick')}
            disabled={isAnalyzing}
            activeOpacity={0.7}
          >
            <View style={[styles.engineRadio, selectedEngine === 'quick' && styles.engineRadioActive]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.engineOptionTitle, { color: selectedEngine === 'quick' ? '#00FFB0' : THEME.colors.textSecondary }]}>
                ⚡ QuickDream
              </Text>
              <Text style={styles.engineOptionDesc}>{t('postRecording.engine.freeLabel')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.engineOption, selectedEngine === 'deep' && styles.engineOptionActiveDeep]}
            onPress={() => {
              if (isPremium || (deepDreamRemaining !== null && deepDreamRemaining > 0)) {
                setSelectedEngine('deep');
              } else {
                setShowActivateModal(true);
              }
            }}
            disabled={isAnalyzing}
            activeOpacity={0.7}
          >
            <View style={[styles.engineRadio, selectedEngine === 'deep' && styles.engineRadioActiveDeep]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.engineOptionTitle, { color: selectedEngine === 'deep' ? '#4F8DFF' : THEME.colors.textSecondary }]}>
                ✨ DeepDream
              </Text>
              <Text style={styles.engineOptionDesc}>
                {isPremium
                  ? t('postRecording.engine.premiumIncluded')
                  : (deepDreamRemaining !== null && deepDreamRemaining > 0
                      ? t('postRecording.engine.tastesLeft', { count: deepDreamRemaining })
                      : t('postRecording.engine.unlockCta'))}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 🟢 BOUTON ANALYSER FLOTTANT */}
      <View style={[styles.floatingAnalyzeContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.floatingAnalyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
          onPress={() => handleAnalyze()}
          disabled={isAnalyzing}
          activeOpacity={0.8}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator color="#0c0e27" size="small" />
              <Text style={styles.floatingAnalyzeButtonText}>{LOADING_MESSAGES[loadingMessageIndex]}</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="brain" size={22} color="#0c0e27" />
              <Text style={styles.floatingAnalyzeButtonText}>{t('postRecording.analyzeCta')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ActivateDeepDreamModal
        visible={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
        hasFreeTrials={deepDreamRemaining !== null && deepDreamRemaining > 0}
        freeTrialsRemaining={deepDreamRemaining || 0}
        onContinueFree={handleContinueFree}
      />

      <DeepDreamInfoModal
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        isPremium={isPremium}
        onOpenPaywall={() => setShowActivateModal(true)}
      />

      <AlertComponent />
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 160,
    flexGrow: 1,
  },
  transcriptTooltip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(57, 255, 136, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  transcriptTooltipText: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.primary,
    lineHeight: 18,
  },
  transcriptBox: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minHeight: 300,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  transcriptInput: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 26,
    flex: 1,
    minHeight: 280,
    textAlignVertical: 'top',
  },
  transcriptInputDisabled: {
    opacity: 0.5,
  },
  engineLine: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    marginBottom: 16,
  },
  engineSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  engineOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: THEME.colors.cardBorder,
  },
  engineOptionActive: {
    borderColor: '#00FFB0',
    backgroundColor: 'rgba(0, 255, 176, 0.06)',
  },
  engineOptionActiveDeep: {
    borderColor: '#4F8DFF',
    backgroundColor: 'rgba(79, 141, 255, 0.06)',
  },
  engineRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: THEME.colors.textSecondary,
  },
  engineRadioActive: {
    borderColor: '#00FFB0',
    backgroundColor: '#00FFB0',
  },
  engineRadioActiveDeep: {
    borderColor: '#4F8DFF',
    backgroundColor: '#4F8DFF',
  },
  engineOptionTitle: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  engineOptionDesc: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  analyzeButtonDisabled: {
    backgroundColor: THEME.colors.textSecondary,
    opacity: 0.6,
  },
  floatingAnalyzeContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: THEME.colors.background + 'F0',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
  },
  floatingAnalyzeButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  floatingAnalyzeButtonText: {
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#0c0e27',
  },
  // 🌙 Métadonnées enrichissement
  metaToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginTop: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  metaToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  metaToggleText: { fontSize: 14, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: THEME.colors.textSecondary, flex: 1 },
  metaPanel: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 2,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginBottom: 12,
  },
  metaLabel: { fontSize: 13, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: THEME.colors.textSecondary, marginBottom: 10, marginTop: 12 },
  metaRating: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaRatingLabel: { fontSize: 12, color: THEME.colors.textSecondary, marginLeft: 4, flex: 1 },
  metaDot: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: THEME.colors.background,
    borderWidth: 2, borderColor: THEME.colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  metaDotActive: { backgroundColor: THEME.colors.primary + '20', borderColor: THEME.colors.primary },
  metaDotSleep: { borderColor: '#A0B4D4' },
  metaDotSleepActive: { backgroundColor: '#A0B4D420', borderColor: '#A0B4D4' },
  metaDotText: { fontSize: 14, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: THEME.colors.textSecondary },
  metaDotTextActive: { color: THEME.colors.text },
  metaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: THEME.colors.cardBorder,
    backgroundColor: 'transparent',
  },
  metaChipActive: { borderColor: THEME.colors.primary, backgroundColor: THEME.colors.primary + '18' },
  metaChipText: { fontSize: 13, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: THEME.colors.textSecondary },
  metaChipTextActive: { color: THEME.colors.primary },
  metaHint: { fontSize: 12, color: THEME.colors.textSecondary, marginTop: 14, textAlign: 'center', opacity: 0.7 },
});
