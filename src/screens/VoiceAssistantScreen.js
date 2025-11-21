import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transcribeAudio, synthesizeText, callNoctaliaeChat } from '../services/apiService';
import { API_BASE_URL } from '../config/api';
import { THEME } from '../config/theme';
import DebugScreenLabel from '../components/DebugScreenLabel';

/**
 * 🎙️ VoiceAssistantScreen
 * 
 * Chat vocal complet avec Claude Sonnet 4 via /noctaliae-chat
 * 
 * FLUX :
 * 1. 🎤 Enregistrement audio via expo-av
 * 2. 📝 Transcription via /transcribe (Groq Whisper)
 * 3. 🧠 Génération réponse via /noctaliae-chat (Claude Sonnet 4)
 * 4. 🔊 Lecture audio via /synthesize (Google Cloud TTS)
 * 5. 💾 Sauvegarde historique dans AsyncStorage
 */
export default function VoiceAssistantScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  
  // ═══════════════════════════════════════════════════════
  // RÉCUPÉRATION DES PARAMÈTRES
  // ═══════════════════════════════════════════════════════
  
  const { dreamId, dreamAnalysis, dreamTranscription, dreamTitle } = route.params || {};
  
  // ═══════════════════════════════════════════════════════
  // ÉTATS
  // ═══════════════════════════════════════════════════════
  
  const [conversation, setConversation] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  
  // Refs
  const recordingRef = useRef(null);
  const soundRef = useRef(null);
  const scrollViewRef = useRef(null);
  
  // ═══════════════════════════════════════════════════════
  // EFFETS
  // ═══════════════════════════════════════════════════════
  
  // Vérification des données au montage
  useEffect(() => {
    if (!dreamId || !dreamAnalysis) {
      Alert.alert(
        'Erreur',
        'Données manquantes pour démarrer la conversation',
        [{ text: 'Retour', onPress: () => navigation.goBack() }]
      );
    } else {
      loadConversationHistory();
    }
  }, [dreamId, dreamAnalysis]);
  
  // Scroll automatique
  useEffect(() => {
    if (conversation.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversation]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      // Arrêter la lecture audio
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      // Arrêter l'enregistrement
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);
  
  // ═══════════════════════════════════════════════════════
  // FONCTIONS - ENREGISTREMENT AUDIO
  // ═══════════════════════════════════════════════════════
  
  const startRecording = async () => {
    try {
      console.log('🎙️ Demande permission micro...');
      
      const { granted } = await Audio.requestPermissionsAsync();
      
      if (!granted) {
        Alert.alert(
          'Permission refusée',
          'Vous devez autoriser l\'accès au micro',
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.log('✅ Permission micro accordée');
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      console.log('🔴 Démarrage enregistrement...');
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
      setCurrentStatus('🎤 Enregistrement...');
      
      console.log('✅ Enregistrement en cours');
      
    } catch (error) {
      console.error('❌ Erreur démarrage enregistrement:', error);
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
    }
  };
  
  const stopRecording = async () => {
    if (!recordingRef.current) {
      console.warn('⚠️ Aucun enregistrement en cours');
      return;
    }
    
    try {
      console.log('⏹️ Arrêt enregistrement...');
      
      setIsRecording(false);
      setCurrentStatus('📝 Traitement...');
      
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      if (!uri || typeof uri !== 'string') {
        throw new Error('URI invalide');
      }
      
      console.log('✅ Audio enregistré:', uri);
      
      await handleSendVoiceMessage(uri);
      
    } catch (error) {
      console.error('❌ Erreur arrêt enregistrement:', error);
      Alert.alert('Erreur', 'Impossible d\'arrêter l\'enregistrement');
      setCurrentStatus('');
    } finally {
      recordingRef.current = null;
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // ═══════════════════════════════════════════════════════
  // FONCTIONS - FLUX COMPLET VOCAL
  // ═══════════════════════════════════════════════════════
  
  /**
   * FLUX COMPLET :
   * 1. Transcription audio
   * 2. Appel /noctaliae-chat avec Claude
   * 3. Synthèse TTS
   * 4. Lecture audio
   */
  const handleSendVoiceMessage = async (audioUri) => {
    try {
      setIsProcessing(true);
      
      // ══════════════════════════════════════════════════
      // ÉTAPE 1 : TRANSCRIPTION
      // ══════════════════════════════════════════════════
      setCurrentStatus('📝 Transcription...');
      console.log('🎙️ [1/4] Transcription audio...');
      
      const userTranscription = await transcribeAudio(audioUri);
      console.log('✅ Transcription:', userTranscription.substring(0, 50) + '...');
      
      // Ajouter message utilisateur
      addToConversation('user', userTranscription);
      
      // ══════════════════════════════════════════════════
      // ÉTAPE 2 : APPEL CLAUDE VIA /noctaliae-chat
      // ══════════════════════════════════════════════════
      setCurrentStatus('🧠 Claude réfléchit...');
      console.log('🎙️ [2/4] Génération réponse Claude...');
      
      const conversationHistory = conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const claudeResponse = await callNoctaliaeChat(
        dreamTranscription,
        dreamAnalysis,
        conversationHistory,
        userTranscription
      );
      
      console.log('✅ Réponse Claude reçue');
      
      // Ajouter réponse assistant
      addToConversation('assistant', claudeResponse.response);
      
      // ══════════════════════════════════════════════════
      // ÉTAPE 3 : SYNTHÈSE TTS
      // ══════════════════════════════════════════════════
      setCurrentStatus('🔊 Synthèse audio...');
      console.log('🎙️ [3/4] Synthèse vocale...');
      
      const audioBase64 = await synthesizeText(claudeResponse.response);
      
      // ══════════════════════════════════════════════════
      // ÉTAPE 4 : LECTURE AUDIO
      // ══════════════════════════════════════════════════
      setCurrentStatus('🔊 Lecture...');
      console.log('🎙️ [4/4] Lecture audio...');
      
      await playAudioFromBase64(audioBase64);
      
      setCurrentStatus('');
      console.log('✅ Flux vocal complet terminé');
      
    } catch (error) {
      console.error('❌ Erreur handleSendVoiceMessage:', error);
      Alert.alert('Erreur', error.message || 'Impossible de traiter votre message');
      setCurrentStatus('');
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Lire l'audio depuis une string base64
   */
  const playAudioFromBase64 = async (audioBase64) => {
    try {
      console.log('🔊 Préparation lecture audio...');
      
      // Nettoyer l'ancien son
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      // Créer le nouveau son depuis base64
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${audioBase64}` },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      setIsPlaying(true);
      
      // Écouter la fin de la lecture
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          console.log('✅ Lecture audio terminée');
          setIsPlaying(false);
        }
      });
      
      console.log('▶️ Lecture audio démarrée');
      
    } catch (error) {
      console.error('❌ Erreur lecture audio:', error);
      setIsPlaying(false);
    }
  };
  
  // ═══════════════════════════════════════════════════════
  // FONCTIONS - GESTION CONVERSATION
  // ═══════════════════════════════════════════════════════
  
  const addToConversation = (role, content) => {
    const newMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    
    setConversation(prev => {
      const updated = [...prev, newMessage];
      saveConversationHistory(updated);
      return updated;
    });
    
    console.log(`💬 Message ajouté (${role}):`, content.substring(0, 50) + '...');
  };
  
  const saveConversationHistory = async (conversationData) => {
    try {
      const key = `voice_conversation_${dreamId}`;
      await AsyncStorage.setItem(key, JSON.stringify(conversationData));
      console.log('💾 Conversation sauvegardée:', conversationData.length, 'messages');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    }
  };
  
  const loadConversationHistory = async () => {
    try {
      const key = `voice_conversation_${dreamId}`;
      const savedData = await AsyncStorage.getItem(key);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setConversation(parsedData);
        console.log('💿 Conversation chargée:', parsedData.length, 'messages');
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    }
  };
  
  const handleClearConversation = () => {
    Alert.alert(
      'Effacer la conversation ?',
      'Tous les messages seront supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            const key = `voice_conversation_${dreamId}`;
            await AsyncStorage.removeItem(key);
            setConversation([]);
            console.log('🗑️ Conversation effacée');
          }
        }
      ]
    );
  };
  
  /**
   * Rejouer un message assistant
   */
  const replayMessage = async (message) => {
    if (isPlaying || isProcessing) return;
    
    try {
      setCurrentStatus('🔊 Lecture...');
      const audioBase64 = await synthesizeText(message.content);
      await playAudioFromBase64(audioBase64);
      setCurrentStatus('');
    } catch (error) {
      console.error('❌ Erreur replay:', error);
      Alert.alert('Erreur', 'Impossible de lire ce message');
      setCurrentStatus('');
    }
  };
  
  // ═══════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <DebugScreenLabel screenName="🎤 Assistant Vocal" />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) + 15 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🎙️ Assistant Vocal</Text>
          {dreamTitle && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {dreamTitle}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          onPress={handleClearConversation}
          style={styles.iconButton}
        >
          <MaterialIcons name="refresh" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* HISTORIQUE */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: Math.max(insets.bottom, 15) + 180 }
        ]}
      >
        {conversation.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌙</Text>
            <Text style={styles.emptyText}>
              Appuyez sur le micro{'\n'}pour commencer la conversation
            </Text>
          </View>
        ) : (
          conversation.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.role === 'user' 
                  ? styles.userBubble 
                  : styles.assistantBubble
              ]}
            >
              <Text style={styles.messageRole}>
                {message.role === 'user' ? '👤 Vous' : '🌙 Noctaliæ'}
              </Text>
              <Text style={styles.messageText}>
                {message.content}
              </Text>
              
              {message.role === 'assistant' && (
                <TouchableOpacity 
                  style={styles.replayButton}
                  onPress={() => replayMessage(message)}
                  disabled={isPlaying || isProcessing}
                >
                  <MaterialIcons 
                    name="volume-up" 
                    size={16} 
                    color={THEME.colors.primary} 
                  />
                  <Text style={styles.replayButtonText}>Ré-écouter</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
      
      {/* ZONE ENREGISTREMENT */}
      <View style={[
        styles.recordingZone,
        { paddingBottom: Math.max(insets.bottom, 15) }
      ]}>
        {/* Status */}
        {(isProcessing || isPlaying || currentStatus) && (
          <View style={styles.statusContainer}>
            {isProcessing && (
              <ActivityIndicator size="small" color={THEME.colors.primary} />
            )}
            <Text style={styles.statusText}>
              {currentStatus || (isPlaying ? '🔊 Lecture...' : 'Traitement...')}
            </Text>
          </View>
        )}
        
        {/* Bouton Micro */}
        <TouchableOpacity
          style={[
            styles.micButton,
            isRecording && styles.micButtonActive
          ]}
          onPress={toggleRecording}
          disabled={isProcessing}
        >
          <MaterialIcons 
            name={isRecording ? "stop" : "mic"} 
            size={40} 
            color={THEME.colors.background}
          />
        </TouchableOpacity>
        
        <Text style={styles.micLabel}>
          {isRecording ? 'Arrêter' : 'Appuyer pour parler'}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

// ═══════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  
  // HEADER
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
  
  // MESSAGES
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  messageBubble: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 15,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: THEME.colors.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.cardBackground,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  messageRole: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 5,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 22,
  },
  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: THEME.colors.background,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  replayButtonText: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  
  // ZONE ENREGISTREMENT
  recordingZone: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  statusText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  micButtonActive: {
    backgroundColor: THEME.colors.error,
  },
  micLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 10,
    fontWeight: '600',
  },
});
