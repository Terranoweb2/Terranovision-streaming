'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Sparkles, TrendingUp, Tv, Search, Menu, User } from 'lucide-react';

interface Channel {
  id: number;
  name: string;
  group: string;
  quality?: string;
}

export default function HomePage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/xtream/list');
      const data = await response.json();
      setChannels(data.channels || []);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const trendingChannels = channels.filter(c => c.quality === 'FHD' || c.quality === 'UHD/4K').slice(0, 12);
  const categories = [...new Set(channels.map(c => c.group))].slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Tv className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TerranoVision</span>
            </Link>

            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-6">
                <Link href="/channels" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Chaînes
                </Link>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Tarifs
                </Link>
              </nav>

              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
                <Link href="/auth/signin">
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                    Connexion
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Streaming TV <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Illimité
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Accédez à plus de 2400 chaînes en direct. Films, séries, sports et bien plus encore.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/channels">
                <button className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Commencer gratuitement
                </button>
              </Link>
              <Link href="/pricing">
                <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20">
                  Voir les offres
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tv className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2400+ Chaînes</h3>
              <p className="text-gray-600">Accès illimité à toutes vos chaînes préférées</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Qualité HD/4K</h3>
              <p className="text-gray-600">Streaming en haute définition jusqu&apos;à 4K</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Toujours à jour</h3>
              <p className="text-gray-600">Nouveau contenu ajouté régulièrement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Catégories populaires</h2>
            <Link href="/channels" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Voir tout
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link key={index} href={`/channels?category=${encodeURIComponent(category)}`}>
                <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Tv className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Channels */}
      {!loading && trendingChannels.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Tendances</h2>
              <Link href="/channels" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Voir tout
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trendingChannels.map((channel) => (
                <Link key={channel.id} href={`/watch/${channel.id}`}>
                  <div className="group">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative hover:shadow-xl transition-all">
                      <Tv className="w-12 h-12 text-gray-400 group-hover:scale-110 transition-transform" />
                      {channel.quality && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
                          {channel.quality}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {channel.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d&apos;utilisateurs satisfaits et profitez du meilleur du streaming TV
          </p>
          <Link href="/channels">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
              <Play className="w-5 h-5" />
              Découvrir les chaînes
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Tv className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold">TerranoVision</span>
              </div>
              <p className="text-sm">Votre destination pour le streaming TV en direct</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/channels" className="hover:text-white transition-colors">Chaînes</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Compte</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Connexion</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Inscription</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 TerranoVision. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
