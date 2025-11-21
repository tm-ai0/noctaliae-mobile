# ⚡ QUICK START - DÉPLOIEMENT EXPRESS

**Temps estimé : 15-20 minutes**

Ce guide te permet de déployer le nouveau prompt scientifique le plus rapidement possible.

---

## 📦 CE QUI A ÉTÉ PRÉPARÉ POUR TOI

✅ Prompt scientifique complet basé sur Isabelle Arnulf
✅ Guide d'implémentation détaillé
✅ Exemple de code backend
✅ Batterie de tests
✅ Documentation comparative

---

## 🎯 OBJECTIF

Remplacer le prompt poétique actuel par le prompt scientifique dans l'endpoint `/chat-text` du backend.

---

## 🚀 DÉMARRAGE RAPIDE (5 ÉTAPES)

### Étape 1 : Prépare-toi (2 min)

**Ouvre ces fichiers** :
1. `E:\Dream app\PROMPT_SCIENTIFIQUE_ARNULF.md` (pour copier le prompt)
2. `E:\Dream app\GUIDE_IMPLEMENTATION.md` (pour référence)

**Récupère** :
- Ton accès SSH (user@server)
- Ton mot de passe ou clé SSH

---

### Étape 2 : Localise le backend (3 min)

**Connecte-toi au serveur** :
```bash
ssh [user]@[server]
```

**Cherche le fichier** :
```bash
# Option 1 : Chercher "chat-text"
grep -r "chat-text" /path/to/backend/

# Option 2 : Chercher les fichiers Python
find /path/to/backend/ -name "*.py" -type f -exec grep -l "chat-text" {} \;
```

**Tu cherches un fichier contenant** :
- Endpoint `/chat-text`
- Variable `SYSTEM_PROMPT` ou similaire
- Appels à Claude ou Llama

---

### Étape 3 : Backup et modifie (5 min)

**Fais un backup** :
```bash
cd /path/to/backend/
cp app.py app.py.backup
```

**Édite le fichier** :
```bash
nano app.py  # ou vim app.py
```

**Trouve la ligne du style** :
```python
SYSTEM_PROMPT = """
Tu es un guide onirique...
"""
```

**Remplace par** (copie depuis `PROMPT_SCIENTIFIQUE_ARNULF.md`) :
```python
SYSTEM_PROMPT = """
Tu es un assistant d'analyse de rêves basé sur l'approche neuroscientifique d'Isabelle Arnulf...
[Copie le contenu complet du fichier PROMPT_SCIENTIFIQUE_ARNULF.md]
"""
```

**Sauvegarde** :
- Nano : `Ctrl+X`, puis `Y`, puis `Enter`
- Vim : `Esc`, puis `:wq`

---

### Étape 4 : Redémarre le service (2 min)

**Redémarre** :
```bash
# Option 1 : systemd
sudo systemctl restart [nom-du-service]

# Option 2 : pm2
pm2 restart [nom-du-process]

# Option 3 : Docker
docker restart [nom-du-container]
```

**Vérifie les logs** :
```bash
# systemd
sudo journalctl -u [nom-du-service] -f

# pm2
pm2 logs [nom-du-process]

# Docker
docker logs -f [nom-du-container]
```

**Tu ne dois voir AUCUNE erreur.**

---

### Étape 5 : Teste (3 min)

**Test 1 : Via curl**
```bash
curl -X POST http://[server]/chat-text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Pourquoi j'ai rêvé que mes dents tombaient ?",
    "conversation_history": []
  }'
```

**Vérifie que la réponse** :
- ✅ Mentionne les "rêves typiques"
- ✅ Dit "77% des gens"
- ✅ Évite "C'est un symbole de..."
- ✅ Pose des questions

**Test 2 : Via l'app mobile**

1. Ouvre Noctaliæ
2. Va dans le chat
3. Pose : "Mes rêves sont toujours si négatifs"
4. Vérifie que la réponse mentionne "82%" et "fonction adaptative"

---

## ✅ CHECKLIST EXPRESS

- [ ] Connexion SSH OK
- [ ] Fichier backend trouvé
- [ ] Backup créé
- [ ] Prompt remplacé
- [ ] Service redémarré
- [ ] Logs sans erreur
- [ ] Test curl OK
- [ ] Test app mobile OK

---

## 🆘 PROBLÈMES COURANTS

### "Je ne trouve pas le fichier backend"

**Solution** :
```bash
# Cherche tous les fichiers Python
find /var/www/ -name "*.py" -type f

# Cherche le mot "anthropic" ou "groq"
grep -r "anthropic" /var/www/
grep -r "groq" /var/www/
```

### "Le service ne redémarre pas"

**Solution** :
```bash
# Vérifie le nom du service
systemctl list-units --type=service | grep -i dream
systemctl list-units --type=service | grep -i noctalia

# Vérifie les processus pm2
pm2 list
```

### "Erreur 500 après le redémarrage"

**Solution** :
```bash
# Regarde les logs détaillés
tail -f /var/log/[service].log

# Vérifie la syntaxe Python
python3 -m py_compile app.py
```

### "La réponse est toujours poétique"

**Solution** :
1. Vérifie que le service a vraiment redémarré
2. Vérifie que le nouveau code est chargé (pas de cache)
3. Teste avec `curl` directement sur le serveur

---

## 🔄 ROLLBACK (SI PROBLÈME)

**Si quelque chose ne va pas** :

```bash
# Restaurer l'ancien fichier
cd /path/to/backend/
cp app.py.backup app.py

# Redémarrer
sudo systemctl restart [nom-du-service]
```

---

## 📊 APRÈS LE DÉPLOIEMENT

**Dans les 24h qui suivent** :

1. **Surveille les logs** : Pas d'erreurs ?
2. **Teste différentes questions** : Les réponses sont bonnes ?
3. **Demande des retours** : Les utilisateurs sont satisfaits ?

**Tests additionnels** : Voir `TESTS_PROMPT_SCIENTIFIQUE.md`

---

## 📚 BESOIN DE PLUS DE DÉTAILS ?

**Lis dans l'ordre** :

1. `RECAPITULATIF_DEPLOYMENT.md` - Vue d'ensemble
2. `GUIDE_IMPLEMENTATION.md` - Instructions complètes
3. `COMPARAISON_ANCIEN_NOUVEAU.md` - Comprendre le changement
4. `TESTS_PROMPT_SCIENTIFIQUE.md` - Tester en profondeur

---

## 🎉 C'EST FAIT !

Si tous les tests sont verts, **félicitations ! 🚀**

Le nouveau prompt scientifique est déployé et fonctionnel.

---

## 📞 BESOIN D'AIDE ?

Si tu es bloqué, reviens vers Claude avec :

1. **Ton architecture backend** (Flask ? FastAPI ? Node ?)
2. **Le fichier que tu as modifié** (copie-colle)
3. **Les erreurs dans les logs** (si erreurs)
4. **Les résultats des tests** (réponses reçues)

Je t'aiderai à débugger ! 💪
