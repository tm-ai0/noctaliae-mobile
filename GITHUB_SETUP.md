# 🐙 GUIDE SETUP GITHUB - NOCTALIÆ

Ce guide t'explique **pas-à-pas** comment créer ton repo GitHub et pousser ton code.

---

## 🎯 ÉTAPE 1 : Créer le repo sur GitHub

1. **Va sur GitHub** : https://github.com/tm-ai0

2. **Clique sur le "+" en haut à droite** → "New repository"

3. **Remplis les infos** :
   ```
   Repository name: noctaliae-mobile
   Description: 🌙 Application mobile d'analyse scientifique des rêves avec IA
   
   Visibilité:
   ⚪ Public (si tu veux le montrer)
   🔘 Private (recommandé pour l'instant)
   
   ❌ Ne coche RIEN d'autre (pas de README, pas de .gitignore, pas de license)
   ```

4. **Clique sur "Create repository"**

5. **GitHub te montre des instructions** → Ignore-les, suis ce guide à la place

---

## 🎯 ÉTAPE 2 : Créer .gitignore

Tu n'as peut-être pas encore de `.gitignore`. Crée-le maintenant :

### Ouvre PowerShell dans ton dossier projet :

```powershell
cd "E:\Dream app\App\noctaliae-mobile"
```

### Crée le fichier .gitignore :

```powershell
@"
# ============================================
# 🌙 NOCTALIÆ - GITIGNORE
# ============================================

# Expo
.expo/
.expo-shared/
dist/
web-build/

# Dependencies
node_modules/

# Builds
build/
*.apk
*.ipa
*.aab

# Environment
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo
*.swn
.DS_Store

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.jest/

# Android
android/app/build/
android/app/release/
*.jks
*.p12
*.key
*.mobileprovision

# iOS
ios/Pods/
ios/build/
*.pbxuser
*.mode1v3
*.mode2v3
*.perspectivev3
*.xcuserstate
project.xcworkspace/

# Misc
*.log
.cache/
tmp/

# Backups
*.backup
*-backup/
BACKUPS/

# Secrets (IMPORTANT)
google-service-account.json
sentry.properties
"@ | Out-File -FilePath .gitignore -Encoding utf8
```

---

## 🎯 ÉTAPE 3 : Initialiser Git

### Dans PowerShell :

```powershell
# 1. Initialise Git
git init

# 2. Configure ton nom et email (si pas déjà fait)
git config user.name "Thomas Maury"
git config user.email "contact@thomasmaury.fr"

# 3. Ajoute tous les fichiers (sauf ceux dans .gitignore)
git add .

# 4. Crée le premier commit
git commit -m "🚀 Initial commit - Fondations complètes Noctaliæ"

# 5. Renomme la branche en 'main' (standard GitHub)
git branch -M main

# 6. Ajoute le repo GitHub comme remote
# ⚠️ REMPLACE 'tm-ai0' par ton vrai username GitHub si différent
git remote add origin https://github.com/tm-ai0/noctaliae-mobile.git

# 7. Pousse le code sur GitHub
git push -u origin main
```

### Si Git te demande de te connecter :

GitHub va te demander de t'authentifier. Utilise un **Personal Access Token** :

1. Va sur : https://github.com/settings/tokens
2. Clique "Generate new token (classic)"
3. Sélectionne les scopes :
   - ✅ `repo` (full control)
   - ✅ `workflow` (pour GitHub Actions)
4. Génère le token
5. **COPIE-LE IMMÉDIATEMENT** (tu ne pourras plus le revoir)
6. Utilise ce token comme **mot de passe** quand Git te le demande

---

## 🎯 ÉTAPE 4 : Vérifier que ça a marché

1. **Actualise ta page GitHub** : https://github.com/tm-ai0/noctaliae-mobile

2. **Tu devrais voir** :
   - Tous tes fichiers
   - Le README.md avec la description
   - Le dernier commit "🚀 Initial commit..."

---

## 🎯 ÉTAPE 5 : Configurer les secrets GitHub (pour CI/CD)

Pour que les GitHub Actions fonctionnent, il faut ajouter des secrets :

1. **Va dans ton repo GitHub**
2. **Settings** → **Secrets and variables** → **Actions**
3. **Clique "New repository secret"**

### Secrets à ajouter (plus tard, quand tu auras les valeurs) :

```
EXPO_TOKEN
→ À obtenir sur https://expo.dev/accounts/[username]/settings/access-tokens

CODECOV_TOKEN
→ Optionnel, pour le coverage de tests

SENTRY_AUTH_TOKEN
→ Optionnel, pour Sentry
```

⚠️ **Pour l'instant, tu n'as pas besoin de ces secrets.** Ajoute-les quand tu voudras activer les GitHub Actions.

---

## 🎯 ÉTAPE 6 : Workflow quotidien

Maintenant que c'est setup, voici comment travailler avec Git au quotidien :

### Faire des modifications et les envoyer sur GitHub :

```powershell
# 1. Vérifie les fichiers modifiés
git status

# 2. Ajoute les fichiers modifiés
git add .
# OU ajoute un fichier spécifique :
git add src/components/DreamCard.tsx

# 3. Crée un commit avec un message descriptif
git commit -m "feat: migration DreamCard vers TypeScript"

# 4. Pousse sur GitHub
git push
```

### Messages de commit (conventions) :

```
feat: nouvelle feature
fix: correction de bug
refactor: refactoring du code
docs: modification documentation
test: ajout/modification tests
style: changements esthétiques (CSS, formatting)
chore: tâches de maintenance (deps, config)
```

Exemples :
```
feat: ajout store Zustand pour les rêves
fix: correction crash lors de l'enregistrement audio
refactor: migration apiService vers TypeScript
docs: mise à jour guide de déploiement
test: ajout tests pour dreamStore
```

---

## 🎯 ÉTAPE 7 : Créer des branches (plus tard)

Quand tu voudras tester des features sans toucher au code principal :

```powershell
# Créer une nouvelle branche
git checkout -b feature/nouveau-theme

# Faire tes modifications
# ...

# Commit
git add .
git commit -m "feat: ajout theme 'Sakura'"

# Pousser la branche
git push -u origin feature/nouveau-theme
```

Puis sur GitHub, tu peux créer une **Pull Request** pour merger dans `main`.

---

## 🎯 ÉTAPE 8 : Protéger la branche main (recommandé)

Pour éviter de push du code cassé sur `main` :

1. **Settings** → **Branches**
2. **Add branch protection rule**
3. Branch name pattern : `main`
4. Coche :
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

---

## 🐛 TROUBLESHOOTING

### Erreur : "Permission denied"

→ Utilise un Personal Access Token au lieu du mot de passe

### Erreur : "Remote origin already exists"

```powershell
git remote remove origin
git remote add origin https://github.com/tm-ai0/noctaliae-mobile.git
```

### Erreur : "Failed to push"

```powershell
# Force le push (⚠️ attention, ça écrase l'historique)
git push -f origin main
```

### Annuler le dernier commit (pas encore pushé)

```powershell
git reset --soft HEAD~1
```

### Voir l'historique des commits

```powershell
git log --oneline
```

---

## ✅ CHECKLIST FINALE

- [ ] Repo créé sur GitHub
- [ ] `.gitignore` créé
- [ ] Git initialisé localement
- [ ] Premier commit fait
- [ ] Code poussé sur GitHub
- [ ] README.md visible sur GitHub
- [ ] `.env` est bien ignoré (pas sur GitHub)
- [ ] `node_modules` est bien ignoré

---

## 🎉 FÉLICITATIONS !

Ton projet Noctaliæ est maintenant sur GitHub !

**URL du repo** : https://github.com/tm-ai0/noctaliae-mobile

Tu peux maintenant :
- Travailler de n'importe où
- Avoir un historique complet
- Partager ton code
- Activer les GitHub Actions (CI/CD)
- Collaborer avec d'autres devs

---

**Besoin d'aide ?** Demande-moi et je t'explique !
