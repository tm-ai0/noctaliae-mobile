# 🧪 TEST de l'endpoint /synthesize
# Lance ce script dans PowerShell

$url = "https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev/synthesize"

$body = @{
    text = "Bonjour, je suis l'assistant vocal de Noctaliæ. Prêt à explorer vos rêves ensemble ?"
    voice = "nova"
} | ConvertTo-Json

Write-Host "🔊 Test de synthèse vocale..." -ForegroundColor Cyan
Write-Host "📤 Envoi vers: $url" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "✅ Succès !" -ForegroundColor Green
    Write-Host "Voix utilisée: $($response.voice)" -ForegroundColor White
    Write-Host "Longueur texte: $($response.textLength) caractères" -ForegroundColor White
    Write-Host "Format audio: $($response.format)" -ForegroundColor White
    Write-Host "Taille audio base64: $($response.audio.Length) caractères" -ForegroundColor White
    
} catch {
    Write-Host "❌ Erreur !" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Appuie sur Entrée pour fermer..." -ForegroundColor Gray
Read-Host
