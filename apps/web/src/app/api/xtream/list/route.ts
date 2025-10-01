import { NextRequest, NextResponse } from 'next/server';
import { getXtreamChannels } from '@/lib/xtream';
import { checkRateLimit } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

/**
 * GET /api/xtream/list
 * Récupère la liste des chaînes depuis l'API Xtream
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
          resetTime: new Date(rateLimit.resetTime).toISOString(),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    // Vérifier les variables d'environnement
    const baseUrl = process.env.XTREAM_BASE_URL;
    const username = process.env.XTREAM_USERNAME;
    const password = process.env.XTREAM_PASSWORD;

    if (!baseUrl || !username || !password) {
      console.error('[API] Missing Xtream credentials');
      return NextResponse.json(
        { error: 'Configuration error', message: 'Credentials Xtream manquantes' },
        { status: 500 }
      );
    }

    // Récupérer les chaînes
    const channels = await getXtreamChannels({
      baseUrl,
      username,
      password,
    });

    return NextResponse.json(
      { channels, count: channels.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error('[API] Error fetching Xtream channels:', error);

    // Déterminer le statut d'erreur
    let status = 500;
    let message = 'Erreur lors de la récupération des chaînes';

    if (error.message?.includes('884')) {
      status = 503;
      message = 'Protection anti-bot détectée, nouvelle tentative en cours...';
    } else if (error.message?.includes('429')) {
      status = 429;
      message = 'Limite de débit atteinte, réessayez dans quelques instants';
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch channels',
        message,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status }
    );
  }
}
