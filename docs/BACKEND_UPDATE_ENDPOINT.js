/**
 * 🔄 MODIFICATION ENDPOINT /health POUR SUPPORT MISE À JOUR IN-APP
 * 
 * Ajoute ces champs à la réponse de ton endpoint /health sur api.thomasmaury.fr
 */

// Dans ton serveur Node.js (server.js ou routes/health.js)

app.get('/health', (req, res) => {
  res.json({
    // Champs existants
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.10', // Version du backend
    
    // 🆕 NOUVEAUX CHAMPS POUR MISE À JOUR IN-APP
    latestAppVersion: '0.9.11',  // ← Version la plus récente de l'APK
    downloadUrl: 'https://ton-lien-de-telechargement.com/noctaliae-0.9.11.apk', // URL directe APK
    releaseNotes: '• Vérification Premium sur DeepDream\n• Rate limiting IP\n• Fix audio transcription\n• Correction typos',
    criticalUpdate: false, // true = force la mise à jour (pas de bouton "Plus tard")
  });
});

/**
 * 📋 EXPLICATION DES CHAMPS
 * 
 * latestAppVersion : La version actuellement disponible de l'APK
 *                    L'app compare avec sa version locale (app.json)
 *                    Si latestAppVersion > version locale → modal s'affiche
 * 
 * downloadUrl :      URL directe vers le fichier APK
 *                    Peut être GitHub Releases, Google Drive, serveur perso...
 *                    Si null/undefined → bouton "Bientôt disponible" (désactivé)
 * 
 * releaseNotes :     Notes de version affichées dans le modal (optionnel)
 *                    Format texte simple avec \n pour sauts de ligne
 * 
 * criticalUpdate :   Si true → pas de bouton "Plus tard", mise à jour obligatoire
 *                    Utiliser avec parcimonie (vraies failles de sécurité)
 */

/**
 * 🎯 WORKFLOW RECOMMANDÉ
 * 
 * 1. Build ton APK v0.9.11
 * 2. Upload sur GitHub Releases ou serveur
 * 3. Mettre à jour latestAppVersion: '0.9.11' + downloadUrl sur le backend
 * 4. Déployer le backend
 * 5. L'app détectera automatiquement la nouvelle version
 */
