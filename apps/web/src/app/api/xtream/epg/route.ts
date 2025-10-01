import { NextRequest, NextResponse } from 'next/server';
import { getXtreamEPG } from '@/lib/xtream';
import { checkRateLimit } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

/**
 * GET /api/xtream/epg?channelId=123
 * Récupère l'EPG d'une chaîne depuis l'API Xtream
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting par IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(ip, { maxRequests: 60, windowMs: 60000 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Récupérer le channelId depuis les query params
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json(
        { error: 'Missing channelId parameter' },
        { status: 400 }
      );
    }

    const streamId = parseInt(channelId, 10);
    if (isNaN(streamId)) {
      return NextResponse.json(
        { error: 'Invalid channelId format' },
        { status: 400 }
      );
    }

    // Vérifier les variables d'environnement
    const baseUrl = process.env.XTREAM_BASE_URL;
    const username = process.env.XTREAM_USERNAME;
    const password = process.env.XTREAM_PASSWORD;

    if (!baseUrl || !username || !password) {
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    // Récupérer l'EPG
    const epg = await getXtreamEPG(
      {
        baseUrl,
        username,
        password,
      },
      streamId
    );

    return NextResponse.json(
      { epg },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('[API] Error fetching EPG:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch EPG',
        message: 'Erreur lors de la récupération de l\'EPG',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
