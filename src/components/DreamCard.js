import React, { useRef, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, ScrollView, Share, Modal, ActivityIndicator } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../config/ThemeContext';
import BiometricService from '../services/biometricService';

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
export default function DreamCard({ dream, onPress, onArchive, onShare, onSecretToggle, isSelectionMode, isSelected, onSelectionToggle, showMenuHint, onMenuHintDismiss, onFirstArchive }) {
  const { theme } = useTheme();
  const swipeableRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false); // 🆕 Modal première archivage
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // 💡 Animation pulse pour le hint
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animation scale au tap
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // 💡 Lancer l'animation pulse si hint actif
  React.useEffect(() => {
    if (showMenuHint) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [showMenuHint]);
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  // ============================================
  // SWIPE ACTIONS - Gmail Style
  // ============================================
  
  // Swipe GAUCHE → Archiver (action à DROITE visuellement)
  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View 
        style={[
          styles.swipeAction,
          styles.archiveAction,
          { backgroundColor: theme.colors.warmGold || '#D2B14C' },
          { transform: [{ scale }] }
        ]}
      >
        <MaterialIcons name="archive" size={28} color="#FFFFFF" />
        <Text style={styles.swipeActionText}>Archiver</Text>
      </Animated.View>
    );
  };
  
  // Swipe DROITE → Partager (action à GAUCHE visuellement)
  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View 
        style={[
          styles.swipeAction,
          styles.shareAction,
          { backgroundColor: '#FF9966' },
          { transform: [{ scale }] }
        ]}
      >
        <MaterialIcons name="share" size={28} color="#FFFFFF" />
        <Text style={styles.swipeActionText}>Partager</Text>
      </Animated.View>
    );
  };

  // Handler quand swipe complété
  const handleSwipeOpen = async (direction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (direction === 'right') {
      // Swipe vers la droite = Archiver
      // Vérifier si c'est la première fois
      if (onFirstArchive) {
        const isFirst = await onFirstArchive();
        if (isFirst) {
          // Première fois → afficher modal explicatif
          setShowArchiveModal(true);
          swipeableRef.current?.close();
          return;
        }
      }
      // Archiver directement
      if (onArchive) {
        onArchive(dream.id);
      }
    } else if (direction === 'left') {
      // Swipe vers la gauche = Ouvrir modal de partage
      if (dream.isSecret && !isUnlocked) {
        // Bloquer le partage si secret et verrouillé
        return;
      }
      setShowShareModal(true);
      swipeableRef.current?.close();
    }
  };

  // 📦 Confirmer l'archivage depuis le modal
  const handleConfirmArchive = () => {
    setShowArchiveModal(false);
    if (onArchive) {
      onArchive(dream.id, true); // true = trigger animation tab
    }
  };

  // ============================================
  // 🔐 GESTION DES SECRETS
  // ============================================
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowSecretModal(true);
  };

  const handleToggleSecret = () => {
    if (onSecretToggle) {
      onSecretToggle(dream.id, !dream.isSecret);
    }
    setShowSecretModal(false);
    setIsUnlocked(false);
  };

  const handleCardPress = async () => {
    if (dream.isSecret && !isUnlocked) {
      // 🔐 Demander authentification biométrique
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const authenticated = await BiometricService.authenticateForSecrets();
      if (authenticated) {
        setIsUnlocked(true);
      }
      return;
    }
    onPress();
  };

  // Partage interne - FORMAT PRO COMPLET
  const handleShare = async () => {
    if (onShare) {
      onShare(dream);
      return;
    }
    
    // Fallback: partage natif FORMAT COMPLET
    try {
      const title = getDynamicTitle();
      const shareContent = getProShareContent();
      
      await Share.share({
        message: shareContent,
        title: title,
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  // ============================================
  // FORMAT PRO POUR PARTAGE (psy, proches, etc.)
  // ============================================
  const getProShareContent = () => {
    const date = new Date(dream.date);
    const formattedDate = date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
    
    // Type d'analyse
    let analysisType = 'Non analysé';
    if (dream.modelUsed) {
      if (dream.modelUsed.toLowerCase().includes('claude')) {
        analysisType = 'DeepDream (Claude Sonnet 4.5)';
      } else if (dream.modelUsed.toLowerCase().includes('llama')) {
        analysisType = 'QuickDream (Llama 3.3 70B)';
      } else {
        analysisType = dream.modelUsed;
      }
    }
    
    // Transcription
    const transcription = dream.transcription?.trim() || 'Récit non disponible';
    
    // Analyse complète (nettoyer si c'est un objet)
    let analysisText = 'Analyse non disponible';
    if (dream.analysis) {
      if (typeof dream.analysis === 'string') {
        analysisText = dream.analysis.trim();
      } else if (dream.analysis.fullAnalysis) {
        analysisText = dream.analysis.fullAnalysis.trim();
      } else if (dream.analysis.shortSummary) {
        analysisText = dream.analysis.shortSummary.trim();
      }
    }
    
    // Tags/Thèmes (nettoyer les crochets parasites)
    let tagsSection = '';
    if (dream.tags && Array.isArray(dream.tags) && dream.tags.length > 0) {
      const tagsList = dream.tags
        .map(t => {
          // Nettoyer les crochets et espaces parasites
          const cleaned = String(t).replace(/[\[\]]/g, '').trim();
          return cleaned ? `• ${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}` : null;
        })
        .filter(Boolean)
        .join('\n');
      if (tagsList) {
        tagsSection = `\n🏷️ THÈMES DÉTECTÉS\n─────────────────\n${tagsList}\n`;
      }
    }
    
    // Construction du message complet
    return `🌙 NOCTALIÆ - RAPPORT DE RÊVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 ${formattedDate}
🎯 Analyse: ${analysisType}

📝 RÉCIT DU RÊVE
────────────────
${transcription}

🧠 ANALYSE SCIENTIFIQUE
───────────────────────
${analysisText}
${tagsSection}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analysé avec Noctaliæ`;
  };

  // ============================================
  // EXPORT PDF PRO
  // ============================================
  const generatePdfHtml = () => {
    const date = new Date(dream.date);
    const formattedDate = date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
    
    // Type d'analyse
    let analysisType = 'Non analysé';
    let analysisColor = '#64748B';
    if (dream.modelUsed) {
      if (dream.modelUsed.toLowerCase().includes('claude')) {
        analysisType = 'DeepDream (Claude Sonnet 4.5)';
        analysisColor = '#8A2BE2';
      } else if (dream.modelUsed.toLowerCase().includes('llama')) {
        analysisType = 'QuickDream (Llama 3.3 70B)';
        analysisColor = '#10B981';
      }
    }
    
    // Transcription
    const transcription = dream.transcription?.trim() || 'Récit non disponible';
    
    // Analyse (nettoyer markdown basique)
    let analysisText = 'Analyse non disponible';
    if (dream.analysis) {
      if (typeof dream.analysis === 'string') {
        analysisText = dream.analysis.trim();
      } else if (dream.analysis.fullAnalysis) {
        analysisText = dream.analysis.fullAnalysis.trim();
      }
    }
    // Convertir markdown basique en HTML
    analysisText = analysisText
      .replace(/### (.*)/g, '<h4>$1</h4>')
      .replace(/## (.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/---/g, '<hr/>')
      .replace(/\n/g, '<br/>');
    
    // Tags
    let tagsHtml = '';
    if (dream.tags && Array.isArray(dream.tags) && dream.tags.length > 0) {
      const cleanedTags = dream.tags
        .map(t => String(t).replace(/[\[\]]/g, '').trim())
        .filter(Boolean);
      if (cleanedTags.length > 0) {
        tagsHtml = `
          <div class="section">
            <h2>🏷️ Thèmes détectés</h2>
            <div class="tags">
              ${cleanedTags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
          </div>
        `;
      }
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rapport de rêve - Noctaliæ</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0c0e27;
            color: #FFFFFF;
            padding: 40px;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #0f1130;
            border-radius: 20px;
            padding: 40px;
            border: 1px solid #1a1f3a;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #D2B14C;
          }
          .logo {
            font-size: 32px;
            font-weight: 700;
            color: #D2B14C;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #A0B4D4;
            font-size: 14px;
          }
          .meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 15px;
            background: #1a1f3a;
            border-radius: 12px;
          }
          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .meta-label { color: #A0B4D4; font-size: 12px; }
          .meta-value { color: #FFFFFF; font-weight: 600; }
          .analysis-badge {
            background: ${analysisColor};
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #D2B14C;
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .section-content {
            background: #1a1f3a;
            padding: 20px;
            border-radius: 12px;
            color: #E0E0E0;
          }
          .section-content h3 { color: #D2B14C; margin: 15px 0 10px 0; font-size: 16px; }
          .section-content h4 { color: #A0B4D4; margin: 12px 0 8px 0; font-size: 14px; }
          .section-content hr { border: none; border-top: 1px solid #2a2f4a; margin: 15px 0; }
          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .tag {
            background: #D2B14C20;
            color: #D2B14C;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #1a1f3a;
            color: #A0B4D4;
            font-size: 12px;
          }
          .footer a { color: #D2B14C; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌙 Noctaliæ</div>
            <div class="subtitle">Rapport de rêve</div>
          </div>
          
          <div class="meta">
            <div class="meta-item">
              <span class="meta-label">📅 Date</span>
              <span class="meta-value">${formattedDate}</span>
            </div>
            <div class="meta-item">
              <span class="analysis-badge">${analysisType}</span>
            </div>
          </div>
          
          <div class="section">
            <h2>📝 Récit du rêve</h2>
            <div class="section-content">
              ${transcription}
            </div>
          </div>
          
          <div class="section">
            <h2>🧠 Analyse scientifique</h2>
            <div class="section-content">
              ${analysisText}
            </div>
          </div>
          
          ${tagsHtml}
          
          <div class="footer">
            Analysé avec <strong>Noctaliæ</strong><br/>
            <a href="https://www.notion.so/2b7976346b368160aff2d919d8563643">https://www.notion.so/2b7976346b368160aff2d919d8563643</a>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const html = generatePdfHtml();
      const title = getDynamicTitle();
      
      // Générer le PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });
      
      // Partager le PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Rapport: ${title}`,
          UTI: 'com.adobe.pdf',
        });
      }
      
      setShowShareModal(false);
    } catch (error) {
      console.error('Erreur export PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // ============================================
  // FORMATAGE HEURE UNIQUEMENT
  // ============================================
  const formatTime = () => {
    const date = new Date(dream.date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // ============================================
  // ICÔNE MATERIAL AUTOMATIQUE (depuis backend)
  // ============================================
  const getIconFromBackend = () => {
    // 1. Si emoji/icône du backend (v2.3+)
    const backendEmoji = dream.emoji || dream.dreamEmoji;
    
    if (backendEmoji) {
      // Mapper emoji backend → Material Icon (EXPANDED avec MaterialCommunityIcons)
      const emojiToIcon = {
        // ÉMOTIONS
        '😊': { name: 'emoticon-happy', family: 'MaterialCommunityIcons', color: '#10B981' },
        '😰': { name: 'emoticon-sad', family: 'MaterialCommunityIcons', color: '#EF4444' },
        '😢': { name: 'emoticon-cry', family: 'MaterialCommunityIcons', color: '#6B7280' },
        '😠': { name: 'emoticon-angry', family: 'MaterialCommunityIcons', color: '#F59E0B' },
        '😲': { name: 'emoticon-neutral', family: 'MaterialCommunityIcons', color: '#8B5CF6' },
        '😱': { name: 'emoticon-frown', family: 'MaterialCommunityIcons', color: '#F59E0B' },
        '😍': { name: 'emoticon-kiss', family: 'MaterialCommunityIcons', color: '#EC4899' },
        
        // ANIMAUX (MaterialCommunityIcons)
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
        
        // NATURE & MÉTÉO
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
        
        // ACTIONS & LIEUX
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
      
      // Essayer d'abord un match exact
      if (emojiToIcon[backendEmoji]) {
        return emojiToIcon[backendEmoji];
      }
      
      // Sinon chercher dans les mots-clés de l'emoji (fallback)
      if (backendEmoji.includes('🐕') || backendEmoji.includes('🐶')) {
        return { name: 'dog', family: 'MaterialCommunityIcons', color: '#F59E0B' };
      }
      if (backendEmoji.includes('✈') || backendEmoji.includes('🛫')) {
        return { name: 'airplane', family: 'MaterialCommunityIcons', color: '#06B6D4' };
      }
      if (backendEmoji.includes('🐈')) {
        return { name: 'cat', family: 'MaterialCommunityIcons', color: '#F59E0B' };
      }
      if (backendEmoji.includes('🌙')) {
        return { name: 'moon-waning-crescent', family: 'MaterialCommunityIcons', color: '#D2B14C' };
      }
    }
    
    // 2. Fallback : analyser le texte localement (MaterialCommunityIcons)
    const analysisText = (dream.analysis || dream.transcription || '').toLowerCase();
    
    const iconMap = [
      // ÉMOTIONS
      { keywords: ['joie', 'bonheur', 'heureux', 'content', 'sourire', 'rire'], icon: { name: 'emoticon-happy', family: 'MaterialCommunityIcons', color: '#10B981' } },
      { keywords: ['peur', 'anxiété', 'angoisse', 'stress', 'inquiétude', 'terreur'], icon: { name: 'emoticon-sad', family: 'MaterialCommunityIcons', color: '#EF4444' } },
      { keywords: ['tristesse', 'mélancolie', 'chagrin', 'deuil', 'pleurs'], icon: { name: 'emoticon-cry', family: 'MaterialCommunityIcons', color: '#6B7280' } },
      { keywords: ['colère', 'frustration', 'rage', 'irritation', 'furieux'], icon: { name: 'emoticon-angry', family: 'MaterialCommunityIcons', color: '#F59E0B' } },
      { keywords: ['amour', 'affection', 'tendresse', 'passion', 'baiser'], icon: { name: 'heart', family: 'MaterialCommunityIcons', color: '#EC4899' } },
      
      // ANIMAUX
      { keywords: ['chien', 'chiot', 'canin', 'aboie'], icon: { name: 'dog', family: 'MaterialCommunityIcons', color: '#F59E0B' } },
      { keywords: ['chat', 'chaton', 'félin', 'miaule'], icon: { name: 'cat', family: 'MaterialCommunityIcons', color: '#F59E0B' } },
      { keywords: ['oiseau', 'vol', 'plume', 'chante'], icon: { name: 'bird', family: 'MaterialCommunityIcons', color: '#06B6D4' } },
      { keywords: ['poisson', 'nage', 'aquatique'], icon: { name: 'fish', family: 'MaterialCommunityIcons', color: '#3B82F6' } },
      { keywords: ['papillon', 'métamorphose', 'transformation'], icon: { name: 'butterfly', family: 'MaterialCommunityIcons', color: '#06B6D4' } },
      { keywords: ['cheval', 'étalon', 'galop'], icon: { name: 'horse', family: 'MaterialCommunityIcons', color: '#88735C' } },
      { keywords: ['serpent', 'reptile', 'rampe'], icon: { name: 'snake', family: 'MaterialCommunityIcons', color: '#10B981' } },
      { keywords: ['araignée', 'toile'], icon: { name: 'spider', family: 'MaterialCommunityIcons', color: '#6B7280' } },
      { keywords: ['chouette', 'hibou'], icon: { name: 'owl', family: 'MaterialCommunityIcons', color: '#8B5CF6' } },
      
      // NATURE & MÉTÉO
      { keywords: ['eau', 'océan', 'mer', 'noyade', 'vagues'], icon: { name: 'waves', family: 'MaterialCommunityIcons', color: '#3B82F6' } },
      { keywords: ['lune', 'nuit', 'croissant'], icon: { name: 'moon-waning-crescent', family: 'MaterialCommunityIcons', color: '#D2B14C' } },
      { keywords: ['feu', 'flamme', 'brûle', 'incendie'], icon: { name: 'fire', family: 'MaterialCommunityIcons', color: '#F87171' } },
      { keywords: ['pluie', 'averse', 'mouillé'], icon: { name: 'weather-rainy', family: 'MaterialCommunityIcons', color: '#3B82F6' } },
      { keywords: ['éclair', 'foudre', 'orage'], icon: { name: 'lightning-bolt', family: 'MaterialCommunityIcons', color: '#FBBF24' } },
      { keywords: ['nuage', 'brouillard'], icon: { name: 'weather-cloudy', family: 'MaterialCommunityIcons', color: '#9CA3AF' } },
      { keywords: ['arbre', 'forêt', 'bois'], icon: { name: 'tree', family: 'MaterialCommunityIcons', color: '#10B981' } },
      { keywords: ['fleur', 'jardin'], icon: { name: 'flower', family: 'MaterialCommunityIcons', color: '#EC4899' } },
      
      // ACTIONS & LIEUX
      { keywords: ['liberté', 'voler', 'envol', 'légèreté', 'avion', 'ailes'], icon: { name: 'airplane', family: 'MaterialCommunityIcons', color: '#06B6D4' } },
      { keywords: ['fuite', 'poursuite', 'courir', 'échapper', 'course'], icon: { name: 'run', family: 'MaterialCommunityIcons', color: '#F59E0B' } },
      { keywords: ['maison', 'foyer', 'famille', 'intérieur', 'domicile'], icon: { name: 'home', family: 'MaterialCommunityIcons', color: '#8B5CF6' } },
      { keywords: ['porte', 'seuil', 'passage'], icon: { name: 'door', family: 'MaterialCommunityIcons', color: '#6B7280' } },
      { keywords: ['lit', 'sommeil', 'dormir', 'repos'], icon: { name: 'bed', family: 'MaterialCommunityIcons', color: '#8B5CF6' } },
      { keywords: ['pensée', 'réflexion', 'méditation'], icon: { name: 'thought-bubble', family: 'MaterialCommunityIcons', color: '#9CA3AF' } },
      { keywords: ['force', 'puissance', 'muscle'], icon: { name: 'arm-flex', family: 'MaterialCommunityIcons', color: '#F59E0B' } },
    ];
    
    for (const item of iconMap) {
      if (item.keywords.some(kw => analysisText.includes(kw))) {
        return item.icon;
      }
    }
    
    // Défaut : icône de sommeil
    return { name: 'sleep', family: 'MaterialCommunityIcons', color: theme.colors.primary };
  };

  // ============================================
  // TITRE DYNAMIQUE (backend v2.3+)
  // ============================================
  const getDynamicTitle = () => {
    // 1. PRIORITÉ : Titre du backend (v2.3+)
    const backendTitle = dream.dreamTitle || dream.title;
    
    if (backendTitle && 
        backendTitle !== 'Mon rêve' && 
        backendTitle !== 'Rêve sans titre' &&
        !backendTitle.includes('Rêve du') &&
        !backendTitle.includes('Analyse de votre rêve') &&
        backendTitle.length > 3) {
      return backendTitle;
    }
    
    // 2. FALLBACK : Extraire depuis l'analyse
    const analysisText = typeof dream.analysis === 'string' 
      ? dream.analysis 
      : (dream.analysis?.fullAnalysis || dream.analysis?.shortSummary || '');
    
    // Chercher un titre dans les premiers 150 caractères
    const firstPart = analysisText.substring(0, 150);
    
    // Pattern: chercher "Rêve de X" ou phrase courte
    const titleMatch = firstPart.match(/##\s*🌙\s*(.+?)(?:\n|$)/);
    if (titleMatch && titleMatch[1].trim().length > 0 && titleMatch[1].trim().length < 60) {
      return titleMatch[1].trim();
    }
    
    // 3. Première phrase significative
    const sentences = analysisText.split(/[.!?\n]/).filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (firstSentence.length > 10 && firstSentence.length < 60) {
        return firstSentence;
      }
    }
    
    // 4. Transcription (première phrase)
    if (dream.transcription) {
      const transcriptSentences = dream.transcription.split(/[.!?]/).filter(s => s.trim().length > 10);
      if (transcriptSentences.length > 0) {
        const firstTranscript = transcriptSentences[0].trim();
        if (firstTranscript.length > 10 && firstTranscript.length < 60) {
          return firstTranscript;
        }
      }
    }
    
    return 'Rêve sans titre';
  };

  // ============================================
  // TAGS DYNAMIQUES (backend v2.3+)
  // ============================================
  const getDynamicTags = () => {
    // 1. PRIORITÉ : Tags du backend (v2.3+)
    if (dream.tags && Array.isArray(dream.tags) && dream.tags.length > 0) {
      const tagColors = {
        'cauchemar': '#EF4444',
        'lucide': '#8B5CF6',
        'récurrent': '#F59E0B',
        'transformation': theme.colors.softBrown,
        'eau': '#3B82F6',
        'vol': '#06B6D4',
        'chute': '#EF4444',
        'poursuite': '#F59E0B',
        'famille': '#EC4899',
        'travail': '#6B7280',
      };
      
      return dream.tags.map(tag => ({
        label: tag.charAt(0).toUpperCase() + tag.slice(1),
        color: tagColors[tag.toLowerCase()] || theme.colors.primary
      }));
    }
    
    // 2. FALLBACK : Générer localement
    const tags = [];
    const analysisText = (typeof dream.analysis === 'string' ? dream.analysis : (dream.analysis?.fullAnalysis || '')).toLowerCase();
    
    // Type d'analyse (toujours en premier)
    if (dream.modelUsed && dream.modelUsed.toLowerCase().includes('claude')) {
      tags.push({ label: 'DeepDream', color: '#8A2BE2' });
    } else if (dream.modelUsed && dream.modelUsed.toLowerCase().includes('llama')) {
      tags.push({ label: 'QuickDream', color: '#10B981' });
    } else if (dream.analysis) {
      tags.push({ label: 'Analysé', color: '#6B7280' });
    } else {
      tags.push({ label: 'Non analysé', color: '#64748B' });
    }
    
    // Émotion dominante
    const emotionMap = [
      { keywords: ['joie', 'bonheur', 'heureux'], label: 'Joie', color: theme.colors.warmGold },
      { keywords: ['peur', 'anxiété', 'angoisse'], label: 'Peur', color: '#EF4444' },
      { keywords: ['tristesse', 'mélancolie'], label: 'Tristesse', color: '#6B7280' },
      { keywords: ['colère', 'frustration'], label: 'Colère', color: '#F59E0B' },
    ];
    
    for (const emotion of emotionMap) {
      if (emotion.keywords.some(kw => analysisText.includes(kw)) && tags.length < 3) {
        tags.push({ label: emotion.label, color: emotion.color });
        break;
      }
    }
    
    // Thème principal
    const themeMap = [
      { keywords: ['liberté', 'voler', 'envol'], label: 'Liberté', color: theme.colors.primary },
      { keywords: ['eau', 'mer', 'océan'], label: 'Eau', color: '#3B82F6' },
      { keywords: ['transformation', 'changement'], label: 'Changement', color: theme.colors.softBrown },
    ];
    
    for (const themeEntry of themeMap) {
      if (themeEntry.keywords.some(kw => analysisText.includes(kw)) && tags.length < 3) {
        tags.push({ label: themeEntry.label, color: themeEntry.color });
        break;
      }
    }
    
    return tags;
  };

  // ============================================
  // RÉSUMÉ COURT (2 lignes max)
  // ============================================
  const getShortSummary = () => {
    // Convertir dream.analysis en string si c'est un objet
    const analysisText = typeof dream.analysis === 'string' 
      ? dream.analysis 
      : (dream.analysis?.fullAnalysis || dream.analysis?.shortSummary || '');
    
    if (analysisText && analysisText.length > 10) {
      // Nettoyer TOUS les emojis, markdown et titres H2/H3
      let cleaned = analysisText
        // Supprimer tous les emojis
        .replace(/[🌙📌📊🔗😊🧠💡✨⭐🌟💭🔥🌈🦋❤️😢😰😠😲🏃🏠🌊🐕🐶✈️🛫🐾]/g, '')
        // Supprimer les titres markdown H2/H3 complets
        .replace(/^##\s+.+?$/gm, '')
        .replace(/^###\s+.+?$/gm, '')
        // Supprimer les markdown restants
        .replace(/[*#]/g, '')
        .trim();
      
      // Filtrer les phrases génériques du début
      const genericPhrases = [
        'Analyse de votre rêve',
        'Découvrons ensemble',
        'Cette nuit',
        'Votre rêve',
        'Ce rêve'
      ];
      
      // Séparer en phrases
      const sentences = cleaned
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 15) // Phrases de minimum 15 caractères
        .filter(s => {
          // Éliminer les phrases génériques
          return !genericPhrases.some(phrase => 
            s.toLowerCase().includes(phrase.toLowerCase())
          );
        });
      
      // Prendre les 2 premières phrases SIGNIFICATIVES
      if (sentences.length > 0) {
        const firstTwo = sentences.slice(0, 2).join('. ').trim();
        
        if (firstTwo.length > 10) {
          return firstTwo.length > 120 ? firstTwo.substring(0, 120) + '...' : firstTwo + '.';
        }
      }
    }
    
    // Fallback: Transcription
    if (dream.transcription) {
      const text = dream.transcription.trim();
      return text.length > 120 ? text.substring(0, 120) + '...' : text;
    }
    
    return 'Aucune description disponible...';
  };

  // ============================================
  // RENDER
  // ============================================
  const icon = getIconFromBackend();
  const title = getDynamicTitle();
  const tags = getDynamicTags();
  const summary = getShortSummary();
  const time = formatTime();
  
  // Sélectionner le bon composant d'icône
  const IconComponent = icon.family === 'MaterialIcons' ? MaterialIcons : MaterialCommunityIcons;

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
          {/* 🔐 OVERLAY SECRET */}
          {dream.isSecret && !isUnlocked && (
            <View style={styles.secretOverlay}>
              <View style={styles.secretContent}>
                <MaterialCommunityIcons name="lock" size={40} color="#8B5CF6" />
                <Text style={styles.secretText}>Rêve protégé</Text>
                <Text style={styles.secretHint}>Appuyer pour déverrouiller</Text>
              </View>
            </View>
          )}

          {/* 🔑 Badge secret (si déverrouillé) */}
          {dream.isSecret && isUnlocked && (
            <View style={styles.secretBadge}>
              <MaterialCommunityIcons name="key-variant" size={16} color="#8B5CF6" />
            </View>
          )}

          {/* ✅ Checkbox mode sélection */}
          {isSelectionMode && (
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={onSelectionToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected
              ]}>
                {isSelected && (
                  <MaterialIcons name="check" size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Header: Tags à gauche + Heure + Menu à droite */}
          <View style={styles.topBar}>
            {/* Tags automatiques IA - Scroll horizontal */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tagsScrollContainer}
              contentContainerStyle={styles.tagsContainer}
            >
              {tags.map((tag, idx) => (
                <View 
                  key={idx}
                  style={[
                    styles.tag,
                    { backgroundColor: tag.color + '20' }
                  ]}
                >
                  <Text style={[styles.tagText, { color: tag.color }]}>
                    {tag.label}
                  </Text>
                </View>
              ))}
            </ScrollView>
            
            {/* Heure + Menu */}
            <View style={styles.timeMenuContainer}>
              <View style={styles.timeContainer}>
                <MaterialIcons name="schedule" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                  {time}
                </Text>
              </View>
              
              {/* ⋮ Bouton Menu (caché en mode sélection) */}
              {!isSelectionMode && (
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // 💡 Dismiss le hint si actif
                    if (showMenuHint && onMenuHintDismiss) {
                      onMenuHintDismiss();
                    }
                    setShowSecretModal(true);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {/* 💡 Cercle pulse derrière si hint actif */}
                  {showMenuHint && (
                    <Animated.View 
                      style={[
                        styles.menuHintPulse,
                        { transform: [{ scale: pulseAnim }] }
                      ]} 
                    />
                  )}
                  <MaterialCommunityIcons 
                    name="lock-outline" 
                    size={20} 
                    color={dream.isSecret ? '#8B5CF6' : theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Layout principal: Icône + Titre */}
          <View style={styles.mainRow}>
            <IconComponent name={icon.name} size={32} color={icon.color} />
            
            <Text 
              style={[styles.title, { color: theme.colors.primary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </View>

          {/* Résumé (2 lignes max) */}
          <Text 
            style={[styles.summary, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {summary}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ============================================ */}
      {/* MODAL DE PARTAGE */}
      {/* ============================================ */}
      <Modal
        visible={showShareModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowShareModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Partager ce rêve
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              Choisissez le format d'export
            </Text>
            
            {/* Option 1: Texte */}
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: theme.colors.backgroundElevated }]}
              onPress={() => {
                setShowShareModal(false);
                handleShare();
              }}
            >
              <View style={[styles.modalOptionIcon, { backgroundColor: '#FF9966' }]}>
                <MaterialIcons name="share" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.modalOptionText}>
                <Text style={[styles.modalOptionTitle, { color: theme.colors.textPrimary }]}>
                  Partager en texte
                </Text>
                <Text style={[styles.modalOptionDesc, { color: theme.colors.textSecondary }]}>
                  WhatsApp, SMS, Email...
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            {/* Option 2: PDF */}
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: theme.colors.backgroundElevated }]}
              onPress={handleExportPdf}
              disabled={isGeneratingPdf}
            >
              <View style={[styles.modalOptionIcon, { backgroundColor: '#EF4444' }]}>
                {isGeneratingPdf ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MaterialIcons name="picture-as-pdf" size={24} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.modalOptionText}>
                <Text style={[styles.modalOptionTitle, { color: theme.colors.textPrimary }]}>
                  {isGeneratingPdf ? 'Génération...' : 'Exporter en PDF'}
                </Text>
                <Text style={[styles.modalOptionDesc, { color: theme.colors.textSecondary }]}>
                  Format professionnel pour psy
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            {/* Bouton Annuler */}
            <TouchableOpacity
              style={[styles.modalCancel, { borderTopColor: theme.colors.cardBorder }]}
              onPress={() => setShowShareModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ============================================ */}
      {/* 🔐 MODAL SECRET */}
      {/* ============================================ */}
      <Modal
        visible={showSecretModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSecretModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSecretModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.secretModalHeader}>
              <MaterialCommunityIcons 
                name={dream.isSecret ? "lock-open-variant" : "lock"} 
                size={48} 
                color="#8B5CF6" 
              />
            </View>
            
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              {dream.isSecret ? 'Retirer le secret ?' : 'Protéger ce rêve ?'}
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              {dream.isSecret 
                ? 'Il sera de nouveau visible normalement.' 
                : 'Certains rêves sont trop personnels pour être affichés ou partagés. Marquez-les comme secrets et gardez la clé ! 🔑'}
            </Text>
            
            {!dream.isSecret && (
              <View style={styles.secretFeatures}>
                <View style={styles.secretFeature}>
                  <MaterialCommunityIcons name="eye-off" size={20} color="#8B5CF6" />
                  <Text style={[styles.secretFeatureText, { color: theme.colors.textSecondary }]}>
                    Contenu flouté dans la liste
                  </Text>
                </View>
                <View style={styles.secretFeature}>
                  <MaterialCommunityIcons name="gesture-tap" size={20} color="#8B5CF6" />
                  <Text style={[styles.secretFeatureText, { color: theme.colors.textSecondary }]}>
                    Appuyer pour déverrouiller temporairement
                  </Text>
                </View>
                <View style={styles.secretFeature}>
                  <MaterialCommunityIcons name="cog" size={20} color="#8B5CF6" />
                  <Text style={[styles.secretFeatureText, { color: theme.colors.textSecondary }]}>
                    Accès rapide dans Paramètres
                  </Text>
                </View>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.secretActionButton, { backgroundColor: '#8B5CF6' }]}
              onPress={handleToggleSecret}
            >
              <MaterialCommunityIcons 
                name={dream.isSecret ? "lock-open-variant" : "lock"} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.secretActionButtonText}>
                {dream.isSecret ? 'Retirer la protection' : 'Protéger ce rêve'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalCancel, { borderTopColor: theme.colors.cardBorder }]}
              onPress={() => setShowSecretModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ============================================ */}
      {/* 📦 MODAL PREMIÈRE ARCHIVAGE */}
      {/* ============================================ */}
      <Modal
        visible={showArchiveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowArchiveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.archiveModalHeader}>
              <MaterialIcons name="archive" size={48} color={theme.colors.warmGold || '#D2B14C'} />
            </View>
            
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              Rêve archivé !
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              Ce rêve sera déplacé dans tes archives. Tu pourras le retrouver dans l'onglet Archives accessible depuis les Paramètres.
            </Text>
            
            <View style={styles.archiveFeatures}>
              <View style={styles.archiveFeature}>
                <MaterialIcons name="folder" size={20} color={theme.colors.warmGold || '#D2B14C'} />
                <Text style={[styles.archiveFeatureText, { color: theme.colors.textSecondary }]}>
                  Accès : Paramètres → Archives
                </Text>
              </View>
              <View style={styles.archiveFeature}>
                <MaterialIcons name="restore" size={20} color={theme.colors.warmGold || '#D2B14C'} />
                <Text style={[styles.archiveFeatureText, { color: theme.colors.textSecondary }]}>
                  Tu peux restaurer à tout moment
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.archiveActionButton, { backgroundColor: theme.colors.warmGold || '#D2B14C' }]}
              onPress={handleConfirmArchive}
            >
              <MaterialIcons name="check" size={20} color="#0c0e27" />
              <Text style={styles.archiveActionButtonText}>Compris !</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalCancel, { borderTopColor: theme.colors.cardBorder }]}
              onPress={() => setShowArchiveModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.colors.textSecondary }]}>
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Swipeable>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 180,
    borderWidth: 1,
  },
  
  // Top bar (Tags + Heure)
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    height: 32, // Hauteur fixe pour éviter le décalage vertical
  },
  
  // Container du ScrollView (scroll horizontal)
  tagsScrollContainer: {
    flex: 1,
    marginRight: 8,
    maxHeight: 32, // Hauteur fixe
  },
  
  // Tags (contenu du scroll)
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8, // Padding pour le dernier tag
  },
  
  // Heure + Menu (groupés à droite)
  timeMenuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  menuButton: {
    padding: 4,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuHintPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  
  // Main row (Icône + Titre)
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  
  // Titre (à côté de l'icône)
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  
  // Résumé
  summary: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  // ============================================
  // SWIPE ACTIONS - Gmail Style
  // ============================================
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    marginBottom: 12,
    gap: 4,
  },
  archiveAction: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  shareAction: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  
  // ============================================
  // MODAL DE PARTAGE
  // ============================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalOptionDesc: {
    fontSize: 13,
  },
  modalCancel: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  // ============================================
  // 🔐 STYLES SECRETS
  // ============================================
  secretOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 14, 39, 0.95)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  secretContent: {
    alignItems: 'center',
    gap: 8,
  },
  secretText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
    marginTop: 8,
  },
  secretHint: {
    fontSize: 13,
    color: 'rgba(139, 92, 246, 0.7)',
  },
  secretBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 5,
  },
  checkboxContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#39FF88',
    borderColor: '#39FF88',
  },
  secretModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  secretFeatures: {
    width: '100%',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  secretFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secretFeatureText: {
    fontSize: 14,
    flex: 1,
  },
  secretActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    marginBottom: 8,
  },
  secretActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // 📦 MODAL ARCHIVAGE
  archiveModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  archiveFeatures: {
    width: '100%',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  archiveFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  archiveFeatureText: {
    fontSize: 14,
    flex: 1,
  },
  archiveActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    marginBottom: 8,
  },
  archiveActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c0e27',
  },
});
