import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Modal,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../config/ThemeContext';

const FINGERPRINTS_KEY = '@noctaliae_user_fingerprints';
const ONBOARDING_COMPLETED_KEY = '@noctaliae_onboarding_completed';

// ============================================
// 🧠 HELPER FUNCTION - TOP 0.1% APPROACH
// ============================================
/**
 * Vérifie si l'utilisateur a fourni des données valides
 * sur l'écran précédent (markers) OU l'écran actuel (tags/texte)
 * 
 * @param {Object|null|undefined} markers - Données de OnboardingMarkers
 * @param {Array} selectedTags - Tags sélectionnés sur cet écran
 * @param {string} customText - Texte libre sur cet écran
 * @returns {Object} { hasData: boolean, source: string, count: number }
 * 
 * EDGE CASES GÉRÉS :
 * - markers = null | undefined | {}
 * - markers.interests = null | undefined | []
 * - selectedTags = []
 * - customText = '' | '   ' (espaces)
 * 
 * SCALABILITÉ :
 * Pour ajouter un nouveau champ marker, ajouter dans markerFields array
 */
function hasValidUserData(markers, selectedTags, customText) {
  let dataCount = 0;
  let sources = [];
  
  // 🔍 1. Vérifier les markers de l'écran précédent
  if (markers && typeof markers === 'object') {
    // Champs simples (string)
    // 🧠 TOP 0.1% : "not_sure" compte aussi ! L'utilisateur a fait un choix conscient
    const markerFields = ['ageRange', 'rhythm', 'mood'];
    markerFields.forEach(field => {
      if (markers[field] && String(markers[field]).trim()) {
        dataCount++;
        // Note : on log si c'est "not_sure" pour tracer, mais ça compte quand même
        const value = markers[field];
        sources.push(value === 'not_sure' ? `${field}(« pas sûr »)` : field);
      }
    });
    
    // Champs array (interests)
    if (Array.isArray(markers.interests) && markers.interests.length > 0) {
      dataCount += markers.interests.length;
      sources.push('interests');
    }
  }
  
  // 🔍 2. Vérifier les tags de cet écran
  if (Array.isArray(selectedTags) && selectedTags.length > 0) {
    dataCount += selectedTags.length;
    sources.push('tags');
  }
  
  // 🔍 3. Vérifier le texte libre
  if (customText && String(customText).trim().length > 0) {
    dataCount++;
    sources.push('customText');
  }
  
  const result = {
    hasData: dataCount > 0,
    source: sources.join(', ') || 'none',
    count: dataCount
  };
  
  // 📊 Log pour debug (utile en dev)
  console.log('🔍 hasValidUserData:', result);
  
  return result;
}

export default function OnboardingFingerprints({ route, navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { markers } = route.params || {};

  const [selectedTags, setSelectedTags] = useState([]);
  const [customText, setCustomText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const suggestedTags = [
    '🎨 Créativité',
    '🎭 Culture',
    '😐 Stress',
    '😊 Joie',
    '🏃 Sport',
    '🎵 Musique',
    '📚 Lecture',
    '✈️ Voyage',
    '🐕 Animaux',
    '🧘 Méditation',
    '💻 Tech',
    '🌿 Nature'
  ];

  const handleToggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSkip = async () => {
    await completeOnboarding([]);
  };

  const handleFinish = async () => {
    // 🧠 TOP 0.1% : Vérifier TOUTES les sources de données (markers + tags + texte)
    const userData = hasValidUserData(markers, selectedTags, customText);
    
    if (!userData.hasData) {
      // ⚠️ Vraiment AUCUNE donnée nulle part → Afficher modal bienveillant
      console.log('⚠️ Aucune donnée utilisateur détectée, affichage modal');
      setShowConfirmModal(true);
      return;
    }
    
    // ✅ L'utilisateur a fourni des données → Sauvegarder directement
    console.log(`✅ Données trouvées (${userData.count} items de: ${userData.source})`);
    await saveFingerprints();
  };

  const saveFingerprints = async () => {
    setIsSaving(true);

    try {
      const fingerprints = [];

      // Ajouter les repères de l'écran précédent
      // 🧠 TOP 0.1% : On ignore les "not_sure" car ils n'apportent rien à l'analyse
      if (markers) {
        if (markers.ageRange && markers.ageRange !== 'not_sure') {
          fingerprints.push({
            id: `marker_age_${Date.now()}`,
            text: `Tranche d'âge : ${markers.ageRange}`,
            createdAt: new Date().toISOString(),
            source: 'onboarding'
          });
        }
        if (markers.rhythm && markers.rhythm !== 'not_sure') {
          fingerprints.push({
            id: `marker_rhythm_${Date.now()}`,
            text: `Rythme de vie : ${markers.rhythm}`,
            createdAt: new Date().toISOString(),
            source: 'onboarding'
          });
        }
        if (markers.mood && markers.mood !== 'not_sure') {
          fingerprints.push({
            id: `marker_mood_${Date.now()}`,
            text: `État d'esprit : ${markers.mood}`,
            createdAt: new Date().toISOString(),
            source: 'onboarding'
          });
        }
        if (markers.interests && markers.interests.length > 0) {
          fingerprints.push({
            id: `marker_interests_${Date.now()}`,
            text: `Centres d'intérêt : ${markers.interests.join(', ')}`,
            createdAt: new Date().toISOString(),
            source: 'onboarding'
          });
        }
      }

      // Ajouter les tags sélectionnés
      selectedTags.forEach((tag, index) => {
        fingerprints.push({
          id: `tag_${Date.now()}_${index}`,
          text: tag,
          createdAt: new Date().toISOString(),
          source: 'onboarding'
        });
      });

      // Ajouter le texte libre
      if (customText.trim()) {
        fingerprints.push({
          id: `custom_${Date.now()}`,
          text: customText.trim(),
          createdAt: new Date().toISOString(),
          source: 'onboarding'
        });
      }

      await completeOnboarding(fingerprints);
    } catch (error) {
      console.error('❌ Erreur sauvegarde empreintes:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder', [{ text: 'OK' }], { userInterfaceStyle: 'dark' });
      setIsSaving(false);
    }
  };

  const completeOnboarding = async (fingerprints) => {
    try {
      // Sauvegarder les empreintes
      await AsyncStorage.setItem(FINGERPRINTS_KEY, JSON.stringify(fingerprints));
      
      // Marquer l'onboarding comme complété
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      
      console.log(`✅ Onboarding terminé avec ${fingerprints.length} empreintes`);
      
      // Naviguer vers l'app principale
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('❌ Erreur finalisation onboarding:', error);
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 20 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
            Passer
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Vos empreintes
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Ajoutez ce qui vous définit (optionnel)
        </Text>

        {/* Tags suggérés */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            🏷️ Tags rapides
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Sélectionnez ce qui vous correspond
          </Text>
          <View style={styles.tagsContainer}>
            {suggestedTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  { 
                    backgroundColor: selectedTags.includes(tag)
                      ? theme.colors.primary
                      : theme.colors.cardBackground,
                    borderColor: selectedTags.includes(tag)
                      ? theme.colors.primary
                      : theme.colors.cardBorder
                  }
                ]}
                onPress={() => handleToggleTag(tag)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tagText, 
                  { 
                    color: selectedTags.includes(tag)
                      ? theme.colors.background
                      : theme.colors.text 
                  }
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Texte libre */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            ✍️ Texte libre
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Écrivez ce que vous voulez partager
          </Text>
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder,
                color: theme.colors.text
              }
            ]}
            placeholder="Ex: Je suis graphiste freelance, j'adore la montagne et j'ai un chien..."
            placeholderTextColor={theme.colors.textSecondary}
            value={customText}
            onChangeText={setCustomText}
            multiline
            maxLength={300}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
            {customText.length}/300
          </Text>
        </View>

        {/* Note */}
        <View style={[styles.noteContainer, { backgroundColor: theme.colors.primaryGlow }]}>
          <MaterialCommunityIcons name="lightbulb-on" size={20} color={theme.colors.primary} />
          <Text style={[styles.noteText, { color: theme.colors.text }]}>
            Plus vous ajoutez d'infos, plus les analyses seront personnalisées. Vous pourrez modifier tout ça plus tard dans Paramètres → Persona.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { 
        backgroundColor: theme.colors.background,
        paddingBottom: Math.max(insets.bottom, 20) + 20 
      }]}>
        <TouchableOpacity
          style={[styles.finishButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleFinish}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <Text style={[styles.finishButtonText, { color: theme.colors.background }]}>
              Enregistrement...
            </Text>
          ) : (
            <>
              <MaterialCommunityIcons 
                name="check" 
                size={24} 
                color={theme.colors.background} 
              />
              <Text style={[styles.finishButtonText, { color: theme.colors.background }]}>
                Terminer
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de confirmation personnalisé (thème sombre) */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Continuer sans empreintes ?
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              Pas de souci ! Vous pourrez toujours les ajouter plus tard dans Paramètres → Persona pour des analyses plus personnalisées.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.colors.cardBorder }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  setShowConfirmModal(false);
                  completeOnboarding([]);
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                  Terminer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
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
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  tagText: {
    fontSize: 15,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 200,
    lineHeight: 24,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  finishButton: {
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
  finishButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Modal de confirmation
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});