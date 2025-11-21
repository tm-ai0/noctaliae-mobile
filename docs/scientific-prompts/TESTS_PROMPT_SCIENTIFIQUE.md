# 🧪 TESTS DU NOUVEAU PROMPT SCIENTIFIQUE

## Objectif

Ce fichier contient une série de tests à effectuer pour vérifier que le nouveau prompt scientifique fonctionne correctement après le déploiement.

---

## ✅ CHECKLIST DE TESTS

### 1. Tests de Base

- [ ] L'endpoint `/chat-text` répond (pas d'erreur 500)
- [ ] Les réponses sont en français
- [ ] Le ton est bienveillant
- [ ] Les réponses sont cohérentes

### 2. Tests de Contenu Scientifique

- [ ] Les réponses évitent les interprétations symboliques littérales
- [ ] Les réponses citent des données chiffrées (65%, 82%, 77%)
- [ ] Les réponses expliquent les fonctions cognitives
- [ ] Les réponses posent des questions exploratoires

### 3. Tests de Style

- [ ] Pas de mysticisme ou ésotérisme
- [ ] Pas d'affirmations prémonitoires
- [ ] Pas de psychanalyse freudienne
- [ ] Ton scientifique mais accessible

---

## 📝 BATTERIES DE TESTS

### Test 1 : Rêves Typiques

**Question** : "Pourquoi j'ai rêvé que mes dents tombaient ?"

**Réponse attendue** :
- ✅ Mention des "rêves typiques"
- ✅ Statistique 77% des gens
- ✅ Rejet de l'interprétation prémonitoire
- ✅ Simulation de menaces
- ✅ Questions sur la vie éveillée

**Réponse à ÉVITER** :
- ❌ "C'est un symbole de mort"
- ❌ "Ton âme essaie de te parler"
- ❌ "Cela prédit un changement"

---

### Test 2 : Rêves Négatifs

**Question** : "Mes rêves sont toujours si négatifs, c'est normal ?"

**Réponse attendue** :
- ✅ Statistique 82% des rêves négatifs
- ✅ Fonction adaptative expliquée
- ✅ Simulation de menaces
- ✅ Digestion émotionnelle
- ✅ Rassurant (normalisation)

**Réponse à ÉVITER** :
- ❌ "C'est inquiétant"
- ❌ "Tu as des énergies négatives"
- ❌ "Consulte un thérapeute immédiatement"

---

### Test 3 : Signification du Rêve

**Question** : "Est-ce que mon rêve veut me dire quelque chose ?"

**Réponse attendue** :
- ✅ Rejet de l'idée de "message codé"
- ✅ Explication du principe de continuité
- ✅ Statistique 65% lié à la veille
- ✅ Fonctions cognitives (digestion, simulation, créativité)
- ✅ Questions sur événements récents

**Réponse à ÉVITER** :
- ❌ "Oui, ton inconscient te parle"
- ❌ "C'est un message de l'univers"
- ❌ "Écoute ton intuition"

---

### Test 4 : Rêve de Vol

**Question** : "J'ai rêvé que je volais, qu'est-ce que ça veut dire ?"

**Réponse attendue** :
- ✅ Mention des "rêves typiques"
- ✅ Pas d'interprétation symbolique littérale
- ✅ Questions sur le contexte (émotion, vie éveillée)
- ✅ Explication du sommeil REM
- ✅ Possibles liens (créativité, sentiment de liberté)

**Réponse à ÉVITER** :
- ❌ "C'est un symbole de liberté spirituelle"
- ❌ "Tu cherches à t'élever"
- ❌ "C'est un signe de transcendance"

---

### Test 5 : Cauchemars

**Question** : "Comment arrêter mes cauchemars ?"

**Réponse attendue** :
- ✅ Fonction adaptative des cauchemars
- ✅ Exemple des étudiants (réduction anxiété)
- ✅ Questions sur stress/préoccupations
- ✅ Mention possible du rêve lucide
- ✅ Normalisation (pas alarmiste)

**Réponse à ÉVITER** :
- ❌ "Tu as un trauma à résoudre"
- ❌ "Protège ton espace avec des cristaux"
- ❌ "C'est ton inconscient qui souffre"

---

### Test 6 : Continuité avec la Vie Éveillée

**Question** : "J'ai rêvé de mon examen demain, c'est bizarre..."

**Réponse attendue** :
- ✅ Principe de continuité expliqué
- ✅ Statistique 65%
- ✅ Fonction de simulation de menaces
- ✅ Rôle adaptatif (réduction anxiété)
- ✅ Question sur le niveau de stress

**Réponse à ÉVITER** :
- ❌ "C'est un rêve prémonitoire"
- ❌ "Ton subconscient te prépare mystiquement"
- ❌ "Écoute les signaux de l'univers"

---

### Test 7 : Créativité

**Question** : "Est-ce que les rêves peuvent m'aider à être plus créatif ?"

**Réponse attendue** :
- ✅ Mention du sommeil REM
- ✅ Hyper-association d'idées
- ✅ Exemple des patients narcoleptiques (si pertinent)
- ✅ Formation d'associations non évidentes
- ✅ Lien avec créativité et innovation

**Réponse à ÉVITER** :
- ❌ "Les rêves sont la voix de la Muse"
- ❌ "Médite sur tes rêves pour l'inspiration"
- ❌ "L'univers t'envoie des idées"

---

### Test 8 : Personnages dans les Rêves

**Question** : "Pourquoi je rêve toujours de ma famille ?"

**Réponse attendue** :
- ✅ Structure typique des rêves (90% banals)
- ✅ Interactions sociales courantes
- ✅ Principe de continuité
- ✅ Questions sur relations récentes
- ✅ Traitement des émotions liées aux proches

**Réponse à ÉVITER** :
- ❌ "Ta famille représente ton passé"
- ❌ "C'est un symbole de sécurité"
- ❌ "Ton inconscient cherche l'amour"

---

## 🔍 MÉTHODE DE TEST

### Test via curl (Backend)

```bash
curl -X POST http://[server]/chat-text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Pourquoi j'ai rêvé que mes dents tombaient ?",
    "conversation_history": []
  }'
```

**Vérifier** :
- Status 200
- Réponse JSON bien formée
- Contenu de `reply` conforme aux attentes

---

### Test via App Mobile

1. Ouvre l'app Noctaliæ
2. Va dans l'écran de chat
3. Pose une question de test
4. Vérifie que la réponse :
   - Apparaît correctement
   - Est scientifique
   - Évite les pièges

---

## 📊 GRILLE D'ÉVALUATION

Pour chaque test, note la réponse selon ces critères :

| Critère | Score /5 | Notes |
|---------|----------|-------|
| Scientifique | | Basé sur neurosciences ? |
| Données chiffrées | | 65%, 82%, 77% mentionnés ? |
| Évite symbolisme | | Pas d'interprétations littérales ? |
| Bienveillant | | Ton rassurant ? |
| Questions posées | | Explore vie éveillée ? |
| **TOTAL** | **/25** | |

**Barème** :
- 20-25/25 : ✅ Excellent
- 15-19/25 : ⚠️ Bon mais à améliorer
- <15/25 : ❌ Réviser le prompt

---

## 🐛 PROBLÈMES COURANTS

### Problème 1 : Réponses trop poétiques

**Symptôme** : Utilisation de métaphores, ton mystique
**Cause** : L'ancien prompt est encore actif
**Solution** : Vérifier que le nouveau prompt est bien chargé et redémarrer le service

---

### Problème 2 : Pas de données chiffrées

**Symptôme** : Aucune mention de 65%, 82%, 77%
**Cause** : Prompt condensé trop court ou mal copié
**Solution** : Utiliser le prompt complet ou vérifier l'intégralité du texte

---

### Problème 3 : Interprétations symboliques

**Symptôme** : "Cela symbolise...", "ton âme..."
**Cause** : Le prompt n'insiste pas assez sur l'évitement du symbolisme
**Solution** : Ajouter plus d'exemples de ce qu'il faut éviter

---

### Problème 4 : Pas de questions exploratoires

**Symptôme** : Réponses sans questions
**Cause** : Format de réponse pas assez clair dans le prompt
**Solution** : Renforcer la section "FORMAT DE RÉPONSE"

---

## 📈 SUIVI DES TESTS

### Template de rapport

```markdown
## Rapport de Test - [Date]

### Configuration
- Version du prompt : Complet / Condensé
- Modèle testé : Claude / Llama
- Endpoint : [URL]

### Résultats

#### Test 1 : Rêves Typiques
- Question : "Pourquoi j'ai rêvé que mes dents tombaient ?"
- Réponse : [coller la réponse]
- Score : [X/25]
- ✅ Points forts : ...
- ⚠️ Points à améliorer : ...

#### Test 2 : Rêves Négatifs
[...]

### Conclusion Générale
- Score moyen : [X/25]
- Recommandation : ✅ Déployer / ⚠️ Ajuster / ❌ Réviser

### Prochaines étapes
- [ ] ...
```

---

## 🎉 VALIDATION FINALE

Le nouveau prompt est validé si :

- ✅ **7/8 tests** ont un score ≥ 20/25
- ✅ **Aucun test** n'a de score < 15/25
- ✅ **Aucune mention** de symbolisme littéral
- ✅ **Au moins 5 tests** mentionnent des données chiffrées
- ✅ **Toutes les réponses** posent des questions exploratoires

---

## 📞 BESOIN D'AIDE ?

Si les tests échouent :

1. **Relis le prompt** : Est-il bien copié en entier ?
2. **Vérifie le service** : A-t-il bien redémarré ?
3. **Consulte les logs** : Y a-t-il des erreurs ?
4. **Teste avec curl** : L'endpoint fonctionne-t-il ?
5. **Reviens vers Claude** : Fournis les résultats des tests

---

## 🏁 CONCLUSION

Ces tests garantissent que le nouveau prompt scientifique fonctionne comme prévu et respecte l'approche d'Isabelle Arnulf.

**Bon testing ! 🚀**
