import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Animated,
  Platform,
  Modal
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeDreamFromText } from '../services/apiService';
import { saveAnalysis } from '../services/storageService';
import { securityService } from '../services/securityService';
import { premiumService } from '../services/premiumService'; // 🆕 Import Premium
import * as FileSystem from 'expo-file-system/legacy';
import { THEME } from '../config/theme';
import DebugScreenLabel from '../components/DebugScreenLabel';
import RateLimitBanner from '../components/RateLimitBanner';
import RateLimitModal from '../modals/RateLimitModal';

// 💾 Clé pour le tooltip de guidance (première utilisation)
const GUIDANCE_TOOLTIP_KEY = '@noctaliae_post_recording_guidance_shown';

// 🏷️ Fonction pour extraire un titre intelligent depuis l'analyse
function extractDreamTitle(analysis, transcription) {
  // 1️⃣ Chercher "## 🌙 Titre" ou "# 🌙 Titre" ou juste "🌙 Titre" en début
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
  
  // 2️⃣ Chercher "Analyse de votre rêve" suivi d'un titre
  const analyseMatch = analysis.match(/Analyse de votre rêve[:\s]*["\u201c]?([^"\u201d\n]+)["\u201d]?/i);
  if (analyseMatch && analyseMatch[1].trim().length > 5) {
    return analyseMatch[1].trim();
  }
  
  // 3️⃣ Première phrase pertinente de l'analyse (sans emojis/markdown)
  const cleanAnalysis = analysis
    .replace(/^[#*\s]+/gm, '') // Retire # et * en début de ligne
    .replace(/[🌙📌📊🔗😊🧠💡✨🌟💫🌌😴🌃⚡💤🌈]/g, '')
    .trim();
  
  const sentences = cleanAnalysis.split(/[.!?\n]+/);
  for (const sentence of sentences) {
    const cleaned = sentence.trim();
    if (cleaned.length > 15 && cleaned.length < 70 && !cleaned.toLowerCase().includes('analyse')) {
      return cleaned;
    }
  }
  
  // 4️⃣ Première phrase de la transcription
  const firstTranscript = transcription.split(/[.!?]/)[0].trim();
  if (firstTranscript.length > 10 && firstTranscript.length < 60) {
    return firstTranscript;
  }
  
  // 5️⃣ Fallback : date du jour
  return `Rêve du ${new Date().toLocaleDateString('fr-FR')}`;
}

// ============================================
// 🎨 COMPOSANT CARD RÉUTILISABLE - Top 0.1% approach
// ============================================
function EngineCard({ 
  icon, 
  iconColor, 
  title, 
  subtitle, 
  description, 
  badge,
  badgeColor,
  selected, 
  disabled, 
  onPress 
}) {
  const Wrapper = disabled ? View : TouchableOpacity;
  
  return (
    <Wrapper 
      style={[
        styles.engineCard, 
        selected && styles.engineCardSelected,
        disabled && styles.engineCardDisabled
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* === HEADER ROW : Icon + Title + Check === */}
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
      
      {/* === SUBTITLE === */}
      <Text style={styles.engineSubtitle}>{subtitle}</Text>
      
      {/* === DESCRIPTION === */}
      <Text style={[styles.engineDescription, disabled && styles.engineDescriptionDisabled]}>
        {description}
      </Text>
      
      {/* === FOOTER : Badge (si présent) === */}
      {badge && (
        <View style={[styles.engineBadge, { backgroundColor: `${badgeColor}20` }]}>
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
          {/* Header */}
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons name="electron-framework" size={40} color="#4F8DFF" />
            <Text style={styles.modalTitle}>Activer DeepDream ?</Text>
          </View>
          
          {/* Body */}
          <Text style={styles.modalDescription}>
            DeepDream Engine utilise Claude Sonnet 4.5 pour des analyses plus profondes et personnalisées.
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
          
          {/* Buttons */}
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
  const { dreamId, audioUri, transcription, duration } = route.params;
  
  // 🆕 État premium chargé depuis le service
  const [isPremium, setIsPremium] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama'); // Default, sera mis à jour
  const [activeTab, setActiveTab] = useState('choice');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false); // 🆕 Modal activation
  
  // 💡 Tooltip de guidance (première utilisation)
  const [showGuidanceTooltip, setShowGuidanceTooltip] = useState(false);
  const [tooltipAnim] = useState(new Animated.Value(0));
  
  // 🆕 Charger le statut Premium au mount et présélectionner le modèle
  useEffect(() => {
    async function loadPremiumAndSetModel() {
      try {
        const premium = await premiumService.isPremium();
        setIsPremium(premium);
        // Présélectionner le modèle selon le statut Premium
        setSelectedModel(premium ? 'claude' : 'llama');
        console.log(`💎 Premium: ${premium} → Modèle présélectionné: ${premium ? 'Claude' : 'Llama'}`);
      } catch (error) {
        console.error('❌ Erreur chargement Premium:', error);
        setSelectedModel('llama'); // Fallback sécurisé
      }
    }
    loadPremiumAndSetModel();
  }, []);
  
  // 💡 Vérifier si c'est la première utilisation au mount
  useEffect(() => {
    async function checkFirstUse() {
      try {
        const hasSeenGuidance = await AsyncStorage.getItem(GUIDANCE_TOOLTIP_KEY);
        if (!hasSeenGuidance) {
          // Première fois → afficher le tooltip avec animation
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
  
  // 💡 Handler pour fermer le tooltip
  async function dismissGuidanceTooltip() {
    try {
      // Animation de sortie
      Animated.timing(tooltipAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        setShowGuidanceTooltip(false);
      });
      // Sauvegarder pour ne plus afficher
      await AsyncStorage.setItem(GUIDANCE_TOOLTIP_KEY, 'true');
    } catch (error) {
      console.error('❌ Erreur dismiss guidance:', error);
    }
  }

  // 🆕 Handler pour sélection du modèle avec vérification Premium
  function handleSelectModel(model) {
    if (model === 'claude' && !isPremium) {
      // User veut Claude mais n'a pas DeepDream activé → afficher modal
      setShowActivateModal(true);
    } else {
      setSelectedModel(model);
    }
  }

  // 🆕 Handler pour activer DeepDream depuis le modal
  async function handleActivateDeepDream() {
    try {
      await premiumService.enablePremium();
      setIsPremium(true);
      setSelectedModel('claude');
      setShowActivateModal(false);
      console.log('🌕 DeepDream activé depuis PostRecordingScreen');
    } catch (error) {
      console.error('❌ Erreur activation DeepDream:', error);
      Alert.alert('Erreur', 'Impossible d\'activer DeepDream', [{ text: 'OK' }], { userInterfaceStyle: 'dark' });
    }
  }

  async function handleAnalyze() {
    if (!transcription || transcription.trim().length === 0) {
      Alert.alert('❌ Erreur', 'Impossible d\'analyser le rêve sans transcription.', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log(`🧠 Analyse avec ${selectedModel === 'claude' ? 'DeepDream (Claude)' : 'QuickDream (Llama)'}...`);
      
      const result = await analyzeDreamFromText(transcription, selectedModel === 'claude');
      
      if (result.limitInfo) {
        setLimitInfo(result.limitInfo);
        if (result.limitInfo.limited && selectedModel === 'claude') {
          setShowRateLimitModal(true);
          setSelectedModel('llama');
          return;
        }
      }
      
      await saveAnalysis(dreamId, result, result.model || selectedModel);
      
      // 🏷️ Titre dynamique : priorité au backend, sinon extraction intelligente
      const extractedTitle = (result.title && result.title !== 'Rêve sans titre') 
        ? result.title 
        : extractDreamTitle(result.analysis, transcription);
      
      navigation.navigate('Conversation', {
        dreamId: dreamId,
        dreamAnalysis: result.analysis,
        dreamTranscription: transcription,
        dreamTitle: extractedTitle,
        dreamDate: new Date().toISOString()
      });

      await securityService.deleteAudioIfNeeded(audioUri, FileSystem);
    } catch (error) {
      console.error('❌ Erreur analyse:', error);
      Alert.alert('❌ Erreur', 'Une erreur est survenue lors de l\'analyse.', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
    } finally {
      setIsAnalyzing(false);
    }
  }

  function openKofi() {
    Linking.openURL('https://ko-fi.com/tm_ai0');
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DebugScreenLabel screenName="📝 Post-Enregistrement" />
      
      {/* Header */}
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
                Choisissez maintenant un moteur d'analyse pour explorer votre rêve.
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

      {/* Banner Rate Limiting */}
      {limitInfo && limitInfo.limited && (
        <RateLimitBanner 
          limitInfo={limitInfo} 
          onDismiss={() => setLimitInfo(null)}
        />
      )}

      {/* 🔝 BOUTON ANALYSER STICKY EN HAUT */}
      {activeTab === 'choice' && (
        <View style={styles.stickyAnalyzeContainer}>
          <TouchableOpacity 
            style={[styles.stickyAnalyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
            activeOpacity={0.8}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#0c0e27" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="brain" size={22} color="#0c0e27" />
                <Text style={styles.stickyAnalyzeButtonText}>Analyser le rêve</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
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
                  Vérifier le transcript →
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Choisissez le moteur d'analyse</Text>

            {/* ============================================ */}
            {/* QUICKDREAM - Gratuit */}
            {/* ============================================ */}
            <EngineCard
              icon="flash"
              iconColor="#00FFB0"
              title="QuickDream"
              subtitle="Llama 3.3 70B • Gratuit et illimité"
              description="Analyses rapides et efficaces pour explorer vos rêves au quotidien."
              selected={selectedModel === 'llama'}
              onPress={() => handleSelectModel('llama')}
            />

            {/* ============================================ */}
            {/* DEEPDREAM - Premium */}
            {/* ============================================ */}
            <EngineCard
              icon="electron-framework"
              iconColor="#4F8DFF"
              title="DeepDream Engine"
              subtitle="Claude Sonnet 4.5 • Qualité d'analyses optimales"
              description="Analyse neuroscientifique approfondie avec 6 grilles (Hobson, Domhoff...). Réponses détaillées et personnalisées."
              badge={isPremium ? "✅ Activé" : "⭐ Recommandé"}
              badgeColor={isPremium ? "#00FFB0" : "#4F8DFF"}
              selected={selectedModel === 'claude'}
              onPress={() => handleSelectModel('claude')}
            />

            {/* ============================================ */}
            {/* OPUS NOCTIS - Coming Soon */}
            {/* ============================================ */}
            <EngineCard
              icon="star-four-points"
              iconColor="#D2B14C"
              title="Opus Noctis"
              subtitle="Claude Opus 4.5 • L'œuvre de la nuit"
              description="DeepDream amplifié : raisonnement étendu, mémoire profonde, synthèse nuancée. Interprétation fine et contextuelle."
              badge="🌙 Prochainement"
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
              <MaterialIcons name="text-fields" size={24} color={THEME.colors.primary} />
              <Text style={styles.transcriptTitle}>Transcription complète</Text>
            </View>
            
            <View style={styles.transcriptBox}>
              <ScrollView>
                <Text style={styles.transcriptText}>{transcription}</Text>
              </ScrollView>
            </View>
            
            {/* 🎯 CTA FEEDBACK */}
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>La transcription est-elle correcte ?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity 
                  style={styles.feedbackButtonPositive}
                  onPress={() => setActiveTab('choice')}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="check" size={18} color="#0c0e27" />
                  <Text style={styles.feedbackButtonPositiveText}>C'est bon</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.feedbackButtonNegative}
                  onPress={() => {
                    Alert.alert(
                      '✏️ Signaler une erreur',
                      'La transcription vocale peut parfois faire des erreurs. Souhaitez-vous continuer avec cette version ou réenregistrer ?',
                      [
                        { text: 'Réenregistrer', onPress: () => navigation.goBack(), style: 'destructive' },
                        { text: 'Continuer quand même', onPress: () => setActiveTab('choice') },
                      ],
                      { userInterfaceStyle: 'dark' }
                    );
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="edit" size={18} color={THEME.colors.warmGold} />
                  <Text style={styles.feedbackButtonNegativeText}>Problème</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal Rate Limit */}
      <RateLimitModal
        visible={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        minutesLeft={limitInfo?.resetIn || 60}
      />

      {/* 🆕 Modal Activer DeepDream */}
      <ActivateDeepDreamModal
        visible={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onActivate={handleActivateDeepDream}
      />
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
    fontWeight: '600',
    color: THEME.colors.text,
  },
  
  // Tabs
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
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  tabTextActive: {
    color: THEME.colors.text,
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 160, // 🔧 FIX: Espace suffisant pour nav Android (augmenté)
  },
  
  // Info Bar
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
    fontWeight: '600',
  },
  infoTextHint: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: '500',
  },
  infoDivider: {
    width: 1,
    height: 16,
    backgroundColor: THEME.colors.cardBorder,
    marginHorizontal: 12,
  },
  
  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: 16,
  },
  
  // ============================================
  // ENGINE CARDS - Pure Flexbox, no absolute
  // ============================================
  engineCard: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  engineCardSelected: {
    borderColor: THEME.colors.primary,
  },
  engineCardDisabled: {
    opacity: 0.5,
  },
  
  // Header Row : Icon + Title + Check
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
    fontWeight: '700',
    color: THEME.colors.text,
  },
  engineTitleDisabled: {
    color: THEME.colors.textSecondary,
  },
  
  // Subtitle & Description - Alignés avec padding-left = icon width + gap
  engineSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
    marginLeft: 34, // 24 (icon) + 10 (gap)
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
  
  // Badge - Dans le flux, pas en absolute
  engineBadge: {
    alignSelf: 'flex-start',
    marginLeft: 34,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  engineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  
  // Analyze Button
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
    fontWeight: '700',
    color: '#0c0e27',
  },
  
  // Ko-fi Card
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
    fontWeight: '600',
    color: '#39FF88',
    marginBottom: 2,
  },
  kofiSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  
  // Transcript Tab
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
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  transcriptBox: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    minHeight: 300,
    marginBottom: 20,
  },
  transcriptText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 26,
  },
  // 🎯 CTA Feedback
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
    fontSize: 14,
    fontWeight: '600',
    color: '#0c0e27',
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
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.warmGold,
  },
  
  // 💡 TOOLTIP DE GUIDANCE
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
    fontWeight: '700',
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
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  
  // 🔝 STICKY ANALYZE BUTTON
  stickyAnalyzeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  stickyAnalyzeButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stickyAnalyzeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0c0e27',
  },
  
  // ============================================
  // 🆕 MODAL ACTIVER DEEPDREAM
  // ============================================
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
    fontSize: 22,
    fontWeight: '700',
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
    fontSize: 15,
    fontWeight: '600',
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
    fontWeight: '700',
    color: '#0c0e27',
  },
});
