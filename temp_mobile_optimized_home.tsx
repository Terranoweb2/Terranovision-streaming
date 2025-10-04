'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Info, ChevronLeft, ChevronRight, Tv, Film, Trophy, Search } from 'lucide-react';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export default function HomePage() {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Hero carousel images (films & séries populaires)
  const heroSlides = [
    {
      image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491200/the-super-hero-in-the-poster-1_5000x_whuwqd.jpg',
      title: 'Super-Héros',
      description: 'Découvrez les plus grandes aventures héroïques en streaming illimité',
      category: 'Action • Aventure'
    },
    {
      image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491200/the-manager-in-the-poster-1_5000x_zycxok.webp',
      title: 'Séries Dramatiques',
      description: 'Des histoires captivantes qui vous tiendront en haleine',
      category: 'Drame • Suspense'
    },
    {
      image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491199/myCANAL_16x9_MEA_1920x1080-vhtL_vxhrhy.webp',
      title: 'Cinéma Premium',
      description: 'Les meilleurs films et séries en exclusivité',
      category: 'Premium • HD/4K'
    }
  ];

  // Films & Séries en vedette
  const featuredContent = [
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491200/php14pT6E_uuzhxe.avif', title: 'Blockbuster Action' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491200/php2eCjHe_pqjczy.avif', title: 'Thriller Intense' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491200/myCANAL_16x9_MEA_1920x1080-xSaC_xtozvf.webp', title: 'Série du Moment' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491199/myCANAL_16x9_MEA_1920x1080-vJYs_c9bqcn.webp', title: 'Drame Captivant' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491199/myCANAL_16x9_MEA_1920x1080-wb18_mayp4s.webp', title: 'Comédie Familiale' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491199/myCANAL_16x9_MEA_1920x1080-tYAq_au7hyv.webp', title: 'Science-Fiction' }
  ];

  // Séries populaires
  const popularSeries = [
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491199/myCANAL_16x9_MEA_1920x1080-RHS9_y19b6v.webp', title: 'Nouveau' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491199/myCANAL_16x9_MEA_1920x1080-Qo03_bwtrod.webp', title: 'Tendance' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491199/myCANAL_16x9_MEA_1920x1080-siRK_fkcfej.webp', title: 'Top 10' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491199/myCANAL_16x9_MEA_1920x1080-qt88_hikcze.webp', title: 'Populaire' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491165/myCANAL_16x9_MEA_1920x1080-mopm_1_kcqbma.webp', title: 'Classique' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491165/myCANAL_16x9_MEA_1920x1080-nXnI_pkis3d.webp', title: 'Exclusif' }
  ];

  // Films à l'affiche
  const nowPlaying = [
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491165/myCANAL_16x9_MEA_1920x1080-mopm_tjc1di.webp', title: 'Film 1' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491165/myCANAL_16x9_MEA_1920x1080-M1ef_yijbdx.webp', title: 'Film 2' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491164/myCANAL_16x9_MEA_1920x1080-i4C-_wfpusb.webp', title: 'Film 3' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491164/myCANAL_16x9_MEA_1920x1080-gp24_iqk0mt.webp', title: 'Film 4' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491163/myCANAL_16x9_MEA_1920x1080-9UIN_wow4cz.webp', title: 'Film 5' },
    { image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491162/118509880_nmsayd.webp', title: 'Film 6' }
  ];

  // Sports en direct
  const sportsHighlights = [
    {
      image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491162/Barcelone-PSG-zSRB_im660k.webp',
      title: 'Barcelone vs PSG',
      label: 'EN DIRECT',
      time: 'Maintenant'
    },
    {
      image: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1759491161/121058786_dho4i1.webp',
      title: 'Match du Jour',
      label: 'BIENTÔT',
      time: '20:45'
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8">
              <img
                src="https://res.cloudinary.com/dxy0fiahv/image/upload/v1736099542/TERRANOVISION_LOGO_copie_plw60b.png"
                alt="TerranoVision"
                className="h-7 md:h-8 w-auto"
              />
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-white hover:text-cyan-400 transition-colors font-medium">
                  Accueil
                </Link>
                <Link href="/channels" className="text-gray-300 hover:text-white transition-colors">
                  Chaînes
                </Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                  Tarifs
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/channels"
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5 text-white" />
              </Link>
              <Link
                href="/auth/signin"
                className="hidden md:block text-gray-300 hover:text-white transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/pricing"
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-4 md:px-6 py-2 rounded-md transition-all text-sm md:text-base"
              >
                S'abonner
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <section className="relative h-[60vh] md:h-[85vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentHeroSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <div className="max-w-2xl space-y-3 md:space-y-6">
                <div className="inline-block px-2 md:px-3 py-1 bg-cyan-500/20 border border-cyan-500 rounded text-cyan-400 text-xs md:text-sm font-semibold">
                  {slide.category}
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight">
                  {slide.title}
                </h1>
                <p className="text-sm md:text-xl text-gray-300 max-w-xl line-clamp-2 md:line-clamp-none">
                  {slide.description}
                </p>
                <div className="flex items-center gap-2 md:gap-4 pt-2 md:pt-4">
                  <Link
                    href="/channels"
                    className="flex items-center gap-2 bg-white text-black font-semibold px-4 md:px-8 py-2 md:py-3 rounded-md hover:bg-gray-200 transition-all text-sm md:text-base"
                  >
                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                    <span className="hidden sm:inline">Regarder maintenant</span>
                    <span className="sm:hidden">Regarder</span>
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex items-center gap-2 bg-gray-800/80 backdrop-blur text-white font-semibold px-4 md:px-8 py-2 md:py-3 rounded-md hover:bg-gray-700 transition-all text-sm md:text-base"
                  >
                    <Info className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Plus d'infos</span>
                    <span className="sm:hidden">Infos</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls - Desktop only */}
        <button
          onClick={prevSlide}
          className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur p-3 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur p-3 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              className={`h-1 transition-all ${
                index === currentHeroSlide ? 'w-8 bg-cyan-500' : 'w-4 bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Sports EN DIRECT */}
      <section className="py-6 md:py-12 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            <h2 className="text-xl md:text-3xl font-bold">Sports en Direct</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3 md:gap-6">
            {sportsHighlights.map((sport, index) => (
              <Link
                key={index}
                href="/channels"
                className="group relative h-48 md:h-72 rounded-lg md:rounded-xl overflow-hidden"
              >
                <img
                  src={sport.image}
                  alt={sport.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute top-2 md:top-4 left-2 md:left-4">
                  <span className="inline-block px-2 md:px-3 py-1 bg-red-600 text-white text-xs font-bold rounded animate-pulse">
                    {sport.label}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
                  <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">{sport.title}</h3>
                  <p className="text-cyan-400 font-semibold text-sm md:text-base">{sport.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Films & Séries en Vedette */}
      <section className="py-6 md:py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Film className="w-6 h-6 md:w-8 md:h-8 text-cyan-500" />
            <h2 className="text-xl md:text-3xl font-bold">Films & Séries en Vedette</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {featuredContent.map((item, index) => (
              <Link
                key={index}
                href="/channels"
                className="group relative aspect-[2/3] rounded-lg overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-xs md:text-sm font-semibold">{item.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Séries Populaires */}
      <section className="py-6 md:py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Tv className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
            <h2 className="text-xl md:text-3xl font-bold">Séries Populaires</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {popularSeries.map((item, index) => (
              <Link
                key={index}
                href="/channels"
                className="group relative aspect-[2/3] rounded-lg overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 bg-purple-600 text-xs font-bold px-2 py-1 rounded">
                  #{index + 1}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Films à l'Affiche */}
      <section className="py-6 md:py-12 bg-gray-950 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">Nouveautés Cinéma</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {nowPlaying.map((item, index) => (
              <Link
                key={index}
                href="/channels"
                className="group relative aspect-[2/3] rounded-lg overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-current drop-shadow-lg" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Desktop only */}
      <section className="hidden md:block py-20 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Plus de 2400 Chaînes à Découvrir
          </h2>
          <p className="text-xl text-cyan-100 mb-8">
            Films, séries, sports, documentaires... Tout le divertissement dont vous rêvez en un seul endroit
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-white text-cyan-600 font-bold px-10 py-4 rounded-lg text-lg hover:bg-gray-100 transition-all shadow-xl"
          >
            <Play className="w-6 h-6 fill-current" />
            Commencer à Regarder
          </Link>
        </div>
      </section>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer - Desktop only */}
      <footer className="hidden md:block bg-black border-t border-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img
                src="https://res.cloudinary.com/dxy0fiahv/image/upload/v1736099542/TERRANOVISION_LOGO_copie_plw60b.png"
                alt="TerranoVision"
                className="h-10 w-auto mb-4"
              />
              <p className="text-gray-400 text-sm">
                Votre plateforme de streaming nouvelle génération
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/channels" className="hover:text-white transition-colors">Chaînes</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Compte</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/auth/signin" className="hover:text-white transition-colors">Se connecter</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">S'inscrire</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">CGU</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-900 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2025 TerranoVision. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
