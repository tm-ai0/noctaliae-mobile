import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Linking,
  Animated,
  Platform,
  Modal,
  TextInput
} from 'react-native';
import { useNoctaliaeAlert } from '../components/NoctaliaeAlert';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeDreamFromText, generateDreamImage } from '../services/apiService';
import { saveAnalysis, saveDreamImage, saveDreamMetadata } from '../services/storageService';
import { securityService } from '../services/securityService';
import { premiumService } from '../services/premiumService'; // 🆕 Import Premium
import { freeTierService } from '../services/freeTierService'; // 🎯 Free Tier
import * as FileSystem from 'expo-file-system/legacy';
import { THEME } from '../config/theme';
import DebugScreenLabel from '../components/DebugScreenLabel';
// SupportModal supprimé — fichier absent (feature Ko-fi abandonnée)

// 💾 Clé pour le tooltip de guidance (première utilisation)
const GUIDANCE_TOOLTIP_KEY = '@noctaliae_post_recording_guidance_shown';

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
// 🎨 COMPOSANT CARD RÉUTILISABLE
// ============================================
function EngineCard({ 
  icon, 
  iconColor, 
  title, 
  subtitle, 
  description, 
  badge,
  badgeIcon,
  badgeColor,
  accentColor,
  selected, 
  disabled, 
  onPress 
}) {
  const Wrapper = disabled ? View : TouchableOpacity;
  
  const glowStyle = selected && accentColor ? Platform.select({
    ios: {
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 15,
    },
    android: {
      elevation: 12,
      borderColor: accentColor,
      borderWidth: 2,
    }
  }) : {};
  
  return (
    <Wrapper 
      style={[
        styles.engineCard, 
        selected && styles.engineCardSelected,
        glowStyle,
        disabled && styles.engineCardDisabled
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {accentColor && (
        <View 
          style={[
            styles.engineAccentBar,
            { backgroundColor: accentColor },
            selected && { width: 6 }
          ]} 
        />
      )}
      <View style={styles.engineHeader}>
        <View style={styles.engineHeaderLeft}>
          <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
          <Text style={[styles.engineTitle, disabled && styles.engineTitleDisabled]}>
            {title}
          </Text>
        </View>
        {selected && (
          <MaterialIcons name="check-circle" size={20} color={THEME.colors.primary} />
        )}
      </View>
      
      <Text style={styles.engineSubtitle}>{subtitle}</Text>
      
      <Text style={[styles.engineDescription, disabled && styles.engineDescriptionDisabled]}>
        {description}
      </Text>
      
      {badge && (
        <View style={[styles.engineBadge, { backgroundColor: `${badgeColor}20` }]}>
          {badgeIcon && (
            <MaterialIcons name={badgeIcon} size={14} color={badgeColor} style={{ marginRight: 4 }} />
          )}
          <Text style={[styles.engineBadgeText, { color: badgeColor }]}>{badge}</Text>
        </View>
      )}
    </Wrapper>
  );
}

// ============================================
// 🆕 MODAL ACTIVER DEEPDREAM
// ============================================
function ActivateDeepDreamModal({ visible, onClose, onActivate }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons name="electron-framework" size={40} color="#4F8DFF" />
            <Text style={styles.modalTitle}>Activer DeepDream ?</Text>
          </View>
          
          <Text style={styles.modalDescription}>
            DeepDream Engine offre des analyses plus profondes et personnalisées grâce à un modèle premium.
          </Text>
          
          <View style={styles.modalFeatures}>
            <View style={styles.modalFeatureRow}>
              <MaterialIcons name="check" size={18} color="#4F8DFF" />
              <Text style={styles.modalFeatureText}>6 grilles d'analyse scientifiques</Text>
            </View>
            <View style={styles.modalFeatureRow}>
              <MaterialIcons name="check" size={18} color="#4F8DFF" />
              <Text style={styles.modalFeatureText}>Réponses détaillées et nuancées</Text>
            </View>
            <View style={styles.modalFeatureRow}>
              <MaterialIcons name="check" size={18} color="#4F8DFF" />
              <Text style={styles.modalFeatureText}>Personnalisation avec vos empreintes</Text>
            </View>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalButtonSecondary}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonSecondaryText}>Rester sur QuickDream</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButtonPrimary}
              onPress={onActivate}
              activeOpacity={0.8}
            >
              <MaterialIcons name="auto-awesome" size={18} color="#0c0e27" />
              <Text style={styles.modalButtonPrimaryText}>Activer DeepDream</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
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
  const [selectedModel, setSelectedModel] = useState('llama');
  const [activeTab, setActiveTab] = useState('choice');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showEngineInfoModal, setShowEngineInfoModal] = useState(false);
  const [supportModalMode, setSupportModalMode] = useState('deepdream_limit');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [deepDreamRemaining, setDeepDreamRemaining] = useState(null);

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
  
  const [showGuidanceTooltip, setShowGuidanceTooltip] = useState(false);
  const [tooltipAnim] = useState(new Animated.Value(0));
  
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
        setSelectedModel(premium ? 'claude' : 'llama');
        
        if (!premium) {
          const remaining = await freeTierService.getDeepDreamRemaining();
          setDeepDreamRemaining(remaining);
        }
      } catch (error) {
        console.error('❌ Erreur chargement Premium:', error);
        setSelectedModel('llama');
      }
    }
    loadPremiumAndSetModel();
  }, []);
  
  useEffect(() => {
    async function checkFirstUse() {
      try {
        const hasSeenGuidance = await AsyncStorage.getItem(GUIDANCE_TOOLTIP_KEY);
        if (!hasSeenGuidance) {
          setShowGuidanceTooltip(true);
          Animated.spring(tooltipAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          }).start();
        }
      } catch (error) {
        console.error('❌ Erreur check guidance:', error);
      }
    }
    checkFirstUse();
  }, []);
  
  async function dismissGuidanceTooltip() {
    try {
      Animated.timing(tooltipAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        setShowGuidanceTooltip(false);
      });
      await AsyncStorage.setItem(GUIDANCE_TOOLTIP_KEY, 'true');
    } catch (error) {
      console.error('❌ Erreur dismiss guidance:', error);
    }
  }

  function handleSelectModel(model) {
    if (model === 'claude' && !isPremium) {
      if (deepDreamRemaining !== null && deepDreamRemaining <= 0) {
        setShowSupportModal(true);
        return;
      }
      setShowActivateModal(true);
    } else {
      setSelectedModel(model);
    }
  }

  async function handleActivateDeepDream() {
    try {
      await premiumService.enablePremium();
      setIsPremium(true);
      setSelectedModel('claude');
      setShowActivateModal(false);
    } catch (error) {
      console.error('❌ Erreur activation DeepDream:', error);
      showAlert({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'activer DeepDream',
        confirmText: 'OK'
      });
    }
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
      if (selectedModel === 'claude' && !isPremium) {
        const allowance = await freeTierService.checkDeepDreamAllowance();
        if (!allowance.allowed) {
          setIsAnalyzing(false);
          setSupportModalMode('deepdream_limit');
          setShowSupportModal(true);
          return;
        }
      }

      if (selectedModel === 'llama' && !isPremium) {
        const qAllowance = await freeTierService.checkQuickDreamAllowance();
        if (!qAllowance.allowed) {
          setIsAnalyzing(false);
          setSupportModalMode('quickdream_limit');
          setShowSupportModal(true);
          return;
        }
      }

      const metaPayload = hasMetadata ? dreamMetadata : null;
      const result = await analyzeDreamFromText(editableTranscript, selectedModel === 'claude', metaPayload);
      
      if (metaPayload) saveDreamMetadata(dreamId, metaPayload);
      
      await saveAnalysis(dreamId, result, result.model || selectedModel);
      
      if (!isPremium) {
        if (selectedModel === 'claude') {
          await freeTierService.incrementDeepDreamCount();
          const remaining = await freeTierService.getDeepDreamRemaining();
          setDeepDreamRemaining(remaining);
        } else {
          await freeTierService.incrementQuickDreamCount();
        }
      }
      
      const extractedTitle = (result.title && result.title !== 'Rêve sans titre') 
        ? result.title 
        : extractDreamTitle(result.analysis, transcription);
      
      const dreamPalette = result.palette || ['#00FFB0', '#4F8DFF', '#D2B14C'];
      
      // 🔊 Cleanup audio en fire-and-forget (ne doit pas bloquer la navigation)
      securityService.deleteAudioIfNeeded(audioUri, FileSystem)
        .catch(err => console.warn('⚠️ Audio cleanup failed:', err));

      if (result.imagePrompt) {
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
        setSelectedModel('llama');
        setSupportModalMode('quickdream_limit');
        setShowSupportModal(true);
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

  function openKofi() {
    Linking.openURL('https://ko-fi.com/tm_ai0');
  }

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

      {/* 💡 TOOLTIP DE GUIDANCE - Première utilisation */}
      {showGuidanceTooltip && (
        <Animated.View 
          style={[
            styles.guidanceTooltip,
            {
              opacity: tooltipAnim,
              transform: [{
                translateY: tooltipAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.guidanceContent}>
            <View style={styles.guidanceIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={28} color={THEME.colors.primary} />
            </View>
            <View style={styles.guidanceTextContainer}>
              <Text style={styles.guidanceTitle}>✨ Enregistrement terminé !</Text>
              <Text style={styles.guidanceText}>
                Commencez par enrichir votre rêve avec un contexte (émotions, lucidité…), puis choisissez votre moteur d'analyse.
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.guidanceDismissButton}
            onPress={dismissGuidanceTooltip}
            activeOpacity={0.8}
          >
            <Text style={styles.guidanceDismissText}>Compris</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'choice' && styles.tabActive]}
            onPress={() => setActiveTab('choice')}
          >
            <Text style={[styles.tabText, activeTab === 'choice' && styles.tabTextActive]}>
              Analyse
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'transcript' && styles.tabActive]}
            onPress={() => setActiveTab('transcript')}
          >
            <Text style={[styles.tabText, activeTab === 'transcript' && styles.tabTextActive]}>
              Transcript
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SupportModal supprimé — feature Ko-fi abandonnée */}

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'choice' ? (
          <>
            {/* INFO BAR */}
            <View style={styles.infoBar}>
              <View style={styles.infoItem}>
                <MaterialIcons name="timer" size={18} color={THEME.colors.textSecondary} />
                <Text style={styles.infoText}>
                  Durée : {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <TouchableOpacity 
                style={[styles.infoItem, { flex: 1 }]}
                onPress={() => setActiveTab('transcript')}
              >
                <Text style={styles.infoTextHint} numberOfLines={1} ellipsizeMode="tail">
                  Vérifier · modifier →
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 0, flex: 1 }]}>Préparez votre analyse</Text>
              <TouchableOpacity onPress={() => setShowEngineInfoModal(true)} activeOpacity={0.7} style={{ padding: 4 }}>
                <MaterialIcons name="info-outline" size={18} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
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
                    ? `🎯 Enrichir l'analyse · ${[dreamMetadata.lucidity && 'lucidité', dreamMetadata.sleepQuality && 'sommeil', dreamMetadata.emotions.length && `${dreamMetadata.emotions.length} émotion${dreamMetadata.emotions.length > 1 ? 's' : ''}`, dreamMetadata.themes.length && `${dreamMetadata.themes.length} thème${dreamMetadata.themes.length > 1 ? 's' : ''}`].filter(Boolean).join(', ')}`
                    : "🎯 Enrichir l'analyse · optionnel"}
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
                    {dreamMetadata.sleepQuality ? ['','Très mauvaise','Mauvaise','Moyenne','Bonne','Excellente'][dreamMetadata.sleepQuality] : ''}
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

            {/* QUICKDREAM */}
            <EngineCard
              icon="flash"
              iconColor="#00FFB0"
              accentColor="#00FFB0"
              title="QuickDream"
              subtitle="Gratuit et illimité"
              description="Analyses rapides et efficaces pour explorer vos rêves au quotidien."
              selected={selectedModel === 'llama'}
              onPress={() => handleSelectModel('llama')}
            />

            {/* DEEPDREAM */}
            <EngineCard
              icon="electron-framework"
              iconColor="#4F8DFF"
              accentColor="#4F8DFF"
              title="DeepDream Engine"
              subtitle={isPremium
                ? "6 grilles · Personnalisé · Soutient le projet"
                : deepDreamRemaining !== null && deepDreamRemaining <= 0
                  ? "Limite atteinte — Soutenez-nous !"
                  : deepDreamRemaining !== null && deepDreamRemaining <= 2
                    ? deepDreamRemaining === 1
                      ? "Dernière analyse gratuite ✨"
                      : `Plus que ${deepDreamRemaining} analyses gratuites`
                    : "6 grilles · Neurosciences · Approfondi"
              }
              description="Analyse neuroscientifique approfondie avec 6 grilles (Hobson, Domhoff...). Réponses détaillées et personnalisées."
              badge={isPremium
                ? "Activé"
                : deepDreamRemaining !== null && deepDreamRemaining <= 0
                  ? "Limité"
                  : deepDreamRemaining !== null && deepDreamRemaining <= 2
                    ? `${deepDreamRemaining} restant${deepDreamRemaining > 1 ? 's' : ''}`
                    : "Recommandé"
              }
              badgeIcon={isPremium ? "check-circle" : deepDreamRemaining !== null && deepDreamRemaining <= 0 ? "lock" : deepDreamRemaining !== null && deepDreamRemaining <= 2 ? "hourglass-empty" : "star"}
              badgeColor={isPremium ? "#00FFB0" : deepDreamRemaining !== null && deepDreamRemaining <= 0 ? "#EF4444" : deepDreamRemaining !== null && deepDreamRemaining <= 2 ? "#F59E0B" : "#4F8DFF"}
              selected={selectedModel === 'claude'}
              onPress={() => handleSelectModel('claude')}
            />

            {/* OPUS NOCTIS */}
            <EngineCard
              icon="star-four-points"
              iconColor="#D2B14C"
              title="Opus Noctis"
              subtitle="L'œuvre de la nuit"
              description="DeepDream amplifié : raisonnement étendu, mémoire profonde, synthèse nuancée. Interprétation fine et contextuelle."
              badge="Prochainement"
              badgeIcon="schedule"
              badgeColor="#D2B14C"
              disabled
            />

            {/* KO-FI CARD */}
            <TouchableOpacity 
              style={styles.kofiCard}
              onPress={openKofi}
              activeOpacity={0.8}
            >
              <View style={styles.kofiContent}>
                <Text style={styles.kofiEmoji}>☕</Text>
                <View>
                  <Text style={styles.kofiTitle}>Soutenir Noctaliæ</Text>
                  <Text style={styles.kofiSubtitle}>Aidez-nous à développer de nouvelles fonctionnalités</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </>
        ) : (
          // TAB TRANSCRIPT
          <View style={styles.transcriptContainer}>
            <View style={styles.transcriptHeader}>
              <MaterialIcons name="edit-note" size={24} color={THEME.colors.primary} />
              <Text style={styles.transcriptTitle}>
                {source === 'write' ? 'Ton rêve' : 'Transcription'}
              </Text>
            </View>
            
            <View style={styles.transcriptTooltip}>
              <MaterialIcons name="lightbulb-outline" size={16} color={THEME.colors.primary} />
              <Text style={styles.transcriptTooltipText}>
                {source === 'write' 
                  ? "Raconte ton rêve naturellement. Tu peux modifier ce texte avant l'analyse."
                  : "La transcription peut contenir des erreurs — modifie le texte si nécessaire."
                }
              </Text>
            </View>
            
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
            
            <View style={styles.feedbackContainer}>
              <TouchableOpacity 
                style={[
                  styles.feedbackButtonPositive,
                  !editableTranscript.trim() && styles.feedbackButtonDisabled
                ]}
                onPress={() => setActiveTab('choice')}
                activeOpacity={0.8}
                disabled={!editableTranscript.trim()}
              >
                <MaterialIcons name="check" size={18} color="#0c0e27" />
                <Text style={styles.feedbackButtonPositiveText}>Valider et choisir l'analyse</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 🟢 BOUTON ANALYSER FLOTTANT */}
      {activeTab === 'choice' && (
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
                <Text style={styles.floatingAnalyzeButtonText}>Analyser le rêve</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ℹ️ Modal info moteurs */}
      <Modal
        visible={showEngineInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEngineInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="info-outline" size={36} color={THEME.colors.primary} />
              <Text style={styles.modalTitle}>Choisir son moteur</Text>
            </View>
            <Text style={styles.modalDescription}>Chaque moteur offre un niveau d'analyse différent selon vos besoins.</Text>
            <View style={styles.modalFeatures}>
              <View style={styles.modalFeatureRow}>
                <MaterialCommunityIcons name="flash" size={18} color="#00FFB0" />
                <Text style={styles.modalFeatureText}><Text style={{ color: '#00FFB0', fontFamily: 'AtkinsonHyperlegibleNext-Bold' }}>QuickDream</Text> — Gratuit, illimité. Rapide et efficace pour explorer ses rêves au quotidien.</Text>
              </View>
              <View style={styles.modalFeatureRow}>
                <MaterialCommunityIcons name="electron-framework" size={18} color="#4F8DFF" />
                <Text style={styles.modalFeatureText}><Text style={{ color: '#4F8DFF', fontFamily: 'AtkinsonHyperlegibleNext-Bold' }}>DeepDream</Text> — 5 analyses gratuites. Approche neuroscientifique avec 6 grilles d'analyse (Hobson, Domhoff…).</Text>
              </View>
              <View style={styles.modalFeatureRow}>
                <MaterialCommunityIcons name="star-four-points" size={18} color="#D2B14C" />
                <Text style={styles.modalFeatureText}><Text style={{ color: '#D2B14C', fontFamily: 'AtkinsonHyperlegibleNext-Bold' }}>Opus Noctis</Text> — Prochainement. DeepDream amplifié avec raisonnement étendu.</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.modalButtonPrimary, { backgroundColor: THEME.colors.primary }]}
              onPress={() => setShowEngineInfoModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonPrimaryText}>Compris</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ActivateDeepDreamModal
        visible={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onActivate={handleActivateDeepDream}
      />

      {/* SupportModal gère tous les cas via le prop mode */}
      
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
  tabsWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: THEME.colors.background,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
  },
  tabTextActive: {
    color: THEME.colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 160,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBackground,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: THEME.colors.text,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  infoTextHint: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontFamily: 'AtkinsonHyperlegibleNext-Medium',
  },
  infoDivider: {
    width: 1,
    height: 16,
    backgroundColor: THEME.colors.cardBorder,
    marginHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
    marginBottom: 16,
  },
  engineCard: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    paddingLeft: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  engineCardSelected: {
    borderColor: THEME.colors.primary,
    borderWidth: 2,
  },
  engineCardDisabled: {
    opacity: 0.5,
  },
  engineAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  engineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  engineHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  engineTitle: {
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
  },
  engineTitleDisabled: {
    color: THEME.colors.textSecondary,
  },
  engineSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    marginLeft: 34,
  },
  engineDescription: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginLeft: 34,
  },
  engineDescriptionDisabled: {
    opacity: 0.7,
  },
  engineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 34,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  engineBadgeText: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  analyzeButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
    gap: 10,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  analyzeButtonDisabled: {
    backgroundColor: THEME.colors.textSecondary,
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#0c0e27',
  },
  // 🌙 MÉTADONNÉES
  metaToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginTop: 0,
    marginBottom: 20,
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
    marginBottom: 4,
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
  reactivateButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  reactivateButtonText: {
    fontSize: 13,
    color: 'rgba(210, 177, 76, 0.7)',
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    textDecorationLine: 'underline',
  },
  kofiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#39FF8830',
  },
  kofiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  kofiEmoji: {
    fontSize: 24,
  },
  kofiTitle: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#39FF88',
    marginBottom: 2,
  },
  kofiSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  transcriptContainer: {
    flex: 1,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  transcriptTitle: {
    fontSize: 22,
    fontFamily: 'CormorantUpright-Bold',
    color: THEME.colors.text,
  },
  transcriptBox: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    minHeight: 280,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  transcriptInput: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 26,
    minHeight: 250,
    textAlignVertical: 'top',
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
  feedbackContainer: {
    marginTop: 8,
  },
  feedbackLabel: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButtonPositive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  feedbackButtonPositiveText: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#0c0e27',
  },
  feedbackButtonDisabled: {
    opacity: 0.5,
  },
  feedbackButtonNegative: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.warmGold,
    gap: 6,
  },
  feedbackButtonNegativeText: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.warmGold,
  },
  guidanceTooltip: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.primary + '40',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  guidanceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  guidanceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidanceTextContainer: {
    flex: 1,
  },
  guidanceTitle: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  guidanceText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
  },
  guidanceDismissButton: {
    backgroundColor: THEME.colors.primary + '15',
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
  },
  guidanceDismissText: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.primary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#4F8DFF30',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 26,
    fontFamily: 'CormorantUpright-Bold',
    color: THEME.colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 15,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalFeatures: {
    backgroundColor: 'rgba(79, 141, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  modalFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  modalFeatureText: {
    fontSize: 14,
    color: THEME.colors.text,
  },
  modalButtons: {
    gap: 12,
  },
  modalButtonSecondary: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
  },
  modalButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4F8DFF',
    gap: 8,
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#0c0e27',
  },
});
