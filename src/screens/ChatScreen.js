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
  Alert,
  Animated
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Clipboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { chatWithDream, transcribeAudio } from '../services/apiService';
import { API_BASE_URL } from '../config/api';
import { premiumService } from '../services/premiumService';
import { THEME } from '../config/theme';
import { saveConversation, loadConversation, clearConversation } from '../services/conversationService';
import DebugScreenLabel from '../components/DebugScreenLabel';

export default function ChatScreen({ route, navigation }) {
  const { dreamId, dreamAnalysis, dreamTranscription, dreamTitle } = route.params;
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Je suis là pour approfondir l\'analyse de ton rêve. Pose-moi toutes tes questions ! 💬',
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);
  
  // États vocal
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recordingRef = useRef(null); // ✅ Utiliser Recording au lieu du hook
  
  const scrollViewRef = useRef();
  const analysisHeight = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function loadSavedConversation() {
      try {
        const savedMessages = await loadConversation(dreamId);
        
        if (savedMessages && savedMessages.length > 0) {
          console.log('✅ Conversation restaurée:', savedMessages.length, 'messages');
          setMessages(savedMessages);
        }
      } catch (error) {
        console.error('❌ Erreur chargement conversation:', error);
      } finally {
        setIsLoadingConversation(false);
      }
    }
    
    loadSavedConversation();
  }, [dreamId]);

  useEffect(() => {
    scrollToBottom();
    
    if (!isLoadingConversation && messages.length > 0) {
      saveConversation(dreamId, messages, dreamTitle);
    }
  }, [messages, dreamId, dreamTitle, isLoadingConversation]);

  useEffect(() => {
    Animated.timing(analysisHeight, {
      toValue: showAnalysis ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showAnalysis]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  async function startVoiceRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      
      if (!granted) {
        Alert.alert('Permission refusée', 'Accès microphone requis');
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
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
    }
  }

  async function stopVoiceRecording() {
    try {
      if (!recordingRef.current) return;

      setIsRecording(false);
      
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (!uri || typeof uri !== 'string') {
        throw new Error('URI invalide');
      }

      setIsTranscribing(true);
      const transcript = await transcribeAudio(uri);
      await handleSendMessage(transcript);

    } catch (error) {
      console.error('❌ Erreur:', error);
      Alert.alert('Erreur', 'Impossible de traiter la question vocale');
    } finally {
      setIsTranscribing(false);
      recordingRef.current = null;
    }
  }

  async function handleSendMessage(messageText) {
    const textToSend = messageText || inputText.trim();
    
    if (!textToSend) return;

    setInputText('');
    
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

    } catch (error) {
      console.error('❌ Erreur chat:', error);
      Alert.alert('Erreur', error.message || 'Impossible de communiquer avec le serveur');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend() {
    await handleSendMessage();
  }

  async function copyToClipboard(text) {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('✅ Copié', 'Message copié');
    } catch (error) {
      console.error('❌ Erreur copie:', error);
    }
  }

  async function handleRestart() {
    Alert.alert(
      'Recommencer ?',
      'Tous les messages seront effacés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Recommencer',
          style: 'destructive',
          onPress: async () => {
            await clearConversation(dreamId);
            setMessages([
              {
                role: 'assistant',
                content: 'Je suis là pour approfondir l\'analyse de ton rêve. Pose-moi toutes tes questions ! 💬',
                timestamp: Date.now()
              }
            ]);
            if (player.playing) player.pause();
          }
        }
      ]
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
        <TouchableOpacity
          activeOpacity={0.7}
          onLongPress={() => copyToClipboard(message.content)}
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble
          ]}
        >
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText
          ]}>
            {message.content}
          </Text>
          
          {message.model && (
            <Text style={styles.modelBadge}>
              {message.model === 'claude' ? '⭐ Mode Profond' : '🧠 Mode Léger'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  const inputContainerBottomPadding = Platform.select({
    android: Math.max(insets.bottom, 15),
    ios: insets.bottom,
  });

  const ViewWrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const wrapperProps = Platform.OS === 'ios' 
    ? {
        behavior: 'padding',
        keyboardVerticalOffset: 90,
        keyboardShouldPersistTaps: 'handled'
      }
    : {};

  return (
    <ViewWrapper 
      style={styles.container}
      {...wrapperProps}
    >
      <DebugScreenLabel screenName="💬 Chat" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) + 15 }]}>
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
        </View>

        <TouchableOpacity 
          onPress={handleRestart}
          style={styles.iconButton}
        >
          <MaterialIcons name="refresh" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>

      {/* 🆕 Analyse complète (déroulante) */}
      {dreamAnalysis && (
        <Animated.View style={[
          styles.analysisContainer,
          {
            maxHeight: analysisHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 400]
            }),
            opacity: analysisHeight
          }
        ]}>
          <TouchableOpacity 
            style={styles.analysisHeader}
            onPress={() => setShowAnalysis(!showAnalysis)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="brain" size={20} color={THEME.colors.primary} />
            <Text style={styles.analysisTitle}>Analyse complète</Text>
            <MaterialIcons 
              name={showAnalysis ? "expand-less" : "expand-more"} 
              size={24} 
              color={THEME.colors.text} 
            />
          </TouchableOpacity>
          
          {showAnalysis && (
            <ScrollView style={styles.analysisScroll} nestedScrollEnabled>
              <Text style={styles.analysisText}>{dreamAnalysis}</Text>
            </ScrollView>
          )}
        </Animated.View>
      )}

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToBottom}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {messages.map((msg, index) => renderMessage(msg, index))}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#9B59B6" size="small" />
            <Text style={styles.loadingText}>Réflexion...</Text>
          </View>
        )}

        {isTranscribing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#E67E22" size="small" />
            <Text style={styles.loadingText}>Transcription...</Text>
          </View>
        )}
      </ScrollView>

      {/* 🆕 Options (Material Design 3) */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton}>
          <MaterialCommunityIcons name="text" size={20} color={THEME.colors.primary} />
          <Text style={styles.optionText}>Texte</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => Alert.alert('🎤 Vocal', 'Mode vocal activé - Utilisez le micro ci-dessous')}
        >
          <MaterialIcons name="mic" size={20} color={THEME.colors.primary} />
          <Text style={styles.optionText}>Vocal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => Alert.alert('🤖 NoctaliaeAI', 'Fonctionnalité multimodale à venir')}
        >
          <MaterialCommunityIcons name="robot" size={20} color={THEME.colors.primary} />
          <Text style={styles.optionText}>NoctaliaeAI</Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: inputContainerBottomPadding }]}>
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
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Pose ta question..."
          placeholderTextColor={THEME.colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading && !isRecording && !isTranscribing}
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
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>
    </ViewWrapper>
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
    fontSize: 22,
    fontFamily: 'CormorantUpright-Bold',
    color: THEME.colors.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisContainer: {
    backgroundColor: THEME.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
    overflow: 'hidden',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  analysisTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
  },
  analysisScroll: {
    maxHeight: 300,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  analysisText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
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
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: THEME.colors.text,
  },
  assistantText: {
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
  optionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: THEME.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: THEME.colors.background,
    borderRadius: 12,
    gap: 6,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.primary,
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
    backgroundColor: '#E67E22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  micButtonRecording: {
    backgroundColor: '#C0392B',
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
    backgroundColor: '#9B59B6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: THEME.colors.cardBorder,
    opacity: 0.5,
  },
});
