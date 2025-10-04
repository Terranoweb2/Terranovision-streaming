# 🔑 Guide d'Accès au Serveur VPS

Guide pour se connecter et configurer l'accès à votre serveur VPS.

## 📋 Informations nécessaires

Avant de commencer, vous devez avoir:

1. **Adresse IP du serveur** (fournie par votre hébergeur)
2. **Nom d'utilisateur** (généralement `root` ou un nom personnalisé)
3. **Mot de passe** ou **clé SSH** (fournis lors de la création du VPS)

## 🖥️ Accès depuis Windows

### Option 1: PowerShell (Recommandé - Windows 10+)

PowerShell moderne inclut SSH par défaut:

```powershell
# Se connecter avec mot de passe
ssh root@VOTRE_IP_SERVEUR

# Exemple:
ssh root@45.67.89.123
```

### Option 2: PuTTY (Alternative graphique)

1. **Télécharger PuTTY:**
   - Site: https://www.putty.org/
   - Télécharger: `putty.exe`

2. **Configuration:**
   - Host Name: `VOTRE_IP_SERVEUR`
   - Port: `22`
   - Connection type: `SSH`
   - Click "Open"

3. **Connexion:**
   - Login as: `root`
   - Password: `votre-mot-de-passe`

### Option 3: Windows Terminal (Moderne)

```bash
# Installer Windows Terminal depuis Microsoft Store
# Puis:
ssh root@VOTRE_IP_SERVEUR
```

## 🐧 Accès depuis Linux/Mac

```bash
# Terminal natif
ssh root@VOTRE_IP_SERVEUR

# Exemple:
ssh root@45.67.89.123
```

## 🔐 Configuration des Clés SSH (Plus Sécurisé)

### Générer une paire de clés SSH

**Windows (PowerShell):**
```powershell
# Générer clé
ssh-keygen -t ed25519 -C "votre-email@example.com"

# Appuyez sur Enter pour accepter l'emplacement par défaut
# Optionnel: Définir une passphrase

# Copier la clé publique vers le serveur
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@VOTRE_IP_SERVEUR "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Linux/Mac:**
```bash
# Générer clé
ssh-keygen -t ed25519 -C "votre-email@example.com"

# Copier vers le serveur
ssh-copy-id root@VOTRE_IP_SERVEUR
```

### Se connecter avec la clé (sans mot de passe)

```bash
ssh root@VOTRE_IP_SERVEUR
```

## 🚀 Première Connexion - Configuration Initiale

Une fois connecté au serveur, exécutez:

```bash
# Télécharger le script de configuration
curl -o setup-server.sh https://raw.githubusercontent.com/VOTRE_REPO/terranovision/main/setup-server.sh

# Ou créer manuellement (voir ci-dessous)
nano setup-server.sh

# Rendre exécutable
chmod +x setup-server.sh

# Exécuter
./setup-server.sh
```

## 📝 Configuration Manuelle Étape par Étape

Si vous préférez configurer manuellement:

### 1. Mise à jour du système

```bash
apt-get update && apt-get upgrade -y
```

### 2. Installation Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version  # Vérifier
```

### 3. Installation pnpm et PM2

```bash
npm install -g pnpm@8.15.0
npm install -g pm2
```

### 4. Installation PostgreSQL

```bash
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

### 5. Installation Git

```bash
apt-get install -y git
git --version
```

### 6. Création base de données

```bash
sudo -u postgres psql << EOF
CREATE DATABASE terranovision;
CREATE USER terranovision WITH PASSWORD 'VotreMotDePasseSecurise123!';
GRANT ALL PRIVILEGES ON DATABASE terranovision TO terranovision;
ALTER DATABASE terranovision OWNER TO terranovision;
\q
EOF
```

## 🛠️ Commandes Utiles SSH

### Vérifier connexion

```bash
# Tester la connexion
ssh -v root@VOTRE_IP_SERVEUR
```

### Transférer des fichiers

```bash
# Copier fichier local → serveur
scp fichier.txt root@VOTRE_IP_SERVEUR:/var/www/

# Copier dossier
scp -r dossier/ root@VOTRE_IP_SERVEUR:/var/www/

# Copier serveur → local
scp root@VOTRE_IP_SERVEUR:/var/www/fichier.txt ./
```

### Créer un tunnel SSH

```bash
# Forward port 3000 du serveur vers local
ssh -L 3000:localhost:3000 root@VOTRE_IP_SERVEUR
```

## 🔒 Sécurisation de l'Accès

### 1. Créer un utilisateur non-root

```bash
# Sur le serveur
adduser terranovision
usermod -aG sudo terranovision

# Tester
su - terranovision
sudo ls /root
```

### 2. Désactiver login root SSH (après avoir testé le nouvel utilisateur)

```bash
# Éditer config SSH
nano /etc/ssh/sshd_config

# Modifier:
PermitRootLogin no
PasswordAuthentication no  # Si vous utilisez clés SSH

# Redémarrer SSH
systemctl restart sshd
```

### 3. Installer Fail2ban

```bash
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## 🌐 Accès via Nom de Domaine

Si vous avez un domaine:

### Configurer DNS

Dans votre registrar de domaine (Namecheap, GoDaddy, etc.):

```
Type: A
Name: @
Value: VOTRE_IP_SERVEUR
TTL: 3600
```

### Se connecter avec le domaine

```bash
ssh root@votre-domaine.com
```

## 🆘 Dépannage

### Connexion refusée

```bash
# Vérifier que SSH écoute
netstat -tlnp | grep :22

# Vérifier firewall
ufw status
ufw allow 22/tcp
```

### Permission denied

```bash
# Vérifier permissions clé SSH locale
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub

# Sur le serveur
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Timeout

```bash
# Vérifier IP correcte
ping VOTRE_IP_SERVEUR

# Vérifier firewall VPS (console web de l'hébergeur)
```

## 📱 Accès depuis Mobile

### Applications recommandées

**Android:**
- Termux + OpenSSH
- JuiceSSH
- ConnectBot

**iOS:**
- Termius
- Prompt
- Blink Shell

## 🎯 Checklist Première Connexion

- [ ] Connexion SSH réussie
- [ ] Mot de passe root changé
- [ ] Système mis à jour (`apt-get update && apt-get upgrade`)
- [ ] Node.js installé (`node --version`)
- [ ] pnpm installé (`pnpm --version`)
- [ ] PostgreSQL installé (`systemctl status postgresql`)
- [ ] Git installé (`git --version`)
- [ ] Firewall configuré (`ufw status`)
- [ ] Base de données créée

## 📞 Support Hébergeurs Populaires

### Hostinger VPS
- Panel: https://hpanel.hostinger.com/
- Doc SSH: https://support.hostinger.com/en/articles/1583245-how-to-access-your-vps-using-ssh

### DigitalOcean
- Panel: https://cloud.digitalocean.com/
- Doc SSH: https://docs.digitalocean.com/products/droplets/how-to/connect-with-ssh/

### Vultr
- Panel: https://my.vultr.com/
- Doc SSH: https://www.vultr.com/docs/how-do-i-connect-to-my-server-via-ssh/

### OVH
- Panel: https://www.ovh.com/manager/
- Doc SSH: https://docs.ovh.com/fr/vps/premiers-pas-vps/

---

**✅ Une fois connecté, suivez le guide [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) pour déployer l'application.**
