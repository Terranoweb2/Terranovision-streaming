# 🖥️ Vérification VPS - TerranoVision

## 📋 Informations du VPS

| Paramètre | Valeur |
|-----------|--------|
| **Emplacement** | Germany - Frankfurt 🇩🇪 |
| **OS** | Ubuntu 24.04 LTS |
| **Nom d'hôte** | srv1040251.hstgr.cloud |
| **IP** | 148.230.104.203 |
| **Utilisateur SSH** | root |
| **Disponibilité** | 2 jours 11 heures |

## 🔍 Commandes de Vérification

### 1. Connexion SSH

```bash
ssh root@148.230.104.203
```

### 2. Vérifier si le projet existe

```bash
# Vérifier les répertoires courants
ls -la /var/www/
ls -la /root/
ls -la /home/

# Chercher le projet TerranoVision
find / -name "terranovision" -type d 2>/dev/null
find / -name "Claud Streaming" -type d 2>/dev/null
```

### 3. Vérifier les services actifs

```bash
# Vérifier les processus Node.js
ps aux | grep node

# Vérifier les ports ouverts
netstat -tulpn | grep -E ':(3000|4000|4001|5432|80|443)'

# Vérifier les services systemd
systemctl list-units --type=service --state=running | grep -E '(node|nginx|postgres|pm2)'

# Vérifier PM2 (si installé)
pm2 list
pm2 status
```

### 4. Vérifier Docker

```bash
# Vérifier si Docker est installé
docker --version
docker ps -a
docker-compose --version

# Vérifier les containers
docker ps
docker-compose ps
```

### 5. Vérifier Nginx

```bash
# Vérifier si Nginx est installé
nginx -v
systemctl status nginx

# Vérifier la configuration
cat /etc/nginx/sites-available/default
cat /etc/nginx/sites-enabled/*
```

### 6. Vérifier PostgreSQL

```bash
# Vérifier si PostgreSQL est installé
psql --version
systemctl status postgresql

# Se connecter à PostgreSQL
sudo -u postgres psql
\l  # Lister les bases de données
\q  # Quitter
```

### 7. Vérifier les logs

```bash
# Logs système
journalctl -xe

# Logs Nginx (si installé)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs PM2 (si installé)
pm2 logs
```

## 🎯 Scénarios Possibles

### Scénario A : Projet déjà déployé

Si le projet existe déjà :

```bash
# Aller dans le répertoire du projet
cd /var/www/terranovision  # ou autre chemin

# Vérifier l'état
git status
git log --oneline -5

# Vérifier les dépendances
ls -la node_modules/
cat package.json

# Redémarrer les services
pm2 restart all
# ou
docker-compose restart
```

### Scénario B : Projet non déployé

Si le projet n'existe pas encore :

```bash
# Installer les prérequis
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
npm install -g pnpm pm2

# Installer Docker (si nécessaire)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Cloner le projet
cd /var/www
git clone <URL_DU_REPO> terranovision
cd terranovision

# Configurer et déployer
cp .env.example .env
nano .env  # Éditer les variables

# Installer et démarrer
pnpm install
pnpm run build
pm2 start ecosystem.config.js
```

### Scénario C : Projet partiellement déployé

Si le projet existe mais ne fonctionne pas :

```bash
# Vérifier les erreurs
pm2 logs --err
docker-compose logs

# Redéployer
cd /var/www/terranovision
git pull
pnpm install
pnpm run build
pm2 restart all
```

## 🔧 Commandes de Diagnostic Rapide

```bash
# Script de diagnostic complet
cat > /tmp/check-terranovision.sh << 'EOF'
#!/bin/bash
echo "=== TerranoVision VPS Diagnostic ==="
echo ""
echo "1. Système:"
uname -a
echo ""
echo "2. Mémoire:"
free -h
echo ""
echo "3. Disque:"
df -h
echo ""
echo "4. Processus Node.js:"
ps aux | grep node | grep -v grep
echo ""
echo "5. Ports ouverts:"
netstat -tulpn | grep -E ':(3000|4000|4001|5432|80|443)'
echo ""
echo "6. Docker:"
docker ps 2>/dev/null || echo "Docker non installé"
echo ""
echo "7. PM2:"
pm2 list 2>/dev/null || echo "PM2 non installé"
echo ""
echo "8. Nginx:"
systemctl status nginx --no-pager 2>/dev/null || echo "Nginx non installé"
echo ""
echo "9. PostgreSQL:"
systemctl status postgresql --no-pager 2>/dev/null || echo "PostgreSQL non installé"
echo ""
echo "10. Recherche du projet:"
find /var/www /root /home -name "terranovision" -o -name "Claud*Streaming" 2>/dev/null
EOF

chmod +x /tmp/check-terranovision.sh
/tmp/check-terranovision.sh
```

## 📊 Checklist de Vérification

- [ ] VPS accessible via SSH
- [ ] Node.js installé (v18+)
- [ ] pnpm installé
- [ ] PM2 installé
- [ ] Docker installé (optionnel)
- [ ] PostgreSQL installé
- [ ] Nginx installé
- [ ] Projet cloné
- [ ] Variables d'environnement configurées
- [ ] Dépendances installées
- [ ] Services démarrés
- [ ] Ports ouverts (3000, 4000, 4001)
- [ ] Domaine configuré (optionnel)
- [ ] SSL configuré (optionnel)

## 🚀 Prochaines Étapes

Après avoir exécuté les commandes de vérification, nous pourrons :

1. **Si le projet existe** : Mettre à jour avec les dernières modifications (logos, etc.)
2. **Si le projet n'existe pas** : Déployer depuis zéro
3. **Si le projet est cassé** : Diagnostiquer et réparer

## 📝 Notes

- Le VPS est récent (2 jours 11 heures de disponibilité)
- Ubuntu 24.04 LTS est une version récente et stable
- L'emplacement Frankfurt offre une bonne latence pour l'Europe

---

**Prêt pour la connexion SSH ?** 🔐

