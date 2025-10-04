/**
 * Standalone Xtream Proxy Server
 * Contourne la protection anti-bot 458 du serveur Xtream
 * Lance avec: node xtream-proxy-server.js
 */

const http = require('http');
const { URL } = require('url');

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept, Origin, Referer, User-Agent');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse URL parameter
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const targetUrl = reqUrl.searchParams.get('url');

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing url parameter');
    return;
  }

  console.log(`[Xtream Proxy] ${targetUrl}`);

  try {
    const targetUrlObj = new URL(targetUrl);

    // Extract stream ID for Referer
    let referer = `${targetUrlObj.origin}/`;
    if (targetUrl.includes('.ts')) {
      const streamIdMatch = targetUrl.match(/\/(\d+)_\d+\.ts$/);
      if (streamIdMatch) {
        const streamId = streamIdMatch[1];
        referer = `${targetUrlObj.origin}/live/CanaL-IPTV/63KQ5913/${streamId}.m3u8`;
      }
    }

    // Use native fetch with redirect: 'follow'
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const proxyRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': referer,
        ...(req.headers.range ? { 'Range': req.headers.range } : {}),
      },
      signal: controller.signal,
      redirect: 'follow', // Follow redirects automatically
    });

    clearTimeout(timeoutId);
    console.log(`[Xtream Proxy] ${proxyRes.status} ${targetUrl}`);

    const contentType = proxyRes.headers.get('content-type') || '';

    // For M3U8 manifests, rewrite URLs to proxy ALL segments
    if (contentType.includes('mpegurl') || contentType.includes('m3u8') || targetUrl.endsWith('.m3u8')) {
      const manifestText = await proxyRes.text();

      // Parse base URL
      const baseUrl = new URL(targetUrl);
      const basePath = baseUrl.origin + baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/'));

      // Rewrite URLs to proxy
      const rewrittenManifest = manifestText
        .split('\n')
        .map(line => {
          if (line.startsWith('#') || line.trim() === '') return line;

          let url = line.trim();

          // Handle relative URLs
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = url.startsWith('/') ? baseUrl.origin + url : basePath + '/' + url;
          }

          // Proxy ALL URLs
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return `/xtream-proxy?url=${encodeURIComponent(url)}`;
          }

          return line;
        })
        .join('\n');

      res.writeHead(200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
        'Cache-Control': 'no-cache',
      });
      res.end(rewrittenManifest);
      return;
    }

    // For other content (segments), stream directly
    res.writeHead(proxyRes.status, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
      ...(proxyRes.headers.get('content-length') ? { 'Content-Length': proxyRes.headers.get('content-length') } : {}),
      ...(proxyRes.headers.get('content-range') ? { 'Content-Range': proxyRes.headers.get('content-range') } : {}),
      ...(proxyRes.headers.get('accept-ranges') ? { 'Accept-Ranges': proxyRes.headers.get('accept-ranges') } : {}),
    });

    if (proxyRes.body) {
      const reader = proxyRes.body.getReader();
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
          }
          res.end();
        } catch (err) {
          console.error('[Xtream Proxy] Stream error:', err.message);
          res.end();
        }
      };
      pump();
    } else {
      res.end();
    }
  } catch (err) {
    console.error('[Xtream Proxy] Error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Error: ${err.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`✅ Xtream Proxy Server running on http://localhost:${PORT}`);
  console.log(`   Usage: http://localhost:${PORT}?url=<encoded_xtream_url>`);
});
