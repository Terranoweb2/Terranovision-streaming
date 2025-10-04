/**
 * Parser M3U pour playlists IPTV
 * Supporte formats: m3u, m3u8, m3u_plus
 */

export interface M3UChannel {
  id: string;
  name: string;
  logo?: string;
  group?: string;
  url: string;
  tvgId?: string;
  tvgName?: string;
  quality?: string;
}

/**
 * Parse une playlist M3U/M3U8
 */
export function parseM3U(content: string): M3UChannel[] {
  const channels: M3UChannel[] = [];
  const lines = content.split('\n').map(line => line.trim());

  let currentChannel: Partial<M3UChannel> = {};
  let channelIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ignorer les lignes vides et les commentaires (sauf #EXTINF)
    if (!line || (line.startsWith('#') && !line.startsWith('#EXTINF'))) {
      continue;
    }

    // Header #EXTINF avec metadata
    if (line.startsWith('#EXTINF:')) {
      // Format: #EXTINF:-1 tvg-id="..." tvg-name="..." tvg-logo="..." group-title="...",Channel Name
      const nameMatch = line.match(/,(.+)$/);
      const tvgIdMatch = line.match(/tvg-id="([^"]+)"/);
      const tvgNameMatch = line.match(/tvg-name="([^"]+)"/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);

      currentChannel = {
        id: `channel_${channelIndex++}`,
        name: nameMatch ? nameMatch[1].trim() : 'Unknown',
        tvgId: tvgIdMatch ? tvgIdMatch[1] : undefined,
        tvgName: tvgNameMatch ? tvgNameMatch[1] : undefined,
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : undefined,
        quality: extractQualityFromName(nameMatch ? nameMatch[1] : ''),
      };
    }
    // URL du stream
    else if (line.startsWith('http://') || line.startsWith('https://') || line.startsWith('rtmp://')) {
      if (currentChannel.name) {
        channels.push({
          ...currentChannel as M3UChannel,
          url: line,
        });
        currentChannel = {};
      }
    }
  }

  return channels;
}

/**
 * Extrait la qualité depuis le nom de la chaîne
 */
function extractQualityFromName(name: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('uhd') || nameLower.includes('4k')) return 'UHD/4K';
  if (nameLower.includes('hdr')) return 'HDR';
  if (nameLower.includes('fhd') || nameLower.includes('full hd')) return 'FHD';
  if (nameLower.includes('hd')) return 'HD';
  if (nameLower.includes('sd')) return 'SD';
  return 'Auto';
}

/**
 * Convertit les channels M3U vers le format XtreamChannel
 */
export function m3uToXtreamChannels(m3uChannels: M3UChannel[]): any[] {
  // Grouper par nom normalisé pour détecter les variantes qualité
  const grouped = new Map<string, M3UChannel[]>();

  m3uChannels.forEach(channel => {
    const normalizedName = normalizeChannelName(channel.name);
    const key = `${normalizedName}_${channel.group || 'default'}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(channel);
  });

  const xtreamChannels: any[] = [];
  let streamId = 1;

  grouped.forEach((variants, key) => {
    // Trier par qualité
    const qualityOrder = { 'UHD/4K': 0, 'HDR': 1, 'FHD': 2, 'HD': 3, 'SD': 4, 'Auto': 5 };
    variants.sort((a, b) => {
      const qA = a.quality || 'Auto';
      const qB = b.quality || 'Auto';
      return (qualityOrder[qA as keyof typeof qualityOrder] || 999) - (qualityOrder[qB as keyof typeof qualityOrder] || 999);
    });

    const primary = variants[0];
    const normalizedName = normalizeChannelName(primary.name);

    const qualityVariants = variants.map(v => ({
      id: streamId++,
      quality: v.quality || 'Auto',
      urlHls: v.url.endsWith('.m3u8') ? v.url : v.url,
      urlTs: v.url.endsWith('.ts') ? v.url : v.url,
    }));

    xtreamChannels.push({
      id: streamId++,
      name: normalizedName,
      logo: primary.logo,
      group: primary.group || 'Uncategorized',
      urlHls: primary.url.endsWith('.m3u8') ? primary.url : primary.url,
      urlTs: primary.url.endsWith('.ts') ? primary.url : primary.url,
      quality: primary.quality || 'Auto',
      qualityVariants: variants.length > 1 ? qualityVariants : undefined,
    });
  });

  return xtreamChannels;
}

/**
 * Normalise le nom de la chaîne
 */
function normalizeChannelName(name: string): string {
  return name
    .replace(/\s*(UHD|4K|HDR|FHD|FULL HD|HD|SD)\s*/gi, '')
    .replace(/\s*\/\s*/g, ' ')
    .replace(/\[.*?\]/g, '') // Enlever [FR], [UK], etc.
    .trim();
}
