# Reprise Noctaliæ — Sprint i18n FR/EN/ES LATAM

Lis le CLAUDE.md via Filesystem : `E:\PROJECTS\Dream app\App\noctaliae-mobile\CLAUDE.md`

## CONTEXTE

Noctaliæ v1.3.0 (Build 49) vient d'être envoyée en production sur Play Store.

### Ce qui a été fait (sprint 28 mars) :
- Paywall RevenueCat complet (4 paliers, layout vertical Quick vs Deep, 4 features DeepDream, badge "Le plus choisi", soutien projet indépendant)
- Radio moteur ⚡ QuickDream / ✨ DeepDream dans PostRecordingScreen (Deep pré-coché si taste tests dispo)
- Settings : Switch dev supprimé, remplacé par CTA "Débloquer DeepDream" + paywall
- Photo preview : X fermer + bouton Annuler + gate freeTier + increment compteur
- Compteur caractères overlay dans modal écriture
- Image gen réservée à DeepDream uniquement
- Bouton "Donner mon avis" dans Settings > Aide (Google Form)
- TRUST_MODE = false, FREE_DEEPDREAM_LIMIT = 5
- Prix HT corrigés Play Console (1.66/4.16/8.33/16.66 → affiche 1.99/4.99/9.99/19.99 TTC)

## PROCHAIN CHANTIER : i18n FR/EN/ES LATAM

### Objectif
Internationaliser l'app en 3 langues : Français (défaut actuel), English, Español (Amérique latine).

### Plan technique
1. Installer `i18next` + `react-i18next` + `expo-localization`
2. Créer `src/locales/fr.json`, `en.json`, `es.json`
3. Configurer i18n dans un fichier `src/config/i18n.js`
4. Extraire TOUS les strings hardcodés de chaque screen/component/modal
5. Ajouter un sélecteur de langue dans Settings (FR/EN/ES)
6. Détecter la langue du device au premier lancement via `expo-localization`
7. Persister le choix utilisateur dans AsyncStorage

### Sprint Notion i18n
https://www.notion.so/327976346b3681518e4df1519c9f7c1c

### Fichiers concernés (tous contiennent des strings FR hardcodés)
- `App.js` (modals écriture, photo, enregistrement)
- `src/screens/PostRecordingScreen.js` (radio moteur, enrichissement, tooltips, loading messages)
- `src/screens/SettingsScreen.js` (tous les labels, sections, descriptions)
- `src/screens/AnalysisScreen.js` (filtres, empty states, popover)
- `src/screens/ConversationScreen.js` (chat, actions)
- `src/screens/ArchivesScreen.js` (restaurer, supprimer)
- `src/screens/TrendsScreen.js` (labels charts)
- `src/screens/AtlasScreen.js`
- `src/modals/ActivateDeepDreamModal.js` (paywall textes, features, paliers)
- `src/components/DreamCard.js`
- `src/services/notificationService.js` (textes notifications)
- Onboarding screens (`src/screens/onboarding/`)

### Contraintes
- JavaScript, pas TypeScript
- Commencer par extraire les strings d'UN screen pour valider le setup, puis scaler
- Les noms de produits (QuickDream, DeepDream, Noctaliæ) ne se traduisent PAS
- Les fallback prix dans ActivateDeepDreamModal restent en € (marché principal)
- Mode recommandé Claude Code : **Plan mode** d'abord (setup i18n), puis **Auto accept** pour l'extraction massive

## TODO AUSSI (pas ce sprint)
- Google Form : restructurer pour tout-en-un (satisfaction, bugs, suggestions, features)
- Shake-to-feedback (expo-sensors Accelerometer)
- Item 5 : flow photo ne génère pas d'image (bypass PostRecordingScreen)

## CHEMIN PROJET
`E:\PROJECTS\Dream app\App\noctaliae-mobile\`
