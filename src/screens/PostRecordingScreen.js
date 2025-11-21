import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyzeDreamFromText } from '../services/apiService';
import { saveAnalysis } from '../services/storageService';
import { securityService } from '../services/securityService';
import * as FileSystem from 'expo-file-system/legacy';
import { THEME } from '../config/theme';
import DebugScreenLabel from '../components/DebugScreenLabel';
import RateLimitBanner from '../components/RateLimitBanner';
import RateLimitModal from '../modals/RateLimitModal';

export default function PostRecordingScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { dreamId, audioUri, transcription, duration } = route.params;
  
  const [selectedModel, setSelectedModel] = useState('llama'); // 'claude' ou 'llama'
  const [activeTab, setActiveTab] = useState('choice'); // 'choice' ou 'transcript'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null); // 🔒 Info sur la limite
  const [showRateLimitModal, setShowRateLimitModal] = useState(false); // 🆕 Modal rate limit

  async function handleAnalyze() {
    if (!transcription || transcription.trim().length === 0) {
      Alert.alert('Erreur', 'La transcription est vide. Impossible d\'analyser.');
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log(`🧠 Analyse avec ${selectedModel === 'claude' ? 'Claude (Mode Profond)' : 'Llama (Mode Léger)'}...`);
      
      // Appel API
      const result = await analyzeDreamFromText(transcription, selectedModel === 'claude');
      
      // 🔒 Vérifier si limite atteinte
      if (result.limitInfo) {
        setLimitInfo(result.limitInfo);
        // Afficher la modal si limite atteinte
        if (result.limitInfo.limited && selectedModel === 'claude') {
          console.log('⏰ Limite atteinte - Affichage modal');
          setShowRateLimitModal(true);
          setSelectedModel('llama'); // Forcer passage mode gratuit
          return; // Ne pas continuer l'analyse
        }
      }
      
      // Sauvegarder l'analyse
      await saveAnalysis(dreamId, result.analysis, result.model || selectedModel);
      
      console.log('✅ Analyse sauvegardée');
      
      // Navigation directe vers l'analyse
      navigation.navigate('Conversation', {
        dreamId: dreamId,
        dreamAnalysis: result.analysis,
        dreamTranscription: transcription,
        dreamTitle: `Rêve du ${new Date().toLocaleDateString('fr-FR')}`,
        dreamDate: new Date().toISOString()
      });

      // 🔒 Supprimer l'audio si l'option est désactivée
      await securityService.deleteAudioIfNeeded(audioUri, FileSystem);
    } catch (error) {
      console.error('❌ Erreur analyse:', error);
      Alert.alert('Erreur', error.message || 'Impossible d\'analyser le rêve');
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <DebugScreenLabel screenName="📝 Post-Enregistrement" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analyse du rêve</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'choice' && styles.tabActive]}
          onPress={() => setActiveTab('choice')}
        >
          <MaterialCommunityIcons 
            name="brain" 
            size={20} 
            color={activeTab === 'choice' ? '#0c0e27' : THEME.colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'choice' && styles.tabTextActive]}>
            Analyse
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'transcript' && styles.tabActive]}
          onPress={() => setActiveTab('transcript')}
        >
          <MaterialIcons 
            name="text-fields" 
            size={20} 
            color={activeTab === 'transcript' ? '#0c0e27' : THEME.colors.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'transcript' && styles.tabTextActive]}>
            Transcript
          </Text>
        </TouchableOpacity>
      </View>

      {/* Banner Rate Limiting */}
      {limitInfo && limitInfo.limited && (
        <RateLimitBanner 
          limitInfo={limitInfo} 
          onDismiss={() => setLimitInfo(null)}
        />
      )}

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'choice' ? (
          <>
            {/* Info durée */}
            <View style={styles.durationBox}>
              <MaterialIcons name="timer" size={20} color={THEME.colors.textSecondary} />
              <Text style={styles.durationText}>
                Durée : {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Choisissez le modèle d'analyse</Text>

            {/* Modèle Profond (Claude) */}
            <TouchableOpacity 
              style={[styles.modelCard, selectedModel === 'claude' && styles.modelCardSelected]}
              onPress={() => setSelectedModel('claude')}
              activeOpacity={0.7}
            >
              <View style={styles.modelHeader}>
                <View style={styles.modelTitleRow}>
                  <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
                  <Text style={styles.modelTitle}>DeepDream</Text>
                </View>
                {selectedModel === 'claude' && (
                  <MaterialIcons name="check-circle" size={24} color={THEME.colors.primary} />
                )}
              </View>
              
              <Text style={styles.modelSubtitle}>Claude Sonnet 4.5</Text>
              
              <Text style={styles.modelDescription}>
                • Analyse neuroscientifique approfondie{'\n'}
                • 6 grilles scientifiques (Hobson, Domhoff, etc.){'\n'}
                • Réponses détaillées et personnalisées{'\n'}
                • Accessible avec votre soutien
              </Text>
              
              <View style={styles.modelBadge}>
                <Text style={styles.modelBadgeText}>🌕 Recommandé</Text>
              </View>
            </TouchableOpacity>

            {/* Modèle Léger (Llama) */}
            <TouchableOpacity 
              style={[styles.modelCard, selectedModel === 'llama' && styles.modelCardSelected]}
              onPress={() => setSelectedModel('llama')}
              activeOpacity={0.7}
            >
              <View style={styles.modelHeader}>
                <View style={styles.modelTitleRow}>
                  <MaterialCommunityIcons name="brain" size={24} color="#4A9EFF" />
                  <Text style={styles.modelTitle}>QuickDream</Text>
                </View>
                {selectedModel === 'llama' && (
                  <MaterialIcons name="check-circle" size={24} color={THEME.colors.primary} />
                )}
              </View>
              
              <Text style={styles.modelSubtitle}>Llama 3.3 70B</Text>
              
              <Text style={styles.modelDescription}>
                • Analyse scientifique standard{'\n'}
                • Réponses concises{'\n'}
                • Gratuit et illimité
              </Text>
            </TouchableOpacity>

            {/* Bouton Analyser */}
            <TouchableOpacity 
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
              onPress={handleAnalyze}
              disabled={isAnalyzing}
              activeOpacity={0.8}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="#0c0e27" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="brain" size={24} color="#0c0e27" />
                  <Text style={styles.analyzeButtonText}>Analyser le rêve</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          // Tab Transcript
          <View style={styles.transcriptContainer}>
            <View style={styles.transcriptHeader}>
              <MaterialIcons name="text-fields" size={24} color={THEME.colors.primary} />
              <Text style={styles.transcriptTitle}>Transcription complète</Text>
            </View>
            
            <View style={styles.transcriptBox}>
              <ScrollView>
                <Text style={styles.transcriptText}>{transcription}</Text>
              </ScrollView>
            </View>
            
            <Text style={styles.transcriptNote}>
              💡 Vérifiez que la transcription est correcte avant d'analyser
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 🆕 Modal Rate Limit */}
      <RateLimitModal
        visible={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        minutesLeft={limitInfo?.resetIn || 60}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: THEME.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  tabTextActive: {
    color: '#0c0e27', // Dark mauve au lieu de blanc
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    gap: 10,
  },
  durationText: {
    fontSize: 14,
    color: THEME.colors.text,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: 20,
  },
  modelCard: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modelCardSelected: {
    borderColor: THEME.colors.primary,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  modelSubtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 15,
  },
  modelDescription: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  modelBadge: {
    backgroundColor: '#2C1B47',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  modelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  analyzeButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 30,
    gap: 10,
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  analyzeButtonDisabled: {
    backgroundColor: THEME.colors.textSecondary,
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0c0e27', // Dark mauve au lieu de blanc
  },
  transcriptContainer: {
    flex: 1,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  transcriptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  transcriptBox: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    minHeight: 300,
    marginBottom: 20,
  },
  transcriptText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 26,
  },
  transcriptNote: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
