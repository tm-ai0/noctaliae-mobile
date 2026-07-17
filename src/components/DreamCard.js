import React, { useRef, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, ScrollView, Share, Modal, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../config/ThemeContext';
import BiometricService from '../services/biometricService';
import DreamFallbackHero from './DreamFallbackHero';
import { useDreamShare } from '../hooks/useDreamShare';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';


/**
 * DreamCard - Carte de rêve avec swipe actions Gmail style
 * 
 * SWIPE ACTIONS:
 * - Swipe GAUCHE → 📦 Archiver (warmGold)
 * - Swipe DROITE → 📤 Partager (orange)
 * 
 * @param {Object} dream - Objet rêve complet
 * @param {Function} onPress - Action au tap
 * @param {Function} onArchive - Callback archivage
 * @param {Function} onShare - Callback partage (optionnel, fallback interne)
 */
export default function DreamCard({ dream, onPress, onArchive, onShare, onSecretToggle, isSelectionMode, isSelected, onSelectionToggle, showMenuHint, onMenuHintDismiss, onFirstArchive, onFavoriteToggle, onPinToggle }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const swipeableRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // ── Partage Friendly avec branding — hook centralisé ─────────────────────
  const { ShareOverlay, handleShareFriendly } = useDreamShare(dream);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  React.useEffect(() => {
    if (showMenuHint) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [showMenuHint]);
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  // ============================================
  // SWIPE ACTIONS - Gmail Style
  // ============================================
  
  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({ inputRange: [-100, 0], outputRange: [1, 0.5], extrapolate: 'clamp' });
    return (
      <Animated.View style={[styles.swipeAction, styles.archiveAction, { backgroundColor: '#FF9966' }, { transform: [{ scale }] }]}>
        <MaterialIcons name="archive" size={28} color="#FFFFFF" />
        <Text style={styles.swipeActionText}>{t('dreamCard.swipeArchive')}</Text>
      </Animated.View>
    );
  };
  
  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({ inputRange: [0, 100], outputRange: [0.5, 1], extrapolate: 'clamp' });
    return (
      <Animated.View style={[styles.swipeAction, styles.shareAction, { backgroundColor: '#00FFB0' }, { transform: [{ scale }] }]}>
        <MaterialIcons name="share" size={28} color="#0c0e27" />
        <Text style={[styles.swipeActionText, { color: '#0c0e27' }]}>{t('dreamCard.swipeShare')}</Text>
      </Animated.View>
    );
  };

  const handleSwipeOpen = async (direction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (direction === 'right') {
      if (onFirstArchive) {
        const isFirst = await onFirstArchive();
        if (isFirst) { setShowArchiveModal(true); swipeableRef.current?.close(); return; }
      }
      if (onArchive) onArchive(dream.id);
    } else if (direction === 'left') {
      if (dream.isSecret && !isUnlocked) return;
      setShowShareModal(true);
      swipeableRef.current?.close();
    }
  };

  const handleConfirmArchive = () => {
    setShowArchiveModal(false);
    if (onArchive) onArchive(dream.id, true);
  };

  // ============================================
  // 🔐 GESTION DES SECRETS
  // ============================================
  const handleLongPress = () => {
    if (dream.isSecret && !isUnlocked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowSecretModal(true);
  };

  const handleToggleSecret = () => {
    if (onSecretToggle) onSecretToggle(dream.id, !dream.isSecret);
    setShowSecretModal(false);
    setIsUnlocked(false);
  };

  const handleCardPress = async () => {
    if (dream.isSecret && !isUnlocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const authenticated = await BiometricService.authenticateForSecrets();
      if (authenticated) setIsUnlocked(true);
      return;
    }
    onPress();
  };

  // handleShareFriendly → fourni par useDreamShare hook

  // ── Partage interne (rétro-compat) ─────────────────────────────
  const handleShare = async () => {
    if (onShare) { onShare(dream); return; }
    handleShareFriendly();
  };

  // ============================================
  // FORMAT PRO POUR PARTAGE (psy, proches, etc.)
  // ============================================
  const getProShareContent = () => {
    const date = new Date(dream.date);
    const formattedDate = date.toLocaleDateString(i18next.language, { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    let analysisType = 'Non analysé';
    if (dream.modelUsed) {
      if (dream.modelUsed.toLowerCase().includes('claude')) analysisType = 'DeepDream';
      else if (dream.modelUsed.toLowerCase().includes('llama')) analysisType = 'QuickDream';
      else analysisType = dream.modelUsed;
    }
    const transcription = dream.transcription?.trim() || 'Récit non disponible';
    let analysisText = 'Analyse non disponible';
    if (dream.analysis) {
      if (typeof dream.analysis === 'string') analysisText = dream.analysis.trim();
      else if (dream.analysis.fullAnalysis) analysisText = dream.analysis.fullAnalysis.trim();
      else if (dream.analysis.shortSummary) analysisText = dream.analysis.shortSummary.trim();
    }
    let tagsSection = '';
    if (dream.tags && Array.isArray(dream.tags) && dream.tags.length > 0) {
      const tagsList = dream.tags
        .map(rawTag => { const cleaned = String(rawTag).replace(/[\[\]]/g, '').trim(); return cleaned ? `• ${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}` : null; })
        .filter(Boolean).join('\n');
      if (tagsList) tagsSection = `\n🏷️ THÈMES DÉTECTÉS\n─────────────────\n${tagsList}\n`;
    }
    return `🌙 NOCTALIÆ - RAPPORT DE RÊVE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📅 ${formattedDate}\n🎯 Analyse: ${analysisType}\n\n📝 RÉCIT DU RÊVE\n────────────────\n${transcription}\n\n🧠 ANALYSE SCIENTIFIQUE\n───────────────────────\n${analysisText}\n${tagsSection}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAnalysé avec Noctaliæ`;
  };

  // ============================================
  // EXPORT PDF PRO
  // ============================================
  const generatePdfHtml = () => {
    const date = new Date(dream.date);
    const formattedDate = date.toLocaleDateString(i18next.language, { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    let analysisType = 'Non analysé';
    let analysisColor = '#64748B';
    if (dream.modelUsed) {
      if (dream.modelUsed.toLowerCase().includes('claude')) { analysisType = 'DeepDream'; analysisColor = '#8A2BE2'; }
      else if (dream.modelUsed.toLowerCase().includes('llama')) { analysisType = 'QuickDream'; analysisColor = '#10B981'; }
    }
    const transcription = dream.transcription?.trim() || 'Récit non disponible';
    let analysisText = 'Analyse non disponible';
    if (dream.analysis) {
      if (typeof dream.analysis === 'string') analysisText = dream.analysis.trim();
      else if (dream.analysis.fullAnalysis) analysisText = dream.analysis.fullAnalysis.trim();
    }
    analysisText = analysisText
      .replace(/### (.*)/g, '<h4>$1</h4>').replace(/## (.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/---/g, '<hr/>').replace(/\n/g, '<br/>');
    let tagsHtml = '';
    if (dream.tags && Array.isArray(dream.tags) && dream.tags.length > 0) {
      const cleanedTags = dream.tags.map(tag => String(tag).replace(/[\[\]]/g, '').trim()).filter(Boolean);
      if (cleanedTags.length > 0) {
        tagsHtml = `<div class="section"><h2>🏷️ Thèmes détectés</h2><div class="tags">${cleanedTags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div></div>`;
      }
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapport de rêve - Noctaliæ</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0c0e27;color:#FFF;padding:40px;line-height:1.6}.container{max-width:800px;margin:0 auto;background:#0f1130;border-radius:20px;padding:40px;border:1px solid #1a1f3a}.header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #D2B14C}.logo{font-size:32px;font-weight:700;color:#D2B14C;margin-bottom:10px}.subtitle{color:#A0B4D4;font-size:14px}.meta{display:flex;justify-content:space-between;margin-bottom:30px;padding:15px;background:#1a1f3a;border-radius:12px}.meta-label{color:#A0B4D4;font-size:12px}.meta-value{color:#FFF;font-weight:600}.analysis-badge{background:${analysisColor};color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}.section{margin-bottom:30px}.section h2{color:#D2B14C;font-size:18px;margin-bottom:15px}.section-content{background:#1a1f3a;padding:20px;border-radius:12px;color:#E0E0E0}.tags{display:flex;flex-wrap:wrap;gap:10px}.tag{background:#D2B14C20;color:#D2B14C;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600}.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #1a1f3a;color:#A0B4D4;font-size:12px}</style></head><body><div class="container"><div class="header"><div class="logo">🌙 Noctaliæ</div><div class="subtitle">Rapport de rêve</div></div><div class="meta"><div><span class="meta-label">📅 Date</span> <span class="meta-value">${formattedDate}</span></div><div><span class="analysis-badge">${analysisType}</span></div></div><div class="section"><h2>📝 Récit du rêve</h2><div class="section-content">${transcription}</div></div><div class="section"><h2>🧠 Analyse scientifique</h2><div class="section-content">${analysisText}</div></div>${tagsHtml}<div class="footer">Analysé avec <strong>Noctaliæ</strong><br/><a href="https://nocty.thomasmaury.fr">nocty.thomasmaury.fr</a></div></div></body></html>`;
  };

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const html = generatePdfHtml();
      const title = getDynamicTitle();
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Rapport: ${title}`, UTI: 'com.adobe.pdf' });
      }
      setShowShareModal(false);
    } catch (error) {
      console.error('Erreur export PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const formatTime = () => {
    const date = new Date(dream.date);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // ============================================
  // ICÔNE MATERIAL AUTOMATIQUE (depuis backend)
  // ============================================
  const getIconFromBackend = () => {
    const backendEmoji = dream.emoji || dream.dreamEmoji;
    if (backendEmoji) {
      const emojiToIcon = {
        '😊': { name: 'emoticon-happy', family: 'MaterialCommunityIcons', color: '#10B981' },
        '😰': { name: 'emoticon-sad', family: 'MaterialCommunityIcons', color: '#EF4444' },
        '😢': { name: 'emoticon-cry', family: 'MaterialCommunityIcons', color: '#6B7280' },
        '😠': { name: 'emoticon-angry', family: 'MaterialCommunityIcons', color: '#F59E0B' },
        '😲': { name: 'emoticon-neutral', family: 'MaterialCommunityIcons', color: '#8B5CF6' },
        '😱': { name: 'emoticon-frown', family: 'MaterialCommunityIcons', color: '#F59E0B' },
        '😍': { name: 'emoticon-kiss', family: 'MaterialCommunityIcons', color: '#EC4899' },
        '🦋': { name: 'butterfly', family: 'MaterialCommunityIcons', color: '#06B6D4' },
        '🐕': { name: 'dog', family: 'MaterialCommunityIcons', color: '#F59E0B' },
        '🐶': { name: 'dog-side', family: 'MaterialCommunityIcons', color: '#F59E0B' },
        '🐈': { name: 'cat', family: 'MaterialCommunityIcons', color: '#F59E0B' },
        '🐦': { name: 'bird', family: 'MaterialCommunityIcons', color: '#06B6D4' },
        '🐟': { name: 'fish', family: 'MaterialCommunityIcons', color: '#3B82F6' },
        '🦉': { name: 'owl', family: 'MaterialCommunityIcons', color: '#8B5CF6' },
        '🐎': { name: 'horse', family: 'MaterialCommunityIcons', color: '#88735C' },
        '🐍': { name: 'snake', family: 'MaterialCommunityIcons', color: '#10B981' },
        '🕷️': { name: 'spider', family: 'MaterialCommunityIcons', color: '#6B7280' },
        '🌊': { name: 'waves', family: 'MaterialCommunityIcons', color: '#3B82F6' },
        '🌙': { name: 'moon-waning-crescent', family: 'MaterialCommunityIcons', color: '#D2B14C' },
        '⭐': { name: 'star', family: 'MaterialCommunityIcons', color: '#FBBF24' },
        '🌟': { name: 'star-four-points', family: 'MaterialCommunityIcons', color: '#FBBF24' },
        '🔥': { name: 'fire', family: 'MaterialCommunityIcons', color: '#F87171' },
        '🌈': { name: 'palette', family: 'MaterialCommunityIcons', color: '#A78BFA' },
        '⚡': { name: 'lightning-bolt', family: 'MaterialCommunityIcons', color: '#FBBF24' },
        '🌧️': { name: 'weather-rainy', family: 'MaterialCommunityIcons', color: '#3B82F6' },
        '☁️': { name: 'weather-cloudy', family: 'MaterialCommunityIcons', color: '#9CA3AF' },
        '🌲': { name: 'tree', family: 'MaterialCommunityIcons', color: '#10B981' },
        '🌺': { name: 'flower', family: 'MaterialCommunityIcons', color: '#EC4899' },
        '✈️': { name: 'airplane', family: 'MaterialCommunityIcons', color: '#06B6D4' },
        '🛫': { name: 'airplane-takeoff', family: 'MaterialCommunityIcons', color: '#06B6D4' },
        '🏃': { name: 'run', family: 'MaterialCommunityIcons', color: '#F59E0B' },
        '🏠': { name: 'home', family: 'MaterialCommunityIcons', color: '#8B5CF6' },
        '💭': { name: 'thought-bubble', family: 'MaterialCommunityIcons', color: '#9CA3AF' },
        '❤️': { name: 'heart', family: 'MaterialCommunityIcons', color: '#EC4899' },
        '💪': { name: 'arm-flex', family: 'MaterialCommunityIcons', color: '#F59E0B' },
        '🚪': { name: 'door', family: 'MaterialCommunityIcons', color: '#6B7280' },
        '🪜': { name: 'ladder', family: 'MaterialCommunityIcons', color: '#88735C' },
        '🛑': { name: 'bed', family: 'MaterialCommunityIcons', color: '#8B5CF6' },
        '🌌': { name: 'white-balance-sunny', family: 'MaterialCommunityIcons', color: '#FBBF24' },
        '🌃': { name: 'weather-night', family: 'MaterialCommunityIcons', color: '#6B7280' },
      };
      if (emojiToIcon[backendEmoji]) return emojiToIcon[backendEmoji];
      if (backendEmoji.includes('🐕') || backendEmoji.includes('🐶')) return { name: 'dog', family: 'MaterialCommunityIcons', color: '#F59E0B' };
      if (backendEmoji.includes('✈') || backendEmoji.includes('🛫')) return { name: 'airplane', family: 'MaterialCommunityIcons', color: '#06B6D4' };
      if (backendEmoji.includes('🐈')) return { name: 'cat', family: 'MaterialCommunityIcons', color: '#F59E0B' };
      if (backendEmoji.includes('🌙')) return { name: 'moon-waning-crescent', family: 'MaterialCommunityIcons', color: '#D2B14C' };
    }
    const analysisText = (dream.analysis || dream.transcription || '').toLowerCase();
    const iconMap = [
      { keywords: ['joie', 'bonheur', 'heureux', 'content', 'sourire', 'rire'], icon: { name: 'emoticon-happy', family: 'MaterialCommunityIcons', color: '#10B981' } },
      { keywords: ['peur', 'anxiété', 'angoisse', 'stress', 'inquiétude', 'terreur'], icon: { name: 'emoticon-sad', family: 'MaterialCommunityIcons', color: '#EF4444' } },
      { keywords: ['tristesse', 'mélancolie', 'chagrin', 'deuil', 'pleurs'], icon: { name: 'emoticon-cry', family: 'MaterialCommunityIcons', color: '#6B7280' } },
      { keywords: ['colère', 'frustration', 'rage', 'irritation', 'furieux'], icon: { name: 'emoticon-angry', family: 'MaterialCommunityIcons', color: '#F59E0B' } },
      { keywords: ['amour', 'affection', 'tendresse', 'passion', 'baiser'], icon: { name: 'heart', family: 'MaterialCommunityIcons', color: '#EC4899' } },
      { keywords: ['chien', 'chiot', 'canin', 'aboie'], icon: { name: 'dog', family: 'MaterialCommunityIcons', color: '#F59E0B' } },
      { keywords: ['chat', 'chaton', 'félin', 'miaule'], icon: { name: 'cat', family: 'MaterialCommunityIcons', color: '#F59E0B' } },
      { keywords: ['oiseau', 'vol', 'plume', 'chante'], icon: { name: 'bird', family: 'MaterialCommunityIcons', color: '#06B6D4' } },
      { keywords: ['poisson', 'nage', 'aquatique'], icon: { name: 'fish', family: 'MaterialCommunityIcons', color: '#3B82F6' } },
      { keywords: ['papillon', 'métamorphose', 'transformation'], icon: { name: 'butterfly', family: 'MaterialCommunityIcons', color: '#06B6D4' } },
      { keywords: ['cheval', 'étalon', 'galop'], icon: { name: 'horse', family: 'MaterialCommunityIcons', color: '#88735C' } },
      { keywords: ['serpent', 'reptile', 'rampe'], icon: { name: 'snake', family: 'MaterialCommunityIcons', color: '#10B981' } },
      { keywords: ['araignée', 'toile'], icon: { name: 'spider', family: 'MaterialCommunityIcons', color: '#6B7280' } },
      { keywords: ['chouette', 'hibou'], icon: { name: 'owl', family: 'MaterialCommunityIcons', color: '#8B5CF6' } },
      { keywords: ['eau', 'océan', 'mer', 'noyade', 'vagues'], icon: { name: 'waves', family: 'MaterialCommunityIcons', color: '#3B82F6' } },
      { keywords: ['lune', 'nuit', 'croissant'], icon: { name: 'moon-waning-crescent', family: 'MaterialCommunityIcons', color: '#D2B14C' } },
      { keywords: ['feu', 'flamme', 'brûle', 'incendie'], icon: { name: 'fire', family: 'MaterialCommunityIcons', color: '#F87171' } },
      { keywords: ['pluie', 'averse', 'mouillé'], icon: { name: 'weather-rainy', family: 'MaterialCommunityIcons', color: '#3B82F6' } },
      { keywords: ['éclair', 'foudre', 'orage'], icon: { name: 'lightning-bolt', family: 'MaterialCommunityIcons', color: '#FBBF24' } },
      { keywords: ['nuage', 'brouillard'], icon: { name: 'weather-cloudy', family: 'MaterialCommunityIcons', color: '#9CA3AF' } },
      { keywords: ['arbre', 'forêt', 'bois'], icon: { name: 'tree', family: 'MaterialCommunityIcons', color: '#10B981' } },
      { keywords: ['fleur', 'jardin'], icon: { name: 'flower', family: 'MaterialCommunityIcons', color: '#EC4899' } },
      { keywords: ['liberté', 'voler', 'envol', 'légèreté', 'avion', 'ailes'], icon: { name: 'airplane', family: 'MaterialCommunityIcons', color: '#06B6D4' } },
      { keywords: ['fuite', 'poursuite', 'courir', 'échapper', 'course'], icon: { name: 'run', family: 'MaterialCommunityIcons', color: '#F59E0B' } },
      { keywords: ['maison', 'foyer', 'famille', 'intérieur', 'domicile'], icon: { name: 'home', family: 'MaterialCommunityIcons', color: '#8B5CF6' } },
      { keywords: ['porte', 'seuil', 'passage'], icon: { name: 'door', family: 'MaterialCommunityIcons', color: '#6B7280' } },
      { keywords: ['lit', 'sommeil', 'dormir', 'repos'], icon: { name: 'bed', family: 'MaterialCommunityIcons', color: '#8B5CF6' } },
      { keywords: ['pensée', 'réflexion', 'méditation'], icon: { name: 'thought-bubble', family: 'MaterialCommunityIcons', color: '#9CA3AF' } },
      { keywords: ['force', 'puissance', 'muscle'], icon: { name: 'arm-flex', family: 'MaterialCommunityIcons', color: '#F59E0B' } },
    ];
    for (const item of iconMap) {
      if (item.keywords.some(kw => analysisText.includes(kw))) return item.icon;
    }
    return { name: 'sleep', family: 'MaterialCommunityIcons', color: theme.colors.primary };
  };

  // ============================================
  // TITRE DYNAMIQUE (backend v2.3+)
  // ============================================
  const getDynamicTitle = () => {
    const backendTitle = dream.dreamTitle || dream.title;
    if (backendTitle && backendTitle !== 'Mon rêve' && backendTitle !== 'Rêve sans titre' &&
        !backendTitle.includes('Rêve du') && !backendTitle.includes('Analyse de votre rêve') && backendTitle.length > 3) {
      return backendTitle;
    }
    const analysisText = typeof dream.analysis === 'string' ? dream.analysis : (dream.analysis?.fullAnalysis || dream.analysis?.shortSummary || '');
    const firstPart = analysisText.substring(0, 150);
    const titleMatch = firstPart.match(/##\s*🌙\s*(.+?)(?:\n|$)/);
    if (titleMatch && titleMatch[1].trim().length > 0 && titleMatch[1].trim().length < 60) return titleMatch[1].trim();
    const sentences = analysisText.split(/[.!?\n]/).filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (firstSentence.length > 10 && firstSentence.length < 60) return firstSentence;
    }
    if (dream.transcription) {
      const transcriptSentences = dream.transcription.split(/[.!?]/).filter(s => s.trim().length > 10);
      if (transcriptSentences.length > 0) {
        const firstTranscript = transcriptSentences[0].trim();
        if (firstTranscript.length > 10 && firstTranscript.length < 60) return firstTranscript;
      }
    }
    return 'Rêve sans titre';
  };

  // ============================================
  // TAGS DYNAMIQUES (backend v2.3+)
  // ============================================
  const getDynamicTags = () => {
    if (dream.tags && Array.isArray(dream.tags) && dream.tags.length > 0) {
      let normalizedTags = [];
      for (const tag of dream.tags) {
        const cleaned = String(tag).replace(/[\[\]]/g, '').trim();
        if (cleaned.includes('#') || (cleaned.includes(' ') && cleaned.length > 20)) {
          const parts = cleaned.split(/[\s,]+/).filter(Boolean).map(part => part.replace(/^#/, '').trim()).filter(Boolean);
          normalizedTags.push(...parts);
        } else { if (cleaned) normalizedTags.push(cleaned); }
      }
      normalizedTags = [...new Set(normalizedTags)].slice(0, 3);
      const tagColors = {
        'cauchemar': '#EF4444', 'lucide': '#8B5CF6', 'récurrent': '#F59E0B',
        'transformation': theme.colors.softBrown, 'eau': '#3B82F6', 'vol': '#06B6D4',
        'chute': '#EF4444', 'poursuite': '#F59E0B', 'famille': '#EC4899', 'travail': '#6B7280',
      };
      return normalizedTags.map(tag => ({
        label: String(tag).charAt(0).toUpperCase() + String(tag).slice(1),
        color: tagColors[String(tag).toLowerCase()] || theme.colors.primary
      }));
    }
    const tags = [];
    const analysisText = (typeof dream.analysis === 'string' ? dream.analysis : (dream.analysis?.fullAnalysis || '')).toLowerCase();
    if (dream.modelUsed && dream.modelUsed.toLowerCase().includes('claude')) tags.push({ label: 'DeepDream', color: '#8A2BE2' });
    else if (dream.modelUsed && dream.modelUsed.toLowerCase().includes('llama')) tags.push({ label: 'QuickDream', color: '#10B981' });
    else if (dream.analysis) tags.push({ label: 'Analysé', color: '#6B7280' });
    else tags.push({ label: 'Non analysé', color: '#64748B' });
    const emotionMap = [
      { keywords: ['joie', 'bonheur', 'heureux'], label: 'Joie', color: theme.colors.warmGold },
      { keywords: ['peur', 'anxiété', 'angoisse'], label: 'Peur', color: '#EF4444' },
      { keywords: ['tristesse', 'mélancolie'], label: 'Tristesse', color: '#6B7280' },
      { keywords: ['colère', 'frustration'], label: 'Colère', color: '#F59E0B' },
    ];
    for (const emotion of emotionMap) {
      if (emotion.keywords.some(kw => analysisText.includes(kw)) && tags.length < 3) { tags.push({ label: emotion.label, color: emotion.color }); break; }
    }
    const themeMap = [
      { keywords: ['liberté', 'voler', 'envol'], label: 'Liberté', color: theme.colors.primary },
      { keywords: ['eau', 'mer', 'océan'], label: 'Eau', color: '#3B82F6' },
      { keywords: ['transformation', 'changement'], label: 'Changement', color: theme.colors.softBrown },
    ];
    for (const themeEntry of themeMap) {
      if (themeEntry.keywords.some(kw => analysisText.includes(kw)) && tags.length < 3) { tags.push({ label: themeEntry.label, color: themeEntry.color }); break; }
    }
    return tags;
  };

  // ============================================
  // RÉSUMÉ COURT (2 lignes max)
  // ============================================
  const getShortSummary = () => {
    const analysisText = typeof dream.analysis === 'string' ? dream.analysis : (dream.analysis?.fullAnalysis || dream.analysis?.shortSummary || '');
    if (analysisText && analysisText.length > 10) {
      let cleaned = analysisText
        .replace(/[🌙📌📊🔗😊🧠💡✨⭐🌟💭🔥🌈🦋❤️😢😰😠😲🏃🏠🌊🐕🐶✈️🛫🐾]/g, '')
        .replace(/^##\s+.+?$/gm, '').replace(/^###\s+.+?$/gm, '').replace(/[*#]/g, '').trim();
      const genericPhrases = ['Analyse de votre rêve', 'Découvrons ensemble', 'Cette nuit', 'Votre rêve', 'Ce rêve'];
      const sentences = cleaned.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15)
        .filter(s => !genericPhrases.some(phrase => s.toLowerCase().includes(phrase.toLowerCase())));
      if (sentences.length > 0) {
        const firstTwo = sentences.slice(0, 2).join('. ').trim();
        if (firstTwo.length > 10) return firstTwo.length > 120 ? firstTwo.substring(0, 120) + '...' : firstTwo + '.';
      }
    }
    if (dream.transcription) {
      const text = dream.transcription.trim();
      return text.length > 120 ? text.substring(0, 120) + '...' : text;
    }
    return t('dreamCard.noSummary');
  };

  // ============================================
  // RENDER
  // ============================================
  const icon = getIconFromBackend();
  const title = getDynamicTitle();
  const tags = getDynamicTags();
  const summary = getShortSummary();
  const time = formatTime();
  const IconComponent = icon.family === 'MaterialIcons' ? MaterialIcons : MaterialCommunityIcons;
  const hasHeroImage = dream.imageUrl && !imageError;
  const cardBg = theme.colors.cardBackground || '#1a1f3a';

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeOpen}
      overshootLeft={false}
      overshootRight={false}
      friction={2.2}
      leftThreshold={100}
      rightThreshold={100}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.card,
            hasHeroImage && styles.cardWithHero,
            { 
              backgroundColor: theme.colors.cardBackground,
              borderColor: isSelected ? '#39FF88' : (dream.isSecret ? '#8B5CF6' : theme.colors.cardBorder),
              borderWidth: isSelected ? 2 : (dream.isSecret ? 2 : 1),
            },
            theme.shadow.md
          ]}
          onPress={handleCardPress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          delayLongPress={400}
        >
          {dream.isSecret && !isUnlocked && (
            <View style={styles.secretOverlay}>
              <View style={styles.secretContent}>
                <MaterialCommunityIcons name="lock" size={40} color="#8B5CF6" />
                <Text style={styles.secretText}>{t('dreamCard.secretText')}</Text>
                <Text style={styles.secretHint}>{t('dreamCard.secretHint')}</Text>
              </View>
            </View>
          )}
          {dream.isSecret && isUnlocked && (
            <View style={styles.secretBadge}><MaterialCommunityIcons name="key-variant" size={16} color="#8B5CF6" /></View>
          )}
          {dream.isFavorite && !dream.isSecret && !hasHeroImage && (
            <View style={styles.favoriteBadge}><MaterialIcons name="star" size={15} color="#D2B14C" /></View>
          )}
          {isSelectionMode && (
            <TouchableOpacity style={styles.checkboxContainer} onPress={onSelectionToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          )}

          {hasHeroImage ? (
            <>
              <View style={styles.heroContainer}>
                <Image source={{ uri: dream.imageUrl }} style={styles.heroImage} resizeMode="cover" onError={() => setImageError(true)} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)', cardBg]} locations={[0.2, 0.65, 1]} style={styles.heroGradient} />
                <View style={styles.heroTitleContainer}>
                  <Text style={[styles.heroTitle, { color: '#00FFB0' }]} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
                </View>
                <View style={styles.heroTopRight}>
                  <View style={[styles.heroTimeBadge, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <MaterialIcons name="schedule" size={12} color="#FFFFFF" />
                    <Text style={styles.heroTimeText}>{time}</Text>
                  </View>
                  {!isSelectionMode && (
                    <>
                      <TouchableOpacity style={[styles.heroMenuButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]} onPress={() => { if (onFavoriteToggle) onFavoriteToggle(dream.id); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <MaterialIcons name={dream.isFavorite ? 'star' : 'star-outline'} size={16} color={dream.isFavorite ? '#D2B14C' : '#FFFFFF'} />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.heroMenuButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]} onPress={() => { if (dream.isSecret && !isUnlocked) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (showMenuHint && onMenuHintDismiss) onMenuHintDismiss(); setShowOptionsModal(true); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        {showMenuHint && <Animated.View style={[styles.menuHintPulse, { transform: [{ scale: pulseAnim }] }]} />}
                        <MaterialCommunityIcons name={dream.isSecret ? 'lock-outline' : 'dots-vertical'} size={18} color={dream.isSecret ? '#8B5CF6' : '#FFFFFF'} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heroTagsScroll} contentContainerStyle={styles.tagsContainer}>
                {tags.map((tag, idx) => (
                  <View key={idx} style={[styles.tag, { backgroundColor: tag.color + '20' }]}>
                    <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                  </View>
                ))}
              </ScrollView>
              <Text style={[styles.summary, styles.heroSummary, { color: theme.colors.textSecondary }]} numberOfLines={2} ellipsizeMode="tail">{summary}</Text>
            </>
          ) : (
            <>
              <DreamFallbackHero tags={dream.tags} title={getDynamicTitle()} analysis={typeof dream.analysis === 'string' ? dream.analysis : ''} height={100} style={styles.fallbackHero} />
              <View style={styles.topBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScrollContainer} contentContainerStyle={styles.tagsContainer}>
                  {tags.map((tag, idx) => (
                    <View key={idx} style={[styles.tag, { backgroundColor: tag.color + '20' }]}>
                      <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.timeMenuContainer}>
                  <View style={styles.timeContainer}>
                    <MaterialIcons name="schedule" size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>{time}</Text>
                  </View>
                  {!isSelectionMode && (
                    <>
                      <TouchableOpacity style={styles.favoriteButton} onPress={() => { if (onFavoriteToggle) onFavoriteToggle(dream.id); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <MaterialIcons name={dream.isFavorite ? 'star' : 'star-outline'} size={20} color={dream.isFavorite ? '#D2B14C' : theme.colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.menuButton} onPress={() => { if (dream.isSecret && !isUnlocked) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (showMenuHint && onMenuHintDismiss) onMenuHintDismiss(); setShowOptionsModal(true); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        {showMenuHint && <Animated.View style={[styles.menuHintPulse, { transform: [{ scale: pulseAnim }] }]} />}
                        <MaterialCommunityIcons name={dream.isSecret ? 'lock-outline' : 'dots-vertical'} size={22} color={dream.isSecret ? '#8B5CF6' : theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.mainRow}>
                <IconComponent name={icon.name} size={32} color={icon.color} />
                <Text style={[styles.title, { color: theme.colors.primary }]} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
              </View>
              <Text style={[styles.summary, { color: theme.colors.textSecondary }]} numberOfLines={2} ellipsizeMode="tail">{summary}</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* MODAL DE PARTAGE */}
      <Modal visible={showShareModal} transparent animationType="slide" onRequestClose={() => setShowShareModal(false)}>
        <TouchableOpacity style={styles.shareSheetOverlay} activeOpacity={1} onPress={() => setShowShareModal(false)}>
          <View style={[styles.shareSheet, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>{t('dreamCard.shareModal_title')}</Text>
            <TouchableOpacity style={[styles.shareOptionRow, { backgroundColor: theme.colors.backgroundElevated }]} onPress={() => { setShowShareModal(false); handleShareFriendly(); }}>
              <View style={[styles.shareOptionIcon, { backgroundColor: '#FF9966' }]}><MaterialCommunityIcons name="heart-outline" size={24} color="#FFFFFF" /></View>
              <View style={styles.shareOptionText}>
                <Text style={[styles.shareOptionTitle, { color: theme.colors.textPrimary }]}>{t('dreamCard.shareModal_friendly')}</Text>
                <Text style={[styles.shareOptionDesc, { color: theme.colors.textSecondary }]}>{t('dreamCard.shareModal_friendlyDesc')}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareOptionRow, { backgroundColor: theme.colors.backgroundElevated }]} onPress={() => { setShowShareModal(false); handleExportPdf(); }} disabled={isGeneratingPdf}>
              <View style={[styles.shareOptionIcon, { backgroundColor: '#8B5CF6' }]}>
                {isGeneratingPdf ? <ActivityIndicator size="small" color="#FFFFFF" /> : <MaterialCommunityIcons name="stethoscope" size={24} color="#FFFFFF" />}
              </View>
              <View style={styles.shareOptionText}>
                <Text style={[styles.shareOptionTitle, { color: theme.colors.textPrimary }]}>{isGeneratingPdf ? t('dreamCard.shareModal_pdfGenerating') : t('dreamCard.shareModal_pdf')}</Text>
                <Text style={[styles.shareOptionDesc, { color: theme.colors.textSecondary }]}>{t('dreamCard.shareModal_pdfDesc')}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalCancel, { borderTopColor: theme.colors.cardBorder }]} onPress={() => setShowShareModal(false)}>
              <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 🔐 MODAL SECRET */}
      <Modal visible={showSecretModal} transparent animationType="fade" onRequestClose={() => setShowSecretModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSecretModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.secretModalHeader}><MaterialCommunityIcons name={dream.isSecret ? "lock-open-variant" : "lock"} size={48} color="#8B5CF6" /></View>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>{dream.isSecret ? t('dreamCard.secretModal_titleRemove') : t('dreamCard.secretModal_titleAdd')}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>{dream.isSecret ? t('dreamCard.secretModal_msgRemove') : t('dreamCard.secretModal_msgAdd')}</Text>
            {!dream.isSecret && (
              <View style={styles.secretFeatures}>
                <View style={styles.secretFeature}><MaterialCommunityIcons name="eye-off" size={20} color="#8B5CF6" /><Text style={[styles.secretFeatureText, { color: theme.colors.textSecondary }]}>{t('dreamCard.secretModal_feature1')}</Text></View>
                <View style={styles.secretFeature}><MaterialCommunityIcons name="gesture-tap" size={20} color="#8B5CF6" /><Text style={[styles.secretFeatureText, { color: theme.colors.textSecondary }]}>{t('dreamCard.secretModal_feature2')}</Text></View>
                <View style={styles.secretFeature}><MaterialCommunityIcons name="cog" size={20} color="#8B5CF6" /><Text style={[styles.secretFeatureText, { color: theme.colors.textSecondary }]}>{t('dreamCard.secretModal_feature3')}</Text></View>
              </View>
            )}
            <TouchableOpacity style={[styles.secretActionButton, { backgroundColor: '#8B5CF6' }]} onPress={handleToggleSecret}>
              <MaterialCommunityIcons name={dream.isSecret ? "lock-open-variant" : "lock"} size={20} color="#FFFFFF" />
              <Text style={styles.secretActionButtonText}>{dream.isSecret ? t('dreamCard.secretModal_confirmRemove') : t('dreamCard.secretModal_confirmAdd')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalCancel, { borderTopColor: theme.colors.cardBorder }]} onPress={() => setShowSecretModal(false)}>
              <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ⋮ MODAL OPTIONS */}
      <Modal visible={showOptionsModal} transparent animationType="slide" onRequestClose={() => setShowOptionsModal(false)}>
        <TouchableOpacity style={styles.shareSheetOverlay} activeOpacity={1} onPress={() => setShowOptionsModal(false)}>
          <View style={[styles.shareSheet, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary, marginBottom: 16 }]}>{getDynamicTitle()}</Text>
            <TouchableOpacity style={[styles.shareOptionRow, { backgroundColor: theme.colors.backgroundElevated }]} onPress={() => { setShowOptionsModal(false); setTimeout(() => setShowShareModal(true), 300); }}>
              <View style={[styles.shareOptionIcon, { backgroundColor: '#00FFB0' }]}><MaterialIcons name="share" size={24} color="#0c0e27" /></View>
              <View style={styles.shareOptionText}><Text style={[styles.shareOptionTitle, { color: theme.colors.textPrimary }]}>{t('dreamCard.optionsModal_share')}</Text><Text style={[styles.shareOptionDesc, { color: theme.colors.textSecondary }]}>{t('dreamCard.optionsModal_shareDesc')}</Text></View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareOptionRow, { backgroundColor: theme.colors.backgroundElevated }]} onPress={async () => { setShowOptionsModal(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); if (onFirstArchive) { const isFirst = await onFirstArchive(); if (isFirst) { setShowArchiveModal(true); return; } } if (onArchive) onArchive(dream.id); }}>
              <View style={[styles.shareOptionIcon, { backgroundColor: '#FF9966' }]}><MaterialIcons name="archive" size={24} color="#FFFFFF" /></View>
              <View style={styles.shareOptionText}><Text style={[styles.shareOptionTitle, { color: theme.colors.textPrimary }]}>{t('dreamCard.optionsModal_archive')}</Text><Text style={[styles.shareOptionDesc, { color: theme.colors.textSecondary }]}>{t('dreamCard.optionsModal_archiveDesc')}</Text></View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareOptionRow, { backgroundColor: theme.colors.backgroundElevated }]} onPress={() => { setShowOptionsModal(false); if (onFavoriteToggle) onFavoriteToggle(dream.id); }}>
              <View style={[styles.shareOptionIcon, { backgroundColor: '#D2B14C' }]}><MaterialIcons name={dream.isFavorite ? 'star' : 'star-outline'} size={24} color="#0c0e27" /></View>
              <View style={styles.shareOptionText}><Text style={[styles.shareOptionTitle, { color: theme.colors.textPrimary }]}>{dream.isFavorite ? t('dreamCard.optionsModal_removeFav') : t('dreamCard.optionsModal_addFav')}</Text><Text style={[styles.shareOptionDesc, { color: theme.colors.textSecondary }]}>{dream.isFavorite ? t('dreamCard.optionsModal_removeFavDesc') : t('dreamCard.optionsModal_addFavDesc')}</Text></View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareOptionRow, { backgroundColor: theme.colors.backgroundElevated }]} onPress={() => { setShowOptionsModal(false); if (onPinToggle) onPinToggle(dream.id); }}>
              <View style={[styles.shareOptionIcon, { backgroundColor: '#4F8DFF' }]}><MaterialCommunityIcons name={dream.isPinned ? 'pin-off' : 'pin'} size={24} color="#FFFFFF" /></View>
              <View style={styles.shareOptionText}><Text style={[styles.shareOptionTitle, { color: theme.colors.textPrimary }]}>{dream.isPinned ? t('dreamCard.optionsModal_unpin') : t('dreamCard.optionsModal_pin')}</Text><Text style={[styles.shareOptionDesc, { color: theme.colors.textSecondary }]}>{dream.isPinned ? t('dreamCard.optionsModal_unpinDesc') : t('dreamCard.optionsModal_pinDesc')}</Text></View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shareOptionRow, { backgroundColor: theme.colors.backgroundElevated }]} onPress={() => { setShowOptionsModal(false); setTimeout(() => setShowSecretModal(true), 300); }}>
              <View style={[styles.shareOptionIcon, { backgroundColor: '#8B5CF6' }]}><MaterialCommunityIcons name={dream.isSecret ? 'lock-open-variant' : 'lock'} size={24} color="#FFFFFF" /></View>
              <View style={styles.shareOptionText}><Text style={[styles.shareOptionTitle, { color: theme.colors.textPrimary }]}>{dream.isSecret ? t('dreamCard.optionsModal_unprotect') : t('dreamCard.optionsModal_protect')}</Text><Text style={[styles.shareOptionDesc, { color: theme.colors.textSecondary }]}>{dream.isSecret ? t('dreamCard.optionsModal_unprotectDesc') : t('dreamCard.optionsModal_protectDesc')}</Text></View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalCancel, { borderTopColor: theme.colors.cardBorder }]} onPress={() => setShowOptionsModal(false)}>
              <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 📦 MODAL PREMIÈRE ARCHIVAGE */}
      <Modal visible={showArchiveModal} transparent animationType="fade" onRequestClose={() => setShowArchiveModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.archiveModalHeader}><MaterialIcons name="archive" size={48} color={theme.colors.warmGold || '#D2B14C'} /></View>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>{t('dreamCard.archiveModal_title')}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>{t('dreamCard.archiveModal_msg')}</Text>
            <View style={styles.archiveFeatures}>
              <View style={styles.archiveFeature}><MaterialIcons name="folder" size={20} color={theme.colors.warmGold || '#D2B14C'} /><Text style={[styles.archiveFeatureText, { color: theme.colors.textSecondary }]}>{t('dreamCard.archiveModal_feature1')}</Text></View>
              <View style={styles.archiveFeature}><MaterialIcons name="restore" size={20} color={theme.colors.warmGold || '#D2B14C'} /><Text style={[styles.archiveFeatureText, { color: theme.colors.textSecondary }]}>{t('dreamCard.archiveModal_feature2')}</Text></View>
            </View>
            <TouchableOpacity style={[styles.archiveActionButton, { backgroundColor: theme.colors.warmGold || '#D2B14C' }]} onPress={handleConfirmArchive}>
              <MaterialIcons name="check" size={20} color="#0c0e27" />
              <Text style={styles.archiveActionButtonText}>{t('dreamCard.archiveModal_confirm')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalCancel, { borderTopColor: theme.colors.cardBorder }]} onPress={() => setShowArchiveModal(false)}>
              <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Template hors-écran pour capture branding ── */}
      <ShareOverlay />
    </Swipeable>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 12, minHeight: 180, borderWidth: 1, overflow: 'hidden' },
  cardWithHero: { padding: 0, paddingBottom: 16 },
  heroContainer: { width: '100%', height: 180, borderTopLeftRadius: 15, borderTopRightRadius: 15, overflow: 'hidden', position: 'relative', marginBottom: 12 },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '80%' },
  heroTitleContainer: { position: 'absolute', bottom: 12, left: 16, right: 16 },
  heroTitle: { fontSize: 24, fontFamily: 'CormorantUpright-Bold', lineHeight: 32, paddingBottom: 4, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  heroTopRight: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroTimeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  heroTimeText: { fontSize: 11, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: '#FFFFFF' },
  heroMenuButton: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroTagsScroll: { marginBottom: 8, paddingHorizontal: 16, maxHeight: 32 },
  heroSummary: { paddingHorizontal: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, height: 32 },
  tagsScrollContainer: { flex: 1, marginRight: 8, maxHeight: 32 },
  tagsContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 8 },
  timeMenuContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 13, fontFamily: 'AtkinsonHyperlegibleNext-Bold', letterSpacing: 0.3 },
  favoriteButton: { padding: 4, alignItems: 'center', justifyContent: 'center' },
  menuButton: { padding: 4, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  menuHintPulse: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(139, 92, 246, 0.3)' },
  mainRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 11, fontFamily: 'AtkinsonHyperlegibleNext-Bold', letterSpacing: 0.2 },
  title: { flex: 1, fontSize: 22, fontFamily: 'CormorantUpright-Bold', lineHeight: 36, paddingBottom: 6 },
  summary: { fontSize: 14, lineHeight: 20, fontFamily: 'AtkinsonHyperlegibleNext-Regular' },
  swipeAction: { justifyContent: 'center', alignItems: 'center', width: 90, marginBottom: 12, gap: 4 },
  archiveAction: { borderTopRightRadius: 16, borderBottomRightRadius: 16 },
  shareAction: { borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  swipeActionText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'AtkinsonHyperlegibleNext-Bold' },
  shareSheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  shareSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 20 },
  shareOptionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, marginBottom: 12 },
  shareOptionIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  shareOptionText: { flex: 1 },
  shareOptionTitle: { fontSize: 16, fontFamily: 'AtkinsonHyperlegibleNext-Bold', marginBottom: 2 },
  shareOptionDesc: { fontSize: 13, fontFamily: 'AtkinsonHyperlegibleNext-Regular' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 340, borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 24, fontFamily: 'CormorantUpright-Bold', textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  modalCancel: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, alignItems: 'center' },
  modalCancelText: { fontSize: 16, fontFamily: 'AtkinsonHyperlegibleNext-Medium' },
  secretOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(12, 14, 39, 0.95)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  secretContent: { alignItems: 'center', gap: 8 },
  secretText: { fontSize: 18, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: '#8B5CF6', marginTop: 8 },
  secretHint: { fontSize: 13, color: 'rgba(139, 92, 246, 0.7)' },
  secretBadge: { position: 'absolute', top: 12, right: 12, zIndex: 5 },
  favoriteBadge: { position: 'absolute', top: 12, right: 12, zIndex: 5 },
  checkboxContainer: { position: 'absolute', top: 12, left: 12, zIndex: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)', backgroundColor: 'rgba(0, 0, 0, 0.2)', alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: '#39FF88', borderColor: '#39FF88' },
  secretModalHeader: { alignItems: 'center', marginBottom: 16 },
  secretFeatures: { width: '100%', gap: 12, marginTop: 16, marginBottom: 24, paddingHorizontal: 8 },
  secretFeature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  secretFeatureText: { fontSize: 14, flex: 1 },
  secretActionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, width: '100%', marginBottom: 8 },
  secretActionButtonText: { fontSize: 17, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: '#FFFFFF' },
  archiveModalHeader: { alignItems: 'center', marginBottom: 16 },
  archiveFeatures: { width: '100%', gap: 12, marginTop: 16, marginBottom: 24, paddingHorizontal: 8 },
  archiveFeature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  archiveFeatureText: { fontSize: 14, flex: 1 },
  archiveActionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, width: '100%', marginBottom: 8 },
  archiveActionButtonText: { fontSize: 17, fontFamily: 'AtkinsonHyperlegibleNext-Bold', color: '#0c0e27' },
  fallbackHero: { borderTopLeftRadius: 15, borderTopRightRadius: 15, marginHorizontal: -16, marginTop: -16, marginBottom: 12, width: 'auto' },
});
