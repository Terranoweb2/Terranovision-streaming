/**
 * Xtream Proxy Server v2 - avec module HTTP natif
 * Contourne anti-bot 458/403 en utilisant http.request au lieu de fetch
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

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
    const isHttps = targetUrlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    // Referer for segments
    let referer = `${targetUrlObj.origin}/`;
    if (targetUrl.includes('.ts')) {
      const streamIdMatch = targetUrl.match(/\/(\d+)_\d+\.ts$/);
      if (streamIdMatch) {
        const streamId = streamIdMatch[1];
        referer = `${targetUrlObj.origin}/live/CanaL-IPTV/63KQ5913/${streamId}.m3u8`;
      }
    }

    const options = {
      method: req.method,
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Accept': '*/*',
        ...(req.headers.range ? { 'Range': req.headers.range } : {}),
      },
      timeout: 60000,
    };

    const proxyReq = client.request(targetUrl, options, (proxyRes) => {
      console.log(`[Xtream Proxy] ${proxyRes.statusCode} ${targetUrl}`);

      // Handle redirects manually
      if (proxyRes.statusCode === 302 || proxyRes.statusCode === 301) {
        const redirectUrl = proxyRes.headers.location;
        console.log(`[Xtream Proxy] Redirect to: ${redirectUrl}`);

        // Forward redirect to client
        res.writeHead(proxyRes.statusCode, {
          'Location': `/xtream-proxy?url=${encodeURIComponent(redirectUrl)}`,
          'Access-Control-Allow-Origin': '*',
        });
        res.end();
        return;
      }

      const contentType = proxyRes.headers['content-type'] || '';

      // For M3U8 manifests, rewrite URLs
      if (contentType.includes('mpegurl') || contentType.includes('m3u8') || targetUrl.endsWith('.m3u8')) {
        let data = '';
        proxyRes.on('data', chunk => { data += chunk; });
        proxyRes.on('end', () => {
          const baseUrl = new URL(targetUrl);
          const basePath = baseUrl.origin + baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/'));

          const rewritten = data
            .split('\n')
            .map(line => {
              if (line.startsWith('#') || line.trim() === '') return line;

              let url = line.trim();
              if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = url.startsWith('/') ? baseUrl.origin + url : basePath + '/' + url;
              }

              if (url.startsWith('http://') || url.startsWith('https://')) {
                return `/xtream-proxy?url=${encodeURIComponent(url)}`;
              }

              return line;
            })
            .join('\n');

          res.writeHead(200, {
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
          });
          res.end(rewritten);
        });
        return;
      }

      // For segments, stream directly
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        ...(proxyRes.headers['content-length'] ? { 'Content-Length': proxyRes.headers['content-length'] } : {}),
        ...(proxyRes.headers['content-range'] ? { 'Content-Range': proxyRes.headers['content-range'] } : {}),
        ...(proxyRes.headers['accept-ranges'] ? { 'Accept-Ranges': proxyRes.headers['accept-ranges'] } : {}),
      });

      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[Xtream Proxy] Error:', err.message);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
      }
      res.end(`Error: ${err.message}`);
    });

    proxyReq.end();
  } catch (err) {
    console.error('[Xtream Proxy] Error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Error: ${err.message}`);
  }
});

server.listen(PORT, () => {
  console.log(`✅ Xtream Proxy Server v2 running on http://localhost:${PORT}`);
});
