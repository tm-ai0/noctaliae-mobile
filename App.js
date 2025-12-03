// FORCE RELOAD - Build: 2025-11-08-16:00:00
// Theme version: 1.0.2
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform, Modal, Text, Animated, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { AudioModule } from 'expo-audio';
import { ThemeProvider } from './src/config/ThemeContext';
import { THEME } from './src/config/theme';
import { GlowProvider } from './src/contexts/GlowContext';
import GlobalGlowOverlay from './src/components/GlobalGlowOverlay';
import { saveDream } from './src/services/storageService';
import { transcribeAudio } from './src/services/apiService';
import LiquidGlassAnimation from './src/components/LiquidGlassAnimation';
import FABRecordButton from './src/components/FABRecordButton';
import CustomTabBar from './src/components/CustomTabBar';

import AnalysisScreen from './src/screens/AnalysisScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AtlasScreen from './src/screens/AtlasScreen';
import TrendsScreen from './src/screens/TrendsScreen';
import ChatScreen from './src/screens/ChatScreen';
import VoiceAssistantScreen from './src/screens/VoiceAssistantScreen';
import PostRecordingScreen from './src/screens/PostRecordingScreen';
import ArchivesScreen from './src/screens/ArchivesScreen';
import ConversationScreen from './src/screens/ConversationScreen';
import DeepChatScreen from './src/screens/DeepChatScreen';
import GeminiLiveScreen from './src/screens/GeminiLiveScreen';
import MetaAnalysisScreen from './src/screens/MetaAnalysisScreen';
import PersonaScreen from './src/screens/PersonaScreen';
import OnboardingWelcome from './src/screens/onboarding/OnboardingWelcome';
import OnboardingMarkers from './src/screens/onboarding/OnboardingMarkers';
import OnboardingFingerprints from './src/screens/onboarding/OnboardingFingerprints';
import PlaygroundScreen from './src/screens/PlaygroundScreen';

import { secureStorageService } from './src/services/secureStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = '@noctaliae_onboarding_completed';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

function MainTabsWithFAB({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState(''); // 🆕 Transcription live
  const [audioLevel, setAudioLevel] = useState(0); // 🆕 Niveau audio 0-1
  
  // ✅ FIX: Utiliser Recording au lieu du hook
  const recordingRef = React.useRef(null);
  
  const intervalIdRef = React.useRef(null);
  const transcriptIntervalRef = React.useRef(null); // 🆕 Pour la transcription
  const audioLevelIntervalRef = React.useRef(null); // 🆕 Pour le niveau audio

  React.useEffect(() => {
    if (isRecording) {
      intervalIdRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }
    
    return () => {
    if (intervalIdRef.current) {
    clearInterval(intervalIdRef.current);
    }
    if (transcriptIntervalRef.current) {
    clearInterval(transcriptIntervalRef.current);
    }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
    };
  }, [isRecording]);

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission refusée', 'Accès au microphone requis', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // ✅ Créer une nouvelle instance Recording avec expo-av
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      
      setIsRecording(true);
      setDuration(0);
      setLiveTranscript(''); // Reset transcript
      setAudioLevel(0);
      
      // 🆕 Simuler la transcription live (remplacer par vraie API)
      startLiveTranscription();
      
      // 🆕 Simuler le niveau audio (remplacer par vraie API)
      startAudioLevelDetection();
    } catch (err) {
      console.error('❌ Erreur:', err);
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
    }
  }

  // 🎤 Simulation niveau audio (expo-audio ne supporte pas metering pour l'instant)
  async function startAudioLevelDetection() {
    audioLevelIntervalRef.current = setInterval(() => {
      // Simulation : remplacer par vraie API quand expo-audio supportera metering
      const randomLevel = 0.2 + Math.random() * 0.5;
      setAudioLevel(randomLevel);
    }, 100); // Update toutes les 100ms pour plus de fluidité
  }

  // 🆕 SIMULATION transcription live (remplacer par API réelle)
  function startLiveTranscription() {
    const words = [
      'Je', 'me', 'souviens', 'de', 'ce', 'rêve...', 
      'où', 'je', 'marchais', 'dans', 'un', 'couloir', 'sombre...',
      'Les', 'murs', 'étaient', 'couverts', 'de', 'miroirs...',
      'et', 'chaque', 'reflet', 'montrait', 'une', 'version', 'différente', 'de', 'moi...'
    ];
    
    let index = 0;
    transcriptIntervalRef.current = setInterval(() => {
      if (index < words.length) {
        setLiveTranscript(prev => prev + (prev ? ' ' : '') + words[index]);
        index++;
      } else {
        if (transcriptIntervalRef.current) {
          clearInterval(transcriptIntervalRef.current);
          transcriptIntervalRef.current = null;
        }
      }
    }, 800); // Un mot toutes les 800ms
  }

  async function stopRecording() {
    if (!isRecording || !recordingRef.current) return;

    try {
      setIsRecording(false);
      
      // 🆕 Arrêter la transcription live et l'audio level
      if (transcriptIntervalRef.current) {
        clearInterval(transcriptIntervalRef.current);
        transcriptIntervalRef.current = null;
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
        audioLevelIntervalRef.current = null;
      }
      setAudioLevel(0);
      
      // ✅ Arrêter l'enregistrement et récupérer l'URI
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (!uri || typeof uri !== 'string') {
        Alert.alert('Erreur', 'Fichier audio non créé ou URI invalide', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
        return;
      }

      setIsTranscribing(true);
      const transcript = await transcribeAudio(uri);
      const newDream = await saveDream(uri, transcript);
      setIsTranscribing(false);
      
      navigation.navigate('PostRecording', {
        dreamId: newDream.id,
        audioUri: uri,
        transcription: transcript,
        duration: duration
      });

      setDuration(0);
      recordingRef.current = null;
    } catch (err) {
      console.error('❌ Erreur:', err);
      Alert.alert('Erreur', 'Échec de la transcription', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
      setIsTranscribing(false);
    }
  }

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Analyses" 
          component={AnalysisScreen}
          options={{
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="brain" size={32} color={color} />,
            tabBarLabel: 'Analyses',
          }}
        />
        
        <Tab.Screen 
          name="Trends" 
          component={TrendsScreen}
          options={{
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="trending-up" size={32} color={color} />,
            tabBarLabel: 'Tendances',
          }}
        />
        
        <Tab.Screen 
          name="Atlas" 
          component={AtlasScreen}
          options={{
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map-marker-path" size={32} color={color} />,
            tabBarLabel: 'Atlas',
          }}
        />
        
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cog-outline" size={32} color={color} />,
            tabBarLabel: 'Paramètres',
          }}
        />
      </Tab.Navigator>

      {/* FAB Central style Omi avec Liquid Glass */}
      {!isRecording && !isTranscribing && (
        <View style={styles.fabContainer}>
          <FABRecordButton onPress={startRecording} />
        </View>
      )}

      {/* Modal Enregistrement */}
      <Modal
        visible={isRecording || isTranscribing}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.recordingModal}>
            {/* Liquid Glass Animation Réactive */}
            {isRecording && <LiquidGlassAnimation isRecording={isRecording} audioLevel={audioLevel} />}

            <Text style={styles.timer}>{formatDuration(duration)}</Text>
          
          {/* 🆕 TRANSCRIPTION LIVE */}
          {liveTranscript.length > 0 && (
            <View style={styles.liveTranscriptContainer}>
              <Text style={styles.liveTranscriptLabel}>🗣️ Transcription en cours...</Text>
              <ScrollView 
                style={styles.liveTranscriptScroll}
                contentContainerStyle={styles.liveTranscriptContent}
              >
                <Text style={styles.liveTranscriptText}>{liveTranscript}</Text>
              </ScrollView>
            </View>
          )}
            
            {isTranscribing ? (
              <>
                <Text style={styles.recordingInstruction}>Transcription en cours...</Text>
                <ActivityIndicator color={THEME.colors.primary} size="large" style={{ marginTop: 20 }} />
              </>
            ) : (
              <>
                <Text style={styles.recordingInstruction}>Racontez votre rêve...</Text>
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopRecording}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="stop" size={48} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

function MainStack() {
  const [initialRoute, setInitialRoute] = React.useState(null);

  React.useEffect(() => {
    checkOnboardingStatus();
  }, []);

  async function checkOnboardingStatus() {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      setInitialRoute(completed === 'true' ? 'MainTabs' : 'OnboardingWelcome');
    } catch (error) {
      console.error('❌ Erreur vérification onboarding:', error);
      setInitialRoute('MainTabs'); // Par défaut si erreur
    }
  }

  if (!initialRoute) {
    return null; // Ou un splash screen
  }

  return (
    <Stack.Navigator 
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MainTabs" component={MainTabsWithFAB} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ presentation: 'modal', title: 'ChatScreen.js' }} />
      <Stack.Screen name="VoiceAssistant" component={VoiceAssistantScreen} options={{ presentation: 'modal', title: 'VoiceAssistantScreen.js' }} />
      <Stack.Screen name="PostRecording" component={PostRecordingScreen} options={{ presentation: 'card', title: 'PostRecordingScreen.js' }} />
      <Stack.Screen name="Archives" component={ArchivesScreen} options={{ presentation: 'card', title: 'ArchivesScreen.js' }} />
      <Stack.Screen name="Conversation" component={ConversationScreen} options={{ presentation: 'card', title: 'ConversationScreen.js' }} />
      <Stack.Screen name="DeepChat" component={DeepChatScreen} options={{ presentation: 'card', title: 'DeepChatScreen.js' }} />
      <Stack.Screen name="GeminiLive" component={GeminiLiveScreen} options={{ presentation: 'card', title: 'GeminiLiveScreen.js' }} />
      <Stack.Screen name="MetaAnalysis" component={MetaAnalysisScreen} options={{ presentation: 'card', title: 'MetaAnalysisScreen.js' }} />
      <Stack.Screen name="Persona" component={PersonaScreen} options={{ presentation: 'card', title: 'PersonaScreen.js' }} />
      <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcome} options={{ headerShown: false, title: 'OnboardingWelcome.js' }} />
      <Stack.Screen name="OnboardingMarkers" component={OnboardingMarkers} options={{ headerShown: false, title: 'OnboardingMarkers.js' }} />
      <Stack.Screen name="OnboardingFingerprints" component={OnboardingFingerprints} options={{ headerShown: false, title: 'OnboardingFingerprints.js' }} />
      <Stack.Screen name="Playground" component={PlaygroundScreen} options={{ presentation: 'card', title: '🎨 Playground' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  // 🔄 Migration vers stockage sécurisé au démarrage
  React.useEffect(() => {
    secureStorageService.migrateFromAsyncStorage();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <GlowProvider>
          <GlobalGlowOverlay />
          <NavigationContainer>
            <MainStack />
          </NavigationContainer>
        </GlowProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 105, // 150 - 45 = 105
    left: width / 2 - 45,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#00FFB0',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.8, // Plus intense !
        shadowRadius: 30, // Plus large !
      },
      android: {
        elevation: 20, // Plus élevé !
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: THEME.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingModal: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  recordingText: {
    fontSize: 16,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  liveTranscriptContainer: {
    marginTop: 30,
    width: width - 60,
    maxHeight: 200,
    backgroundColor: 'rgba(0, 255, 176, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 176, 0.2)',
    padding: 15,
  },
  liveTranscriptLabel: {
    fontSize: 14,
    color: THEME.colors.primary,
    fontWeight: '600',
    marginBottom: 10,
  },
  liveTranscriptScroll: {
    maxHeight: 150,
  },
  liveTranscriptContent: {
    paddingBottom: 10,
  },
  liveTranscriptText: {
    fontSize: 16,
    color: THEME.colors.textPrimary,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  timer: {
    fontSize: 64,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginBottom: 20,
  },
  recordingInstruction: {
    fontSize: 18,
    color: THEME.colors.textSecondary,
    marginBottom: 40,
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.error,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
});
