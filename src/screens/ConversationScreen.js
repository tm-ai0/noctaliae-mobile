import React, { useState, useEffect } from 'react';
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
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../config/theme';
import { MarkdownText } from '../components/MarkdownText';
import { analyzeDreamFromText } from '../services/apiService';
import { saveAnalysis, deleteDream } from '../services/storageService';
import { premiumService } from '../services/premiumService';
import { ActivateDeepDreamModal } from '../modals/ActivateDeepDreamModal';
import DebugScreenLabel from '../components/DebugScreenLabel';

export default function ConversationScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { dreamId, dreamAnalysis, dreamTranscription, dreamTitle, dreamDate, modelUsed, dreamTags } = route.params;
  
  const [activeTab, setActiveTab] = useState('analysis');
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(dreamAnalysis);
  const [reanalyzeDropdownOpen, setReanalyzeDropdownOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);

  // 🔄 Charger le statut Premium au montage
  useEffect(() => {
    const loadPremiumStatus = async () => {
      const status = await premiumService.isPremium();
      setIsPremium(status);
    };
    loadPremiumStatus();
  }, []);

  const date = new Date(dreamDate);
  const formattedTime = date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const formattedDate = date.toLocaleDateString('fr-FR');

  // 🆕 Vérifier Premium avant de re-analyser avec Claude
  async function handleSelectReanalyzeModel(useClaude) {
    if (useClaude && !isPremium) {
      setReanalyzeDropdownOpen(false);
      setShowActivateModal(true);
      return;
    }
    reanalyzeWithModel(useClaude);
  }

  // 🆕 Activer DeepDream depuis le modal
  async function handleActivateDeepDream() {
    await premiumService.setPremium(true);
    setIsPremium(true);
    setShowActivateModal(false);
    reanalyzeWithModel(true);
  }

  async function reanalyzeWithModel(useClaude) {
    setReanalyzeDropdownOpen(false);
    setIsReanalyzing(true);
    try {
      const result = await analyzeDreamFromText(dreamTranscription, useClaude);
      await saveAnalysis(dreamId, result.analysis, useClaude ? 'claude' : 'llama');
      setCurrentAnalysis(result.analysis);
      Alert.alert('✅', 'Analyse mise à jour', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
    } catch (error) {
      console.error('❌ Erreur re-analyse:', error);
      Alert.alert('❌ Erreur', 'Impossible de re-analyser le rêve. Veuillez réessayer.', [{text: 'OK'}], {userInterfaceStyle: 'dark'})
    } finally {
      setIsReanalyzing(false);
    }
  }

  // ============================================
  // EXPORT PDF PRO
  // ============================================
  const generatePdfHtml = () => {
    // Type d'analyse
    let analysisType = 'Non analysé';
    let analysisColor = '#64748B';
    if (modelUsed) {
      if (modelUsed.toLowerCase().includes('claude')) {
        analysisType = 'DeepDream (Claude Sonnet 4.5)';
        analysisColor = '#8A2BE2';
      } else if (modelUsed.toLowerCase().includes('llama')) {
        analysisType = 'QuickDream (Llama 3.3 70B)';
        analysisColor = '#10B981';
      }
    }
    
    // Transcription
    const transcription = dreamTranscription?.trim() || 'Récit non disponible';
    
    // Analyse (convertir markdown en HTML)
    let analysisText = currentAnalysis || 'Analyse non disponible';
    analysisText = analysisText
      .replace(/### (.*)/g, '<h4>$1</h4>')
      .replace(/## (.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/---/g, '<hr/>')
      .replace(/\n/g, '<br/>');
    
    // Tags
    let tagsHtml = '';
    if (dreamTags && Array.isArray(dreamTags) && dreamTags.length > 0) {
      tagsHtml = `
        <div class="section">
          <h2>🏷️ Thèmes détectés</h2>
          <div class="tags">
            ${dreamTags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
      `;
    }
    
    // Questions de réflexion
    const reflectionQuestions = [
      'Quelle émotion ce rêve a-t-il suscité au réveil ?',
      'Y a-t-il un lien avec des événements récents de votre vie ?',
      'Ce thème revient-il souvent dans vos rêves ?',
      'Qu\'aimeriez-vous explorer davantage ?'
    ];
    const reflectionHtml = reflectionQuestions.map(q => 
      `<div class="reflection-item">• ${q}</div>`
    ).join('');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rapport de rêve - Noctaliæ</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0c0e27;
            color: #FFFFFF;
            padding: 40px;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #0f1130;
            border-radius: 20px;
            padding: 40px;
            border: 1px solid #1a1f3a;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #D2B14C;
          }
          .logo {
            font-size: 32px;
            font-weight: 700;
            color: #D2B14C;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #00FFB0;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #A0B4D4;
            font-size: 14px;
          }
          .meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 15px;
            background: #1a1f3a;
            border-radius: 12px;
          }
          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .meta-label { color: #A0B4D4; font-size: 12px; }
          .meta-value { color: #FFFFFF; font-weight: 600; }
          .analysis-badge {
            background: ${analysisColor};
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #D2B14C;
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .section-content {
            background: #1a1f3a;
            padding: 20px;
            border-radius: 12px;
            color: #E0E0E0;
          }
          .section-content h3 { color: #D2B14C; margin: 15px 0 10px 0; font-size: 16px; }
          .section-content h4 { color: #A0B4D4; margin: 12px 0 8px 0; font-size: 14px; }
          .section-content hr { border: none; border-top: 1px solid #2a2f4a; margin: 15px 0; }
          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .tag {
            background: #D2B14C20;
            color: #D2B14C;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
          }
          /* Réflexion */
          .reflection-container { background: #1a1f3a; padding: 20px; border-radius: 12px; }
          .reflection-item { color: #A0B4D4; margin-bottom: 12px; font-size: 14px; }
          
          /* Notes */
          .notes-container { background: #1a1f3a; padding: 20px; border-radius: 12px; min-height: 120px; }
          .notes-line { border-bottom: 1px dashed #2a2f4a; height: 28px; }
          
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #1a1f3a;
            color: #A0B4D4;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌙 Noctaliæ</div>
            <div class="title">${dreamTitle}</div>
            <div class="subtitle">Rapport de rêve</div>
          </div>
          
          <div class="meta">
            <div class="meta-item">
              <span class="meta-label">📅 Date</span>
              <span class="meta-value">${formattedDate} à ${formattedTime}</span>
            </div>
            <div class="meta-item">
              <span class="analysis-badge">${analysisType}</span>
            </div>
          </div>
          
          <div class="section">
            <h2>📝 Récit du rêve</h2>
            <div class="section-content">
              ${transcription}
            </div>
          </div>
          
          <div class="section">
            <h2>🧠 Analyse scientifique</h2>
            <div class="section-content">
              ${analysisText}
            </div>
          </div>
          
          ${tagsHtml}
          
          <div class="section">
            <h2>🔮 Questions de réflexion</h2>
            <div class="reflection-container">${reflectionHtml}</div>
          </div>
          
        
          <div class="footer">
            Analysé avec <strong>Noctaliæ</strong> • Science du rêve<br/>
            <small>Ce rapport peut être partagé avec un professionnel de santé</small>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const html = generatePdfHtml();
      
      // Générer le PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });
      
      // Partager le PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Rapport: ${dreamTitle}`,
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
      Alert.alert('❌ Erreur', 'Impossible de générer le PDF', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ============================================
  // 🗑️ SUPPRIMER LE RÊVE
  // ============================================
  const handleDelete = () => {
    Alert.alert(
      '🗑️ Supprimer ce rêve ?',
      'Cette action est irréversible. Le rêve et son analyse seront définitivement supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDream(dreamId);
              // 🔧 FIX Android: Reset navigation stack pour éviter retour sur écran vide
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            } catch (error) {
              console.error('❌ Erreur suppression:', error);
              Alert.alert('❌ Erreur', 'Impossible de supprimer le rêve', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
            }
          }
        }
      ],
      { userInterfaceStyle: 'dark' }
    );
  };

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
      
      {/* Header minimaliste */}
      <View style={styles.header}>
       <TouchableOpacity 
          onPress={() => {
            // 🔧 FIX: Retour direct vers Analyses (pas PostRecordingScreen)
            navigation.navigate('MainTabs', { screen: 'Analysis' });
          }}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        
        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          onPress={handleExportPdf}
          style={styles.iconButton}
          disabled={isExportingPdf}
        >
          {isExportingPdf ? (
            <ActivityIndicator size="small" color={THEME.colors.warmGold} />
          ) : (
            <MaterialIcons name="picture-as-pdf" size={24} color={THEME.colors.warmGold} />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleDelete}
          style={styles.iconButton}
        >
          <MaterialIcons name="delete-outline" size={24} color={THEME.colors.error || '#EF4444'} />
        </TouchableOpacity>
      </View>

      {/* 🎆 HERO SECTION */}
      <View style={styles.heroSection}>
        {/* Titre LARGE */}
        <Text style={styles.heroTitle} numberOfLines={5}>
          {dreamTitle}
        </Text>
        
        {/* Meta inline élégante */}
        <View style={styles.metaInline}>
          <Text style={styles.metaText}>{formattedDate}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{formattedTime}</Text>
        </View>
        
        {/* Tags scrollables */}
        {dreamTags && dreamTags.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.heroTags}
          >
            {dreamTags.map((tag, index) => {
              const tagColor = THEME.colors.coolGrayGreen; // #A0B4D4
              
              return (
                <View 
                  key={index}
                  style={[styles.heroTag, { backgroundColor: tagColor + '20', borderColor: tagColor }]}
                >
                  <Text style={[styles.heroTagText, { color: tagColor }]}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Tabs - VRAIS ONGLETS */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={styles.tab}
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
            style={styles.tab}
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

      {/* Boutons uniquement (seulement en mode Analyse) */}
      {activeTab === 'analysis' && (
        <View style={styles.actionsSection}>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.smallButton, { borderColor: THEME.colors.primary }]}
              onPress={() => {
  navigation.navigate('DeepChat', {
    dreamId,
    dreamAnalysis: currentAnalysis,
    dreamTranscription,
    dreamTitle,
    modelUsed,
    suggestedQuestions: route.params.suggestedQuestions
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
                    onPress={() => handleSelectReanalyzeModel(true)}
                  >
                    <MaterialCommunityIcons name="electron-framework" size={24} color="#4F8DFF" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownOptionTitle}>DeepDream</Text>
                      <Text style={styles.dropdownOptionDesc}>Claude Sonnet 4.5</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dropdownOption, styles.dropdownOptionBorder]}
                    onPress={() => handleSelectReanalyzeModel(false)}
                  >
                    <MaterialCommunityIcons name="flash" size={24} color="#00FFB0" />
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

      {/* Content avec fond bleu (pareil pour les 2 onglets) */}
      <ScrollView 
        style={[
          styles.content,
          { backgroundColor: THEME.colors.cardBackground }
        ]}
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
      
      {/* 🆕 Modal Activer DeepDream */}
      <ActivateDeepDreamModal
        visible={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onActivate={handleActivateDeepDream}
      />
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 🎆 HERO SECTION
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder + '30',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.colors.primary, // ✅ Vert néon
    lineHeight: 30,
    marginBottom: 12,
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 13,
    color: THEME.colors.textTertiary,
    marginHorizontal: 8,
  },
  heroTags: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    opacity: 0.6,
    gap: 4,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  
  // ONGLETS
  tabsWrapper: {
    backgroundColor: THEME.colors.background,
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
    borderBottomColor: THEME.colors.primary, // ✅ Ligne verte en bas
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  tabTextActive: {
    color: THEME.colors.primary, // ✅ Vert néon #00FFB0
    fontWeight: '600',
  },
  
  // ACTIONS SECTION (sous les tabs)
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
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
    paddingBottom: 160, // 🔧 FIX: Espace suffisant pour nav Android (augmenté)
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
    borderColor: THEME.colors.divider,
  },
  dropdownOptionIcon: {
    fontSize: 20,
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
