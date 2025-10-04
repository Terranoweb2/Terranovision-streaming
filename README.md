# 🎬 TerranoVision

Application de streaming TV multi-plateforme complète avec support IPTV M3U, guide TV (EPG), contrôle parental et bien plus.

![TerranoVision](https://via.placeholder.com/1200x400/0B1E3A/CFAE5E?text=TerranoVision)

## ✨ Fonctionnalités

### 📺 Core Features
- **Import M3U** - Import automatique de playlists M3U (RTMP, HLS, RTSP)
- **Lecteur vidéo** - Streaming fluide avec hls.js (web) et ExoPlayer (Android)
- **Transcoding RTMP→HLS** - Service dédié pour compatibilité navigateur
- **Guide TV (EPG)** - Support XMLTV avec données mock pour démo
- **Grille de chaînes** - Interface moderne avec logos et catégories
- **Recherche instantanée** - Recherche par nom, groupe, catégorie
- **Favoris** - Sauvegarde des chaînes préférées par utilisateur
- **Contrôle parental** - Protection par PIN + filtrage par âge

### 🌐 Plateformes
- **Web (PWA)** - Application web progressive, installable
- **Android Mobile** - App native avec ExoPlayer
- **Android TV** - Interface Leanback optimisée télécommande

### 🔒 Sécurité & Performance
- Rate limiting sur toutes les APIs
- Variables d'environnement sécurisées
- Logs structurés (Pino)
- Health checks pour tous les services
- Cache intelligent pour HLS

## 🏗️ Architecture

```
terranovision/
├── apps/
│   ├── web/              # Next.js 14 PWA
│   └── android/          # Android/TV (Kotlin + ExoPlayer)
├── services/
│   ├── ingest/           # NestJS - M3U parser & API
│   └── stream-gateway/   # Express - RTMP→HLS transcoding
├── packages/
│   └── database/         # Prisma schema & client
├── docker-compose.*.yml  # Docker orchestration
└── nginx.conf            # Reverse proxy config
```

### Stack Technique

#### Frontend (Web)
- **Next.js 14** - App Router, SSR, ISR
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (thème or & bleu profond)
- **shadcn/ui** - Composants UI
- **hls.js** - Lecteur HLS
- **NextAuth** - Authentification (magic link/OTP)
- **Zustand** - State management

#### Backend
- **NestJS** - Service d'ingestion (REST API)
- **Express** - Stream gateway (transcoding)
- **Prisma** - ORM (PostgreSQL)
- **FFmpeg** - Transcoding RTMP→HLS
- **Pino** - Logging structuré

#### Mobile
- **Kotlin** - Langage Android
- **ExoPlayer (Media3)** - Lecteur vidéo
- **Retrofit** - Client HTTP
- **Leanback** - UI Android TV

#### Infrastructure
- **PostgreSQL** - Base de données
- **Docker & Docker Compose** - Conteneurisation
- **Nginx** - Reverse proxy & rate limiting
- **GitHub Actions** - CI/CD

## 🚀 Installation & Démarrage

### Prérequis

- **Node.js** 18+
- **pnpm** 8+
- **Docker** & Docker Compose
- **PostgreSQL** 16+ (ou via Docker)
- **FFmpeg** (pour stream-gateway)

#### Installation FFmpeg

**Linux (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS :**
```bash
brew install ffmpeg
```

**Windows :**
Télécharger depuis [ffmpeg.org](https://ffmpeg.org/download.html) et ajouter au PATH.

### Installation rapide (One-command)

1. **Cloner le repo :**
```bash
git clone https://github.com/your-org/terranovision.git
cd terranovision
```

2. **Configurer l'environnement :**
```bash
cp .env.example .env
# Éditer .env avec vos valeurs (M3U_ENDPOINT, DATABASE_URL, etc.)
```

3. **Installer les dépendances :**
```bash
pnpm install
```

4. **Générer Prisma Client :**
```bash
cd packages/database
pnpm run generate
cd ../..
```

5. **Démarrer tous les services :**
```bash
pnpm run dev
```

Cela démarre :
- Web app : http://localhost:3000
- Ingest API : http://localhost:4000
- Stream Gateway : http://localhost:4001

### Avec Docker (Recommandé)

**Mode développement :**
```bash
docker-compose -f docker-compose.dev.yml up
```

**Mode production :**
```bash
# Configurer .env pour production
docker-compose -f docker-compose.prod.yml up -d
```

### Initialiser la base de données

```bash
cd packages/database
pnpm run push  # Sync schema avec DB
# ou
pnpm run migrate  # Créer migration
```

### Importer la playlist M3U

**Via API :**
```bash
curl -X POST http://localhost:4000/ingest/import/auto
```

**Ou via UI :** Aller sur `http://localhost:3000/admin/import`

## 📖 Configuration

### Variables d'environnement essentielles

```bash
# M3U Playlist URL (REQUIS)
M3U_ENDPOINT="http://your-m3u-url.com/playlist.m3u"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/terranovision"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Services
INGEST_SERVICE_URL="http://localhost:4000"
STREAM_GATEWAY_URL="http://localhost:4001"

# FFmpeg
FFMPEG_PATH="/usr/bin/ffmpeg"

# Optional: CDN pour HLS
CDN_BASE_URL="https://cdn.your-domain.com"
```

Voir [.env.example](.env.example) pour la liste complète.

## 🎯 Utilisation

### Import de playlist M3U

1. Configurer `M3U_ENDPOINT` dans `.env`
2. POST sur `/ingest/import/auto`
3. Les chaînes sont parsées, normalisées et insérées en DB
4. Catégories auto-assignées selon groupes M3U

### Lecture d'une chaîne

**Web :**
1. Aller sur `/channels`
2. Cliquer sur une chaîne
3. Le lecteur démarre automatiquement
   - Si RTMP : transcoding auto vers HLS
   - Si HLS : lecture directe

**Android :**
1. Lancer l'app TerranoVision
2. Naviguer dans la grille (D-Pad sur TV)
3. Sélectionner une chaîne
4. ExoPlayer gère RTMP/HLS/RTSP nativement

### Gestion des favoris

```typescript
// Web - via API
POST /api/favorites { channelId: "xxx" }
DELETE /api/favorites/:id

// Android - sync avec API
```

### Contrôle parental

1. Définir un PIN à 4 chiffres dans les paramètres
2. Les chaînes +18 sont masquées par défaut
3. Entrer le PIN pour y accéder

## 🧪 Tests

### Tests unitaires (Web)

```bash
cd apps/web
pnpm run test
```

### Tests E2E (Playwright)

```bash
cd apps/web
pnpm run test:e2e
```

### Tests Android

```bash
cd apps/android
./gradlew test
./gradlew connectedAndroidTest
```

## 🐳 Déploiement

### 🎯 Déploiement VPS Automatique (Recommandé)

**⚡ Quick Start:** [QUICK_START_VPS.md](QUICK_START_VPS.md) - Déploiement complet en 10 minutes

Le projet inclut un script de déploiement automatique pour VPS:

```bash
# 1. Se connecter au VPS
ssh root@VOTRE_IP_SERVEUR

# 2. Configuration automatique du serveur (première fois)
curl -fsSL https://raw.githubusercontent.com/VOTRE_USERNAME/terranovision/main/setup-server.sh -o setup-server.sh
chmod +x setup-server.sh
./setup-server.sh

# 3. Cloner et déployer
cd /var/www
git clone https://github.com/VOTRE_USERNAME/terranovision.git
cd terranovision
cp .env.vps.example .env.vps
nano .env.vps  # Éditer avec vos valeurs
chmod +x deploy-vps.sh
./deploy-vps.sh
```

Le script de déploiement va automatiquement:
- ✅ Installer toutes les dépendances
- ✅ Générer le client Prisma
- ✅ Exécuter les migrations de base de données
- ✅ Build tous les packages et services
- ✅ Démarrer les services avec PM2
- ✅ Configurer le redémarrage automatique

**📚 Guides de déploiement:**
- **[QUICK_START_VPS.md](QUICK_START_VPS.md)** - ⚡ Démarrage rapide 10 min
- **[SERVER_ACCESS.md](SERVER_ACCESS.md)** - 🔑 Guide d'accès SSH complet
- **[VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)** - 📖 Documentation complète
- [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md) - Spécifique Hostinger
- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Déploiement Render.com

### Docker Production

1. **Configurer production.env :**
```bash
cp .env.example .env.production
# Éditer avec valeurs de prod
```

2. **Build & démarrer :**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

3. **Vérifier :**
```bash
docker-compose -f docker-compose.prod.yml ps
curl http://localhost/health
```

### Deployer Web sur Vercel/Netlify

**Vercel :**
```bash
cd apps/web
vercel deploy --prod
```

**Note :** Les services backend (stream-gateway) doivent tourner séparément sur un VPS.

## 📊 Monitoring & Logs

### Health checks

- Web : `http://localhost:3000/`
- Ingest : `http://localhost:4000/health`
- Gateway : `http://localhost:4001/health`

### Logs

```bash
# Docker logs
docker-compose logs -f web
docker-compose logs -f ingest
docker-compose logs -f stream-gateway

# Logs Pino (structured JSON)
docker-compose logs ingest | pino-pretty
```

### Métriques

- Nombre de chaînes actives : `GET /ingest/stats`
- Transcodes actifs : `GET /transcode/active`

## 🛡️ Sécurité

### Best Practices

✅ **Jamais committer de secrets** - Utiliser `.env` et variables CI
✅ **Rate limiting** - Activé sur toutes les APIs
✅ **HTTPS en production** - Configurer SSL dans nginx.conf
✅ **Filtrage CORS** - Configurer `CORS_ORIGIN`
✅ **Validation des inputs** - class-validator sur NestJS
✅ **Sanitization** - Prisma prepared statements

### Licenses

⚠️ **Vérifier les licences** pour :
- Extension RTMP ExoPlayer (Apache 2.0)
- Flux M3U tiers (respecter CGU du provider)
- FFmpeg (LGPL 2.1+ ou GPL 2+)

## 🗺️ Roadmap v2

- [ ] Multi-profils utilisateurs
- [ ] Timeshift & DVR (enregistrement)
- [ ] Chromecast & AirPlay
- [ ] Recommandations IA
- [ ] Intégration XMLTV complète
- [ ] Support WebRTC pour ultra low-latency
- [ ] App iOS/tvOS
- [ ] Monétisation (Stripe/PayPal)
- [ ] CDN cloudflare pour HLS

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Next.js](https://nextjs.org/)
- [NestJS](https://nestjs.com/)
- [ExoPlayer](https://exoplayer.dev/)
- [hls.js](https://github.com/video-dev/hls.js/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)

## 📞 Support

Pour toute question ou problème :
- Ouvrir une [issue GitHub](https://github.com/your-org/terranovision/issues)
- Email : support@terranovision.com
- Discord : [TerranoVision Community](https://discord.gg/terranovision)

---

**Fait avec ❤️ par l'équipe TerranoVision**

🎬 *Enjoy your streams!* 📺
