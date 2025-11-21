import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function OnboardingWelcome({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    navigation.navigate('OnboardingMarkers');
  };

  const handleSkip = () => {
    navigation.replace('MainTabs');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 20) + 20 }]}>
        {/* Logo / Icône */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryGlow }]}>
          <MaterialCommunityIcons 
            name="fingerprint" 
            size={80} 
            color={theme.colors.primary} 
          />
        </View>

        {/* Titre */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Bienvenue dans{'\n'}Noctaliæ
        </Text>

        {/* Sous-titre */}
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          L'analyse scientifique de vos rêves
        </Text>

        {/* Explication */}
        <View style={styles.explanationContainer}>
          <View style={styles.explanationRow}>
            <MaterialCommunityIcons 
              name="brain" 
              size={28} 
              color={theme.colors.primary} 
            />
            <View style={styles.explanationText}>
              <Text style={[styles.explanationTitle, { color: theme.colors.text }]}>
                Des empreintes personnelles
              </Text>
              <Text style={[styles.explanationDescription, { color: theme.colors.textSecondary }]}>
                Vos repères de vie aident l'IA à personnaliser les analyses de vos rêves
              </Text>
            </View>
          </View>

          <View style={styles.explanationRow}>
            <MaterialCommunityIcons 
              name="lightbulb-on" 
              size={28} 
              color={theme.colors.primary} 
            />
            <View style={styles.explanationText}>
              <Text style={[styles.explanationTitle, { color: theme.colors.text }]}>
                Analyses plus pertinentes
              </Text>
              <Text style={[styles.explanationDescription, { color: theme.colors.textSecondary }]}>
                Plus vous ajoutez d'empreintes, plus les interprétations sont précises
              </Text>
            </View>
          </View>

          <View style={styles.explanationRow}>
            <MaterialCommunityIcons 
              name="shield-check" 
              size={28} 
              color={theme.colors.primary} 
            />
            <View style={styles.explanationText}>
              <Text style={[styles.explanationTitle, { color: theme.colors.text }]}>
                Totalement privé
              </Text>
              <Text style={[styles.explanationDescription, { color: theme.colors.textSecondary }]}>
                Vos données restent uniquement sur votre appareil
              </Text>
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={[styles.noteContainer, { backgroundColor: theme.colors.primaryGlow }]}>
          <MaterialCommunityIcons name="information" size={20} color={theme.colors.primary} />
          <Text style={[styles.noteText, { color: theme.colors.text }]}>
            Cette configuration ne prend que 2 minutes{'\n'}
            et peut être modifiée à tout moment
          </Text>
        </View>
      </View>

      {/* Boutons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
            Passer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, { color: theme.colors.background }]}>
            Commencer
          </Text>
          <MaterialCommunityIcons 
            name="arrow-right" 
            size={24} 
            color={theme.colors.background} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 50,
  },
  explanationContainer: {
    width: '100%',
    gap: 24,
  },
  explanationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  explanationText: {
    flex: 1,
  },
  explanationTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  explanationDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 40,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 30,
    gap: 12,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
