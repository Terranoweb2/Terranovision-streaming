'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdvancedVideoPlayer } from '@/components/advanced-video-player';
import { MobileHeader } from '@/components/mobile-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Info, AlertCircle, ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';
import Link from 'next/link';
import type { XtreamChannel } from '@/lib/xtream';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface PageProps {
  params: {
    id: string;
  };
}

export default function WatchPage({ params }: PageProps) {
  const router = useRouter();
  const deviceInfo = useDeviceDetection();
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
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Mobile Header - Always visible on mobile */}
      {deviceInfo.isMobile && (
        <MobileHeader
          title={channel?.name}
          showBackButton={true}
          showHomeButton={true}
          transparent={true}
        />
      )}

      {/* Desktop Header */}
      {!deviceInfo.isTV && !deviceInfo.isMobile && (
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
      )}

      {/* Video Player Container */}
      <div className={`relative w-full ${deviceInfo.isMobile ? 'h-screen' : 'h-screen'}`}>
        <AdvancedVideoPlayer
          channel={{
            id: channel.id.toString(),
            name: channel.name,
            // MOBILE FIX: Utiliser TS directement sur mobile pour éviter erreurs HLS
            streamUrl: deviceInfo.isMobile ? (channel.urlTs || channel.urlHls || '') : (channel.urlHls || channel.urlTs || ''),
            streamUrlFallback: channel.urlTs,
            quality: channel.quality,
            qualityVariants: channel.qualityVariants,
            logo: channel.logo
          }}
          onPrevious={() => navigateToChannel('prev')}
          onNext={() => navigateToChannel('next')}
        />
      </div>

      {/* Safe area padding for mobile */}
      <style jsx global>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
        @supports (height: 100dvh) {
          .h-screen {
            height: 100dvh;
          }
        }
      `}</style>
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
