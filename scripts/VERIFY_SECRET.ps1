# VERIFY_SECRET.ps1 - Version Corrigée
$BACKEND = "https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev"

Write-Host "`n🔍 Vérification Secret Google Cloud" -ForegroundColor Cyan
Write-Host "=" * 60

# Test 1: Backend accessible
Write-Host "`n1️⃣ Backend status..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BACKEND/health" -TimeoutSec 10
    Write-Host "   ✅ Backend: $($health.status)" -ForegroundColor Green
    Write-Host "   Version: $($health.version)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend inaccessible!" -ForegroundColor Red
    exit
}

# Test 2: Endpoint /synthesize
Write-Host "`n2️⃣ Test synthèse vocale..." -ForegroundColor Yellow
$body = @{
    text = "Test de connexion."
    voiceName = "en-US-Journey-D"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BACKEND/synthesize" `
        -Method Post `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 15
    
    if ($response.audioContent) {
        $audioSize = $response.audioContent.Length
        Write-Host "   ✅ Synthèse OK! Taille: $audioSize bytes" -ForegroundColor Green
        Write-Host "   🎉 SECRET GOOGLE CLOUD CORRECTEMENT CONFIGURÉ!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Erreur synthèse vocale" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorData = $_.ErrorDetails.Message | ConvertFrom-Json  # ← CHANGÉ: $error → $errorData
        Write-Host "`n   Détails de l'erreur:" -ForegroundColor Yellow
        Write-Host "   $($errorData.error)" -ForegroundColor Red  # ← CHANGÉ
        
        if ($errorData.error -match "API key not valid") {  # ← CHANGÉ
            Write-Host "`n   🔑 PROBLÈME: Secret mal configuré dans Replit" -ForegroundColor Yellow
            Write-Host "   Actions requises:" -ForegroundColor Cyan
            Write-Host "   1. Vérifier que la clé est bien copiée (pas d'espace)" -ForegroundColor White
            Write-Host "   2. Vérifier qu'il n'y a pas de guillemets" -ForegroundColor White
            Write-Host "   3. Redémarrer Replit (Stop + 10s + Run)" -ForegroundColor White
        }
    } else {
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 60) + "`n"