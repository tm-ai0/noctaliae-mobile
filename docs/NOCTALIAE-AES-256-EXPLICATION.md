# 🔐 Chiffrement AES-256 dans Noctaliæ
## Guide pour comprendre la sécurité de tes données

---

## 🎯 **TL;DR - L'essentiel en 3 phrases**

1. **AES-256 = Coffre-fort militaire** : Les rêves stockés pour la recherche sont chiffrés avec l'algorithme le plus sûr au monde
2. **Impossible à casser** : Même avec tous les ordinateurs de la planète pendant des milliards d'années
3. **Standard mondial** : Utilisé par la NSA, les banques, et toutes les apps sérieuses (Signal, WhatsApp, etc.)

---

## 📖 **Sommaire**

1. C'est quoi le chiffrement ?
2. Pourquoi AES-256 spécifiquement ?
3. Comment ça marche (sans maths) ?
4. Dans Noctaliæ concrètement
5. Peut-on le casser ?
6. Les limites (honnêteté radicale)

---

## 1️⃣ **C'est quoi le chiffrement ?**

### Analogie simple : Le coffre-fort

Imagine que tu écris une lettre d'amour sur papier :

```
┌─────────────────────────┐
│ "Je t'aime infiniment"  │  ← Message en clair
└─────────────────────────┘
```

**Sans chiffrement :**
- N'importe qui peut la lire
- Si elle est interceptée, tout est exposé
- C'est comme envoyer une carte postale : visible par tous

**Avec chiffrement AES-256 :**
```
┌─────────────────────────┐
│ "Je t'aime infiniment"  │  → Texte original
└─────────────────────────┘
           ↓
    [Chiffrement AES-256]
           ↓
┌─────────────────────────┐
│ "X9$mK#2pL@8nQwE3..."   │  ← Message chiffré
└─────────────────────────┘
```

Maintenant, même si quelqu'un intercepte le message, il voit juste du charabia incompréhensible.

### La clé = La seule façon d'ouvrir le coffre

```
Message chiffré + Clé secrète = Message original

"X9$mK#2pL..." + [Clé 256 bits] → "Je t'aime infiniment"
```

**Sans la clé, impossible de déchiffrer.**

---

## 2️⃣ **Pourquoi AES-256 spécifiquement ?**

### Comparaison avec d'autres algorithmes

| Algorithme | Niveau sécurité | Utilisé par | Status |
|-----------|----------------|-------------|---------|
| **ROT13** | 💀 Nul | Blagues geeks | Cassable en 1 seconde |
| **DES** | ⚠️ Faible | Années 1970 | Cassé en 1999 |
| **AES-128** | ✅ Bon | Apps standard | Sécurisé mais moins que 256 |
| **AES-256** | 🏆 Maximum | NSA, banques, militaires | **Standard or** |
| **Quantique résistant** | 🔮 Futur | Recherche | Pas encore nécessaire |

### Pourquoi 256 ?

**256 = nombre de bits de la clé**

- 1 bit = 2 possibilités (0 ou 1)
- 256 bits = 2^256 possibilités
- **2^256 = 115 792 089 237 316 195 423 570 985 008 687 907 853 269 984 665 640 564 039 457 584 007 913 129 639 936**

**C'est combien exactement ?**

Imagine que chaque atome de l'univers est un ordinateur qui teste 1 milliard de clés par seconde :
- **Il faudrait des milliards d'années pour tester toutes les combinaisons.**

### Certifications officielles

✅ **FIPS 140-2** (US Government)  
✅ **ISO/IEC 18033-3** (Standard international)  
✅ **NSA approuvé pour TOP SECRET** (niveau maximum)

---

## 3️⃣ **Comment ça marche (sans maths) ?**

### Vue d'ensemble simplifiée

```
┌──────────────────────────────────────────────────┐
│  CHIFFREMENT                                      │
├──────────────────────────────────────────────────┤
│                                                   │
│  Message original : "Mon rêve : j'ai volé..."    │
│         +                                         │
│  Clé secrète : [32 bytes aléatoires]             │
│         +                                         │
│  IV (vecteur init) : [16 bytes aléatoires]       │
│         ↓                                         │
│  [Algorithme AES-256]                            │
│         ↓                                         │
│  Message chiffré : "A8x3K9mP2..."                │
│                                                   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  DÉCHIFFREMENT                                    │
├──────────────────────────────────────────────────┤
│                                                   │
│  Message chiffré : "A8x3K9mP2..."                │
│         +                                         │
│  Clé secrète : [32 bytes aléatoires]             │
│         +                                         │
│  IV : [16 bytes aléatoires]                      │
│         ↓                                         │
│  [Algorithme AES-256 inversé]                    │
│         ↓                                         │
│  Message original : "Mon rêve : j'ai volé..."    │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Les 3 ingrédients magiques

#### 1. **Le message** (ce qu'on veut protéger)
Ton rêve transcrit : "J'étais au Mexique avec Martha..."

#### 2. **La clé secrète** (32 bytes = 256 bits)
```javascript
// Exemple de clé (en hexadécimal)
const key = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
//            ↑
//            32 bytes = 64 caractères hexadécimaux
```

**CRITIQUE :** Cette clé doit être :
- ✅ Générée aléatoirement (pas "password123")
- ✅ Stockée en sécurité (pas dans le code source)
- ✅ Unique par application

#### 3. **L'IV - Initialization Vector** (16 bytes)
```javascript
// Généré aléatoirement à CHAQUE chiffrement
const iv = crypto.randomBytes(16);
```

**Pourquoi un IV ?**

Imagine que tu chiffres deux fois le même message avec la même clé :

**Sans IV :**
```
Chiffrer("Je t'aime", clé) → "X9K2P8"
Chiffrer("Je t'aime", clé) → "X9K2P8"  ← Pareil !
```

Un attaquant pourrait voir : "Tiens, le même message revient souvent, c'est suspect..."

**Avec IV (différent à chaque fois) :**
```
Chiffrer("Je t'aime", clé, IV1) → "X9K2P8"
Chiffrer("Je t'aime", clé, IV2) → "B3M7Q1"  ← Différent !
```

Maintenant, impossible de savoir que c'est le même message. **L'IV est public** (pas secret), mais rend chaque chiffrement unique.

---

## 4️⃣ **Dans Noctaliæ concrètement**

### Architecture de sécurité

```
┌─────────────────────────────────────────────────┐
│  TON TÉLÉPHONE (Local)                           │
├─────────────────────────────────────────────────┤
│                                                  │
│  [Rêve enregistré]                              │
│       ↓                                          │
│  AsyncStorage (stockage local)                  │
│       ↓                                          │
│  ⚠️ EN CLAIR (mais hors ligne = OK)            │
│                                                  │
└─────────────────────────────────────────────────┘
                    ↓
         (Si tu demandes analyse)
                    ↓
┌─────────────────────────────────────────────────┐
│  TRANSIT INTERNET                                │
├─────────────────────────────────────────────────┤
│                                                  │
│  HTTPS (TLS 1.3) = Chiffrement automatique      │
│  Personne ne peut intercepter                   │
│                                                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  SERVEUR BACKEND (api.thomasmaury.fr)           │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. Reçoit le rêve (en clair via HTTPS)         │
│  2. Envoie à Groq/Anthropic pour analyse        │
│  3. Reçoit l'analyse                            │
│  4. Renvoie à ton app                           │
│  5. ⚠️ SUPPRIME TOUT immédiatement             │
│                                                  │
└─────────────────────────────────────────────────┘
                    ↓
         (Si opt-in recherche activé)
                    ↓
┌─────────────────────────────────────────────────┐
│  BASE RECHERCHE (Firebase Storage)              │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. Anonymisation (retire nom, etc.)            │
│  2. Chiffrement AES-256                         │
│  3. Stockage permanent                          │
│                                                  │
│  Format :                                        │
│  {                                               │
│    id: "uuid-random",                           │
│    encrypted: "X9K2P8...",                      │
│    iv: "A1B2C3...",                             │
│    timestamp: "2025-11-22"                      │
│  }                                               │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Code réel (simplifié)

```javascript
// Backend : Chiffrer un rêve pour la recherche
const crypto = require('crypto');

function encryptDreamForResearch(dreamData) {
  // 1. Anonymiser d'abord
  const anonymized = {
    content: dreamData.transcript,
    emotions: dreamData.emotions,
    themes: dreamData.analysis.themes,
    // ZÉRO donnée perso (pas de user_id, email, nom)
  };

  // 2. Préparer les ingrédients
  const algorithm = 'aes-256-gcm'; // GCM = mode authentifié
  const key = Buffer.from(process.env.RESEARCH_KEY, 'hex'); // 32 bytes
  const iv = crypto.randomBytes(16); // Aléatoire à chaque fois

  // 3. Créer le chiffreur
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  // 4. Chiffrer
  let encrypted = cipher.update(
    JSON.stringify(anonymized),
    'utf8',
    'hex'
  );
  encrypted += cipher.final('hex');

  // 5. Récupérer le tag d'authentification (GCM)
  const authTag = cipher.getAuthTag();

  // 6. Retourner le résultat
  return {
    encrypted: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}
```

**Explication ligne par ligne :**

```javascript
const algorithm = 'aes-256-gcm';
```
- `aes-256` = Algorithme avec clé de 256 bits
- `gcm` = Galois/Counter Mode = **mode authentifié**
  - Empêche les modifications malveillantes
  - Si quelqu'un change 1 bit du message chiffré, le déchiffrement échoue

```javascript
const key = Buffer.from(process.env.RESEARCH_KEY, 'hex');
```
- La clé est stockée dans une variable d'environnement (pas dans le code)
- Format hexadécimal pour faciliter le stockage
- 32 bytes = 64 caractères hexa

```javascript
const iv = crypto.randomBytes(16);
```
- Génère 16 bytes aléatoires (128 bits)
- **Différent à chaque chiffrement**
- Pas besoin de le garder secret

```javascript
const cipher = crypto.createCipheriv(algorithm, key, iv);
```
- Crée l'objet "chiffreur" avec :
  - Algorithme : AES-256-GCM
  - Clé secrète
  - IV aléatoire

```javascript
let encrypted = cipher.update(JSON.stringify(anonymized), 'utf8', 'hex');
encrypted += cipher.final('hex');
```
- `update()` = Commence le chiffrement
  - Input : JSON en UTF-8
  - Output : Hexadécimal
- `final()` = Termine le chiffrement
  - Ajoute le dernier bloc

```javascript
const authTag = cipher.getAuthTag();
```
- GCM génère un "tag" d'authentification
- Si les données sont modifiées, le tag ne correspondra plus
- Protection contre les attaques par modification

---

## 5️⃣ **Peut-on le casser ?**

### Tentatives de cassage

| Méthode d'attaque | Temps nécessaire | Verdict |
|------------------|------------------|----------|
| **Force brute** (tester toutes les clés) | 10^77 années | ❌ Impossible |
| **Attaque quantique** (Grover) | 10^38 années | ❌ Toujours impossible |
| **Exploitation de faille** (si mal implémenté) | Variable | ⚠️ Possible si erreur humaine |
| **Vol de la clé** (piratage serveur) | Instantané | ⚠️ Le vrai risque |

### Le vrai risque : La clé

**AES-256 est incassable. Mais la clé peut être volée.**

```
┌──────────────────────────────────────┐
│  Attaques réelles (par ordre de      │
│  probabilité décroissante)           │
├──────────────────────────────────────┤
│                                      │
│  1. Phishing de l'admin (toi)       │
│  2. Malware sur serveur backend     │
│  3. Clé stockée en clair dans code  │
│  4. Brèche base de données          │
│  5. Attaque side-channel (timing)   │
│  6. Casser AES-256 lui-même         │ ← Impossible
│                                      │
└──────────────────────────────────────┘
```

**Solution : Protéger la clé**

✅ **Jamais dans le code source** (GitHub public = game over)  
✅ **Variable d'environnement** (`.env` file)  
✅ **Secrets manager** (AWS Secrets Manager, HashiCorp Vault)  
✅ **Rotation périodique** (changer la clé tous les 6 mois)  
✅ **Accès limité** (seul le backend peut lire)

---

## 6️⃣ **Les limites (honnêteté radicale)**

### Ce que AES-256 NE fait PAS

❌ **Ne protège pas contre :**
- Keylogger sur ton ordinateur (voit ce que tu tapes)
- Screenshot malware (capture l'écran)
- Social engineering (quelqu'un te demande la clé gentiment)
- Backdoor gouvernementale (si NSA installe un trojan)

✅ **Protège contre :**
- Interception réseau
- Vol de disque dur
- Accès non-autorisé aux fichiers
- Analyse des données au repos

### Chaîne de confiance

```
Ton téléphone (Android/iOS)
      ↓
HTTPS (Let's Encrypt CA)
      ↓
Backend (Infomaniak)
      ↓
Groq/Anthropic API
      ↓
Retour backend
      ↓
Ton téléphone

⚠️ Chaque maillon doit être sûr
```

**Si un seul maillon casse, tout casse.**

### Métaphore finale

AES-256 = Porte blindée ultra-sécurisée

Mais si :
- Tu laisses la clé sous le paillasson → Inutile
- Tu ouvres à n'importe qui → Inutile
- Ta maison a une fenêtre ouverte → Inutile

**La sécurité est une chaîne, pas un maillon.**

---

## 🎯 **En pratique pour Noctaliæ**

### Ce qui est sécurisé

✅ **Données locales** : Sur ton téléphone (AsyncStorage)  
✅ **Transit** : HTTPS (TLS 1.3) vers backend  
✅ **Backend éphémère** : Analyse puis suppression immédiate  
✅ **Recherche** : Anonymisation + AES-256-GCM avant stockage

### Ce qui pourrait être amélioré

⚠️ **Chiffrer AsyncStorage** : Actuellement en clair sur téléphone  
⚠️ **Rotation clés** : Pas encore automatisée  
⚠️ **Audit externe** : Pas encore fait (coût $5-20K)

### Compromis pragmatique

**Pour une app en développement :**
- ✅ AES-256 pour données recherche = Excellent
- ✅ HTTPS partout = Standard
- ⚠️ AsyncStorage non-chiffré = Acceptable (iOS/Android chiffrent le filesystem)
- ⚠️ Pas d'audit = Normal pour un side project

**Pour une app avec 10 000+ users :**
- Ajouter chiffrement AsyncStorage (react-native-keychain)
- Audit de sécurité externe
- Penetration testing
- Bug bounty program

---

## 📚 **Pour aller plus loin**

### Ressources pédagogiques

📖 **"The Code Book" - Simon Singh** : Histoire du chiffrement  
🎥 **Computerphile (YouTube)** : "How AES Works" - excellent  
📄 **NIST FIPS 197** : Spécification officielle AES (technique)

### Outils pour tester

```bash
# Chiffrer un fichier avec OpenSSL (AES-256)
openssl enc -aes-256-cbc -salt -in secret.txt -out secret.enc

# Déchiffrer
openssl enc -d -aes-256-cbc -in secret.enc -out secret_decrypted.txt
```

---

## ✅ **Checklist sécurité**

Avant de publier Noctaliæ en production :

- [ ] Clés stockées en variables d'environnement (pas GitHub)
- [ ] HTTPS partout (Let's Encrypt)
- [ ] AES-256-GCM pour données recherche
- [ ] Anonymisation avant chiffrement
- [ ] Suppression backend immédiate
- [ ] Rate limiting activé
- [ ] Logs sécurisés (pas de données perso)
- [ ] Politique de confidentialité claire
- [ ] Opt-in recherche avec explication
- [ ] Tests de sécurité basiques

---

## 🌙 **Conclusion**

**AES-256 dans Noctaliæ = Standard or de la sécurité**

Tu peux dire en toute honnêteté :
> "Les rêves partagés pour la recherche sont chiffrés avec AES-256, le même niveau de sécurité que les banques et les militaires."

**Mais tu dois aussi dire :**
> "La sécurité dépend de toute la chaîne. On fait de notre mieux, mais aucun système n'est 100% infaillible."

**Transparence radicale = Confiance.**

---

**Document rédigé pour Thomas Maury - Noctaliæ**  
**Date : 22 novembre 2025**  
**Licence : CC BY-SA 4.0 (partage autorisé avec attribution)**