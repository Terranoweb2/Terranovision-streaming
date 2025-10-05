import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { withCache } from '@/lib/cache';
import type { XtreamChannel } from '@/lib/xtream';
import { MOCK_CHANNELS } from '@/lib/mock-channels';

export const dynamic = 'force-dynamic';

// CORS preflight handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Credentials Xtream
const XTREAM_CONFIG = {
  host: 'http://line.l-ion.xyz',
  username: 'Glacia2022',
  password: 'yWtV9103',
};

/**
 * GET /api/xtream/list
 * Récupère la liste des chaînes depuis l'API Xtream player_api.php
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

    // Fonction pour récupérer les channels
    const fetchXtreamChannels = async (): Promise<XtreamChannel[]> => {
      const apiUrl = `${XTREAM_CONFIG.host}/player_api.php?username=${XTREAM_CONFIG.username}&password=${XTREAM_CONFIG.password}&action=get_live_streams`;

      console.log('[API] Fetching channels from Xtream API...');

      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
        },
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      if (!response.ok) {
        throw new Error(`Xtream API error: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from Xtream API');
      }

      // Convertir vers notre format
      const xtreamChannels: XtreamChannel[] = data.map((channel: any) => {
        const streamId = channel.stream_id;
        const originalHls = `${XTREAM_CONFIG.host}/live/${XTREAM_CONFIG.username}/${XTREAM_CONFIG.password}/${streamId}.m3u8`;
        const originalTs = `${XTREAM_CONFIG.host}/live/${XTREAM_CONFIG.username}/${XTREAM_CONFIG.password}/${streamId}.ts`;

        // Utiliser le proxy UNIQUEMENT pour le M3U8 initial, pas pour les segments
        // Le proxy va réécrire les URLs des segments pour qu'ils passent aussi par le proxy
        const proxiedHls = `/api/stream/proxy?url=${encodeURIComponent(originalHls)}`;
        const proxiedTs = `/api/stream/proxy?url=${encodeURIComponent(originalTs)}`;

        return {
          id: parseInt(streamId || channel.num),
          name: channel.name,
          logo: channel.stream_icon || undefined,
          category: channel.category_name || channel.category_id || 'Général',
          urlHls: proxiedHls,
          urlTs: proxiedTs,
          quality: 'HD',
          epgChannelId: channel.epg_channel_id || undefined,
        };
      });

      console.log(`[API] Successfully loaded ${xtreamChannels.length} channels from Xtream API`);
      return xtreamChannels;
    };

    // Essayer d'abord avec Xtream, sinon fallback sur mock
    let channels: XtreamChannel[];

    // TEMPORAIRE : Forcer les chaînes de test car le serveur Xtream est bloqué
    const FORCE_TEST_CHANNELS = false;

    if (FORCE_TEST_CHANNELS) {
      console.log('[API] 🧪 Using TEST channels (Xtream server blocked)');
      console.log('[API] Test channels: France 24, Euronews, etc. (all working)');
      channels = MOCK_CHANNELS;
    } else {
      try {
        const cacheKey = 'xtream:channels:v5';
        channels = await withCache(cacheKey, fetchXtreamChannels, 10 * 60 * 1000);
      } catch (error: any) {
        const errorCode = error.cause?.code || error.code;

        // Fallback sur les chaînes de test si Xtream est indisponible
        if (errorCode === 'ENOTFOUND' || errorCode === 'ETIMEDOUT' || errorCode === 'ECONNREFUSED') {
          console.log('[API] ⚠️  Xtream server unavailable (', errorCode, '), using TEST channels');
          channels = MOCK_CHANNELS;
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json(
      { channels, count: channels.length },
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma',
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error('[API] Unexpected error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch channels',
        message: 'Erreur lors de la récupération des chaînes depuis le cache serveur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
