# Test de l'endpoint /synthesize après configuration .env
# Usage: .\TEST_SYNTHESIZE_AFTER_ENV.ps1

$replitUrl = "https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev"

Write-Host "🧪 Test de synthèse vocale (après configuration .env)..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣ Test Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$replitUrl/health" -Method Get
    Write-Host "   ✅ Backend opérationnel" -ForegroundColor Green
    Write-Host "   Version: $($health.version)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend inaccessible" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 2: Synthèse Vocale
Write-Host "2️⃣ Test Synthèse Vocale..." -ForegroundColor Yellow

$body = @{
    text = "Bonjour, je suis Noctaliæ, votre guide des rêves."
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$replitUrl/synthesize" -Method Post -Body $body -Headers $headers -TimeoutSec 30
    
    if ($response.audio_base64) {
        $audioLength = $response.audio_base64.Length
        Write-Host "   ✅ Synthèse réussie!" -ForegroundColor Green
        Write-Host "   📊 Taille audio: $audioLength caractères base64" -ForegroundColor Gray
        
        # Optionnel: sauvegarder l'audio
        $saveChoice = Read-Host "   💾 Sauvegarder l'audio en MP3? (o/n)"
        if ($saveChoice -eq "o" -or $saveChoice -eq "O") {
            $audioBytes = [System.Convert]::FromBase64String($response.audio_base64)
            $outputPath = "test_tts_output.mp3"
            [System.IO.File]::WriteAllBytes($outputPath, $audioBytes)
            Write-Host "   ✅ Audio sauvegardé: $outputPath" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⚠️ Réponse reçue mais pas d'audio" -ForegroundColor Yellow
        Write-Host "   Réponse: $($response | ConvertTo-Json)" -ForegroundColor Gray
    }
} catch {
    $errorDetails = $_.ErrorDetails.Message
    Write-Host "   ❌ Erreur de synthèse" -ForegroundColor Red
    
    if ($errorDetails) {
        $errorObj = $errorDetails | ConvertFrom-Json
        Write-Host "   🔍 Détails: $($errorObj.error)" -ForegroundColor Yellow
        Write-Host "   💡 Message: $($errorObj.details)" -ForegroundColor Gray
    } else {
        Write-Host "   🔍 Erreur: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Tests terminés!" -ForegroundColor Cyan
