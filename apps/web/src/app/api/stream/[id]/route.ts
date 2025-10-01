import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy pour les streams vidéo Xtream
 * Permet de contourner les restrictions CORS et Mixed Content
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const streamId = params.id;
  const format = request.nextUrl.searchParams.get('format') || 'ts';

  const baseUrl = process.env.XTREAM_BASE_URL;
  const username = process.env.XTREAM_USERNAME;
  const password = process.env.XTREAM_PASSWORD;

  if (!baseUrl || !username || !password) {
    return new NextResponse('Configuration Xtream manquante', { status: 500 });
  }

  const extension = format === 'hls' ? 'm3u8' : 'ts';
  const streamUrl = `${baseUrl}/live/${username}/${password}/${streamId}.${extension}`;

  try {
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
      },
    });

    if (!response.ok) {
      return new NextResponse('Stream non disponible', { status: 404 });
    }

    const data = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') ||
                       (format === 'hls' ? 'application/vnd.apple.mpegurl' : 'video/mp2t');

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Stream Proxy] Error:', error);
    return new NextResponse('Erreur lors du chargement du stream', { status: 500 });
  }
}
