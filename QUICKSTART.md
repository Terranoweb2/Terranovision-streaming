# ⚡ Démarrage Rapide TerranoVision

Guide ultra-rapide pour lancer TerranoVision localement en 5 minutes.

## 🎯 Prérequis Minimum

- **Node.js 18+** - [Télécharger](https://nodejs.org/)
- **pnpm** - `npm install -g pnpm@8`
- **Docker Desktop** - [Télécharger](https://www.docker.com/products/docker-desktop/) (recommandé)
- **FFmpeg** - Voir installation ci-dessous

### Installation FFmpeg

**Windows :**
```powershell
# Via Chocolatey
choco install ffmpeg

# Ou télécharger depuis https://ffmpeg.org/download.html
# Extraire et ajouter bin/ au PATH
```

**macOS :**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install ffmpeg
```

## 🚀 Méthode 1 : Docker (Le Plus Simple)

```bash
# 1. Cloner le repo
git clone https://github.com/your-org/terranovision.git
cd terranovision

# 2. Créer le fichier .env
cp .env.example .env

# 3. Éditer .env (optionnel, fonctionne avec les valeurs par défaut)
# Configurer au minimum M3U_ENDPOINT si vous avez une playlist

# 4. Lancer TOUT avec Docker Compose
docker-compose -f docker-compose.dev.yml up

# ✅ C'est tout ! L'application démarre sur :
# - Web : http://localhost:3000
# - Ingest API : http://localhost:4000
# - Stream Gateway : http://localhost:4001
# - API Docs : http://localhost:4000/api/docs
```

## 💻 Méthode 2 : Local (Sans Docker)

### Étape 1 : PostgreSQL

**Option A - Docker (facile) :**
```bash
docker run --name terranovision-db -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=terranovision -p 5432:5432 -d postgres:16-alpine
```

**Option B - Local :**
Installer PostgreSQL et créer une base `terranovision`

### Étape 2 : Installation

```bash
# 1. Cloner
git clone https://github.com/your-org/terranovision.git
cd terranovision

# 2. Copier .env
cp .env.example .env

# 3. Éditer .env (IMPORTANT)
nano .env
# Configurer au minimum :
# - DATABASE_URL (connexion PostgreSQL)
# - M3U_ENDPOINT (votre playlist)

# 4. Installer dépendances
pnpm install

# 5. Générer Prisma Client
cd packages/database
pnpm run generate
pnpm run push  # Créer les tables
cd ../..

# 6. Lancer TOUS les services (une seule commande !)
pnpm run dev
```

**Services actifs :**
- Web : http://localhost:3000
- Ingest : http://localhost:4000
- Gateway : http://localhost:4001

## 📺 Importer des Chaînes

### Avec une playlist M3U

**1. Configurer l'URL dans .env :**
```bash
M3U_ENDPOINT="http://your-provider.com/playlist.m3u"
```

**2. Importer via API :**
```bash
curl -X POST http://localhost:4000/ingest/import/auto
```

**3. Ou via l'interface web :**
Aller sur http://localhost:3000/admin/import (TODO: créer cette page)

### Tester avec les données d'exemple

Le fichier `CHANNELS_SAMPLE.json` contient des chaînes de démo. Pour les importer :

```bash
# TODO: Ajouter script d'import depuis JSON
cd packages/database
pnpm run seed
```

## 🎬 Regarder une Chaîne

1. Ouvrir http://localhost:3000
2. Cliquer sur "Découvrir les chaînes"
3. Sélectionner une chaîne
4. Le lecteur démarre automatiquement !

**Note :** Les flux RTMP seront automatiquement transcodés en HLS par le stream-gateway.

## 🔧 Commandes Utiles

```bash
# Démarrer tous les services
pnpm run dev

# Build pour production
pnpm run build

# Linter
pnpm run lint

# Tests
pnpm run test

# Tests E2E
cd apps/web && pnpm run test:e2e

# Arrêter Docker Compose
docker-compose -f docker-compose.dev.yml down

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f

# Nettoyer la DB
cd packages/database
pnpm run push --force-reset
```

## 🐛 Problèmes Courants

### Port déjà utilisé

```bash
# Vérifier quels ports sont occupés
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Changer les ports dans .env
PORT_WEB=3001
PORT_INGEST=4002
PORT_GATEWAY=4003
```

### FFmpeg introuvable

```bash
# Vérifier installation
ffmpeg -version

# Si erreur, installer FFmpeg (voir section Prérequis)
# Puis configurer le chemin dans .env
FFMPEG_PATH="/usr/bin/ffmpeg"  # Linux/Mac
FFMPEG_PATH="C:/ffmpeg/bin/ffmpeg.exe"  # Windows
```

### Erreur de connexion DB

```bash
# Vérifier que PostgreSQL tourne
docker ps | grep postgres

# Tester connexion
psql postgresql://terranovision:dev_password@localhost:5432/terranovision

# Vérifier DATABASE_URL dans .env
```

### Module introuvable

```bash
# Réinstaller dépendances
rm -rf node_modules
pnpm install --frozen-lockfile

# Régénérer Prisma Client
cd packages/database && pnpm run generate
```

## 📱 Tester sur Mobile

### Web (PWA)
1. Lancer avec `pnpm run dev`
2. Sur mobile, accéder à `http://[votre-ip-local]:3000`
3. Option : Installer comme PWA depuis le navigateur

### Android
```bash
cd apps/android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## 📚 Prochaines Étapes

- 📖 Lire le [README.md](README.md) complet
- 🚀 Consulter [DEPLOYMENT.md](DEPLOYMENT.md) pour la production
- 💡 Explorer l'API : http://localhost:4000/api/docs
- 🎨 Personnaliser le thème dans `apps/web/tailwind.config.ts`
- 🔐 Configurer NextAuth pour l'authentification

## 🆘 Besoin d'aide ?

- 📝 [Ouvrir une issue](https://github.com/your-org/terranovision/issues)
- 💬 Discord : [TerranoVision Community](https://discord.gg/terranovision)
- 📧 Email : support@terranovision.com

---

**Bon streaming ! 🎬📺**
