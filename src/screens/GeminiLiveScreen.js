import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import NoctaliaeGlassWave from '../components/NoctaliaeGlassWave';
import { THEME } from '../config/theme';
import { API_BASE_URL } from '../config/api';

const { width, height } = Dimensions.get('window');

/**
 * 🌙 NOCTALIAEAI+ - Mode mains libres avec Google Live API
 * Streaming temps réel via WebSocket
 */
export default function GeminiLiveScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { dreamId, dreamAnalysis, dreamTranscription, dreamTitle } = route.params;
  
  // États principaux
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  // États onboarding
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showContext, setShowContext] = useState(false);
  
  // WebSocket et Audio
  const wsRef = useRef(null);
  const recordingRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  
  // Animation
  const transcriptOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestPermissions();
    
    return () => {
      cleanup();
    };
  }, []);

  // Animation transcription
  useEffect(() => {
    if (liveTranscript.length > 0) {
      Animated.timing(transcriptOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [liveTranscript]);

  async function requestPermissions() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission refusée', 'L\'accès au microphone est requis pour NoctaliaeAI+');
      }
    } catch (error) {
      console.error('❌ Erreur permissions:', error);
    }
  }

  async function connectToLiveAPI() {
    try {
      console.log('🌙 Connexion à Google Live API...');
      
      // Créer URL WebSocket avec contexte
      const contextParam = encodeURIComponent(dreamTranscription || '');
      const analysisParam = encodeURIComponent(dreamAnalysis || '');
      const wsUrl = `${API_BASE_URL.replace('https://', 'wss://')}/noctaliae-live?context=${contextParam}&analysis=${analysisParam}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('✅ Connecté à Live API');
        setIsConnected(true);
        startAudioCapture();
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.transcript) {
            // Transcription utilisateur
            setLiveTranscript(prev => prev + ' ' + data.transcript);
          }
          
          if (data.response) {
            // Réponse assistant
            setAssistantResponse(data.response);
          }
          
          if (data.error) {
            console.error('❌ Erreur Live API:', data.error);
            Alert.alert('Erreur', data.error);
          }
        } catch (error) {
          console.error('❌ Erreur parsing message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
        Alert.alert('Erreur', 'Connexion au serveur échouée');
        setIsConnected(false);
      };
      
      ws.onclose = () => {
        console.log('🔌 Déconnecté de Live API');
        setIsConnected(false);
        stopAudioCapture();
      };
      
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      Alert.alert('Erreur', 'Impossible de se connecter');
    }
  }

  async function startAudioCapture() {
    try {
      setIsListening(true);
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      
      // Simuler niveau audio (à remplacer par vraie analyse)
      startAudioLevelSimulation();
      
    } catch (error) {
      console.error('❌ Erreur capture audio:', error);
      Alert.alert('Erreur', 'Impossible de démarrer la capture audio');
      setIsListening(false);
    }
  }

  function startAudioLevelSimulation() {
    const interval = setInterval(() => {
      if (!isListening) {
        clearInterval(interval);
        return;
      }
      const randomLevel = Math.random() * 0.3 + 0.2;
      setAudioLevel(randomLevel);
    }, 100);
  }

  async function stopAudioCapture() {
    try {
      setIsListening(false);
      setAudioLevel(0);
      
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } catch (error) {
      console.error('❌ Erreur arrêt audio:', error);
    }
  }

  function disconnect() {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopAudioCapture();
  }

  function cleanup() {
    disconnect();
  }

  function renderContextModal() {
    return (
      <Modal
        visible={showContext}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContext(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.contextModal}>
            <View style={styles.contextHeader}>
              <Text style={styles.contextTitle}>📖 Contexte du rêve</Text>
              <TouchableOpacity onPress={() => setShowContext(false)}>
                <MaterialIcons name="close" size={24} color={THEME.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.contextContent}>
              <Text style={styles.contextSection}>🎤 Transcription</Text>
              <Text style={styles.contextText}>
                {dreamTranscription || 'Aucune transcription disponible'}
              </Text>

              <Text style={styles.contextSection}>🧠 Analyse</Text>
              <Text style={styles.contextText}>
                {dreamAnalysis || 'Aucune analyse disponible'}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  function renderOnboardingModal() {
    return (
      <Modal
        visible={showOnboarding}
        transparent
        animationType="fade"
        onRequestClose={() => navigation.goBack()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.onboardingModal}>
            <LinearGradient
              colors={[THEME.colors.warmGoldSubtle, THEME.colors.warmBrownSubtle]}
              style={styles.onboardingGradient}
            >
              {/* Badge "Bientôt" */}
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>🚀 BIENTÔT DISPONIBLE</Text>
              </View>

              <Text style={styles.onboardingEmoji}>✨</Text>
              <Text style={styles.onboardingTitle}>NoctaliaeAI+ Live</Text>
              <Text style={styles.onboardingSubtitle}>Conversation vocale avec votre rêve</Text>
              
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🎙️</Text>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>Mode mains libres</Text>
                    <Text style={styles.featureDesc}>Parlez naturellement, l'IA vous répond en temps réel</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🧠</Text>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>Contexte intelligent</Text>
                    <Text style={styles.featureDesc}>L'IA connaît votre rêve et pose des questions pertinentes</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>⚡</Text>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>Streaming instantané</Text>
                    <Text style={styles.featureDesc}>Powered by Gemini 2.5 Flash (1M context)</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🎨</Text>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>Vision multimodale</Text>
                    <Text style={styles.featureDesc}>Partagez photos et dessins de vos rêves</Text>
                  </View>
                </View>
              </View>

              {/* Message d'attente */}
              <View style={styles.waitingMessage}>
                <Text style={styles.waitingText}>
                  Cette fonctionnalité est en cours de développement.{"\n"}
                  Rejoignez la communauté pour être notifié du lancement !
                </Text>
              </View>

              <TouchableOpacity
                style={styles.backButtonTeaser}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons name="arrow-back" size={20} color={THEME.colors.warmGold} />
                <Text style={styles.backButtonTeaserText}>Retour</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    );
  }

  function renderHelpModal() {
    return (
      <Modal
        visible={showHelp}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHelp(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.helpModal}>
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>Guide NoctaliaeAI+</Text>
              <TouchableOpacity onPress={() => setShowHelp(false)}>
                <MaterialIcons name="close" size={24} color={THEME.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.helpContent}>
              <Text style={styles.helpSection}>🎙️ Mode temps réel</Text>
              <Text style={styles.helpText}>
                Gemini 2.5 Flash vous écoute en streaming. Parlez librement de votre rêve.
              </Text>

              <Text style={styles.helpSection}>🧠 Contexte intelligent</Text>
              <Text style={styles.helpText}>
                L'IA connaît déjà votre rêve et pose des questions d'approfondissement pertinentes.
              </Text>

              <Text style={styles.helpSection}>📖 Voir le contexte</Text>
              <Text style={styles.helpText}>
                Cliquez sur l'icône livre pour voir la transcription et l'analyse de votre rêve.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[THEME.colors.warmGoldSubtle, 'transparent']}
        style={[styles.header, { paddingTop: Math.max(insets.top, 15) + 10 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="auto-awesome" size={24} color={THEME.colors.warmGold} />
            <Text style={styles.headerTitle}>NoctaliaeAI+</Text>
            {isConnected && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity 
              onPress={() => setShowContext(true)}
              style={styles.headerIcon}
            >
              <MaterialIcons name="menu-book" size={24} color={THEME.colors.warmGold} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowHelp(true)}
              style={styles.headerIcon}
            >
              <MaterialIcons name="help-outline" size={24} color={THEME.colors.warmGold} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Animation centrale */}
      <View style={styles.animationContainer}>
        <NoctaliaeGlassWave 
          isActive={isListening} 
          audioLevel={audioLevel} 
        />
      </View>

      {/* Transcription live */}
      {liveTranscript.length > 0 && (
        <Animated.View 
          style={[
            styles.transcriptionContainer,
            { opacity: transcriptOpacity }
          ]}
        >
          <ScrollView 
            style={styles.transcriptionScroll}
            contentContainerStyle={styles.transcriptionContent}
          >
            <Text style={styles.transcriptionLabel}>🗣️ Vous</Text>
            <Text style={styles.transcriptionText}>{liveTranscript}</Text>
          </ScrollView>
        </Animated.View>
      )}

      {/* Réponse assistant */}
      {assistantResponse.length > 0 && (
        <View style={styles.responseContainer}>
          <ScrollView 
            style={styles.responseScroll}
            contentContainerStyle={styles.responseContent}
          >
            <Text style={styles.responseLabel}>🌙 NoctaliaeAI+</Text>
            <Text style={styles.responseText}>{assistantResponse}</Text>
          </ScrollView>
        </View>
      )}

      {/* Barre d'outils */}
      <LinearGradient
        colors={['transparent', THEME.colors.background]}
        style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 15) + 10 }]}
      >
        <View style={styles.toolbarButtons}>
          {/* Photo - Désactivé */}
          <TouchableOpacity 
            style={[styles.toolButton, styles.toolButtonDisabled]}
            onPress={() => Alert.alert('Bientôt disponible', 'La capture photo sera disponible dans une prochaine version')}
          >
            <MaterialIcons name="photo-library" size={28} color={THEME.colors.textSecondary} />
          </TouchableOpacity>

          {/* Vidéo - Désactivé */}
          <TouchableOpacity 
            style={[styles.toolButton, styles.toolButtonDisabled]}
            onPress={() => Alert.alert('Bientôt disponible', 'La capture vidéo sera disponible dans une prochaine version')}
          >
            <MaterialIcons name="videocam" size={28} color={THEME.colors.textSecondary} />
          </TouchableOpacity>

          {/* Connexion/Déconnexion */}
          <TouchableOpacity 
            style={[styles.toolButton, isConnected && styles.toolButtonActive]}
            onPress={isConnected ? disconnect : connectToLiveAPI}
          >
            <MaterialIcons 
              name={isConnected ? "stop" : "mic"} 
              size={28} 
              color={isConnected ? THEME.colors.error : THEME.colors.warmGold} 
            />
          </TouchableOpacity>

          {/* Fermer */}
          <TouchableOpacity 
            style={[styles.toolButton, styles.closeButton]}
            onPress={() => {
              disconnect();
              navigation.goBack();
            }}
          >
            <MaterialIcons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Modals */}
      {renderOnboardingModal()}
      {renderHelpModal()}
      {renderContextModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.warmGold,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.error,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.error,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptionContainer: {
    paddingHorizontal: 20,
    maxHeight: 120,
  },
  transcriptionScroll: {
    maxHeight: 120,
  },
  transcriptionContent: {
    paddingVertical: 10,
  },
  transcriptionLabel: {
    fontSize: 12,
    color: THEME.colors.warmGold,
    marginBottom: 8,
    fontWeight: '600',
  },
  transcriptionText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 24,
  },
  responseContainer: {
    paddingHorizontal: 20,
    maxHeight: 150,
  },
  responseScroll: {
    maxHeight: 150,
  },
  responseContent: {
    paddingVertical: 10,
  },
  responseLabel: {
    fontSize: 12,
    color: THEME.colors.scientificBlueGreen,
    marginBottom: 8,
    fontWeight: '600',
  },
  responseText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 24,
  },
  toolbar: {
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  toolbarButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.warmGold + '40',
  },
  toolButtonActive: {
    backgroundColor: THEME.colors.warmGoldSubtle,
    borderColor: THEME.colors.warmGold,
  },
  toolButtonDisabled: {
    backgroundColor: THEME.colors.cardBackground,
    borderColor: THEME.colors.divider,
    opacity: 0.5,
  },
  closeButton: {
    backgroundColor: THEME.colors.error,
    borderColor: THEME.colors.error,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingModal: {
    width: width - 60,
    borderRadius: 24,
    overflow: 'hidden',
  },
  onboardingGradient: {
    padding: 30,
    alignItems: 'center',
  },
  onboardingEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  featuresList: {
    width: '100%',
    gap: 20,
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  startButton: {
    backgroundColor: THEME.colors.warmGold,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.background,
  },
  // 🚀 TEASER MODE STYLES
  comingSoonBadge: {
    backgroundColor: THEME.colors.warmGold + '30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: THEME.colors.warmGold,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.warmGold,
    letterSpacing: 1,
  },
  onboardingSubtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: 25,
    textAlign: 'center',
  },
  waitingMessage: {
    backgroundColor: THEME.colors.background + '60',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  waitingText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButtonTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.colors.warmGold,
    width: '100%',
    gap: 10,
  },
  backButtonTeaserText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.warmGold,
  },
  helpModal: {
    width: width - 40,
    maxHeight: height * 0.7,
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  helpContent: {
    padding: 20,
  },
  helpSection: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.warmGold,
    marginTop: 20,
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    lineHeight: 22,
  },
  contextModal: {
    width: width - 40,
    maxHeight: height * 0.8,
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
  },
  contextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  contextTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  contextContent: {
    padding: 20,
  },
  contextSection: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.warmGold,
    marginTop: 20,
    marginBottom: 10,
  },
  contextText: {
    fontSize: 14,
    color: THEME.colors.text,
    lineHeight: 22,
  },
});
