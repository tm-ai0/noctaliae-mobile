# 🧪 TEST de l'endpoint /synthesize (Google Cloud TTS)
# Lance ce script dans PowerShell

$url = "https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev/synthesize"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    🔊 TEST GOOGLE CLOUD TTS - NOCTALIÆ" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ============================================
# TEST 1 : Voix par défaut (aucun paramètre)
# ============================================
Write-Host "📝 TEST 1 : Voix par défaut (français)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$body1 = @{
    text = "Bonjour, je suis l'assistante vocale de Noctaliæ. Prête à explorer vos rêves ensemble ?"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri $url -Method Post -Body $body1 -ContentType "application/json"
    
    Write-Host "✅ SUCCÈS !" -ForegroundColor Green
    Write-Host "   Voix utilisée: $($response1.voice)" -ForegroundColor White
    Write-Host "   Langue: $($response1.language)" -ForegroundColor White
    Write-Host "   Provider: $($response1.provider)" -ForegroundColor White
    Write-Host "   Longueur texte: $($response1.textLength) caractères" -ForegroundColor White
    Write-Host "   Format audio: $($response1.format)" -ForegroundColor White
    Write-Host "   Taille audio base64: $($response1.audio.Length) caractères" -ForegroundColor White
    
} catch {
    Write-Host "❌ ÉCHEC !" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# ============================================
# TEST 2 : Langue spécifique (anglais)
# ============================================
Write-Host "📝 TEST 2 : Détection langue (anglais)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$body2 = @{
    text = "Hello! I am the voice assistant of Noctaliae. Ready to explore your dreams together?"
    language = "en"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri $url -Method Post -Body $body2 -ContentType "application/json"
    
    Write-Host "✅ SUCCÈS !" -ForegroundColor Green
    Write-Host "   Voix utilisée: $($response2.voice)" -ForegroundColor White
    Write-Host "   Langue: $($response2.language)" -ForegroundColor White
    Write-Host "   Provider: $($response2.provider)" -ForegroundColor White
    Write-Host "   Longueur texte: $($response2.textLength) caractères" -ForegroundColor White
    Write-Host "   Format audio: $($response2.format)" -ForegroundColor White
    Write-Host "   Taille audio base64: $($response2.audio.Length) caractères" -ForegroundColor White
    
} catch {
    Write-Host "❌ ÉCHEC !" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# ============================================
# TEST 3 : Voix personnalisée (masculine française)
# ============================================
Write-Host "📝 TEST 3 : Voix personnalisée (masculine)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$body3 = @{
    text = "Ceci est un test avec une voix masculine française."
    voice = "fr-FR-Wavenet-B"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri $url -Method Post -Body $body3 -ContentType "application/json"
    
    Write-Host "✅ SUCCÈS !" -ForegroundColor Green
    Write-Host "   Voix utilisée: $($response3.voice)" -ForegroundColor White
    Write-Host "   Langue: $($response3.language)" -ForegroundColor White
    Write-Host "   Provider: $($response3.provider)" -ForegroundColor White
    Write-Host "   Longueur texte: $($response3.textLength) caractères" -ForegroundColor White
    Write-Host "   Format audio: $($response3.format)" -ForegroundColor White
    Write-Host "   Taille audio base64: $($response3.audio.Length) caractères" -ForegroundColor White
    
} catch {
    Write-Host "❌ ÉCHEC !" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# ============================================
# TEST 4 : Espagnol
# ============================================
Write-Host "📝 TEST 4 : Langue espagnole" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$body4 = @{
    text = "Hola, soy el asistente vocal de Noctaliæ."
    language = "es"
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri $url -Method Post -Body $body4 -ContentType "application/json"
    
    Write-Host "✅ SUCCÈS !" -ForegroundColor Green
    Write-Host "   Voix utilisée: $($response4.voice)" -ForegroundColor White
    Write-Host "   Langue: $($response4.language)" -ForegroundColor White
    Write-Host "   Provider: $($response4.provider)" -ForegroundColor White
    Write-Host "   Longueur texte: $($response4.textLength) caractères" -ForegroundColor White
    Write-Host "   Format audio: $($response4.format)" -ForegroundColor White
    Write-Host "   Taille audio base64: $($response4.audio.Length) caractères" -ForegroundColor White
    
} catch {
    Write-Host "❌ ÉCHEC !" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    ✨ TESTS TERMINÉS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Si tous les tests sont verts, Google Cloud TTS fonctionne !" -ForegroundColor Green
Write-Host ""
Write-Host "Appuie sur Entrée pour fermer..." -ForegroundColor Gray
Read-Host
