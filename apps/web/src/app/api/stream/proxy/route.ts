import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stream/proxy?url=...
 * Proxy pour contourner les problèmes DNS/CORS sur mobile
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamUrl = searchParams.get('url');

    if (!streamUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    console.log('[Stream Proxy] Proxying:', streamUrl);

    // Fetch le stream avec headers VLC
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        'Accept': '*/*',
        'Connection': 'keep-alive',
      },
      // @ts-ignore
      signal: request.signal,
    });

    if (!response.ok) {
      // Ne pas logger les 404 (chaînes offline normales)
      if (response.status !== 404) {
        console.error('[Stream Proxy] Failed:', response.status, response.statusText);
      }

      // Pour les segments .ts, retourner 204 No Content au lieu de 404 pour éviter logs console
      if (streamUrl.endsWith('.ts')) {
        return new NextResponse(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      // Pour les M3U8, retourner l'erreur normale
      return NextResponse.json(
        { error: 'Stream not available', status: response.status },
        { status: response.status }
      );
    }

    // Récupérer le content-type
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Pour les streams M3U8, on peut modifier le contenu pour proxifier les segments
    if (contentType.includes('mpegurl') || contentType.includes('m3u')) {
      const text = await response.text();

      // Remplacer les URLs relatives/absolutes dans le M3U8 pour qu'elles passent par notre proxy
      const modifiedText = text.replace(
        /(https?:\/\/[^\s]+)/g,
        (match) => {
          const encodedUrl = encodeURIComponent(match);
          return `/api/stream/proxy?url=${encodedUrl}`;
        }
      );

      return new NextResponse(modifiedText, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Pour les autres types (TS, etc.), streamer directement
    const stream = response.body;

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('[Stream Proxy] Error:', error.message);

    return NextResponse.json(
      { error: 'Proxy error', message: error.message },
      { status: 500 }
    );
  }
}

// Support CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
      'Access-Control-Max-Age': '86400',
    },
  });
}
