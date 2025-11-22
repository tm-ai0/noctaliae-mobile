# 🌙 Noctaliæ

**Analysez vos rêves avec l'IA et les neurosciences**

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/tm-ai0/noctaliae-mobile)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020)](https://expo.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

📖 **[Read in English](./README.md)** | 🇬🇧 **Lire en anglais**

---

Application mobile React Native (Expo) pour l'analyse scientifique des rêves, basée sur les travaux d'Isabelle Arnulf (Institut du Cerveau) et utilisant Claude Sonnet 4.5 et Llama 3.3 70B.

---

## ✨ Fonctionnalités

- 🎙️ **Enregistrement vocal** : Capturez vos rêves au réveil
- 🧠 **Analyse IA** : Deux modèles pour analyser vos rêves
  - Claude Sonnet 4.5 (analyse approfondie)
  - Llama 3.3 70B (analyse rapide)
- 💬 **Conversation approfondie** : Discutez de vos rêves avec l'IA
- 🎨 **Thèmes personnalisables** : 6 thèmes inspirés de la nuit
- 📊 **Insights** : Statistiques et tendances de vos rêves
- 🔒 **Confidentialité** : Tout reste sur votre appareil

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- npm ou yarn
- Expo CLI : `npm install -g expo-cli`
- Un appareil Android ou l'émulateur Android Studio

### Installation

```bash
# Clone le projet
git clone https://github.com/tm-ai0/noctaliae-mobile.git
cd noctaliae-mobile

# Installe les dépendances
npm install

# Copie et configure .env
cp .env.example .env

# Lance l'app
npm start
```

### Développement

```bash
# Lancer sur Android
npm run android

# Lancer sur iOS (macOS uniquement)
npm run ios

# Clear cache et relancer
npm run start:clear
```

---

## 📱 Technologies

### Frontend
- **React Native** 0.81.5
- **Expo** 54
- **TypeScript** (en migration)
- **React Navigation** 7
- **Zustand** (state management - à venir)

### Backend
- **Node.js** + Express
- **Claude Sonnet 4.5** (Anthropic)
- **Llama 3.3 70B** (Groq)
- **Whisper-1** (OpenAI) pour la transcription

### Infrastructure
- **Hébergement** : Infomaniak (backend)
- **CI/CD** : GitHub Actions
- **Build** : EAS Build (Expo)
- **Monitoring** : Sentry (crash reporting)
- **Analytics** : Amplitude

---

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - Structure du projet
- [Déploiement](./DEPLOYMENT.md) - Guide de déploiement complet
- [Tests](./TESTING.md) - Guide des tests
- [Guide de style](./STYLE_GUIDE.md) - Conventions de code

---

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Mode watch
npm test:watch

# Coverage
npm test:coverage

# Type checking
npm run typecheck
```

---

## 🏗️ Build & Déploiement

### Preview Build (APK)

```bash
# Installer EAS CLI
npm install -g eas-cli

# Login
eas login

# Build preview
eas build --platform android --profile preview
```

### Production Build (AAB)

```bash
eas build --platform android --profile production
```

---

## 🎨 Thèmes

Noctaliæ propose 6 thèmes inspirés de la nuit :

- **Midnight** (défaut) : Bleu nuit profond avec accents vert néon
- **Aurora** : Violet et rose, inspiré des aurores boréales
- **Sunset** : Orange et rose, comme un coucher de soleil
- **Ocean** : Bleu océan avec touches turquoise
- **Forest** : Vert forêt et tons terre
- **Lavender** : Violet doux et apaisant

Tous les thèmes incluent les couleurs de la marque Noctaliæ :
- Or chaleureux (`#D2B14C`)
- Brun doux (`#88735C`)
- Gris-vert (`#A0B4D4`)

---

## 🔐 Confidentialité

- ✅ Rêves stockés localement (AsyncStorage)
- ✅ Pas de sync cloud par défaut
- ✅ Transcriptions et analyses supprimées après traitement sur le backend
- ✅ Analytics opt-in (désactivable dans les settings)
- ✅ Code open-source (bientôt)

---

## 🗺️ Roadmap

### ✅ Phase 1 : MVP (Terminé)
- [x] Enregistrement audio
- [x] Transcription Whisper
- [x] Analyse Claude & Llama
- [x] Chat approfondi
- [x] Thèmes personnalisables
- [x] Backend v2.2

### 🚧 Phase 2 : Fondations Pro (En cours)
- [x] Migration TypeScript complète
- [x] Tests automatisés (>50% coverage)
- [x] Monitoring production (Sentry + Amplitude)
- [x] CI/CD GitHub Actions
- [x] Documentation complète

### 📅 Phase 3 : Features Premium (Q1 2026)
- [ ] Abonnement premium (Stripe)
- [ ] Cloud backup optionnel
- [ ] Export PDF/Email
- [ ] Statistiques avancées
- [ ] Voice assistant (Gemini Live)

### 📅 Phase 4 : Scale (Q2 2026)
- [ ] Version iOS
- [ ] Multilingue (EN, ES, DE)
- [ ] A/B testing
- [ ] Performance optimization
- [ ] Publication Google Play Store

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Merci de lire [CONTRIBUTING.md](./CONTRIBUTING.md) d'abord.

### Comment contribuer

1. Fork ce repository
2. Créez votre branche : `git checkout -b feature/ma-feature`
3. Committez vos changements : `git commit -m 'Ajout de X'`
4. Poussez : `git push origin feature/ma-feature`
5. Ouvrez une Pull Request

---

## 👤 Auteur

**Thomas Maury**
- Graphiste & Motion Designer
- Montpellier, France
- [GitHub](https://github.com/tm-ai0)
- Email: contact@thomasmaury.fr
- [Link.tree]((https://linktr.ee/thomasmaury))

---

## 📄 Licence

Licence MIT - voir le fichier [LICENSE](./LICENSE) pour plus de détails

---

## 🙏 Remerciements

### Recherche scientifique
- **Isabelle Arnulf** - Neurosciences du rêve (Institut du Cerveau)
- **Allan Hobson** - Modèle Activation-Synthèse
- **G. William Domhoff** - Hypothèse de Continuité
- **Matthew Walker** - Consolidation de la mémoire (UC Berkeley)

### Technologies
- **Anthropic** - API Claude
- **Groq** - APIs Llama & Whisper
- **OpenAI** - Transcription Whisper
- **Expo** - Framework React Native

---

## 📊 Stats Projet

![GitHub stars](https://img.shields.io/github/stars/tm-ai0/noctaliae-mobile?style=social)
![GitHub forks](https://img.shields.io/github/forks/tm-ai0/noctaliae-mobile?style=social)
![GitHub issues](https://img.shields.io/github/issues/tm-ai0/noctaliae-mobile)
![GitHub pull requests](https://img.shields.io/github/issues-pr/tm-ai0/noctaliae-mobile)

---

## 🌙 « Le rêve n'est pas un message codé à déchiffrer. C'est une activité cognitive concrète. »
— **Isabelle Arnulf**

---

**Fait avec ❤️ et 🧠 à Montpellier**
