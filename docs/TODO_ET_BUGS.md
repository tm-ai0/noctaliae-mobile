# 🌙 Noctaliæ - TODO & Problèmes Connus

## 🐛 Problèmes à Résoudre

### 🔴 Haute Priorité

#### 1. Clavier Android masque le champ texte (ChatScreen)
**Symptômes :**
- Le clavier virtuel Android apparaît par-dessus le champ de saisie
- L'utilisateur ne peut pas voir ce qu'il tape
- Testé avec plusieurs configurations sans succès :
  - `softwareKeyboardLayoutMode: "resize"`
  - `softwareKeyboardLayoutMode: "adjustResize"`
  - `softwareKeyboardLayoutMode: "pan"`
  - `KeyboardAvoidingView` avec différents behaviors

**Impact :** 
- UX fortement dégradée sur Android
- Empêche l'utilisation fluide de la feature conversation

**Solutions à tester lors du redesign Figma :**
1. Repositionner le champ texte plus haut dans l'écran
2. Utiliser un Modal Bottom Sheet pour l'input (comme WhatsApp)
3. Implémenter une solution custom avec `Keyboard.addListener()`
4. Remplacer `ScrollView` par `FlatList` avec `automaticallyAdjustKeyboardInsets`
5. Utiliser `react-native-keyboard-controller` (lib externe)
6. Implémenter un input flottant qui se déplace avec le clavier

**Fichiers concernés :**
- `src/screens/ChatScreen.js`
- `app.json` (configuration Android)

---

### 🟡 Moyenne Priorité

#### 2. Warning expo-av deprecated
**Message :**
```
WARN [expo-av]: Expo AV has been deprecated and will be removed in SDK 54. 
Use the `expo-audio` and `expo-video` packages to replace the required functionality.
```

**Impact :**
- Pas d'impact fonctionnel immédiat
- Risque de breaking change dans SDK 54

**Solution :**
- Migrer de `expo-av` vers `expo-audio` pour l'enregistrement audio
- Mettre à jour `RecordingScreen.js` et `audioRecorder.js`

**Fichiers concernés :**
- `src/screens/RecordingScreen.js`
- `src/services/audioRecorder.js`
- `package.json`
- `app.json` (plugins)

---

## ✅ Fonctionnalités Complétées

### 💬 Conversation Texte (03/11/2025)
- ✅ Endpoint `/chat-text` backend Replit
- ✅ ChatScreen avec gestion de l'historique
- ✅ Support Premium (Claude) et Gratuit (Llama)
- ✅ Bouton "💬 Continuer" dans AnalysisScreen
- ✅ Navigation Stack configurée
- ✅ SafeAreaInsets pour Android
- ✅ Design cohérent avec l'app

### 🔧 Corrections Techniques (03/11/2025)
- ✅ App.js : Migration vers `@react-navigation/native-stack`
- ✅ Backend : Tous les endpoints documentés
- ✅ ChatScreen : Optimisations UI/UX

---

## 🎯 Roadmap Future

### 🚀 Prochaines Fonctionnalités
1. **Redesign complet sur Figma**
   - Résoudre le problème du clavier
   - Améliorer l'ergonomie générale
   - Design system cohérent

2. **Amélioration de la Conversation**
   - Support des messages vocaux dans le chat
   - Sauvegarde des conversations
   - Export des conversations
   - Analyse approfondie d'un rêve spécifique dans le chat

3. **Premium Features**
   - Statistiques avancées des rêves
   - Patterns de rêves sur le long terme
   - Comparaison avec d'autres utilisateurs (anonymisé)
   - Suggestions personnalisées

4. **Intégration Omi**
   - Synchronisation automatique avec Omi
   - Notification push quand Omi détecte un rêve
   - Import automatique depuis Omi

---

## 📋 Checklist de Test

### ✅ Features à Tester Régulièrement

#### Workflow Complet
- [ ] Enregistrer un rêve (audio)
- [ ] Transcrire l'audio (Groq Whisper)
- [ ] Analyser le rêve (Claude ou Llama)
- [ ] Voir l'analyse dans l'historique
- [ ] Cliquer sur "💬 Continuer"
- [ ] Poser des questions sur le rêve
- [ ] Vérifier les réponses contextuelles

#### Backend
- [ ] `/health` retourne 200
- [ ] `/transcribe` fonctionne avec audio
- [ ] `/analyze-dream` (Premium) fonctionne
- [ ] `/analyze-dream-free` (Gratuit) fonctionne
- [ ] `/chat-text` retourne des réponses

#### UI/UX
- [ ] Navigation fluide entre les screens
- [ ] Boutons accessibles (pas masqués par Android)
- [ ] Animations smooth
- [ ] Pas de crash

---

## 🔑 Variables d'Environnement Requises

### Backend Replit
```env
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
# ou
NoctaliæMobile=gsk_...
```

### App Mobile
```javascript
// src/config/api.js
export const API_BASE_URL = 'https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev';
```

---

## 📞 Support

**Problèmes connus :**
- Clavier Android masque le champ texte → En attente du redesign Figma
- Warning expo-av → Migration prévue vers expo-audio

**Pour signaler un bug :**
1. Décrire le comportement attendu
2. Décrire le comportement actuel
3. Screenshots si possible
4. Logs de la console Metro

---

**Dernière mise à jour :** 03/11/2025
**Version App :** 1.0.0
**Status :** 🟢 Production Ready (avec limitations connues)
