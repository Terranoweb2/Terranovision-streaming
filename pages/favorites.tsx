'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Trash2, Play } from 'lucide-react';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    // Charger les favoris depuis localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const removeFavorite = (channelId: string) => {
    const updated = favorites.filter(fav => fav.id !== channelId);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="hidden md:block">
              <img
                src="https://res.cloudinary.com/dxy0fiahv/image/upload/v1736099542/TERRANOVISION_LOGO_copie_plw60b.png"
                alt="TerranoVision"
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-cyan-400 fill-cyan-400" />
              <h1 className="text-xl md:text-2xl font-bold">Mes Favoris</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-20 h-20 text-gray-700 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Aucun favori</h2>
            <p className="text-gray-400 mb-6">Ajoutez vos chaînes préférées pour les retrouver facilement</p>
            <Link
              href="/channels"
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Explorer les Chaînes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((channel) => (
              <div
                key={channel.id}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-cyan-500 transition-all"
              >
                <div className="relative aspect-video bg-gray-800">
                  {channel.logo && (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-contain p-4"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1">{channel.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{channel.category || 'Général'}</p>
                  <div className="flex gap-2">
                    <Link
                      href={`/watch/${channel.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-2 rounded-lg transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Regarder
                    </Link>
                    <button
                      onClick={() => removeFavorite(channel.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
