# 🌙 Noctaliæ

**AI-powered dream analysis with neuroscience**

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/tm-ai0/noctaliae-mobile)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020)](https://expo.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

📖 **[Lire en français](./README.fr.md)** | 🇫🇷 **Read in French**

---

A React Native (Expo) mobile app for scientific dream analysis, based on the neuroscience research of Isabelle Arnulf (Paris Brain Institute) and powered by Claude Sonnet 4.5 and Llama 3.3 70B.

---

## ✨ Features

- 🎙️ **Voice Recording** : Capture your dreams right after waking up
- 🧠 **AI Analysis** : Two models to analyze your dreams
  - Claude Sonnet 4.5 (deep analysis)
  - Llama 3.3 70B (quick analysis)
- 💬 **Deep Conversation** : Chat with AI about your dreams
- 🎨 **Customizable Themes** : 6 night-inspired themes
- 📊 **Atlas** : Statistics and trends from your dreams
- 🔒 **Privacy-First** : Everything stays on your device

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
- **Zustand** (state management - coming soon)

### Backend
- **Node.js** + Express
- **Claude Sonnet 4.5** (Anthropic)
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

---

## 🎨 Themes

Noctaliæ offers 6 night-inspired themes:

- **Midnight** (default): Deep night blue with neon green accents
- **Aurora**: Purple and pink, inspired by northern lights
- **Sunset**: Orange and pink, like a sunset
- **Ocean**: Ocean blue with turquoise touches
- **Forest**: Forest green and earth tones
- **Lavender**: Soft and soothing purple

All themes include Noctaliæ brand colors:
- Warm gold (`#D2B14C`)
- Soft brown (`#88735C`)
- Gray-green (`#A0B4D4`)

---

## 🔐 Privacy

- ✅ Dreams stored locally (AsyncStorage)
- ✅ No cloud sync by default
- ✅ Transcriptions and analyses deleted after backend processing
- ✅ Opt-in analytics (can be disabled in settings)
- ✅ Open-source code (coming soon)

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Completed)
- [x] Audio recording
- [x] Whisper transcription
- [x] Claude & Llama analysis
- [x] Deep chat
- [x] Customizable themes
- [x] Backend v2.2

### 🚧 Phase 2: Pro Foundations (In Progress)
- [x] Complete TypeScript migration
- [x] Automated tests (>50% coverage)
- [x] Production monitoring (Sentry + Amplitude)
- [x] GitHub Actions CI/CD
- [x] Complete documentation

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

### Technologies
- **Anthropic** - Claude API
- **Groq** - Llama & Whisper APIs
- **OpenAI** - Whisper transcription
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
