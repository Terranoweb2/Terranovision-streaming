import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Cache en mémoire pour les images (simple Map)
const imageCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 heures

/**
 * GET /api/image-proxy?url=...
 * Proxifie les images pour éviter les problèmes CORS et les erreurs 509
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('Missing url parameter', { status: 400 });
    }

    // Vérifier le cache
    const cached = imageCache.get(imageUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new NextResponse(Buffer.from(cached.data), {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, immutable',
          'X-Cache': 'HIT',
        },
      });
    }

    // Nettoyer le cache périodiquement (supprimer les entrées expirées)
    if (imageCache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of imageCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          imageCache.delete(key);
        }
      }
    }

    // Télécharger l'image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://terranovision.app',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      console.error(`[Image Proxy] Failed to fetch image: ${response.status} ${imageUrl}`);
      
      // Retourner une image placeholder en cas d'erreur
      return new NextResponse(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#1e293b"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#64748b" font-size="60">📺</text></svg>',
        {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600',
          },
        }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Mettre en cache
    imageCache.set(imageUrl, {
      data: buffer,
      contentType,
      timestamp: Date.now(),
    });

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    console.error('[Image Proxy] Error:', error.message);

    // Retourner une image placeholder SVG en cas d'erreur
    return new NextResponse(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#1e293b"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#64748b" font-size="60">📺</text></svg>',
      {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  }
}

