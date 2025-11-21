# 🔐 GUIDE D'ACCÈS SSH - INFOMANIAK

## 🎯 OBJECTIF

Se connecter en SSH au serveur Infomaniak pour déployer le nouveau prompt scientifique.

---

## 📋 INFORMATIONS NÉCESSAIRES

### 1. Trouver vos identifiants SSH

**Via le Manager Infomaniak** :

1. Allez sur : https://manager.infomaniak.com
2. Connectez-vous avec votre compte
3. Menu : **"Hébergement Web"**
4. Sélectionnez votre site (api.thomasmaury.fr)
5. Section : **"FTP & SSH"** ou **"Accès"**

Notez ces informations :
```
Hôte SSH : ssh.cluster0XX.hosting.ovh.net
Port : 22 (par défaut)
Nom d'utilisateur : thomasmaury (ou u123456, etc.)
Mot de passe : [votre mot de passe]
```

---

## 🔑 MÉTHODES DE CONNEXION

### Méthode 1 : Git Bash (Recommandé pour Windows)

**Installer Git Bash** (si pas déjà fait) :
- Télécharger : https://git-scm.com/download/win
- Installer avec les options par défaut

**Se connecter** :
```bash
# Ouvrir Git Bash
# Taper cette commande :
ssh nomutilisateur@ssh.clusterXXX.hosting.ovh.net

# Exemple :
ssh thomasmaury@ssh.cluster029.hosting.ovh.net

# Entrer votre mot de passe quand demandé
```

---

### Méthode 2 : PowerShell (Windows 10/11)

```powershell
# Ouvrir PowerShell
# Taper cette commande :
ssh nomutilisateur@ssh.clusterXXX.hosting.ovh.net

# Entrer votre mot de passe quand demandé
```

---

### Méthode 3 : Terminal Web Infomaniak (Le plus simple)

1. Manager Infomaniak → Hébergement Web
2. Votre site → **"Terminal SSH"** ou **"Console"**
3. Cliquer sur **"Ouvrir le terminal"**
4. Vous êtes connecté automatiquement ! 🎉

**Avantages** :
- ✅ Pas besoin d'installer quoi que ce soit
- ✅ Connexion automatique
- ✅ Interface web moderne

**Inconvénients** :
- ⚠️ Pas de copier-coller facile parfois
- ⚠️ Session peut expirer

---

### Méthode 4 : PuTTY (Alternative Windows)

**Installer PuTTY** :
- Télécharger : https://www.putty.org/
- Installer

**Configurer PuTTY** :
1. Ouvrir PuTTY
2. Host Name : `ssh.clusterXXX.hosting.ovh.net`
3. Port : `22`
4. Connection type : `SSH`
5. Cliquer **"Open"**
6. Entrer votre nom d'utilisateur
7. Entrer votre mot de passe

---

## 🧪 TEST DE CONNEXION

Une fois connecté, testez que vous êtes au bon endroit :

```bash
# Afficher le répertoire actuel
pwd
# Attendu : /home/thomasmaury ou similaire

# Naviguer vers le backend
cd /srv/customer/sites/api.thomasmaury.fr

# Lister les fichiers
ls -lh
# Attendu : Vous devriez voir index.js, package.json, etc.
```

✅ **Si vous voyez ces fichiers, vous êtes au bon endroit !**

---

## 🔐 UTILISER UNE CLÉ SSH (Optionnel mais recommandé)

### Avantages
- ✅ Pas besoin de taper le mot de passe à chaque fois
- ✅ Plus sécurisé
- ✅ Nécessaire pour certains scripts automatisés

### Générer une clé SSH

**Sur Windows (Git Bash ou PowerShell)** :
```bash
# Générer une nouvelle clé SSH
ssh-keygen -t rsa -b 4096 -C "votre.email@example.com"

# Appuyez sur Entrée pour accepter l'emplacement par défaut
# Entrez un mot de passe (optionnel)
# Entrez à nouveau le mot de passe

# Afficher la clé publique
cat ~/.ssh/id_rsa.pub
```

### Ajouter la clé sur Infomaniak

1. Manager Infomaniak → Hébergement Web
2. Section **"FTP & SSH"** → **"Clés SSH"**
3. Cliquer **"Ajouter une clé SSH"**
4. Coller le contenu de `id_rsa.pub`
5. Donner un nom : "Mon PC Windows"
6. Sauvegarder

### Tester la connexion avec clé

```bash
ssh -i ~/.ssh/id_rsa nomutilisateur@ssh.clusterXXX.hosting.ovh.net
# Ne demande plus de mot de passe ! 🎉
```

---

## 🛠️ COMMANDES UTILES SSH

### Navigation
```bash
pwd                    # Afficher le répertoire actuel
ls                     # Lister les fichiers
ls -lh                 # Lister avec détails lisibles
cd /path/to/dir        # Changer de répertoire
cd ..                  # Remonter d'un niveau
cd ~                   # Aller au répertoire home
```

### Manipulation de fichiers
```bash
cat fichier.txt        # Afficher le contenu d'un fichier
head -20 fichier.txt   # Afficher les 20 premières lignes
tail -20 fichier.txt   # Afficher les 20 dernières lignes
nano fichier.txt       # Éditer un fichier
cp fichier.txt backup.txt  # Copier un fichier
mv old.txt new.txt     # Renommer/déplacer un fichier
rm fichier.txt         # Supprimer un fichier (attention !)
```

### Recherche
```bash
grep "texte" fichier.txt       # Chercher "texte" dans un fichier
grep -n "SYSTEM_PROMPT" *.js   # Chercher avec numéro de ligne
find . -name "*.js"            # Trouver tous les fichiers .js
```

### Permissions
```bash
chmod +x script.sh     # Rendre un script exécutable
chmod 644 fichier.txt  # Permissions lecture/écriture
```

---

## ❓ RÉSOLUTION DE PROBLÈMES

### Problème : "Connection refused"

**Causes possibles** :
1. Mauvais host SSH
2. Port incorrect (essayez 2222 si 22 ne fonctionne pas)
3. Firewall qui bloque

**Solution** :
```bash
# Essayez avec le port 2222
ssh -p 2222 nomutilisateur@ssh.clusterXXX.hosting.ovh.net
```

---

### Problème : "Permission denied"

**Causes possibles** :
1. Mauvais nom d'utilisateur
2. Mauvais mot de passe
3. SSH désactivé pour votre compte

**Solution** :
1. Vérifiez vos identifiants dans le Manager Infomaniak
2. Réinitialisez votre mot de passe si nécessaire
3. Contactez le support Infomaniak si le problème persiste

---

### Problème : "Host key verification failed"

**Cause** : La clé du serveur a changé

**Solution** :
```bash
# Windows (Git Bash)
ssh-keygen -R ssh.clusterXXX.hosting.ovh.net

# Puis reconnectez-vous
```

---

### Problème : Session SSH se déconnecte

**Cause** : Timeout d'inactivité

**Solution** : Ajoutez à `~/.ssh/config` :
```
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

---

## 📚 RESSOURCES

### Documentation Infomaniak
- Support SSH : https://www.infomaniak.com/fr/support
- Base de connaissances : Recherchez "SSH" ou "Accès serveur"

### Tutoriels SSH
- OpenSSH : https://www.openssh.com/
- Git Bash : https://gitforwindows.org/

---

## ✅ CHECKLIST RAPIDE

Avant de déployer :
- [ ] J'ai mes identifiants SSH
- [ ] Je peux me connecter au serveur
- [ ] Je peux naviguer vers `/srv/customer/sites/api.thomasmaury.fr`
- [ ] Je vois le fichier `index.js`
- [ ] Je sais comment éditer un fichier (nano ou interface web)

---

## 🎯 PRÊT POUR LE DÉPLOIEMENT

Une fois connecté en SSH et dans le bon répertoire, revenez au **GUIDE_DEPLOIEMENT_RAPIDE.md** pour continuer le déploiement du prompt scientifique !

---

**Besoin d'aide ? Consultez le support Infomaniak ou contactez-moi.** 🚀
