import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limiter';
import { withCache } from '@/lib/cache';
import { parseM3U, m3uToXtreamChannels } from '@/lib/m3u-parser';

export const dynamic = 'force-dynamic';

/**
 * GET /api/xtream/list
 * Récupère la liste des chaînes depuis le cache playlist serveur
 * Évite erreur 509 bandwidth en utilisant le cache 1h côté serveur
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

    // Récupérer les chaînes depuis le cache playlist serveur (95% réduction bandwidth)
    const cacheKey = 'playlist:m3u_plus';
    const channels = await withCache(
      cacheKey,
      async () => {
        // Fallback sur plusieurs formats pour maximiser disponibilité
        const formats = ['m3u_plus_m3u8', 'webtvlist_ts', 'gst_ts'];

        for (const format of formats) {
          try {
            const playlistUrl = `http://terranovision.cloud/playlist/${format}`;
            console.log(`[API] Fetching playlist from cache server: ${format}`);

            const response = await fetch(playlistUrl, {
              headers: {
                'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
              },
              signal: AbortSignal.timeout(10000), // 10s timeout
            });

            if (!response.ok) {
              console.warn(`[API] Format ${format} failed: ${response.status}`);
              continue; // Essayer format suivant
            }

            const playlistContent = await response.text();

            // Parser M3U
            const m3uChannels = parseM3U(playlistContent);

            if (m3uChannels.length === 0) {
              console.warn(`[API] Format ${format} returned 0 channels`);
              continue;
            }

            // Convertir vers format Xtream
            const xtreamChannels = m3uToXtreamChannels(m3uChannels);

            console.log(`[API] Successfully loaded ${xtreamChannels.length} channels from ${format}`);
            return xtreamChannels;
          } catch (error: any) {
            console.error(`[API] Error with format ${format}:`, error.message);
            continue;
          }
        }

        throw new Error('Tous les formats de playlist ont échoué');
      },
      10 * 60 * 1000 // Cache 10 minutes local + cache 1h serveur = double protection
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
