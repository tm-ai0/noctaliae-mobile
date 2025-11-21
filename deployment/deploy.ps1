# 🚀 Script de déploiement automatisé du prompt scientifique Noctaliæ
# Pour Windows PowerShell
# Usage: .\deploy.ps1

# Configuration
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Couleurs
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Warning { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "❌ $args" -ForegroundColor Red }

# Banner
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 DÉPLOIEMENT PROMPT SCIENTIFIQUE NOCTALIÆ           ║" -ForegroundColor Cyan
Write-Host "║   Basé sur les travaux d'Isabelle Arnulf                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Étape 1 : Charger la configuration
Write-Info "Chargement de la configuration..."

if (-not (Test-Path "config.env")) {
    Write-Error "Fichier config.env non trouvé !"
    Write-Info "Copiez config.env.example vers config.env et remplissez vos informations SSH"
    exit 1
}

# Lire le fichier config.env
$config = @{}
Get-Content "config.env" | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.+)$') {
        $config[$matches[1].Trim()] = $matches[2].Trim()
    }
}

Write-Success "Configuration chargée"

# Étape 2 : Préparer le prompt
Write-Info "Préparation du prompt scientifique..."

python prepare_prompt.py
if (-not (Test-Path "formatted_prompt.py")) {
    Write-Error "Échec de la génération du prompt formaté"
    exit 1
}

Write-Success "Prompt préparé et formaté"

# Statistiques du prompt
$promptContent = Get-Content "formatted_prompt.py" -Raw
$stats = @{
    Chars = $promptContent.Length
    Lines = ($promptContent -split "`n").Count
    Words = ($promptContent -split '\s+').Count
}

Write-Host ""
Write-Info "📊 Statistiques du prompt :"
Write-Host "   - Caractères : $($stats.Chars)"
Write-Host "   - Lignes : $($stats.Lines)"
Write-Host "   - Mots : $($stats.Words)"
Write-Host ""

# Étape 3 : Afficher les infos de connexion
Write-Info "📡 Informations de connexion SSH :"
Write-Host "   - Host : $($config.SSH_HOST)"
Write-Host "   - User : $($config.SSH_USER)"
Write-Host "   - Port : $($config.SSH_PORT)"
Write-Host "   - Backend : $($config.BACKEND_DIR)/$($config.BACKEND_FILE)"
Write-Host ""

# Étape 4 : Instructions pour le déploiement manuel
Write-Warning "DÉPLOIEMENT MANUEL REQUIS"
Write-Info "Suivez ces étapes pour déployer le prompt :"
Write-Host ""

Write-Host "1️⃣  CONNEXION SSH" -ForegroundColor Yellow
Write-Host "   Ouvrez un terminal Git Bash ou WSL et exécutez :"
Write-Host "   ssh -i `"$($config.SSH_KEY_PATH)`" -p $($config.SSH_PORT) $($config.SSH_USER)@$($config.SSH_HOST)" -ForegroundColor Cyan
Write-Host ""

Write-Host "2️⃣  BACKUP DU FICHIER ACTUEL" -ForegroundColor Yellow
Write-Host "   cd $($config.BACKEND_DIR)"
Write-Host "   cp $($config.BACKEND_FILE) $($config.BACKEND_FILE).backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')" -ForegroundColor Cyan
Write-Host ""

Write-Host "3️⃣  LOCALISER LE SYSTEM_PROMPT" -ForegroundColor Yellow
Write-Host "   grep -n 'SYSTEM_PROMPT' $($config.BACKEND_FILE)" -ForegroundColor Cyan
Write-Host "   (Notez le numéro de ligne)" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  COPIER LE NOUVEAU PROMPT" -ForegroundColor Yellow
Write-Host "   Le nouveau prompt est dans : formatted_prompt.py" -ForegroundColor Cyan
Write-Host "   Ouvrez ce fichier et copiez tout le contenu" -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣  ÉDITER LE BACKEND" -ForegroundColor Yellow
Write-Host "   nano $($config.BACKEND_FILE)" -ForegroundColor Cyan
Write-Host "   OU utilisez l'éditeur web d'Infomaniak" -ForegroundColor Gray
Write-Host "   Remplacez l'ancien SYSTEM_PROMPT = `"...`" par le nouveau" -ForegroundColor Gray
Write-Host ""

Write-Host "6️⃣  REDÉMARRER LE SERVICE" -ForegroundColor Yellow
Write-Host "   $($config.RESTART_COMMAND)" -ForegroundColor Cyan
Write-Host "   OU via le panneau Infomaniak" -ForegroundColor Gray
Write-Host ""

Write-Host "7️⃣  TESTER L'API" -ForegroundColor Yellow
Write-Host "   Exécutez : python test_endpoint.py" -ForegroundColor Cyan
Write-Host "   OU testez manuellement ci-dessous" -ForegroundColor Gray
Write-Host ""

# Étape 5 : Créer un fichier de commandes SSH
$sshCommands = @"
#!/bin/bash
# Commandes à exécuter sur le serveur Infomaniak

cd $($config.BACKEND_DIR)

# 1. Backup
cp $($config.BACKEND_FILE) $($config.BACKEND_FILE).backup_$(date +%Y%m%d_%H%M%S)
echo "✅ Backup créé"

# 2. Afficher l'emplacement du SYSTEM_PROMPT
echo "📍 Localisation du SYSTEM_PROMPT actuel :"
grep -n "SYSTEM_PROMPT" $($config.BACKEND_FILE)

# 3. Instructions
echo ""
echo "⚠️  IMPORTANT : Vous devez maintenant :"
echo "1. Éditer le fichier : nano $($config.BACKEND_FILE)"
echo "2. Remplacer le SYSTEM_PROMPT par le contenu de formatted_prompt.py"
echo "3. Redémarrer le service : $($config.RESTART_COMMAND)"
echo ""
"@

$sshCommands | Out-File -FilePath "ssh_commands.sh" -Encoding UTF8
Write-Success "Fichier de commandes SSH créé : ssh_commands.sh"
Write-Host ""

# Étape 6 : Test API (optionnel)
Write-Info "Pour tester l'API après déploiement :"
Write-Host "python test_endpoint.py" -ForegroundColor Cyan
Write-Host ""

Write-Host "OU avec curl :" -ForegroundColor Yellow
$curlCommand = @"
curl -X POST $($config.API_URL) \
  -H "Content-Type: application/json" \
  -d '{\"message\": \"$($config.TEST_MESSAGE)\", \"conversation_history\": []}'
"@
Write-Host $curlCommand -ForegroundColor Cyan
Write-Host ""

# Résumé final
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Success "PRÉPARATION TERMINÉE !"
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Info "Fichiers générés :"
Write-Host "   ✅ formatted_prompt.py (nouveau prompt formaté)"
Write-Host "   ✅ formatted_prompt.json (métadonnées)"
Write-Host "   ✅ ssh_commands.sh (commandes pour le serveur)"
Write-Host ""
Write-Info "Prochaines étapes :"
Write-Host "   1. Connectez-vous en SSH (commande ci-dessus)"
Write-Host "   2. Exécutez les commandes dans ssh_commands.sh"
Write-Host "   3. Éditez le fichier backend et remplacez le prompt"
Write-Host "   4. Redémarrez le service"
Write-Host "   5. Testez avec test_endpoint.py"
Write-Host ""
Write-Warning "Besoin d'aide ? Consultez le README.md"
Write-Host ""
