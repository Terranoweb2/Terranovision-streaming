/**
 * Service Xtream Codes API avec retry, backoff et cache
 */

export interface XtreamChannel {
  id: number;
  name: string;
  logo?: string;
  group?: string;
  urlHls?: string;
  urlTs: string;
  quality?: string; // FHD, UHD/4K, HDR, SD, etc.
  qualityVariants?: XtreamQualityVariant[];
}

export interface XtreamQualityVariant {
  id: number;
  quality: string;
  urlHls: string;
  urlTs: string;
}

export interface XtreamConfig {
  baseUrl: string;
  username: string;
  password: string;
}

export interface XtreamLiveStream {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon?: string;
  epg_channel_id?: string;
  added: string;
  category_id: string;
  custom_sid?: string;
  tv_archive?: number;
  direct_source?: string;
  tv_archive_duration?: number;
  category_name?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Pause avec backoff exponentiel
 */
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch avec retry et backoff exponentiel
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 4
): Promise<Response> {
  const delays = [500, 1000, 2000, 4000];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18',
          'Referer': 'https://terranovision.app',
          'Origin': 'https://terranovision.app',
          ...options.headers,
        },
      });

      // Si succès (2xx) ou erreur client définitive (4xx sauf 429), retourner
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }

      // Erreur 884, 429, 5xx → retry
      if (attempt < maxRetries - 1) {
        const delay = delays[attempt];
        console.warn(`[Xtream] Attempt ${attempt + 1} failed (${response.status}), retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      return response;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        const delay = delays[attempt];
        console.warn(`[Xtream] Network error on attempt ${attempt + 1}, retrying in ${delay}ms...`, error);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Extrait la qualité depuis le nom de la chaîne
 */
function extractQuality(name: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('uhd') || nameLower.includes('4k')) return 'UHD/4K';
  if (nameLower.includes('hdr')) return 'HDR';
  if (nameLower.includes('fhd') || nameLower.includes('full hd')) return 'FHD';
  if (nameLower.includes('hd')) return 'HD';
  if (nameLower.includes('sd')) return 'SD';
  return 'Auto';
}

/**
 * Normalise le nom de la chaîne en supprimant les indicateurs de qualité
 */
function normalizeChannelName(name: string): string {
  return name
    .replace(/\s*(UHD|4K|HDR|FHD|FULL HD|HD|SD)\s*/gi, '')
    .replace(/\s*\/\s*/g, ' ')
    .trim();
}

/**
 * Récupère les chaînes live depuis l'API Xtream
 */
export async function getXtreamChannels(config: XtreamConfig): Promise<XtreamChannel[]> {
  const cacheKey = `channels_${config.username}`;

  // Vérifier le cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Xtream] Returning cached channels');
    return cached.data;
  }

  const url = `${config.baseUrl}/player_api.php?username=${config.username}&password=${config.password}&action=get_live_streams`;

  try {
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`Xtream API error: ${response.status} ${response.statusText}`);
    }

    const data: XtreamLiveStream[] = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Empty or invalid response from Xtream API');
    }

    // Grouper les chaînes par nom normalisé
    const channelGroups = new Map<string, XtreamLiveStream[]>();

    data.forEach((stream) => {
      const normalizedName = normalizeChannelName(stream.name);
      const key = `${normalizedName}_${stream.category_id}`;

      if (!channelGroups.has(key)) {
        channelGroups.set(key, []);
      }
      channelGroups.get(key)!.push(stream);
    });

    // Créer les chaînes avec leurs variantes de qualité
    const channels: XtreamChannel[] = [];

    channelGroups.forEach((streams, key) => {
      // Trier par qualité (UHD > HDR > FHD > HD > SD)
      const qualityOrder = { 'UHD/4K': 0, 'HDR': 1, 'FHD': 2, 'HD': 3, 'SD': 4, 'Auto': 5 };
      streams.sort((a, b) => {
        const qA = extractQuality(a.name);
        const qB = extractQuality(b.name);
        return (qualityOrder[qA as keyof typeof qualityOrder] || 999) - (qualityOrder[qB as keyof typeof qualityOrder] || 999);
      });

      const primaryStream = streams[0];
      const normalizedName = normalizeChannelName(primaryStream.name);

      const variants: XtreamQualityVariant[] = streams.map((stream) => ({
        id: stream.stream_id,
        quality: extractQuality(stream.name),
        urlHls: `${config.baseUrl}/live/${config.username}/${config.password}/${stream.stream_id}.m3u8`,
        urlTs: `${config.baseUrl}/live/${config.username}/${config.password}/${stream.stream_id}.ts`,
      }));

      channels.push({
        id: primaryStream.stream_id,
        name: normalizedName,
        logo: primaryStream.stream_icon,
        group: primaryStream.category_name || `Category ${primaryStream.category_id}`,
        urlHls: `${config.baseUrl}/live/${config.username}/${config.password}/${primaryStream.stream_id}.m3u8`,
        urlTs: `${config.baseUrl}/live/${config.username}/${config.password}/${primaryStream.stream_id}.ts`,
        quality: extractQuality(primaryStream.name),
        qualityVariants: variants.length > 1 ? variants : undefined,
      });
    });

    // Mettre en cache
    cache.set(cacheKey, {
      data: channels,
      timestamp: Date.now(),
    });

    console.log(`[Xtream] Fetched ${channels.length} channels with quality variants`);
    return channels;
  } catch (error) {
    console.error('[Xtream] Error fetching channels:', error);
    throw error;
  }
}

/**
 * Récupère l'EPG pour une chaîne
 */
export async function getXtreamEPG(
  config: XtreamConfig,
  streamId: number
): Promise<any> {
  const cacheKey = `epg_${streamId}`;

  // Vérifier le cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const url = `${config.baseUrl}/player_api.php?username=${config.username}&password=${config.password}&action=get_short_epg&stream_id=${streamId}`;

  try {
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`Xtream EPG error: ${response.status}`);
    }

    const data = await response.json();

    // Mettre en cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    console.error('[Xtream] Error fetching EPG:', error);
    throw error;
  }
}

/**
 * Construit l'URL de lecture pour une chaîne
 */
export function buildStreamUrl(
  config: XtreamConfig,
  streamId: number,
  format: 'hls' | 'ts' = 'hls'
): string {
  const extension = format === 'hls' ? 'm3u8' : 'ts';
  return `${config.baseUrl}/live/${config.username}/${config.password}/${streamId}.${extension}`;
}

/**
 * Nettoie le cache (utile pour forcer un refresh)
 */
export function clearXtreamCache(): void {
  cache.clear();
  console.log('[Xtream] Cache cleared');
}
