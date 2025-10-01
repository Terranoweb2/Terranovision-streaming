import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tv, Grid3x3, Search, Heart, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-900 via-secondary-800 to-secondary-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-500 p-4 rounded-full">
              <Tv className="w-16 h-16 text-secondary-900" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            TerranoVision
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Votre plateforme de streaming TV nouvelle génération
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Profitez de milliers de chaînes en direct, un guide TV intégré, et une expérience de
            visionnage fluide sur tous vos appareils.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/channels">Découvrir les chaînes</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link href="/auth/signin">Se connecter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary-500">
          Fonctionnalités principales
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Grid3x3 className="w-8 h-8" />}
            title="Grille de chaînes"
            description="Naviguez facilement parmi des milliers de chaînes organisées par catégories"
          />
          <FeatureCard
            icon={<Search className="w-8 h-8" />}
            title="Recherche instantanée"
            description="Trouvez vos chaînes préférées en quelques secondes"
          />
          <FeatureCard
            icon={<Heart className="w-8 h-8" />}
            title="Favoris"
            description="Sauvegardez vos chaînes favorites pour un accès rapide"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Contrôle parental"
            description="Protégez vos enfants avec un système de verrouillage par PIN"
          />
          <FeatureCard
            icon={<Tv className="w-8 h-8" />}
            title="Guide TV (EPG)"
            description="Consultez les programmes en cours et à venir"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Streaming haute qualité"
            description="Profitez d'une diffusion fluide en HD avec contrôle de la qualité"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-secondary-900">
            Prêt à commencer ?
          </h2>
          <p className="text-lg mb-8 text-secondary-800">
            Créez votre compte gratuitement et accédez à des milliers de chaînes
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link href="/auth/signin">Commencer maintenant</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-secondary-800/50 backdrop-blur-sm border border-primary-900/20 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
      <div className="text-primary-500 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-primary-400">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
