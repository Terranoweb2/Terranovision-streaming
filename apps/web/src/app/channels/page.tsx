'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Grid3x3, List, AlertCircle } from 'lucide-react';
import type { XtreamChannel } from '@/lib/xtream';

export default function ChannelsPage() {
  const [channels, setChannels] = useState<XtreamChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<XtreamChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

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

      const response = await fetch('/api/xtream/list');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors du chargement des chaînes');
      }

      const data = await response.json();
      setChannels(data.channels || []);
      setFilteredChannels(data.channels || []);

      // Extraire les catégories uniques
      const uniqueCategories = Array.from(
        new Set(data.channels.map((ch: XtreamChannel) => ch.group).filter(Boolean))
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
    const channelsInCat = channels.filter(ch => ch.group === category);
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

    // 6. Séries TV
    if (categoryLower.includes('series') || categoryLower.includes('serie') ||
        channelNames.includes('serie') || channelNames.includes('tf1 series')) {
      return '📺 Séries';
    }

    // 7. Magazines et divertissement
    if (categoryLower.includes('magazine') || categoryLower.includes('divertissement') ||
        categoryLower.includes('entertainment') || channelNames.includes('magazine')) {
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
      return '🎨 Culture';
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
      filtered = filtered.filter(ch => ch.group === selectedCategory);
    }

    setFilteredChannels(filtered);
  };

  return (
    <div className="min-h-screen bg-secondary-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-secondary-800/95 backdrop-blur-sm border-b border-primary-900/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src="https://res.cloudinary.com/dxy0fiahv/image/upload/v1736099542/TERRANOVISION_LOGO_copie_plw60b.png"
                alt="TerranoVision"
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-bold text-primary-500">TerranoVision</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Rechercher une chaîne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm w-64"
                />
              </div>
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'outline' : 'ghost'}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4 mr-2" />
                Grille
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'outline' : 'ghost'}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                Liste
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Categories */}
      {!loading && !error && categories.length > 0 && (
        <div className="bg-secondary-800/50 border-b border-primary-900/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
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
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
                  }`}
                >
                  {getCategoryDisplayName(cat)} ({channels.filter(ch => ch.group === cat).length})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading && <LoadingSkeleton />}

        {error && (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-300 mb-4">Erreur de chargement</h2>
            <p className="text-gray-400 mb-8">{error}</p>
            <Button onClick={fetchChannels}>Réessayer</Button>
          </div>
        )}

        {!loading && !error && filteredChannels.length === 0 && (
          <EmptyState hasChannels={channels.length > 0} />
        )}

        {!loading && !error && filteredChannels.length > 0 && (
          <>
            <div className="mb-4 text-gray-400 text-sm">
              {filteredChannels.length} chaîne(s) trouvée(s)
            </div>
            {selectedCategory === 'all' && !searchTerm ? (
              // Affichage groupé par catégorie
              <ChannelsByCategory channels={channels} categories={categories} viewMode={viewMode} />
            ) : (
              // Affichage filtré
              viewMode === 'grid' ? (
                <ChannelsGrid channels={filteredChannels} />
              ) : (
                <ChannelsList channels={filteredChannels} />
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({ hasChannels }: { hasChannels: boolean }) {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-300 mb-4">
        {hasChannels ? 'Aucun résultat' : 'Aucune chaîne disponible'}
      </h2>
      <p className="text-gray-400 mb-8">
        {hasChannels
          ? 'Essayez une autre recherche ou catégorie'
          : 'Les chaînes sont chargées depuis l\'API Xtream'}
      </p>
    </div>
  );
}

function ChannelsGrid({ channels }: { channels: XtreamChannel[] }) {
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

    return (
      <span className={`absolute top-2 right-2 ${badge.bg} text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 2xl:grid-cols-24 gap-1">
      {channels.map(channel => (
        <Link
          key={channel.id}
          href={`/watch/${channel.id}`}
          className="group relative bg-secondary-800 rounded overflow-hidden hover:ring-1 hover:ring-primary-500 transition-all"
          style={{ aspectRatio: '1/1' }}
        >
          {getQualityBadge(channel.quality)}
          {channel.logo ? (
            <div className="w-full h-full flex items-center justify-center p-0.5">
              <img
                src={channel.logo}
                alt={channel.name}
                className="max-w-[60%] max-h-[60%] object-contain group-hover:scale-105 transition-transform"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <span className="text-xs">📺</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent pt-2 pb-0.5 px-0.5">
            <p className="text-[7px] font-bold text-white truncate leading-none">{channel.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ChannelsList({ channels }: { channels: XtreamChannel[] }) {
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

    return (
      <span className={`${badge.bg} text-white text-xs px-2 py-0.5 rounded font-bold`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-2">
      {channels.map(channel => (
        <Link
          key={channel.id}
          href={`/watch/${channel.id}`}
          className="flex items-center gap-4 p-4 bg-secondary-800 rounded-lg hover:bg-secondary-700 transition-colors"
        >
          {channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-secondary-700 rounded text-gray-500">
              📺
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white">{channel.name}</h3>
              {getQualityBadge(channel.quality)}
            </div>
            {channel.group && <p className="text-sm text-gray-400">{channel.group}</p>}
            {channel.qualityVariants && channel.qualityVariants.length > 1 && (
              <p className="text-xs text-primary-400 font-medium mt-1">
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
  viewMode
}: {
  channels: XtreamChannel[];
  categories: string[];
  viewMode: 'grid' | 'list';
}) {
  // Améliorer les noms de catégories (fonction locale)
  const getCategoryDisplayName = (category: string): string => {
    const categoryLower = category.toLowerCase();
    const channelsInCat = channels.filter(ch => ch.group === category);
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

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryChannels = channels.filter(ch => ch.group === category);
        if (categoryChannels.length === 0) return null;

        return (
          <div key={category}>
            {/* En-tête de catégorie */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{getCategoryDisplayName(category)}</h2>
              <span className="text-sm text-gray-400">{categoryChannels.length} chaînes</span>
            </div>

            {/* Chaînes de la catégorie */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categoryChannels.map(channel => (
                  <Link
                    key={channel.id}
                    href={`/watch/${channel.id}`}
                    className="group relative aspect-square bg-secondary-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all"
                  >
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <span className="text-4xl">📺</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-sm font-medium text-white truncate">{channel.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {categoryChannels.map(channel => (
                  <Link
                    key={channel.id}
                    href={`/watch/${channel.id}`}
                    className="flex items-center gap-4 p-4 bg-secondary-800 rounded-lg hover:bg-secondary-700 transition-colors"
                  >
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-secondary-700 rounded text-gray-500">
                        📺
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{channel.name}</h3>
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

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-square bg-secondary-800 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
