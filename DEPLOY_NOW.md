# 🚀 Déploiement Immédiat sur VPS - Guide Pas à Pas

## 📋 Informations de Connexion

```
IP: 148.230.104.203
Hôte: srv1040251.hstgr.cloud
Utilisateur: root
Mot de passe: lycoshoster@TOH2026
OS: Ubuntu 24.04 LTS
```

## ⚡ Déploiement Rapide (10 minutes)

### Étape 1 : Connexion SSH (1 min)

Ouvrez PowerShell ou Terminal et exécutez :

```bash
ssh root@148.230.104.203
# Mot de passe : lycoshoster@TOH2026
```

Si vous avez l'erreur "REMOTE HOST IDENTIFICATION HAS CHANGED" :

```bash
ssh-keygen -R 148.230.104.203
# Puis reconnectez-vous
ssh root@148.230.104.203
```

### Étape 2 : Diagnostic Rapide (1 min)

Une fois connecté, copiez-collez ce script complet :

```bash
#!/bin/bash
echo "=== DIAGNOSTIC TERRANOVISION ==="
echo ""
echo "1. Système:"
echo "   - Hostname: $(hostname)"
echo "   - OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "   - Uptime: $(uptime -p)"
echo ""
echo "2. Logiciels installés:"
command -v node &> /dev/null && echo "   ✅ Node.js: $(node --version)" || echo "   ❌ Node.js: Non installé"
command -v pnpm &> /dev/null && echo "   ✅ pnpm: $(pnpm --version)" || echo "   ❌ pnpm: Non installé"
command -v pm2 &> /dev/null && echo "   ✅ PM2: $(pm2 --version)" || echo "   ❌ PM2: Non installé"
command -v git &> /dev/null && echo "   ✅ Git: $(git --version | cut -d' ' -f3)" || echo "   ❌ Git: Non installé"
command -v psql &> /dev/null && echo "   ✅ PostgreSQL: Installé" || echo "   ❌ PostgreSQL: Non installé"
echo ""
echo "3. Projet TerranoVision:"
ls -la /var/www/ 2>/dev/null | grep -i terranovision && echo "   ✅ Projet trouvé" || echo "   ❌ Projet non trouvé"
echo ""
echo "4. Processus actifs:"
ps aux | grep node | grep -v grep | wc -l | xargs echo "   Node.js:"
echo ""
echo "5. Ports ouverts:"
netstat -tulpn 2>/dev/null | grep -E ":(3000|4000|4001)" || echo "   Aucun port TerranoVision ouvert"
echo ""
echo "=== FIN DU DIAGNOSTIC ==="
```

**📤 IMPORTANT : Copiez le résultat et envoyez-le moi !**

---

## 🎯 Scénario A : VPS Vierge (Installation Complète)

Si le diagnostic montre que rien n'est installé :

### 1. Télécharger le script de setup

```bash
# Créer le répertoire de travail
mkdir -p /var/www
cd /var/www

# Télécharger le script (si vous avez un repo GitHub)
curl -o setup-server.sh https://raw.githubusercontent.com/VOTRE_USERNAME/terranovision/main/setup-server.sh

# OU créer le fichier manuellement
nano setup-server.sh
# Copiez le contenu du fichier setup-server.sh du projet local
# Ctrl+X, puis Y, puis Enter pour sauvegarder
```

### 2. Exécuter le script de setup

```bash
chmod +x setup-server.sh
./setup-server.sh
```

Le script va installer automatiquement :
- ✅ Node.js 20
- ✅ pnpm 8.15.0
- ✅ PM2
- ✅ PostgreSQL
- ✅ Git
- ✅ Firewall UFW
- ✅ Fail2ban

**Durée : ~5 minutes**

### 3. Cloner le projet

```bash
cd /var/www
git clone https://github.com/VOTRE_USERNAME/terranovision.git
cd terranovision
```

**OU** si vous n'avez pas de repo GitHub, transférez les fichiers :

```bash
# Sur votre machine locale (nouveau terminal)
cd "d:\les coder\Claud Streaming"
scp -r . root@148.230.104.203:/var/www/terranovision/
```

### 4. Configurer l'environnement

```bash
cd /var/www/terranovision

# Créer le fichier .env
cat > .env << 'EOF'
# M3U Playlist URL
M3U_ENDPOINT="http://line.l-ion.xyz/get.php?username=CanaL-IPTV&password=63KQ5913&type=m3u&output=rtmp"

# Xtream Codes API
XTREAM_BASE_URL="https://line.l-ion.xyz"
XTREAM_USERNAME="CanaL-IPTV"
XTREAM_PASSWORD="63KQ5913"

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/terranovision?schema=public"

# NextAuth
NEXTAUTH_URL="http://148.230.104.203:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Services URLs
INGEST_SERVICE_URL="http://localhost:4000"
STREAM_GATEWAY_URL="http://localhost:4001"

# FFmpeg
FFMPEG_PATH="/usr/bin/ffmpeg"

# Server Configuration
NODE_ENV="production"
PORT_WEB="3000"
PORT_INGEST="4000"
PORT_GATEWAY="4001"

# Logging
LOG_LEVEL="info"
EOF

echo "✅ Fichier .env créé"
```

### 5. Créer la base de données

```bash
# Créer la base de données
sudo -u postgres psql << EOF
CREATE DATABASE terranovision;
\q
EOF

echo "✅ Base de données créée"
```

### 6. Installer FFmpeg

```bash
apt-get install -y ffmpeg
ffmpeg -version
```

### 7. Déployer l'application

```bash
# Installer les dépendances
pnpm install

# Générer Prisma Client
cd packages/database
pnpm run generate
cd ../..

# Pousser le schéma vers la DB
cd packages/database
pnpm run push
cd ../..

# Build tous les packages
pnpm run build

# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Vérifier le déploiement

```bash
# Vérifier les services
pm2 status

# Vérifier les logs
pm2 logs --lines 20

# Tester les endpoints
curl http://localhost:3000
curl http://localhost:4000/health
curl http://localhost:4001/health
```

---

## 🎯 Scénario B : Projet Déjà Déployé (Mise à Jour)

Si le diagnostic montre que le projet existe déjà :

### 1. Aller dans le répertoire du projet

```bash
cd /var/www/terranovision
```

### 2. Sauvegarder la configuration actuelle

```bash
cp .env .env.backup
```

### 3. Mettre à jour le code

```bash
# Si vous avez un repo Git
git pull

# OU transférer les nouveaux fichiers depuis votre machine locale
# Sur votre machine locale :
# scp -r apps/web/src/app/api/image-proxy root@148.230.104.203:/var/www/terranovision/apps/web/src/app/api/
# scp apps/web/src/lib/image-proxy.ts root@148.230.104.203:/var/www/terranovision/apps/web/src/lib/
```

### 4. Mettre à jour les dépendances

```bash
pnpm install
```

### 5. Rebuild l'application

```bash
pnpm run build
```

### 6. Redémarrer les services

```bash
pm2 restart all
```

### 7. Vérifier les logs

```bash
pm2 logs --lines 50
```

---

## 🌐 Accès à l'Application

Une fois déployé, l'application sera accessible sur :

- **Web App** : http://148.230.104.203:3000
- **Ingest API** : http://148.230.104.203:4000
- **Stream Gateway** : http://148.230.104.203:4001

### Ouvrir les ports dans le firewall

```bash
ufw allow 3000/tcp
ufw allow 4000/tcp
ufw allow 4001/tcp
ufw reload
```

---

## 🔧 Commandes Utiles

### Gestion PM2

```bash
# Voir le statut
pm2 status

# Voir les logs
pm2 logs

# Voir les logs d'une app spécifique
pm2 logs web

# Redémarrer tout
pm2 restart all

# Redémarrer une app
pm2 restart web

# Arrêter tout
pm2 stop all

# Monitoring en temps réel
pm2 monit
```

### Vérifier les services

```bash
# PostgreSQL
systemctl status postgresql

# Vérifier la connexion DB
sudo -u postgres psql -c "\l"

# Vérifier les processus Node.js
ps aux | grep node

# Vérifier les ports
netstat -tulpn | grep -E ":(3000|4000|4001)"
```

### Logs système

```bash
# Logs système récents
journalctl -xe --no-pager | tail -50

# Logs d'une app PM2
pm2 logs web --lines 100

# Logs PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 🆘 Dépannage

### Erreur : Port déjà utilisé

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Redémarrer
pm2 restart web
```

### Erreur : Base de données inaccessible

```bash
# Vérifier PostgreSQL
systemctl status postgresql

# Démarrer PostgreSQL
systemctl start postgresql

# Vérifier la connexion
sudo -u postgres psql -c "SELECT version();"
```

### Erreur : Module non trouvé

```bash
# Réinstaller les dépendances
rm -rf node_modules
pnpm install

# Régénérer Prisma
cd packages/database
pnpm run generate
cd ../..

# Rebuild
pnpm run build
```

---

## 📊 Checklist de Déploiement

- [ ] Connexion SSH réussie
- [ ] Diagnostic exécuté
- [ ] Node.js, pnpm, PM2 installés
- [ ] PostgreSQL installé et actif
- [ ] FFmpeg installé
- [ ] Projet cloné ou transféré
- [ ] Fichier .env configuré
- [ ] Base de données créée
- [ ] Dépendances installées
- [ ] Prisma Client généré
- [ ] Application buildée
- [ ] Services démarrés avec PM2
- [ ] Ports ouverts dans le firewall
- [ ] Application accessible via IP

---

## 🎯 Prochaines Étapes Après Déploiement

1. **Configurer Nginx** (optionnel mais recommandé)
2. **Configurer un nom de domaine** (optionnel)
3. **Installer SSL avec Let's Encrypt** (optionnel)
4. **Configurer les sauvegardes automatiques**
5. **Mettre en place le monitoring**

---

**🚀 Commencez maintenant !**

```bash
ssh root@148.230.104.203
```

Puis suivez les étapes ci-dessus et envoyez-moi le résultat du diagnostic !

