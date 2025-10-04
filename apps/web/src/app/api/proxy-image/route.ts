import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/cache';

/**
 * Proxy pour les images de logos Xtream
 * Évite les problèmes CORS et Mixed Content
 * Avec cache en mémoire et fallback transparent
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Cache l'image pendant 1 heure
    const cacheKey = `image:${imageUrl}`;

    const imageData = await withCache(
      cacheKey,
      async () => {
        // Fetch l'image depuis l'URL Xtream avec retry
        const response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
            'Accept': 'image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
          },
          signal: AbortSignal.timeout(5000), // Timeout 5s
        });

        if (!response.ok) {
          // Si erreur 509 (bandwidth) ou 404, on retourne null pour fallback
          if (response.status === 509 || response.status === 404) {
            console.log(`[Proxy Image] Server error ${response.status} for ${imageUrl}`);
            return null;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        return {
          buffer,
          contentType,
        };
      },
      60 * 60 * 1000 // 1 heure
    );

    // Si pas d'image (erreur serveur), retourner une image transparente 1x1
    if (!imageData) {
      // PNG transparent 1x1 pixel (43 bytes)
      const transparentPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      return new NextResponse(transparentPng, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400, immutable', // Cache 24h
        },
      });
    }

    return new NextResponse(imageData.buffer, {
      status: 200,
      headers: {
        'Content-Type': imageData.contentType,
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });
  } catch (error: any) {
    console.error('[Proxy Image] Error fetching image:', error.message);

    // Retourner une image transparente en cas d'erreur
    const transparentPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    return new NextResponse(transparentPng, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300, immutable', // Cache 5min
      },
    });
  }
}
