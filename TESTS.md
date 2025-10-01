# Tests TerranoVision - Solution Xtream

## ✅ Tests unitaires recommandés

### 1. Service Xtream (`/lib/xtream.ts`)

```typescript
// __tests__/lib/xtream.test.ts
import { getXtreamChannels, buildStreamUrl } from '@/lib/xtream';

describe('Xtream Service', () => {
  it('devrait construire correctement l\'URL HLS', () => {
    const url = buildStreamUrl({
      baseUrl: 'http://example.com',
      username: 'user',
      password: 'pass'
    }, 123, 'hls');

    expect(url).toBe('http://example.com/live/user/pass/123.m3u8');
  });

  it('devrait construire correctement l\'URL TS', () => {
    const url = buildStreamUrl({
      baseUrl: 'http://example.com',
      username: 'user',
      password: 'pass'
    }, 123, 'ts');

    expect(url).toBe('http://example.com/live/user/pass/123.ts');
  });
});
```

### 2. Rate Limiter (`/lib/rate-limiter.ts`)

```typescript
// __tests__/lib/rate-limiter.test.ts
import { checkRateLimit } from '@/lib/rate-limiter';

describe('Rate Limiter', () => {
  it('devrait autoriser les requêtes sous la limite', () => {
    const result = checkRateLimit('test-ip', { maxRequests: 60, windowMs: 60000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
  });

  it('devrait bloquer après la limite', () => {
    const ip = 'test-ip-2';
    for (let i = 0; i < 60; i++) {
      checkRateLimit(ip, { maxRequests: 60, windowMs: 60000 });
    }

    const result = checkRateLimit(ip, { maxRequests: 60, windowMs: 60000 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
```

## 🧪 Tests d'intégration

### Test API `/api/xtream/list`

```bash
# Démarrer le serveur
pnpm dev

# Tester l'endpoint
curl -v http://localhost:3000/api/xtream/list

# Vérifier :
# - Status 200
# - Header X-RateLimit-Remaining
# - Body contient { channels: [...], count: N }
```

### Test API `/api/xtream/epg`

```bash
# Avec un channelId valide
curl http://localhost:3000/api/xtream/epg?channelId=123

# Sans channelId (doit retourner 400)
curl http://localhost:3000/api/xtream/epg

# Avec channelId invalide (doit gérer l'erreur)
curl http://localhost:3000/api/xtream/epg?channelId=invalid
```

## 🎭 Tests E2E avec Playwright

```typescript
// tests/xtream.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Xtream Integration', () => {
  test('devrait charger la liste des chaînes', async ({ page }) => {
    await page.goto('/channels');

    // Attendre le chargement
    await page.waitForSelector('[data-testid="channel-grid"]', { timeout: 10000 });

    // Vérifier qu'il y a des chaînes
    const channels = await page.locator('[data-testid="channel-card"]').count();
    expect(channels).toBeGreaterThan(0);
  });

  test('devrait rechercher une chaîne', async ({ page }) => {
    await page.goto('/channels');

    // Rechercher
    await page.fill('input[type="search"]', 'TF1');

    // Vérifier les résultats
    const results = await page.locator('[data-testid="channel-card"]').count();
    expect(results).toBeGreaterThan(0);
  });

  test('devrait lire une chaîne', async ({ page }) => {
    await page.goto('/channels');

    // Cliquer sur la première chaîne
    await page.click('[data-testid="channel-card"]:first-child');

    // Vérifier qu'on est sur la page watch
    await expect(page).toHaveURL(/\/watch\/\d+/);

    // Vérifier que le player est chargé
    await page.waitForSelector('video', { timeout: 15000 });
  });

  test('devrait gérer le fallback HLS→TS', async ({ page }) => {
    // Simuler une erreur réseau
    await page.route('**/*.m3u8', route => route.abort());

    await page.goto('/watch/123');

    // Attendre le fallback vers TS
    await page.waitForTimeout(5000);

    // Vérifier que le message d'erreur ou le fallback s'affiche
    const errorMessage = await page.locator('text=/Passage au flux TS/i');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });
});
```

## 🔥 Tests de charge

### Test de rate limiting

```javascript
// load-test.js
const fetch = require('node-fetch');

async function loadTest() {
  const promises = [];

  // 100 requêtes simultanées
  for (let i = 0; i < 100; i++) {
    promises.push(
      fetch('http://localhost:3000/api/xtream/list')
        .then(r => ({ status: r.status, headers: r.headers.get('x-ratelimit-remaining') }))
    );
  }

  const results = await Promise.all(promises);

  const blocked = results.filter(r => r.status === 429).length;
  const allowed = results.filter(r => r.status === 200).length;

  console.log(`Allowed: ${allowed}, Blocked: ${blocked}`);
  console.log('Rate limiting works:', blocked > 0);
}

loadTest();
```

### Test de cache

```bash
# 1ère requête (cache miss)
time curl http://localhost:3000/api/xtream/list

# 2ème requête (cache hit, doit être plus rapide)
time curl http://localhost:3000/api/xtream/list
```

## 🐛 Tests de gestion d'erreur

### Simuler erreur 884

```typescript
// Modifier temporairement /lib/xtream.ts pour forcer une erreur
async function fetchWithRetry(url: string) {
  // Forcer une erreur 884
  throw new Error('884: Bot detected');
}

// Vérifier que le retry/backoff fonctionne
// Logs attendus :
// [Xtream] Attempt 1 failed (884), retrying in 500ms...
// [Xtream] Attempt 2 failed (884), retrying in 1000ms...
// etc.
```

### Test sans credentials

```bash
# Supprimer les variables d'env
unset XTREAM_BASE_URL
unset XTREAM_USERNAME
unset XTREAM_PASSWORD

# Démarrer le serveur
pnpm dev

# Tester l'API (doit retourner 500)
curl http://localhost:3000/api/xtream/list
# Réponse attendue : { "error": "Configuration error" }
```

## 📊 Tests de performance

### Lighthouse CI

```bash
# Installer Lighthouse
npm install -g @lhci/cli

# Tester la page channels
lhci autorun --collect.url=http://localhost:3000/channels

# Objectifs :
# - Performance : > 80
# - Accessibility : > 90
# - Best Practices : > 90
# - SEO : > 80
```

### Bundle size

```bash
# Analyser le bundle
pnpm build
npx @next/bundle-analyzer

# Vérifier :
# - First Load JS < 100kB
# - Pas de chunks > 500kB
```

## ✅ Checklist avant prod

- [ ] Variables d'env configurées sur Vercel/Replit
- [ ] `.env.local` ajouté au `.gitignore`
- [ ] Tests E2E passent
- [ ] Rate limiting fonctionne
- [ ] Cache fonctionne (hit rate > 80%)
- [ ] Fallback HLS→TS fonctionne
- [ ] Auto-reconnect fonctionne (3 retries)
- [ ] Pas d'erreur 884 dans les logs
- [ ] Lighthouse score > 80
- [ ] Build Next.js réussit
- [ ] PWA manifeste valide
- [ ] Service Worker généré
- [ ] Credentials jamais exposés côté client

## 🚀 Commandes de test

```bash
# Tests unitaires
pnpm test

# Tests E2E
pnpm test:e2e

# Build
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint

# Démarrer en dev
pnpm dev

# Démarrer en prod
pnpm start
```

## 📝 Résultats attendus

### Page /channels
- ✅ Liste des chaînes s'affiche en < 3s
- ✅ Recherche fonctionne instantanément
- ✅ Filtres par catégorie fonctionnent
- ✅ Vue grille/liste basculent
- ✅ Logos s'affichent

### Page /watch/[id]
- ✅ Flux HLS démarre en < 5s
- ✅ Fallback TS si HLS échoue
- ✅ Auto-reconnect après erreur réseau
- ✅ Contrôles lecteur réactifs
- ✅ Favoris fonctionnent

### API /api/xtream/list
- ✅ Retourne 200 avec liste de chaînes
- ✅ Cache actif (10 min TTL)
- ✅ Rate limiting (60/min)
- ✅ Headers anti-bot présents
- ✅ Retry sur erreur 884

### API /api/xtream/epg
- ✅ Retourne EPG si disponible
- ✅ 400 si channelId manquant
- ✅ Rate limiting actif

---

**Note** : Exécuter ces tests régulièrement pour garantir la stabilité de l'application.
