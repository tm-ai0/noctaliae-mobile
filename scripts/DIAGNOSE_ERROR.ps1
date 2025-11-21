# 🔍 DIAGNOSE_ERROR.ps1
# Script de diagnostic pour identifier l'erreur 400

$baseUrl = "https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev"

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 DIAGNOSTIC - Identification Erreur 400" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

# ============================================
# 🧪 Test 1 : Health Check
# ============================================
Write-Host "🧪 Test 1/5 : Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ SUCCÈS - Backend actif" -ForegroundColor Green
    Write-Host "   Service : $($health.service)" -ForegroundColor Gray
    Write-Host "   Version : $($health.version)" -ForegroundColor Gray
    Write-Host "   Status : $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ ÉCHEC - Backend inaccessible" -ForegroundColor Red
    Write-Host "   Erreur : $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# ============================================
# 🧪 Test 2 : Requête Minimale
# ============================================
Write-Host "🧪 Test 2/5 : Requête minimale (seulement text)" -ForegroundColor Yellow
$minimal = @{
    text = "Test"
} | ConvertTo-Json

Write-Host "📤 Body envoyé : $minimal" -ForegroundColor Gray

try {
    $result = Invoke-RestMethod -Uri "$baseUrl/synthesize" -Method POST -Body $minimal -ContentType "application/json"
    Write-Host "✅ SUCCÈS" -ForegroundColor Green
    Write-Host "   Voix : $($result.voice)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    Write-Host "❌ ÉCHEC" -ForegroundColor Red
    Write-Host "   Status Code : $statusCode" -ForegroundColor Red
    Write-Host "   Erreur : $errorBody" -ForegroundColor Red
}

Write-Host ""

# ============================================
# 🧪 Test 3 : Capture Détaillée de l'Erreur
# ============================================
Write-Host "🧪 Test 3/5 : Capture détaillée de l'erreur" -ForegroundColor Yellow

$body = @{
    text = "Bonjour test"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/synthesize" -Method POST -Body $body -ContentType "application/json"
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ SUCCÈS" -ForegroundColor Green
    Write-Host "   Status : $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Voix : $($result.voice)" -ForegroundColor Gray
} catch {
    Write-Host "❌ ÉCHEC" -ForegroundColor Red
    Write-Host "   Status Code : $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Lire le corps de la réponse d'erreur
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorResponse = $reader.ReadToEnd()
    $reader.Close()
    
    Write-Host "   Réponse complète du serveur :" -ForegroundColor Yellow
    Write-Host "   $errorResponse" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 🧪 Test 4 : Vérifier Version Backend
# ============================================
Write-Host "🧪 Test 4/5 : Vérification version backend" -ForegroundColor Yellow

# Vérifier si c'est l'ancienne version (sans rate limiting)
try {
    # Faire plusieurs requêtes rapides
    Write-Host "   Envoi de 3 requêtes rapides..." -ForegroundColor Gray
    
    for ($i = 1; $i -le 3; $i++) {
        $testBody = @{ text = "Test $i" } | ConvertTo-Json
        try {
            $null = Invoke-RestMethod -Uri "$baseUrl/synthesize" -Method POST -Body $testBody -ContentType "application/json"
            Write-Host "   Requête $i : ✅" -ForegroundColor Green
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 429) {
                Write-Host "   Requête $i : ⏱️ Rate limit détecté (NOUVELLE VERSION)" -ForegroundColor Cyan
            } else {
                Write-Host "   Requête $i : ❌ Erreur $statusCode" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "   ⚠️ Erreur lors du test de version" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 🧪 Test 5 : Test avec Headers Explicites
# ============================================
Write-Host "🧪 Test 5/5 : Test avec headers explicites" -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json; charset=utf-8"
    "Accept" = "application/json"
}

$body = @{
    text = "Test avec headers"
} | ConvertTo-Json -Compress

Write-Host "📤 Body : $body" -ForegroundColor Gray

try {
    $result = Invoke-RestMethod -Uri "$baseUrl/synthesize" -Method POST -Body $body -Headers $headers
    Write-Host "✅ SUCCÈS" -ForegroundColor Green
    Write-Host "   Voix : $($result.voice)" -ForegroundColor Gray
} catch {
    Write-Host "❌ ÉCHEC" -ForegroundColor Red
    
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorResponse = $reader.ReadToEnd()
    $reader.Close()
    
    Write-Host "   Erreur serveur : $errorResponse" -ForegroundColor Red
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 Diagnostic terminé" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n💡 INTERPRÉTATION :" -ForegroundColor Yellow
Write-Host "   • Si Test 1 échoue → Backend inaccessible" -ForegroundColor Gray
Write-Host "   • Si Test 2-3 échouent → Problème de format ou validation" -ForegroundColor Gray
Write-Host "   • Si Test 4 détecte rate limit (429) → Nouvelle version déployée" -ForegroundColor Gray
Write-Host "   • Si aucun rate limit → Ancienne version toujours active" -ForegroundColor Gray
