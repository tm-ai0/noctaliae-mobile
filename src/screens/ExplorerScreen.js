/**
 * 🧭 ExplorerScreen - Mini-leçons interactives
 * Parcours éducatif style Kinnu avec cards
 * 
 * V2 : Fix swipe - navigation simple par boutons
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

// 🎨 Couleurs Noctaliæ
const COLORS = {
  primary: '#D2B14C',      // Or
  secondary: '#A0B4D4',    // Gris-Vert
  accent: '#00FFB0',       // Vert néon
  background: '#0D1B2A',   // Fond sombre
  card: '#1B2838',         // Card background
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
};

// 📚 Contenu du parcours
function getLessonCards(t) {
  return [
    {
      id: 1,
      type: 'intro',
      title: t('explorer.card1_title'),
      subtitle: t('explorer.card1_subtitle'),
      icon: 'brain',
      color: COLORS.primary,
    },
    {
      id: 2,
      type: 'question',
      question: t('explorer.card2_question'),
      answer: t('explorer.card2_answer'),
      detail: t('explorer.card2_detail'),
      icon: 'percent',
      color: COLORS.accent,
    },
    {
      id: 3,
      type: 'learn',
      title: t('explorer.card3_title'),
      content: t('explorer.card3_content'),
      highlight: t('explorer.card3_highlight'),
      icon: 'airplane',
      color: COLORS.primary,
    },
    {
      id: 4,
      type: 'examples',
      title: t('explorer.card4_title'),
      items: [
        { icon: 'run-fast', text: t('explorer.card4_item1') },
        { icon: 'school', text: t('explorer.card4_item2') },
        { icon: 'tooth', text: t('explorer.card4_item3') },
        { icon: 'account-group', text: t('explorer.card4_item4') },
        { icon: 'map-marker-question', text: t('explorer.card4_item5') },
      ],
      color: COLORS.secondary,
    },
    {
      id: 5,
      type: 'fact',
      title: t('explorer.card5_title'),
      content: t('explorer.card5_content'),
      explanation: t('explorer.card5_explanation'),
      icon: 'lightbulb-on',
      color: COLORS.accent,
    },
    {
      id: 6,
      type: 'takeaway',
      title: t('explorer.card6_title'),
      content: t('explorer.card6_content'),
      icon: 'shield-check',
      color: COLORS.primary,
    },
  ];
}

// 📊 Dots de progression
function ProgressDots({ current, total }) {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === current && styles.dotActive,
            index < current && styles.dotCompleted,
          ]}
        />
      ))}
    </View>
  );
}

// 🎯 Main Component
export default function ExplorerScreen({ navigation }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const lessonCards = getLessonCards(t);
  const currentCard = lessonCards[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === lessonCards.length - 1;

  const goNext = () => {
    if (!isLast) {
      setCurrentIndex(prev => prev + 1);
      setRevealed(false);
    }
  };

  const goPrev = () => {
    if (!isFirst) {
      setCurrentIndex(prev => prev - 1);
      setRevealed(false);
    }
  };

  const handleComplete = () => {
    navigation.goBack();
  };

  // 🃏 Rendu du contenu selon le type
  const renderCardContent = () => {
    switch (currentCard.type) {
      case 'intro':
        return (
          <>
            <MaterialCommunityIcons name={currentCard.icon} size={80} color={COLORS.background} />
            <Text style={styles.introTitle}>{currentCard.title}</Text>
            <Text style={styles.introSubtitle}>{currentCard.subtitle}</Text>
          </>
        );

      case 'question':
        return (
          <>
            <MaterialCommunityIcons name={currentCard.icon} size={60} color={COLORS.background} />
            <Text style={styles.questionText}>{currentCard.question}</Text>
            <TouchableOpacity 
              style={[styles.revealBox, revealed && styles.revealBoxRevealed]}
              onPress={() => setRevealed(true)}
              activeOpacity={0.8}
            >
              {revealed ? (
                <View>
                  <Text style={styles.answerText}>{currentCard.answer}</Text>
                  <Text style={styles.detailText}>{currentCard.detail}</Text>
                </View>
              ) : (
                <Text style={styles.tapToReveal}>{t('explorer.tapToReveal')}</Text>
              )}
            </TouchableOpacity>
          </>
        );

      case 'learn':
        return (
          <>
            <MaterialCommunityIcons name={currentCard.icon} size={60} color={COLORS.background} />
            <Text style={styles.learnTitle}>{currentCard.title}</Text>
            <Text style={styles.learnContent}>{currentCard.content}</Text>
            <View style={styles.highlightBox}>
              <Text style={styles.highlightText}>{currentCard.highlight}</Text>
            </View>
          </>
        );

      case 'examples':
        return (
          <>
            <Text style={styles.examplesTitle}>{currentCard.title}</Text>
            <View style={styles.examplesList}>
              {currentCard.items.map((item, index) => (
                <View key={index} style={styles.exampleItem}>
                  <MaterialCommunityIcons name={item.icon} size={24} color={COLORS.background} />
                  <Text style={styles.exampleText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </>
        );

      case 'fact':
        return (
          <>
            <MaterialCommunityIcons name={currentCard.icon} size={60} color={COLORS.background} />
            <Text style={styles.factTitle}>{currentCard.title}</Text>
            <Text style={styles.factContent}>{currentCard.content}</Text>
            <View style={styles.factExplanation}>
              <Text style={styles.factExplanationText}>{currentCard.explanation}</Text>
            </View>
          </>
        );

      case 'takeaway':
        return (
          <>
            <MaterialCommunityIcons name={currentCard.icon} size={80} color={COLORS.background} />
            <Text style={styles.takeawayTitle}>{currentCard.title}</Text>
            <Text style={styles.takeawayContent}>{currentCard.content}</Text>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <ProgressDots current={currentIndex} total={lessonCards.length} />
        <Text style={styles.counter}>{currentIndex + 1}/{lessonCards.length}</Text>
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={[currentCard.color, `${currentCard.color}99`]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.cardContent}
            showsVerticalScrollIndicator={false}
          >
            {renderCardContent()}
          </ScrollView>
        </LinearGradient>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        {/* Bouton Précédent */}
        <TouchableOpacity 
          style={[styles.navButton, isFirst && styles.navButtonDisabled]}
          onPress={goPrev}
          disabled={isFirst}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name="chevron-left" 
            size={32} 
            color={isFirst ? COLORS.textSecondary : COLORS.text} 
          />
        </TouchableOpacity>

        {/* Bouton Suivant ou Terminer */}
        {isLast ? (
          <TouchableOpacity 
            style={[styles.completeButton, { backgroundColor: currentCard.color }]}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>{t('explorer.finish')}</Text>
            <MaterialCommunityIcons name="check" size={24} color={COLORS.background} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.navButton}
            onPress={goNext}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chevron-right" size={32} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  counter: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  dotCompleted: {
    backgroundColor: COLORS.accent,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardContent: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Navigation
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 18,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: COLORS.background,
  },
  // Intro
  introTitle: {
    fontSize: 28,
    fontFamily: 'CormorantUpright-Bold',
    color: COLORS.background,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  introSubtitle: {
    fontSize: 16,
    color: COLORS.background,
    opacity: 0.8,
    textAlign: 'center',
  },
  // Question
  questionText: {
    fontSize: 20,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: COLORS.background,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  revealBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  revealBoxRevealed: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tapToReveal: {
    fontSize: 18,
    color: COLORS.background,
    opacity: 0.8,
  },
  answerText: {
    fontSize: 48,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: COLORS.background,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 14,
    color: COLORS.background,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 8,
  },
  // Learn
  learnTitle: {
    fontSize: 26,
    fontFamily: 'CormorantUpright-Bold',
    color: COLORS.background,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  learnContent: {
    fontSize: 17,
    color: COLORS.background,
    textAlign: 'center',
    lineHeight: 26,
  },
  highlightBox: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  highlightText: {
    fontSize: 15,
    color: COLORS.background,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Examples
  examplesTitle: {
    fontSize: 26,
    fontFamily: 'CormorantUpright-Bold',
    color: COLORS.background,
    marginBottom: 24,
  },
  examplesList: {
    width: '100%',
    gap: 10,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  exampleText: {
    fontSize: 15,
    color: COLORS.background,
    fontFamily: 'AtkinsonHyperlegibleNext-Medium',
  },
  // Fact
  factTitle: {
    fontSize: 26,
    fontFamily: 'CormorantUpright-Bold',
    color: COLORS.background,
    marginTop: 20,
    marginBottom: 16,
  },
  factContent: {
    fontSize: 17,
    color: COLORS.background,
    textAlign: 'center',
    lineHeight: 26,
  },
  factExplanation: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  factExplanationText: {
    fontSize: 15,
    color: COLORS.background,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    textAlign: 'center',
  },
  // Takeaway
  takeawayTitle: {
    fontSize: 30,
    fontFamily: 'CormorantUpright-Bold',
    color: COLORS.background,
    marginTop: 24,
    marginBottom: 16,
  },
  takeawayContent: {
    fontSize: 18,
    color: COLORS.background,
    textAlign: 'center',
    lineHeight: 28,
  },
});
