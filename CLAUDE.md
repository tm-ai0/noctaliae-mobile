# CLAUDE.md — Noctaliæ

## Projet
Noctaliæ est une app React Native d'analyse de rêves basée sur les neurosciences. Créée par Thomas Maury (graphic/motion designer, 15 ans d'expérience Adobe, pas de background dev — vibe coding assisté par IA).

## Stack technique
- **Framework** : React Native / Expo SDK 54 (expo@54.0.23, react-native@0.81.5)
- **Navigation** : @react-navigation/native-stack + bottom-tabs v7
- **State** : AsyncStorage (@react-native-async-storage/async-storage)
- **IA premium** : Claude Sonnet 4 (DeepDream) via backend
- **IA free** : Llama 3.3 70B via Groq (QuickDream)
- **Voix** : Groq Whisper (STT), Google Cloud TTS
- **Images** : Gemini 2.5 Flash Image generation
- **Backend** : Node.js sur Infomaniak — https://api.thomasmaury.fr
- **Build** : EAS Build (versionCode remote), profils: development, preview, production, open-testing
- **Analytics** : Amplitude
- **Crash reporting** : Sentry (@sentry/react-native)

## Identité visuelle
- **Fonts** : CormorantUpright (titres), AtkinsonHyperlegibleNext (body)
- **Couleurs** : `#0A0E27` (bg), `#00FFB0` (primary neon green), `#4F8DFF` (blue), `#D2B14C` (gold), `#88735C` (brown), `#A0B4D4` (grey-green)
- **Style** : Dark theme exclusif, bevel glass sur FAB, hero gradients avec `rgba(0,0,0,0.6)` midpoint

## Structure des fichiers clés
```
src/
├── components/
│   ├── DreamCard.js          # Carte de rêve (partage via useDreamShare)
│   ├── DreamShareTemplate.js # Template image 9:16 brandée
│   └── DreamImageViewer.js   # Viewer fullscreen (Animated/PanResponder, PAS Reanimated)
├── hooks/
│   └── useDreamShare.js      # Hook unifié de partage
├── screens/
│   ├── ConversationScreen.js # Chat principal (DeepDream/QuickDream)
│   ├── DeepChatScreen.js     # Questions d'approfondissement
│   ├── AnalysisScreen.js     # Écran d'analyse du rêve
│   ├── PostRecordingScreen.js
│   ├── SettingsScreen.js     # Rappels, apparence, thèmes
│   ├── ArchivesScreen.js     # Restaurer/Supprimer avec urgency badge
│   └── TrendsScreen.js       # Lollipop chart (pas bar chart)
├── services/
│   └── streakService.js      # Consecutive days, records, total dreams
└── ...
```

## Conventions de code
- **JavaScript** (pas TypeScript) — fichiers `.js` et `.jsx`
- **Pas de Reanimated** pour les animations custom → utiliser `Animated` natif + `PanResponder`
- `react-native-reanimated` est installé mais réservé aux libs qui l'exigent (navigation, gesture-handler)
- **react-native-view-shot** v3.8.0 installé avec `--legacy-peer-deps`
- Imports : chemins relatifs (`../components/...`, `../services/...`)

## Règles IMPORTANTES

### Builds
- Chaque build EAS prend 20-30 minutes. NE JAMAIS lancer de build sans avoir testé en preview.
- `appVersionSource: "remote"` → versionCode géré par EAS, pas dans app.json
- `git push` peut retourner HTTP 408 sur gros push mais complète toujours — ne pas paniquer

### UX / Design
- Notifications : toggles OFF par défaut (ON par défaut = dark pattern)
- Suppression : toujours archiver d'abord, jamais de delete direct
- Rêves secrets : 3 points d'entrée, TOUS doivent vérifier l'auth biométrique
- Onboarding : `@noctaliae_onboarding_completed` dans AsyncStorage + `CommonActions.reset` pour empêcher retour arrière

### Partage
- Hook `useDreamShare` centralise toute la logique de partage
- Image : template 9:16 brandé (ImageIA + palette + titre + one-liner + tags + "Noctaliæ" gold + badge Play Store)
- Texte fallback : mini résumé + 🧠 explication scientifique + #tags + nocty.thomasmaury.fr + Play Store

### Philosophie
- **Science > Mystique** — 6 frameworks neurosciences validés (Arnulf, Walker, Revonsuo, Domhoff...)
- **Privacy-first** — 100% données on-device (AsyncStorage/SecureStore), rien sur serveur
- **Free tier généreux** — Llama via Groq pour les utilisateurs gratuits
- **Éthique** — Pas de dark patterns, pas d'extraction commerciale

## État actuel
- **v1.2.0 Build 36** en production sur Google Play
- **Build 39** en cours (fix onboarding + thèmes + partage texte)
- Prochain sprint : i18n (FR/EN/ES) avec i18next

## Fichiers à ne PAS toucher sans demander
- `app.json` (config Expo sensible)
- `eas.json` (profils de build)
- `.env` ou tout fichier de credentials

## Commandes utiles
```bash
npx expo start --clear          # Dev avec cache clean
eas build --platform android     # Build production
eas build --platform android --profile preview  # Build de test
npx expo install --check         # Vérifier compatibilité packages
```

## Contexte additionnel
- Le fichier `🚨_PROMPT_REPRISE_OBLIGATOIRE.txt` à la racine contient l'état détaillé du projet (builds, checklist, patches). Le consulter en priorité pour le contexte actuel.
- Play Store : https://play.google.com/store/apps/details?id=com.noctaliae.mobile
- Landing : https://nocty.thomasmaury.fr
