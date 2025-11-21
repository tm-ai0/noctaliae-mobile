# ⏱️ TEST_SYNTHESIZE_SAFE.ps1
# Script de test de l'endpoint /synthesize avec délais pour éviter erreur 429

$baseUrl = "https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev"

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔊 Tests Synthèse Vocale Google Cloud TTS - MODE SAFE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

# ============================================
# 🧪 Test 1 : Voix par défaut (français)
# ============================================
Write-Host "🧪 Test 1/4 : Voix par défaut (français)" -ForegroundColor Yellow
$test1 = @{
    text = "Bonjour ! Voici votre analyse de rêve. Les neurosciences montrent que vos rêves reflètent vos préoccupations quotidiennes."
} | ConvertTo-Json

try {
    $result1 = Invoke-RestMethod -Uri "$baseUrl/synthesize" -Method POST -Body $test1 -ContentType "application/json"
    Write-Host "✅ SUCCÈS - Voix : $($result1.voice)" -ForegroundColor Green
    Write-Host "   Langue : $($result1.language)" -ForegroundColor Gray
    Write-Host "   Taille audio : $($result1.audio.Length) caractères base64" -ForegroundColor Gray
} catch {
    Write-Host "❌ ÉCHEC - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n⏳ Attente 5 secondes avant test suivant...`n" -ForegroundColor Cyan
Start-Sleep -Seconds 5

# ============================================
# 🧪 Test 2 : Voix anglaise (détection langue)
# ============================================
Write-Host "🧪 Test 2/4 : Anglais avec détection automatique" -ForegroundColor Yellow
$test2 = @{
    text = "Hello! Your dream analysis is ready. Neuroscience research shows fascinating patterns in your subconscious mind."
    language = "en"
} | ConvertTo-Json

try {
    $result2 = Invoke-RestMethod -Uri "$baseUrl/synthesize" -Method POST -Body $test2 -ContentType "application/json"
    Write-Host "✅ SUCCÈS - Voix : $($result2.voice)" -ForegroundColor Green
    Write-Host "   Langue : $($result2.language)" -ForegroundColor Gray
    Write-Host "   Taille audio : $($result2.audio.Length) caractères base64" -ForegroundColor Gray
} catch {
    Write-Host "❌ ÉCHEC - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n⏳ Attente 5 secondes avant test suivant...`n" -ForegroundColor Cyan
Start-Sleep -Seconds 5

# ============================================
# 🧪 Test 3 : Voix spécifique (québécois)
# ============================================
Write-Host "🧪 Test 3/4 : Voix spécifique (fr-CA-Wavenet-A)" -ForegroundColor Yellow
$test3 = @{
    text = "Salut ! Ton analyse de rêve est prête. Les neurosciences révèlent des patterns fascinants dans ton subconscient."
    voice = "fr-CA-Wavenet-A"
} | ConvertTo-Json

try {
    $result3 = Invoke-RestMethod -Uri "$baseUrl/synthesize" -Method POST -Body $test3 -ContentType "application/json"
    Write-Host "✅ SUCCÈS - Voix : $($result3.voice)" -ForegroundColor Green
    Write-Host "   Langue : $($result3.language)" -ForegroundColor Gray
    Write-Host "   Taille audio : $($result3.audio.Length) caractères base64" -ForegroundColor Gray
} catch {
    Write-Host "❌ ÉCHEC - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n⏳ Attente 5 secondes avant test suivant...`n" -ForegroundColor Cyan
Start-Sleep -Seconds 5

# ============================================
# 🧪 Test 4 : Espagnol
# ============================================
Write-Host "🧪 Test 4/4 : Espagnol (détection automatique)" -ForegroundColor Yellow
$test4 = @{
    text = "¡Hola! Tu análisis de sueños está listo. Las neurociencias revelan patrones fascinantes en tu mente subconsciente."
    language = "es"
} | ConvertTo-Json

try {
    $result4 = Invoke-RestMethod -Uri "$baseUrl/synthesize" -Method POST -Body $test4 -ContentType "application/json"
    Write-Host "✅ SUCCÈS - Voix : $($result4.voice)" -ForegroundColor Green
    Write-Host "   Langue : $($result4.language)" -ForegroundColor Gray
    Write-Host "   Taille audio : $($result4.audio.Length) caractères base64" -ForegroundColor Gray
} catch {
    Write-Host "❌ ÉCHEC - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Tests terminés avec délais de sécurité (5s)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
