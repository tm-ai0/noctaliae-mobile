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

  return `Rêve du ${new Date().toLocaleDateString('fr-FR')}`;
}


// ============================================
// MAIN COMPONENT
// ============================================
export default function PostRecordingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { dreamId, audioUri, transcription, duration, source } = route.params;

  const { showAlert, AlertComponent } = useNoctaliaeAlert();

  const [editableTranscript, setEditableTranscript] = useState(transcription || '');

  const [isPremium, setIsPremium] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
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
    'Exploration de votre inconscient...',
    'Décodage des symboles oniriques...',
    'Cartographie des émotions nocturnes...',
    'Analyse des patterns neuronaux...',
    'Connexion aux réseaux de mémoire...',
    'Identification des résidus diurnes...',
    'Lecture des couches de sommeil...',
    'Synchronisation des ondes cérébrales...',
    'Décryptage du langage onirique...',
    'Exploration des métaphores visuelles...',
    'Activation du cortex préfrontal...',
    'Compilation des thèmes récurrents...',
    'Tissage des connexions émotionnelles...',
    'Calibration de l\'analyse scientifique...',
    'Votre rêve prend forme...',
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
          setSelectedEngine(remaining > 0 ? 'deep' : 'quick');
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

  const MIN_DURATION_SECONDS = 3;
  const MIN_TEXT_LENGTH = 10;

  async function handleAnalyze() {
    const isPhotoSource = source?.startsWith('photo-');

    if (source === 'write' || isPhotoSource) {
      if (!editableTranscript || editableTranscript.trim().length < MIN_TEXT_LENGTH) {
        showAlert({
          type: 'warning',
          title: isPhotoSource ? '📷 Contenu trop court' : '✏️ Texte trop court',
          message: `Votre rêve doit contenir au moins ${MIN_TEXT_LENGTH} caractères pour une analyse fiable.`,
          confirmText: 'Compris'
        });
        return;
      }
    } else {
      if (duration < MIN_DURATION_SECONDS) {
        showAlert({
          type: 'warning',
          title: '⏱️ Enregistrement trop court',
          message: `Votre enregistrement fait ${duration} seconde${duration > 1 ? 's' : ''}. Minimum requis : ${MIN_DURATION_SECONDS} secondes.\n\nAppuyez sur ← pour revenir et réenregistrer votre rêve, ou utilisez le mode écriture ✏️ depuis l'écran principal.`,
          confirmText: 'Compris'
        });
        return;
      }
    }

    if (!editableTranscript || editableTranscript.trim().length === 0) {
      showAlert({
        type: 'error',
        title: '❌ Aucun contenu',
        message: 'Impossible d\'analyser le rêve sans contenu.',
        confirmText: 'OK'
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const premium = await premiumService.isPremium();
      let useDeepDream;

      if (premium) {
        useDeepDream = true;
      } else if (selectedEngine === 'deep') {
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
      const result = await analyzeDreamFromText(editableTranscript, useDeepDream, metaPayload);

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
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network') || error.message?.includes('fetch')) {
        showAlert({
          type: 'error',
          title: 'Connexion impossible',
          message: 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
          confirmText: 'Réessayer',
          cancelText: 'Annuler',
          onConfirm: () => handleAnalyze(),
        });
      } else if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
        showAlert({
          type: 'warning',
          title: 'Délai dépassé',
          message: 'L\'analyse a pris trop de temps. Votre connexion est peut-être lente — réessayez.',
          confirmText: 'Réessayer',
          cancelText: 'Annuler',
          onConfirm: () => handleAnalyze(),
        });
      } else {
        showAlert({
          type: 'error',
          title: 'Analyse échouée',
          message: 'Le serveur n\'a pas pu traiter votre rêve. Réessayez dans quelques instants.',
          confirmText: 'Réessayer',
          cancelText: 'Annuler',
          onConfirm: () => handleAnalyze(),
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Tooltip contextuel selon la source
  const getTooltipText = () => {
    if (source === 'write') return "Relisez votre rêve avant l'analyse.";
    if (source?.startsWith('photo-')) return "Vérifiez la transcription de votre image.";
    return "La transcription peut contenir des erreurs. Modifiez si nécessaire.";
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
        <Text style={styles.headerTitle}>Analyse du rêve</Text>
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
            style={styles.transcriptInput}
            value={editableTranscript}
            onChangeText={setEditableTranscript}
            multiline
            textAlignVertical="top"
            placeholder="Décris ton rêve ici..."
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
                ? `🎯 Enrichir l'analyse \u00b7 ${[dreamMetadata.lucidity && 'lucidit\u00e9', dreamMetadata.sleepQuality && 'sommeil', dreamMetadata.emotions.length && `${dreamMetadata.emotions.length} \u00e9motion${dreamMetadata.emotions.length > 1 ? 's' : ''}`, dreamMetadata.themes.length && `${dreamMetadata.themes.length} th\u00e8me${dreamMetadata.themes.length > 1 ? 's' : ''}`].filter(Boolean).join(', ')}`
                : "\ud83c\udfaf Enrichir l'analyse \u00b7 optionnel"}
            </Text>
          </View>
          <MaterialIcons name={showMetadata ? 'expand-less' : 'expand-more'} size={20} color={THEME.colors.textSecondary} />
        </TouchableOpacity>

        {showMetadata && (
          <View style={styles.metaPanel}>
            {/* LUCIDITÉ */}
            <Text style={styles.metaLabel}>Niveau de lucidité</Text>
            <View style={styles.metaRating}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setDreamMetadata(p => ({ ...p, lucidity: p.lucidity === n ? null : n }))} style={[styles.metaDot, dreamMetadata.lucidity >= n && styles.metaDotActive]} activeOpacity={0.7}>
                  <Text style={[styles.metaDotText, dreamMetadata.lucidity >= n && styles.metaDotTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.metaRatingLabel}>
                {dreamMetadata.lucidity ? ['','Inconscient','Peu lucide','Partiel','Presque lucide','Lucide'][dreamMetadata.lucidity] : ''}
              </Text>
            </View>

            {/* QUALITÉ SOMMEIL */}
            <Text style={styles.metaLabel}>Qualité du sommeil</Text>
            <View style={styles.metaRating}>
              {[1,2,3,4,5].map(n => (
                <TouchableOpacity key={n} onPress={() => setDreamMetadata(p => ({ ...p, sleepQuality: p.sleepQuality === n ? null : n }))} style={[styles.metaDot, styles.metaDotSleep, dreamMetadata.sleepQuality >= n && styles.metaDotSleepActive]} activeOpacity={0.7}>
                  <Text style={[styles.metaDotText, dreamMetadata.sleepQuality >= n && styles.metaDotTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.metaRatingLabel}>
                {dreamMetadata.sleepQuality ? ['','Tr\u00e8s mauvaise','Mauvaise','Moyenne','Bonne','Excellente'][dreamMetadata.sleepQuality] : ''}
              </Text>
            </View>

            {/* ÉMOTIONS */}
            <Text style={styles.metaLabel}>Émotions ressenties</Text>
            <View style={styles.metaChips}>
              {EMOTIONS_LIST.map(e => (
                <TouchableOpacity key={e} onPress={() => toggleMeta('emotions', e)} style={[styles.metaChip, dreamMetadata.emotions.includes(e) && styles.metaChipActive]} activeOpacity={0.7}>
                  <Text style={[styles.metaChipText, dreamMetadata.emotions.includes(e) && styles.metaChipTextActive]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* THÈMES */}
            <Text style={styles.metaLabel}>Thèmes du rêve</Text>
            <View style={styles.metaChips}>
              {THEMES_LIST.map(t => (
                <TouchableOpacity key={t} onPress={() => toggleMeta('themes', t)} style={[styles.metaChip, dreamMetadata.themes.includes(t) && styles.metaChipActive]} activeOpacity={0.7}>
                  <Text style={[styles.metaChipText, dreamMetadata.themes.includes(t) && styles.metaChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.metaHint}>Ces informations enrichissent l'analyse mais ne sont jamais partagées.</Text>
          </View>
        )}

        {/* Sélecteur moteur */}
        {isPremium ? (
          <Text style={[styles.engineLine, { color: '#4F8DFF' }]}>✨ DeepDream</Text>
        ) : (
          <View style={styles.engineSelector}>
            <TouchableOpacity
              style={[styles.engineOption, selectedEngine === 'quick' && styles.engineOptionActive]}
              onPress={() => setSelectedEngine('quick')}
              activeOpacity={0.7}
            >
              <View style={[styles.engineRadio, selectedEngine === 'quick' && styles.engineRadioActive]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.engineOptionTitle, { color: selectedEngine === 'quick' ? '#00FFB0' : THEME.colors.textSecondary }]}>
                  ⚡ QuickDream
                </Text>
                <Text style={styles.engineOptionDesc}>Gratuit · illimité</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.engineOption, selectedEngine === 'deep' && styles.engineOptionActiveDeep]}
              onPress={() => {
                if (deepDreamRemaining !== null && deepDreamRemaining > 0) {
                  setSelectedEngine('deep');
                } else {
                  setShowActivateModal(true);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.engineRadio, selectedEngine === 'deep' && styles.engineRadioActiveDeep]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.engineOptionTitle, { color: selectedEngine === 'deep' ? '#4F8DFF' : THEME.colors.textSecondary }]}>
                  ✨ DeepDream
                </Text>
                <Text style={styles.engineOptionDesc}>
                  {deepDreamRemaining !== null && deepDreamRemaining > 0
                    ? `${deepDreamRemaining} analyse${deepDreamRemaining > 1 ? 's' : ''} offerte${deepDreamRemaining > 1 ? 's' : ''}`
                    : 'Débloquer →'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 🟢 BOUTON ANALYSER FLOTTANT */}
      <View style={[styles.floatingAnalyzeContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.floatingAnalyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
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
              <Text style={styles.floatingAnalyzeButtonText}>Analyser mon rêve</Text>
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
