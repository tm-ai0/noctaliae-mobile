# 🚀 GUIDE DE DÉPLOIEMENT - Rate Limiting

## 📋 Résumé du Problème
**Erreur 429 "Too Many Requests"** lors des tests successifs de l'endpoint `/synthesize`

## ✅ Solutions Implémentées

### 1️⃣ Rate Limiting Côté Backend
**Fichier** : `index_WITH_RATE_LIMIT.js`

**Fonctionnalités** :
- ⏱️ Limite de **10 requêtes par minute par IP**
- 🧹 Nettoyage automatique des données expirées
- ⏳ Délai minimum de **300ms entre requêtes Google Cloud**
- 📊 Messages d'erreur détaillés avec temps de réinitialisation

**Implémentation** :
```javascript
const rateLimiter = (maxRequests = 10, windowMs = 60000) => {
  // Middleware qui compte les requêtes par IP
  // Reset automatique après la fenêtre de temps
}

// Appliqué à l'endpoint /synthesize
app.post("/synthesize", rateLimiter(10, 60000), async (req, res) => {
  // + délai de 300ms avant appel Google Cloud
  await new Promise(resolve => setTimeout(resolve, 300));
  // ...
});
```

### 2️⃣ Script de Test avec Délais
**Fichier** : `TEST_SYNTHESIZE_SAFE.ps1`

**Fonctionnalités** :
- ⏳ Délai de **5 secondes entre chaque test**
- 🧪 4 tests complets :
  1. Voix par défaut (français)
  2. Anglais avec détection automatique
  3. Voix spécifique (québécois)
  4. Espagnol
- ✅ Affichage détaillé des résultats

## 🔄 Étapes de Déploiement

### Étape 1 : Déployer le Nouveau Backend sur Replit
```bash
# 1. Ouvrir Replit : https://replit.com
# 2. Sélectionner votre projet "noctaliae-mobile"
# 3. Remplacer le contenu de index.js par index_WITH_RATE_LIMIT.js
# 4. Cliquer sur "Run" pour redémarrer
```

**Vérification** :
```bash
# Dans la console Replit, vous devriez voir :
🌙 Noctaliæ actif sur le port 5000
⏱️ Rate Limiting: 10 req/min activé
🔊 Endpoint /synthesize activé (Google Cloud TTS avec Rate Limiting)
```

### Étape 2 : Tester avec le Script PowerShell
```powershell
# Dans PowerShell (Windows)
cd "E:\Dream app\App\noctaliae-mobile"
.\TEST_SYNTHESIZE_SAFE.ps1
```

**Résultat Attendu** :
```
🧪 Test 1/4 : Voix par défaut (français)
✅ SUCCÈS - Voix : fr-FR-Wavenet-A
⏳ Attente 5 secondes...

🧪 Test 2/4 : Anglais avec détection automatique
✅ SUCCÈS - Voix : en-US-Wavenet-F
⏳ Attente 5 secondes...

[etc...]
```

### Étape 3 : Vérifier les Quotas Google Cloud (Optionnel)
```bash
# Accéder à Google Cloud Console
# https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas

# Quotas par défaut :
# - 100 requêtes par 100 secondes
# - 1 million de caractères par mois (GRATUIT)
```

## 📊 Monitoring

### Logs Backend (Replit Console)
```bash
🔊 Demande de synthèse vocale Google Cloud TTS reçue
🎤 Voix personnalisée : fr-FR-Wavenet-A
🔊 Synthèse de 89 caractères avec voix "fr-FR-Wavenet-A"
✅ Audio généré: 24576 caractères base64
```

### Message d'Erreur 429 (Si Limite Atteinte)
```json
{
  "error": "Trop de requêtes",
  "message": "Limite de 10 requêtes par minute atteinte",
  "retryAfter": 45,
  "resetIn": "45 secondes"
}
```

## 🔧 Paramètres Configurables

### Backend (index_WITH_RATE_LIMIT.js)
```javascript
// Ligne 42-43 : Modifier le rate limit
app.post("/synthesize", rateLimiter(10, 60000), async (req, res) => {
  // 10 = max requêtes
  // 60000 = fenêtre en ms (60 secondes)

// Ligne 184 : Modifier le délai inter-requêtes
await new Promise(resolve => setTimeout(resolve, 300));
  // 300ms = délai minimum
```

### Script de Test (TEST_SYNTHESIZE_SAFE.ps1)
```powershell
# Modifier le délai entre tests (ligne 21, 40, 59, 78)
Start-Sleep -Seconds 5  # Changer ici
```

## 🎯 Prochaines Étapes

### ✅ FAIT
- [x] Rate limiting backend
- [x] Script de test avec délais
- [x] Guide de déploiement

### 🔜 À FAIRE
1. **Créer endpoint `/voice-chat`** :
   - Transcription (Groq Whisper)
   - Analyse (Claude/Llama)
   - Synthèse vocale (Google TTS)
   - Tout-en-un pour l'interface mobile

2. **Développer VoiceAssistantScreen.js** :
   - Interface "Hold to Talk"
   - Visualisation audio
   - Lecture automatique de la réponse

3. **Tester en conditions réelles** :
   - Test sur appareil mobile
   - Performance réseau
   - Gestion des erreurs

## 🐛 Troubleshooting

### Problème : Erreur 429 persiste
**Solution 1** : Augmenter le délai dans le script de test
```powershell
Start-Sleep -Seconds 10  # Au lieu de 5
```

**Solution 2** : Réduire le nombre de tests consécutifs
```powershell
# Commenter certains tests
# $test3 = ...
```

**Solution 3** : Vérifier les quotas Google Cloud
- Connexion : https://console.cloud.google.com
- Navigation : APIs & Services > Text-to-Speech API > Quotas
- Vérifier : "Requests per 100 seconds" (devrait être 100)

### Problème : Backend ne démarre pas
**Vérification** :
```bash
# Dans la console Replit
echo $GOOGLE_CLOUD_API_KEY  # Doit afficher la clé
echo $ANTHROPIC_API_KEY     # Doit afficher la clé
echo $GROQ_API_KEY          # Doit afficher la clé
```

**Solution** : Reconfigurer les secrets dans Replit
- Cliquer sur "Secrets" (🔒)
- Vérifier les 3 clés API

### Problème : Audio non généré
**Vérification** :
```powershell
# Tester l'endpoint /health
Invoke-RestMethod -Uri "https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev/health"
```

**Résultat attendu** :
```json
{
  "status": "ok",
  "service": "🌙 Noctaliæ",
  "version": "1.1-rate-limited",
  "ready": true
}
```

## 💡 Conseils

1. **Tests en Développement** : Utiliser le script avec délais
2. **Production** : Le rate limiter backend gérera automatiquement
3. **Monitoring** : Surveiller les logs Replit pour les erreurs 429
4. **Optimisation** : Cacher les audios fréquents côté client

## 📞 Support

En cas de problème, vérifier :
1. ✅ Les 3 secrets Replit sont configurés
2. ✅ Le backend affiche "Rate Limiting activé" au démarrage
3. ✅ Les délais dans le script de test sont ≥ 5 secondes
4. ✅ L'URL Replit est correcte et accessible

---
**Version** : 1.1 - Rate Limited  
**Date** : 2025-11-04  
**Auteur** : Noctaliæ Development Team
