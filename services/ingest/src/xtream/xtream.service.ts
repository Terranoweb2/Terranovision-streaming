import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';

export interface XtreamChannel {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon?: string;
  epg_channel_id?: string;
  added?: string;
  category_id?: string;
  category_name?: string;
  custom_sid?: string;
  tv_archive?: number;
  direct_source?: string;
  tv_archive_duration?: number;
}

export interface NormalizedChannel {
  id: number;
  name: string;
  logo?: string;
  group?: string;
  urlHls: string;
  urlTs: string;
  epgChannelId?: string;
}

export interface XtreamEpgEntry {
  id: string;
  epg_id: string;
  title: string;
  lang: string;
  start: string;
  end: string;
  description: string;
  channel_id: string;
  start_timestamp: number;
  stop_timestamp: number;
  now_playing?: number;
  has_archive?: number;
}

@Injectable()
export class XtreamService {
  private readonly logger = new Logger(XtreamService.name);
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private requestQueue: Promise<any>[] = [];
  private readonly MAX_CONCURRENT_REQUESTS = 5;

  constructor() {
    this.baseUrl = process.env.XTREAM_BASE_URL || '';
    this.username = process.env.XTREAM_USERNAME || '';
    this.password = process.env.XTREAM_PASSWORD || '';

    if (!this.baseUrl || !this.username || !this.password) {
      this.logger.error('Xtream API credentials not configured');
      throw new Error('Xtream API credentials missing');
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'User-Agent': 'VLC/3.0.16 LibVLC/3.0.16',
      'Referer': 'https://terranovision.app',
      'Origin': 'https://terranovision.app',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
    };
  }

  private getCacheKey(url: string): string {
    return url;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Cache hit for: ${key}`);
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 4,
    initialDelay = 500,
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const status = error.response?.status;

        // Don't retry on client errors (except 429 and 884)
        if (status && status >= 400 && status < 500 && status !== 429 && status !== 884) {
          throw error;
        }

        const delay = initialDelay * Math.pow(2, i);
        this.logger.warn(
          `Request failed (attempt ${i + 1}/${maxRetries}), retrying in ${delay}ms... Error: ${error.message}`,
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private async makeRequest<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Check cache first
    const cacheKey = this.getCacheKey(url);
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) {
      return cached;
    }

    // Rate limiting via queue
    while (this.requestQueue.length >= this.MAX_CONCURRENT_REQUESTS) {
      await Promise.race(this.requestQueue);
    }

    const requestPromise = this.retryWithBackoff(async () => {
      const response = await axios.get<T>(url, {
        ...config,
        headers: {
          ...this.getHeaders(),
          ...config?.headers,
        },
        timeout: 30000,
        validateStatus: status => status < 900, // Accept all status codes
      });

      if (response.status === 884 || response.status === 429) {
        throw new Error(`Rate limited or anti-bot protection: ${response.status}`);
      }

      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.data) {
        throw new Error('Empty response from Xtream API');
      }

      // Cache successful response
      this.setCache(cacheKey, response.data);
      return response.data;
    });

    this.requestQueue.push(requestPromise);
    requestPromise.finally(() => {
      const index = this.requestQueue.indexOf(requestPromise);
      if (index > -1) {
        this.requestQueue.splice(index, 1);
      }
    });

    return requestPromise;
  }

  /**
   * Get all live streams from Xtream API
   */
  async getLiveStreams(): Promise<XtreamChannel[]> {
    const url = `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_live_streams`;

    this.logger.log(`Fetching live streams from: ${this.baseUrl}`);

    try {
      const data = await this.makeRequest<XtreamChannel[]>(url);
      this.logger.log(`Successfully fetched ${data?.length || 0} live streams`);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      this.logger.error(`Failed to fetch live streams: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get live categories
   */
  async getLiveCategories(): Promise<any[]> {
    const url = `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_live_categories`;

    try {
      const data = await this.makeRequest<any[]>(url);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      this.logger.error(`Failed to fetch live categories: ${error.message}`);
      return [];
    }
  }

  /**
   * Get EPG for a specific channel
   */
  async getShortEpg(streamId: number): Promise<XtreamEpgEntry[]> {
    const url = `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}&action=get_short_epg&stream_id=${streamId}`;

    try {
      const data = await this.makeRequest<{ epg_listings?: XtreamEpgEntry[] }>(url);
      return data?.epg_listings || [];
    } catch (error: any) {
      this.logger.warn(`Failed to fetch EPG for stream ${streamId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Normalize Xtream channels to our format
   */
  normalizeChannels(channels: XtreamChannel[]): NormalizedChannel[] {
    return channels.map(channel => ({
      id: channel.stream_id,
      name: channel.name,
      logo: channel.stream_icon,
      group: channel.category_name,
      urlHls: `${this.baseUrl}/live/${this.username}/${this.password}/${channel.stream_id}.m3u8`,
      urlTs: `${this.baseUrl}/live/${this.username}/${this.password}/${channel.stream_id}.ts`,
      epgChannelId: channel.epg_channel_id,
    }));
  }

  /**
   * Build stream URL for a channel
   */
  buildStreamUrl(streamId: number, format: 'hls' | 'ts' = 'hls'): string {
    const extension = format === 'hls' ? 'm3u8' : 'ts';
    return `${this.baseUrl}/live/${this.username}/${this.password}/${streamId}.${extension}`;
  }

  /**
   * Check if Xtream API is accessible
   */
  async checkConnection(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/player_api.php?username=${this.username}&password=${this.password}`;
      await this.makeRequest(url);
      return true;
    } catch (error) {
      this.logger.error('Xtream API connection check failed');
      return false;
    }
  }
}
