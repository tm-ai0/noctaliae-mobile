# 📜 CHANGELOG - Noctaliæ

Toutes les modifications notables du projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
Versioning basé sur [Semantic Versioning](https://semver.org/lang/fr/)

---

## [0.9.8] - 2025-12-03 - "Secret Keeper" 🔐

### ✨ Ajouté
- **Authentification biométrique** pour les rêves secrets (Face ID / Empreinte / Code PIN)
- Service `biometricService.js` avec fallback automatique
- Permissions biométrie Android et iOS dans `app.json`
- Plugin `expo-local-authentication`

### 🔧 Modifié
- `SettingsScreen.js` : Bouton "Rêves protégés" demande authentification
- `DreamCard.js` : Déverrouillage rêve secret demande authentification

### 🐛 Corrigé
- Navigation ConversationScreen → retour vers Analyses (pas PostRecordingScreen)
- PDF ConversationScreen : section "Notes personnelles" retirée
- PDF DeepChatScreen : section "Notes personnelles" retirée
- PostRecordingScreen : texte "Vérifier le transcript →" tronqué proprement
- SettingsScreen : texte confidentialité simplifié + alignement gauche

---

## [0.9.7] - 2025-11-27

### ✨ Ajouté
- Système de rêves secrets (long press → protection)
- Overlay de verrouillage sur DreamCard
- Section "Rêves protégés" dans Settings
- Mode sélection multiple pour gérer les rêves

### 🔧 Modifié
- UI Settings : nouvelle section Confidentialité
- DreamCard : modal de protection avec explications

---

## [0.9.6] - 2025-11-25

### ✨ Ajouté
- Export PDF professionnel depuis ConversationScreen
- Export PDF depuis DeepChatScreen
- Design PDF aux couleurs Noctaliæ

### 🔧 Modifié
- Amélioration du formatage des analyses dans les PDF

---

## [0.9.5] - 2025-11-20

### ✨ Ajouté
- DeepChat : conversation approfondie avec l'IA
- Persistance des conversations
- Badges "nouveau message"

---

## [0.9.0] - 2025-11-15

### ✨ Ajouté
- Backend API v2.8 déployé sur api.thomasmaury.fr
- Double moteur d'analyse : QuickDream (Llama) + DeepDream (Claude)
- Système Persona avec empreintes personnalisées
- Onboarding complet

---

## [0.1.0] - 2025-10-01 - "First Light" 🌙

### ✨ Ajouté
- Enregistrement vocal des rêves
- Transcription via Groq Whisper
- Analyse IA basique
- Interface de base

---

## 📌 Légende

- ✨ **Ajouté** : Nouvelles fonctionnalités
- 🔧 **Modifié** : Changements dans les fonctionnalités existantes
- 🐛 **Corrigé** : Corrections de bugs
- 🗑️ **Supprimé** : Fonctionnalités retirées
- 🔒 **Sécurité** : Corrections de vulnérabilités
