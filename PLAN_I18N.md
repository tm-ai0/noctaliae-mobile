# Plan i18n Noctaliæ — FR / EN / ES LATAM

## Contexte
- Build 49 v1.3.0 en review Play Store
- Les analyses IA (DeepDream/QuickDream) répondent déjà dans la langue de l'utilisateur (capacité native des LLM), pas besoin de traduire les prompts
- Seule l'UI statique (labels, boutons, titres, messages, modals, toasts, onboarding) doit être internationalisée
- Fichier existant `src/i18n/translations.js` = embryon pour audio test uniquement, sera remplacé

---

## Stack i18n

| Package | Rôle |
|---------|------|
| `i18next` | Moteur de traduction |
| `react-i18next` | Hook `useTranslation()` pour React |
| `expo-localization` | Détection langue système (déjà dispo dans Expo SDK 54) |

**Pas besoin de** : i18next-http-backend (pas de chargement distant), i18next-browser-languagedetector (on utilise expo-localization)

---

## Phase 1 : Setup (30 min, Claude Code)

### 1.1 Installer les packages
```bash
npx expo install expo-localization
npm install i18next react-i18next --save
```

### 1.2 Créer la structure
```
src/i18n/
├── index.js          # Config i18next
├── locales/
│   ├── fr.json       # Français (source de vérité)
│   ├── en.json       # English
│   └── es.json       # Español LATAM
```

### 1.3 Config `src/i18n/index.js`
```javascript
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';

const LANG_KEY = '@noctaliae_language';

const getStoredLanguage = async () => {
  try {
    return await AsyncStorage.getItem(LANG_KEY);
  } catch { return null; }
};

export const changeLanguage = async (lang) => {
  await AsyncStorage.setItem(LANG_KEY, lang);
  await i18next.changeLanguage(lang);
};

export const initI18n = async () => {
  const stored = await getStoredLanguage();
  const deviceLang = getLocales()[0]?.languageCode || 'en';
  // Mapper les variantes : es-MX, es-AR, etc. → es
  const supported = ['fr', 'en', 'es'];
  const resolved = stored || (supported.includes(deviceLang) ? deviceLang : 'en');

  await i18next
    .use(initReactI18next)
    .init({
      resources: { fr: { translation: fr }, en: { translation: en }, es: { translation: es } },
      lng: resolved,
      fallbackLng: 'fr',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4', // important pour React Native
    });
};
```

### 1.4 Brancher dans `App.js`
```javascript
import { initI18n } from './src/i18n';

// Dans le useEffect de boot, AVANT la navigation :
await initI18n();
```

### 1.5 Supprimer l'ancien `src/i18n/translations.js` (ou le garder temporairement si l'audio test l'utilise encore)

---

## Phase 2 : Extraction des chaînes FR (2-3h, Claude Code)

### Convention de clés
Structure hiérarchique basée sur l'écran/composant :
```
"screen.element.action" ou "component.element"
```

### Inventaire complet des fichiers à traiter

#### Screens (20 fichiers)
| Fichier | Priorité | Volume estimé |
|---------|----------|---------------|
| ConversationScreen.js | P1 | ~40 clés |
| PostRecordingScreen.js | P1 | ~30 clés |
| AnalysisScreen.js | P1 | ~25 clés |
| SettingsScreen.js | P1 | ~50 clés (le plus gros) |
| ArchivesScreen.js | P2 | ~15 clés |
| TrendsScreen.js | P2 | ~20 clés |
| ProfileScreen.js | P2 | ~15 clés |
| InsightsScreen.js | P2 | ~15 clés |
| AtlasScreen.js | P2 | ~10 clés |
| ExplorerScreen.js | P2 | ~10 clés |
| DeepChatScreen.js | P2 | ~15 clés |
| ChatScreen.js | P2 | ~10 clés |
| DecrypterScreen.js | P3 | ~10 clés |
| MetaAnalysisScreen.js | P3 | ~10 clés |
| PersonaScreen.js | P3 | ~10 clés |
| PlaygroundScreen.js | P3 | ~5 clés |
| QuickRecordScreen.js | P3 | ~10 clés |
| VoiceAssistantScreen.js | P3 | ~10 clés |
| GeminiLiveScreen.js | P3 | ~10 clés |
| ResearchOptIn.js + Modal | P3 | ~15 clés |

#### Onboarding (5 fichiers)
| Fichier | Priorité | Volume estimé |
|---------|----------|---------------|
| OnboardingWelcome.js | P1 | ~15 clés |
| OnboardingDeepDream.js | P1 | ~20 clés (paywall) |
| OnboardingMarkers.js | P1 | ~10 clés |
| OnboardingFingerprints.js | P1 | ~10 clés |
| OnboardingNotifications.js | P1 | ~10 clés |

#### Components (sélection avec texte visible)
| Fichier | Priorité | Volume estimé |
|---------|----------|---------------|
| DreamCard.js | P1 | ~10 clés |
| CustomTabBar.js | P1 | ~5 clés |
| DreamShareTemplate.js | P1 | ~5 clés |
| MarkdownText.js | P2 | ~3 clés |
| CustomAlert.js | P2 | ~5 clés |
| NoctaliaeAlert.js | P2 | ~5 clés |
| RateLimitBanner.js | P2 | ~5 clés |
| UpdateToast.js | P3 | ~3 clés |
| FABRecordButton.js | P3 | ~2 clés |

#### Modals (3 fichiers)
| Fichier | Priorité | Volume estimé |
|---------|----------|---------------|
| ActivateDeepDreamModal.js | P1 | ~25 clés (paywall) |
| RateLimitModal.js | P2 | ~10 clés |
| UpdateAvailableModal.js | P3 | ~5 clés |

#### Services (textes d'erreur/messages)
| Fichier | Priorité |
|---------|----------|
| premiumService.js | P2 (messages d'erreur) |
| freeTierService.js | P2 (messages de limite) |
| streakService.js | P3 |

**Volume total estimé : ~500-600 clés**

---

## Phase 3 : Traductions EN/ES (1-2h, Claude.ai)

### Méthode
1. Le `fr.json` complet sert de source de vérité
2. Claude traduit en EN et ES LATAM dans le même chat
3. Attention ES LATAM (pas ES Espagne) : "computadora" pas "ordenador", "celular" pas "móvil", tutoiement avec "tú" (pas voseo argentin)

### Cas spéciaux à ne PAS traduire
- "Noctaliæ" (nom propre)
- "DeepDream" / "QuickDream" (noms de features)
- "Nocty" (mascotte)
- Noms scientifiques (Arnulf, Walker, Revonsuo, etc.)
- Emojis (universels)

### Cas à adapter (pas juste traduire)
- Dates : `DD/MM/YYYY` (FR) vs `MM/DD/YYYY` (EN) vs `DD/MM/YYYY` (ES) → utiliser `toLocaleDateString(locale)`
- Pluriels : i18next gère nativement (`_one`, `_other`)
- "Rêve lucide" → "Lucid dream" / "Sueño lúcido"

---

## Phase 4 : Remplacement dans le code (3-4h, Claude Code)

### Pattern de remplacement
```javascript
// AVANT
<Text>Mes rêves</Text>

// APRÈS
import { useTranslation } from 'react-i18next';
// dans le composant :
const { t } = useTranslation();
<Text>{t('analysis.title')}</Text>
```

### Ordre d'exécution recommandé
1. **P1 d'abord** : onboarding + écrans principaux (ConversationScreen, PostRecording, Analysis, Settings, paywall)
2. **P2 ensuite** : écrans secondaires + composants
3. **P3 enfin** : écrans tertiaires + edge cases

### Mode Claude Code recommandé
**Auto accept edits** pour les P1 (le pattern est répétitif et mécanique).
**Plan mode** pour les cas ambigus (textes dynamiques, interpolation).

---

## Phase 5 : Sélecteur de langue dans Settings (30 min)

### UX proposée
- Section "Langue / Language" dans SettingsScreen
- 3 options avec drapeaux :
  - 🇫🇷 Français
  - 🇬🇧 English  
  - 🇲🇽 Español
- Changement immédiat (pas besoin de restart)
- Persisté dans AsyncStorage (`@noctaliae_language`)

---

## Phase 6 : Tests & QA (1h)

### Checklist
- [ ] Onboarding complet en EN, ES
- [ ] Paywall (ActivateDeepDreamModal) : tous les textes traduits, prix OK (RevenueCat = localisé auto)
- [ ] ConversationScreen : UI en langue choisie, analyse IA dans la langue du rêve
- [ ] PostRecordingScreen : radio moteur, bandeau taste tests, section métadonnées
- [ ] Settings : toutes les sections, sélecteur de langue fonctionnel
- [ ] Partage (DreamShareTemplate) : texte branding en langue de l'UI
- [ ] Notifications : texte traduit
- [ ] Vérifier qu'aucun texte FR hardcodé ne subsiste (grep global)
- [ ] Layouts : vérifier que l'espagnol (souvent +20% caractères) ne casse pas les mises en page
- [ ] Fallback : si clé manquante → FR (pas de texte vide)

---

## Estimation totale

| Phase | Durée | Outil |
|-------|-------|-------|
| Setup | 30 min | Claude Code (auto accept) |
| Extraction FR | 2-3h | Claude Code (auto accept) |
| Traductions EN/ES | 1-2h | Claude.ai |
| Remplacement code | 3-4h | Claude Code (auto accept) |
| Sélecteur Settings | 30 min | Claude Code |
| Tests & QA | 1h | Manuel + Claude Code |
| **Total** | **~8-11h** | **2-3 sessions** |

---

## Prompt de reprise lundi

```
Chantier i18n Noctaliæ FR/EN/ES LATAM.
Lis le CLAUDE.md : E:\PROJECTS\Dream app\App\noctaliae-mobile\CLAUDE.md
Puis lis le plan : E:\PROJECTS\Dream app\App\noctaliae-mobile\PLAN_I18N.md
On attaque Phase 1 (setup i18next + expo-localization) puis Phase 2 (extraction fr.json).
Mode recommandé : auto accept edits.
cd "E:\PROJECTS\Dream app\App\noctaliae-mobile"
```

---

## Notes techniques

### Interpolation i18next
```json
{ "dreams.count_one": "{{count}} rêve", "dreams.count_other": "{{count}} rêves" }
```
```javascript
t('dreams.count', { count: 5 }) // → "5 rêves"
```

### Textes avec composants React (gras, liens)
Utiliser `<Trans>` de react-i18next :
```javascript
import { Trans } from 'react-i18next';
<Trans i18nKey="onboarding.welcome.subtitle">
  Analyse tes rêves avec l'<Text style={{fontWeight:'bold'}}>IA</Text>
</Trans>
```

### Backend / Prompts IA
Les system prompts backend n'ont PAS besoin de traduction. Les LLM détectent la langue de l'input et répondent dans cette langue. Vérifier quand même que les prompts ne contiennent pas de "Réponds en français" hardcodé.
