# 📋 RÉCAPITULATIF COMPLET - DÉPLOIEMENT PROMPT SCIENTIFIQUE NOCTALIÆ

## 🎯 OBJECTIF DU PROJET

Remplacer le prompt système actuel (style poétique) de l'app mobile Noctaliæ par un nouveau prompt basé sur l'approche neuroscientifique d'Isabelle Arnulf (DreamTeam, Institut du Cerveau de Paris).

---

## 📁 FICHIERS CRÉÉS

### 1. **PROMPT_SCIENTIFIQUE_ARNULF.md**
- **Contenu** : Prompt système complet avec tous les principes scientifiques
- **Usage** : Documentation et référence
- **Emplacement** : `E:\Dream app\PROMPT_SCIENTIFIQUE_ARNULF.md`

### 2. **GUIDE_IMPLEMENTATION.md**
- **Contenu** : Instructions détaillées pour le déploiement
- **Usage** : Guide pas-à-pas pour modifier le backend
- **Emplacement** : `E:\Dream app\GUIDE_IMPLEMENTATION.md`

### 3. **BACKEND_CHAT_ENDPOINT.py**
- **Contenu** : Exemple de code backend Flask avec le nouveau prompt
- **Usage** : Référence pour adapter ton backend existant
- **Emplacement** : `E:\Dream app\BACKEND_CHAT_ENDPOINT.py`

### 4. **RECAPITULATIF_DEPLOYMENT.md** (ce fichier)
- **Contenu** : Vue d'ensemble du projet et prochaines étapes
- **Usage** : Point de départ pour le déploiement
- **Emplacement** : `E:\Dream app\RECAPITULATIF_DEPLOYMENT.md`

---

## 🧠 PRINCIPES SCIENTIFIQUES CLÉS

Le nouveau prompt est basé sur 6 principes fondamentaux :

1. **Le rêve est une activité cognitive** (non purement symbolique)
2. **Principe de Continuité** (65% du contenu lié à la veille)
3. **Régulation Émotionnelle** (82% des rêves sont négatifs, c'est adaptatif)
4. **Simulation de Menaces** (préparation mentale aux défis)
5. **Créativité et Innovation** (associations nouvelles d'idées)
6. **Structure Typique** (90% banals, 1% marquants)

### Pièges à Éviter

❌ Interprétations symboliques littérales (ex: "dents = mort")
❌ Approche psychanalytique freudienne
❌ Interprétations prémonitoires
❌ Affirmations non étayées

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Frontend (React Native)
```
📱 App Mobile (Noctaliæ)
  └── src/screens/ChatScreen.js
      └── handleSendMessage()
          └── chatWithDream() (src/services/apiService.js)
              └── POST ${API_BASE_URL}/chat-text
```

### Backend (Serveur Infomaniak)
```
🖥️ Serveur Backend
  └── Endpoint: /chat-text
      ├── Claude Sonnet 4.5 (Premium)
      └── Llama 3.3 70B (Gratuit)
```

**Payload API** :
```javascript
{
  "message": "Question de l'utilisateur",
  "conversation_history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

**Réponse API** :
```javascript
{
  "reply": "Réponse de l'IA",
  "model": "claude" | "llama"
}
```

---

## 🚀 PLAN D'ACTION

### Étape 1 : Préparer l'accès au backend ✅

- [x] Récupérer les credentials SSH
- [x] Noter l'adresse du serveur Infomaniak
- [x] Tester la connexion SSH

**Commande** :
```bash
ssh [user]@[server]
```

### Étape 2 : Localiser le fichier backend

**Objectif** : Trouver le fichier qui gère l'endpoint `/chat-text`

**Commandes SSH** :
```bash
# Chercher le fichier contenant "chat-text"
grep -r "chat-text" /path/to/backend/

# Ou chercher tous les fichiers Python
find /path/to/backend/ -name "*.py" -type f -exec grep -l "chat-text" {} \;
```

**Fichiers possibles** :
- `app.py`
- `routes/chat.py`
- `api/chat.py`
- `endpoints/chat.py`

### Étape 3 : Backup et modification

**3.1 Créer un backup**
```bash
cd /path/to/backend/
cp app.py app.py.backup
```

**3.2 Identifier le prompt actuel**

Cherche une variable comme :
```python
SYSTEM_PROMPT = """
Tu es un guide onirique...
"""
```

**3.3 Remplacer par le nouveau prompt**

Copie le contenu de `PROMPT_SCIENTIFIQUE_ARNULF.md` ou utilise le code dans `BACKEND_CHAT_ENDPOINT.py` comme référence.

### Étape 4 : Déployer et tester

**4.1 Redémarrer le service**
```bash
sudo systemctl restart [nom-du-service]
# ou
pm2 restart [nom-du-process]
```

**4.2 Tester l'endpoint**
```bash
curl -X POST http://[server]/chat-text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Pourquoi j'ai rêvé que mes dents tombaient ?",
    "conversation_history": []
  }'
```

**4.3 Vérifier les logs**
```bash
tail -f /var/log/[nom-du-service].log
```

**4.4 Tester depuis l'app mobile**

Lance l'app et pose différentes questions :
- "Pourquoi j'ai rêvé que mes dents tombaient ?"
- "Mes rêves sont toujours négatifs, c'est normal ?"
- "Est-ce que mon rêve veut me dire quelque chose ?"

Vérifie que les réponses suivent bien l'approche scientifique.

---

## 📊 COMPARAISON ANCIEN vs. NOUVEAU

### Ancien Prompt (Poétique)
```
🎭 Style : Poétique, mystique
🔮 Approche : Symbolique, interprétative
💭 Ton : Onirique, métaphorique
```

**Exemple de réponse** :
> "Ah, les dents qui tombent... Un symbole puissant de transformation et de perte de contrôle. Ton subconscient t'invite à explorer tes peurs profondes..."

### Nouveau Prompt (Scientifique)
```
🧠 Style : Scientifique, factuel
🔬 Approche : Neurocognitive, basée sur la recherche
💡 Ton : Bienveillant, curieux, nuancé
```

**Exemple de réponse** :
> "Le rêve de perdre ses dents fait partie des 'rêves typiques' que 77% des gens ont déjà vécus. Dans l'approche neuroscientifique, ce n'est pas un symbole prémonitoire, mais plutôt un scénario de menace que le cerveau simule. As-tu vécu récemment une situation où tu te sentais vulnérable ?"

---

## 🎓 SOURCES SCIENTIFIQUES

Tout le prompt est basé sur la recherche d'Isabelle Arnulf et du DreamTeam (ICM) :

**Fichier de référence** :
- `Neurocognitive Dream Analysis Repor.md` (dans `E:\Dream app\Research Blocs\`)

**Principes clés extraits** :
- Continuité avec la vie éveillée
- Régulation émotionnelle pendant le sommeil REM
- Simulation de menaces pour l'adaptation
- Créativité via hyper-association
- Rejet de l'approche symbolique/psychanalytique

---

## ✅ CHECKLIST FINALE

### Avant le déploiement
- [ ] Lire le `GUIDE_IMPLEMENTATION.md`
- [ ] Comprendre l'architecture actuelle
- [ ] Avoir les accès SSH au serveur
- [ ] Créer un backup du fichier backend

### Pendant le déploiement
- [ ] Localiser le fichier backend
- [ ] Identifier le prompt système actuel
- [ ] Remplacer par le nouveau prompt
- [ ] Redémarrer le service
- [ ] Vérifier les logs (pas d'erreurs)

### Après le déploiement
- [ ] Tester l'endpoint avec curl
- [ ] Tester depuis l'app mobile
- [ ] Vérifier plusieurs types de questions
- [ ] Confirmer que les réponses sont scientifiques
- [ ] Monitorer les logs pendant 24h

---

## 🐛 TROUBLESHOOTING RAPIDE

### Erreur : "Message too long"
**Solution** : Condenser le prompt (garder l'essentiel)

### Erreur : "Invalid system message format"
**Solution** : Vérifier que le prompt est une simple string

### Le bot ne répond pas correctement
**Solution** : Vérifier que le service a bien redémarré

### Erreur d'encodage
**Solution** : S'assurer que le fichier est en UTF-8

---

## 📞 RESSOURCES SUPPLÉMENTAIRES

### Documentation API
- **Anthropic (Claude)** : https://docs.anthropic.com/
- **Groq (Llama)** : https://console.groq.com/docs

### Recherche Scientifique
- **Fichier local** : `E:\Dream app\Research Blocs\Neurocognitive Dream Analysis Repor.md`
- **Isabelle Arnulf** : Institut du Cerveau (ICM), Paris

### Fichiers du Projet
```
E:\Dream app\
├── PROMPT_SCIENTIFIQUE_ARNULF.md         (Prompt complet)
├── GUIDE_IMPLEMENTATION.md                (Instructions détaillées)
├── BACKEND_CHAT_ENDPOINT.py               (Exemple de code)
├── RECAPITULATIF_DEPLOYMENT.md            (Ce fichier)
└── Research Blocs\
    └── Neurocognitive Dream Analysis Repor.md
```

---

## 🎉 CONCLUSION

Tu as maintenant tout ce qu'il faut pour déployer le nouveau prompt scientifique !

**Prochaines étapes** :
1. Lire le `GUIDE_IMPLEMENTATION.md` en détail
2. Te connecter au serveur backend via SSH
3. Localiser et modifier le fichier backend
4. Tester et déployer

**Bonne chance pour le déploiement ! 🚀**

Si tu as des questions ou besoin d'aide, n'hésite pas à revenir vers moi avec les détails de ton backend (structure, framework utilisé, etc.) pour que je puisse t'aider à adapter le code.
