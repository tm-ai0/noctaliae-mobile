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
    interests: [],
    interestsSkipped: false  // 💡 Nouveau: "Plus tard" pour centres d'intérêt
  });

  // 🧠 TOP 0.1% UX : Options simples + lien "Je ne sais pas" en vert néon
  // PAS de "pas sûr" sur l'âge (trop personnel)
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
    setSelectedMarkers({ ...selectedMarkers, interests: updated, interestsSkipped: false });
  };

  // 💡 Toggle "Plus tard" pour centres d'intérêt
  const handleSkipInterests = () => {
    setSelectedMarkers({ 
      ...selectedMarkers, 
      interests: [],
      interestsSkipped: !selectedMarkers.interestsSkipped 
    });
  };

  const handleNext = () => {
    // Passer les repères sélectionnés à l'écran suivant
    navigation.navigate('OnboardingFingerprints', { markers: selectedMarkers });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const hasSelection = selectedMarkers.ageRange || selectedMarkers.rhythm || 
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
          Premiers pas
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Ces informations sont facultatives, sachez juste que plus approfondirez les analyses de vos reves et plus elles seront personnaliser.
        </Text>

        {/* Tranche d'âge - PAS de "je ne sais pas" ici */}
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
          <View style={[
            styles.optionsGrid,
            selectedMarkers.rhythm === 'not_sure' && styles.optionsGridFaded
          ]}>
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
                  },
                  selectedMarkers.rhythm === 'not_sure' && styles.optionCardFaded
                ]}
                onPress={() => handleSelectRhythm(rhythm.id)}
                activeOpacity={0.7}
                disabled={selectedMarkers.rhythm === 'not_sure'}
              >
                <Text style={styles.optionEmoji}>{rhythm.emoji}</Text>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {rhythm.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* 💡 Lien "Pas trop sûr" en vert néon - TOGGLE */}
          <TouchableOpacity 
            style={[
              styles.notSureLink,
              selectedMarkers.rhythm === 'not_sure' && styles.notSureLinkActive
            ]}
            onPress={() => handleSelectRhythm(selectedMarkers.rhythm === 'not_sure' ? null : 'not_sure')}
          >
            <Text style={[
              styles.notSureLinkText, 
              { color: selectedMarkers.rhythm === 'not_sure' ? theme.colors.background : theme.colors.primary },
              selectedMarkers.rhythm === 'not_sure' && { fontWeight: '700' }
            ]}>
              {selectedMarkers.rhythm === 'not_sure' ? '✓ Pas trop sûr' : 'Pas trop sûr'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* État d'esprit */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            💭 État d'esprit général
          </Text>
          <View style={[
            styles.optionsGrid,
            selectedMarkers.mood === 'not_sure' && styles.optionsGridFaded
          ]}>
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
                  },
                  selectedMarkers.mood === 'not_sure' && styles.optionCardFaded
                ]}
                onPress={() => handleSelectMood(mood.id)}
                activeOpacity={0.7}
                disabled={selectedMarkers.mood === 'not_sure'}
              >
                <Text style={styles.optionEmoji}>{mood.emoji}</Text>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* 💡 Lien "Pas trop sûr" en vert néon - TOGGLE */}
          <TouchableOpacity 
            style={[
              styles.notSureLink,
              selectedMarkers.mood === 'not_sure' && styles.notSureLinkActive
            ]}
            onPress={() => handleSelectMood(selectedMarkers.mood === 'not_sure' ? null : 'not_sure')}
          >
            <Text style={[
              styles.notSureLinkText, 
              { color: selectedMarkers.mood === 'not_sure' ? theme.colors.background : theme.colors.primary },
              selectedMarkers.mood === 'not_sure' && { fontWeight: '700' }
            ]}>
              {selectedMarkers.mood === 'not_sure' ? '✓ Pas trop sûr' : 'Pas trop sûr'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Centres d'intérêt */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            ❤️ Centres d'intérêt
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Sélectionnez-en plusieurs
          </Text>
          <View style={[
            styles.optionsGrid,
            selectedMarkers.interestsSkipped && styles.optionsGridFaded
          ]}>
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
                  },
                  selectedMarkers.interestsSkipped && styles.optionCardFaded
                ]}
                onPress={() => handleToggleInterest(interest.id)}
                activeOpacity={0.7}
                disabled={selectedMarkers.interestsSkipped}
              >
                <Text style={styles.optionEmoji}>{interest.emoji}</Text>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {interest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* 💡 Lien "Plus tard" en vert néon - TOGGLE comme "Pas trop sûr" */}
          <TouchableOpacity 
            style={[
              styles.notSureLink,
              selectedMarkers.interestsSkipped && styles.notSureLinkActive
            ]}
            onPress={handleSkipInterests}
          >
            <Text style={[
              styles.notSureLinkText, 
              { color: selectedMarkers.interestsSkipped ? theme.colors.background : theme.colors.primary },
              selectedMarkers.interestsSkipped && { fontWeight: '700' }
            ]}>
              {selectedMarkers.interestsSkipped ? '✓ Plus tard' : 'Plus tard'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { 
        backgroundColor: theme.colors.background,
        paddingBottom: Math.max(insets.bottom, 20) + 20 
      }]}>
        {/* Bouton principal */}
        <TouchableOpacity
          style={[
            styles.nextButton, 
            { backgroundColor: theme.colors.primary }
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, { color: theme.colors.background }]}>
            {hasSelection ? 'Continuer' : 'Passer cette étape'}
          </Text>
          <MaterialCommunityIcons 
            name="arrow-right" 
            size={24} 
            color={theme.colors.background} 
          />
        </TouchableOpacity>
        
        {/* Mention facultatif */}
        {!hasSelection && (
          <Text style={[styles.skipHint, { color: theme.colors.textSecondary }]}>
            Vous pourrez toujours compléter plus tard
          </Text>
        )}
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
  // 💡 Lien "Pas trop sûr" / "Plus tard" en vert néon
  notSureLink: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  notSureLinkActive: {
    backgroundColor: '#00FFB0', // Vert néon quand actif
  },
  notSureLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // 🕳️ Grisage des options quand "Pas trop sûr" est sélectionné
  optionsGridFaded: {
    opacity: 0.35,
  },
  optionCardFaded: {
    borderColor: 'transparent',
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
  skipHint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});