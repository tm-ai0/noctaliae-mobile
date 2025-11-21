# 🚀 GUIDE DE DÉPLOIEMENT RAPIDE - PROMPT SCIENTIFIQUE

**Temps estimé** : 10-15 minutes  
**Difficulté** : Facile (guidé étape par étape)

---

## ✅ PRÉREQUIS

Avant de commencer, assurez-vous d'avoir :
- [ ] Accès au Manager Infomaniak (manager.infomaniak.com)
- [ ] PowerShell ou Git Bash installé
- [ ] Python 3 installé

---

## 🎯 ÉTAPE 1 : CONFIGURATION (2 min)

### 1.1 Ouvrir le dossier de déploiement

```powershell
cd "E:\Dream app\App\noctaliae-mobile\docs\prompt-scientifique\deployment-tools"
```

### 1.2 Remplir les informations SSH

Ouvrez `config.env` et remplacez :

```bash
SSH_USER=VOTRE_USER_SSH
```

**Comment trouver ces infos ?**
1. Allez sur https://manager.infomaniak.com
2. Menu "Hébergement Web" → Votre site
3. Section "SSH/FTP" ou "Accès"
4. Notez votre nom d'utilisateur SSH

**Exemple** :
```bash
SSH_USER=thomasmaury  # ou u123456, etc.
```

---

## 🎯 ÉTAPE 2 : PRÉPARATION AUTOMATIQUE (1 min)

### 2.1 Lancer le script PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy.ps1
```

Ce script va automatiquement :
- ✅ Lire et valider la configuration
- ✅ Générer le nouveau prompt formaté
- ✅ Créer un fichier de commandes SSH
- ✅ Afficher les instructions détaillées

**Résultat** : 3 fichiers générés
- `formatted_prompt.py` (le nouveau prompt à déployer)
- `formatted_prompt.json` (métadonnées)
- `ssh_commands.sh` (commandes pour le serveur)

---

## 🎯 ÉTAPE 3 : CONNEXION SSH (1 min)

### Option A : Via Git Bash (Recommandé)

```bash
ssh -i ~/.ssh/id_rsa -p 22 VOTRE_USER@ssh.cluster029.hosting.ovh.net
```

### Option B : Via l'interface web Infomaniak

1. Manager Infomaniak → Hébergement Web
2. Cliquer sur "Terminal SSH" ou "Console"
3. Se connecter

---

## 🎯 ÉTAPE 4 : BACKUP DU BACKEND (1 min)

Une fois connecté en SSH, exécutez :

```bash
cd /srv/customer/sites/api.thomasmaury.fr
cp index.js index.js.backup_$(date +%Y%m%d_%H%M%S)
ls -lh index.js*
```

✅ **Vérification** : Vous devriez voir 2 fichiers :
- `index.js` (original)
- `index.js.backup_20251107_143022` (backup avec timestamp)

---

## 🎯 ÉTAPE 5 : LOCALISER LE SYSTEM_PROMPT (1 min)

```bash
grep -n "SYSTEM_PROMPT" index.js
```

**Résultat attendu** :
```
42:const SYSTEM_PROMPT = `
43:Tu es un assistant spécialisé en analyse de rêves...
```

Notez le **numéro de ligne** (ici : ligne 42)

---

## 🎯 ÉTAPE 6 : ÉDITER LE BACKEND (5 min)

### Option A : Via nano (Terminal SSH)

```bash
nano index.js
```

**Dans nano** :
1. Appuyez sur `Ctrl + _` (underscore) pour aller à une ligne
2. Tapez le numéro de ligne du SYSTEM_PROMPT (ex: 42)
3. Appuyez sur `Entrée`
4. Sélectionnez tout le texte entre les backticks \`\`\` du SYSTEM_PROMPT
5. Supprimez-le
6. Ouvrez `formatted_prompt.py` sur votre PC
7. Copiez tout le contenu APRÈS "SYSTEM_PROMPT = "
8. Collez-le dans nano (clic droit ou Shift+Insert)
9. Sauvegardez : `Ctrl + O` puis `Entrée`
10. Quittez : `Ctrl + X`

### Option B : Via l'éditeur web Infomaniak (Plus facile)

1. Manager Infomaniak → Hébergement Web → Gestionnaire de fichiers
2. Naviguer vers `/srv/customer/sites/api.thomasmaury.fr/`
3. Clic droit sur `index.js` → "Éditer"
4. Chercher `SYSTEM_PROMPT =` (Ctrl+F)
5. Remplacer tout le texte entre les backticks \`\`\` par le contenu de `formatted_prompt.py`
6. Sauvegarder

---

## 🎯 ÉTAPE 7 : REDÉMARRER LE SERVICE (1 min)

### Option A : Via PM2 (si installé)

```bash
pm2 restart all
# OU
pm2 restart noctaliae-backend
```

### Option B : Via le Manager Infomaniak

1. Manager Infomaniak → Hébergement Web
2. Section "Applications" ou "Node.js"
3. Cliquer sur "Redémarrer"

### Option C : Via systemctl (si root)

```bash
sudo systemctl restart noctaliae-backend
```

---

## 🎯 ÉTAPE 8 : TESTER L'API (3 min)

### Test automatique

Depuis votre PC (PowerShell) :

```powershell
cd "E:\Dream app\App\noctaliae-mobile\docs\prompt-scientifique\deployment-tools"
python test_endpoint.py
```

### Test manuel avec curl

```bash
curl -X POST https://api.thomasmaury.fr/chat-text \
  -H "Content-Type: application/json" \
  -d '{"message": "J'\''ai rêvé que je volais", "conversation_history": []}'
```

### Test avec l'app mobile

1. Ouvrez l'app Noctaliæ
2. Allez dans une analyse de rêve
3. Cliquez "💬 Continuer" (Chat)
4. Envoyez : "J'ai rêvé que je volais"

**Résultat attendu** :
- ✅ Réponse scientifique mentionnant "neurocognitif", "cerveau", "fonction"
- ❌ PAS de symboles type "le vol représente votre désir de liberté"

---

## ✅ VALIDATION

### Checklist de validation

- [ ] Le service a redémarré sans erreur
- [ ] L'endpoint /chat-text répond (status 200)
- [ ] Les réponses contiennent des termes scientifiques
- [ ] Pas d'interprétations symboliques littérales
- [ ] Le ton est bienveillant et curieux
- [ ] Les tests automatisés passent (>70%)

### Exemples de bonnes réponses

**Question** : "J'ai rêvé que je volais"

**✅ Réponse scientifique attendue** :
> "Rêver de voler est très courant ! D'un point de vue neurocognitif, 
> ce type de rêve active les zones du cerveau liées à la simulation 
> motrice et au contrôle spatial. C'est souvent lié à des sensations 
> de liberté ou de maîtrise dans votre vie..."

**❌ Réponse symbolique à éviter** :
> "Le vol dans les rêves symbolise votre désir de liberté et 
> représente votre aspiration à vous élever au-dessus de vos problèmes..."

---

## 🔄 EN CAS DE PROBLÈME : ROLLBACK

Si quelque chose ne fonctionne pas, restaurez le backup :

```bash
cd /srv/customer/sites/api.thomasmaury.fr
cp index.js.backup_TIMESTAMP index.js
pm2 restart all  # ou votre commande de redémarrage
```

---

## 📊 RÉSUMÉ

| Étape | Temps | Outil |
|-------|-------|-------|
| 1. Configuration | 2 min | `config.env` |
| 2. Préparation | 1 min | `deploy.ps1` |
| 3. Connexion SSH | 1 min | SSH/Terminal |
| 4. Backup | 1 min | `cp` |
| 5. Localiser prompt | 1 min | `grep` |
| 6. Éditer backend | 5 min | nano/éditeur web |
| 7. Redémarrer | 1 min | pm2/interface |
| 8. Tester | 3 min | `test_endpoint.py` |
| **TOTAL** | **15 min** | |

---

## 🎉 SUCCÈS !

Une fois que tout fonctionne :

1. **Testez avec différents types de rêves** dans l'app mobile
2. **Vérifiez que les réponses sont scientifiques**
3. **Profitez du nouveau prompt intelligent** ! 🧠

---

## 📞 SUPPORT

En cas de problème, consultez :
- `README.md` : Documentation complète des outils
- `../GUIDE_IMPLEMENTATION.md` : Guide technique détaillé
- `../TESTS_PROMPT_SCIENTIFIQUE.md` : Suite de tests

---

**Prêt ? C'est parti ! 🚀**
