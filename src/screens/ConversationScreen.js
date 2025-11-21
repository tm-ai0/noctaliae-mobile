import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../config/theme';
import { MarkdownText } from '../components/MarkdownText';
import { analyzeDreamFromText } from '../services/apiService';
import { saveAnalysis } from '../services/storageService';
import { premiumService } from '../services/premiumService';
import DebugScreenLabel from '../components/DebugScreenLabel';

export default function ConversationScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { dreamId, dreamAnalysis, dreamTranscription, dreamTitle, dreamDate, modelUsed } = route.params;
  
  const [activeTab, setActiveTab] = useState('analysis');
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(dreamAnalysis);
  const [reanalyzeDropdownOpen, setReanalyzeDropdownOpen] = useState(false); // 🆕 Dropdown state

  const date = new Date(dreamDate);
  const formattedTime = date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const formattedDate = date.toLocaleDateString('fr-FR');

  async function reanalyzeWithModel(useClaude) {
    setReanalyzeDropdownOpen(false); // Fermer dropdown
    setIsReanalyzing(true);
    try {
      const result = await analyzeDreamFromText(dreamTranscription, useClaude);
      await saveAnalysis(dreamId, result.analysis, useClaude ? 'claude' : 'llama');
      setCurrentAnalysis(result.analysis);
      Alert.alert('✅', 'Analyse mise à jour', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
    } catch (error) {
      console.error('Erreur re-analyse:', error);
      Alert.alert('Erreur', error.message, [{text: 'OK'}], {userInterfaceStyle: 'dark'});
    } finally {
      setIsReanalyzing(false);
    }
  }

  const ContainerComponent = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const containerProps = Platform.OS === 'ios' 
    ? { behavior: 'padding', keyboardVerticalOffset: 0 } 
    : {};

  return (
    <ContainerComponent 
      style={[styles.container, { paddingTop: insets.top }]}
      {...containerProps}
    >
      <DebugScreenLabel screenName="💬 Conversation" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {dreamTitle}
          </Text>
          <Text style={styles.headerSubtitle}>
            {formattedDate} · {formattedTime}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('DeepChat', {
            dreamId,
            dreamAnalysis: currentAnalysis,
            dreamTranscription,
            dreamTitle,
            modelUsed
          })}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons name="chat-processing" size={24} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs - VRAIS ONGLETS */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'transcription' && styles.tabActive]}
            onPress={() => setActiveTab('transcription')}
          >
            <View style={[
              styles.tabContent,
              activeTab === 'transcription' && styles.tabContentActive
            ]}>
              <MaterialIcons 
                name="text-fields" 
                size={18} 
                color={activeTab === 'transcription' ? THEME.colors.primary : THEME.colors.textSecondary} 
              />
              <Text style={[
                styles.tabText, 
                activeTab === 'transcription' && styles.tabTextActive
              ]}>
                Transcription
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'analysis' && styles.tabActive]}
            onPress={() => setActiveTab('analysis')}
          >
            <View style={[
              styles.tabContent,
              activeTab === 'analysis' && styles.tabContentActive
            ]}>
              <MaterialCommunityIcons 
                name="brain" 
                size={18} 
                color={activeTab === 'analysis' ? THEME.colors.primary : THEME.colors.textSecondary} 
              />
              <Text style={[
                styles.tabText, 
                activeTab === 'analysis' && styles.tabTextActive
              ]}>
                Analyse
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tags + Boutons (seulement en mode Analyse) */}
      {activeTab === 'analysis' && (
        <View style={styles.metaSection}>
          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <MaterialIcons name="schedule" size={14} color={THEME.colors.textSecondary} />
              <Text style={styles.tagText}>{formattedTime}</Text>
            </View>
            <View style={styles.tag}>
              <MaterialIcons name="calendar-today" size={14} color={THEME.colors.textSecondary} />
              <Text style={styles.tagText}>{formattedDate}</Text>
            </View>
            <View style={styles.tag}>
              <MaterialIcons name="timer" size={14} color={THEME.colors.textSecondary} />
              <Text style={styles.tagText}>2m 30s</Text>
            </View>
          </View>

          {/* Boutons petits style DeepChat */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.smallButton, { borderColor: THEME.colors.primary }]}
              onPress={() => {
                navigation.navigate('DeepChat', {
                  dreamId,
                  dreamAnalysis: currentAnalysis,
                  dreamTranscription,
                  dreamTitle,
                  modelUsed
                });
              }}
            >
              <MaterialCommunityIcons name="chat-processing" size={16} color={THEME.colors.primary} />
              <Text style={[styles.smallButtonText, { color: THEME.colors.primary }]}>Approfondir</Text>
            </TouchableOpacity>

            {/* 🆕 DROPDOWN RE-ANALYSER */}
            <View style={{ flex: 1, position: 'relative' }}>
              <TouchableOpacity
                style={[styles.smallButton, { borderColor: THEME.colors.warmGold }]}
                onPress={() => setReanalyzeDropdownOpen(!reanalyzeDropdownOpen)}
                disabled={isReanalyzing}
              >
                {isReanalyzing ? (
                  <ActivityIndicator color={THEME.colors.warmGold} size="small" />
                ) : (
                  <>
                    <MaterialIcons name="refresh" size={16} color={THEME.colors.warmGold} />
                    <Text style={[styles.smallButtonText, { color: THEME.colors.warmGold }]}>Re-analyser</Text>
                    <MaterialIcons 
                      name={reanalyzeDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={16} 
                      color={THEME.colors.warmGold} 
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* Dropdown options */}
              {reanalyzeDropdownOpen && (
                <View style={styles.reanalyzeDropdown}>
                  <TouchableOpacity
                    style={styles.dropdownOption}
                    onPress={() => reanalyzeWithModel(true)}
                  >
                    <Text style={styles.dropdownOptionIcon}>⭐</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownOptionTitle}>DeepDream</Text>
                      <Text style={styles.dropdownOptionDesc}>Claude Sonnet 4.5</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dropdownOption, styles.dropdownOptionBorder]}
                    onPress={() => reanalyzeWithModel(false)}
                  >
                    <Text style={styles.dropdownOptionIcon}>⚡</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownOptionTitle}>QuickDream</Text>
                      <Text style={styles.dropdownOptionDesc}>Llama 3.3 70B</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'analysis' ? (
          currentAnalysis ? (
            <MarkdownText style={styles.analysisText}>
              {currentAnalysis}
            </MarkdownText>
          ) : (
            <Text style={styles.emptyText}>Aucune analyse disponible</Text>
          )
        ) : (
          dreamTranscription ? (
            <Text style={styles.transcriptionText}>
              {dreamTranscription}
            </Text>
          ) : (
            <Text style={styles.emptyText}>Aucune transcription disponible</Text>
          )
        )}
      </ScrollView>
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // ONGLETS
  tabsWrapper: {
    backgroundColor: THEME.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabContentActive: {
    borderBottomColor: THEME.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  tabTextActive: {
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  
  // META SECTION (TAGS + BOUTONS)
  metaSection: {
    backgroundColor: THEME.colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
    gap: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.backgroundElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // CONTENT
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 24,
    color: THEME.colors.textSecondary,
  },
  transcriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: THEME.colors.textSecondary,
  },
  emptyText: {
    fontSize: 15,
    color: THEME.colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },
  
  // 🆕 DROPDOWN RE-ANALYSER
  reanalyzeDropdown: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.backgroundElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.dividerStrong,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  dropdownOptionBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.colors.divider,
  },
  dropdownOptionIcon: {
    fontSize: 20,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  dropdownOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  dropdownOptionDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
});
