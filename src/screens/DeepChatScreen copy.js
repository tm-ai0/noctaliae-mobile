import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Alert
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { chatWithDream, transcribeAudio } from '../services/apiService';
import { MarkdownText } from '../components/MarkdownText';
import { THEME } from '../config/theme';
import { saveConversation, loadConversation, clearConversation } from '../services/conversationService';
import DebugScreenLabel from '../components/DebugScreenLabel';

// 🧠 GÉNÉRATEUR DE SUGGESTIONS INTELLIGENTES
function generateSmartSuggestions(analysis, transcription) {
  const text = (analysis + ' ' + transcription).toLowerCase();
  const suggestions = [];
  
  // Détecter les thèmes principaux
  const themes = {
    water: ['eau', 'mer', 'océan', 'rivière', 'nage', 'noy', 'pluie'],
    flight: ['vol', 'envol', 'aile', 'avion', 'lévit', 'flott'],
    chase: ['poursuit', 'fuite', 'cours', 'échapp', 'rattrape'],
    fall: ['chute', 'tombe', 'tombé', 'précipit'],
    death: ['mort', 'décès', 'mourir', 'défunt', 'cimetière'],
    family: ['famille', 'mère', 'père', 'parent', 'enfant', 'frère', 'sœur'],
    work: ['travail', 'bureau', 'collègue', 'patron', 'emploi'],
    transformation: ['transform', 'chang', 'mutation', 'devenir'],
    fear: ['peur', 'angoisse', 'terreur', 'effroi', 'crainte'],
    love: ['amour', 'affection', 'tendresse', 'romantique'],
    animal: ['chien', 'chat', 'oiseau', 'serpent', 'animal', 'bête'],
  };
  
  // Questions spécifiques par thème
  const themeQuestions = {
    water: [
      "Que symbolise l'eau dans mon rêve ?",
      "Quel lien avec mes émotions ?",
      "Pourquoi cette immersion ?"
    ],
    flight: [
      "Que représente ce vol ?",
      "Quelle liberté je recherche ?",
      "Analyse neuroscientifique du vol ?"
    ],
    chase: [
      "De quoi je fuis réellement ?",
      "Que symbolise le poursuivant ?",
      "Comment arrêter de fuir ?"
    ],
    fall: [
      "Que représente cette chute ?",
      "Quelle perte de contrôle ?",
      "Lien avec mon anxiété ?"
    ],
    death: [
      "Que signifie cette mort ?",
      "Quelle transformation ?",
      "Analyse symbolique ?"
    ],
    family: [
      "Quel message familial ?",
      "Quelle relation approfondir ?",
      "Que dit ce lien ?"
    ],
    work: [
      "Que dit mon rêve sur ma carrière ?",
      "Quelle pression professionnelle ?",
      "Comment mieux gérer le stress ?"
    ],
    transformation: [
      "Quelle transformation j'opère ?",
      "Que dois-je changer ?",
      "Analyse du changement ?"
    ],
    fear: [
      "Quelle est ma vraie peur ?",
      "Comment dépasser cette angoisse ?",
      "Origine de cette crainte ?"
    ],
    love: [
      "Que révèle ce sentiment ?",
      "Quel besoin affectif ?",
      "Analyse de cette relation ?"
    ],
    animal: [
      "Que symbolise cet animal ?",
      "Quel instinct il représente ?",
      "Message de cette créature ?"
    ],
  };
  
  // Détecter les thèmes présents (avec seuil de pertinence)
  const detectedThemes = [];
  for (const [theme, keywords] of Object.entries(themes)) {
    // ✅ Compter combien de mots-clés sont présents
    const matchCount = keywords.filter(kw => text.includes(kw)).length;
    
    // ✅ Ne garder que si au moins 2 mots-clés du thème sont présents
    // OU si c'est un mot très spécifique (>8 caractères)
    if (matchCount >= 2 || keywords.some(kw => kw.length > 8 && text.includes(kw))) {
      detectedThemes.push(theme);
    }
  }
  
  // Ajouter questions spécifiques aux thèmes détectés
  detectedThemes.forEach(theme => {
    const questions = themeQuestions[theme] || [];
    questions.forEach(q => {
      if (suggestions.length < 3 && !suggestions.includes(q)) {
        suggestions.push(q);
      }
    });
  });
  
  // Fallback : questions génériques si aucun thème détecté
  const genericQuestions = [
    "Que symbolise cet élément ?",
    "Quel lien avec ma vie actuelle ?",
    "Que dit la neuroscience ?",
    "Quelle émotion domine ?",
    "Quel message inconscient ?",
    "Comment interpréter ce rêve ?"
  ];
  
  while (suggestions.length < 3) {
    const randomQ = genericQuestions[Math.floor(Math.random() * genericQuestions.length)];
    if (!suggestions.includes(randomQ)) {
      suggestions.push(randomQ);
    }
  }
  
  return suggestions.slice(0, 3);
}

export default function DeepChatScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { dreamId, dreamAnalysis: initialAnalysis, dreamTranscription, dreamTitle } = route.params;
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Explorons ensemble votre rêve en profondeur. Quelle dimension souhaitez-vous approfondir ?',
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [selectedModel, setSelectedModel] = useState('claude'); // 'claude' ou 'llama'
  const [modelSelectorExpanded, setModelSelectorExpanded] = useState(false);
  
  // États pour l'analyse
  const [dreamAnalysis, setDreamAnalysis] = useState(initialAnalysis);
  const [analysisExpanded, setAnalysisExpanded] = useState(false);
  
  // 🆕 SUGGESTIONS DYNAMIQUES IA
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  
  // 🧠 Générer des suggestions intelligentes basées sur l'analyse
  useEffect(() => {
    if (dreamAnalysis && typeof dreamAnalysis === 'string') {
      const suggestions = generateSmartSuggestions(dreamAnalysis, dreamTranscription);
      setSuggestedQuestions(suggestions);
    }
  }, [dreamAnalysis, dreamTranscription]);
  
  // États vocal
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recordingRef = useRef(null);
  
  const scrollViewRef = useRef();

  // 🆕 Charger la conversation sauvegardée au montage
  useEffect(() => {
    async function loadSavedConversation() {
      try {
        const savedMessages = await loadConversation(dreamId);
        
        if (savedMessages && savedMessages.length > 0) {
          console.log('✅ DeepChat restauré:', savedMessages.length, 'messages');
          setMessages(savedMessages);
        }
      } catch (error) {
        console.error('❌ Erreur chargement DeepChat:', error);
      } finally {
        setIsLoadingConversation(false);
      }
    }
    
    loadSavedConversation();
  }, [dreamId]);

  // 🆕 Sauvegarder après chaque changement de messages
  useEffect(() => {
    scrollToBottom();
    
    if (!isLoadingConversation && messages.length > 0) {
      saveConversation(dreamId, messages, dreamTitle);
    }
  }, [messages, dreamId, dreamTitle, isLoadingConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  async function startVoiceRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      
      if (!granted) {
        alert('Permission microphone refusée');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Impossible de démarrer l\'enregistrement');
    }
  }

  async function stopVoiceRecording() {
    try {
      if (!recordingRef.current) return;

      setIsRecording(false);
      
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (!uri || typeof uri !== 'string') throw new Error('URI invalide');

      setIsTranscribing(true);
      const transcript = await transcribeAudio(uri);
      await handleSendMessage(transcript);

    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Impossible de traiter la question vocale');
    } finally {
      setIsTranscribing(false);
      recordingRef.current = null;
    }
  }

  async function handleSendMessage(messageText) {
    const textToSend = messageText || inputText.trim();
    
    if (!textToSend) return;

    setInputText('');
    Keyboard.dismiss();
    
    const newUserMessage = {
      role: 'user',
      content: textToSend,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const isPremium = selectedModel === 'claude' ? true : false;

      const conversationHistory = messages
        .slice(-20)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const response = await chatWithDream(
        dreamTranscription,
        dreamAnalysis,
        conversationHistory,
        textToSend,
        isPremium
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: Date.now(),
        model: response.model
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 🆕 METTRE À JOUR LES SUGGESTIONS DYNAMIQUES
      if (response.suggestedQuestions && Array.isArray(response.suggestedQuestions)) {
        setSuggestedQuestions(response.suggestedQuestions.slice(0, 3)); // Max 3
      } else {
        // ✅ Générer des suggestions basées sur la dernière réponse
        const newSuggestions = generateSmartSuggestions(response.response, dreamTranscription);
        setSuggestedQuestions(newSuggestions);
      }

    } catch (error) {
      console.error('❌ Erreur chat:', error);
      alert(error.message || 'Impossible de communiquer avec le serveur');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend() {
    await handleSendMessage();
  }

  async function handleRestart() {
    Alert.alert(
      'Nouvelle conversation ?',
      'Tous les messages seront effacés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await clearConversation(dreamId);
            setMessages([
              {
                role: 'assistant',
                content: 'Explorons ensemble votre rêve en profondeur. Quelle dimension souhaitez-vous approfondir ?',
                timestamp: Date.now()
              }
            ]);
            // ✅ Régénérer les suggestions basées sur l'analyse initiale
            const newSuggestions = generateSmartSuggestions(dreamAnalysis, dreamTranscription);
            setSuggestedQuestions(newSuggestions);
          }
        }
      ],
      { userInterfaceStyle: 'dark' } // ✅ MODE SOMBRE
    );
  }

  function renderMessage(message, index) {
    const isUser = message.role === 'user';
    
    return (
      <View 
        key={index}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble
          ]}
        >
          {isUser ? (
            <Text style={styles.userText}>{message.content}</Text>
          ) : (
            <MarkdownText style={styles.assistantText}>{message.content}</MarkdownText>
          )}
          
          {message.model && (
            <Text style={styles.modelBadge}>
              {message.model === 'claude' ? '⭐ Mode Profond' : 
               message.model === 'gemini' ? '✨ NoctaliaeAI+' : 
               '🧠 Mode Léger'}
            </Text>
          )}
        </View>
      </View>
    );
  }

  const ContainerComponent = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const containerProps = Platform.OS === 'ios' 
    ? { behavior: 'padding', keyboardVerticalOffset: 0 } 
    : {};

  return (
    <ContainerComponent 
      style={styles.container}
      {...containerProps}
    >
      <DebugScreenLabel screenName="🔍 Approfondir" />
      {/* Header avec dropdown analyse + boutons */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) + 15 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Approfondir</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {dreamTitle}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleRestart}
          style={styles.iconButton}
        >
          <MaterialIcons name="refresh" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>

      {/* 🆕 DROPDOWN ANALYSE + BOUTONS */}
      <View style={styles.analysisSection}>
        {/* Dropdown Header */}
        <TouchableOpacity 
          style={styles.dropdownHeader}
          onPress={() => setAnalysisExpanded(!analysisExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.dropdownTitleRow}>
            <MaterialCommunityIcons name="brain" size={20} color={THEME.colors.primary} />
            <Text style={styles.dropdownTitle}>Analyse complète</Text>
          </View>
          <MaterialIcons 
            name={analysisExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={24} 
            color={THEME.colors.textSecondary} 
          />
        </TouchableOpacity>

        {/* Dropdown Content */}
        {analysisExpanded && (
          <View style={styles.analysisContainer}>
            <ScrollView 
              style={styles.analysisScroll}
              contentContainerStyle={styles.analysisScrollContent}
              nestedScrollEnabled={true}
            >
              <MarkdownText style={styles.analysisText}>{dreamAnalysis}</MarkdownText>
            </ScrollView>
          </View>
        )}

        {/* Boutons */}
        <View style={styles.buttonsRow}>
          {/* Dropdown Choix Modèle */}
          <View style={styles.modelSelectorContainer}>
            <TouchableOpacity 
              style={styles.modelSelectorButton}
              onPress={() => setModelSelectorExpanded(!modelSelectorExpanded)}
            >
              <Text style={styles.modelIcon}>{selectedModel === 'claude' ? '⭐' : '🧠'}</Text>
              <Text style={styles.modelSelectorButtonText}>Choix du modèle</Text>
              <MaterialIcons 
                name={modelSelectorExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={18} 
                color={THEME.colors.textSecondary} 
              />
            </TouchableOpacity>

            {modelSelectorExpanded && (
              <View style={styles.modelDropdown}>
                <TouchableOpacity
                  style={[
                    styles.modelOption,
                    selectedModel === 'claude' && styles.modelOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedModel('claude');
                    setModelSelectorExpanded(false);
                  }}
                >
                  <Text style={styles.modelOptionIcon}>⭐</Text>
                  <View style={styles.modelOptionInfo}>
                    <Text style={styles.modelOptionTitle}>Mode Profond</Text>
                    <Text style={styles.modelOptionDesc}>Claude Sonnet 4.5</Text>
                  </View>
                  {selectedModel === 'claude' && (
                    <MaterialIcons name="check" size={20} color={THEME.colors.primary} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modelOption,
                    selectedModel === 'llama' && styles.modelOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedModel('llama');
                    setModelSelectorExpanded(false);
                  }}
                >
                  <Text style={styles.modelOptionIcon}>🧠</Text>
                  <View style={styles.modelOptionInfo}>
                    <Text style={styles.modelOptionTitle}>Mode Léger</Text>
                    <Text style={styles.modelOptionDesc}>Llama 3.3 70B</Text>
                  </View>
                  {selectedModel === 'llama' && (
                    <MaterialIcons name="check" size={20} color={THEME.colors.warmGold} />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* 🆕 BOUTON NOCTALIAEAI+ LIVE UNIQUEMENT */}
        <TouchableOpacity 
          style={styles.geminiButton}
          onPress={() => {
            navigation.navigate('GeminiLive', {
              dreamId,
              dreamAnalysis,
              dreamTranscription,
              dreamTitle
            });
          }}
        >
          <MaterialIcons name="auto-awesome" size={18} color={THEME.colors.warmGold} />
          <Text style={styles.geminiButtonText}>NoctaliaeAI+ Live</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToBottom}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, index) => renderMessage(msg, index))}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={THEME.colors.primary} size="small" />
            <Text style={styles.loadingText}>Réflexion...</Text>
          </View>
        )}

        {isTranscribing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={THEME.colors.warmGold} size="small" />
            <Text style={styles.loadingText}>Transcription...</Text>
          </View>
        )}
      </ScrollView>

      {/* 🆕 SUGGESTIONS DYNAMIQUES IA (au lieu des fixes) */}
      {!isLoading && suggestedQuestions.length > 0 && (
        <ScrollView 
          horizontal 
          style={styles.suggestionsContainer}
          contentContainerStyle={styles.suggestionsContent}
          showsHorizontalScrollIndicator={false}
        >
          {suggestedQuestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionCard}
              onPress={() => {
                setInputText(suggestion);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText} numberOfLines={2} ellipsizeMode="tail">
                {suggestion}
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color={THEME.colors.primary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { 
        paddingBottom: Math.max(insets.bottom, 15)
      }]}>
        <TouchableOpacity 
          style={[
            styles.micButton,
            isRecording && styles.micButtonRecording,
            (isLoading || isTranscribing) && styles.micButtonDisabled
          ]}
          onPress={isRecording ? stopVoiceRecording : startVoiceRecording}
          disabled={isLoading || isTranscribing}
        >
          <MaterialIcons 
            name={isRecording ? "stop" : "mic"} 
            size={24} 
            color={THEME.colors.background}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Posez votre question..."
          placeholderTextColor={THEME.colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading && !isRecording && !isTranscribing}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading || isRecording || isTranscribing) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading || isRecording || isTranscribing}
        >
          <MaterialIcons 
            name="send" 
            size={24} 
            color={THEME.colors.background}
          />
        </TouchableOpacity>
      </View>
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: THEME.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 🆕 Section analyse
  analysisSection: {
    backgroundColor: THEME.colors.cardBackground,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  dropdownTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  analysisContainer: {
    backgroundColor: THEME.colors.warmGoldSubtle,
    borderRadius: 12,
    marginBottom: 10,
    maxHeight: 200,
  },
  analysisScroll: {
    maxHeight: 200,
  },
  analysisScrollContent: {
    padding: 12,
  },
  analysisText: {
    fontSize: 13,
    color: THEME.colors.textPrimary,
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  modelSelectorContainer: {
    flex: 1,
  },
  modelSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.background,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  modelDropdown: {
    position: 'absolute',
    top: 48,
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
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
  },
  modelOptionSelected: {
    backgroundColor: THEME.colors.primaryGlow,
  },
  modelOptionIcon: {
    fontSize: 20,
  },
  modelOptionInfo: {
    flex: 1,
  },
  modelOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  modelOptionDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  modelIcon: {
    fontSize: 16,
  },
  modelSelectorButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  // 🆕 Bouton NoctaliaeAI+ uniquement (pleine largeur)
  geminiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.warmGoldSubtle,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: THEME.colors.warmGold,
    gap: 6,
  },
  geminiButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.warmGold,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  userBubble: {
    backgroundColor: THEME.colors.primary,
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    backgroundColor: THEME.colors.cardBackground,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  userText: {
    fontSize: 16,
    lineHeight: 22,
    color: THEME.colors.background,
  },
  assistantText: {
    fontSize: 16,
    lineHeight: 22,
    color: THEME.colors.text,
  },
  modelBadge: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  // Suggestions (1-2 lignes)
  suggestionsContainer: {
    maxHeight: 90, // ✅ Plus haut pour 2 lignes de texte
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    backgroundColor: THEME.colors.cardBackground,
  },
  suggestionsContent: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    minWidth: 180, // ✅ Largeur minimum pour voir le texte
    minHeight: 50, // ✅ Hauteur minimum
    gap: 8,
  },
  suggestionText: {
    flex: 1, // ✅ Prend toute la largeur disponible
    fontSize: 13,
    color: THEME.colors.text,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 15,
    backgroundColor: THEME.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    alignItems: 'flex-end',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...THEME.shadow.neon,
  },
  micButtonRecording: {
    backgroundColor: THEME.colors.error,
  },
  micButtonDisabled: {
    backgroundColor: THEME.colors.cardBorder,
    opacity: 0.5,
  },
  input: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: THEME.colors.text,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  sendButtonDisabled: {
    backgroundColor: THEME.colors.cardBorder,
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
});
