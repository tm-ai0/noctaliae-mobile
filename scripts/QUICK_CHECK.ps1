# ⚡ QUICK_CHECK.ps1
# Vérification rapide de la version du backend

$baseUrl = "https://47e815c8-e459-45c8-ba31-191aaded931e-00-2v7md0rs9e8sy.kirk.replit.dev"

Write-Host "`n🔍 Vérification Rapide du Backend...`n" -ForegroundColor Cyan

try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    
    Write-Host "✅ Backend accessible" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Informations :" -ForegroundColor Yellow
    Write-Host "   Service : $($health.service)" -ForegroundColor White
    Write-Host "   Version : $($health.version)" -ForegroundColor White
    Write-Host "   Status  : $($health.status)" -ForegroundColor White
    Write-Host ""
    
    # Vérifier la version
    if ($health.version -eq "1.1-rate-limited") {
        Write-Host "🎉 NOUVELLE VERSION DÉTECTÉE !" -ForegroundColor Green
        Write-Host "   Le backend avec rate limiting est actif." -ForegroundColor Green
        Write-Host ""
        Write-Host "   ✅ Vous pouvez lancer les tests :" -ForegroundColor Cyan
        Write-Host "      .\TEST_SYNTHESIZE_SAFE.ps1" -ForegroundColor White
    }
    elseif ($health.version -eq "1.0") {
        Write-Host "⚠️  ANCIENNE VERSION DÉTECTÉE" -ForegroundColor Yellow
        Write-Host "   La version sans rate limiting est toujours active." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   🔧 Action requise :" -ForegroundColor Red
        Write-Host "      1. Ouvrir Replit : https://replit.com" -ForegroundColor White
        Write-Host "      2. Ouvrir index.js" -ForegroundColor White
        Write-Host "      3. Remplacer par index_WITH_RATE_LIMIT.js" -ForegroundColor White
        Write-Host "      4. Sauvegarder (Ctrl+S)" -ForegroundColor White
        Write-Host "      5. Redémarrer (Stop + Run)" -ForegroundColor White
    }
    else {
        Write-Host "⚠️  VERSION INCONNUE : $($health.version)" -ForegroundColor Yellow
        Write-Host "   Vérifiez le fichier index.js sur Replit" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Backend inaccessible" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Vérifications :" -ForegroundColor Yellow
    Write-Host "   1. URL correcte ? $baseUrl" -ForegroundColor White
    Write-Host "   2. Replit est démarré ?" -ForegroundColor White
    Write-Host "   3. Connexion internet OK ?" -ForegroundColor White
    Write-Host ""
    Write-Host "   Erreur : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
