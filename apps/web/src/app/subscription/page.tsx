'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user subscription from API
    // For now, using mock data
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  // No active subscription
  if (!subscription) {
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
              <Button asChild variant="ghost">
                <Link href="/channels">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* No Subscription Content */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Aucun abonnement actif</h1>
            <p className="text-xl text-gray-400 mb-8">
              Abonnez-vous pour accéder à toutes les chaînes françaises et sports en 4K, HD et SD
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-secondary-800 rounded-xl p-6 border border-primary-900/20">
                <h3 className="text-xl font-bold text-primary-400 mb-4">Mensuel</h3>
                <div className="text-4xl font-bold text-white mb-2">2,000 XOF</div>
                <p className="text-gray-400 mb-4">Par mois</p>
                <Button className="w-full" asChild>
                  <Link href="/pricing">Voir les détails</Link>
                </Button>
              </div>

              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-6 border-2 border-primary-500">
                <h3 className="text-xl font-bold text-secondary-900 mb-4">Annuel</h3>
                <div className="text-4xl font-bold text-secondary-900 mb-2">20,000 XOF</div>
                <p className="text-secondary-800 mb-4">Par an (économisez 17%)</p>
                <Button className="w-full bg-secondary-900 text-primary-400 hover:bg-secondary-800" asChild>
                  <Link href="/pricing">Voir les détails</Link>
                </Button>
              </div>
            </div>

            <Button size="lg" asChild>
              <Link href="/pricing">Découvrir nos offres</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Active subscription
  const daysRemaining = Math.ceil(
    (new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

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
            <Button asChild variant="ghost">
              <Link href="/channels">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Subscription Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-secondary-800 rounded-2xl p-8 border border-primary-900/20 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">Abonnement actif</h1>
                <p className="text-gray-400">Plan {subscription.billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel'}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary-500" />
                <div>
                  <p className="text-sm text-gray-400">Date de début</p>
                  <p className="text-white font-semibold">
                    {new Date(subscription.startDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary-500" />
                <div>
                  <p className="text-sm text-gray-400">Date de fin</p>
                  <p className="text-white font-semibold">
                    {new Date(subscription.endDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-primary-500" />
                <div>
                  <p className="text-sm text-gray-400">Jours restants</p>
                  <p className="text-white font-semibold">{daysRemaining} jours</p>
                </div>
              </div>
            </div>

            {daysRemaining <= 7 && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6">
                <p className="text-yellow-500 text-sm">
                  ⚠️ Votre abonnement expire dans {daysRemaining} jours. Renouvelez maintenant pour continuer à
                  profiter de tout le contenu.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                Modifier l'abonnement
              </Button>
              <Button variant="destructive" className="flex-1">
                Annuler l'abonnement
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="bg-secondary-800 rounded-2xl p-8 border border-primary-900/20">
            <h2 className="text-2xl font-bold text-white mb-6">Vos avantages</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-300">Toutes les chaînes françaises</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-300">Tous les sports (Ligue 1, Champions League, etc.)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-300">Qualité 4K, HD et SD</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-300">Accès illimité 24/7</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-300">5 profils maximum</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-300">Support prioritaire</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
