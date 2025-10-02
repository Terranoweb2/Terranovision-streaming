# 🚀 Déploiement sur Hostinger

Guide complet pour déployer TerranoVision sur l'hébergement Hostinger.

## 📋 Prérequis Hostinger

Hostinger propose plusieurs types d'hébergement. Pour cette application, vous avez besoin de:

### Option 1: VPS Hostinger (RECOMMANDÉ)
- ✅ Accès SSH complet
- ✅ Node.js supporté
- ✅ Base de données PostgreSQL
- ✅ Possibilité d'installer pnpm, Docker, etc.
- 💰 Prix: ~$4-8/mois

### Option 2: Hébergement Web Hostinger
- ⚠️ Limité à PHP/MySQL
- ❌ Pas de Node.js en natif
- ❌ Ne convient PAS pour cette application

## 🎯 Architecture sur Hostinger VPS

```
VPS Hostinger
├── Frontend Next.js (Port 3000)
├── Stream Gateway (Port 4001)
├── PostgreSQL Database
└── Nginx (Reverse Proxy)
```

## 📦 Installation sur Hostinger VPS

### 1. Se connecter au VPS

```bash
ssh root@votre-ip-hostinger
```

### 2. Installer Node.js et pnpm

```bash
# Installer Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Installer pnpm
npm install -g pnpm@8.15.0

# Installer PM2 (gestionnaire de processus)
npm install -g pm2
```

### 3. Installer PostgreSQL

```bash
apt-get update
apt-get install -y postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE terranovision;
CREATE USER terranovision WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE terranovision TO terranovision;
\q
```

### 4. Cloner le projet

```bash
cd /var/www
git clone https://github.com/Terranoweb2/Terranovision-streaming.git
cd Terranovision-streaming
```

### 5. Installer les dépendances

```bash
pnpm install
```

### 6. Configurer les variables d'environnement

```bash
# Frontend
cat > apps/web/.env.production << EOF
XTREAM_BASE_URL=http://line.l-ion.xyz
XTREAM_USERNAME=CanaL-IPTV
XTREAM_PASSWORD=63KQ5913
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NEXT_PUBLIC_STREAM_GATEWAY_URL=https://votre-domaine.com:4001
DATABASE_URL=postgresql://terranovision:votre_mot_de_passe@localhost:5432/terranovision
NODE_ENV=production
EOF

# Stream Gateway
cat > services/stream-gateway/.env.production << EOF
NODE_ENV=production
PORT=4001
XTREAM_BASE_URL=http://line.l-ion.xyz
XTREAM_USERNAME=CanaL-IPTV
XTREAM_PASSWORD=63KQ5913
CORS_ORIGIN=https://votre-domaine.com
LOG_LEVEL=info
EOF
```

### 7. Build le projet

```bash
# Build database
pnpm --filter @terranovision/database generate

# Build web
pnpm --filter @terranovision/web build

# Build stream-gateway
pnpm --filter @terranovision/stream-gateway build
```

### 8. Configurer PM2

```bash
# Créer fichier ecosystem
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'terranovision-web',
      cwd: '/var/www/Terranovision-streaming/apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'terranovision-gateway',
      cwd: '/var/www/Terranovision-streaming/services/stream-gateway',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
EOF

# Démarrer les services
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 9. Installer Nginx

```bash
apt-get install -y nginx

# Configurer Nginx
cat > /etc/nginx/sites-available/terranovision << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Stream Gateway
    location /api/stream {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activer le site
ln -s /etc/nginx/sites-available/terranovision /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 10. Installer SSL avec Let's Encrypt

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d votre-domaine.com
```

## 🔄 Mises à jour

```bash
cd /var/www/Terranovision-streaming
git pull
pnpm install
pnpm --filter @terranovision/web build
pnpm --filter @terranovision/stream-gateway build
pm2 restart all
```

## 📊 Monitoring

```bash
# Voir les logs
pm2 logs

# Voir le status
pm2 status

# Monitoring en temps réel
pm2 monit
```

## 🛠️ Dépannage

### Service ne démarre pas
```bash
pm2 logs terranovision-web
pm2 logs terranovision-gateway
```

### Erreur de base de données
```bash
sudo -u postgres psql
\c terranovision
\dt
```

### Problème Nginx
```bash
nginx -t
systemctl status nginx
tail -f /var/log/nginx/error.log
```

## 💰 Coûts estimés

- **VPS Hostinger**: $4-8/mois
- **Domaine**: $10/an
- **Total**: ~$5-10/mois

## 🔐 Sécurité

```bash
# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Fail2ban
apt-get install -y fail2ban
systemctl enable fail2ban
```

## 📝 Notes importantes

1. **Streaming**: Le Stream Gateway doit être accessible publiquement pour proxifier les streams Xtream
2. **Base de données**: PostgreSQL est nécessaire pour les subscriptions
3. **SSL**: Obligatoire pour le streaming HTTPS
4. **PM2**: Redémarre automatiquement les services en cas de crash

---

**Besoin d'aide?** Contactez le support Hostinger pour configurer votre VPS.
