'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Info, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { XtreamChannel } from '@/lib/xtream';

interface PageProps {
  params: {
    id: string;
  };
}

export default function WatchPage({ params }: PageProps) {
  const router = useRouter();
  const [channel, setChannel] = useState<XtreamChannel | null>(null);
  const [allChannels, setAllChannels] = useState<XtreamChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchChannel();
    checkFavorite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchChannel = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer toutes les chaînes depuis l'API
      const response = await fetch('/api/xtream/list');

      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la chaîne');
      }

      const data = await response.json();
      setAllChannels(data.channels);

      const foundChannel = data.channels.find(
        (ch: XtreamChannel) => ch.id.toString() === params.id
      );

      if (!foundChannel) {
        setError('Chaîne introuvable');
        return;
      }

      setChannel(foundChannel);
    } catch (err: any) {
      console.error('[Watch] Error fetching channel:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(params.id));
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites: string[];

    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== params.id);
    } else {
      newFavorites = [...favorites, params.id];
    }

    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const navigateToChannel = (direction: 'prev' | 'next') => {
    if (!channel || allChannels.length === 0) return;

    const currentIndex = allChannels.findIndex(ch => ch.id.toString() === params.id);
    if (currentIndex === -1) return;

    let nextIndex: number;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % allChannels.length;
    } else {
      nextIndex = currentIndex === 0 ? allChannels.length - 1 : currentIndex - 1;
    }

    const nextChannel = allChannels[nextIndex];
    router.push(`/watch/${nextChannel.id}`);
  };

  // Navigation clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        navigateToChannel('prev');
      } else if (e.key === 'ArrowRight') {
        navigateToChannel('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, allChannels]);

  if (loading) {
    return <PlayerLoading />;
  }

  if (error || !channel) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Erreur</h2>
          <p className="text-gray-400 mb-8">{error || 'Chaîne introuvable'}</p>
          <Button asChild>
            <Link href="/channels">Retour aux chaînes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="text-white">
              <Link href="/channels">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <img
                src="https://res.cloudinary.com/dxy0fiahv/image/upload/v1736099542/TERRANOVISION_LOGO_copie_plw60b.png"
                alt="TerranoVision"
                className="h-8 w-auto object-contain"
              />
              <span className="text-sm font-bold text-white">TerranoVision</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white"
              onClick={toggleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="text-white">
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Video Player */}
      <div className="relative h-screen w-full">
        <VideoPlayer
          channel={{
            id: channel.id.toString(),
            name: channel.name,
            streamUrl: channel.urlHls || channel.urlTs,
            streamUrlFallback: channel.urlTs,
          }}
        />

        {/* Boutons de navigation */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white"
          onClick={() => navigateToChannel('prev')}
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white"
          onClick={() => navigateToChannel('next')}
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      </div>

      {/* Info Overlay (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 to-transparent p-6 pointer-events-none">
        <div className="container mx-auto">
          <div className="flex items-start gap-4">
            {channel.logo && (
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{channel.name}</h1>
              {channel.group && (
                <p className="text-sm text-primary-400 mb-2">{channel.group}</p>
              )}
              <p className="text-xs text-gray-400">
                Stream: {channel.urlHls ? 'HLS' : 'TS'} • ID: {channel.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4" />
        <p className="text-white">Chargement du lecteur...</p>
      </div>
    </div>
  );
}
