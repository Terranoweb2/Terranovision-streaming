# Configuration Xtream Codes pour TerranoVision

## 🎯 Objectif

Cette configuration permet à TerranoVision de fonctionner avec l'API Xtream Codes au lieu du M3U direct, contournant ainsi l'erreur 884 (anti-bot/rate limit).

## 🔧 Architecture

### Backend
- **Service Xtream** (`/lib/xtream.ts`) : Gère les appels API avec retry et backoff exponentiel
- **Rate Limiter** (`/lib/rate-limiter.ts`) : Limite les requêtes à 60/min par IP
- **Routes API** :
  - `GET /api/xtream/list` : Liste toutes les chaînes
  - `GET /api/xtream/epg?channelId=X` : Récupère l'EPG d'une chaîne

### Frontend
- **Page Channels** (`/channels`) : Affiche toutes les chaînes avec recherche et filtres
- **Page Watch** (`/watch/[id]`) : Lecteur vidéo avec fallback HLS→TS
- **VideoPlayer** : Support HLS.js avec auto-reconnect (3 tentatives)

## 📋 Variables d'environnement

Créez un fichier `.env.local` dans `apps/web/` :

```env
XTREAM_BASE_URL=http://line.l-ion.xyz
XTREAM_USERNAME=CanaL-IPTV
XTREAM_PASSWORD=63KQ5913
```

⚠️ **IMPORTANT** : Ne jamais exposer ces credentials côté client !

## 🚀 Démarrage

### Local

```bash
# Installer les dépendances
pnpm install

# Lancer en mode dev
pnpm dev

# Accéder à l'app
# http://localhost:3000
```

### Production

```bash
# Build
pnpm build

# Démarrer
pnpm start
```

## 🔄 Fonctionnement

### 1. Récupération des chaînes

```typescript
// Client fait une requête
fetch('/api/xtream/list')

// Serveur appelle Xtream avec headers anti-bot
GET http://line.l-ion.xyz/player_api.php
  ?username=CanaL-IPTV
  &password=63KQ5913
  &action=get_live_streams

Headers:
  User-Agent: VLC/3.0.18 LibVLC/3.0.18
  Referer: https://terranovision.app
  Origin: https://terranovision.app
```

### 2. Construction des URLs de flux

Pour chaque chaîne (stream_id=123) :

```typescript
// HLS (prioritaire)
urlHls = "http://line.l-ion.xyz/live/CanaL-IPTV/63KQ5913/123.m3u8"

// TS (fallback)
urlTs = "http://line.l-ion.xyz/live/CanaL-IPTV/63KQ5913/123.ts"
```

### 3. Lecture vidéo avec fallback

```
Tentative 1 : HLS avec hls.js
  ↓ (erreur réseau/404)
Tentative 2 : HLS retry (×3)
  ↓ (échec)
Tentative 3 : Passage au flux TS
  ↓ (erreur)
Message : "Impossible de charger le flux"
```

## 🛡️ Protection anti-erreur 884

### Stratégies implémentées

1. **Retry avec backoff exponentiel** :
   - 500ms → 1s → 2s → 4s
   - Max 4 tentatives

2. **Headers anti-détection** :
   - User-Agent VLC
   - Referer/Origin valides

3. **Cache côté serveur** :
   - TTL : 10 minutes
   - Réduit les appels à Xtream

4. **Rate limiting** :
   - 60 requêtes/min par IP
   - Évite le spam

5. **Pas d'exposition des credentials** :
   - Jamais envoyés au client
   - URLs construites côté serveur

## 🧪 Tests

### Test de la route API

```bash
# Lister les chaînes
curl http://localhost:3000/api/xtream/list

# EPG d'une chaîne
curl http://localhost:3000/api/xtream/epg?channelId=123
```

### Test du player

1. Aller sur `/channels`
2. Cliquer sur une chaîne
3. Vérifier la lecture HLS
4. Simuler une erreur réseau (DevTools → Offline)
5. Vérifier le fallback TS

## 📱 PWA (Progressive Web App)

L'app est configurée avec `next-pwa` :

- Service Worker auto-généré
- Cache des assets statiques
- Fonctionne offline (UI seulement)
- Manifest.json configuré

## 🔍 Debugging

### Logs client

```javascript
// Ouvrir la console
// Rechercher :
[Channels] Error fetching channels
[Watch] Error fetching channel
[Player] Network error / Media error
```

### Logs serveur

```bash
# Terminal Next.js
[Xtream] Fetched X channels
[Xtream] Attempt 1 failed (884), retrying...
[API] Error fetching Xtream channels
```

## 🚢 Déploiement

### Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
cd apps/web
vercel

# Ajouter les variables d'env dans le dashboard Vercel
XTREAM_BASE_URL=...
XTREAM_USERNAME=...
XTREAM_PASSWORD=...
```

### Replit

1. Importer le projet GitHub
2. Configurer `.env` dans Secrets
3. Run command : `pnpm dev`

## 📊 Monitoring

### Indicateurs à surveiller

- **Taux d'erreur 884** : Doit être < 1%
- **Cache hit rate** : Doit être > 80%
- **Temps de chargement** : < 2s
- **Rate limit hits** : Doit être minimal

### Logs à surveiller

```bash
# Erreurs critiques
grep "ERROR" logs/*.log

# Erreurs 884
grep "884" logs/*.log

# Rate limits
grep "Rate limit exceeded" logs/*.log
```

## 🔒 Sécurité

### Best practices

- ✅ Credentials en variables d'env
- ✅ Jamais de credentials côté client
- ✅ Rate limiting activé
- ✅ CORS configuré
- ✅ Headers anti-bot
- ✅ Cache avec TTL
- ❌ Pas de logs des credentials
- ❌ Pas de credentials dans les URLs client

## 🐛 Troubleshooting

### Erreur "Configuration error"

→ Vérifier les variables d'environnement dans `.env.local`

### Erreur "Rate limit exceeded"

→ Attendre 1 minute ou augmenter la limite dans `/lib/rate-limiter.ts`

### Erreur 884 persistante

→ Vérifier les headers dans `/lib/xtream.ts`
→ Augmenter le délai de backoff
→ Vérifier que le cache fonctionne

### Chaîne ne charge pas

→ Vérifier l'URL dans les DevTools
→ Tester le fallback TS
→ Vérifier les logs serveur

## 📚 Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [HLS.js](https://github.com/video-dev/hls.js/)
- [Xtream Codes API](https://xtream-codes.com/panel/api)
- [PWA Guide](https://web.dev/progressive-web-apps/)

## 🎉 Critères d'acceptation

- ✅ Les chaînes s'affichent sans appeler le M3U
- ✅ Lecture HLS si dispo, sinon TS
- ✅ Pas de credentials en clair côté client
- ✅ Plus d'erreur 884 côté front
- ✅ Retry/backoff/cache gérés au proxy
- ✅ Rate limiting fonctionnel
- ✅ Auto-reconnect sur erreur réseau
- ✅ Favoris en localStorage
- ✅ Recherche et filtres par catégorie
- ✅ Interface responsive mobile

---

**Version** : 1.0.0
**Date** : 2025-01-30
**Auteur** : Claude Code
