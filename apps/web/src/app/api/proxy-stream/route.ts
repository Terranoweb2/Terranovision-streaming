import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 🔐 CORS headers for streaming
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, Content-Type, Accept, Origin, Referer, User-Agent',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
};

/**
 * Handle OPTIONS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Proxy pour les streams Xtream en HTTP
 * Permet d'accéder aux streams HTTP depuis une page HTTPS
 */
export async function GET(request: NextRequest) {
  const streamUrl = request.nextUrl.searchParams.get('url');

  if (!streamUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    console.log(`[Proxy Stream] Fetching: ${streamUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout pour mobile

    // Extract origin and construct Referer for segments
    const streamUrlObj = new URL(streamUrl);
    const streamOrigin = streamUrlObj.origin;

    // For .ts segments, Referer should be the .m3u8 manifest
    let referer = `${streamOrigin}/`;
    if (streamUrl.includes('.ts')) {
      // Extract manifest path from segment URL
      // Example: /hls/xxx/820847_3575.ts → /live/CanaL-IPTV/63KQ5913/820847.m3u8
      const streamIdMatch = streamUrl.match(/\/(\d+)_\d+\.ts$/);
      if (streamIdMatch) {
        const streamId = streamIdMatch[1];
        referer = `${streamOrigin}/live/CanaL-IPTV/63KQ5913/${streamId}.m3u8`;
      }
    }

    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Referer': referer,
        // Forward Range header for seeking support
        ...(request.headers.get('range') ? { 'Range': request.headers.get('range')! } : {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(`[Proxy Stream] Response status: ${response.status} for ${streamUrl}`);

    if (!response.ok) {
      console.error(`[Proxy Stream] Error ${response.status} for ${streamUrl}`);

      // 🔧 Map non-standard status codes to standard ones
      let mappedStatus = response.status;
      if (response.status === 458 || response.status >= 600) {
        mappedStatus = 502; // Bad Gateway for upstream errors
      } else if (response.status === 509) {
        mappedStatus = 503; // Service Unavailable for bandwidth limit
      }

      return new NextResponse(`Stream error: ${response.status}`, {
        status: mappedStatus,
        headers: CORS_HEADERS,
      });
    }

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';

    // For HLS manifests, rewrite URLs to proxy ALL requests (manifest + segments)
    if (contentType.includes('mpegurl') || contentType.includes('m3u8') || streamUrl.endsWith('.m3u8')) {
      const manifestText = await response.text();

      // Réécrire toutes les URLs pour passer par le proxy
      const rewrittenManifest = manifestText.split('\n').map(line => {
        line = line.trim();

        // Ignorer les commentaires et lignes vides
        if (line.startsWith('#') || line.length === 0) {
          return line;
        }

        let segmentUrl = line;

        // Si URL relative, la rendre absolue
        if (!segmentUrl.startsWith('http://') && !segmentUrl.startsWith('https://')) {
          // Si l'URL commence par /, c'est une URL absolue du serveur
          if (segmentUrl.startsWith('/')) {
            const streamUrlObj = new URL(streamUrl);
            segmentUrl = streamUrlObj.origin + segmentUrl;
          } else {
            // URL relative au manifest
            const basePath = streamUrl.substring(0, streamUrl.lastIndexOf('/') + 1);
            segmentUrl = basePath + segmentUrl;
          }
        }

        // Passer par le proxy pour éviter l'erreur 458
        return `/api/proxy-stream?url=${encodeURIComponent(segmentUrl)}`;
      }).join('\n');

      return new NextResponse(rewrittenManifest, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...CORS_HEADERS,
        },
      });
    }

    // Stream the response for non-manifest files
    const responseHeaders = new Headers(CORS_HEADERS);
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    // 📦 Forward streaming headers
    if (response.headers.has('content-length')) {
      responseHeaders.set('Content-Length', response.headers.get('content-length')!);
    }
    if (response.headers.has('content-range')) {
      responseHeaders.set('Content-Range', response.headers.get('content-range')!);
    }
    if (response.headers.has('accept-ranges')) {
      responseHeaders.set('Accept-Ranges', response.headers.get('accept-ranges')!);
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`[Proxy Stream] Timeout for ${streamUrl}`);
      return new NextResponse('Stream timeout', {
        status: 504,
        headers: CORS_HEADERS,
      });
    }

    console.error('[Proxy Stream] Error:', error);
    return new NextResponse('Failed to fetch stream', {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
