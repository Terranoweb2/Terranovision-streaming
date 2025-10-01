# 🚀 Guide de Déploiement TerranoVision

Guide complet pour déployer TerranoVision en production.

## 📋 Prérequis

### Serveur
- VPS Ubuntu 22.04+ (recommandé : 4GB RAM, 2 vCPU minimum)
- Nom de domaine configuré (ex: terranovision.com)
- Accès SSH root ou sudo

### Services externes (optionnels)
- CDN (Cloudflare, BunnyCDN) pour HLS
- Email SMTP pour magic links
- SMS provider (Twilio) pour OTP

## 🏗️ Architecture de Production

```
Internet
   │
   ├─→ Nginx (80/443) → Load Balancer / Reverse Proxy
        │
        ├─→ Web App (Next.js) :3000
        ├─→ Ingest API (NestJS) :4000
        ├─→ Stream Gateway (Express) :4001
        └─→ HLS Files (Static)

PostgreSQL :5432 (local ou RDS)
```

## 🔧 Installation Serveur

### 1. Préparer le serveur

```bash
# Connexion SSH
ssh root@your-server-ip

# Mise à jour système
apt update && apt upgrade -y

# Installation des dépendances
apt install -y \
  git \
  curl \
  build-essential \
  nginx \
  postgresql \
  postgresql-contrib \
  ffmpeg \
  ufw

# Installer Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Vérifier
docker --version
docker-compose --version
ffmpeg -version
```

### 2. Configurer le pare-feu

```bash
# UFW configuration
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Vérifier
ufw status
```

### 3. Configurer PostgreSQL

```bash
# Créer utilisateur et base de données
sudo -u postgres psql

CREATE USER terranovision WITH PASSWORD 'your-secure-password';
CREATE DATABASE terranovision OWNER terranovision;
GRANT ALL PRIVILEGES ON DATABASE terranovision TO terranovision;
\q

# Autoriser connexions locales (si nécessaire)
# Éditer /etc/postgresql/14/main/pg_hba.conf
```

## 📦 Déploiement Application

### Option A : Docker Compose (Recommandé)

```bash
# Cloner le repo
cd /var/www
git clone https://github.com/your-org/terranovision.git
cd terranovision

# Configurer l'environnement
cp .env.example .env
nano .env
```

**Configuration .env production :**
```bash
# Database
DATABASE_URL="postgresql://terranovision:your-password@postgres:5432/terranovision"

# M3U Playlist
M3U_ENDPOINT="http://your-m3u-provider.com/playlist.m3u"

# NextAuth
NEXTAUTH_URL="https://terranovision.com"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Services URLs (internal Docker network)
INGEST_SERVICE_URL="http://ingest:4000"
STREAM_GATEWAY_URL="http://stream-gateway:4001"

# FFmpeg
FFMPEG_PATH="/usr/bin/ffmpeg"

# Optional: CDN
CDN_BASE_URL="https://cdn.terranovision.com"

# Email (for magic links)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@terranovision.com"

# Security
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX_REQUESTS="100"

# Logs
LOG_LEVEL="info"
NODE_ENV="production"
```

**Lancer les services :**
```bash
# Build & start
docker-compose -f docker-compose.prod.yml up -d --build

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f

# Vérifier le statut
docker-compose -f docker-compose.prod.yml ps
```

**Initialiser la base de données :**
```bash
# Entrer dans le container web
docker exec -it terranovision-web-prod sh

# Migrer la DB
cd /app/packages/database
pnpm run migrate:prod

# Importer la playlist M3U
curl -X POST http://localhost:4000/ingest/import/auto
```

### Option B : Installation Manuelle

```bash
# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Installer pnpm
npm install -g pnpm@8

# Cloner et build
cd /var/www
git clone https://github.com/your-org/terranovision.git
cd terranovision

# Configurer .env
cp .env.example .env
nano .env

# Installer dépendances
pnpm install --frozen-lockfile

# Générer Prisma client
cd packages/database
pnpm run generate
pnpm run migrate:prod

# Build tous les services
cd ../..
pnpm run build

# Créer services systemd
# Voir section "Services Systemd" ci-dessous
```

## 🌐 Configuration Nginx

```bash
# Copier la config
cp nginx.conf /etc/nginx/sites-available/terranovision

# Activer le site
ln -s /etc/nginx/sites-available/terranovision /etc/nginx/sites-enabled/

# Tester la config
nginx -t

# Recharger Nginx
systemctl reload nginx
```

**Configuration SSL avec Let's Encrypt :**
```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir certificat
certbot --nginx -d terranovision.com -d www.terranovision.com

# Renouvellement automatique (cron)
crontab -e
# Ajouter :
0 0 * * * certbot renew --quiet && systemctl reload nginx
```

## 📱 Déploiement Android

### Build APK/AAB signé

```bash
cd apps/android

# Créer keystore (première fois seulement)
keytool -genkey -v -keystore release.keystore \
  -alias terranovision -keyalg RSA -keysize 2048 -validity 10000

# Configurer gradle.properties
echo "RELEASE_STORE_FILE=release.keystore" >> gradle.properties
echo "RELEASE_STORE_PASSWORD=your-password" >> gradle.properties
echo "RELEASE_KEY_ALIAS=terranovision" >> gradle.properties
echo "RELEASE_KEY_PASSWORD=your-password" >> gradle.properties

# Build AAB pour Google Play
./gradlew bundleRelease

# Build APK pour distribution directe
./gradlew assembleRelease

# Fichiers générés :
# app/build/outputs/bundle/release/app-release.aab
# app/build/outputs/apk/release/app-release.apk
```

### Publier sur Google Play

1. Aller sur [Google Play Console](https://play.google.com/console)
2. Créer une nouvelle app
3. Remplir les informations (titre, description, captures)
4. Upload AAB
5. Soumettre pour révision

## 🔍 Monitoring & Maintenance

### Health Checks

```bash
# Vérifier tous les services
curl http://localhost/health
curl http://localhost:4000/health
curl http://localhost:4001/health

# Vérifier la DB
docker exec terranovision-db-prod pg_isready
```

### Logs

```bash
# Docker logs
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f ingest
docker-compose -f docker-compose.prod.yml logs -f stream-gateway

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Backup Base de Données

```bash
# Backup manuel
docker exec terranovision-db-prod pg_dump -U terranovision terranovision > backup.sql

# Script de backup automatique (cron)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec terranovision-db-prod pg_dump -U terranovision terranovision | gzip > /backups/terranovision_$DATE.sql.gz
find /backups -name "terranovision_*.sql.gz" -mtime +7 -delete

# Ajouter au crontab
0 2 * * * /path/to/backup-script.sh
```

### Restauration

```bash
# Restaurer depuis backup
gunzip < backup.sql.gz | docker exec -i terranovision-db-prod psql -U terranovision
```

## 🔄 Mises à jour

```bash
# Pull dernières modifications
cd /var/www/terranovision
git pull origin main

# Rebuild et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build

# Migrer la DB si nécessaire
docker exec terranovision-web-prod sh -c "cd /app/packages/database && pnpm run migrate:prod"
```

## 📊 Performance & Optimisation

### CDN pour HLS

**Cloudflare (gratuit) :**
1. Ajouter domaine à Cloudflare
2. Activer proxy pour sous-domaine CDN (cdn.terranovision.com)
3. Configurer `CDN_BASE_URL` dans .env

**BunnyCDN (payant, meilleur perf) :**
1. Créer Pull Zone
2. Configurer Origin URL : `https://terranovision.com/hls`
3. Configurer `CDN_BASE_URL`

### Cache Nginx

Ajouter dans nginx.conf :
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
proxy_cache_key "$scheme$request_method$host$request_uri";
```

## 🛡️ Sécurité Production

### Checklist

- [ ] HTTPS activé (Let's Encrypt)
- [ ] Pare-feu configuré (UFW)
- [ ] Rate limiting activé (Nginx + app)
- [ ] Variables d'environnement sécurisées
- [ ] PostgreSQL accessible uniquement en local
- [ ] Backups automatiques configurés
- [ ] Monitoring en place
- [ ] Logs rotatifs (logrotate)
- [ ] Services en mode production (NODE_ENV)
- [ ] Secrets rotationnés régulièrement

### Services Systemd (si déploiement manuel)

**Créer /etc/systemd/system/terranovision-web.service :**
```ini
[Unit]
Description=TerranoVision Web
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/terranovision/apps/web
ExecStart=/usr/bin/pnpm start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Activer :
```bash
systemctl daemon-reload
systemctl enable terranovision-web
systemctl start terranovision-web
systemctl status terranovision-web
```

## 📞 Support

En cas de problème :
1. Vérifier les logs
2. Vérifier les health checks
3. Consulter [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
4. Ouvrir une issue GitHub

---

**Bon déploiement ! 🚀**
