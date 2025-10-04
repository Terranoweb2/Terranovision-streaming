# ⚡ Quick Start VPS - TerranoVision

Guide rapide pour déployer TerranoVision sur votre VPS en 10 minutes.

## 🎯 Ce dont vous avez besoin

- ✅ VPS Ubuntu 20.04+ (Hostinger, DigitalOcean, Vultr, etc.)
- ✅ Accès SSH (IP + mot de passe ou clé)
- ✅ Domaine pointant vers le VPS (optionnel mais recommandé)

## 🚀 Déploiement en 3 Étapes

### Étape 1: Se connecter au VPS

**Depuis Windows PowerShell:**
```powershell
ssh root@VOTRE_IP_SERVEUR
# Exemple: ssh root@45.67.89.123
```

**Depuis Linux/Mac:**
```bash
ssh root@VOTRE_IP_SERVEUR
```

> 📚 **Besoin d'aide pour SSH?** → [SERVER_ACCESS.md](SERVER_ACCESS.md)

### Étape 2: Configuration automatique du serveur

Une fois connecté, exécutez:

```bash
# Télécharger et exécuter le script de setup
curl -fsSL https://raw.githubusercontent.com/VOTRE_USERNAME/terranovision/main/setup-server.sh -o setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

Le script va installer automatiquement:
- ✅ Node.js 20
- ✅ pnpm & PM2
- ✅ PostgreSQL
- ✅ Git
- ✅ Firewall UFW
- ✅ Fail2ban

**⏱️ Durée: ~3-5 minutes**

### Étape 3: Déployer TerranoVision

```bash
# 1. Cloner le projet
mkdir -p /var/www
cd /var/www
git clone https://github.com/VOTRE_USERNAME/terranovision.git
cd terranovision

# 2. Configurer les variables
cp .env.vps.example .env.vps
nano .env.vps
# Modifiez:
# - DATABASE_URL (utilisez le mot de passe PostgreSQL du setup)
# - NEXTAUTH_SECRET (générez avec: openssl rand -base64 32)
# - votre-domaine.com (votre domaine ou IP)

# 3. Déployer automatiquement
chmod +x deploy-vps.sh
./deploy-vps.sh
```

**⏱️ Durée: ~5-7 minutes**

## ✅ Vérification

```bash
# Vérifier que les services tournent
pm2 status

# Devrait afficher:
# terranovision-web     │ online
# terranovision-gateway │ online
```

L'application est maintenant accessible sur `http://VOTRE_IP:3000`

## 🌐 Ajouter Nginx + SSL (Optionnel mais recommandé)

### Installer Nginx

```bash
apt-get install -y nginx certbot python3-certbot-nginx
```

### Configurer le reverse proxy

```bash
cat > /etc/nginx/sites-available/terranovision << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/stream {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_read_timeout 3600s;
    }
}
EOF

ln -s /etc/nginx/sites-available/terranovision /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### Ajouter SSL (HTTPS)

```bash
certbot --nginx -d votre-domaine.com
```

**✅ Application accessible sur: `https://votre-domaine.com`**

## 📊 Commandes Utiles

### Voir les logs

```bash
pm2 logs                          # Tous les logs
pm2 logs terranovision-web        # Logs frontend
pm2 logs terranovision-gateway    # Logs stream gateway
```

### Redémarrer les services

```bash
pm2 restart all                   # Redémarrer tout
pm2 restart terranovision-web     # Redémarrer frontend
```

### Monitoring

```bash
pm2 monit    # Dashboard interactif
pm2 status   # État des services
htop         # Utilisation CPU/RAM
```

## 🔄 Mettre à jour l'application

```bash
cd /var/www/terranovision
git pull origin main
./deploy-vps.sh
```

## 🆘 Problèmes?

### Service ne démarre pas

```bash
# Voir les erreurs
pm2 logs terranovision-web --lines 50

# Vérifier la config
cat .env.vps

# Rebuild
pnpm --filter @terranovision/web build
pm2 restart all
```

### Erreur base de données

```bash
# Vérifier PostgreSQL
systemctl status postgresql

# Tester connexion
sudo -u postgres psql terranovision

# Relancer migrations
cd /var/www/terranovision
pnpm --filter @terranovision/database deploy
```

### Port 3000 déjà utilisé

```bash
# Trouver le processus
netstat -tlnp | grep :3000

# Tuer si nécessaire
kill -9 <PID>

# Redémarrer
pm2 restart all
```

## 📱 Checklist Post-Déploiement

- [ ] Application accessible sur http://IP:3000
- [ ] Services PM2 en ligne (`pm2 status`)
- [ ] Logs sans erreur (`pm2 logs`)
- [ ] Base de données connectée
- [ ] Streaming fonctionne
- [ ] Nginx configuré (optionnel)
- [ ] SSL actif (optionnel)

## 💰 Coût Estimé

| Hébergeur | VPS 2GB/2CPU | Prix/mois |
|-----------|--------------|-----------|
| Hostinger | 2GB RAM | $5-8 |
| DigitalOcean | 2GB RAM | $12 |
| Vultr | 2GB RAM | $10 |
| Hetzner | 2GB RAM | €4.5 |

## 📚 Documentation Complète

- **[SERVER_ACCESS.md](SERVER_ACCESS.md)** - Guide SSH détaillé
- **[VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)** - Guide complet déploiement
- **[HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)** - Spécifique Hostinger

## 🎯 Résumé des Commandes

```bash
# 1. Se connecter
ssh root@VOTRE_IP

# 2. Setup serveur
curl -fsSL https://raw.githubusercontent.com/VOTRE_USERNAME/terranovision/main/setup-server.sh -o setup-server.sh
chmod +x setup-server.sh
./setup-server.sh

# 3. Cloner et déployer
cd /var/www
git clone https://github.com/VOTRE_USERNAME/terranovision.git
cd terranovision
cp .env.vps.example .env.vps
nano .env.vps  # Configurer
./deploy-vps.sh

# 4. Vérifier
pm2 status
pm2 logs
```

---

**✅ Votre application TerranoVision est maintenant en ligne!** 🎬

Pour toute question: Consultez [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) pour plus de détails.
