const http = require('http');
const https = require('https');
const url = require('url');
const redis = require('redis');

// 🔴 Configuration Redis
const redisClient = redis.createClient({
  socket: {
    host: 'localhost',
    port: 6379,
  },
  legacyMode: false,
});

redisClient.on('error', (err) => console.error('[Redis] Error:', err));
redisClient.on('connect', () => console.log('[Redis] Connected'));

// Connexion Redis
(async () => {
  await redisClient.connect();
})();

// 📊 Configuration
const MANIFEST_CACHE_TTL = 5; // 5 secondes pour les manifests .m3u8
const SEGMENT_CACHE_TTL = 10; // 10 secondes pour les segments .ts
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 4000, 8000]; // Backoff exponentiel

// 📈 Statistiques
let stats = {
  requests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  retries: 0,
  errors: 0,
};

// 🔄 Fonction de retry avec backoff exponentiel
async function fetchWithRetry(targetUrl, options, retryCount = 0) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(targetUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const proxyReq = client.request(targetUrl, options, (proxyRes) => {
      const chunks = [];

      proxyRes.on('data', (chunk) => chunks.push(chunk));

      proxyRes.on('end', () => {
        const data = Buffer.concat(chunks);

        // ⚠️ Si erreur 509 (Bandwidth Limit) ou 503, retry
        if ((proxyRes.statusCode === 509 || proxyRes.statusCode === 503) && retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryCount];
          console.log(`[Proxy] Error ${proxyRes.statusCode}, retry ${retryCount + 1}/${MAX_RETRIES} after ${delay}ms...`);
          stats.retries++;

          setTimeout(async () => {
            try {
              const result = await fetchWithRetry(targetUrl, options, retryCount + 1);
              resolve(result);
            } catch (err) {
              reject(err);
            }
          }, delay);
          return;
        }

        resolve({ statusCode: proxyRes.statusCode, headers: proxyRes.headers, data });
      });
    });

    proxyReq.on('error', (err) => {
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[retryCount];
        console.log(`[Proxy] Network error, retry ${retryCount + 1}/${MAX_RETRIES} after ${delay}ms...`);
        stats.retries++;

        setTimeout(async () => {
          try {
            const result = await fetchWithRetry(targetUrl, options, retryCount + 1);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }, delay);
      } else {
        reject(err);
      }
    });

    proxyReq.end();
  });
}

// 🌐 Serveur HTTP
const server = http.createServer(async (req, res) => {
  stats.requests++;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept, Origin, Referer, User-Agent');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const targetUrl = parsedUrl.query.url;

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing url parameter');
    return;
  }

  try {
    console.log(`[Proxy] Request: ${targetUrl}`);

    // 🔍 Vérifier le cache Redis
    const isManifest = targetUrl.endsWith('.m3u8');
    const isSegment = targetUrl.endsWith('.ts');
    const cacheKey = `xtream:${targetUrl}`;

    if (isManifest || isSegment) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          stats.cacheHits++;
          console.log(`[Cache HIT] ${targetUrl.substring(0, 80)}...`);

          const cachedData = JSON.parse(cached);
          res.writeHead(200, {
            'Content-Type': cachedData.contentType,
            'Cache-Control': 'no-cache',
            ...cachedData.headers,
          });
          res.end(cachedData.data, cachedData.encoding);
          return;
        }
      } catch (cacheErr) {
        console.error('[Cache] Error reading:', cacheErr);
      }
      stats.cacheMisses++;
    }

    // 📡 Récupérer depuis Xtream avec retry
    const parsedTargetUrl = url.parse(targetUrl);
    const targetOrigin = parsedTargetUrl.protocol + '//' + parsedTargetUrl.host;

    // 🔧 Referer intelligent pour les segments .ts
    let referer = `${targetOrigin}/`;
    if (targetUrl.includes('.ts')) {
      const streamIdMatch = targetUrl.match(/\/(\d+)_\d+\.ts$/);
      if (streamIdMatch) {
        const streamId = streamIdMatch[1];
        const pathParts = parsedTargetUrl.pathname.split('/');
        const username = pathParts[2];
        const password = pathParts[3];
        referer = `${targetOrigin}/live/${username}/${password}/${streamId}.m3u8`;
      }
    }

    const options = {
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': referer,
        ...(req.headers.range ? { 'Range': req.headers.range } : {}),
      },
    };

    const result = await fetchWithRetry(targetUrl, options);

    // Gestion des redirects
    if (result.statusCode === 302 || result.statusCode === 301) {
      const redirectUrl = result.headers.location;
      res.writeHead(result.statusCode, {
        'Location': `/xtream-proxy?url=${encodeURIComponent(redirectUrl)}`,
        'Access-Control-Allow-Origin': '*',
      });
      res.end();
      return;
    }

    const contentType = result.headers['content-type'] || 'application/octet-stream';

    // 📝 Pour les manifests M3U8, réécrire les URLs
    if (isManifest || contentType.includes('mpegurl')) {
      let manifestText = result.data.toString('utf-8');

      // ⚠️ Détecter les flux offline
      if (manifestText.includes('offline.ts') || targetUrl.includes('offline')) {
        console.log(`[Proxy] ⚠️ Offline stream detected: ${targetUrl}`);
        res.writeHead(503, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ error: 'Stream offline', message: 'This channel is currently offline' }));
        return;
      }

      // Réécrire toutes les URLs pour passer par le proxy
      manifestText = manifestText.split('\n').map(line => {
        line = line.trim();
        if (line.startsWith('#') || line.length === 0) {
          return line;
        }

        let segmentUrl = line;

        // Si URL relative, la rendre absolue
        if (!segmentUrl.startsWith('http://') && !segmentUrl.startsWith('https://')) {
          const basePath = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
          segmentUrl = basePath + segmentUrl;
        }

        // Passer tous les segments par le proxy
        return `/xtream-proxy?url=${encodeURIComponent(segmentUrl)}`;
      }).join('\n');

      // 💾 Mettre en cache le manifest
      try {
        await redisClient.setEx(
          cacheKey,
          MANIFEST_CACHE_TTL,
          JSON.stringify({
            data: manifestText,
            contentType: 'application/vnd.apple.mpegurl',
            headers: { 'Access-Control-Allow-Origin': '*' },
            encoding: 'utf-8',
          })
        );
      } catch (cacheErr) {
        console.error('[Cache] Error writing:', cacheErr);
      }

      res.writeHead(200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(manifestText);
      return;
    }

    // 📦 Pour les segments .ts, mettre en cache
    if (isSegment) {
      try {
        await redisClient.setEx(
          cacheKey,
          SEGMENT_CACHE_TTL,
          JSON.stringify({
            data: result.data.toString('base64'),
            contentType,
            headers: {
              'Content-Length': result.data.length,
              'Access-Control-Allow-Origin': '*',
            },
            encoding: 'base64',
          })
        );
      } catch (cacheErr) {
        console.error('[Cache] Error writing segment:', cacheErr);
      }
    }

    // 📤 Streamer la réponse
    const responseHeaders = {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    };

    if (result.headers['content-length']) {
      responseHeaders['Content-Length'] = result.headers['content-length'];
    }
    if (result.headers['content-range']) {
      responseHeaders['Content-Range'] = result.headers['content-range'];
    }
    if (result.headers['accept-ranges']) {
      responseHeaders['Accept-Ranges'] = result.headers['accept-ranges'];
    }

    res.writeHead(result.statusCode, responseHeaders);
    res.end(result.data);
  } catch (error) {
    stats.errors++;
    console.error('[Proxy] Error:', error.message);
    res.writeHead(500, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(`Proxy error: ${error.message}`);
  }
});

// 📊 Endpoint de statistiques
const statsServer = http.createServer((req, res) => {
  if (req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ...stats,
      cacheHitRate: stats.requests > 0 ? ((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(2) + '%' : '0%',
      uptime: process.uptime(),
    }, null, 2));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// 🚀 Démarrage
const PORT = process.env.PORT || 3001;
const STATS_PORT = 3002;

server.listen(PORT, () => {
  console.log(`🚀 [Xtream Proxy] Listening on port ${PORT}`);
  console.log(`📊 [Stats] Available on http://localhost:${STATS_PORT}/stats`);
  console.log(`🔴 [Redis] Cache enabled (Manifests: ${MANIFEST_CACHE_TTL}s, Segments: ${SEGMENT_CACHE_TTL}s)`);
  console.log(`🔄 [Retry] Max ${MAX_RETRIES} retries with exponential backoff`);
});

statsServer.listen(STATS_PORT, () => {
  console.log(`📈 Stats server listening on port ${STATS_PORT}`);
});

// 🛑 Nettoyage propre
process.on('SIGINT', async () => {
  console.log('\n[Shutdown] Closing connections...');
  await redisClient.quit();
  server.close(() => {
    console.log('[Shutdown] Server closed');
    process.exit(0);
  });
});
