import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';

export default function OnboardingMarkers({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedMarkers, setSelectedMarkers] = useState({
    ageRange: null,
    rhythm: null,
    mood: null,
    interests: []
  });

  const ageRanges = [
    { id: '18-25', label: '18-25 ans', emoji: '🌱' },
    { id: '26-35', label: '26-35 ans', emoji: '🌿' },
    { id: '36-50', label: '36-50 ans', emoji: '🌳' },
    { id: '50+', label: '50+ ans', emoji: '🌲' }
  ];

  const rhythms = [
    { id: 'calm', label: 'Calme', emoji: '🧘' },
    { id: 'balanced', label: 'Équilibré', emoji: '⚖️' },
    { id: 'dynamic', label: 'Dynamique', emoji: '⚡' },
    { id: 'intense', label: 'Intense', emoji: '🔥' }
  ];

  const moods = [
    { id: 'serene', label: 'Serein', emoji: '😌' },
    { id: 'curious', label: 'Curieux', emoji: '🤔' },
    { id: 'anxious', label: 'Anxieux', emoji: '😰' },
    { id: 'joyful', label: 'Joyeux', emoji: '😊' }
  ];

  const interests = [
    { id: 'creativity', label: 'Créativité', emoji: '🎨' },
    { id: 'nature', label: 'Nature', emoji: '🌿' },
    { id: 'tech', label: 'Tech', emoji: '💻' },
    { id: 'sport', label: 'Sport', emoji: '⚽' },
    { id: 'travel', label: 'Voyage', emoji: '✈️' },
    { id: 'reading', label: 'Lecture', emoji: '📚' }
  ];

  const handleSelectAge = (id) => {
    setSelectedMarkers({ ...selectedMarkers, ageRange: id });
  };

  const handleSelectRhythm = (id) => {
    setSelectedMarkers({ ...selectedMarkers, rhythm: id });
  };

  const handleSelectMood = (id) => {
    setSelectedMarkers({ ...selectedMarkers, mood: id });
  };

  const handleToggleInterest = (id) => {
    const current = selectedMarkers.interests;
    const updated = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    setSelectedMarkers({ ...selectedMarkers, interests: updated });
  };

  const handleNext = () => {
    // Passer les repères sélectionnés à l'écran suivant
    navigation.navigate('OnboardingFingerprints', { markers: selectedMarkers });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const canContinue = selectedMarkers.ageRange || selectedMarkers.rhythm || 
                      selectedMarkers.mood || selectedMarkers.interests.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 20 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.progressDot, { backgroundColor: theme.colors.textMuted }]} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Quelques repères
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Ces infos sont optionnelles mais améliorent les analyses
        </Text>

        {/* Tranche d'âge */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            🎂 Tranche d'âge
          </Text>
          <View style={styles.optionsGrid}>
            {ageRanges.map((age) => (
              <TouchableOpacity
                key={age.id}
                style={[
                  styles.optionCard,
                  { 
                    backgroundColor: selectedMarkers.ageRange === age.id 
                      ? theme.colors.primaryGlow 
                      : theme.colors.cardBackground,
                    borderColor: selectedMarkers.ageRange === age.id 
                      ? theme.colors.primary 
                      : theme.colors.cardBorder
                  }
                ]}
                onPress={() => handleSelectAge(age.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{age.emoji}</Text>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {age.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rythme de vie */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            ⏱️ Rythme de vie
          </Text>
          <View style={styles.optionsGrid}>
            {rhythms.map((rhythm) => (
              <TouchableOpacity
                key={rhythm.id}
                style={[
                  styles.optionCard,
                  { 
                    backgroundColor: selectedMarkers.rhythm === rhythm.id 
                      ? theme.colors.primaryGlow 
                      : theme.colors.cardBackground,
                    borderColor: selectedMarkers.rhythm === rhythm.id 
                      ? theme.colors.primary 
                      : theme.colors.cardBorder
                  }
                ]}
                onPress={() => handleSelectRhythm(rhythm.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{rhythm.emoji}</Text>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {rhythm.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* État d'esprit */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            💭 État d'esprit général
          </Text>
          <View style={styles.optionsGrid}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.optionCard,
                  { 
                    backgroundColor: selectedMarkers.mood === mood.id 
                      ? theme.colors.primaryGlow 
                      : theme.colors.cardBackground,
                    borderColor: selectedMarkers.mood === mood.id 
                      ? theme.colors.primary 
                      : theme.colors.cardBorder
                  }
                ]}
                onPress={() => handleSelectMood(mood.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{mood.emoji}</Text>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Centres d'intérêt */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            ❤️ Centres d'intérêt
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Sélectionnez-en plusieurs
          </Text>
          <View style={styles.optionsGrid}>
            {interests.map((interest) => (
              <TouchableOpacity
                key={interest.id}
                style={[
                  styles.optionCard,
                  { 
                    backgroundColor: selectedMarkers.interests.includes(interest.id)
                      ? theme.colors.primaryGlow 
                      : theme.colors.cardBackground,
                    borderColor: selectedMarkers.interests.includes(interest.id)
                      ? theme.colors.primary 
                      : theme.colors.cardBorder
                  }
                ]}
                onPress={() => handleToggleInterest(interest.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{interest.emoji}</Text>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {interest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { 
        backgroundColor: theme.colors.background,
        paddingBottom: Math.max(insets.bottom, 20) + 20 
      }]}>
        <TouchableOpacity
          style={[
            styles.nextButton, 
            { 
              backgroundColor: canContinue ? theme.colors.primary : theme.colors.textMuted,
              opacity: canContinue ? 1 : 0.5
            }
          ]}
          onPress={handleNext}
          disabled={!canContinue}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, { color: theme.colors.background }]}>
            {canContinue ? 'Continuer' : 'Sélectionnez au moins une option'}
          </Text>
          {canContinue && (
            <MaterialCommunityIcons 
              name="arrow-right" 
              size={24} 
              color={theme.colors.background} 
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  optionCard: {
    width: '47%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  optionEmoji: {
    fontSize: 32,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#9B59B6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});