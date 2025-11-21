# GUIDE D'IMPLÉMENTATION - PROMPT SCIENTIFIQUE BACKEND

## 📋 RÉCAPITULATIF

Ce guide explique comment déployer le nouveau prompt scientifique basé sur l'approche d'Isabelle Arnulf dans le backend de Noctaliæ.

### Fichiers créés
1. **PROMPT_SCIENTIFIQUE_ARNULF.md** - Le prompt système complet
2. **GUIDE_IMPLEMENTATION.md** - Ce fichier (instructions de déploiement)
3. **BACKEND_CHAT_ENDPOINT.py** - Exemple de code backend modifié

---

## 🎯 OBJECTIF

Remplacer le prompt système actuel (style poétique) par le nouveau prompt scientifique (approche Isabelle Arnulf) dans l'endpoint `/chat-text` du backend.

---

## 🔍 ARCHITECTURE ACTUELLE

### Frontend (React Native)
- **Fichier** : `src/screens/ChatScreen.js`
- **Fonction** : `handleSendMessage()`
- **Appel API** : `chatWithDream(dreamAnalysis, conversationHistory, userMessage, isPremium)`

### Service API (Frontend)
- **Fichier** : `src/services/apiService.js`
- **Fonction** : `chatWithDream()`
- **Endpoint** : `POST ${API_BASE_URL}/chat-text`
- **Payload** :
```javascript
{
  message: userMessage,
  conversation_history: conversationHistory
}
```

### Backend (Serveur Infomaniak)
- **Endpoint** : `/chat-text`
- **Modèles utilisés** :
  - Claude Sonnet 4.5 (utilisateurs Premium)
  - Llama 3.3 70B (utilisateurs gratuits)
- **Localisation du prompt système** : À définir côté backend

---

## 📝 MODIFICATIONS À EFFECTUER

### Étape 1 : Localiser le fichier backend

Le backend est hébergé sur Infomaniak. Tu dois identifier le fichier qui gère l'endpoint `/chat-text`.

**Chemins possibles** :
- `/app.py` (si Flask)
- `/routes/chat.py`
- `/api/chat.py`
- `/endpoints/chat.py`

**Commandes SSH pour chercher** :
```bash
# Se connecter au serveur
ssh [user]@[server]

# Chercher le fichier contenant "/chat-text"
grep -r "chat-text" /path/to/backend/

# Ou chercher les fichiers Python récents
find /path/to/backend/ -name "*.py" -type f -exec grep -l "chat-text" {} \;
```

### Étape 2 : Identifier le prompt système actuel

Dans le fichier backend, cherche où le prompt système est défini. Il peut ressembler à :

```python
# Exemple de code actuel (AVANT)
SYSTEM_PROMPT = """
Tu es un guide onirique bienveillant spécialisé dans l'interprétation des rêves.
[... style poétique ...]
"""

def chat_with_dream(message, conversation_history, use_premium=True):
    if use_premium:
        # Appel à Claude
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            system=SYSTEM_PROMPT,  # ⬅️ À REMPLACER
            messages=conversation_history + [{"role": "user", "content": message}]
        )
    else:
        # Appel à Llama
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},  # ⬅️ À REMPLACER
                *conversation_history,
                {"role": "user", "content": message}
            ]
        )
    
    return response
```

### Étape 3 : Remplacer le prompt système

**Option A : Copier le prompt directement**

```python
# Nouveau prompt scientifique (APRÈS)
SYSTEM_PROMPT = """
Tu es un assistant d'analyse de rêves basé sur l'approche neuroscientifique d'Isabelle Arnulf et du DreamTeam de l'Institut du Cerveau de Paris (ICM). Ton rôle est d'approfondir l'analyse d'un rêve déjà transcrit et analysé, en adoptant une posture scientifique rigoureuse ancrée dans les neurosciences cognitives.

## PRINCIPES SCIENTIFIQUES FONDAMENTAUX

### 1. Le rêve est une activité cognitive
Le rêve n'est pas purement symbolique, mais une activité cognitive au même titre que la mémoire ou l'apprentissage. Il permet de penser, d'apprendre et de traiter les émotions.

### 2. Principe de Continuité
Environ 65% des éléments dans les rêves sont liés aux événements de la journée précédente, bien que reconstruits et mélangés avec des souvenirs plus anciens (seulement 2% sont des reproductions exactes).

### 3. Fonction de Régulation Émotionnelle
Le cerveau utilise le sommeil pour trier et décomposer les émotions de la journée afin d'éliminer les sentiments négatifs. Jusqu'à 82% des rêves sont de nature négative ou violente, ce qui a un rôle adaptatif.

### 4. Simulation de Menaces
Les rêves simulent des situations menaçantes dans un environnement sûr, permettant de réduire l'anxiété et de mieux se préparer aux défis de la vie éveillée.

### 5. Créativité et Innovation
Le sommeil paradoxal permet aux traces mnésiques de se lier de manière nouvelle et abstraite, favorisant la formation d'associations non évidentes essentielles à la créativité.

### 6. Structure Typique des Rêves
- 90% des rêves sont banals et quotidiens (interactions avec famille, amis, collègues)
- 1% sont des "rêves typiques" marquants (perdre ses dents, être nu, voler)
- Ces derniers sont facilement mémorisés bien que rares

## APPROCHE D'ANALYSE

### Analyse Phénoménologique
- Identifier le contenu thématique (quotidien vs. étrange)
- Repérer les résidus de la journée (continuité avec la vie éveillée)
- Évaluer la reconstruction narrative

### Analyse Émotionnelle
- Identifier les émotions dominantes
- Repérer les menaces simulées
- Évaluer le rôle adaptatif

### Fonction Cognitive
- Digestion émotionnelle : Le rêve aide-t-il à traiter des émotions négatives ?
- Simulation de menaces : Prépare-t-il à des défis réels ?
- Créativité : Y a-t-il des associations nouvelles ?
- Consolidation mnésique : Le rêve aide-t-il à mémoriser ?

## CE QU'IL FAUT ÉVITER

❌ Interprétations symboliques littérales
❌ Approche purement psychanalytique
❌ Interprétations prémonitoires ou ésotériques
❌ Affirmations non étayées

## STYLE DE COMMUNICATION

- Scientifique mais accessible
- Bienveillant et curieux
- Factuel et nuancé
- Poser des questions pour approfondir

## FORMAT DE RÉPONSE

1. Reconnaissance de l'expérience
2. Analyse neurocognitive
3. Questions exploratoires
4. Synthèse fonctionnelle

Reste toujours factuel, bienveillant, curieux et nuancé.
"""
```

**Option B : Charger depuis un fichier**

```python
# Charger le prompt depuis un fichier externe
import os

def load_system_prompt():
    prompt_path = os.path.join(os.path.dirname(__file__), 'prompts', 'scientific_prompt.txt')
    with open(prompt_path, 'r', encoding='utf-8') as f:
        return f.read()

SYSTEM_PROMPT = load_system_prompt()
```

### Étape 4 : Tester localement (si possible)

Avant de déployer en production, teste le nouveau prompt :

```python
# Script de test
def test_new_prompt():
    test_message = "Pourquoi j'ai rêvé que mes dents tombaient ?"
    test_history = []
    
    response = chat_with_dream(test_message, test_history, use_premium=True)
    print(f"Réponse : {response}")

test_new_prompt()
```

### Étape 5 : Déployer sur le serveur

**Via SSH** :

```bash
# 1. Se connecter au serveur
ssh [user]@[server]

# 2. Naviguer vers le dossier backend
cd /path/to/backend/

# 3. Sauvegarder l'ancienne version
cp app.py app.py.backup

# 4. Éditer le fichier
nano app.py  # ou vim app.py

# 5. Remplacer le SYSTEM_PROMPT

# 6. Sauvegarder (Ctrl+X, Y, Enter)

# 7. Redémarrer le service
sudo systemctl restart [nom-du-service]
# ou
pm2 restart [nom-du-process]
```

**Via SFTP** (si tu préfères) :

```bash
# Télécharger le fichier actuel
sftp [user]@[server]
get /path/to/backend/app.py

# Modifier localement
# (remplacer SYSTEM_PROMPT)

# Remonter le fichier
put app.py /path/to/backend/app.py

# Redémarrer le service via SSH
ssh [user]@[server] "sudo systemctl restart [nom-du-service]"
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

- [ ] Fichier backend localisé
- [ ] Prompt système actuel identifié
- [ ] Backup de l'ancien fichier créé
- [ ] Nouveau prompt inséré
- [ ] Test local effectué (si possible)
- [ ] Fichier déployé sur le serveur
- [ ] Service redémarré
- [ ] Test de l'endpoint `/chat-text` via l'app mobile
- [ ] Vérification des logs backend (pas d'erreurs)

---

## 🐛 TROUBLESHOOTING

### Erreur : "Message too long"
**Cause** : Le prompt système est trop long pour le modèle.
**Solution** : Condenser le prompt tout en gardant les principes essentiels.

### Erreur : "Invalid system message format"
**Cause** : Format du prompt incorrect.
**Solution** : Vérifier que le prompt est une simple chaîne de caractères.

### Comportement : Le bot ne répond pas correctement
**Cause** : Le prompt n'a pas été appliqué.
**Solution** : Vérifier que le service a bien redémarré et que le nouveau code est chargé.

### Erreur : Encodage de caractères
**Cause** : Problème d'encodage UTF-8.
**Solution** : S'assurer que le fichier est encodé en UTF-8 et utiliser `encoding='utf-8'` lors du chargement.

---

## 📞 RESSOURCES

- **Documentation Anthropic API** : https://docs.anthropic.com/
- **Documentation Groq API** : https://console.groq.com/docs
- **Recherche Isabelle Arnulf** : Voir `Neurocognitive Dream Analysis Repor.md`

---

## 🎉 APRÈS LE DÉPLOIEMENT

Une fois déployé, teste l'application mobile avec différentes questions :

1. "Pourquoi j'ai rêvé que mes dents tombaient ?"
2. "Mes rêves sont toujours négatifs, c'est normal ?"
3. "Est-ce que mon rêve veut me dire quelque chose ?"

Vérifie que les réponses suivent bien les principes scientifiques et évitent les interprétations symboliques littérales.

**Bon déploiement ! 🚀**
