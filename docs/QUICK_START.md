# ⚡ QUICK START - Résolution Erreur 429

## 🎯 Objectif
Résoudre l'erreur 429 "Too Many Requests" sur l'endpoint `/synthesize`

## ⏱️ Temps Estimé
5 minutes

---

## 📝 CHECKLIST RAPIDE

### ✅ ÉTAPE 1 : Déployer le Nouveau Backend (2 min)
```
1. ✅ Ouvrir Replit → https://replit.com
2. ✅ Sélectionner projet "noctaliae-mobile"
3. ✅ Ouvrir index.js
4. ✅ Remplacer TOUT le contenu par celui de :
   E:\Dream app\App\noctaliae-mobile\index_WITH_RATE_LIMIT.js
5. ✅ Sauvegarder (Ctrl+S)
6. ✅ Cliquer "Run" (ou Ctrl+Enter)
7. ✅ Attendre que la console affiche :
   "⏱️ Rate Limiting: 10 req/min activé"
```

### ✅ ÉTAPE 2 : Tester (3 min)
```powershell
# Ouvrir PowerShell
cd "E:\Dream app\App\noctaliae-mobile"
.\TEST_SYNTHESIZE_SAFE.ps1
```

**Résultat Attendu** :
```
✅ Test 1/4 : SUCCÈS - Voix : fr-FR-Wavenet-A
⏳ Attente 5 secondes...
✅ Test 2/4 : SUCCÈS - Voix : en-US-Wavenet-F
⏳ Attente 5 secondes...
✅ Test 3/4 : SUCCÈS - Voix : fr-CA-Wavenet-A
⏳ Attente 5 secondes...
✅ Test 4/4 : SUCCÈS - Voix : es-ES-Wavenet-A
```

### ✅ ÉTAPE 3 : Valider
- [ ] Les 4 tests ont réussi ✅
- [ ] Aucune erreur 429 ❌
- [ ] La console Replit affiche "Rate Limiting activé" ⏱️

---

## 🚨 SI ERREUR 429 PERSISTE

### Solution 1 : Augmenter les Délais
Modifier `TEST_SYNTHESIZE_SAFE.ps1` :
```powershell
# Remplacer toutes les lignes :
Start-Sleep -Seconds 5

# Par :
Start-Sleep -Seconds 10
```

### Solution 2 : Attendre et Relancer
```powershell
# Attendre 60 secondes
Start-Sleep -Seconds 60

# Relancer
.\TEST_SYNTHESIZE_SAFE.ps1
```

### Solution 3 : Vérifier Quotas Google Cloud
```
1. Aller sur : https://console.cloud.google.com
2. APIs & Services → Text-to-Speech API → Quotas
3. Vérifier : "Requests per 100 seconds" = 100 (max)
```

---

## 📚 DOCUMENTATION COMPLÈTE

Pour plus de détails, consulter :
- `DEPLOYMENT_GUIDE.md` : Guide complet étape par étape
- `COMPARISON_TABLE.md` : Tableau comparatif des versions
- `index_WITH_RATE_LIMIT.js` : Code backend avec rate limiting

---

## 🎯 PROCHAINE ÉTAPE

Une fois les tests validés :
### Créer l'endpoint `/voice-chat` (tout-en-un)
**Fonctionnalités** :
- Transcription vocale → texte (Groq Whisper)
- Analyse du rêve (Claude/Llama)
- Synthèse vocale → audio (Google TTS)
- **API unique pour l'interface mobile**

**Commande pour démarrer** :
```
"Crée l'endpoint /voice-chat qui combine transcription + analyse + TTS"
```

---

## 💡 RAPPEL IMPORTANT

**Version Backend Actuelle** : 1.1-rate-limited
**Rate Limit** : 10 requêtes/minute par IP
**Délai Google Cloud** : 300ms entre requêtes
**Coût** : 0€ (tier gratuit)

---

## ✅ VALIDATION FINALE

**Critères de Succès** :
- [x] Backend déployé avec rate limiting
- [x] Script de test créé avec délais
- [ ] **4 tests réussis sans erreur 429** 👈 OBJECTIF
- [ ] Logs Replit confirment "Rate Limiting activé"
- [ ] Prêt pour créer `/voice-chat`

---

**Date de Création** : 2025-11-04  
**Durée Totale** : ~5 minutes  
**Complexité** : ⭐⭐☆☆☆ (Facile)
