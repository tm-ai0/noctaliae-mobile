# 🌙 Noctaliæ - Session Migration Infomaniak

## ✅ Ce qui a été fait (4 novembre 2025)

### Nettoyage Replit
- ✅ Clés API Groq **supprimées**
- ✅ Clés API Anthropic **supprimées**
- ✅ Clés API Google Cloud **supprimées**
- ✅ Fichier `.env` supprimé de Replit

**Raison** : Replit a exposé les clés dans les logs → Sécurité compromise

---

## 🎯 Plan pour Demain (5 novembre 2025)

### Phase 1 : Créer de nouvelles clés API (10 min)

#### 1️⃣ Anthropic Claude
- URL : https://console.anthropic.com/settings/keys
- Créer une nouvelle clé
- Format : `sk-ant-api03-xxxxxxxxxxxxx`
- Copier dans un fichier texte temporaire

#### 2️⃣ Groq (Whisper + Llama)
- URL : https://console.groq.com/keys
- Créer une nouvelle clé
- Format : `gsk_xxxxxxxxxxxxx`
- Copier dans un fichier texte temporaire

#### 3️⃣ Google Cloud (Text-to-Speech)
- URL : https://console.cloud.google.com/apis/credentials
- Créer une nouvelle clé API
- Format : `AIzaSyxxxxxxxxxxxxx` (39 caractères)
- Activer l'API "Cloud Text-to-Speech API"
- Copier dans un fichier texte temporaire

---

### Phase 2 : Accès Infomaniak (5 min)

#### Connexion au Manager
1. Aller sur : https://manager.infomaniak.com
2. Se connecter
3. Menu : **"Hébergement Web"**
4. Identifier le type d'hébergement (Web Hosting / Cloud Server / VPS)

#### Informations à noter
- Nom du domaine : `thomasmaury.fr`
- Type d'hébergement : ?
- Support Node.js : À vérifier
- Accès SSH : À vérifier
- Panel de gestion : cPanel / Plesk / Custom ?

---

### Phase 3 : Déploiement Backend sur Infomaniak (30 min)

#### Fichiers à déployer
- `index.js` : Code backend corrigé et sécurisé
- `package.json` : Dépendances Node.js
- `.env` : Variables d'environnement (SÉCURISÉ, jamais sur Git)
- `.gitignore` : Protection du fichier `.env`

#### Configuration
- Port : 3000 ou 5000 (selon Infomaniak)
- URL finale : `https://api.thomasmaury.fr` ou sous-domaine
- SSL : Automatique avec Infomaniak

#### Variables d'environnement (.env)
```env
ANTHROPIC_API_KEY=nouvelle_clé_anthropic
GROQ_API_KEY=nouvelle_clé_groq
GOOGLE_CLOUD_API_KEY=nouvelle_clé_google
PORT=5000
NODE_ENV=production
```

---

### Phase 4 : Tests Backend (15 min)

#### Endpoints à tester
1. `GET /health` → Health check
2. `POST /transcribe` → Groq Whisper (audio → texte)
3. `POST /analyze-dream` → Claude Sonnet (analyse premium)
4. `POST /analyze-dream-free` → Llama 3.3 (analyse gratuite)
5. `POST /synthesize` → Google TTS (texte → audio)
6. `POST /chat-text` → Conversation textuelle

#### Scripts PowerShell de test
- `TEST_HEALTH.ps1`
- `TEST_TRANSCRIBE.ps1`
- `TEST_ANALYZE.ps1`
- `TEST_SYNTHESIZE.ps1`

---

### Phase 5 : Connexion App Mobile (10 min)

#### Fichier à modifier
`E:\Dream app\App\noctaliae-mobile\src\config\api.js`

```javascript
// Ancienne URL Replit (à supprimer)
// const BASE_URL = 'https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev';

// Nouvelle URL Infomaniak
const BASE_URL = 'https://api.thomasmaury.fr'; // ou ton URL finale

export default {
  BASE_URL,
  endpoints: {
    health: '/health',
    transcribe: '/transcribe',
    analyzeDream: '/analyze-dream',
    analyzeDreamFree: '/analyze-dream-free',
    chatText: '/chat-text',
    synthesize: '/synthesize'
  }
};
```

---

## 🔐 Sécurité Infomaniak vs Replit

| Critère | Replit ❌ | Infomaniak ✅ |
|---------|-----------|--------------|
| **Clés API dans logs** | Exposées | Jamais affichées |
| **Fichier .env** | Bugué | Standard sécurisé |
| **Secrets** | Limite Starter | Illimité |
| **Hébergement** | US (limites) | Suisse (RGPD++) |
| **Stabilité** | Veille auto | 24/7 stable |
| **Coût** | $10/mois | Déjà payé (0€) |

---

## 📦 Fichiers Backend à Préparer

### Structure du projet
```
noctaliae-backend/
├── index.js              # Code serveur Node.js + Express
├── package.json          # Dépendances
├── .env                  # Variables d'environnement (LOCAL UNIQUEMENT)
├── .gitignore            # Protège .env
└── README.md             # Documentation
```

### .gitignore (CRITIQUE)
```
# Ne JAMAIS commit ces fichiers
.env
.env.local
.env.production
node_modules/
*.log
```

---

## 🎯 Objectifs de la Session Demain

1. ✅ Créer 3 nouvelles clés API sécurisées
2. ✅ Accéder au Manager Infomaniak
3. ✅ Déployer le backend sur Infomaniak
4. ✅ Configurer les variables d'environnement
5. ✅ Tester tous les endpoints
6. ✅ Connecter l'app mobile
7. ✅ Vérifier le flux complet : enregistrement → transcription → analyse

---

## 💡 Avantages de la Migration

### Pour toi (Graphiste)
- 🔐 Sécurité maximale (clés jamais exposées)
- 🇨🇭 Hébergement suisse (RGPD++)
- 💰 Déjà payé jusqu'en octobre 2026
- ⚡ Pas de mise en veille (contrairement à Replit)
- 🎯 URL propre (api.thomasmaury.fr)

### Pour Noctaliæ
- 🚀 Backend stable 24/7
- 📊 Logs propres et clairs
- 🔧 Contrôle total sur l'infrastructure
- 🌍 Meilleure latence pour les utilisateurs européens

---

## 📞 Questions à Poser Demain

1. Quel type d'hébergement Infomaniak as-tu exactement ?
2. As-tu accès SSH ou uniquement FTP ?
3. Y a-t-il un panel de gestion (cPanel, Plesk) ?
4. Peux-tu créer des sous-domaines (api.thomasmaury.fr) ?

---

## 🛠️ Outils Nécessaires

- [ ] Accès Manager Infomaniak
- [ ] Client FTP (FileZilla) ou accès SSH
- [ ] Éditeur de texte (VSCode, Notepad++)
- [ ] PowerShell (tests API)
- [ ] Navigateur (créer les clés API)

---

## ⚠️ Notes Importantes

- Les clés API ne doivent JAMAIS être dans le code source
- Le fichier `.env` ne doit JAMAIS être commit sur Git
- Toujours tester les endpoints un par un
- Garder une copie locale des clés API (fichier texte chiffré)

---

## 🌙 Prêt pour Demain !

On démarre frais avec une infrastructure propre et sécurisée. Infomaniak est l'hébergement parfait pour Noctaliæ.

**Replit = fini ✅**  
**Infomaniak = on arrive ! 🚀**
