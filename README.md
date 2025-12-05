# 🌙 Noctaliæ

**AI-powered dream analysis with neuroscience**

[![Version](https://img.shields.io/badge/version-0.9.10-blue)]
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020)](https://expo.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

A React Native (Expo) mobile app for scientific dream analysis, based on the neuroscience research of Isabelle Arnulf (Paris Brain Institute) and powered by Claude Sonnet 4.5 and Llama 3.3 70B.

---

## ✨ Features

- 🎙️ **Voice Recording** : Capture your dreams right after waking up
- 🧠 **AI Analysis** : Two models to analyze your dreams
  - Claude Sonnet 4.5 (deep analysis)
  - Llama 3.3 70B (quick analysis)
- 💬 **Deep Conversation** : Chat with AI about your dreams
- 🗺️ **Dream Atlas** : Educational content about dream science
  - Explorer: Interactive learning cards
  - Décrypter: Scientific fact sheets
- 📊 **Trends** : Track your dream patterns over time
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

---

## 📱 Tech Stack

### Frontend
- **React Native** 0.81.5
- **Expo** SDK 54
- **React Navigation** 7

### Backend
- **Node.js** + Express (v2.8)
- **Claude Sonnet 4.5** (Anthropic)
- **Llama 3.3 70B** (Groq)
- **Whisper** (Groq) for transcription
- **Google Cloud TTS** for voice synthesis

### Infrastructure
- **Hosting**: Infomaniak
- **Build**: EAS Build (Expo)

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Completed)
- [x] Voice recording & transcription
- [x] DeepDream & QuickDream analysis
- [x] Interactive chat
- [x] Dream Atlas (Explorer + Décrypter)
- [x] Backend v2.8

### 🚧 Phase 2: Wearable Integration (Dec 2025)
- [ ] Health Connect integration
- [ ] Sleep data from smartwatch
- [ ] Physiological context in analysis

### 📅 Phase 3: Dream Capture Alarm (Jan 2026)
- [ ] Smart alarm based on REM detection
- [ ] Optimal wake-up timing
- [ ] Immediate dream capture screen

### 📅 Phase 4: Insights & Trends (Feb 2026)
- [ ] Visual timeline
- [ ] Pattern detection
- [ ] Word cloud
- [ ] Sleep-dream correlations

### 📅 Phase 5: Production (Q2 2026)
- [ ] Google Play Store publication
- [ ] iOS version

---

## 🔐 Privacy

- ✅ Dreams stored locally (AsyncStorage)
- ✅ AES-256 encryption for sensitive dreams
- ✅ No cloud sync by default
- ✅ Audio deleted after transcription

---

## 👤 Author

**Thomas Maury**
- Graphic & Motion Designer
- Montpellier, France
- [GitHub](https://github.com/tm-ai0)
- [Portfolio](https://thomasmaury.fr)

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

---

## 🙏 Acknowledgments

### Scientific Research
- **Isabelle Arnulf** - Dream neuroscience (Paris Brain Institute)
- **Antti Revonsuo** - Threat Simulation Theory
- **Matthew Walker** - Memory Consolidation (UC Berkeley)
- **G. William Domhoff** - Continuity Hypothesis

### Technologies
- **Anthropic** - Claude API
- **Groq** - Llama & Whisper APIs
- **Expo** - React Native framework

---

## 🌙 "The dream is not a coded message to decipher. It is a concrete cognitive activity."
— **Isabelle Arnulf**

---

**Made with ❤️ and 🧠 in Montpellier, France**
