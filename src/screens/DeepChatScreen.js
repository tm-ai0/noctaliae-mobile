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
  Dimensions
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { chatWithDream, transcribeAudio } from '../services/apiService';
import { MarkdownText } from '../components/MarkdownText';
import { THEME } from '../config/theme';
import { saveConversation, loadConversation, clearConversation } from '../services/conversationService';
import { deleteDream } from '../services/storageService';
import { premiumService } from '../services/premiumService';
import { ActivateDeepDreamModal } from '../modals/ActivateDeepDreamModal';
import DebugScreenLabel from '../components/DebugScreenLabel';

const SCREEN_WIDTH = Dimensions.get('window').width;

// 🧠 GÉNÉRATEUR DE SUGGESTIONS INTELLIGENTES
function generateSmartSuggestions(analysis, transcription) {
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
  
  // Détecter les thèmes présents
  const detectedThemes = [];
  for (const [theme, keywords] of Object.entries(themes)) {
    if (keywords.some(kw => text.includes(kw))) {
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
  const { dreamId, dreamAnalysis: initialAnalysis, dreamTranscription, dreamTitle, suggestedQuestions: initialSuggestions } = route.params;
  
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
  
  const [dreamAnalysis] = useState(initialAnalysis);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  
  // États vocal
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recordingRef = useRef(null);
  const scrollViewRef = useRef();
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  // 🔄 Charger statut Premium et présélectionner modèle
  useEffect(() => {
    const loadPremiumStatus = async () => {
      const status = await premiumService.isPremium();
      setIsPremium(status);
      setSelectedModel(status ? 'claude' : 'llama');
    };
    loadPremiumStatus();
  }, []);

  // 🏆 Activer DeepDream depuis le modal
  const handleActivateDeepDream = async () => {
    await premiumService.enablePremium();
    setIsPremium(true);
    setSelectedModel('claude');
    setShowActivateModal(false);
    navigation.navigate('Settings');
  };

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

  async function startVoiceRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission refusée', 'Permission microphone refusée', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
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
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
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
      Alert.alert('Erreur', 'Impossible de traiter la question vocale', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
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
    scrollToBottomForUserMessage(); // ✅ SCROLL complet pour TON message
    setIsLoading(true);

    try {
      const isPremium = selectedModel === 'claude';
      const conversationHistory = messages.slice(-20).map(msg => ({
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

      // 🏆 NETTOYER le contenu IA (virer "STYLE: ...")
      const cleanedResponse = cleanAIResponse(response.response);

      const assistantMessage = {
        role: 'assistant',
        content: cleanedResponse,
        timestamp: Date.now(),
        model: response.model
      };

      setMessages(prev => [...prev, assistantMessage]);
      scrollMinimalToShowAIResponse(); // ✅ Scroll MINIMAL pour montrer réponse

      if (response.suggestedQuestions && Array.isArray(response.suggestedQuestions)) {
        setSuggestedQuestions(response.suggestedQuestions.slice(0, 3));
      } else {
        const newSuggestions = generateSmartSuggestions(cleanedResponse, dreamTranscription);
        setSuggestedQuestions(newSuggestions);
      }
    } catch (error) {
      console.error('❌ Erreur chat:', error);
      Alert.alert('❌ Erreur', error.message || 'Impossible de communiquer avec le serveur', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
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
            setMessages([{
              role: 'assistant',
              content: 'Explorons ensemble votre rêve en profondeur. Quelle dimension souhaitez-vous approfondir ?',
              timestamp: Date.now()
            }]);
            const newSuggestions = generateSmartSuggestions(dreamAnalysis, dreamTranscription);
            setSuggestedQuestions(newSuggestions);
          }
        }
      ],
      { userInterfaceStyle: 'dark' }
    );
  }

  // ============================================
  // 📄 EXPORT PDF ENRICHI (avec conversation)
  // ============================================
  const generateEnrichedPdfHtml = () => {
    const now = new Date();
    const exportDate = now.toLocaleDateString('fr-FR', { 
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
      'Cette action est irréversible. Le rêve, son analyse et cette conversation seront définitivement supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearConversation(dreamId);
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
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {isUser ? (
            <Text style={styles.userText}>{message.content}</Text>
          ) : (
            <MarkdownText style={styles.assistantText}>{message.content}</MarkdownText>
          )}
          
          {/* 🏆 BADGE avec icône Material */}
          {message.model && (
            <View style={styles.modelBadgeContainer}>
              <MaterialIcons 
                name={message.model === 'claude' ? 'science' : message.model === 'gemini' ? 'psychology' : 'flash-on'} 
                size={14} 
                color={THEME.colors.textSecondary}
              />
              <Text style={styles.modelBadgeText}>
                {message.model === 'claude' ? 'DeepDream' : 
                 message.model === 'gemini' ? 'NoctaliaeAI+' : 
                 'QuickDream'}
              </Text>
            </View>
          )}
        </View>
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
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) + 15 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Approfondir</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{dreamTitle}</Text>
        </View>

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
          <MaterialIcons name="delete-outline" size={24} color={'#EF4444'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestart} style={styles.iconButton}>
          <MaterialIcons name="restart-alt" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
      </View>

      {/* 🏆 NOCTALIAEAI+ LIVE (Material icons) */}
      <View style={styles.actionsSection}>
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
          <MaterialIcons name="psychology" size={22} color={THEME.colors.warmGold} />
          <Text style={styles.geminiButtonText}>NoctaliaeAI+ Live</Text>
          <MaterialIcons name="chevron-right" size={20} color={THEME.colors.warmGold} />
        </TouchableOpacity>
      </View>

      {/* 🏆 MESSAGES */}
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
              style={styles.suggestionCard}
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

      {/* 🏆 INPUT BAR (WhatsApp style) */}
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        {/* Badge modèle Material (à gauche) */}
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
          placeholder="Posez votre question..."
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
            hasText && !isInputDisabled && styles.actionButtonSend
          ]}
          onPress={hasText ? handleSend : (isRecording ? stopVoiceRecording : startVoiceRecording)}
          disabled={isInputDisabled && !isRecording}
        >
          <MaterialIcons 
            name={hasText ? "send" : (isRecording ? "stop" : "mic")}
            size={24} 
            color={THEME.colors.background}
          />
        </TouchableOpacity>
      </View>

      {/* 🏆 MODAL ACTIVATION DEEPDREAM */}
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
  // 🏆 ACTIONS SECTION
  actionsSection: {
    backgroundColor: THEME.colors.cardBackground,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  geminiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.warmGoldSubtle,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: THEME.colors.warmGold,
    gap: 8,
  },
  geminiButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: THEME.colors.warmGold,
    textAlign: 'center',
  },
  // 🏆 MESSAGES (WhatsApp style)
  messagesContainer: {
    flex: 1,
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
    maxWidth: '85%', // ✅ 85% au lieu de 80%
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
    backgroundColor: THEME.colors.primary,
    borderBottomRightRadius: 4, // ✅ Asymétrique WhatsApp
  },
  assistantBubble: {
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
    fontWeight: '600',
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
    fontWeight: '500',
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
    fontWeight: '600',
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
});
