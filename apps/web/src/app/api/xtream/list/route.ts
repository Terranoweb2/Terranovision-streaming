import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { withCache } from '@/lib/cache';
import type { XtreamChannel } from '@/lib/xtream';

export const dynamic = 'force-dynamic';

// Credentials Xtream
const XTREAM_CONFIG = {
  host: 'http://line.l-ion.xyz',
  username: 'CanaL-IPTV',
  password: '63KQ5913',
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

    // Récupérer les chaînes depuis l'API Xtream avec cache
    const cacheKey = 'xtream:channels';
    const channels = await withCache(
      cacheKey,
      async () => {
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

          // Utiliser le proxy pour contourner les problèmes DNS sur mobile
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
      },
      10 * 60 * 1000 // Cache 10 minutes
    );

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
    console.error('[API] Error fetching channels:', error);

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
