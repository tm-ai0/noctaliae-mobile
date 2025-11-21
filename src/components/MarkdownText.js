import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../config/theme';

export function MarkdownText({ children, style }) {
  const renderLine = (line, index) => {
    // Ligne vide
    if (!line.trim()) {
      return <View key={index} style={{ height: 14 }} />;
    }

    // Détecter les titres ###
    if (line.startsWith('### ')) {
      return (
        <Text key={index} style={[style, styles.subHeading]}>
          {parseBold(line.substring(4))}
        </Text>
      );
    }
    
    // Détecter les titres ##
    if (line.startsWith('## ')) {
      return (
        <Text key={index} style={[style, styles.heading]}>
          {parseBold(line.substring(3))}
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
          {parseBold(line.substring(2))}
        </Text>
      );
    }

    // Détecter les listes à puces
    if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
      const bulletText = line.trim().substring(1).trim();
      return (
        <View key={index} style={styles.bulletContainer}>
          <Text style={[style, styles.bullet]}>•</Text>
          <Text style={[style, styles.bulletText]}>{parseBold(bulletText)}</Text>
        </View>
      );
    }
    
    // Ligne normale
    return (
      <Text key={index} style={[style, styles.normalText]}>
        {parseBold(line)}
      </Text>
    );
  };
  
  const parseBold = (text) => {
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
      
      // Texte en gras
      parts.push(
        <Text key={`bold-${key++}`} style={styles.bold}>
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
  mainHeading: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
    color: THEME.colors.primary,
    lineHeight: 32,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 10,
    color: THEME.colors.textPrimary,
    lineHeight: 28,
  },
  subHeading: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: THEME.colors.textSecondary,
    lineHeight: 24,
  },
  emojiHeading: {
    fontSize: 19,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
    color: THEME.colors.primary,
    lineHeight: 26,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    paddingLeft: 8,
  },
  bullet: {
    marginRight: 10,
    fontSize: 17,
    color: THEME.colors.primary,
    fontWeight: '600',
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
