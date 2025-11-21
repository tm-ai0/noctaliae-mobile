# ============================================
# 🐙 NOCTALIÆ - PUSH TO GITHUB
# ============================================
# Ce script initialise Git et pousse le code sur GitHub

Write-Host "🐙 Noctaliæ - Push to GitHub..." -ForegroundColor Cyan
Write-Host ""

# Vérifier qu'on est dans le bon dossier
if (!(Test-Path "package.json")) {
    Write-Host "❌ ERREUR : Ce script doit être exécuté depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Vérifier si Git est déjà initialisé
if (Test-Path ".git") {
    Write-Host "⚠️  Git est déjà initialisé dans ce projet." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Voulez-vous réinitialiser Git ? (o/N)"
    if ($response -ne "o" -and $response -ne "O") {
        Write-Host "❌ Opération annulée." -ForegroundColor Red
        exit 0
    }
    Remove-Item -Recurse -Force .git
    Write-Host "✓ Git réinitialisé" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Configuration Git..." -ForegroundColor Yellow

# Initialiser Git
git init
Write-Host "  ✓ Git initialisé" -ForegroundColor Gray

# Configurer le nom et l'email
git config user.name "Thomas Maury"
git config user.email "contact@thomasmaury.fr"
Write-Host "  ✓ Utilisateur configuré : Thomas Maury" -ForegroundColor Gray

# Renommer la branche en main
git branch -M main
Write-Host "  ✓ Branche 'main' créée" -ForegroundColor Gray

Write-Host ""
Write-Host "📦 Ajout des fichiers..." -ForegroundColor Yellow

# Ajouter tous les fichiers
git add .
Write-Host "  ✓ Tous les fichiers ajoutés" -ForegroundColor Gray

# Vérifier ce qui sera commité
Write-Host ""
Write-Host "📊 Fichiers à commiter :" -ForegroundColor Cyan
git status --short | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

Write-Host ""
$response = Read-Host "Continuer ? (O/n)"
if ($response -eq "n" -or $response -eq "N") {
    Write-Host "❌ Opération annulée." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "💾 Création du commit initial..." -ForegroundColor Yellow

# Créer le commit initial
git commit -m "🚀 Initial commit - Professional structure

✨ Features:
- Voice recording & Whisper transcription
- AI analysis (Claude Sonnet 4.5 & Llama 3.3 70B)
- Deep chat conversations
- 6 customizable themes
- User fingerprints/persona system
- Rate limiting with Ko-fi donations
- Onboarding flow (3 screens)

🏗️ Structure:
- React Native + Expo 54
- TypeScript migration in progress
- Professional folder organization
- Multilingual README (EN/FR)
- MIT License

📚 Documentation:
- Complete architecture docs
- Deployment guide
- Testing guide
- Contributing guidelines

🔒 Privacy-first:
- Local storage (AsyncStorage)
- No cloud sync by default
- GDPR compliant

Made with ❤️ and 🧠 in Montpellier, France
By Thomas Maury - Graphic & Motion Designer"

Write-Host "  ✓ Commit créé" -ForegroundColor Green

Write-Host ""
Write-Host "🔗 Ajout du remote GitHub..." -ForegroundColor Yellow

# Ajouter le remote
git remote add origin https://github.com/tm-ai0/noctaliae-mobile.git
Write-Host "  ✓ Remote 'origin' ajouté" -ForegroundColor Gray

Write-Host ""
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  GitHub va te demander de t'authentifier." -ForegroundColor Yellow
Write-Host "    Utilise ton Personal Access Token comme mot de passe." -ForegroundColor Yellow
Write-Host ""

# Pause pour laisser l'utilisateur lire
Start-Sleep -Seconds 2

# Push vers GitHub
git push -u origin main

Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ CODE POUSSÉ SUR GITHUB !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Ton repo est maintenant sur GitHub !" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔗 Lien : https://github.com/tm-ai0/noctaliae-mobile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎯 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "  1. Va sur GitHub et vérifie que tout est là" -ForegroundColor Gray
    Write-Host "  2. Ajoute une description au repo si besoin" -ForegroundColor Gray
    Write-Host "  3. Configure les topics (react-native, expo, ai, dreams, etc.)" -ForegroundColor Gray
    Write-Host "  4. Partage le lien dans ton portfolio !" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ ERREUR lors du push" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Causes possibles :" -ForegroundColor Yellow
    Write-Host "  • Le repo existe déjà et contient des fichiers" -ForegroundColor Gray
    Write-Host "  • Problème d'authentification GitHub" -ForegroundColor Gray
    Write-Host "  • Pas de connexion internet" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 Solutions :" -ForegroundColor Yellow
    Write-Host "  • Vérifie que le repo est vide sur GitHub" -ForegroundColor Gray
    Write-Host "  • Utilise un Personal Access Token pour l'auth" -ForegroundColor Gray
    Write-Host "  • Essaye: git push -u origin main --force" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "🌙 Script terminé !" -ForegroundColor Cyan
Write-Host ""
