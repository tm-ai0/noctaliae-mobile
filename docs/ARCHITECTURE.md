# 🏗️ ARCHITECTURE NOCTALIÆ

## 📋 Vue d'ensemble

Noctaliæ est une application mobile React Native (Expo) pour l'analyse scientifique des rêves, utilisant l'IA (Claude Sonnet 4.5 et Llama 3.3 70B) et les neurosciences.

---

## 📁 Structure du projet

```
noctaliae-mobile/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── DreamCard.js    # Carte d'affichage d'un rêve
│   │   ├── MarkdownText.js # Rendu Markdown
│   │   └── ...
│   │
│   ├── screens/            # Écrans de l'app
│   │   ├── HomeScreen.js   # Écran principal (enregistrement)
│   │   ├── AnalysisScreen.js # Affichage analyse rêve
│   │   ├── ConversationScreen.js # Chat approfondi
│   │   └── ...
│   │
│   ├── services/           # Services métier
│   │   ├── apiService.js   # API backend
│   │   ├── audioRecorder.js # Enregistrement audio
│   │   ├── storageService.js # AsyncStorage
│   │   └── ...
│   │
│   ├── config/             # Configuration
│   │   ├── api.js          # URLs API
│   │   ├── theme.js        # Thèmes couleurs
│   │   ├── sentry.config.ts # Crash reporting
│   │   └── analytics.config.ts # Analytics
│   │
│   ├── types/              # TypeScript types
│   │   └── index.ts        # Types centralisés
│   │
│   ├── stores/             # État global (Zustand)
│   │   ├── dreamStore.ts   # Gestion rêves
│   │   ├── uiStore.ts      # État UI
│   │   └── settingsStore.ts # Settings utilisateur
│   │
│   ├── hooks/              # Custom hooks
│   │   ├── useRecording.ts # Hook enregistrement
│   │   └── useDreamAnalysis.ts # Hook analyse
│   │
│   └── utils/              # Utilitaires
│       └── ...
│
├── assets/                 # Images, fonts, etc.
├── .github/workflows/      # CI/CD GitHub Actions
├── App.js                  # Point d'entrée
├── app.json               # Config Expo
├── eas.json               # Config EAS Build
├── tsconfig.json          # Config TypeScript
└── package.json           # Dépendances
```

---

## 🔄 Flux de données

### 1. Enregistrement d'un rêve

```
User appuie sur "Enregistrer"
    ↓
useRecording hook
    ↓
expo-av (enregistrement audio)
    ↓
Sauvegarde fichier local
    ↓
PostRecordingScreen
    ↓
User valide → Transcription
```

### 2. Transcription

```
Audio file
    ↓
apiService.transcribe()
    ↓
Backend (Whisper-1)
    ↓
Texte transcrit
    ↓
Sauvegarde dans dreamStore
```

### 3. Analyse IA

```
Transcription
    ↓
apiService.analyze()
    ↓
Backend (Claude ou Llama)
    ↓
Analyse formatée
    ↓
Extraction metadata (titre, emoji, tags)
    ↓
Affichage dans AnalysisScreen
```

### 4. Conversation approfondie

```
User pose une question
    ↓
apiService.chat()
    ↓
Backend (Claude avec contexte)
    ↓
Réponse enrichie
    ↓
Affichage dans ConversationScreen
```

---

## 🎨 Gestion des thèmes

### Couleurs obligatoires Noctaliæ (brand)

```javascript
{
  warmGold: '#D2B14C',  // Or humain
  softBrown: '#88735C',  // Brun doux
  grayGreen: '#A0B4D4',  // Gris-vert
}
```

Ces couleurs doivent toujours être présentes dans tous les thèmes.

### Thèmes disponibles

- **Midnight** (défaut) : Bleu nuit, vert néon
- **Aurora** : Violet, rose, aurore boréale
- **Sunset** : Orange, rose, coucher de soleil
- **Ocean** : Bleu océan, turquoise
- **Forest** : Vert forêt, brun
- **Lavender** : Lavande, violet pâle

---

## 🔌 Backend API

### Endpoints

```
POST /transcribe-audio
- Transcription Whisper
- Input: FormData (audio file)
- Output: { transcript, duration }

POST /analyze-dream
- Analyse approfondie (Claude Sonnet 4.5)
- Input: { transcript }
- Output: { analysis, suggestedQuestions }

POST /analyze-dream-free
- Analyse rapide (Llama 3.3 70B)
- Input: { transcript }
- Output: { analysis, suggestedQuestions }

POST /chat-text
- Conversation approfondie
- Input: { message, conversationHistory, dreamContext }
- Output: { response }

GET /health
- Health check
- Output: { status, version }
```

### Rate Limiting

- 100 requêtes / heure par IP
- Header: `X-RateLimit-Remaining`
- Si dépassé: Status 429

---

## 📱 État de l'application

### Zustand Stores (à créer)

#### dreamStore
```typescript
{
  dreams: Dream[],
  isLoading: boolean,
  error: string | null,
  
  addDream: (dream) => void,
  updateDream: (id, updates) => void,
  deleteDream: (id) => void,
  getDream: (id) => Dream | undefined,
  loadDreams: () => Promise<void>,
}
```

#### uiStore
```typescript
{
  isRecording: boolean,
  isAnalyzing: boolean,
  selectedDreamId: string | null,
  showRateLimitBanner: boolean,
  
  setRecording: (value) => void,
  setAnalyzing: (value) => void,
  setSelectedDream: (id) => void,
  setRateLimitBanner: (show) => void,
}
```

#### settingsStore
```typescript
{
  settings: UserSettings,
  
  updateSettings: (updates) => void,
  resetSettings: () => void,
  loadSettings: () => Promise<void>,
}
```

---

## 🧪 Tests

### Structure

```
src/
├── services/
│   ├── apiService.ts
│   └── __tests__/
│       └── apiService.test.ts
│
├── stores/
│   ├── dreamStore.ts
│   └── __tests__/
│       └── dreamStore.test.ts
│
└── hooks/
    ├── useRecording.ts
    └── __tests__/
        └── useRecording.test.ts
```

### Lancer les tests

```bash
# Tous les tests
npm test

# Avec coverage
npm test -- --coverage

# Mode watch
npm test -- --watch

# Test spécifique
npm test dreamStore.test.ts
```

---

## 📊 Monitoring & Analytics

### Sentry (Crash Reporting)

```typescript
import { captureError, addBreadcrumb } from '@/config/sentry.config';

// Capturer une erreur
try {
  await analyzeArea();
} catch (error) {
  captureError(error, { context: 'analysis', dreamId });
}

// Ajouter un breadcrumb
addBreadcrumb('Recording started', 'user_action');
```

### Amplitude (Analytics)

```typescript
import { Analytics } from '@/config/analytics.config';

// Tracker un event
Analytics.recordingStarted();
Analytics.analysisCompleted('claude-sonnet-4', 5.2, 'deep');

// Identifier user
identifyUser('user123');
setUserProperties({ is_premium: true });
```

---

## 🚀 Déploiement

### Build local (dev)

```bash
npm start              # Lancer Metro
npm run android        # Lancer sur Android
npm run ios            # Lancer sur iOS
```

### Build EAS (preview/prod)

```bash
# Preview (APK)
eas build --platform android --profile preview

# Production (AAB)
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --latest
```

### CI/CD

Les workflows GitHub Actions buildent automatiquement sur:
- Push sur `main` ou `develop`
- Pull requests
- Tags `v*` (ex: v1.0.0)

---

## 🔐 Sécurité

### Variables d'environnement

```env
# Backend
API_BASE_URL=https://api.thomasmaury.fr

# Monitoring
SENTRY_DSN=https://xxxxx.ingest.sentry.io/xxxxx
AMPLITUDE_API_KEY=xxxxx

# Premium (Stripe - à venir)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Données sensibles

- Clés API : **Stockées sur le backend uniquement**
- Tokens user : **SecureStore (chiffré)**
- Rêves : **AsyncStorage local** (pas de sync cloud par défaut)

---

## 📈 Roadmap Technique

### Phase 1 : Fondations (EN COURS)
- [x] Backend v2.2 déployé
- [x] Frontend optimisé
- [x] Types TypeScript créés
- [x] Tests setup
- [x] Sentry config
- [x] Analytics config
- [x] CI/CD setup
- [ ] Migration TypeScript (services → stores → hooks → composants → screens)
- [ ] Tests écrits (stores, hooks, services)

### Phase 2 : Performance
- [ ] React Query (cache API)
- [ ] Memoization (useMemo, React.memo)
- [ ] FlatList optimization
- [ ] Image lazy loading
- [ ] Bundle size optimization

### Phase 3 : Features
- [ ] Premium Stripe integration
- [ ] Cloud backup (optionnel)
- [ ] Voice assistant (Gemini Live)
- [ ] Export PDF/Email
- [ ] Statistiques avancées

### Phase 4 : Scale
- [ ] A/B testing (feature flags)
- [ ] Performance monitoring (Firebase)
- [ ] Push notifications
- [ ] Deep linking
- [ ] iOS version

---

## 👥 Contribution

Ce projet est personnel mais documenté pour référence future.

### Conventions de code

- **TypeScript** pour tout nouveau code
- **Tests** pour toute nouvelle feature
- **Commits** en français, format: `type: description`
  - `feat:` nouvelle feature
  - `fix:` correction bug
  - `refactor:` refactoring
  - `docs:` documentation
  - `test:` ajout tests

---

## 📞 Support

- Email: contact@thomasmaury.fr
- GitHub: https://github.com/tm-ai0
- Backend: https://api.thomasmaury.fr

---

**Dernière mise à jour : 21/11/2025**
