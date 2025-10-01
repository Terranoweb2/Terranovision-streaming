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

    // Normaliser les données
    const channels: XtreamChannel[] = data.map((stream) => ({
      id: stream.stream_id,
      name: stream.name,
      logo: stream.stream_icon,
      group: stream.category_name || `Category ${stream.category_id}`,
      urlHls: `${config.baseUrl}/live/${config.username}/${config.password}/${stream.stream_id}.m3u8`,
      urlTs: `${config.baseUrl}/live/${config.username}/${config.password}/${stream.stream_id}.ts`,
    }));

    // Mettre en cache
    cache.set(cacheKey, {
      data: channels,
      timestamp: Date.now(),
    });

    console.log(`[Xtream] Fetched ${channels.length} channels`);
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
