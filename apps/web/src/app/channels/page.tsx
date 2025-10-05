'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MobileHeader } from '@/components/mobile-header';
import { Search, Grid3x3, List, AlertCircle } from 'lucide-react';
import type { XtreamChannel } from '@/lib/xtream';
import { useDeviceDetection, useResponsiveClasses } from '@/hooks/useDeviceDetection';
import { getProxiedImageUrl } from '@/lib/image-proxy';

export default function ChannelsPage() {
  const [channels, setChannels] = useState<XtreamChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<XtreamChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [isMockMode, setIsMockMode] = useState(false);
  const [mockMessage, setMockMessage] = useState<string | null>(null);

  // Device detection for responsive design
  const deviceInfo = useDeviceDetection();
  const responsiveClasses = useResponsiveClasses();

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    filterChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, channels]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Force bypass cache avec timestamp
      const response = await fetch(`/api/xtream/list?v=3&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors du chargement des chaînes');
      }

      const data = await response.json();
      setChannels(data.channels || []);
      setFilteredChannels(data.channels || []);

      // Détecter le mode mock
      if (data.mode === 'mock') {
        setIsMockMode(true);
        setMockMessage(data.message || 'Mode démonstration actif');
      }

      // Extraire les catégories uniques
      const uniqueCategories = Array.from(
        new Set(data.channels.map((ch: XtreamChannel) => ch.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (err: any) {
      console.error('[Channels] Error fetching channels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Améliorer les noms de catégories
  const getCategoryDisplayName = (category: string): string => {
    // Extraire le contenu de la chaîne pour détecter les types
    const categoryLower = category.toLowerCase();
    const channelsInCat = channels.filter(ch => ch.category === category);
    const channelNames = channelsInCat.map(ch => ch.name.toLowerCase()).join(' ');

    // 1. Adulte (priorité haute pour filtrage)
    if (categoryLower.includes('adult') || categoryLower.includes('xxx') ||
        categoryLower.includes('18+') || channelNames.includes('xxx')) {
      return '🔞 Adulte';
    }

    // 2. Documentaires (vérification stricte - majorité de chaînes documentaires)
    const docKeywords = ['discovery', 'nat geo', 'national geographic', 'planete', 'ushuaia', 'rmc découverte', 'animaux', 'histoire', 'science', 'trek', 'chasse'];
    const docCount = channelsInCat.filter(ch => {
      const name = ch.name.toLowerCase();
      return docKeywords.some(keyword => name.includes(keyword));
    }).length;

    if (categoryLower.includes('doc') || categoryLower.includes('documentaire') ||
        (docCount > channelsInCat.length / 2)) {
      return '🌍 Documentaires';
    }

    // 3. Cinéma et films (avant Canal+ pour détecter Canal+ Cinéma)
    const cinemaKeywords = ['cine', 'cinema', 'movie', 'film', 'ocs', 'warner', 'syfy', 'paramount', 'action'];
    const cinemaCount = channelsInCat.filter(ch => {
      const name = ch.name.toLowerCase();
      return cinemaKeywords.some(keyword => name.includes(keyword));
    }).length;

    if (categoryLower.includes('cine') || categoryLower.includes('film') ||
        categoryLower.includes('movie') || (cinemaCount > channelsInCat.length / 2)) {
      return '🎞️ Cinéma';
    }

    // 4. Canal+ et bouquets premium
    if (categoryLower.includes('canal') || channelNames.includes('canal+') ||
        channelNames.includes('canalsat')) {
      return '🎬 Canal+';
    }

    // 5. Sport
    if (categoryLower.includes('sport') || channelNames.includes('sport') ||
        channelNames.includes('foot') || channelNames.includes('soccer') ||
        channelNames.includes('ligue') || channelNames.includes('bein') ||
        channelNames.includes('eurosport')) {
      return '⚽ Sport';
    }

    // 6. Radio
    if (categoryLower.includes('radio') || channelNames.includes('radio') ||
        channelNames.includes('france bleu') || channelNames.includes('rtl') ||
        channelNames.includes('europe 1') || channelNames.includes('rfi') ||
        channelNames.includes('rmc') || channelNames.includes('nostalgie') ||
        channelNames.includes('nrj') || channelNames.includes('skyrock')) {
      return '📻 Radio';
    }

    // 6. Séries TV
    if (categoryLower.includes('series') || categoryLower.includes('serie') ||
        channelNames.includes('serie') || channelNames.includes('tf1 series')) {
      return '📺 Séries';
    }

    // 7. Magazines et divertissement
    if (categoryLower.includes('magazine') || categoryLower.includes('divertissement') ||
        categoryLower.includes('entertainment') || channelNames.includes('magazine')) {
      return '🎪 Magazines';
    }

    // 8. Enfants
    const kidsKeywords = ['kid', 'disney', 'gulli', 'tiji', 'cartoon', 'nickelodeon', 'piwi', 'baby', 'junior'];
    const kidsCount = channelsInCat.filter(ch => {
      const name = ch.name.toLowerCase();
      return kidsKeywords.some(keyword => name.includes(keyword));
    }).length;

    if (categoryLower.includes('kid') || categoryLower.includes('enfant') ||
        categoryLower.includes('children') || (kidsCount > 0)) {
      return '🎨 Enfants';
    }

    // 9. Actualités et info
    if (categoryLower.includes('news') || categoryLower.includes('info') ||
        categoryLower.includes('actualit') || channelNames.includes('news') ||
        channelNames.includes('bfm') || channelNames.includes('cnews') ||
        channelNames.includes('lci') || channelNames.includes('france info')) {
      return '📰 Actualités';
    }

    // 10. Musique
    if (categoryLower.includes('music') || categoryLower.includes('musique') ||
        channelNames.includes('mtv') || channelNames.includes('mcm') ||
        channelNames.includes('trace') || channelNames.includes('mezzo')) {
      return '🎵 Musique';
    }

    // 11. Culture et arts
    if (categoryLower.includes('culture') || categoryLower.includes('art') ||
        channelNames.includes('arte') || channelNames.includes('museum')) {
      return '🎭 Culture';
    }

    // 12. Régions et langues
    if (channelNames.includes('[fr]') || categoryLower.includes('fran')) {
      return '🇫🇷 Chaînes Françaises';
    }
    if (channelNames.includes('[uk]') || categoryLower.includes('uk') || categoryLower.includes('british')) {
      return '🇬🇧 Chaînes UK';
    }
    if (channelNames.includes('[us]') || categoryLower.includes('usa') || categoryLower.includes('american')) {
      return '🇺🇸 Chaînes US';
    }
    if (channelNames.includes('[ar]') || categoryLower.includes('arab') || categoryLower.includes('mbc')) {
      return '🇸🇦 Chaînes Arabes';
    }
    if (channelNames.includes('[de]') || categoryLower.includes('german') || categoryLower.includes('allemand')) {
      return '🇩🇪 Chaînes Allemandes';
    }
    if (channelNames.includes('[es]') || categoryLower.includes('spain') || categoryLower.includes('espagnol')) {
      return '🇪🇸 Chaînes Espagnoles';
    }
    if (channelNames.includes('[it]') || categoryLower.includes('ital')) {
      return '🇮🇹 Chaînes Italiennes';
    }
    if (channelNames.includes('[be]') || categoryLower.includes('belg')) {
      return '🇧🇪 Chaînes Belges';
    }

    // 13. TNT et généralistes
    if (categoryLower.includes('tnt') || categoryLower.includes('general') ||
        channelNames.includes('tf1') || channelNames.includes('france 2') ||
        channelNames.includes('m6')) {
      return '📡 TNT & Généralistes';
    }

    // Retourner le nom original si pas de match
    return category.replace('Category ', '📁 Catégorie ');
  };

  const filterChannels = () => {
    let filtered = channels;

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(ch =>
        ch.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ch => ch.category === selectedCategory);
    }

    setFilteredChannels(filtered);
  };

  return (
    <div className="min-h-screen bg-secondary-900">
      {/* Mobile Header */}
      {deviceInfo.isMobile && (
        <MobileHeader
          title="Chaînes"
          showBackButton={false}
          showHomeButton={false}
          transparent={false}
        />
      )}

      {/* Desktop/Tablet Header */}
      {!deviceInfo.isMobile && (
        <header className="sticky top-0 z-50 bg-secondary-800/95 backdrop-blur-sm border-b border-primary-900/20">
          <div className={`${responsiveClasses.container} ${responsiveClasses.padding}`}>
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img
                  src="https://res.cloudinary.com/dxy0fiahv/image/upload/v1736099542/TERRANOVISION_LOGO_copie_plw60b.png"
                  alt="TerranoVision"
                  className={`${deviceInfo.isTV ? 'h-16' : 'h-10'} w-auto object-contain`}
                />
                <span className={`${responsiveClasses.text.title} font-bold text-primary-500`}>TerranoVision</span>
              </Link>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${deviceInfo.isTV ? 'w-6 h-6' : 'w-4 h-4'} text-gray-400`} />
                  <input
                    type="search"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 ${deviceInfo.isTV ? 'py-4 text-xl' : 'py-2'} bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${responsiveClasses.text.base} w-64`}
                  />
                </div>
                <Button
                  size={deviceInfo.isTV ? 'lg' : 'sm'}
                  variant={viewMode === 'grid' ? 'outline' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className={`${deviceInfo.isTV ? 'w-6 h-6' : 'w-4 h-4'} mr-2`} />
                  Grille
                </Button>
                <Button
                  size={deviceInfo.isTV ? 'lg' : 'sm'}
                  variant={viewMode === 'list' ? 'outline' : 'ghost'}
                  onClick={() => setViewMode('list')}
                >
                  <List className={`${deviceInfo.isTV ? 'w-6 h-6' : 'w-4 h-4'} mr-2`} />
                  Liste
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Bandeau Mode TEST */}
      {isMockMode && (
        <div className="bg-amber-500/20 border-b border-amber-500/50 backdrop-blur-sm">
          <div className={`${responsiveClasses.container} ${responsiveClasses.padding}`}>
            <div className="flex items-center gap-3 py-2">
              <AlertCircle className={`${deviceInfo.isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-amber-400 flex-shrink-0`} />
              <div className="flex-1">
                <p className={`${responsiveClasses.text.base} text-amber-100 font-medium`}>
                  {mockMessage || 'Mode Démonstration'}
                </p>
                <p className={`${responsiveClasses.text.small} text-amber-200/80 mt-0.5`}>
                  Chaînes de test utilisées • Le serveur Xtream est temporairement indisponible
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Bar */}
      {deviceInfo.isMobile && (
        <div className="bg-secondary-800 border-b border-primary-900/20 px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Rechercher une chaîne..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base text-white"
            />
          </div>
        </div>
      )}

      {/* Categories */}
      {!loading && !error && categories.length > 0 && (
        <div className={`${deviceInfo.isMobile ? 'sticky top-14 z-40' : ''} bg-secondary-800/50 border-b border-primary-900/20`}>
          <div className={`${responsiveClasses.container} ${responsiveClasses.padding}`}>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`${deviceInfo.isMobile ? 'px-3 py-2' : deviceInfo.isTV ? 'px-6 py-3' : 'px-4 py-1.5'} rounded-full ${responsiveClasses.text.base} whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
                }`}
              >
                Toutes ({channels.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`${deviceInfo.isMobile ? 'px-3 py-2' : deviceInfo.isTV ? 'px-6 py-3' : 'px-4 py-1.5'} rounded-full ${responsiveClasses.text.base} whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
                  }`}
                >
                  {getCategoryDisplayName(cat)} ({channels.filter(ch => ch.category === cat).length})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`${responsiveClasses.container} ${responsiveClasses.padding}`}>
        {loading && <LoadingSkeleton deviceInfo={deviceInfo} responsiveClasses={responsiveClasses} />}

        {error && (
          <div className={`text-center ${deviceInfo.isMobile ? 'py-10' : 'py-20'}`}>
            <AlertCircle className={`${deviceInfo.isMobile ? 'w-12 h-12' : deviceInfo.isTV ? 'w-24 h-24' : 'w-16 h-16'} text-red-500 mx-auto mb-4`} />
            <h2 className={`${responsiveClasses.text.title} font-bold text-gray-300 mb-4`}>Erreur de chargement</h2>
            <p className={`${responsiveClasses.text.base} text-gray-400 mb-8`}>{error}</p>
            <Button size={deviceInfo.isMobile ? 'default' : deviceInfo.isTV ? 'lg' : 'default'} onClick={fetchChannels}>Réessayer</Button>
          </div>
        )}

        {!loading && !error && filteredChannels.length === 0 && (
          <EmptyState hasChannels={channels.length > 0} deviceInfo={deviceInfo} responsiveClasses={responsiveClasses} />
        )}

        {!loading && !error && filteredChannels.length > 0 && (
          <>
            <div className={`mb-4 text-gray-400 ${responsiveClasses.text.small}`}>
              {filteredChannels.length} chaîne(s) trouvée(s)
            </div>
            {selectedCategory === 'all' && !searchTerm ? (
              // Affichage groupé par catégorie
              <ChannelsByCategory channels={channels} categories={categories} viewMode={viewMode} deviceInfo={deviceInfo} responsiveClasses={responsiveClasses} />
            ) : (
              // Affichage filtré
              viewMode === 'grid' ? (
                <ChannelsGrid channels={filteredChannels} deviceInfo={deviceInfo} responsiveClasses={responsiveClasses} />
              ) : (
                <ChannelsList channels={filteredChannels} deviceInfo={deviceInfo} responsiveClasses={responsiveClasses} />
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({ hasChannels, deviceInfo, responsiveClasses }: { hasChannels: boolean; deviceInfo: any; responsiveClasses: any }) {
  return (
    <div className={`text-center ${deviceInfo.isMobile ? 'py-10' : 'py-20'}`}>
      <h2 className={`${responsiveClasses.text.title} font-bold text-gray-300 mb-4`}>
        {hasChannels ? 'Aucun résultat' : 'Aucune chaîne disponible'}
      </h2>
      <p className={`${responsiveClasses.text.base} text-gray-400 mb-8`}>
        {hasChannels
          ? 'Essayez une autre recherche ou catégorie'
          : 'Les chaînes sont chargées depuis l\'API Xtream'}
      </p>
    </div>
  );
}

function ChannelsGrid({ channels, deviceInfo, responsiveClasses }: { channels: XtreamChannel[]; deviceInfo: any; responsiveClasses: any }) {
  const getQualityBadge = (quality?: string) => {
    if (!quality || quality === 'Auto') return null;

    const badges: Record<string, { bg: string; text: string }> = {
      'UHD/4K': { bg: 'bg-purple-500', text: '4K' },
      'HDR': { bg: 'bg-yellow-500', text: 'HDR' },
      'FHD': { bg: 'bg-blue-500', text: 'FHD' },
      'HD': { bg: 'bg-green-500', text: 'HD' },
      'SD': { bg: 'bg-gray-500', text: 'SD' },
    };

    const badge = badges[quality];
    if (!badge) return null;

    const badgeSize = deviceInfo.isMobile ? 'text-[8px] px-1.5 py-0.5' : deviceInfo.isTV ? 'text-sm px-3 py-1.5' : 'text-xs px-2 py-1';

    return (
      <span className={`absolute top-2 right-2 ${badge.bg} text-white ${badgeSize} rounded-full font-bold shadow-lg`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className={responsiveClasses.grid}>
      {channels.map(channel => (
        <Link
          key={channel.id}
          href={`/watch/${channel.id}`}
          className="group relative bg-secondary-800 rounded overflow-hidden hover:ring-1 hover:ring-primary-500 transition-all"
          style={{ aspectRatio: '1/1' }}
        >
          {getQualityBadge(channel.quality)}
          {channel.logo && getProxiedImageUrl(channel.logo) ? (
            <div className="w-full h-full flex items-center justify-center p-0.5">
              <img
                src={getProxiedImageUrl(channel.logo)}
                alt={channel.name}
                className="max-w-[60%] max-h-[60%] object-contain group-hover:scale-105 transition-transform"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-xs">📺</span>';
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <span className={deviceInfo.isMobile ? 'text-xs' : deviceInfo.isTV ? 'text-2xl' : 'text-xs'}>📺</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent pt-2 pb-0.5 px-0.5">
            <p className={`${deviceInfo.isMobile ? 'text-[7px]' : deviceInfo.isTV ? 'text-xs' : 'text-[7px]'} font-bold text-white truncate leading-none`}>{channel.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ChannelsList({ channels, deviceInfo, responsiveClasses }: { channels: XtreamChannel[]; deviceInfo: any; responsiveClasses: any }) {
  const getQualityBadge = (quality?: string) => {
    if (!quality || quality === 'Auto') return null;

    const badges: Record<string, { bg: string; text: string }> = {
      'UHD/4K': { bg: 'bg-purple-500', text: '4K' },
      'HDR': { bg: 'bg-yellow-500', text: 'HDR' },
      'FHD': { bg: 'bg-blue-500', text: 'FHD' },
      'HD': { bg: 'bg-green-500', text: 'HD' },
      'SD': { bg: 'bg-gray-500', text: 'SD' },
    };

    const badge = badges[quality];
    if (!badge) return null;

    const badgeSize = deviceInfo.isMobile ? 'text-xs px-2 py-1' : deviceInfo.isTV ? 'text-base px-3 py-1.5' : 'text-xs px-2 py-0.5';

    return (
      <span className={`${badge.bg} text-white ${badgeSize} rounded font-bold`}>
        {badge.text}
      </span>
    );
  };

  const logoSize = deviceInfo.isMobile ? 'w-12 h-12' : deviceInfo.isTV ? 'w-24 h-24' : 'w-16 h-16';
  const padding = deviceInfo.isMobile ? 'p-3' : deviceInfo.isTV ? 'p-6' : 'p-4';
  const gap = deviceInfo.isMobile ? 'gap-3' : deviceInfo.isTV ? 'gap-6' : 'gap-4';

  return (
    <div className={deviceInfo.isMobile ? 'space-y-1.5' : deviceInfo.isTV ? 'space-y-4' : 'space-y-2'}>
      {channels.map(channel => (
        <Link
          key={channel.id}
          href={`/watch/${channel.id}`}
          className={`flex items-center ${gap} ${padding} bg-secondary-800 rounded-lg hover:bg-secondary-700 transition-colors`}
        >
          {channel.logo && getProxiedImageUrl(channel.logo) ? (
            <img
              src={getProxiedImageUrl(channel.logo)}
              alt={channel.name}
              className={`${logoSize} object-cover rounded`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className={`${logoSize} flex items-center justify-center bg-secondary-700 rounded text-gray-500`}>
              <span className={deviceInfo.isTV ? 'text-3xl' : 'text-xl'}>📺</span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`${responsiveClasses.text.base} font-medium text-white`}>{channel.name}</h3>
              {getQualityBadge(channel.quality)}
            </div>
            {channel.group && <p className={`${responsiveClasses.text.small} text-gray-400`}>{channel.group}</p>}
            {channel.qualityVariants && channel.qualityVariants.length > 1 && (
              <p className={`${responsiveClasses.text.small} text-primary-400 font-medium mt-1`}>
                {channel.qualityVariants.length} qualités disponibles
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ChannelsByCategory({
  channels,
  categories,
  viewMode,
  deviceInfo,
  responsiveClasses
}: {
  channels: XtreamChannel[];
  categories: string[];
  viewMode: 'grid' | 'list';
  deviceInfo: any;
  responsiveClasses: any;
}) {
  // Améliorer les noms de catégories (fonction locale)
  const getCategoryDisplayName = (category: string): string => {
    const categoryLower = category.toLowerCase();
    const channelsInCat = channels.filter(ch => ch.category === category);
    const channelNames = channelsInCat.map(ch => ch.name.toLowerCase()).join(' ');

    // 1. Adulte
    if (categoryLower.includes('adult') || categoryLower.includes('xxx') ||
        categoryLower.includes('18+') || channelNames.includes('xxx')) {
      return '🔞 Adulte';
    }

    // 2. Documentaires (vérification stricte - majorité de chaînes documentaires)
    const docKeywords = ['discovery', 'nat geo', 'national geographic', 'planete', 'ushuaia', 'rmc découverte', 'animaux', 'histoire', 'science', 'trek', 'chasse'];
    const docCount = channelsInCat.filter(ch => {
      const name = ch.name.toLowerCase();
      return docKeywords.some(keyword => name.includes(keyword));
    }).length;

    if (categoryLower.includes('doc') || categoryLower.includes('documentaire') ||
        (docCount > channelsInCat.length / 2)) {
      return '📚 Documentaires';
    }

    // 3. Cinéma et films (avant Canal+ pour détecter Canal+ Cinéma)
    const cinemaKeywords = ['cine', 'cinema', 'movie', 'film', 'ocs', 'warner', 'syfy', 'paramount', 'action'];
    const cinemaCount = channelsInCat.filter(ch => {
      const name = ch.name.toLowerCase();
      return cinemaKeywords.some(keyword => name.includes(keyword));
    }).length;

    if (categoryLower.includes('cine') || categoryLower.includes('film') ||
        categoryLower.includes('movie') || (cinemaCount > channelsInCat.length / 2)) {
      return '🎬 Cinéma';
    }

    // 4. Canal+ et bouquets premium
    if (categoryLower.includes('canal') || channelNames.includes('canal+') ||
        channelNames.includes('canalsat')) {
      return '🎬 Canal+';
    }

    // 5. Sport
    if (categoryLower.includes('sport') || channelNames.includes('sport') ||
        channelNames.includes('foot') || channelNames.includes('soccer') ||
        channelNames.includes('ligue') || channelNames.includes('bein') ||
        channelNames.includes('eurosport')) {
      return '⚽ Sport';
    }

    // 6. Radio
    if (categoryLower.includes('radio') || channelNames.includes('radio') ||
        channelNames.includes('france bleu') || channelNames.includes('rtl') ||
        channelNames.includes('europe 1') || channelNames.includes('rfi') ||
        channelNames.includes('rmc') || channelNames.includes('nostalgie') ||
        channelNames.includes('nrj') || channelNames.includes('skyrock')) {
      return '📻 Radio';
    }

    // 6. Séries
    if (categoryLower.includes('series') || categoryLower.includes('serie') ||
        channelNames.includes('serie')) {
      return '📺 Séries';
    }

    // 7. Magazines
    if (categoryLower.includes('magazine') || channelNames.includes('magazine')) {
      return '📖 Magazines';
    }

    // 8. Enfants
    const kidsKeywords = ['kid', 'disney', 'gulli', 'tiji', 'cartoon', 'nickelodeon', 'piwi', 'baby', 'junior'];
    const kidsCount = channelsInCat.filter(ch => {
      const name = ch.name.toLowerCase();
      return kidsKeywords.some(keyword => name.includes(keyword));
    }).length;

    if (categoryLower.includes('kid') || categoryLower.includes('enfant') ||
        categoryLower.includes('children') || (kidsCount > 0)) {
      return '👶 Enfants';
    }

    // 9. Actualités
    if (categoryLower.includes('news') || categoryLower.includes('info') ||
        channelNames.includes('news') || channelNames.includes('bfm')) {
      return '📰 Actualités';
    }

    // 10. Musique
    if (categoryLower.includes('music') || channelNames.includes('mtv') ||
        channelNames.includes('mcm')) {
      return '🎵 Musique';
    }

    // 11. Culture
    if (categoryLower.includes('culture') || channelNames.includes('arte')) {
      return '🎨 Culture';
    }

    // 12. Régions
    if (channelNames.includes('[fr]') || categoryLower.includes('fran')) return '🇫🇷 Chaînes Françaises';
    if (channelNames.includes('[uk]') || categoryLower.includes('uk')) return '🇬🇧 Chaînes UK';
    if (channelNames.includes('[us]') || categoryLower.includes('usa')) return '🇺🇸 Chaînes US';
    if (channelNames.includes('[ar]') || categoryLower.includes('arab')) return '🇸🇦 Chaînes Arabes';
    if (channelNames.includes('[de]') || categoryLower.includes('german')) return '🇩🇪 Chaînes Allemandes';
    if (channelNames.includes('[es]') || categoryLower.includes('spain')) return '🇪🇸 Chaînes Espagnoles';
    if (channelNames.includes('[it]') || categoryLower.includes('ital')) return '🇮🇹 Chaînes Italiennes';
    if (channelNames.includes('[be]') || categoryLower.includes('belg')) return '🇧🇪 Chaînes Belges';

    // 13. TNT
    if (categoryLower.includes('tnt') || channelNames.includes('tf1')) {
      return '📡 TNT & Généralistes';
    }

    return category.replace('Category ', '📁 Catégorie ');
  };

  const spacing = deviceInfo.isMobile ? 'space-y-6' : deviceInfo.isTV ? 'space-y-12' : 'space-y-8';
  const logoSize = deviceInfo.isMobile ? 'w-12 h-12' : deviceInfo.isTV ? 'w-24 h-24' : 'w-16 h-16';
  const padding = deviceInfo.isMobile ? 'p-2' : deviceInfo.isTV ? 'p-6' : 'p-3';

  return (
    <div className={spacing}>
      {categories.map((category) => {
        const categoryChannels = channels.filter(ch => ch.category === category);
        if (categoryChannels.length === 0) return null;

        return (
          <div key={category}>
            {/* En-tête de catégorie */}
            <div className={`flex items-center justify-between ${deviceInfo.isMobile ? 'mb-3' : 'mb-4'}`}>
              <h2 className={`${responsiveClasses.text.subtitle} font-bold text-white`}>{getCategoryDisplayName(category)}</h2>
              <span className={`${responsiveClasses.text.small} text-gray-400`}>{categoryChannels.length} chaînes</span>
            </div>

            {/* Chaînes de la catégorie */}
            {viewMode === 'grid' ? (
              <div className={`grid ${deviceInfo.isMobile ? 'grid-cols-3 gap-2' : deviceInfo.isTV ? 'grid-cols-8 gap-6' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'}`}>
                {categoryChannels.map(channel => (
                  <Link
                    key={channel.id}
                    href={`/watch/${channel.id}`}
                    className="group relative aspect-square bg-secondary-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all"
                  >
                    {channel.logo && getProxiedImageUrl(channel.logo) ? (
                      <div className="w-full h-full flex items-center justify-center p-2">
                        <img
                          src={getProxiedImageUrl(channel.logo)}
                          alt={channel.name}
                          className="max-w-[70%] max-h-[70%] object-contain group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<span class="' + (deviceInfo.isMobile ? 'text-2xl' : deviceInfo.isTV ? 'text-6xl' : 'text-4xl') + '">📺</span>';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <span className={deviceInfo.isMobile ? 'text-2xl' : deviceInfo.isTV ? 'text-6xl' : 'text-4xl'}>📺</span>
                      </div>
                    )}
                    <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent ${padding}`}>
                      <p className={`${responsiveClasses.text.small} font-medium text-white truncate`}>{channel.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={deviceInfo.isMobile ? 'space-y-1.5' : deviceInfo.isTV ? 'space-y-4' : 'space-y-2'}>
                {categoryChannels.map(channel => (
                  <Link
                    key={channel.id}
                    href={`/watch/${channel.id}`}
                    className={`flex items-center ${deviceInfo.isMobile ? 'gap-3 p-3' : deviceInfo.isTV ? 'gap-6 p-6' : 'gap-4 p-4'} bg-secondary-800 rounded-lg hover:bg-secondary-700 transition-colors`}
                  >
                    {channel.logo && getProxiedImageUrl(channel.logo) ? (
                      <img
                        src={getProxiedImageUrl(channel.logo)}
                        alt={channel.name}
                        className={`${logoSize} object-contain rounded`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={`${logoSize} flex items-center justify-center bg-secondary-700 rounded text-gray-500`}>
                        <span className={deviceInfo.isTV ? 'text-3xl' : 'text-xl'}>📺</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className={`${responsiveClasses.text.base} font-medium text-white`}>{channel.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LoadingSkeleton({ deviceInfo, responsiveClasses }: { deviceInfo: any; responsiveClasses: any }) {
  const count = deviceInfo.isMobile ? 6 : deviceInfo.isTV ? 16 : 12;

  return (
    <div className={responsiveClasses.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square bg-secondary-800 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
