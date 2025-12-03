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
import { chatWithDream } from '../services/apiService';
import { premiumService } from '../services/premiumService';
import { MarkdownText } from '../components/MarkdownText';
import { useTheme } from '../config/ThemeContext';
import { saveConversation, loadConversation, clearConversation } from '../services/conversationService';
import DebugScreenLabel from '../components/DebugScreenLabel';

export default function MetaAnalysisScreen({ route, navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { dreams, totalCount } = route.params;
  
  // Préparer le contexte global de tous les rêves
  const allDreamsAnalysis = dreams.map(d => `${d.title}: ${d.analysis}`).join('\n\n');
  const allDreamsTranscription = dreams.map(d => d.transcription).join('\n\n');
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  
  const scrollViewRef = useRef();

  // Suggestions spécifiques meta-analyse
  const suggestions = [
    "Quels symboles reviennent le plus souvent dans mes rêves ?",
    "Comment mes émotions évoluent-elles au fil du temps ?",
    "Y a-t-il des patterns récurrents que je devrais noter ?",
    "Quels sont mes thèmes de rêves dominants ?"
  ];

  // Charger la conversation sauvegardée
  useEffect(() => {
    async function loadSavedConversation() {
      try {
        const savedMessages = await loadConversation('meta-analysis');
        
        if (savedMessages && savedMessages.length > 0) {
          console.log('✅ Meta-analyse restaurée:', savedMessages.length, 'messages');
          setMessages(savedMessages);
        }
      } catch (error) {
        console.error('❌ Erreur chargement meta-analyse:', error);
      } finally {
        setIsLoadingConversation(false);
      }
    }
    
    loadSavedConversation();
  }, []);

  // Sauvegarder après chaque changement
  useEffect(() => {
    scrollToBottom();
    
    if (!isLoadingConversation && messages.length > 0) {
      saveConversation('meta-analysis', messages, `Meta-analyse (${totalCount} rêves)`);
    }
  }, [messages, totalCount, isLoadingConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

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
      const isPremium = await premiumService.isPremium();

      const conversationHistory = messages
        .slice(-20)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const response = await chatWithDream(
        allDreamsTranscription,
        allDreamsAnalysis,
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

    } catch (error) {
      console.error('❌ Erreur meta-analyse:', error);
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
            await clearConversation('meta-analysis');
            setMessages([]);
          }
        }
      ],
      {userInterfaceStyle: 'dark'}
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
        {!isUser && (
          <Text style={styles.avatarIcon}>💡</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble
          ]}
        >
          {isUser ? (
            <Text style={[styles.userText, { color: theme.colors.background }]}>{message.content}</Text>
          ) : (
            <MarkdownText style={[styles.assistantText, { color: theme.colors.text }]}>{message.content}</MarkdownText>
          )}
          
          {message.model && (
            <Text style={[styles.modelBadge, { color: theme.colors.textSecondary }]}>
              {message.model === 'claude' ? '⭐ DeepDream' : '⚡ QuickDream'}
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      {...containerProps}
    >
      <DebugScreenLabel screenName="💡 Mes rêves" fileName="MetaAnalysisScreen.js" />
      
      {/* Header */}
      <View style={[styles.header, { 
        paddingTop: Math.max(insets.top, 15) + 15,
        backgroundColor: theme.colors.cardBackground,
        borderBottomColor: theme.colors.cardBorder
      }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerIcon}>💡</Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mes rêves</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleRestart}
          style={styles.iconButton}
        >
          <MaterialIcons name="refresh" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* ScrollView avec Welcome + Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={scrollToBottom}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card - TOUJOURS AFFICHÉ */}
        <View style={[styles.welcomeCard, { 
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.primary
        }]}>
          <Text style={styles.welcomeIcon}>👋</Text>
          <Text style={[styles.welcomeTitle, { color: theme.colors.primary }]}>
            Bienvenue dans Mes rêves !
          </Text>
          <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
            Je vais analyser <Text style={{ fontWeight: '700', color: theme.colors.text }}>{totalCount} de vos rêves</Text> pour détecter des patterns, symboles récurrents et évolutions émotionnelles.
          </Text>
          <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
            Pose-moi une question ou choisis une suggestion ci-dessous.
          </Text>
        </View>

        {/* Suggestions - TOUJOURS AFFICHÉES */}
        <View style={styles.suggestionsSection}>
          <Text style={[styles.suggestionsTitle, { color: theme.colors.textSecondary }]}>
            QUESTIONS SUGGÉRÉES
          </Text>
          
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionCard, { 
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder
              }]}
              onPress={() => handleSendMessage(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Messages - SOUS LES SUGGESTIONS */}
        {messages.length > 0 && (
          <View style={styles.messagesSection}>
            {messages.map((msg, index) => renderMessage(msg, index))}
          </View>
        )}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Analyse en cours...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { 
        paddingBottom: Math.max(insets.bottom, 15),
        backgroundColor: theme.colors.cardBackground,
        borderTopColor: theme.colors.cardBorder
      }]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.cardBorder
          }]}
          placeholder="Posez votre question..."
          placeholderTextColor={theme.colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            { backgroundColor: theme.colors.primary },
            theme.shadow.neon,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <MaterialIcons 
            name="send" 
            size={24} 
            color={theme.colors.background}
          />
        </TouchableOpacity>
      </View>
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // ScrollView global
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Welcome Card
  welcomeCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  
  // Suggestions
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  suggestionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Messages section
  messagesSection: {
    gap: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarIcon: {
    fontSize: 24,
    marginRight: 8,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '75%',
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
    backgroundColor: '#00FFB0',
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    backgroundColor: '#1C2333',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#2A3447',
  },
  userText: {
    fontSize: 16,
    lineHeight: 22,
  },
  assistantText: {
    fontSize: 16,
    lineHeight: 22,
  },
  modelBadge: {
    fontSize: 10,
    marginTop: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 15,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  
  // Input
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
