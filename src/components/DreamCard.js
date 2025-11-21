import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../config/ThemeContext';

/**
 * DreamCard - Carte de rêve avec analyse IA automatique
 * 
 * FEATURES:
 * - Emoji automatique basé sur analyse IA
 * - Titre extrait/généré depuis analyse
 * - Tags automatiques (type + émotions + thèmes)
 * - Layout A: Emoji + Date/Heure en haut à droite
 * - Résumé 2 lignes avec ellipse
 * 
 * @param {Object} dream - Objet rêve complet
 * @param {Function} onPress - Action au tap
 */
export default function DreamCard({ dream, onPress }) {
  const { theme } = useTheme();

  // ============================================
  // FORMATAGE DATE/HEURE
  // ============================================
  const formatDateTime = () => {
    const date = new Date(dream.date);
    
    const day = date.getDate();
    const monthNames = ['jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin', 
                        'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const month = monthNames[date.getMonth()];
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day} ${month} ${hours}:${minutes}`;
  };

  // ============================================
  // EMOJI AUTOMATIQUE
  // ============================================
  const getAutoEmoji = () => {
    // 1. Si emoji explicite dans l'analyse
    if (dream.analysis?.dreamEmoji) return dream.analysis.dreamEmoji;
    
    // 2. Analyser le texte de l'analyse
    const analysisText = (dream.analysis?.fullAnalysis || dream.analysis?.shortSummary || '').toLowerCase();
    
    // Patterns émotionnels
    const emojiMap = {
      '😊': ['joie', 'bonheur', 'heureux', 'content', 'sourire'],
      '😰': ['peur', 'anxiété', 'angoisse', 'stress', 'inquiétude', 'crainte'],
      '😢': ['tristesse', 'mélancolie', 'chagrin', 'deuil', 'perte'],
      '😠': ['colère', 'frustration', 'rage', 'irritation'],
      '😲': ['surprise', 'étonnement', 'choc', 'stupéfaction'],
      '🦋': ['liberté', 'voler', 'envol', 'légèreté', 'transformation'],
      '❤️': ['amour', 'affection', 'tendresse', 'passion'],
      '🌊': ['eau', 'océan', 'mer', 'noyade', 'vagues'],
      '🏃': ['fuite', 'poursuite', 'courir', 'échapper'],
      '🏠': ['maison', 'foyer', 'famille', 'intérieur'],
    };
    
    // Chercher la première correspondance
    for (const [emoji, keywords] of Object.entries(emojiMap)) {
      if (keywords.some(keyword => analysisText.includes(keyword))) {
        return emoji;
      }
    }
    
    return '💭'; // Défaut
  };

  // ============================================
  // TITRE AUTOMATIQUE
  // ============================================
  const getAutoTitle = () => {
    // 1. Si titre explicite non-générique
    if (dream.title && 
        dream.title !== 'Mon rêve' && 
        !dream.title.includes('Rêve du') &&
        dream.title.length > 3) {
      return dream.title;
    }
    
    // 2. Extraire depuis l'analyse IA
    const analysisText = dream.analysis?.fullAnalysis || dream.analysis?.shortSummary || '';
    
    // Chercher un titre dans les premiers 100 caractères
    const firstPart = analysisText.substring(0, 100);
    
    // Pattern: chercher "Rêve de X" ou phrase courte en début
    const titleMatch = firstPart.match(/^([^.!?]{10,50})[.!?]/);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    // 3. Générer depuis mots-clés
    const keywordMap = {
      'Vol': ['voler', 'envol', 'planer', 'volé'],
      'Chute': ['tomber', 'chute', 'précipice'],
      'Eau': ['mer', 'océan', 'piscine', 'nager', 'noyade'],
      'Poursuite': ['poursuivi', 'chassé', 'fuite', 'courir'],
      'Famille': ['mère', 'père', 'famille', 'parents'],
      'Maison': ['maison', 'appartement', 'domicile'],
      'Travail': ['bureau', 'collègue', 'patron', 'travail'],
    };
    
    const foundKeywords = [];
    const lowerText = analysisText.toLowerCase();
    
    for (const [keyword, patterns] of Object.entries(keywordMap)) {
      if (patterns.some(pattern => lowerText.includes(pattern))) {
        foundKeywords.push(keyword);
        if (foundKeywords.length >= 2) break;
      }
    }
    
    if (foundKeywords.length > 0) {
      return `Rêve de ${foundKeywords.join(' et ')}`;
    }
    
    return 'Rêve sans titre';
  };

  // ============================================
  // TAGS AUTOMATIQUES (MAX 3)
  // ============================================
  const getAutoTags = () => {
    const tags = [];
    const analysisText = (dream.analysis?.fullAnalysis || dream.analysis?.shortSummary || '').toLowerCase();
    
    // 1. TYPE D'ANALYSE (toujours en premier)
    if (dream.analysis) {
      if (dream.modelUsed === 'claude') {
        tags.push({ label: 'DeepDream', color: '#8A2BE2' }); // Violet premium
      } else {
        tags.push({ label: 'QuickDream', color: '#10B981' }); // Vert gratuit
      }
    } else {
      tags.push({ label: 'Non analysé', color: '#64748B' });
    }
    
    // 2. ÉMOTION DOMINANTE (1 seule)
    const emotionMap = [
      { keywords: ['joie', 'bonheur', 'heureux'], label: 'Joie', color: theme.colors.warmGold },
      { keywords: ['peur', 'anxiété', 'angoisse'], label: 'Peur', color: '#EF4444' },
      { keywords: ['tristesse', 'mélancolie'], label: 'Tristesse', color: '#6B7280' },
      { keywords: ['colère', 'frustration'], label: 'Colère', color: '#F59E0B' },
    ];
    
    for (const emotion of emotionMap) {
      if (emotion.keywords.some(kw => analysisText.includes(kw))) {
        tags.push({ label: emotion.label, color: emotion.color });
        break; // Une seule émotion
      }
    }
    
    // 3. THÈME PRINCIPAL (si place restante)
    if (tags.length < 3) {
      const themeMap = [
        { keywords: ['liberté', 'voler', 'envol'], label: 'Liberté', color: theme.colors.primary },
        { keywords: ['perte', 'chute', 'perdre'], label: 'Perte', color: theme.colors.grayGreen },
        { keywords: ['transformation', 'changement', 'métamorphose'], label: 'Changement', color: theme.colors.softBrown },
        { keywords: ['conflit', 'lutte', 'combat'], label: 'Conflit', color: '#DC2626' },
      ];
      
      for (const themeEntry of themeMap) {
        if (themeEntry.keywords.some(kw => analysisText.includes(kw))) {
          tags.push({ label: themeEntry.label, color: themeEntry.color });
          break;
        }
      }
    }
    
    return tags.slice(0, 3); // MAX 3 tags
  };

  // ============================================
  // RÉSUMÉ COURT (2 lignes max)
  // ============================================
  const getShortSummary = () => {
    // Priorité 1: shortSummary
    if (dream.analysis?.shortSummary) {
      const text = dream.analysis.shortSummary;
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }
    
    // Priorité 2: Début de fullAnalysis
    if (dream.analysis?.fullAnalysis) {
      const text = dream.analysis.fullAnalysis;
      // Prendre 2 premières phrases
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const firstTwo = sentences.slice(0, 2).join('. ') + '.';
      return firstTwo.length > 100 ? firstTwo.substring(0, 100) + '...' : firstTwo;
    }
    
    // Priorité 3: Transcription
    if (dream.transcription) {
      const text = dream.transcription;
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }
    
    return 'Aucune description disponible...';
  };

  // ============================================
  // RENDER
  // ============================================
  const emoji = getAutoEmoji();
  const title = getAutoTitle();
  const tags = getAutoTags();
  const summary = getShortSummary();
  const dateTime = formatDateTime();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.cardBorder,
        },
        theme.shadow.md
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header: Emoji + Date/Heure (Layout A) */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.dateTime, { color: theme.colors.textSecondary }]}>
          {dateTime}
        </Text>
      </View>

      {/* Tags automatiques IA */}
      <View style={styles.tagsContainer}>
        {tags.map((tag, idx) => (
          <View 
            key={idx}
            style={[
              styles.tag,
              { backgroundColor: tag.color + '20' } // Opacity 12%
            ]}
          >
            <Text style={[styles.tagText, { color: tag.color }]}>
              {tag.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Titre automatique IA */}
      <Text 
        style={[styles.title, { color: theme.colors.textPrimary }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>

      {/* Résumé (2 lignes max) */}
      <Text 
        style={[styles.summary, { color: theme.colors.textSecondary }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {summary}
      </Text>
    </TouchableOpacity>
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
  
  // Header (Emoji + Date/Heure)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 36,
    lineHeight: 36,
  },
  dateTime: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
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
  
  // Titre
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 24,
  },
  
  // Résumé
  summary: {
    fontSize: 14,
    lineHeight: 20,
  },
});
