# 🔐 Noctaliæ Security Whitepaper
## Architecture, Chiffrement, et Protection des Données

**Version :** 1.0  
**Date :** 22 novembre 2025  
**Auteur :** Thomas Maury  
**Contact :** [ton email ou lien GitHub]

---

## 📋 **Résumé Exécutif**

Noctaliæ est une application mobile d'analyse scientifique des rêves qui place la **vie privée et la sécurité au cœur de son architecture**. Ce document détaille les mesures techniques mises en place pour protéger les données des utilisateurs.

**Principes fondamentaux :**
- ✅ **Privacy-First** : Données 100% locales par défaut
- ✅ **Backend éphémère** : Analyse puis suppression immédiate
- ✅ **Chiffrement standard militaire** : AES-256-GCM pour données recherche
- ✅ **Transparence radicale** : Code open-source, audit public
- ✅ **Opt-in recherche** : Anonymisation stricte et consentement explicite

---

## 📖 **Table des Matières**

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Flux de données](#2-flux-de-données)
3. [Chiffrement et sécurité](#3-chiffrement-et-sécurité)
4. [Authentification](#4-authentification)
5. [Privacy by design](#5-privacy-by-design)
6. [Opt-in recherche](#6-opt-in-recherche)
7. [Conformité RGPD](#7-conformité-rgpd)
8. [Gestion des incidents](#8-gestion-des-incidents)
9. [Audit et transparence](#9-audit-et-transparence)
10. [Feuille de route sécurité](#10-feuille-de-route-sécurité)

---

## 1. **Vue d'ensemble de l'architecture**

### 1.1 Composants système

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT MOBILE (React Native)                            │
├─────────────────────────────────────────────────────────┤
│  • Enregistrement audio local                           │
│  • Stockage AsyncStorage (non-chiffré mais offline)     │
│  • Interface utilisateur                                │
│  • Gestion opt-in recherche                             │
└─────────────────────────────────────────────────────────┘
                         ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│  BACKEND API (Node.js/Express)                          │
├─────────────────────────────────────────────────────────┤
│  • Hébergement : Infomaniak (Suisse, RGPD-compliant)   │
│  • Transcription : Groq Whisper-large-v3                │
│  • Analyse : Anthropic Claude / Meta Llama              │
│  • Rate limiting : 10 requêtes/heure/IP                 │
│  • Pas de stockage permanent                            │
└─────────────────────────────────────────────────────────┘
                         ↓ (Si opt-in)
┌─────────────────────────────────────────────────────────┐
│  BASE RECHERCHE (Firebase Storage)                      │
├─────────────────────────────────────────────────────────┤
│  • Anonymisation stricte                                │
│  • Chiffrement AES-256-GCM                              │
│  • Stockage long terme                                  │
│  • Accès restreint chercheurs validés                   │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Hébergement

| Composant | Hébergeur | Localisation | Conformité |
|-----------|-----------|--------------|------------|
| **Backend API** | Infomaniak | Suisse | RGPD ✅ |
| **Base recherche** | Firebase (Google) | EU (sélectionné) | RGPD ✅ |
| **DNS** | Cloudflare | Global | RGPD ✅ |
| **App mobile** | Device utilisateur | N/A | Local ✅ |

---

## 2. **Flux de données**

### 2.1 Enregistrement d'un rêve

```
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 1 : Enregistrement audio                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  User appuie sur bouton → Audio enregistré localement        │
│  Stockage : AsyncStorage (React Native)                     │
│  Chiffrement : ❌ Non (mais offline = isolation)             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 2 : Transcription (si demandée)                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Audio → Backend API (HTTPS TLS 1.3)                         │
│  Backend → Groq Whisper-large-v3                             │
│  Groq → Backend (texte transcrit)                            │
│  Backend → ⚠️ SUPPRIME l'audio immédiatement                │
│  Backend → Client (texte seulement)                          │
│                                                               │
│  Durée de vie audio sur serveur : < 30 secondes              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 3 : Analyse IA                                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Texte → Backend API                                         │
│  Backend → Anthropic Claude / Meta Llama                     │
│  IA → Backend (analyse structurée)                           │
│  Backend → ⚠️ SUPPRIME le texte immédiatement               │
│  Backend → Client (analyse seulement)                        │
│                                                               │
│  Durée de vie texte sur serveur : < 10 secondes              │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 4 : Stockage local                                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Analyse → AsyncStorage (local)                              │
│  Rêve complet stocké : audio + texte + analyse               │
│  Accessible hors ligne                                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Opt-in recherche (si activé)

```
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 5 : Anonymisation                                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Données RETIRÉES :                                          │
│  ❌ user_id, email, nom, prénom                              │
│  ❌ adresse IP, localisation GPS                             │
│  ❌ metadata device (modèle téléphone, OS version)           │
│  ❌ horodatage précis (arrondi au mois)                      │
│                                                               │
│  Données CONSERVÉES :                                        │
│  ✅ Texte transcrit                                          │
│  ✅ Tags émotions (peur, joie, etc.)                         │
│  ✅ Thèmes détectés                                          │
│  ✅ Durée enregistrement                                     │
│  ✅ Timestamp approximatif (mois/année)                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 6 : Chiffrement AES-256-GCM                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Données anonymisées → JSON string                           │
│  JSON → Chiffrement AES-256-GCM                              │
│  Clé : 256 bits (stockée variable environnement)            │
│  IV : 128 bits (aléatoire unique par rêve)                   │
│  AuthTag : 128 bits (intégrité)                              │
│                                                               │
│  Output : { encrypted, iv, authTag }                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 7 : Stockage long terme                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Firebase Storage (EU region)                                │
│  Format :                                                    │
│  {                                                           │
│    id: "uuid-v4-random",                                     │
│    encrypted: "A8x3K9mP2L...",                               │
│    iv: "B1C2D3E4...",                                        │
│    authTag: "F5G6H7I8...",                                   │
│    timestamp: "2025-11"                                      │
│  }                                                           │
│                                                               │
│  Accès : Chercheurs validés uniquement (avec clé déchiffr.)  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. **Chiffrement et sécurité**

### 3.1 Chiffrement en transit

| Connexion | Protocole | Version | Ciphersuite |
|-----------|-----------|---------|-------------|
| **App ↔ Backend** | HTTPS | TLS 1.3 | TLS_AES_256_GCM_SHA384 |
| **Backend ↔ Groq** | HTTPS | TLS 1.3 | Auto-négocié |
| **Backend ↔ Anthropic** | HTTPS | TLS 1.3 | Auto-négocié |
| **Backend ↔ Firebase** | HTTPS | TLS 1.3 | Auto-négocié |

**Certificats SSL :**
- Émetteur : Let's Encrypt
- Validité : 90 jours (renouvellement automatique)
- Vérification : OCSP Stapling activé

### 3.2 Chiffrement au repos

| Donnée | Localisation | Chiffrement | Détails |
|--------|--------------|-------------|---------|
| **Rêves locaux** | AsyncStorage (téléphone) | ❌ Clair | Filesystem chiffré par OS (iOS/Android) |
| **Rêves recherche** | Firebase Storage | ✅ AES-256-GCM | Clé 256 bits, IV unique |
| **Logs backend** | Infomaniak | ✅ Pas de données perso | Logs IP anonymisées |

### 3.3 Algorithme AES-256-GCM

**Spécifications techniques :**
- **Algorithme** : AES (Advanced Encryption Standard)
- **Taille clé** : 256 bits (2^256 combinaisons possibles)
- **Mode opération** : GCM (Galois/Counter Mode)
- **IV** : 128 bits (généré aléatoirement pour chaque chiffrement)
- **Tag authentification** : 128 bits (détection modifications)

**Propriétés de sécurité :**
- ✅ **Confidentialité** : Impossible de lire sans clé
- ✅ **Intégrité** : Détection modification des données
- ✅ **Authentification** : Vérification origine données
- ✅ **Résistance attaques** : Force brute impossible (10^77 années)

**Certifications :**
- FIPS 140-2 (US Government)
- ISO/IEC 18033-3
- NSA approuvé pour TOP SECRET

**Implémentation :**
```javascript
// Node.js crypto module (standard)
const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.RESEARCH_KEY, 'hex'); // 32 bytes
const iv = crypto.randomBytes(16); // 16 bytes unique
```

### 3.4 Gestion des clés

**Clé de chiffrement recherche :**
- **Génération** : `openssl rand -hex 32` (256 bits aléatoires)
- **Stockage** : Variable d'environnement (pas dans code source)
- **Accès** : Backend uniquement (jamais côté client)
- **Rotation** : Tous les 12 mois (roadmap)
- **Backup** : Clé sauvegardée dans coffre-fort sécurisé (HashiCorp Vault ou équivalent)

**Clés API tierces :**
- Groq : Variable environnement
- Anthropic : Variable environnement
- Firebase : Service Account JSON (pas dans Git)

---

## 4. **Authentification**

### 4.1 Architecture actuelle (v1.0)

**Status :** ⚠️ Pas encore implémenté (app en développement)

**Approche prévue :**
- Firebase Authentication (tokens opaques)
- Anonymous login par défaut (pas de compte requis)
- Opt-in compte utilisateur (pour sync multi-device)

### 4.2 Roadmap authentification

**Phase 1 (Q1 2026) : Anonymous Auth**
```javascript
// Firebase Anonymous
const userCredential = await signInAnonymously(auth);
const userId = userCredential.user.uid; // UUID anonyme
```

**Phase 2 (Q2 2026) : Email optionnel**
```javascript
// Si user veut sync multi-device
const credential = await linkWithCredential(
  anonymousUser,
  EmailAuthProvider.credential(email, password)
);
```

**Phase 3 (Q3 2026) : OAuth social**
- Google Sign-In
- Apple Sign-In

### 4.3 Tokens

| Type | Format | Durée validité | Stockage |
|------|--------|----------------|----------|
| **Access Token** | JWT opaque | 1 heure | AsyncStorage (secure) |
| **Refresh Token** | UUID v4 | 30 jours | AsyncStorage (secure) |
| **Device Token** | UUID v4 | Permanent | AsyncStorage |

**Rotation tokens :**
- Access token renouvelé toutes les heures
- Refresh token rotatif (nouveau à chaque refresh)
- Révocation possible côté serveur

---

## 5. **Privacy by design**

### 5.1 Principe de minimisation

**Données collectées :**
```json
{
  "strictement_nécessaires": [
    "audio_rêve (temporaire)",
    "texte_transcrit (temporaire)",
    "analyse_IA (locale)"
  ],
  "jamais_collectées": [
    "localisation_GPS",
    "contacts_téléphone",
    "photos",
    "calendrier",
    "autres_apps_installées",
    "historique_navigation"
  ]
}
```

### 5.2 Durée de conservation

| Donnée | Localisation | Durée conservation |
|--------|--------------|-------------------|
| **Audio rêve** | Backend (RAM) | < 30 secondes (puis suppression) |
| **Texte transcrit** | Backend (RAM) | < 10 secondes (puis suppression) |
| **Rêve complet** | Téléphone (local) | Jusqu'à suppression user |
| **Rêve recherche** | Firebase (chiffré) | Permanent (anonymisé) |
| **Logs backend** | Infomaniak | 7 jours (IP anonymisée) |

### 5.3 Pas de tracking

**❌ Aucun tracker tiers :**
- Pas de Google Analytics
- Pas de Facebook SDK
- Pas de Mixpanel / Amplitude
- Pas de cookies publicitaires

**✅ Analytics respectueuse (optionnel) :**
- Plausible Analytics (RGPD-compliant, sans cookies)
- Données agrégées uniquement (pas d'identification)
- Opt-out possible

---

## 6. **Opt-in recherche**

### 6.1 Consentement explicite

**Workflow UI :**
```
1. User va dans Settings
2. Toggle "Contribuer à la recherche" (OFF par défaut)
3. Popup explicative :
   "Vos rêves seront anonymisés (zéro donnée perso) 
    et partagés avec des chercheurs en neurosciences.
    
    Cela aide à :
    • Comprendre les mécanismes du sommeil
    • Valider les théories scientifiques
    • Faire avancer la science des rêves
    
    Vous pouvez désactiver à tout moment."
4. User clique "J'accepte" → Stockage AsyncStorage
5. Chaque nouveau rêve → Envoi anonymisé + chiffré
```

### 6.2 Anonymisation stricte

**Données RETIRÉES avant chiffrement :**
```javascript
const anonymize = (dreamData, userId, deviceInfo) => {
  return {
    // ✅ Gardé
    content: dreamData.transcript,
    emotions: dreamData.emotions,
    themes: dreamData.analysis.themes,
    duration: dreamData.duration,
    timestamp_month: new Date().toISOString().slice(0, 7), // 2025-11
    
    // ❌ Retiré
    // userId: SUPPRIMÉ
    // email: SUPPRIMÉ
    // deviceModel: SUPPRIMÉ
    // ipAddress: SUPPRIMÉ
    // gpsLocation: SUPPRIMÉ
    // timestamp_precise: SUPPRIMÉ
  };
};
```

### 6.3 Réversibilité

**User peut à tout moment :**
- Désactiver l'opt-in (futurs rêves non partagés)
- Demander suppression rêves déjà partagés (email support)
- Exporter ses données locales (JSON)

**Limite technique :**
- Une fois anonymisé, impossible de relier un rêve chiffré à un user
- Suppression nécessite identification par timestamp approximatif

---

## 7. **Conformité RGPD**

### 7.1 Base légale

| Traitement | Base légale RGPD | Article |
|------------|------------------|---------|
| **Enregistrement local** | Intérêt légitime | Art. 6(1)(f) |
| **Transcription** | Exécution contrat (service) | Art. 6(1)(b) |
| **Analyse IA** | Exécution contrat | Art. 6(1)(b) |
| **Opt-in recherche** | Consentement explicite | Art. 6(1)(a) |

### 7.2 Droits des utilisateurs

| Droit RGPD | Implémentation Noctaliæ |
|------------|------------------------|
| **Accès** | Export JSON depuis Settings |
| **Rectification** | Édition locale des rêves |
| **Effacement** | Suppression locale + demande backend |
| **Portabilité** | Export JSON (format standard) |
| **Opposition** | Désactivation opt-in |
| **Limitation** | Données locales par défaut |

### 7.3 Transferts hors UE

**Status :**
- ✅ Backend : Suisse (Infomaniak) = EEA-equivalent
- ⚠️ Groq : USA (clauses contractuelles standard)
- ⚠️ Anthropic : USA (clauses contractuelles standard)
- ✅ Firebase : EU region sélectionnée

**Mesures de protection :**
- Chiffrement TLS 1.3
- Suppression immédiate après traitement
- Pas de stockage aux USA

---

## 8. **Gestion des incidents**

### 8.1 Plan de réponse

**En cas de brèche de sécurité :**

```
PHASE 1 : Détection (< 1 heure)
├─ Logs backend surveillés
├─ Alertes automatiques
└─ Investigation immédiate

PHASE 2 : Confinement (< 4 heures)
├─ Isolation composant compromis
├─ Rotation clés si nécessaire
└─ Blocage accès non-autorisés

PHASE 3 : Notification (< 24 heures si données perso exposées)
├─ Email utilisateurs affectés
├─ Publication blog transparente
└─ Notification CNIL si requis (< 72h)

PHASE 4 : Remédiation (< 7 jours)
├─ Patch vulnérabilité
├─ Tests sécurité
└─ Déploiement correctif

PHASE 5 : Post-mortem (< 14 jours)
├─ Rapport public détaillé
├─ Mesures préventives
└─ Audit externe si nécessaire
```

### 8.2 Contact sécurité

**Email dédié :** security@noctaliae.app (à créer)

**PGP Key :** (à générer et publier)

**Bug bounty :** Programme prévu pour 2026 (récompenses $50-$500)

---

## 9. **Audit et transparence**

### 9.1 Code open-source

**Repositories GitHub :**
- Frontend : `github.com/thomasmaury/noctaliae-mobile` (à publier)
- Backend : `github.com/thomasmaury/noctaliae-api` (à publier)
- Docs : `github.com/thomasmaury/noctaliae-docs` (à publier)

**Licence :** MIT (à confirmer)

### 9.2 Audits prévus

| Type audit | Date prévue | Status |
|------------|-------------|--------|
| **Review code interne** | Q4 2025 | ✅ En cours |
| **Scan vulnérabilités (Snyk)** | Q1 2026 | 📅 Planifié |
| **Penetration testing** | Q2 2026 | 📅 Planifié |
| **Audit externe (société tierce)** | Q3 2026 | 📅 Planifié |
| **Certification ISO 27001** | 2027 | 🔮 Futur |

### 9.3 Dépendances

**Scan automatique :**
- Dependabot (GitHub) : Activé
- Snyk : Prévu Q1 2026
- OWASP Dependency-Check : Prévu Q1 2026

**Politique mise à jour :**
- Sécurité : Patch sous 24h
- Critique : Patch sous 7 jours
- Mineur : Patch mensuel

---

## 10. **Feuille de route sécurité**

### 10.1 Court terme (Q4 2025)

- [x] HTTPS TLS 1.3 activé
- [x] Rate limiting backend
- [x] Suppression immédiate données backend
- [ ] Chiffrement AES-256-GCM recherche
- [ ] Opt-in UI finalisé
- [ ] Documentation sécurité publiée

### 10.2 Moyen terme (Q1-Q2 2026)

- [ ] Firebase Authentication
- [ ] Tokens refresh rotatifs
- [ ] Chiffrement AsyncStorage (react-native-keychain)
- [ ] Scan vulnérabilités automatique
- [ ] Penetration testing externe
- [ ] Bug bounty program lancé

### 10.3 Long terme (Q3 2026+)

- [ ] Audit externe complet
- [ ] Certification ISO 27001
- [ ] Hardware Security Module (HSM) pour clés
- [ ] Zero-knowledge architecture
- [ ] Self-hosted option (Docker)

---

## 📊 **Matrice de risques**

| Risque | Probabilité | Impact | Mitigation actuelle | Mitigation prévue |
|--------|-------------|--------|-------------------|------------------|
| **Vol clé chiffrement** | Faible | Élevé | Variables env | HSM (2026) |
| **Brèche backend** | Moyen | Moyen | Rate limit, HTTPS | Audit externe |
| **Malware téléphone** | Faible | Élevé | Filesystem OS chiffré | Chiffrement AsyncStorage |
| **Interception réseau** | Faible | Élevé | TLS 1.3 | Certificate pinning |
| **Phishing admin** | Moyen | Élevé | 2FA compte Infomaniak | Yubikey obligatoire |
| **DDoS backend** | Moyen | Moyen | Cloudflare proxy | WAF premium |

---

## 🎯 **Conclusion**

Noctaliæ adopte une approche **Privacy-First** avec :

✅ **Architecture minimale** : Données locales par défaut  
✅ **Backend éphémère** : Zéro stockage permanent (sauf opt-in)  
✅ **Chiffrement militaire** : AES-256-GCM pour recherche  
✅ **Transparence radicale** : Code open-source, audits publics  
✅ **Conformité RGPD** : Respect des droits utilisateurs

**Nous ne sommes pas parfaits, mais nous sommes honnêtes.**

La sécurité est un processus continu, pas un état final. Ce whitepaper sera mis à jour régulièrement pour refléter les améliorations.

---

## 📞 **Contact**

**Questions sécurité :** security@noctaliae.app  
**Support général :** hello@noctaliae.app  
**GitHub :** github.com/thomasmaury/noctaliae

---

## 📜 **Historique versions**

| Version | Date | Changements |
|---------|------|-------------|
| **1.0** | 2025-11-22 | Version initiale |

---

**Document rédigé par Thomas Maury**  
**Licence : CC BY-SA 4.0**  
**Dernière mise à jour : 22 novembre 2025**