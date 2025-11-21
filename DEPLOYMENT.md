# 🚀 GUIDE DE DÉPLOIEMENT NOCTALIÆ

Ce guide couvre tous les aspects du déploiement de Noctaliæ, du développement local à la production sur Google Play Store.

---

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Environnement Local](#environnement-local)
3. [Backend (Infomaniak)](#backend-infomaniak)
4. [Build Android](#build-android)
5. [Google Play Store](#google-play-store)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 PRÉREQUIS

### Outils nécessaires

```bash
# Node.js 20+
node --version

# NPM
npm --version

# Expo CLI
npm install -g expo-cli

# EAS CLI (pour les builds)
npm install -g eas-cli

# Git
git --version
```

### Comptes requis

- ✅ **Expo** : https://expo.dev (gratuit)
- ✅ **Google Play Console** : https://play.google.com/console (25$ one-time)
- ⚠️ **Sentry** : https://sentry.io (optionnel, 5K errors/mois gratuit)
- ⚠️ **Amplitude** : https://amplitude.com (optionnel, 10M events/mois gratuit)
- ✅ **Infomaniak** : Hébergement backend (déjà actif)

---

## 💻 ENVIRONNEMENT LOCAL

### 1. Clone & Installation

```bash
# Clone le repo
git clone https://github.com/tm-ai0/noctaliae-mobile.git
cd noctaliae-mobile

# Installe les dépendances
npm install

# Crée le fichier .env
cp .env.example .env
```

### 2. Configuration .env

```env
# Backend API
API_BASE_URL=https://api.thomasmaury.fr

# Monitoring (optionnel en dev)
SENTRY_DSN=
AMPLITUDE_API_KEY=

# Premium (à venir)
STRIPE_PUBLISHABLE_KEY=
```

### 3. Lancer l'app en développement

```bash
# Lancer Metro bundler
npm start

# Lancer sur Android
npm run android

# Lancer sur Android avec cache clear
npm run start:clear
```

### 4. Tester sur un vrai appareil

#### Option A : Expo Go (rapide, limité)

```bash
npm start
# Scanner le QR code avec Expo Go app
```

⚠️ **Limitation** : Ne fonctionne pas avec `expo-av` (enregistrement audio)

#### Option B : Development Build (recommandé)

```bash
# Créer un development build
eas build --platform android --profile development

# Installer l'APK sur ton téléphone
# Puis lancer:
npm start --dev-client
```

---

## 🌐 BACKEND (INFOMANIAK)

### État actuel

- ✅ Backend v2.2 déployé sur `https://api.thomasmaury.fr`
- ✅ Endpoints fonctionnels (transcription, analyse, chat)
- ✅ Rate limiting actif (100 req/h par IP)
- ✅ Toutes clés API configurées (Claude, Groq, OpenAI)

### Fichiers backend

```
BACKEND_V2.2_INFOMANIAK/
├── index.js           # Fichier principal
├── .env              # Variables d'environnement (sur Infomaniak)
└── package.json      # Dépendances
```

### Mettre à jour le backend

#### Via FileZilla (méthode actuelle)

1. **Connecte-toi à Infomaniak FTP**
   - Host: `ftp.infomaniak.com`
   - Username: ton username Infomaniak
   - Password: ton password Infomaniak

2. **Navigate vers**
   ```
   ~/sites/api.thomasmaury.fr/
   ```

3. **Backup l'ancien fichier**
   ```
   Renomme: index.js → index.js.backup-YYYYMMDD
   ```

4. **Upload le nouveau**
   ```
   Upload: BACKEND_V2.2_INFOMANIAK/index.js
   ```

5. **Redémarre l'app**
   - Va dans le panneau Infomaniak
   - Section "Node.js"
   - Clique sur "Redémarrer l'application"

6. **Vérifie**
   ```bash
   curl https://api.thomasmaury.fr/health
   # Devrait retourner: {"status":"ok","version":"2.2"}
   ```

#### Variables d'environnement backend

Les variables sont configurées directement sur Infomaniak (pas de fichier .env uploadé) :

```env
# API Keys (déjà configurées sur Infomaniak)
ANTHROPIC_API_KEY=sk-ant-xxxxx
GROQ_API_KEY=gsk_xxxxx
OPENAI_API_KEY=sk-xxxxx

# App config
PORT=3000
NODE_ENV=production
```

---

## 📱 BUILD ANDROID

### Types de builds

1. **Development** : Pour tester avec hot reload
2. **Preview** : APK à partager (beta testers)
3. **Production** : AAB pour Google Play Store

### Build Preview (APK)

```bash
# Premier build (configure EAS)
eas build:configure

# Login Expo
eas login

# Build APK
eas build --platform android --profile preview

# Le build prend 10-15 min
# Tu reçois un lien pour télécharger l'APK
```

### Build Production (AAB)

```bash
# Build AAB pour Play Store
eas build --platform android --profile production

# Le build génère un .aab
# Télécharge-le pour l'uploader sur Play Store
```

### Configurer le keystore (première fois)

EAS gère automatiquement le keystore. Si tu veux le réutiliser :

```bash
# Télécharge le keystore
eas credentials

# Sauvegarde-le dans un endroit sûr
# Tu en auras besoin pour les mises à jour
```

---

## 🏪 GOOGLE PLAY STORE

### Première publication (pas encore fait)

#### 1. Créer l'app sur Play Console

1. Va sur https://play.google.com/console
2. Clique sur "Créer une application"
3. Remplis les infos :
   - **Nom** : Noctaliæ
   - **Langue par défaut** : Français
   - **Type** : Application
   - **Gratuite/Payante** : Gratuite

#### 2. Remplir la fiche

**Fiche du Store**
- Titre (30 char max) : `Noctaliæ - Analyse de Rêves`
- Description courte (80 char) : `Analysez vos rêves avec l'IA et les neurosciences`
- Description complète (4000 char max) :

```
Noctaliæ vous aide à comprendre vos rêves grâce à l'intelligence artificielle et aux neurosciences.

🧠 ANALYSE SCIENTIFIQUE
Basée sur les travaux d'Isabelle Arnulf (Institut du Cerveau), nos analyses utilisent les dernières avancées en neurosciences du rêve.

🎙️ ENREGISTREMENT VOCAL
Enregistrez vos rêves au réveil, quand ils sont encore frais dans votre mémoire.

🤖 IA AVANCÉE
Deux modèles d'IA pour analyser vos rêves :
- Claude Sonnet 4.5 (analyse approfondie)
- Llama 3.3 70B (analyse rapide)

💬 CONVERSATION APPROFONDIE
Posez des questions sur vos rêves, explorez leur signification en profondeur.

🎨 INTERFACE ÉLÉGANTE
Design moderne inspiré de la nuit, avec plusieurs thèmes personnalisables.

🔒 CONFIDENTIALITÉ
Vos rêves restent sur votre appareil. Aucune synchronisation cloud par défaut.
```

**Captures d'écran requises**
- 2 captures téléphone minimum (1080x1920 ou 1080x2340)
- 1 icône d'app haute résolution (512x512)
- 1 bannière (1024x500) optionnelle

#### 3. Catégorisation

- **Catégorie** : Santé et forme
- **Tags** : Rêves, IA, Neurosciences, Journal intime
- **Public cible** : 13+
- **Contenu** :
  - ❌ Annonces : Non
  - ❌ Achats intégrés : Non (pour l'instant)
  - ✅ Collecte de données : Oui (analytics optionnel)

#### 4. Conformité

**Politique de confidentialité**
- Tu dois créer une page de politique de confidentialité
- Héberge-la sur https://thomasmaury.fr/noctaliae/privacy
- Ajoute l'URL dans Play Console

**Exemple de contenu minimal** :

```markdown
# Politique de Confidentialité - Noctaliæ

Dernière mise à jour : [Date]

## Données collectées

- **Enregistrements audio** : Stockés localement sur votre appareil
- **Transcriptions** : Envoyées à notre serveur pour analyse, puis supprimées
- **Analyses IA** : Stockées localement sur votre appareil

## Données partagées

Nous n'envoyons vos données qu'aux services suivants pour le fonctionnement de l'app :
- OpenAI (transcription Whisper)
- Anthropic (analyse Claude)
- Groq (analyse Llama)

## Vos droits

Vous pouvez supprimer toutes vos données à tout moment depuis l'app.

## Contact

contact@thomasmaury.fr
```

#### 5. Upload de l'AAB

```bash
# Build production
eas build --platform android --profile production

# Une fois le build terminé, télécharge le .aab

# Upload via Play Console
# Production > Releases > Create new release
# Upload l'AAB
```

#### 6. Tests internes

Avant la publication publique, fais des tests internes :

1. Crée une liste de testeurs (toi + quelques amis)
2. Upload l'AAB en "Internal Testing"
3. Teste pendant quelques jours
4. Fix les bugs
5. Passe en "Open Testing" (beta publique)
6. Enfin, passe en "Production"

---

## 📊 MONITORING

### Sentry (Crash Reporting)

#### Setup

```bash
# Installe Sentry
npm install @sentry/react-native

# Configure
npx @sentry/wizard -i reactNative -p android
```

#### Obtenir le DSN

1. Va sur https://sentry.io
2. Crée un projet "Noctaliæ"
3. Copie le DSN : `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
4. Ajoute-le dans `.env` :
   ```env
   SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

#### Tester

```typescript
// Force une erreur pour tester
import { captureError } from '@/config/sentry.config';

throw new Error('Test Sentry');
```

### Amplitude (Analytics)

#### Setup

```bash
# Installe Amplitude
npm install @amplitude/analytics-react-native
```

#### Obtenir l'API Key

1. Va sur https://amplitude.com
2. Crée un projet "Noctaliæ"
3. Copie l'API Key
4. Ajoute-la dans `.env` :
   ```env
   AMPLITUDE_API_KEY=xxxxx
   ```

#### Tracker des events

```typescript
import { Analytics } from '@/config/analytics.config';

Analytics.recordingStarted();
Analytics.analysisCompleted('claude-sonnet-4', 5.2, 'deep');
```

---

## 🐛 TROUBLESHOOTING

### Problème 1 : "Unable to resolve module"

```bash
# Clear cache
npm start -- --clear

# Ou
npx expo start -c

# Ou
rm -rf node_modules
npm install
```

### Problème 2 : Build EAS échoue

```bash
# Vérifie les logs
eas build:list

# Vérifie la config
eas build:configure

# Nettoie et rebuild
eas build --platform android --profile preview --clear-cache
```

### Problème 3 : Backend ne répond pas

```bash
# Vérifie le health check
curl https://api.thomasmaury.fr/health

# Si erreur 502/503 → Redémarre l'app sur Infomaniak

# Si erreur 429 → Rate limit dépassé, attends 1h
```

### Problème 4 : Audio ne s'enregistre pas

```bash
# Vérifie les permissions dans app.json
{
  "android": {
    "permissions": [
      "RECORD_AUDIO",
      "WRITE_EXTERNAL_STORAGE"
    ]
  }
}

# Rebuild l'app
eas build --platform android --profile development
```

### Problème 5 : TypeScript errors

```bash
# Check types
npx tsc --noEmit

# Si trop d'erreurs, migration progressive :
# Renomme juste les fichiers .js → .ts
# Ajoute // @ts-nocheck en haut
# Fix progressivement
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

### Avant chaque release

- [ ] Tests passent : `npm test`
- [ ] TypeScript OK : `npx tsc --noEmit`
- [ ] Build local fonctionne : `npm run android`
- [ ] Backend health check OK : `curl https://api.thomasmaury.fr/health`
- [ ] Version incrémentée dans `app.json`
- [ ] Changelog mis à jour
- [ ] Screenshots à jour (si changements UI)

### Build Preview (Beta)

- [ ] `eas build --platform android --profile preview`
- [ ] Télécharge l'APK
- [ ] Teste sur plusieurs appareils
- [ ] Partage avec beta testers
- [ ] Collecte feedback

### Build Production (Play Store)

- [ ] Tous les bugs beta fixés
- [ ] `eas build --platform android --profile production`
- [ ] Upload AAB sur Play Console
- [ ] Remplis release notes
- [ ] Soumets pour review Google (1-3 jours)
- [ ] Une fois approuvé, déploie progressivement (10% → 50% → 100%)

---

## 📞 SUPPORT

Si tu as des questions :

- **Email** : contact@thomasmaury.fr
- **GitHub Issues** : https://github.com/tm-ai0/noctaliae-mobile/issues
- **Documentation** : Voir `ARCHITECTURE.md` et `TESTING.md`

---

**Dernière mise à jour : 21/11/2025**
