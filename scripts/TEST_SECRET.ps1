# 🔍 TEST_SECRET.ps1
# Test pour vérifier si la clé API est correctement lue par Replit

$baseUrl = "https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev"

Write-Host "`n🔍 Test de la Configuration du Secret`n" -ForegroundColor Cyan

# Test 1 : Health Check
Write-Host "1️⃣ Backend actif ?" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "   ✅ Backend actif - Version: $($health.version)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend inaccessible" -ForegroundColor Red
    exit
}

# Test 2 : Synthèse Minimale
Write-Host "`n2️⃣ Test synthèse avec texte minimal" -ForegroundColor Yellow
$testBody = @{ text = "Test" } | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/synthesize" -Method POST -Body $testBody -ContentType "application/json"
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success -eq $true) {
        Write-Host "   ✅ SUCCÈS - Audio généré !" -ForegroundColor Green
        Write-Host "   📊 Voix : $($result.voice)" -ForegroundColor Gray
        Write-Host "   📊 Langue : $($result.language)" -ForegroundColor Gray
        Write-Host "   📊 Taille : $($result.audio.Length) caractères" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Réponse invalide" -ForegroundColor Red
        Write-Host "   $($response.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ ÉCHEC" -ForegroundColor Red
    
    # Capturer l'erreur détaillée
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   📊 Status Code : $statusCode" -ForegroundColor Red
    
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    $reader.Close()
    
    Write-Host "   📊 Erreur serveur :" -ForegroundColor Red
    Write-Host "   $errorBody" -ForegroundColor Yellow
    
    # Analyser l'erreur
    if ($errorBody -like "*API key not valid*") {
        Write-Host "`n   ⚠️ PROBLÈME DÉTECTÉ :" -ForegroundColor Yellow
        Write-Host "   La clé API Google Cloud est invalide ou mal configurée" -ForegroundColor Yellow
        Write-Host "`n   🔧 SOLUTIONS :" -ForegroundColor Cyan
        Write-Host "   1. Vérifier le nom du secret dans Replit : GOOGLE_CLOUD_API_KEY" -ForegroundColor White
        Write-Host "   2. Vérifier que la clé commence par 'AIza...'" -ForegroundColor White
        Write-Host "   3. Tester la clé directement dans le navigateur" -ForegroundColor White
        Write-Host "   4. Redémarrer Replit après modification" -ForegroundColor White
    }
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
