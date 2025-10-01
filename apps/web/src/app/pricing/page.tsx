'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-900 via-secondary-800 to-secondary-900">
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
            <Button asChild variant="outline">
              <Link href="/auth/signin">Se connecter</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-500 mb-4">
          Choisissez votre abonnement
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Accédez à toutes les chaînes françaises et sports en qualité 4K, HD et SD
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-secondary-800 rounded-2xl p-8 border-2 border-primary-900/20 hover:border-primary-500/50 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-primary-400 mb-2">Mensuel</h3>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl font-bold text-white">2,000</span>
                <span className="text-xl text-gray-400">XOF</span>
              </div>
              <p className="text-gray-400">Par mois</p>
            </div>

            <ul className="space-y-4 mb-8">
              <FeatureItem text="Toutes les chaînes françaises" />
              <FeatureItem text="Tous les sports (Ligue 1, Champions League, etc.)" />
              <FeatureItem text="Qualité 4K, HD et SD" />
              <FeatureItem text="Accès illimité 24/7" />
              <FeatureItem text="5 profils maximum" />
              <FeatureItem text="Support prioritaire" />
              <FeatureItem text="Sans engagement" />
            </ul>

            <Button className="w-full" size="lg" asChild>
              <Link href="/payment?plan=monthly">S'abonner maintenant</Link>
            </Button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 border-2 border-primary-500 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-secondary-900 text-primary-400 px-3 py-1 rounded-full text-sm font-bold">
              Économisez 17%
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">Annuel</h3>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl font-bold text-secondary-900">20,000</span>
                <span className="text-xl text-secondary-800">XOF</span>
              </div>
              <p className="text-secondary-800">Par an</p>
              <p className="text-sm text-secondary-900 mt-2">Soit 1,667 XOF/mois</p>
            </div>

            <ul className="space-y-4 mb-8">
              <FeatureItem text="Toutes les chaînes françaises" dark />
              <FeatureItem text="Tous les sports (Ligue 1, Champions League, etc.)" dark />
              <FeatureItem text="Qualité 4K, HD et SD" dark />
              <FeatureItem text="Accès illimité 24/7" dark />
              <FeatureItem text="5 profils maximum" dark />
              <FeatureItem text="Support prioritaire" dark />
              <FeatureItem text="2 mois gratuits" dark />
            </ul>

            <Button
              className="w-full bg-secondary-900 text-primary-400 hover:bg-secondary-800"
              size="lg"
              asChild
            >
              <Link href="/payment?plan=yearly">S'abonner maintenant</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-primary-500 text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="Quelles sont les méthodes de paiement acceptées ?"
              answer="Nous acceptons Wave, Mobile Money (MTN, Orange, Moov) et tous les moyens de paiement mobile disponibles en Afrique de l'Ouest."
            />
            <FAQItem
              question="Puis-je annuler mon abonnement ?"
              answer="Oui, vous pouvez annuler à tout moment. Votre accès restera actif jusqu'à la fin de la période payée."
            />
            <FAQItem
              question="Combien d'appareils puis-je utiliser ?"
              answer="Vous pouvez créer jusqu'à 5 profils et regarder sur 2 appareils simultanément."
            />
            <FAQItem
              question="Les chaînes sont-elles disponibles en 4K ?"
              answer="Oui, toutes les chaînes françaises et sports sont disponibles en qualité 4K, HD et SD selon votre connexion."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <Check className={`w-5 h-5 flex-shrink-0 ${dark ? 'text-secondary-900' : 'text-primary-500'}`} />
      <span className={dark ? 'text-secondary-900' : 'text-gray-300'}>{text}</span>
    </li>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-secondary-800 rounded-xl p-6 border border-primary-900/20">
      <h3 className="text-lg font-bold text-primary-400 mb-2">{question}</h3>
      <p className="text-gray-400">{answer}</p>
    </div>
  );
}
