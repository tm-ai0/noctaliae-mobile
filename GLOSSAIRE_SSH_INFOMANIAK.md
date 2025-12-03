# 📚 GLOSSAIRE COMMANDES SSH - Infomaniak

**Pour Thomas** | Dernière MàJ : 3 décembre 2025

---

## 🔗 ACCÈS CONSOLE SSH INFOMANIAK

1. **https://manager.infomaniak.com**
2. Menu gauche → **thomasmaury.fr** (hébergement principal)
3. **FTP / SSH**
4. **Console SSH web**

---

## 📁 NAVIGATION

| Commande | Description | Exemple |
|----------|-------------|---------|
| `cd` | Changer de dossier | `cd ~/sites/nocty.thomasmaury.fr` |
| `cd ..` | Remonter d'un niveau | `cd ..` |
| `cd ~` | Retour au home | `cd ~` |
| `pwd` | Afficher où je suis | `pwd` → `/home/uid280969/sites/...` |
| `ls` | Lister les fichiers | `ls` |
| `ls -la` | Liste détaillée (+ fichiers cachés) | `ls -la` |

### 🎯 Tes dossiers importants
```bash
cd ~/sites/nocty.thomasmaury.fr    # Landing page beta
cd ~/sites/api.thomasmaury.fr      # Backend API
```

---

## 📄 CRÉER / ÉCRIRE UN FICHIER

### `cat > fichier << 'ENDOFFILE'` - Créer un fichier complet
```bash
cat > index.html << 'ENDOFFILE'
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>Hello World</body>
</html>
ENDOFFILE
```
**⚠️ IMPORTANT** : Tout ce qui est entre `<< 'ENDOFFILE'` et `ENDOFFILE` sera écrit dans le fichier.

### `echo` - Écrire une ligne
```bash
echo "Hello World" > fichier.txt      # Écrase le fichier
echo "Nouvelle ligne" >> fichier.txt  # Ajoute à la fin
```

---

## ✏️ MODIFIER UN FICHIER

### `sed` - Rechercher/Remplacer (le plus utilisé !)

**Syntaxe de base :**
```bash
sed -i 's/ancien texte/nouveau texte/g' fichier.html
```

| Élément | Signification |
|---------|---------------|
| `-i` | Modifier le fichier directement (in-place) |
| `s/` | Substitution (remplacer) |
| `/g` | Global (toutes les occurrences, pas juste la 1ère) |

**Exemples concrets :**
```bash
# Remplacer un mot
sed -i 's/Premium/Soutien/g' index.html

# Remplacer une phrase
sed -i 's/ancien texte complet/nouveau texte complet/g' index.html

# Avec des caractères spéciaux (échapper avec \)
sed -i 's/<span>old<\/span>/<span>new<\/span>/g' index.html

# Remplacer une URL
sed -i 's/https:\/\/old-url.com/https:\/\/new-url.com/g' index.html
```

**⚠️ Caractères à échapper avec `\` :**
- `/` → `\/`
- `<` → `<` (pas besoin)
- `>` → `>` (pas besoin)
- `&` → `\&`

---

## 🔍 RECHERCHER

### `grep` - Chercher du texte dans un fichier
```bash
grep "mot recherché" fichier.html           # Cherche exact
grep -i "mot" fichier.html                   # Ignore majuscules/minuscules
grep -n "mot" fichier.html                   # Affiche numéro de ligne
```

### Combiner plusieurs recherches
```bash
grep -i "mot1" fichier.html && grep -i "mot2" fichier.html
```

---

## 📋 VOIR LE CONTENU

### `cat` - Afficher tout le fichier
```bash
cat index.html
```

### `head` / `tail` - Début / Fin du fichier
```bash
head -20 index.html    # 20 premières lignes
tail -20 index.html    # 20 dernières lignes
```

### `less` - Naviguer dans un fichier (q pour quitter)
```bash
less index.html
```

---

## 📦 COPIER / DÉPLACER / SUPPRIMER

| Commande | Description | Exemple |
|----------|-------------|---------|
| `cp` | Copier | `cp index.html index.backup.html` |
| `mv` | Déplacer / Renommer | `mv old.html new.html` |
| `rm` | Supprimer | `rm fichier.html` |
| `rm -r` | Supprimer dossier | `rm -r dossier/` |

### ⚠️ TOUJOURS FAIRE UN BACKUP AVANT !
```bash
cp index.html index.html.backup-$(date +%Y%m%d)
```

---

## 🔄 PM2 - Gestion du serveur Node.js (Backend API)

```bash
cd ~/sites/api.thomasmaury.fr

pm2 list                    # Voir les apps qui tournent
pm2 restart all             # Redémarrer tout
pm2 restart api.thomasmaury.fr   # Redémarrer l'API
pm2 logs                    # Voir les logs en temps réel
pm2 logs --lines 50         # 50 dernières lignes de logs
```

---

## 🧪 EXEMPLES PRATIQUES NOCTALIÆ

### Mettre à jour le lien APK dans la landing
```bash
cd ~/sites/nocty.thomasmaury.fr
sed -i 's/ANCIEN-BUILD-ID/NOUVEAU-BUILD-ID/g' index.html
```

### Corriger un texte sur la landing
```bash
cd ~/sites/nocty.thomasmaury.fr
sed -i 's/texte erroné/texte corrigé/g' index.html
grep "texte corrigé" index.html   # Vérifier
```

### Voir la version actuelle du backend
```bash
cd ~/sites/api.thomasmaury.fr
grep "version" package.json
```

### Redémarrer le backend après modification
```bash
cd ~/sites/api.thomasmaury.fr
pm2 restart api.thomasmaury.fr
pm2 logs --lines 20
```

---

## 🚨 COMMANDES DANGEREUSES - ATTENTION !

```bash
# ⚠️ NE JAMAIS FAIRE sans être sûr :
rm -rf /              # Supprime TOUT
rm -r dossier/        # Supprime un dossier entier

# ✅ TOUJOURS FAIRE AVANT :
ls -la                # Vérifier où tu es
pwd                   # Confirmer le chemin
cp fichier fichier.backup   # Backup !
```

---

## 💡 ASTUCES

1. **Flèche haut ↑** : Rappeler la dernière commande
2. **Tab** : Auto-complétion des noms de fichiers
3. **Ctrl+C** : Annuler une commande en cours
4. **Ctrl+L** : Effacer l'écran (ou taper `clear`)
5. **`history`** : Voir l'historique des commandes

---

## 📝 TEMPLATE - Mise à jour landing page

```bash
# 1. Aller dans le dossier
cd ~/sites/nocty.thomasmaury.fr

# 2. Backup
cp index.html index.html.backup

# 3. Modifier
sed -i 's/ancien/nouveau/g' index.html

# 4. Vérifier
grep "nouveau" index.html

# 5. Tester sur https://nocty.thomasmaury.fr (Ctrl+F5)
```

---

*Créé avec 🦚 par Claude pour Thomas*
