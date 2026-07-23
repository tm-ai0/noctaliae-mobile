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
  Dimensions,
  Image,
  Modal,
  Pressable,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import DreamShareCard, { CARD_WIDTH, CARD_HEIGHT } from '../components/DreamShareCard';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { chatWithDream, chatWithDreamAndImage, transcribeAudio } from '../services/apiService';
import { MarkdownText } from '../components/MarkdownText';
import { THEME } from '../config/theme';
import { saveConversation, loadConversation, clearConversation } from '../services/conversationService';
import { deleteDream, archiveDream, setDreamSecret, getDream } from '../services/storageService';
import { premiumService } from '../services/premiumService';
import { ActivateDeepDreamModal } from '../modals/ActivateDeepDreamModal';
import DebugScreenLabel from '../components/DebugScreenLabel';
import { useNoctaliaeAlert } from '../components/NoctaliaeAlert';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const SCREEN_WIDTH = Dimensions.get('window').width;

// 🧠 GÉNÉRATEUR DE SUGGESTIONS INTELLIGENTES
function generateSmartSuggestions(analysis, transcription) {
  if (i18next.language !== 'fr') return [];
  const text = (analysis + ' ' + transcription).toLowerCase();
  const suggestions = [];
  
  const themes = {
    transformation: ['transform', 'devenir', 'métamorphose', 'changé en', 'souris', 'animal', 'corps'],
    flying: ['vol', 'voler', 'ailes', 'ailée', 'envol', 'lévite', 'flotter'],
    chase: ['poursuivi', 'fuite', 'courir', 'échapper', 'pourchassé'],
    water: ['eau', 'nager', 'mer', 'océan', 'noyade', 'piscine', 'rivière'],
    falling: ['chute', 'tomber', 'précipice', 'vide'],
    death: ['mort', 'mourir', 'décès', 'funérailles'],
    family: ['famille', 'mère', 'père', 'frère', 'sœur', 'enfant', 'parent'],
    work: ['travail', 'bureau', 'collègue', 'patron', 'réunion'],
    school: ['école', 'examen', 'cours', 'professeur', 'étudiant'],
    love: ['amour', 'relation', 'couple', 'ex', 'mariage', 'séparation'],
    nightmare: ['cauchemar', 'terreur', 'horreur', 'effroi', 'peur'],
    lucid: ['lucide', 'conscient', 'contrôle', 'réalisé que je rêvais'],
    place: ['maison', 'supermarché', 'magasin', 'ville', 'forêt', 'montagne'],
    stranger: ['inconnu', 'étranger', 'visage', 'silhouette'],
    vehicle: ['voiture', 'avion', 'train', 'conduire', 'accident']
  };
  
  const themeQuestions = {
    transformation: ["Pourquoi cette transformation ?", "Que représente cet animal ?", "Quel pouvoir recherchez-vous ?"],
    flying: ["Que symbolise ce vol ?", "Quelle liberté recherchez-vous ?", "Sensation de contrôle ?"],
    chase: ["Que fuyez-vous ?", "Qui vous poursuit ?", "Quelle peur se cache ?"],
    water: ["Que représente cette eau ?", "Quelles émotions submergées ?", "Contrôle ou lâcher-prise ?"],
    falling: ["Peur de perdre le contrôle ?", "Que symbolise cette chute ?", "Anxiété actuelle ?"],
    death: ["Quelle fin symbolique ?", "Transformation en cours ?", "Peur ou acceptation ?"],
    family: ["Quel message familial ?", "Relation à explorer ?", "Besoin non exprimé ?"],
    work: ["Stress professionnel ?", "Ambition ou pression ?", "Conflit à résoudre ?"],
    school: ["Peur du jugement ?", "Défi à relever ?", "Sentiment d'impréparation ?"],
    love: ["Besoin affectif ?", "Relation à questionner ?", "Désir ou crainte ?"],
    nightmare: ["Source de cette peur ?", "Message de l'inconscient ?", "Comment l'apprivoiser ?"],
    lucid: ["Comment prolonger la lucidité ?", "Que vouliez-vous explorer ?", "Techniques à développer ?"],
    place: ["Pourquoi ce lieu ?", "Souvenir associé ?", "Que cherchez-vous là ?"],
    stranger: ["Qui est cet inconnu ?", "Partie de vous-même ?", "Message à décoder ?"],
    vehicle: ["Où allez-vous ?", "Contrôle de votre vie ?", "Destination symbolique ?"]
  };
  
  // Détecter les thèmes présents (avec word boundaries pour éviter faux positifs)
  const detectedThemes = [];
  for (const [theme, keywords] of Object.entries(themes)) {
    // Regex word boundary : "vol" ne matche PAS "évolution"
    if (keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(text))) {
      detectedThemes.push(theme);
    }
  }
  
  // Ajouter les questions des thèmes détectés
  detectedThemes.forEach(theme => {
    const questions = themeQuestions[theme] || [];
    questions.forEach(q => {
      if (suggestions.length < 3 && !suggestions.includes(q)) {
        suggestions.push(q);
      }
    });
  });
  
  // Fallback générique si pas assez
  const genericQuestions = [
    "Quelle émotion domine ?",
    "Lien avec votre vie actuelle ?",
    "Message de l'inconscient ?",
    "Que dit la neuroscience ?",
    "Symbole à explorer ?",
    "Récurrence de ce thème ?"
  ];
  
  while (suggestions.length < 3) {
    const randomQ = genericQuestions[Math.floor(Math.random() * genericQuestions.length)];
    if (!suggestions.includes(randomQ)) {
      suggestions.push(randomQ);
    }
  }
  
  return suggestions.slice(0, 3);
}

// 🏆 NETTOYER METADATA "STYLE: ..." du contenu IA
function cleanAIResponse(text) {
  if (!text) return text;
  // Supprimer ligne "STYLE: ..." à la fin
  return text.replace(/\n*STYLE:.*$/i, '').trim();
}

export default function DeepChatScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { dreamId, dreamAnalysis: initialAnalysis, dreamTranscription, dreamTitle, suggestedQuestions: initialSuggestions, dreamImagePalette, initialMessage, dreamImageUrl, dreamDate, dreamTags } = route.params;
  
  // 🎨 AMBIENT PALETTE — le rêve éclaire la conversation
  const palette = dreamImagePalette || [];
  const ambientColor = palette[0] || null; // Couleur dominante du rêve
  const ambientSecondary = palette[1] || ambientColor; // Couleur secondaire
  const hasAmbient = ambientColor !== null;
  const { showAlert, AlertComponent } = useNoctaliaeAlert();
  const { t } = useTranslation();

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
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama');
  const [modelSelectorExpanded, setModelSelectorExpanded] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [isSecret, setIsSecret] = useState(false);
  
  const [dreamAnalysis] = useState(initialAnalysis);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  
  // États vocal
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recordingRef = useRef(null);
  const scrollViewRef = useRef();
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  
  // 📷 États image (bouton "+")
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // 📤 Share
  const [isSharing, setIsSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareCardRef = useRef(null);

  // 🔄 Charger statut Premium et présélectionner modèle
  useEffect(() => {
    const loadPremiumStatus = async () => {
      const status = await premiumService.isPremium();
      setIsPremium(status);
      setSelectedModel(status ? 'claude' : 'llama');
    };
    loadPremiumStatus();
  }, []);

  // 🔐 Charger le statut secret au montage
  useEffect(() => {
    const loadSecretStatus = async () => {
      try {
        const dream = await getDream(dreamId);
        if (dream) setIsSecret(dream.isSecret || false);
      } catch (error) {
        console.error('❌ Erreur chargement statut secret:', error);
      }
    };
    loadSecretStatus();
  }, [dreamId]);

  // 🔐 Toggle secret
  const handleToggleSecret = async () => {
    try {
      const newStatus = !isSecret;
      await setDreamSecret(dreamId, newStatus);
      setIsSecret(newStatus);
      showAlert({
        type: 'success',
        title: newStatus ? t('deepChat.secretOn_title') : t('deepChat.secretOff_title'),
        message: newStatus ? t('deepChat.secretOn_msg') : t('deepChat.secretOff_msg'),
        confirmText: t('common.ok')
      });
    } catch (error) {
      console.error('❌ Erreur toggle secret:', error);
    }
  };

  // 🏆 Activer DeepDream depuis le modal
  const handleActivateDeepDream = async () => {
    await premiumService.enablePremium();
    setIsPremium(true);
    setSelectedModel('claude');
    setShowActivateModal(false);
    navigation.navigate('Settings');
  };

  // 💡 PRÉ-REMPLIR inputText avec initialMessage (tap-to-send depuis ConversationScreen)
  const initialMessageSentRef = useRef(false);
  useEffect(() => {
    if (initialMessage && !initialMessageSentRef.current && !isLoadingConversation) {
      initialMessageSentRef.current = true;
      setInputText(initialMessage);
    }
  }, [initialMessage, isLoadingConversation]);

  // 🏆 SUGGESTIONS (backend ou fallback local)
  useEffect(() => {
    if (initialSuggestions && Array.isArray(initialSuggestions) && initialSuggestions.length > 0) {
      console.log('✅ Suggestions du backend:', initialSuggestions);
      setSuggestedQuestions(initialSuggestions.slice(0, 3));
    } else if (dreamAnalysis && typeof dreamAnalysis === 'string') {
      console.log('⚠️ Fallback suggestions locales');
      const suggestions = generateSmartSuggestions(dreamAnalysis, dreamTranscription);
      setSuggestedQuestions(suggestions);
    }
  }, [initialSuggestions, dreamAnalysis, dreamTranscription]);

  // 🏆 CHARGER CONVERSATION SAUVEGARDÉE
  useEffect(() => {
    async function loadSavedConversation() {
      try {
        const savedMessages = await loadConversation(dreamId);
        if (savedMessages && savedMessages.length > 0) {
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

  // 🏆 SCROLL INTELLIGENT : Seulement sauvegarder, PAS de scroll auto pour réponses IA
  useEffect(() => {
    if (!isLoadingConversation && messages.length > 0) {
      saveConversation(dreamId, messages, dreamTitle);
    }
  }, [messages, dreamId, dreamTitle, isLoadingConversation]);

  // 🏆 Scroll complet pour messages USER
  const scrollToBottomForUserMessage = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // 🏆 SCROLL INTELLIGENT pour réponses IA
  // Objectif : garder le message user visible en top + montrer max de la réponse IA
  const scrollMinimalToShowAIResponse = () => {
    setTimeout(() => {
      // Calculer la position optimale : pas tout en bas, mais assez pour voir le début de la réponse
      // On scroll jusqu'à : contenu total - hauteur viewport - 150px (pour garder user message visible)
      if (contentHeight > 0 && scrollViewHeight > 0) {
        const targetPosition = Math.max(0, contentHeight - scrollViewHeight - 150);
        scrollViewRef.current?.scrollTo({ 
          y: targetPosition, 
          animated: true 
        });
      }
    }, 200);
  };

  // 📷 FONCTIONS IMAGE (bouton "+")
  const handleTakePhoto = async () => {
    setShowImagePicker(false);
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert({
        type: 'error',
        title: t('deepChat.permCamera_title'),
        message: t('deepChat.permCamera_msg'),
        confirmText: t('common.ok')
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });
    
    if (!result.canceled && result.assets[0]) {
      setSelectedImage({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        width: result.assets[0].width,
        height: result.assets[0].height,
      });
    }
  };
  
  const handleChooseFromGallery = async () => {
    setShowImagePicker(false);

    // Le Photo Picker natif Android (API 33+) ne nécessite aucune permission :
    // ne pas appeler requestMediaLibraryPermissionsAsync() ici (policy Google Play).
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });
    
    if (!result.canceled && result.assets[0]) {
      setSelectedImage({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        width: result.assets[0].width,
        height: result.assets[0].height,
      });
    }
  };
  
  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  async function startVoiceRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        showAlert({
          type: 'error',
          title: t('deepChat.permMic_title'),
          message: t('deepChat.permMic_msg'),
          confirmText: t('common.ok')
        });
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
      showAlert({
        type: 'error',
        title: t('common.error'),
        message: t('deepChat.errRecording_msg'),
        confirmText: t('common.ok')
      });
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
      showAlert({
        type: 'error',
        title: t('common.error'),
        message: t('deepChat.errVoice_msg'),
        confirmText: t('common.ok')
      });
    } finally {
      setIsTranscribing(false);
      recordingRef.current = null;
    }
  }

  async function handleSendMessage(messageText) {
    const textToSend = messageText || inputText.trim();
    const hasImage = selectedImage !== null;
    
    // Au moins du texte OU une image
    if (!textToSend && !hasImage) return;

    setInputText('');
    Keyboard.dismiss();
    
    // 📷 Message user avec image optionnelle
    const newUserMessage = {
      role: 'user',
      content: textToSend || '🖼️ Image envoyée',
      timestamp: Date.now(),
      imageUri: hasImage ? selectedImage.uri : null
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    scrollToBottomForUserMessage();
    setIsLoading(true);
    
    // Récupérer l'image avant de la clear
    const imageToSend = hasImage ? selectedImage.base64 : null;
    setSelectedImage(null); // Clear l'image après envoi

    try {
      const isPremium = selectedModel === 'claude';
      const conversationHistory = messages.slice(-20).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      let response;
      
      // 📷 Si image présente → Claude Vision
      if (imageToSend) {
        console.log('🖼️ Envoi avec image vers Claude Vision...');
        response = await chatWithDreamAndImage(
          dreamTranscription,
          dreamAnalysis,
          conversationHistory,
          textToSend || 'Analyse cette image en lien avec mon rêve.',
          imageToSend
        );
      } else {
        // 🐛 FIX: Si c'est le 1er message et vient d'un initialMessage (tap-to-send depuis ConversationScreen),
        // contextualiser pour que l'IA comprenne que c'est le RÊVEUR qui explore sa propre question
        const isFirstUserMessage = conversationHistory.filter(m => m.role === 'user').length === 0;
        const messageForApi = (initialMessage && isFirstUserMessage)
          ? `Je suis le rêveur. Je souhaite explorer cette question sur mon propre rêve : ${textToSend}`
          : textToSend;

        response = await chatWithDream(
          dreamTranscription,
          dreamAnalysis,
          conversationHistory,
          messageForApi,
          isPremium
        );
      }

      // 🏆 NETTOYER le contenu IA (virer "STYLE: ...")
      const cleanedResponse = cleanAIResponse(response.response);

      const assistantMessage = {
        role: 'assistant',
        content: cleanedResponse,
        timestamp: Date.now(),
        model: response.model
      };

      setMessages(prev => [...prev, assistantMessage]);
      scrollMinimalToShowAIResponse();

      if (response.suggestedQuestions && Array.isArray(response.suggestedQuestions)) {
        setSuggestedQuestions(response.suggestedQuestions.slice(0, 3));
      } else {
        const newSuggestions = generateSmartSuggestions(cleanedResponse, dreamTranscription);
        setSuggestedQuestions(newSuggestions);
      }
    } catch (error) {
      console.error('❌ Erreur chat:', error);
      showAlert({
        type: 'error',
        title: t('common.error'),
        message: error.message || t('deepChat.errChat_fallback'),
        confirmText: t('common.ok')
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend() {
    await handleSendMessage();
  }

  async function handleRestart() {
    showAlert({
      type: 'confirm',
      title: t('deepChat.restartAlert_title'),
      message: t('deepChat.restartAlert_msg'),
      confirmText: t('deepChat.restartAlert_confirm'),
      cancelText: t('deepChat.restartAlert_cancel'),
      onConfirm: async () => {
        await clearConversation(dreamId);
        setMessages([{
          role: 'assistant',
          content: t('deepChat.initialMessage'),
          timestamp: Date.now()
        }]);
        const newSuggestions = generateSmartSuggestions(dreamAnalysis, dreamTranscription);
        setSuggestedQuestions(newSuggestions);
      }
    });
  }

  // ============================================
  // 📄 EXPORT PDF ENRICHI (avec conversation)
  // ============================================
  const generateEnrichedPdfHtml = () => {
    const now = new Date();
    const exportDate = now.toLocaleDateString(i18next.language, { 
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    // Transcription
    const transcription = dreamTranscription?.trim() || 'Récit non disponible';
    
    // Analyse (markdown → HTML)
    let analysisText = dreamAnalysis || 'Analyse non disponible';
    analysisText = analysisText
      .replace(/### (.*)/g, '<h4>$1</h4>')
      .replace(/## (.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/---/g, '<hr/>')
      .replace(/\n/g, '<br/>');
    
    // Historique conversation (si > 1 message)
    let conversationHtml = '';
    const realMessages = messages.filter(m => m.content !== 'Explorons ensemble votre rêve en profondeur. Quelle dimension souhaitez-vous approfondir ?');
    
    if (realMessages.length > 0) {
      const messagesHtml = realMessages.map(msg => {
        const isUser = msg.role === 'user';
        const cleanContent = msg.content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\n/g, '<br/>');
        
        return `
          <div class="message ${isUser ? 'user' : 'assistant'}">
            <div class="message-label">${isUser ? '👤 Vous' : '🧠 Noctaliæ'}</div>
            <div class="message-content">${cleanContent}</div>
          </div>
        `;
      }).join('');
      
      conversationHtml = `
        <div class="section">
          <h2>💬 Exploration approfondie</h2>
          <div class="conversation-container">
            ${messagesHtml}
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
          .logo { font-size: 32px; font-weight: 700; color: #D2B14C; margin-bottom: 10px; }
          .title { font-size: 24px; font-weight: 600; color: #00FFB0; margin-bottom: 10px; }
          .subtitle { color: #A0B4D4; font-size: 14px; }
          .meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 15px;
            background: #1a1f3a;
            border-radius: 12px;
          }
          .meta-item { display: flex; align-items: center; gap: 8px; }
          .meta-label { color: #A0B4D4; font-size: 12px; }
          .meta-value { color: #FFFFFF; font-weight: 600; }
          .section { margin-bottom: 30px; }
          .section h2 {
            color: #D2B14C;
            font-size: 18px;
            margin-bottom: 15px;
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
          
          /* Conversation */
          .conversation-container { background: #1a1f3a; border-radius: 12px; padding: 15px; }
          .message { margin-bottom: 15px; padding: 12px; border-radius: 10px; }
          .message.user { background: #00FFB020; border-left: 3px solid #00FFB0; }
          .message.assistant { background: #D2B14C10; border-left: 3px solid #D2B14C; }
          .message-label { font-size: 11px; font-weight: 700; color: #A0B4D4; margin-bottom: 6px; }
          .message-content { color: #E0E0E0; font-size: 14px; line-height: 1.5; }
          
          /* Réflexion */
          .reflection-container { background: #1a1f3a; padding: 20px; border-radius: 12px; }
          .reflection-item { color: #A0B4D4; margin-bottom: 12px; font-size: 14px; }
          
          /* Notes */
          .notes-container { background: #1a1f3a; padding: 20px; border-radius: 12px; min-height: 150px; }
          .notes-line { border-bottom: 1px dashed #2a2f4a; height: 30px; }
          
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
            <div class="subtitle">Rapport complet d'exploration</div>
          </div>
          
          <div class="meta">
            <div class="meta-item">
              <span class="meta-label">📅 Exporté le</span>
              <span class="meta-value">${exportDate}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">💬 Exploration</span>
              <span class="meta-value">${realMessages.length} questions</span>
            </div>
          </div>
          
          <div class="section">
            <h2>📝 Récit du rêve</h2>
            <div class="section-content">${transcription}</div>
          </div>
          
          <div class="section">
            <h2>🧠 Analyse scientifique</h2>
            <div class="section-content">${analysisText}</div>
          </div>
          
          ${conversationHtml}
          
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
      const html = generateEnrichedPdfHtml();
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Rapport: ${dreamTitle}`,
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (error) {
      console.error('❌ Erreur export PDF:', error);
      showAlert({
        type: 'error',
        title: t('common.error'),
        message: t('deepChat.errPdf_msg'),
        confirmText: t('common.ok')
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ============================================
  // 📤 PARTAGE CARTE VISUELLE
  // ============================================
  const handleShareFriendlyText = async () => {
    try {
      const tagsLine = dreamTags?.length
        ? dreamTags.slice(0, 3).map(tag => `#${tag.toLowerCase().replace(/\s+/g, '')}`).join(' ')
        : '';
      const lines = [
        `\ud83c\udf19 ${dreamTitle}`,
        tagsLine ? `\n${tagsLine}` : '',
        `\nExplor\u00e9 avec Noctali\u00e6 \u2014 nocty.thomasmaury.fr`,
      ].filter(Boolean).join('\n');
      await Share.share({ message: lines, title: dreamTitle });
    } catch (error) {
      console.error('\u274c Erreur partage texte DeepChat:', error);
    }
  };

  const handleShareFriendly = async () => {
    if (!shareCardRef.current) {
      await handleShareFriendlyText();
      return;
    }
    try {
      setIsSharing(true);
      await new Promise(r => setTimeout(r, 600));
      const capturedUri = await shareCardRef.current.capture();
      const filename = `noctaliae_dream_${Date.now()}.jpg`;
      const destUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.copyAsync({ from: capturedUri, to: destUri });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(destUri, {
          mimeType: 'image/jpeg',
          dialogTitle: dreamTitle,
          UTI: 'public.jpeg',
        });
      }
    } catch (err) {
      console.error('\u274c Share card error DeepChat, fallback texte:', err);
      await handleShareFriendlyText();
    } finally {
      setIsSharing(false);
    }
  };

  // ============================================
  // 🗑️ SUPPRIMER LE RÊVE
  // ============================================
  const handleDelete = () => {
    showAlert({
      type: 'confirm',
      title: t('deepChat.deleteAlert_title'),
      message: t('deepChat.deleteAlert_msg'),
      confirmText: t('deepChat.deleteAlert_confirm'),
      cancelText: t('deepChat.deleteAlert_cancel'),
      onConfirm: async () => {
        try {
          await clearConversation(dreamId);
          await deleteDream(dreamId);
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        } catch (error) {
          console.error('❌ Erreur suppression:', error);
          showAlert({
            type: 'error',
            title: t('common.error'),
            message: t('deepChat.errDelete_msg'),
            confirmText: t('common.ok')
          });
        }
      }
    });
  };

  const handleArchive = () => {
    showAlert({
      type: 'confirm',
      title: t('deepChat.archiveAlert_title'),
      message: t('deepChat.archiveAlert_msg'),
      confirmText: t('deepChat.archiveAlert_confirm'),
      cancelText: t('deepChat.archiveAlert_cancel'),
      onConfirm: async () => {
        try {
          await archiveDream(dreamId);
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        } catch (error) {
          console.error('❌ Erreur archivage:', error);
          showAlert({
            type: 'error',
            title: t('common.error'),
            message: t('deepChat.errArchive_msg'),
            confirmText: t('common.ok')
          });
        }
      }
    });
  };

  function renderMessage(message, index) {
    const isUser = message.role === 'user';
    // 💡 Chips initiales : seulement sous le 1er message IA, tant qu'aucun échange réel
    const showInitialChips = index === 0 && !isUser && messages.length === 1 && suggestedQuestions.length > 0;
    
    return (
      <View 
        key={index}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer
        ]}
      >
        <View style={[
          styles.messageBubble, 
          isUser ? styles.userBubble : styles.assistantBubble,
          !isUser && hasAmbient && { borderColor: ambientColor + '25' }
        ]}>
          {/* 📷 Image dans le message (si présente) */}
          {message.imageUri && (
            <Image 
              source={{ uri: message.imageUri }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          
          {isUser ? (
            <Text style={styles.userText}>{message.content}</Text>
          ) : (
            <MarkdownText style={styles.assistantText}>{message.content}</MarkdownText>
          )}
          
          {/* 🏆 BADGE avec icône Material */}
          {message.model && (
            <View style={styles.modelBadgeContainer}>
              <MaterialIcons 
                name={message.model === 'claude-vision' ? 'visibility' : message.model === 'claude' ? 'science' : message.model === 'gemini' ? 'psychology' : 'flash-on'} 
                size={14} 
                color={THEME.colors.textSecondary}
              />
              <Text style={styles.modelBadgeText}>
                {message.model === 'claude-vision' ? 'Vision' :
                 message.model === 'claude' ? 'DeepDream' : 
                 message.model === 'gemini' ? 'NoctaliaeAI+' : 
                 'QuickDream'}
              </Text>
            </View>
          )}
        </View>

        {/* 💡 Chips tap-to-send sous le 1er message IA */}
        {showInitialChips && (
          <View style={styles.initialChipsWrapper}>
            {suggestedQuestions.map((q, i) => (
              <TouchableOpacity
                key={i}
                style={styles.initialChip}
                activeOpacity={0.7}
                onPress={() => handleSendMessage(q)}
              >
                <Text style={styles.initialChipText}>{q}</Text>
                <MaterialIcons name="arrow-forward" size={13} color={THEME.colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  const ContainerComponent = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const containerProps = Platform.OS === 'ios' ? { behavior: 'padding', keyboardVerticalOffset: 0 } : {};

  // 🏆 LOGIQUE BOUTON DYNAMIQUE (WhatsApp style)
  const hasText = inputText.trim().length > 0;
  const isInputDisabled = isLoading || isRecording || isTranscribing;

  return (
    <ContainerComponent style={styles.container} {...containerProps}>
      <DebugScreenLabel screenName="🔍 Approfondir" />
      
      {/* 🏆 HEADER */}
      <View style={[
        styles.header, 
        { paddingTop: Math.max(insets.top, 15) + 15 },
        hasAmbient && { borderBottomColor: ambientColor + '40' }
      ]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('deepChat.title')}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{dreamTitle}</Text>
        </View>

        <TouchableOpacity 
          onPress={() => setShowShareMenu(true)}
          style={styles.iconButton}
          disabled={isSharing || isExportingPdf}
        >
          {isSharing || isExportingPdf ? (
            <ActivityIndicator size="small" color={THEME.colors.primary} />
          ) : (
            <MaterialIcons name="ios-share" size={24} color={THEME.colors.primary} />
          )}
        </TouchableOpacity>

        {/* 🔐 Bouton Secret */}
        <TouchableOpacity 
          onPress={handleToggleSecret}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons 
            name={isSecret ? "lock" : "lock-open-outline"} 
            size={24} 
            color={isSecret ? '#8B5CF6' : THEME.colors.textSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleArchive}
          style={styles.iconButton}
        >
          <MaterialIcons name="archive" size={24} color={THEME.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestart} style={styles.iconButton}>
          <MaterialIcons name="restart-alt" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>


      {/* 🏆 MESSAGES + AMBIENT GLOW */}
      <View style={styles.messagesWrapper}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={(width, height) => setContentHeight(height)}
          onLayout={(event) => setScrollViewHeight(event.nativeEvent.layout.height)}
        >
          {messages.map((msg, index) => renderMessage(msg, index))}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={THEME.colors.primary} size="small" />
              <Text style={styles.loadingText}>{t('deepChat.loading')}</Text>
            </View>
          )}

          {isTranscribing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={THEME.colors.warmGold} size="small" />
              <Text style={styles.loadingText}>{t('deepChat.transcribing')}</Text>
            </View>
          )}
        </ScrollView>

        {/* 🎨 AMBIENT GLOW — halo lumineux du rêve */}
        {hasAmbient && (
          <LinearGradient
            colors={[
              ambientColor + '30',       // 19% opacité — lueur douce
              ambientSecondary + '15',   // 8% opacité — transition
              'transparent',              // disparition
            ]}
            locations={[0, 0.35, 0.7]}
            style={styles.ambientGlow}
            pointerEvents="none"
          />
        )}
      </View>

      {/* 🏆 SUGGESTIONS */}
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
              style={[
                styles.suggestionCard,
                hasAmbient && { 
                  borderColor: ambientColor + '60',
                  backgroundColor: ambientColor + '08',
                }
              ]}
              onPress={() => setInputText(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText} numberOfLines={2}>
                {suggestion}
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color={THEME.colors.primary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 🖼️ APERÇU IMAGE SÉLECTIONNÉE */}
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: selectedImage.uri }} 
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.imageRemoveButton}
            onPress={handleRemoveImage}
          >
            <MaterialIcons name="close" size={18} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.imagePreviewBadge}>
            <MaterialIcons name="visibility" size={12} color={THEME.colors.warmGold} />
            <Text style={styles.imagePreviewBadgeText}>Claude Vision</Text>
          </View>
        </View>
      )}

      {/* 🏆 INPUT BAR (WhatsApp style) */}
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        {/* 📷 BOUTON "+" (ajouter image) */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowImagePicker(true)}
          disabled={isInputDisabled}
        >
          <MaterialIcons 
            name="add" 
            size={24} 
            color={isInputDisabled ? THEME.colors.textSecondary : THEME.colors.warmGold} 
          />
        </TouchableOpacity>

        {/* Badge modèle Material */}
        <View style={styles.modelBadgeContainerInput}>
          <TouchableOpacity 
            style={styles.modelBadgeInput}
            onPress={() => setModelSelectorExpanded(!modelSelectorExpanded)}
            disabled={isInputDisabled}
          >
            <MaterialIcons 
              name={selectedModel === 'claude' ? 'science' : 'psychology'} 
              size={20} 
              color={THEME.colors.primary}
            />
          </TouchableOpacity>

          {/* Dropdown modèle */}
          {modelSelectorExpanded && (
            <View style={styles.modelDropdown}>
              <TouchableOpacity
                style={[styles.modelOption, selectedModel === 'claude' && styles.modelOptionSelected]}
                onPress={() => {
                  if (!isPremium) {
                    setModelSelectorExpanded(false);
                    setShowActivateModal(true);
                  } else {
                    setSelectedModel('claude');
                    setModelSelectorExpanded(false);
                  }
                }}
              >
                <MaterialIcons name="science" size={24} color={THEME.colors.primary} />
                <View style={styles.modelOptionInfo}>
                  <Text style={styles.modelOptionTitle}>DeepDream</Text>
                  <Text style={styles.modelOptionDesc}>Claude Sonnet 4.5</Text>
                </View>
                {selectedModel === 'claude' && (
                  <MaterialIcons name="check" size={20} color={THEME.colors.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modelOption, selectedModel === 'llama' && styles.modelOptionSelected]}
                onPress={() => { setSelectedModel('llama'); setModelSelectorExpanded(false); }}
              >
                <MaterialIcons name="flash-on" size={24} color={THEME.colors.warmGold} />
                <View style={styles.modelOptionInfo}>
                  <Text style={styles.modelOptionTitle}>QuickDream</Text>
                  <Text style={styles.modelOptionDesc}>Llama 3.3 70B</Text>
                </View>
                {selectedModel === 'llama' && (
                  <MaterialIcons name="check" size={20} color={THEME.colors.warmGold} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Input texte */}
        <TextInput
          style={styles.input}
          placeholder={selectedImage ? t('deepChat.placeholder_image') : t('deepChat.placeholder')}
          placeholderTextColor={THEME.colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isInputDisabled}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        
        {/* 🏆 BOUTON DYNAMIQUE (Micro OU Send) */}
        <TouchableOpacity 
          style={[
            styles.actionButton,
            isRecording && styles.actionButtonRecording,
            isInputDisabled && !isRecording && styles.actionButtonDisabled,
            (hasText || selectedImage) && !isInputDisabled && styles.actionButtonSend
          ]}
          onPress={(hasText || selectedImage) ? handleSend : (isRecording ? stopVoiceRecording : startVoiceRecording)}
          disabled={isInputDisabled && !isRecording}
        >
          <MaterialIcons 
            name={(hasText || selectedImage) ? "send" : (isRecording ? "stop" : "mic")}
            size={24} 
            color={THEME.colors.background}
          />
        </TouchableOpacity>
      </View>

      {/* 📷 MODAL IMAGE PICKER (ActionSheet) */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <Pressable 
          style={styles.imagePickerOverlay}
          onPress={() => setShowImagePicker(false)}
        >
          <View style={styles.imagePickerSheet}>
            <View style={styles.imagePickerHandle} />
            <Text style={styles.imagePickerTitle}>{t('deepChat.imagePicker_title')}</Text>
            <Text style={styles.imagePickerSubtitle}>{t('deepChat.imagePicker_subtitle')}</Text>
            
            <TouchableOpacity 
              style={styles.imagePickerOption}
              onPress={handleTakePhoto}
            >
              <View style={styles.imagePickerIconContainer}>
                <MaterialIcons name="camera-alt" size={24} color={THEME.colors.primary} />
              </View>
              <Text style={styles.imagePickerOptionText}>{t('deepChat.imagePicker_camera')}</Text>
              <MaterialIcons name="chevron-right" size={24} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imagePickerOption}
              onPress={handleChooseFromGallery}
            >
              <View style={styles.imagePickerIconContainer}>
                <MaterialIcons name="photo-library" size={24} color={THEME.colors.warmGold} />
              </View>
              <Text style={styles.imagePickerOptionText}>{t('deepChat.imagePicker_gallery')}</Text>
              <MaterialIcons name="chevron-right" size={24} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imagePickerCancel}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.imagePickerCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* 🏆 MODAL ACTIVATION DEEPDREAM */}
      <ActivateDeepDreamModal
        visible={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onActivate={handleActivateDeepDream}
      />

      {/* 🌙 Alert custom Noctaliaæ */}
      {/* 📤 Share Action Sheet */}
      {showShareMenu && (
        <TouchableOpacity
          style={styles.shareMenuOverlay}
          activeOpacity={1}
          onPress={() => setShowShareMenu(false)}
        >
          <TouchableOpacity
            style={styles.shareActionSheet}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.shareSheetHandle} />
            <Text style={styles.shareSheetTitle}>{t('deepChat.shareSheet_title')}</Text>

            <TouchableOpacity
              style={styles.shareSheetOption}
              activeOpacity={0.7}
              onPress={() => {
                setShowShareMenu(false);
                setTimeout(handleShareFriendly, 200);
              }}
            >
              <View style={[styles.shareSheetIconWrap, { backgroundColor: 'rgba(0,255,176,0.1)', borderColor: 'rgba(0,255,176,0.3)' }]}>
                <MaterialIcons name="ios-share" size={22} color={THEME.colors.primary} />
              </View>
              <View style={styles.shareSheetOptionText}>
                <Text style={styles.shareSheetOptionTitle}>{t('deepChat.shareSheet_visual')}</Text>
                <Text style={styles.shareSheetOptionDesc}>{t('deepChat.shareSheet_visualDesc')}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={THEME.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareSheetOption}
              activeOpacity={0.7}
              onPress={() => {
                setShowShareMenu(false);
                setTimeout(handleExportPdf, 200);
              }}
            >
              <View style={[styles.shareSheetIconWrap, { backgroundColor: 'rgba(210,177,76,0.1)', borderColor: 'rgba(210,177,76,0.3)' }]}>
                <MaterialIcons name="picture-as-pdf" size={22} color={THEME.colors.warmGold} />
              </View>
              <View style={styles.shareSheetOptionText}>
                <Text style={styles.shareSheetOptionTitle}>{t('deepChat.shareSheet_pdf')}</Text>
                <Text style={styles.shareSheetOptionDesc}>{t('deepChat.shareSheet_pdfDesc')}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color={THEME.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareSheetCancel} onPress={() => setShowShareMenu(false)}>
              <Text style={styles.shareSheetCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* DreamShareCard off-screen pour capture ViewShot */}
      <View style={styles.offscreenCard} pointerEvents="none">
        <DreamShareCard
          cardRef={shareCardRef}
          dream={{
            imageUrl: dreamImageUrl,
            imagePalette: dreamImagePalette,
            dreamTitle: dreamTitle,
            date: dreamDate,
            tags: dreamTags,
          }}
        />
      </View>

      <AlertComponent />
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  // 🏆 HEADER
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
    fontSize: 22,
    fontFamily: 'CormorantUpright-Bold',
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

  // 🏆 MESSAGES (WhatsApp style)
  messagesWrapper: {
    flex: 1,
    position: 'relative',
  },
  messagesContainer: {
    flex: 1,
  },
  // 🎨 AMBIENT GLOW — halo du rêve
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    pointerEvents: 'none',
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 100, // ✅ Espace pour suggestions
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
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
    maxWidth: SCREEN_WIDTH * 0.8, // 80% pour messages user (courts)
    minWidth: 60,
    backgroundColor: THEME.colors.primary,
    borderBottomRightRadius: 4, // ✅ Asymétrique WhatsApp
  },
  assistantBubble: {
    maxWidth: SCREEN_WIDTH * 0.92, // 🔧 FIX: 92% pour réponses IA (plus de place)
    minWidth: 60,
    backgroundColor: THEME.colors.cardBackground,
    borderBottomLeftRadius: 4, // ✅ Asymétrique WhatsApp
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
  // 🏆 BADGE Material avec icône
  modelBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    gap: 6,
  },
  modelBadgeText: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
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
  // 💡 CHIPS INITIALES — sous le 1er message IA
  initialChipsWrapper: {
    marginTop: 10,
    gap: 8,
    alignSelf: 'stretch',
    paddingLeft: 4,
  },
  initialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 255, 176, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 176, 0.22)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
  },
  initialChipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.text,
    lineHeight: 19,
  },

  // 🏆 SUGGESTIONS
  suggestionsContainer: {
    maxHeight: 80,
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
    width: (SCREEN_WIDTH - 30 - 20) / 2.5,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    gap: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    color: THEME.colors.text,
    fontFamily: 'AtkinsonHyperlegibleNext-Medium',
    lineHeight: 16,
  },
  // 🏆 INPUT BAR (WhatsApp style)
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 12,
    backgroundColor: THEME.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    alignItems: 'flex-end',
    gap: 10,
  },
  // Badge modèle Material (à gauche)
  modelBadgeContainerInput: {
    position: 'relative',
  },
  modelBadgeInput: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.background,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Dropdown modèle
  modelDropdown: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    width: 200,
    backgroundColor: THEME.colors.backgroundElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.dividerStrong,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
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
  modelOptionInfo: {
    flex: 1,
  },
  modelOptionTitle: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textPrimary,
  },
  modelOptionDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  // Input texte
  input: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: THEME.colors.text,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  // 🏆 BOUTON DYNAMIQUE (Micro/Send WhatsApp style)
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadow.neon,
  },
  actionButtonRecording: {
    backgroundColor: THEME.colors.error,
  },
  actionButtonSend: {
    backgroundColor: '#FF6B6B',
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
  actionButtonDisabled: {
    backgroundColor: THEME.colors.cardBorder,
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  // 📷 BOUTON "+" (ajouter image)
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.background,
    borderWidth: 1.5,
    borderColor: THEME.colors.warmGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 🖼️ APERÇU IMAGE
  imagePreviewContainer: {
    backgroundColor: THEME.colors.cardBackground,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    position: 'relative',
  },
  imagePreview: {
    width: 120,
    height: 90,
    borderRadius: 12,
    backgroundColor: THEME.colors.background,
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 5,
    left: 125,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewBadge: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  imagePreviewBadgeText: {
    fontSize: 10,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.warmGold,
  },
  // 🖼️ IMAGE DANS MESSAGE
  messageImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: THEME.colors.background,
  },
  // 📷 MODAL IMAGE PICKER
  imagePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  imagePickerSheet: {
    backgroundColor: THEME.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  imagePickerHandle: {
    width: 40,
    height: 4,
    backgroundColor: THEME.colors.cardBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  imagePickerTitle: {
    fontSize: 22,
    fontFamily: 'CormorantUpright-Bold',
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  imagePickerSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  imagePickerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerOptionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Medium',
    color: THEME.colors.text,
  },
  imagePickerCancel: {
    marginTop: 10,
    padding: 16,
    alignItems: 'center',
  },
  imagePickerCancelText: {
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
  },

  // 📤 Share Action Sheet
  offscreenCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    opacity: 0.01,
  },
  shareMenuOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 2000,
  },
  shareActionSheet: {
    backgroundColor: THEME.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  shareSheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: THEME.colors.textTertiary,
    alignSelf: 'center', marginBottom: 16,
  },
  shareSheetTitle: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-SemiBold',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  shareSheetOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, gap: 14,
    borderBottomWidth: 1, borderBottomColor: THEME.colors.cardBorder,
  },
  shareSheetIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  shareSheetOptionText: { flex: 1 },
  shareSheetOptionTitle: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.text,
  },
  shareSheetOptionDesc: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  shareSheetCancel: {
    alignItems: 'center', paddingVertical: 16, marginTop: 4,
  },
  shareSheetCancelText: {
    fontSize: 15,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: THEME.colors.textSecondary,
  },
});
