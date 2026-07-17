# 🌙 Noctaliæ

**AI-powered dream analysis with neuroscience**

[![Version](https://img.shields.io/badge/version-1.4.1-blue)]
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020)](https://expo.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)


---

A React Native (Expo) mobile app for scientific dream analysis, based on cutting-edge neuroscience research from Isabelle Arnulf (Paris Brain Institute), Matthew Walker (UC Berkeley), Allan Hobson, G. William Domhoff and more. Powered by Claude Sonnet 4.6 and Llama 3.3 70B.

---

## ✨ Features

- 🎙️ **Voice Recording** : Capture your dreams right after waking up
- 🧠 **AI Analysis** : Two models to analyze your dreams
  - Claude Sonnet 4.6 (deep analysis)
  - Llama 3.3 70B (quick analysis)
- 💬 **Deep Conversation** : Chat with AI about your dreams
- 🎨 **Customizable Themes** : 6 night-inspired themes
- 🗺️ **Dream Atlas** : Your gateway to understanding dreams
  - 🧭 Explorer: Interactive learning cards (Kinnu-style)
  - 🔬 Laboratoire: Coming soon
  - 🗺️ Cartographie: Coming soon
  - 🔓 Décrypter: Scientific fact sheets about dreams
- 📷 **Photo Capture** : Take photos of your dream journal or drawings (Claude Vision)
- 🔐 **Secret Dreams** : Biometric-protected private dreams (Face ID/Touch ID/PIN)
- 🔒 **Privacy-First** : Everything stays on your device

---

## 📚 Scientific Resources

The science behind Noctaliæ is based on cutting-edge neuroscience research. Explore our curated resources:

- 📓 **[NotebookLM Research Hub](https://notebooklm.google.com/notebook/b9f1abfc-0d66-42d7-a92a-20e0b55cbdcb?artifactId=dccf3bfc-2347-4532-8ed5-52a884e184b5)** - Interactive AI-powered research notes, podcasts, and flashcards

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Android device or Android Studio emulator

### Installation

```bash
# Clone the project
git clone https://github.com/tm-ai0/noctaliae-mobile.git
cd noctaliae-mobile

# Install dependencies
npm install

# Copy and configure .env
cp .env.example .env

# Start the app
npm start
```

### Development

```bash
# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Clear cache and restart
npm run start:clear
```

---

## 📱 Tech Stack

### Frontend
- **React Native** 0.81.5
- **Expo** 54
- **TypeScript** (migration in progress)
- **React Navigation** 7
- **Zustand** (state management)

### Backend
- **Node.js** + Express (v2.18)
- **Claude Sonnet 4.6** (Anthropic)
- **Llama 3.3 70B** (Groq)
- **Whisper** (Groq) for transcription

### Infrastructure
- **Hosting**: Infomaniak (backend)
- **CI/CD**: GitHub Actions
- **Build**: EAS Build (Expo)
- **Monitoring**: Sentry (crash reporting)
- **Analytics**: Amplitude

---

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - Project structure
- [Deployment](./DEPLOYMENT.md) - Complete deployment guide
- [Testing](./TESTING.md) - Testing guide
- [Style Guide](./STYLE_GUIDE.md) - Code style conventions

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test:watch

# Coverage
npm test:coverage

# Type checking
npm run typecheck
```

---

## 🏗️ Build & Deploy

### Preview Build (APK)

```bash
# Install EAS CLI
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

## 🔐 Security & Privacy

### Data Protection
- ✅ Dreams stored locally (AsyncStorage + SecureStore for sensitive data)
- ✅ No cloud sync by default
- ✅ Transcriptions and analyses deleted after backend processing
- ✅ Opt-in analytics (can be disabled in settings)
- ✅ Open-source code

### API Security
- ✅ No API keys exposed in frontend code
- ✅ Token-based authentication with revocable tokens
- ✅ Rate limiting protection (10 requests/day per IP)
- ✅ HTTPS-only communication
- ✅ Backend hosted on secure European servers (Infomaniak, Switzerland)

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Completed)
- [x] Audio recording
- [x] Whisper transcription
- [x] Claude & Llama analysis
- [x] Deep chat
- [x] Customizable themes
- [x] Backend v2.11
- [x] Dream Atlas with Explorer & Décrypter sections
- [x] Installation tracking & admin dashboard

### 🚧 Phase 2: Pro Foundations (In Progress)
- [x] Complete TypeScript migration
- [x] Automated tests (>50% coverage)
- [x] Production monitoring (Sentry + Amplitude)
- [x] GitHub Actions CI/CD
- [x] Complete documentation
- [x] In-app update notifications
- [x] Kill switch system for forced updates
- [x] Photo capture with Claude Vision
- [x] Secret dreams with biometric protection
- [x] Sentry crash reporting

### 📅 Phase 3: Premium Features (Q1 2026)
- [ ] Premium subscription (Stripe)
- [ ] Optional cloud backup
- [ ] PDF/Email export
- [ ] Advanced statistics
- [ ] Voice assistant (Gemini Live)

### 📅 Phase 4: Scale (Q2 2026)
- [ ] iOS version
- [ ] Multilingual (EN, ES, DE, FR)
- [ ] A/B testing
- [ ] Performance optimization
- [ ] Google Play Store publication

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

### How to Contribute

1. Fork this repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add X'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 👤 Author

**Thomas Maury**
- Graphic & Motion Designer
- Montpellier, France
- [GitHub](https://github.com/tm-ai0)
- Email: contact@thomasmaury.fr
- [Portfolio](https://thomasmaury.fr)

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 🙏 Acknowledgments

### Scientific Research
- **Isabelle Arnulf** - Dream neuroscience (Paris Brain Institute)
- **Allan Hobson** - Activation-Synthesis Model
- **G. William Domhoff** - Continuity Hypothesis
- **Matthew Walker** - Memory Consolidation (UC Berkeley)
- *...and more*

### Technologies
- **Anthropic** - Claude API
- **Groq** - Llama & Whisper APIs
- **Expo** - React Native framework

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/tm-ai0/noctaliae-mobile?style=social)
![GitHub forks](https://img.shields.io/github/forks/tm-ai0/noctaliae-mobile?style=social)
![GitHub issues](https://img.shields.io/github/issues/tm-ai0/noctaliae-mobile)
![GitHub pull requests](https://img.shields.io/github/issues-pr/tm-ai0/noctaliae-mobile)

---

## 🌙 "The dream is not a coded message to decipher. It is a concrete cognitive activity."
— **Isabelle Arnulf**

---

**Made with ❤️ and 🧠 in Montpellier, France**
