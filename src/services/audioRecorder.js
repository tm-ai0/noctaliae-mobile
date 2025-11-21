import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

class AudioRecorderService {
  constructor() {
    this.recording = null;
    this.sound = null;
    this.isRecording = false;
    this.isPaused = false;
  }

  // Initialiser les permissions et le mode audio
  async initialize() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission microphone refusée');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      return true;
    } catch (error) {
      console.error('Erreur initialisation audio:', error);
      throw error;
    }
  }

  // Démarrer l'enregistrement
  async startRecording() {
    try {
      if (this.isRecording) {
        console.log('Enregistrement déjà en cours');
        return;
      }

      await this.initialize();

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      this.recording = recording;
      this.isRecording = true;
      this.isPaused = false;

      console.log('✅ Enregistrement démarré');
      return recording;
    } catch (error) {
      console.error('Erreur démarrage enregistrement:', error);
      throw error;
    }
  }

  // Arrêter l'enregistrement et sauvegarder
  async stopRecording() {
    try {
      if (!this.recording) {
        throw new Error('Aucun enregistrement en cours');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      this.isRecording = false;
      this.isPaused = false;
      this.recording = null;

      console.log('🛑 Enregistrement arrêté:', uri);
      return uri;
    } catch (error) {
      console.error('Erreur arrêt enregistrement:', error);
      throw error;
    }
  }

  // Obtenir la durée de l'enregistrement en cours
  async getRecordingStatus() {
    if (!this.recording) return null;
    
    try {
      const status = await this.recording.getStatusAsync();
      return {
        duration: status.durationMillis,
        isRecording: status.isRecording,
        isDoneRecording: status.isDoneRecording,
      };
    } catch (error) {
      console.error('Erreur statut enregistrement:', error);
      return null;
    }
  }

  // Jouer un enregistrement
  async playRecording(uri) {
    try {
      // Nettoyer le son précédent si existant
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      this.sound = sound;

      // Callback quand la lecture est terminée
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          console.log('🎵 Lecture terminée');
        }
      });

      console.log('🔊 Lecture démarrée');
      return sound;
    } catch (error) {
      console.error('Erreur lecture audio:', error);
      throw error;
    }
  }

  // Arrêter la lecture
  async stopPlayback() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        console.log('⏹️ Lecture arrêtée');
      }
    } catch (error) {
      console.error('Erreur arrêt lecture:', error);
      throw error;
    }
  }

  // Obtenir des infos sur un fichier audio
  async getAudioInfo(uri) {
    try {
      const info = await FileSystem.getInfoAsync(uri, { size: true });
      return info;
    } catch (error) {
      console.error('Erreur info fichier:', error);
      return {
        exists: true,
        size: 0,
        uri: uri,
      };
    }
  }

  // Nettoyer toutes les ressources
  async cleanup() {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      this.isRecording = false;
      this.isPaused = false;
    } catch (error) {
      console.error('Erreur nettoyage:', error);
    }
  }
}

// Export d'une instance singleton
export default new AudioRecorderService();
