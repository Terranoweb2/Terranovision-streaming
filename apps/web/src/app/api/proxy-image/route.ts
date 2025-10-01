import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy pour les images de logos Xtream
 * Évite les problèmes CORS et Mixed Content
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Fetch l'image depuis l'URL Xtream
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
      },
      // Cache pour 1 heure
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });
  } catch (error) {
    console.error('[Proxy Image] Error fetching image:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
