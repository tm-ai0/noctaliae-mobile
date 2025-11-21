# 🚨 FIX ERREUR 400 - Guide de Résolution

## 🎯 Cause Probable
L'erreur 400 "Bad Request" sur **TOUS** les tests indique probablement que :
1. ❌ Le nouveau backend n'a PAS été déployé sur Replit
2. ❌ L'ancienne version est toujours active
3. ❌ L'endpoint `/synthesize` attend un format différent

---

## ⚡ SOLUTION RAPIDE (2 minutes)

### ✅ ÉTAPE 1 : Vérifier Quelle Version Tourne
```powershell
# Lancer le script de diagnostic
cd "E:\Dream app\App\noctaliae-mobile"
.\DIAGNOSE_ERROR.ps1
```

**Regarder le Test 1 (Health Check)** :
- Si `version: "1.1-rate-limited"` → ✅ Nouvelle version
- Si `version: "1.0"` ou autre → ❌ Ancienne version

---

### ✅ ÉTAPE 2A : Si Ancienne Version Active

**CAUSE** : Le fichier `index.js` sur Replit n'a pas été remplacé

**SOLUTION** :
```
1. Ouvrir Replit : https://replit.com
2. Sélectionner projet "noctaliae-mobile"
3. Ouvrir index.js dans l'éditeur
4. Vérifier la PREMIÈRE ligne :
   - Si elle contient "Version avec Rate Limiting" → ✅ OK
   - Sinon → ❌ Copier-coller index_WITH_RATE_LIMIT.js

5. IMPORTANT : Sauvegarder (Ctrl+S)
6. IMPORTANT : Redémarrer avec le bouton "Stop" puis "Run"
7. Attendre 10 secondes que le serveur démarre
8. Vérifier les logs :
   ✅ "⏱️ Rate Limiting: 10 req/min activé"
```

---

### ✅ ÉTAPE 2B : Si Nouvelle Version Mais Erreur Persiste

**CAUSE** : Problème de validation côté backend

**SOLUTION** : Vérifier les logs Replit

```
Dans la console Replit, chercher :
- ❌ "Le texte est requis"
- ❌ "Paramètre text manquant"
- ❌ Erreurs Google Cloud API

Si vous voyez ces erreurs, copier-coller ici pour diagnostic
```

---

## 🔍 DIAGNOSTIC COMPLET

### Option 1 : Script Automatique
```powershell
cd "E:\Dream app\App\noctaliae-mobile"
.\DIAGNOSE_ERROR.ps1
```

Ce script va tester :
1. ✅ Backend accessible ?
2. ✅ Quelle version ?
3. ✅ Format de requête accepté ?
4. ✅ Rate limiting actif ?
5. ✅ Message d'erreur exact

### Option 2 : Test Manuel avec cURL

#### Test 1 : Health Check
```bash
curl https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev/health
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

#### Test 2 : Synthèse Vocale
```bash
curl -X POST https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Test"}'
```

**Si erreur 400** :
```json
{
  "error": "Le texte est requis",
  "details": "Paramètre text manquant"
}
```
→ Le backend a un problème de parsing

---

## 🛠️ SOLUTIONS SELON LE PROBLÈME

### Problème 1 : Version 1.0 Détectée
```
✅ SOLUTION : Déployer index_WITH_RATE_LIMIT.js
   1. Copier le contenu de :
      E:\Dream app\App\noctaliae-mobile\index_WITH_RATE_LIMIT.js
   2. Remplacer TOUT le contenu de index.js sur Replit
   3. Sauvegarder + Redémarrer
   4. Vérifier version dans /health
```

### Problème 2 : Backend Ne Démarre Pas
```
✅ SOLUTION : Vérifier les Secrets
   1. Dans Replit, cliquer sur "Secrets" (🔒)
   2. Vérifier que ces 3 clés existent :
      - ANTHROPIC_API_KEY
      - GROQ_API_KEY
      - GOOGLE_CLOUD_API_KEY
   3. Si manquantes, les ajouter
   4. Redémarrer Replit
```

### Problème 3 : Erreur "text is required"
```
✅ SOLUTION : Le backend attend un format différent
   
   Vérifier dans les logs Replit :
   - Quel format il attend ?
   - Y a-t-il un message d'erreur détaillé ?
   
   Puis adapter le script PowerShell
```

### Problème 4 : Erreur Google Cloud API
```
✅ SOLUTION : Problème avec la clé API
   
   1. Vérifier GOOGLE_CLOUD_API_KEY dans Replit Secrets
   2. Tester la clé manuellement :
      curl "https://texttospeech.googleapis.com/v1/voices?key=VOTRE_CLE"
   3. Si invalide, regénérer une nouvelle clé :
      https://console.cloud.google.com/apis/credentials
```

---

## 📊 CHECKLIST DE VÉRIFICATION

Cocher au fur et à mesure :

- [ ] **Backend accessible** (`/health` retourne 200)
- [ ] **Version correcte** (`version: "1.1-rate-limited"`)
- [ ] **Rate limiting actif** (logs affichent "Rate Limiting activé")
- [ ] **Endpoint /synthesize existe** (pas d'erreur 404)
- [ ] **Format de requête OK** (erreur détaillée si 400)
- [ ] **Clés API configurées** (les 3 secrets dans Replit)

---

## 🎯 ACTIONS IMMÉDIATES

### Action 1 : Lancer le Diagnostic
```powershell
cd "E:\Dream app\App\noctaliae-mobile"
.\DIAGNOSE_ERROR.ps1
```

### Action 2 : Envoyer le Résultat
Copier-coller ici :
- Le résultat du Test 1 (Health Check)
- Le message d'erreur du Test 3
- Les logs de la console Replit

### Action 3 : Vérifier Manuellement sur Replit
```
1. Ouvrir https://replit.com
2. Ouvrir le projet "noctaliae-mobile"
3. Regarder la CONSOLE (en bas)
4. Vérifier s'il y a des erreurs en rouge
5. Copier-coller les erreurs ici
```

---

## 💡 RAPPEL IMPORTANT

**L'erreur 400 n'est PAS un problème de rate limiting.**

C'est un problème de :
- ❌ Format de requête
- ❌ Validation des données
- ❌ Mauvaise version du backend

**Une fois la bonne version déployée, l'erreur 400 devrait disparaître.**

---

## 🆘 SI RIEN NE FONCTIONNE

Copier-coller ici :
1. Le résultat complet de `DIAGNOSE_ERROR.ps1`
2. Les logs de la console Replit
3. Le contenu de la première ligne de `index.js` sur Replit

Je vous aiderai à identifier le problème exact.

---

**Prochaine étape** : Lancer `.\DIAGNOSE_ERROR.ps1` et partager les résultats ici 🔍
