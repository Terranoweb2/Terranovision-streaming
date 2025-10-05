# 🚀 Vérification Rapide VPS - TerranoVision

## 📋 Informations de Connexion

```bash
Hôte: srv1040251.hstgr.cloud
IP: 148.230.104.203
Utilisateur: root
OS: Ubuntu 24.04 LTS
Localisation: Frankfurt, Germany 🇩🇪
```

## 🔐 Étape 1 : Connexion SSH

### Option A : Avec mot de passe

```bash
ssh root@148.230.104.203
```

### Option B : Avec clé SSH (si configurée)

```bash
ssh -i ~/.ssh/id_rsa root@148.230.104.203
```

## 🔍 Étape 2 : Diagnostic Rapide (1 minute)

Une fois connecté, exécutez ces commandes :

```bash
# Télécharger et exécuter le script de diagnostic
curl -fsSL https://raw.githubusercontent.com/VOTRE_USERNAME/terranovision/main/scripts/vps-diagnostic.sh -o /tmp/diagnostic.sh
chmod +x /tmp/diagnostic.sh
/tmp/diagnostic.sh
```

**OU** copiez-collez ce script de diagnostic rapide :

```bash
#!/bin/bash
echo "=== DIAGNOSTIC RAPIDE TERRANOVISION ==="
echo ""
echo "1. Système:"
echo "   - OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "   - Uptime: $(uptime -p)"
echo ""
echo "2. Logiciels installés:"
command -v node &> /dev/null && echo "   ✓ Node.js: $(node --version)" || echo "   ✗ Node.js: Non installé"
command -v pnpm &> /dev/null && echo "   ✓ pnpm: $(pnpm --version)" || echo "   ✗ pnpm: Non installé"
command -v pm2 &> /dev/null && echo "   ✓ PM2: $(pm2 --version)" || echo "   ✗ PM2: Non installé"
command -v docker &> /dev/null && echo "   ✓ Docker: Installé" || echo "   ✗ Docker: Non installé"
command -v psql &> /dev/null && echo "   ✓ PostgreSQL: Installé" || echo "   ✗ PostgreSQL: Non installé"
command -v nginx &> /dev/null && echo "   ✓ Nginx: Installé" || echo "   ✗ Nginx: Non installé"
echo ""
echo "3. Processus Node.js actifs:"
ps aux | grep node | grep -v grep | wc -l | xargs echo "   Nombre:"
echo ""
echo "4. Ports ouverts (TerranoVision):"
netstat -tulpn 2>/dev/null | grep -E ":(80|443|3000|4000|4001|5432)" | awk '{print "   "$4, $7}' || echo "   Aucun"
echo ""
echo "5. Projet TerranoVision:"
find /var/www /root /home -maxdepth 2 -name "*terranovision*" -o -name "*Claud*" 2>/dev/null | head -5 || echo "   Non trouvé"
echo ""
echo "6. PM2 Apps:"
command -v pm2 &> /dev/null && pm2 list || echo "   PM2 non installé"
echo ""
echo "=== FIN DU DIAGNOSTIC ==="
```

## 📊 Étape 3 : Interpréter les Résultats

### Scénario A : Projet Déjà Déployé ✅

Si vous voyez :
- ✓ Node.js, pnpm, PM2 installés
- ✓ Processus Node.js actifs
- ✓ Ports 3000, 4000, 4001 ouverts
- ✓ Projet trouvé dans /var/www/terranovision

**Action** : Le projet est déjà déployé ! Passez à la mise à jour.

```bash
cd /var/www/terranovision
git pull
pnpm install
pm2 restart all
```

### Scénario B : VPS Vierge ❌

Si vous voyez :
- ✗ Node.js non installé
- ✗ Aucun processus Node.js
- ✗ Projet non trouvé

**Action** : Installation complète nécessaire.

```bash
# Suivre le guide complet
cat QUICK_START_VPS.md
# ou
./setup-server.sh
```

### Scénario C : Installation Partielle ⚠️

Si vous voyez :
- ✓ Certains logiciels installés
- ✗ D'autres manquants
- ✗ Projet non trouvé ou incomplet

**Action** : Compléter l'installation.

## 🛠️ Étape 4 : Actions Rapides

### Vérifier les logs

```bash
# Logs PM2 (si installé)
pm2 logs

# Logs système
journalctl -xe

# Logs Nginx (si installé)
tail -f /var/log/nginx/error.log
```

### Vérifier l'état des services

```bash
# PM2
pm2 status

# Docker
docker ps

# Nginx
systemctl status nginx

# PostgreSQL
systemctl status postgresql
```

### Tester l'accès web

```bash
# Depuis le VPS
curl http://localhost:3000
curl http://localhost:4000/health
curl http://localhost:4001/health

# Depuis votre machine locale
curl http://148.230.104.203:3000
```

## 🌐 Étape 5 : Accès Web

Si le projet est déployé, testez ces URLs :

- **Web App** : http://148.230.104.203:3000
- **Ingest API** : http://148.230.104.203:4000
- **Stream Gateway** : http://148.230.104.203:4001

Ou avec le domaine (si configuré) :
- http://srv1040251.hstgr.cloud:3000

## 🔧 Commandes Utiles

### Gestion PM2

```bash
# Lister les apps
pm2 list

# Voir les logs
pm2 logs

# Redémarrer
pm2 restart all

# Arrêter
pm2 stop all

# Supprimer
pm2 delete all
```

### Gestion Docker

```bash
# Lister les containers
docker ps -a

# Voir les logs
docker-compose logs -f

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down
```

### Gestion Nginx

```bash
# Tester la config
nginx -t

# Recharger
systemctl reload nginx

# Redémarrer
systemctl restart nginx

# Voir les logs
tail -f /var/log/nginx/access.log
```

## 📝 Checklist de Vérification

Cochez ce qui est présent sur votre VPS :

- [ ] Node.js v18+ installé
- [ ] pnpm installé
- [ ] PM2 installé
- [ ] PostgreSQL installé et actif
- [ ] Nginx installé et actif
- [ ] Projet cloné dans /var/www/terranovision
- [ ] Fichier .env configuré
- [ ] Dépendances installées (node_modules)
- [ ] Base de données créée
- [ ] Services démarrés (PM2 ou Docker)
- [ ] Ports 3000, 4000, 4001 ouverts
- [ ] Application accessible via IP

## 🚀 Prochaines Étapes

### Si le projet n'existe pas :

1. Suivre **QUICK_START_VPS.md** pour l'installation complète
2. Ou exécuter **setup-server.sh** pour l'installation automatique

### Si le projet existe :

1. Mettre à jour avec les dernières modifications (logos, etc.)
2. Vérifier la configuration
3. Redémarrer les services

### Si vous avez des erreurs :

1. Consulter **TROUBLESHOOTING.md**
2. Vérifier les logs : `pm2 logs` ou `docker-compose logs`
3. Vérifier la configuration : `.env`, `nginx.conf`

## 💡 Conseils

- **Sauvegardez** toujours avant de faire des modifications
- **Testez** en local avant de déployer en production
- **Surveillez** les logs régulièrement
- **Mettez à jour** les dépendances régulièrement

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Vérifiez les logs : `pm2 logs` ou `journalctl -xe`
2. Consultez la documentation : `README.md`, `TROUBLESHOOTING.md`
3. Vérifiez l'état des services : `systemctl status nginx postgresql`

---

**Prêt à vérifier votre VPS ?** 🚀

Connectez-vous avec :
```bash
ssh root@148.230.104.203
```

Puis exécutez le diagnostic rapide ci-dessus !

