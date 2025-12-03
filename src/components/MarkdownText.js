import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../config/theme';

export function MarkdownText({ children, style }) {
  const renderLine = (line, index) => {
    // Ligne vide
    if (!line.trim()) {
      return <View key={index} style={{ height: 14 }} />;
    }

    // ✅ MASQUER LES METADATA
    const metadataKeywords = ['METADATA:', 'EMOJI:', 'TITLE:', 'TAGS:', 'SUGGESTED QUESTIONS:', 'STYLE:'];
    if (metadataKeywords.some(keyword => line.trim().toUpperCase().startsWith(keyword))) {
      return null; // Ne rien afficher
    }

    // 🏆 DÉTECTER LES QUESTIONS (ligne qui finit par "?")
    const trimmedLine = line.trim();
    if (trimmedLine.endsWith('?') && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('-') && !trimmedLine.startsWith('•')) {
      return (
        <Text key={index} style={[style, styles.question]}>
          {parseBoldAndQuestion(trimmedLine)}
        </Text>
      );
    }

    // Détecter les titres ###
    if (line.startsWith('### ')) {
      return (
        <Text key={index} style={[style, styles.subHeading]}>
          {parseBoldAndQuestion(line.substring(4))}
        </Text>
      );
    }
    
    // Détecter les titres ##
    if (line.startsWith('## ')) {
      return (
        <Text key={index} style={[style, styles.heading]}>
          {parseBoldAndQuestion(line.substring(3))}
        </Text>
      );
    }
    
    // Détecter les titres avec emojis en gras (ex: **🧠 Titre**)
    const emojiHeadingMatch = line.match(/^\*\*(.*?)\*\*/);
    if (emojiHeadingMatch) {
      return (
        <Text key={index} style={[style, styles.emojiHeading]}>
          {emojiHeadingMatch[1]}
        </Text>
      );
    }
    
    // Détecter les titres #
    if (line.startsWith('# ')) {
      return (
        <Text key={index} style={[style, styles.mainHeading]}>
          {parseBoldAndQuestion(line.substring(2))}
        </Text>
      );
    }

    // Détecter les listes à puces (avec * ou - ou •)
    if (line.trim().startsWith('*') || line.trim().startsWith('-') || line.trim().startsWith('•')) {
      // Extraire le texte après le marqueur (* ou - ou •)
      const bulletText = line.trim().substring(1).trim();
      
      // 🛡️ Ignorer les bullets vides ou avec seulement des tirets
      if (!bulletText || bulletText === '--' || bulletText === '-' || bulletText === '---') {
        return null;
      }
      
      return (
        <View key={index} style={styles.bulletContainer}>
          <Text style={[style, styles.bullet]}>•</Text>
          <Text style={[style, styles.bulletText]}>{parseBoldAndQuestion(bulletText)}</Text>
        </View>
      );
    }
    
    return (
      <Text key={index} style={[style, styles.normalText]}>
        {parseBoldAndQuestion(line)}
      </Text>
    );
  };
  
  // 🏆 Parser BOLD + Questions
  const parseBoldAndQuestion = (text) => {
    const parts = [];
    let currentIndex = 0;
    let key = 0;
    
    // Regex pour détecter **texte**
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Texte avant le gras
      if (match.index > currentIndex) {
        parts.push(
          <Text key={`text-${key++}`}>
            {text.substring(currentIndex, match.index)}
          </Text>
        );
      }
      
      // Texte en gras (vert si c'est une question)
      const isQuestion = text.trim().endsWith('?');
      parts.push(
        <Text key={`bold-${key++}`} style={isQuestion ? styles.boldQuestion : styles.bold}>
          {match[1]}
        </Text>
      );
      
      currentIndex = match.index + match[0].length;
    }
    
    // Reste du texte
    if (currentIndex < text.length) {
      parts.push(
        <Text key={`text-${key++}`}>
          {text.substring(currentIndex)}
        </Text>
      );
    }
    
    return parts.length > 0 ? parts : text;
  };

  if (!children) return null;
  
  const lines = children.split('\n');
  
  return (
    <View>
      {lines.map((line, index) => renderLine(line, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  boldQuestion: {
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  // 🏆 QUESTIONS (ligne qui finit par "?")
  question: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.primary,
    lineHeight: 26,
    marginVertical: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: THEME.colors.primaryGlow,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
    borderRadius: 8,
  },
  // 🏆 HEADINGS améliorés
  mainHeading: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
    color: THEME.colors.primary,
    lineHeight: 30,
    borderBottomWidth: 2,
    borderBottomColor: THEME.colors.primary,
    paddingBottom: 6,
  },
  heading: {
    fontSize: 19,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
    color: THEME.colors.textPrimary,
    lineHeight: 26,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
    paddingBottom: 4,
  },
  subHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
    color: THEME.colors.primary,
    lineHeight: 24,
  },
  emojiHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
    color: THEME.colors.primary,
    lineHeight: 26,
  },
  // 🏆 BULLETS améliorés
  bulletContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
  },
  bullet: {
    marginRight: 12,
    fontSize: 18,
    color: THEME.colors.primary,
    fontWeight: '700',
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: THEME.colors.textPrimary,
  },
  normalText: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 4,
    color: THEME.colors.textPrimary,
  },
});
