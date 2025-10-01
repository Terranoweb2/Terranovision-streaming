import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ParsedChannel {
  name: string;
  url: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  groupTitle?: string;
  language?: string;
  country?: string;
}

@Injectable()
export class M3uParserService {
  private readonly logger = new Logger(M3uParserService.name);

  /**
   * Fetch and parse M3U playlist from URL
   */
  async fetchAndParse(url: string): Promise<ParsedChannel[]> {
    try {
      this.logger.log(`Fetching M3U playlist from: ${url}`);
      const response = await axios.get(url, {
        timeout: 30000,
        maxContentLength: 50 * 1024 * 1024, // 50MB max
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
        },
      });

      return this.parse(response.data);
    } catch (error) {
      this.logger.error(`Failed to fetch M3U playlist: ${error.message}`);
      throw new Error(`Failed to fetch M3U playlist: ${error.message}`);
    }
  }

  /**
   * Parse M3U content
   */
  parse(content: string): ParsedChannel[] {
    const channels: ParsedChannel[] = [];
    const lines = content.split('\n').map(line => line.trim());

    let currentChannel: Partial<ParsedChannel> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines
      if (!line) continue;

      // Check for #EXTM3U header
      if (line.startsWith('#EXTM3U')) {
        continue;
      }

      // Parse channel info line
      if (line.startsWith('#EXTINF:')) {
        currentChannel = this.parseExtInf(line);
      }
      // Parse stream URL
      else if (!line.startsWith('#') && currentChannel.name) {
        currentChannel.url = line;

        // Validate and add channel
        if (this.isValidChannel(currentChannel)) {
          channels.push(currentChannel as ParsedChannel);
        }

        // Reset for next channel
        currentChannel = {};
      }
    }

    this.logger.log(`Parsed ${channels.length} channels from M3U playlist`);
    return channels;
  }

  /**
   * Parse #EXTINF line to extract channel metadata
   */
  private parseExtInf(line: string): Partial<ParsedChannel> {
    const channel: Partial<ParsedChannel> = {};

    // Extract attributes using regex
    const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
    const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
    const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
    const groupTitleMatch = line.match(/group-title="([^"]*)"/);
    const languageMatch = line.match(/tvg-language="([^"]*)"/);
    const countryMatch = line.match(/tvg-country="([^"]*)"/);

    if (tvgIdMatch) channel.tvgId = tvgIdMatch[1];
    if (tvgNameMatch) channel.tvgName = tvgNameMatch[1];
    if (tvgLogoMatch) channel.tvgLogo = tvgLogoMatch[1];
    if (groupTitleMatch) channel.groupTitle = groupTitleMatch[1];
    if (languageMatch) channel.language = languageMatch[1];
    if (countryMatch) channel.country = countryMatch[1];

    // Extract channel name (everything after the last comma)
    const nameMatch = line.match(/,(.+)$/);
    if (nameMatch) {
      channel.name = nameMatch[1].trim();
    }

    return channel;
  }

  /**
   * Validate channel has required fields
   */
  private isValidChannel(channel: Partial<ParsedChannel>): channel is ParsedChannel {
    return !!(channel.name && channel.url);
  }

  /**
   * Detect stream type from URL
   */
  detectStreamType(url: string): string {
    if (url.includes('.m3u8') || url.includes('m3u')) {
      return 'hls';
    } else if (url.startsWith('rtmp://') || url.startsWith('rtmps://')) {
      return 'rtmp';
    } else if (url.startsWith('rtsp://')) {
      return 'rtsp';
    } else {
      return 'hls'; // Default to HLS
    }
  }

  /**
   * Map group names to category slugs
   */
  mapGroupToCategory(groupName: string): string | null {
    if (!groupName) return null;

    const groupLower = groupName.toLowerCase();

    // Category mapping
    const categoryMap: { [key: string]: string } = {
      sport: 'sport',
      sports: 'sport',
      news: 'news',
      info: 'news',
      information: 'news',
      actualité: 'news',
      actualités: 'news',
      movie: 'movies',
      movies: 'movies',
      cinema: 'movies',
      cinéma: 'movies',
      film: 'movies',
      films: 'movies',
      series: 'series',
      série: 'series',
      séries: 'series',
      entertainment: 'entertainment',
      divertissement: 'entertainment',
      kids: 'kids',
      enfants: 'kids',
      jeunesse: 'kids',
      music: 'music',
      musique: 'music',
      documentary: 'documentary',
      documentaire: 'documentary',
      documentaires: 'documentary',
      lifestyle: 'lifestyle',
      'vie pratique': 'lifestyle',
    };

    // Check for exact matches or partial matches
    for (const [key, value] of Object.entries(categoryMap)) {
      if (groupLower.includes(key)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Detect age rating from group name or channel name
   */
  detectAgeRating(name: string, groupName?: string): number {
    const text = `${name} ${groupName || ''}`.toLowerCase();

    if (text.includes('adult') || text.includes('xxx') || text.includes('+18')) {
      return 18;
    }
    if (text.includes('+16')) {
      return 16;
    }
    if (text.includes('+13')) {
      return 13;
    }

    return 0; // All ages
  }
}
