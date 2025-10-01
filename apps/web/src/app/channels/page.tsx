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
    const firstChannel = channels.find(ch => ch.group === category);
    const firstChannelName = firstChannel?.name.toLowerCase() || '';

    // Analyse du contenu pour deviner le type
    if (categoryLower.includes('sport') || firstChannelName.includes('sport')) return '⚽ Sport';
    if (categoryLower.includes('cine') || categoryLower.includes('film') || firstChannelName.includes('cine')) return '🎬 Cinéma';
    if (categoryLower.includes('kid') || categoryLower.includes('enfant') || firstChannelName.includes('disney') || firstChannelName.includes('gulli')) return '👶 Enfants';
    if (categoryLower.includes('news') || categoryLower.includes('info') || firstChannelName.includes('news') || firstChannelName.includes('bfm')) return '📰 Actualités';
    if (categoryLower.includes('music') || categoryLower.includes('musique') || firstChannelName.includes('mtv')) return '🎵 Musique';
    if (categoryLower.includes('doc') || firstChannelName.includes('discovery') || firstChannelName.includes('nat geo')) return '📚 Documentaires';
    if (categoryLower.includes('series') || firstChannelName.includes('serie')) return '📺 Séries';

    // Analyser le préfixe du premier canal
    if (firstChannelName.startsWith('[fr]')) return '🇫🇷 Chaînes Françaises';
    if (firstChannelName.startsWith('[uk]')) return '🇬🇧 Chaînes UK';
    if (firstChannelName.startsWith('[us]')) return '🇺🇸 Chaînes US';
    if (firstChannelName.startsWith('[ar]')) return '🇸🇦 Chaînes Arabes';
    if (firstChannelName.startsWith('[de]')) return '🇩🇪 Chaînes Allemandes';
    if (firstChannelName.startsWith('[es]')) return '🇪🇸 Chaînes Espagnoles';
    if (firstChannelName.startsWith('[it]')) return '🇮🇹 Chaînes Italiennes';

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
            <Link href="/" className="text-2xl font-bold text-primary-500">
              TerranoVision
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
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {channels.map(channel => (
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
            {channel.group && (
              <p className="text-xs text-gray-400 truncate">{channel.group}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ChannelsList({ channels }: { channels: XtreamChannel[] }) {
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
            <h3 className="font-medium text-white">{channel.name}</h3>
            {channel.group && <p className="text-sm text-gray-400">{channel.group}</p>}
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
    const firstChannel = channels.find(ch => ch.group === category);
    const firstChannelName = firstChannel?.name.toLowerCase() || '';

    if (categoryLower.includes('sport') || firstChannelName.includes('sport')) return '⚽ Sport';
    if (categoryLower.includes('cine') || categoryLower.includes('film') || firstChannelName.includes('cine')) return '🎬 Cinéma';
    if (categoryLower.includes('kid') || categoryLower.includes('enfant') || firstChannelName.includes('disney') || firstChannelName.includes('gulli')) return '👶 Enfants';
    if (categoryLower.includes('news') || categoryLower.includes('info') || firstChannelName.includes('news') || firstChannelName.includes('bfm')) return '📰 Actualités';
    if (categoryLower.includes('music') || categoryLower.includes('musique') || firstChannelName.includes('mtv')) return '🎵 Musique';
    if (categoryLower.includes('doc') || firstChannelName.includes('discovery') || firstChannelName.includes('nat geo')) return '📚 Documentaires';
    if (categoryLower.includes('series') || firstChannelName.includes('serie')) return '📺 Séries';

    if (firstChannelName.startsWith('[fr]')) return '🇫🇷 Chaînes Françaises';
    if (firstChannelName.startsWith('[uk]')) return '🇬🇧 Chaînes UK';
    if (firstChannelName.startsWith('[us]')) return '🇺🇸 Chaînes US';
    if (firstChannelName.startsWith('[ar]')) return '🇸🇦 Chaînes Arabes';
    if (firstChannelName.startsWith('[de]')) return '🇩🇪 Chaînes Allemandes';
    if (firstChannelName.startsWith('[es]')) return '🇪🇸 Chaînes Espagnoles';
    if (firstChannelName.startsWith('[it]')) return '🇮🇹 Chaînes Italiennes';

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
