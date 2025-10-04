# 🚀 Guide de Déploiement VPS - TerranoVision

Guide complet pour déployer TerranoVision sur votre VPS (Hostinger, DigitalOcean, Vultr, etc.).

## 📋 Prérequis

- VPS avec Ubuntu 20.04+ ou Debian 11+
- Accès SSH root ou sudo
- Nom de domaine pointant vers votre VPS (recommandé)
- Minimum 2GB RAM, 2 CPU cores, 20GB stockage

## 🎯 Architecture

```
VPS
├── Nginx (Reverse Proxy + SSL)
├── Frontend Next.js (Port 3000)
├── Stream Gateway (Port 4001)
└── PostgreSQL Database
```

## 📦 Installation Complète

### 1. Connexion SSH

```bash
ssh root@votre-ip-vps
```

### 2. Mise à jour du système

```bash
apt-get update && apt-get upgrade -y
```

### 3. Installation Node.js et pnpm

```bash
# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Vérification
node --version  # v20.x.x
npm --version

# pnpm
npm install -g pnpm@8.15.0

# PM2 (gestionnaire de processus)
npm install -g pm2
```

### 4. Installation PostgreSQL

```bash
# Installation
apt-get install -y postgresql postgresql-contrib

# Démarrage
systemctl start postgresql
systemctl enable postgresql

# Configuration base de données
sudo -u postgres psql << EOF
CREATE DATABASE terranovision;
CREATE USER terranovision WITH PASSWORD 'VotreMotDePasseSecurise123!';
GRANT ALL PRIVILEGES ON DATABASE terranovision TO terranovision;
ALTER DATABASE terranovision OWNER TO terranovision;
\q
EOF
```

### 5. Installation Git

```bash
apt-get install -y git
```

### 6. Clonage du projet

```bash
# Créer répertoire
mkdir -p /var/www
cd /var/www

# Cloner (remplacez par votre repo)
git clone https://github.com/votre-username/terranovision.git
cd terranovision
```

### 7. Configuration des variables d'environnement

```bash
# Copier le template
cp .env.vps.example .env.vps

# Éditer avec vos valeurs
nano .env.vps
```

**Remplacez les valeurs suivantes:**
- `CHANGEME_PASSWORD` → Mot de passe PostgreSQL
- `votre-domaine.com` → Votre nom de domaine
- `CHANGEME_GENERATE_SECURE_STRING_MIN_32_CHARS` → Générez avec: `openssl rand -base64 32`

### 8. Déploiement automatique

```bash
# Rendre le script exécutable
chmod +x deploy-vps.sh

# Lancer le déploiement
./deploy-vps.sh
```

Le script va:
1. ✅ Installer les dépendances
2. ✅ Générer le client Prisma
3. ✅ Exécuter les migrations
4. ✅ Build tous les packages
5. ✅ Démarrer les services avec PM2

### 9. Configuration Nginx

```bash
# Installation Nginx
apt-get install -y nginx

# Créer configuration
cat > /etc/nginx/sites-available/terranovision << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com;

    # Sécurité
    client_max_body_size 50M;

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Stream Gateway
    location /api/stream {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Timeouts pour streaming
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Activer le site
ln -s /etc/nginx/sites-available/terranovision /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Tester et redémarrer
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### 10. SSL avec Let's Encrypt (HTTPS)

```bash
# Installation Certbot
apt-get install -y certbot python3-certbot-nginx

# Obtenir certificat SSL
certbot --nginx -d votre-domaine.com

# Renouvellement automatique (déjà configuré)
systemctl status certbot.timer
```

### 11. Configuration Firewall

```bash
# UFW
apt-get install -y ufw

# Autoriser les ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Activer
ufw --force enable

# Vérifier
ufw status
```

### 12. Sécurité supplémentaire

```bash
# Fail2ban (protection brute-force)
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Désactiver login root SSH (après avoir créé un user)
# nano /etc/ssh/sshd_config
# PermitRootLogin no
# systemctl restart sshd
```

## 🔄 Mises à jour

Pour mettre à jour l'application:

```bash
cd /var/www/terranovision

# Pull dernières modifications
git pull origin main

# Relancer le déploiement
./deploy-vps.sh
```

## 📊 Monitoring

### Voir les services

```bash
pm2 status
```

### Logs en temps réel

```bash
# Tous les services
pm2 logs

# Service spécifique
pm2 logs terranovision-web
pm2 logs terranovision-gateway
```

### Monitoring interactif

```bash
pm2 monit
```

### Redémarrer les services

```bash
# Tous
pm2 restart all

# Spécifique
pm2 restart terranovision-web
pm2 restart terranovision-gateway
```

### Métriques système

```bash
# CPU/RAM
htop

# Disque
df -h

# Nginx
systemctl status nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🛠️ Dépannage

### Service ne démarre pas

```bash
# Vérifier logs PM2
pm2 logs terranovision-web --lines 100

# Vérifier build
cd /var/www/terranovision/apps/web
ls -la .next/
```

### Erreur base de données

```bash
# Vérifier PostgreSQL
systemctl status postgresql
sudo -u postgres psql

# Dans psql:
\l                           # Liste bases
\c terranovision             # Se connecter
\dt                          # Liste tables
SELECT * FROM "User" LIMIT 1;  # Test query

# Relancer migrations
cd /var/www/terranovision
pnpm --filter @terranovision/database deploy
```

### Erreur Nginx

```bash
# Tester config
nginx -t

# Logs erreurs
tail -f /var/log/nginx/error.log

# Redémarrer
systemctl restart nginx
```

### Port déjà utilisé

```bash
# Voir ports utilisés
netstat -tlnp | grep :3000
netstat -tlnp | grep :4001

# Tuer processus
kill -9 <PID>
pm2 restart all
```

### Mémoire insuffisante

```bash
# Créer swap (si <2GB RAM)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 🔐 Backup Base de Données

### Backup manuel

```bash
# Créer backup
sudo -u postgres pg_dump terranovision > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurer
sudo -u postgres psql terranovision < backup_20250101_120000.sql
```

### Backup automatique quotidien

```bash
# Créer script
cat > /usr/local/bin/backup-terranovision.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/var/backups/terranovision
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump terranovision | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz
# Garder seulement 7 derniers jours
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-terranovision.sh

# Ajouter au cron (tous les jours à 3h)
echo "0 3 * * * /usr/local/bin/backup-terranovision.sh" | crontab -
```

## 🎯 Post-Déploiement

### Vérifications

1. ✅ Application accessible: `https://votre-domaine.com`
2. ✅ SSL actif (cadenas vert)
3. ✅ Streaming fonctionne
4. ✅ PM2 services en ligne: `pm2 status`
5. ✅ Database connectée
6. ✅ Logs sans erreur: `pm2 logs`

### Configuration DNS

Assurez-vous que votre domaine pointe vers votre VPS:

```
Type: A
Name: @
Value: <IP-de-votre-VPS>
TTL: 3600
```

### Performance

Pour optimiser:

```bash
# Nginx caching
# Ajouter dans /etc/nginx/sites-available/terranovision:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=cache:10m max_size=1g;

# PM2 cluster mode (si 2+ CPU)
pm2 delete terranovision-web
pm2 start ecosystem.config.js --only terranovision-web -i max
```

## 💰 Coûts Estimés

| Provider | RAM | CPU | Prix/mois |
|----------|-----|-----|-----------|
| **Hostinger VPS** | 2GB | 2 cores | $5-8 |
| **DigitalOcean** | 2GB | 2 cores | $12 |
| **Vultr** | 2GB | 2 cores | $10 |
| **Hetzner** | 2GB | 2 cores | €4.5 |

+ Domaine: ~$10/an

## 📞 Support

### Logs importants

```bash
# PM2
pm2 logs --lines 200

# Nginx
tail -100 /var/log/nginx/error.log

# PostgreSQL
tail -100 /var/log/postgresql/postgresql-*-main.log

# Système
journalctl -u nginx -n 100
```

### Commandes utiles

```bash
# Redémarrage complet
pm2 restart all
systemctl restart nginx
systemctl restart postgresql

# Nettoyage
pm2 flush  # Vider logs PM2
apt-get autoremove -y
apt-get clean
```

---

**✅ Votre application est maintenant déployée en production!**

Pour toute question, consultez les logs avec `pm2 logs` ou `tail -f /var/log/nginx/error.log`.
