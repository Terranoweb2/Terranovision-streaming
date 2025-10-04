'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Tv, Menu, ChevronRight } from 'lucide-react';

interface Channel {
  id: number;
  name: string;
  group: string;
  quality?: string;
}

export default function HomePage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

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
  const sportsChannels = channels.filter(c => c.group?.toLowerCase().includes('sport')).slice(0, 6);
  const moviesChannels = channels.filter(c => c.group?.toLowerCase().includes('cinema') || c.group?.toLowerCase().includes('movie')).slice(0, 6);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Tv className="w-8 h-8 text-cyan-400" />
                <span className="text-2xl font-bold">
                  TERRANO<span className="text-cyan-400">VISION</span>
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-cyan-400 font-semibold">HOME</Link>
              <Link href="/channels" className="text-gray-300 hover:text-white transition-colors">CONTACT</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">FAQ</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">PRICING</Link>
              <div className="relative group">
                <button className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                  RESOURCES <ChevronRight className="w-4 h-4 rotate-90" />
                </button>
              </div>
            </nav>

            <Link href="/channels">
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md font-semibold transition-colors flex items-center gap-2">
                PACKAGES <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - TV + MOBILE with Premier League */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                TV + <span className="italic">MOBILE</span>
              </h1>
              <p className="text-xl text-gray-300 mb-2">Premier League On Pyinn Tv</p>
              <p className="text-cyan-400 mb-8">Top One Sport Channel In Myanmar</p>

              <Link href="/pricing">
                <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-md font-semibold transition-colors inline-flex items-center gap-2">
                  Our Pricing <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
            </div>

            <div className="relative">
              <div className="grid grid-cols-5 gap-4 items-center">
                {/* Placeholder pour les joueurs - on utilise des icônes TV */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-square bg-gradient-to-br from-red-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Tv className="w-12 h-12 text-white" />
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-4 right-0 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-cyan-500">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-white">⚽</div>
                  <div>
                    <p className="text-xs text-gray-400">Premier</p>
                    <p className="font-bold text-cyan-400">League</p>
                  </div>
                  <Tv className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
      </section>

      {/* TOP PROGRAMS */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">TOP PROGRAMS</h2>
          <p className="text-gray-400 mb-8">
            From blockbuster movies and hit original series to live Premier League matches and action-packed sports, CANAL+ brings you the most-watched programs in one place. Whether you&apos;re into thrilling drama, family favorites, or world-class football—there&apos;s always something for everyone to enjoy, now.
          </p>

          <h3 className="text-2xl font-bold mb-8 italic">best streaming platforms</h3>

          {/* Streaming Platforms */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {[
              { name: 'Apple TV', color: 'from-gray-800 to-black', logo: '🍎' },
              { name: 'Hulu', color: 'from-green-400 to-green-600', logo: 'hulu' },
              { name: 'HBO Max', color: 'from-blue-600 to-purple-600', logo: 'HBO' },
              { name: 'Netflix', color: 'from-red-600 to-red-700', logo: 'NETFLIX' },
              { name: 'Prime Video', color: 'from-blue-400 to-blue-600', logo: 'prime' }
            ].map((platform, index) => (
              <div key={index} className={`aspect-[3/4] bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center p-6 hover:scale-105 transition-transform cursor-pointer`}>
                <div className="text-center">
                  <p className="text-4xl mb-2">{platform.logo.startsWith('🍎') ? platform.logo : ''}</p>
                  <p className="text-white font-bold text-xl">{platform.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* MOVIES AND SERIES */}
          <h3 className="text-2xl font-bold mb-8">MOVIES AND SERIES</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {moviesChannels.length > 0 ? (
              moviesChannels.map((channel) => (
                <Link key={channel.id} href={`/watch/${channel.id}`}>
                  <div className="group aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden relative hover:scale-105 transition-transform cursor-pointer">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tv className="w-16 h-16 text-cyan-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <p className="text-white font-semibold text-sm line-clamp-2">{channel.name}</p>
                    </div>
                    {channel.quality && (
                      <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded">
                        {channel.quality}
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              // Placeholder si pas de chaînes
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                  <Tv className="w-16 h-16 text-cyan-400" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Sports Section */}
      {sportsChannels.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-bold mb-8">SPORTS CHANNELS</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {sportsChannels.map((channel) => (
                <Link key={channel.id} href={`/watch/${channel.id}`}>
                  <div className="group aspect-square bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center p-4 hover:scale-105 transition-transform cursor-pointer">
                    <div className="text-center">
                      <Tv className="w-12 h-12 text-white mb-2 mx-auto group-hover:scale-110 transition-transform" />
                      <p className="text-white font-semibold text-xs line-clamp-2">{channel.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Streaming?</h2>
          <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users and enjoy the best of TV streaming
          </p>
          <Link href="/channels">
            <button className="bg-white text-cyan-600 px-8 py-4 rounded-md font-bold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
              <Play className="w-5 h-5" />
              Explore Channels
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Tv className="w-8 h-8 text-cyan-400" />
                <span className="text-xl font-bold">
                  TERRANO<span className="text-cyan-400">VISION</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm">Your destination for live TV streaming</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/channels" className="hover:text-cyan-400 transition-colors">Channels</Link></li>
                <li><Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/auth/signin" className="hover:text-cyan-400 transition-colors">Sign In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-cyan-400 transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 TerranoVision. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
