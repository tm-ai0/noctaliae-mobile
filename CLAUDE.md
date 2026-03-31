# CLAUDE.md — Noctaliæ

## Projet
Noctaliæ est une app React Native d'analyse de rêves basée sur les neurosciences. Créée par Thomas Maury (graphic/motion designer, 15 ans d'expérience Adobe, pas de background dev, vibe coding assisté par IA).

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
- **Monétisation** : RevenueCat (react-native-purchases v9.15.0) — one-time IAP via Google Play Billing
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
│   ├── AnalysisScreen.js     # Écran d'analyse du rêve (filtre Tous/Favoris/Secrets)
│   ├── PostRecordingScreen.js # Auto-select moteur, bandeau contextuel, nudge DeepDream
│   ├── SettingsScreen.js     # Rappels, apparence, thèmes, toggle dev premium
│   ├── ArchivesScreen.js     # Restaurer/Supprimer avec urgency badge
│   └── TrendsScreen.js       # Lollipop chart (pas bar chart)
├── services/
│   ├── premiumService.js     # RevenueCat — isPremium/getOfferings/purchaseDeepDream/restorePurchases + dev toggles
│   ├── freeTierService.js    # Quotas free tier (DeepDream, images)
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
- `autoIncrement: true` uniquement sur profils `production` et `open-testing` (pas `preview`)
- `git push` peut retourner HTTP 408 sur gros push mais complète toujours, ne pas paniquer
- Play Console exige un AAB (pas APK). Ne JAMAIS lancer un build preview/APK quand l'objectif est d'uploader sur Play Console.
- Version dans `app.json` (ex: "1.3.0"), versionCode auto-incrémenté par EAS. Convention: minor bump (1.x.0) pour nouvelle feature, patch (1.x.Y) pour bugfix.

### RevenueCat
- SDK Key : `goog_vueROZxZrzKUspAiXpguacEaBXO`
- Entitlement : `deepdream`
- Configuré dans `App.js` useEffect de boot (`Purchases.configure(...)`)
- `premiumService.js` : isPremium() vérifie via RevenueCat, fallback cache AsyncStorage offline
- `react-native-purchases` est un module natif pur, PAS un Expo config plugin. NE PAS l'ajouter dans `plugins` de app.json.
- Service account : `revenuecat@noctaliaetts.iam.gserviceaccount.com`
- 4 products (tier1-4), offering "default", Google Play 15% indie

### UX / Design
- Notifications : toggles OFF par défaut (ON par défaut = dark pattern)
- Suppression : toujours archiver d'abord, jamais de delete direct
- Rêves secrets : 3 points d'entrée, TOUS doivent vérifier l'auth biométrique
- Onboarding : `@noctaliae_onboarding_completed` dans AsyncStorage + `CommonActions.reset` pour empêcher retour arrière

### Partage
- Hook `useDreamShare` centralise toute la logique de partage
- Image : template 9:16 brandé (ImageIA + palette + titre + one-liner + tags + "Noctaliæ" gold + badge Play Store)
- Texte fallback : mini résumé + explication scientifique + #tags + nocty.thomasmaury.fr + Play Store

### Philosophie
- **Science > Mystique** — 6 frameworks neurosciences validés (Arnulf, Walker, Revonsuo, Domhoff, Hobson, Schredl)
- **Privacy-first** — 100% données on-device (AsyncStorage/SecureStore), rien sur serveur
- **Free tier généreux** — Llama via Groq pour les utilisateurs gratuits
- **Éthique** — Pas de dark patterns, pas d'extraction commerciale

## État actuel (31 mars 2026)
- **v1.3.1 Build 50 SOUMIS** (31 mars 2026) — changes in review sur Play Console
- **v1.3.0 Build 49** sur le Play Store (production, 28 mars 2026)
- **25-28 users installés**, 5.000★ rating, 6€ gross revenue
- **Backend** : v2.18 sur Infomaniak. Pas de process manager (PM2) en place.
- **RevenueCat IAP** : ✅ FONCTIONNEL depuis le 31/03/2026. Bug résolu = package name était `com.tmAi.noctaliae` au lieu de `com.noctaliae.mobile`. Credentials valides, "Restaurer mes achats" OK.

### ✅ RÉSOLU le 31/03/2026
- **Merchant payment** : compte bancaire vérifié, banner "removed April 26" disparu
- **RevenueCat** : package name corrigé (`com.tmAi.noctaliae` → `com.noctaliae.mobile`), IAP fonctionnel

### Build 50 changelog
- Fix Unicode emojis/accents dans DeepDreamInfoModal et PostRecordingScreen
- Badge palier dynamique dans Settings (emoji + label du tier RevenueCat)
- CTA "Soutenir davantage" en gold pour upgrade de palier
- Wording "Soutenir Noctaliæ" adapté selon statut premium/free
- Try/catch sur Purchases.configure (compatibilité Expo Go)
- Fallback dev tier dans premiumService pour tests Expo Go

### TODO
0. **Paywall upgrade mode** (ActivateDeepDreamModal) : quand user est PREMIUM, la modale doit :
   - Marquer le palier actuel "Votre palier" + grisé (non cliquable)
   - Paliers inférieurs aussi grisés
   - CTA : "Devenir [label] · [prix]" (ex: "Devenir Ambassadeur · 9,99€")
   - Boutons bas : "Fermer" + "Contacter" (WhatsApp) — pas de "continuer gratuitement" ni "restaurer"
   - Passer isPremium + tierInfo en props
1. **Backend** : vérifier api.thomasmaury.fr, envisager PM2
2. **Google developer notifications** : connecter RevenueCat Pub/Sub (non configuré)
3. **i18n FR/EN/ES LATAM** : ✅ Phases 1-5 DONE. TODO Phase 6 : QA + grep FR résiduels + test layouts ES
4. **Google Form** : restructurer pour tout-en-un (satisfaction, bugs, suggestions)
5. **Shake-to-feedback** : expo-sensors Accelerometer

### DONE
- **TRUST_MODE = false** dans freeTierService.js. FREE_DEEPDREAM_LIMIT = 5. Le compteur réel AsyncStorage contrôle les taste tests.
- **ActivateDeepDreamModal** : refonte complète avec 4 paliers RevenueCat (getOfferings + purchaseDeepDream + restorePurchases). Props : onPurchaseSuccess, hasFreeTrials, freeTrialsRemaining.
- **PostRecordingScreen** : auto-select moteur, bandeau compteur taste tests, section "Enrichir l'analyse" (lucidité/sommeil/émotions/thèmes, collapsible), metaPayload branché.
- **ConversationScreen** : handlePurchaseSuccess (plus de toggle dev enablePremium), nouvelles props modal.
- **AnalysisScreen** : popover filtre Tous/Favoris/Secrets (remplace l'ancien bouton étoile). States activeFilter + showFilterMenu.
- **Phase 1 RevenueCat SDK** : react-native-purchases installé, premiumService refondé, App.js configuré.
- **R2** : Bouton "Vérifier les mises à jour" retiré de SettingsScreen.
- **R3** : Compteur caractères overlay dans le champ écriture (App.js). Informatif, pas de maxLength.
- **B3** : handleAnalyzePhoto gate freeTier + increment compteur + X/Annuler sur photo preview.
- **Paywall redesign** : layout vertical Quick/Deep, 4 features DeepDream (grilles, photo/OCR, images, thèmes) + soutien projet (gold), badge "Le plus choisi".
- **Radio moteur** : PostRecordingScreen, 2 boutons ⚡ QuickDream / ✨ DeepDream, Deep pré-coché si taste tests dispo, QuickDream sinon.
- **Settings** : Switch dev supprimé, remplacé par CTA "Débloquer DeepDream" + paywall. Badge "Actif" si premium.
- **Image gen** : réservée à DeepDream (`result.imagePrompt && useDeepDream`).
- **QF-2** : Bouton "Donner mon avis" dans Settings > Aide, linké au Google Form.

### TODO
- **QF-4** : ✅ Prix HT corrigés dans Play Console (1.66/4.16/8.33/16.66 HT → 1.99/4.99/9.99/19.99 TTC)
- **Google Form** : restructurer pour tout-en-un (satisfaction, bugs, suggestions, features)
- **Shake-to-feedback** : expo-sensors Accelerometer (prochain sprint)
- **Item 5** : flow photo ne génère pas d'image (bypass PostRecordingScreen où generateDreamImage est appelé)
- **i18n FR/EN/ES LATAM** : Phases 1-5 DONE (01/04/2026). i18next+react-i18next+expo-localization installés, src/i18n/index.js configuré, initI18n() branché dans App.js. fr.json (714 clés) / en.json / es.json (785 clés chacun, 0 missing) dans src/i18n/locales/. Phase 4 P1 : 14 fichiers (5 onboarding + ConversationScreen, PostRecordingScreen, AnalysisScreen, SettingsScreen, ActivateDeepDreamModal, DeepDreamInfoModal, DreamCard, CustomTabBar, DreamShareTemplate). Phase 4 P2 : ArchivesScreen, DeepChatScreen, ProfileScreen, PersonaScreen, ChatScreen, QuickRecordScreen, MetaAnalysisScreen, ResearchOptInModal, VoiceAssistantScreen. Phase 5 : sélecteur langue (🇫🇷/🇬🇧/🌎) dans SettingsScreen. Tags fingerprints ("Introverti", etc.) laissés en FR volontairement (LLM gèrent). TODO Phase 6 : QA + grep textes FR résiduels + test layouts ES (TrendsScreen, InsightsScreen, AtlasScreen, ExplorerScreen, PlaygroundScreen, GeminiLiveScreen non encore i18n'd)

### CE QU'IL NE FAUT PAS CASSER
- PostRecordingScreen : la section "Enrichir l'analyse" (métadonnées lucidité/sommeil/émotions/thèmes) DOIT rester
- ActivateDeepDreamModal : les 4 paliers RevenueCat avec achat réel (pas de toggle dev)
- AnalysisScreen : le popover filtre à 3 options (pas un simple bouton étoile)
- freeTierService.js : TRUST_MODE doit rester false
- ConversationScreen : reanalyzeWithModel(true) est appelé après achat réussi

## Fichiers à ne PAS toucher sans demander
- `app.json` (config Expo sensible)
- `eas.json` (profils de build)
- `.env` ou tout fichier de credentials

## Commandes utiles
```bash
npx expo start --clear          # Dev avec cache clean
eas build --platform android     # Build production (AAB, auto-increment)
eas build --platform android --profile preview  # Build de test (APK, pas d'auto-increment)
npx expo install --check         # Vérifier compatibilité packages
```

## Contexte additionnel
- Play Console : https://play.google.com/store/apps/details?id=com.noctaliae.mobile
- Landing : https://nocty.thomasmaury.fr
- Developer account : tm-ai0 (ID 6195473086195707777), email tm@thomasmaury.fr
- EAS account : tm_ai, Sentry org : maury
- Notion recap page : 2ce97634-6b36-8026-a5a1-d5a6748b2238
- Mascotte Nocty : assets dans assets/Avatars/, CDN Masko activé (masko.ai/m/nocty)
