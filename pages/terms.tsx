'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Check, X, AlertCircle, CreditCard, Users, Shield } from 'lucide-react';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
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
              <FileText className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl md:text-2xl font-bold">Conditions Générales d'Utilisation</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="prose prose-invert prose-cyan max-w-none">
          {/* Introduction */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 mb-8">
            <p className="text-gray-300 leading-relaxed mb-0">
              Les présentes Conditions Générales d'Utilisation (ci-après « <strong className="text-white">CGU</strong> ») régissent
              l'accès et l'utilisation du service de streaming <strong className="text-white">TerranoVision</strong>.
              En vous inscrivant et en utilisant notre service, vous acceptez sans réserve ces conditions.
            </p>
            <p className="text-sm text-gray-400 mt-4 mb-0">
              <strong>Dernière mise à jour :</strong> 3 octobre 2025 • <strong>Version :</strong> 2.0
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">1. Objet</h2>
            </div>

            <p className="text-gray-300 leading-relaxed">
              TerranoVision est un service de streaming vidéo en ligne permettant aux abonnés de visionner,
              en illimité, des chaînes de télévision en direct, films, séries, événements sportifs et autres
              contenus audiovisuels (ci-après le « <strong className="text-white">Service</strong> »).
            </p>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-300 mb-2"><strong className="text-white">Services inclus :</strong></p>
              <ul className="text-sm text-gray-300 space-y-1 mb-0">
                <li>✓ Plus de 2400 chaînes TV en direct (SD, HD, 4K)</li>
                <li>✓ Bibliothèque de films et séries à la demande</li>
                <li>✓ Événements sportifs en direct et replays</li>
                <li>✓ Accès multi-appareils (TV, mobile, tablette, ordinateur)</li>
                <li>✓ Enregistrement cloud et visionnage hors ligne (selon formule)</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">2. Inscription et Compte</h2>
            </div>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">2.1 Conditions d'Inscription</h3>
            <ul className="text-gray-300 space-y-2">
              <li>Vous devez avoir au moins <strong className="text-white">18 ans</strong> pour créer un compte</li>
              <li>Les informations fournies doivent être exactes, complètes et à jour</li>
              <li>Vous ne pouvez créer qu'un seul compte par personne</li>
              <li>L'utilisation d'un faux nom ou de fausses informations est interdite</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">2.2 Sécurité du Compte</h3>
            <p className="text-gray-300 leading-relaxed">
              Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité
              effectuée via votre compte sera considérée comme étant de votre fait. Vous devez :
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>Choisir un mot de passe robuste et unique</li>
              <li>Ne jamais partager vos identifiants avec des tiers</li>
              <li>Nous informer immédiatement en cas d'utilisation non autorisée</li>
              <li>Activer l'authentification à deux facteurs (recommandé)</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <CreditCard className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">3. Abonnement et Paiement</h2>
            </div>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">3.1 Formules d'Abonnement</h3>
            <p className="text-gray-300 leading-relaxed">
              Nous proposons différentes formules d'abonnement (mensuel, trimestriel, annuel) avec des
              caractéristiques et tarifs variables. Les prix sont indiqués TTC sur notre page Tarifs.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">Essentiel</h4>
                <p className="text-sm text-gray-300 mb-2">1 écran simultané</p>
                <p className="text-sm text-gray-300 m-0">Qualité HD</p>
              </div>
              <div className="bg-gray-900 border border-cyan-500 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">Premium</h4>
                <p className="text-sm text-gray-300 mb-2">3 écrans simultanés</p>
                <p className="text-sm text-gray-300 m-0">Qualité 4K</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">Famille</h4>
                <p className="text-sm text-gray-300 mb-2">5 écrans simultanés</p>
                <p className="text-sm text-gray-300 m-0">Qualité 4K + Hors ligne</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">3.2 Période d'Essai</h3>
            <p className="text-gray-300 leading-relaxed">
              Un essai gratuit de <strong className="text-white">7 jours</strong> peut être proposé aux nouveaux
              abonnés. À la fin de cette période, votre abonnement sera automatiquement renouvelé et facturé,
              sauf annulation avant la fin de l'essai.
            </p>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">3.3 Modalités de Paiement</h3>
            <ul className="text-gray-300 space-y-2">
              <li>Le paiement s'effectue par carte bancaire, PayPal ou autres moyens acceptés</li>
              <li>La facturation est automatique et récurrente selon la formule choisie</li>
              <li>En cas de paiement refusé, votre accès sera suspendu après 48h</li>
              <li>Les factures sont envoyées par email et accessibles dans votre compte</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">3.4 Résiliation et Remboursement</h3>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-300 leading-relaxed mb-2">
                    <strong className="text-white">Droit de rétractation :</strong> Vous disposez de 14 jours
                    pour annuler votre abonnement et obtenir un remboursement complet (hors période d'essai déjà utilisée).
                  </p>
                  <p className="text-gray-300 leading-relaxed mb-0">
                    Vous pouvez résilier à tout moment. L'accès reste actif jusqu'à la fin de la période payée.
                    Aucun remboursement n'est accordé pour les périodes non utilisées sauf cas exceptionnel.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <Check className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">4. Utilisation du Service</h2>
            </div>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">4.1 Utilisation Autorisée</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 m-0">Visionner le contenu pour votre usage personnel et non commercial</p>
              </div>
              <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 m-0">Utiliser le service sur le nombre d'appareils autorisé par votre formule</p>
              </div>
              <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 m-0">Télécharger du contenu pour visionnage hors ligne (selon formule)</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">4.2 Utilisation Interdite</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 m-0">Partager votre compte ou vos identifiants avec des personnes extérieures à votre foyer</p>
              </div>
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 m-0">Télécharger, copier, redistribuer ou revendre le contenu</p>
              </div>
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 m-0">Utiliser des VPN, proxies ou tout moyen pour contourner les restrictions géographiques</p>
              </div>
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 m-0">Utiliser des robots, scripts ou outils automatisés pour accéder au service</p>
              </div>
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 m-0">Effectuer du reverse engineering ou tenter d'extraire le code source</p>
              </div>
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 m-0">Utiliser le service pour diffuser publiquement du contenu (bars, hôtels, etc.)</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 m-0">
                  <strong className="text-white">Sanctions :</strong> Toute violation de ces règles entraînera
                  la suspension ou la résiliation immédiate de votre compte, sans remboursement. Des poursuites
                  judiciaires pourront être engagées en cas de fraude ou de piratage.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">5. Propriété Intellectuelle</h2>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Tous les contenus disponibles sur TerranoVision (vidéos, images, textes, logos, graphiques, musiques, etc.)
              sont protégés par le droit d'auteur, les marques déposées et autres droits de propriété intellectuelle.
            </p>

            <ul className="text-gray-300 space-y-2 mt-4">
              <li>Les contenus sont la propriété de TerranoVision et/ou de ses partenaires</li>
              <li>Votre abonnement vous accorde uniquement un droit de visionnage personnel et limité</li>
              <li>Toute reproduction, représentation ou diffusion est strictement interdite</li>
              <li>Les marques "TerranoVision" et le logo sont des marques déposées</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">6. Disponibilité et Qualité du Service</h2>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">6.1 Disponibilité</h3>
            <p className="text-gray-300 leading-relaxed">
              Nous nous efforçons d'assurer une disponibilité du service 24h/24 et 7j/7. Toutefois, nous ne
              garantissons pas un accès ininterrompu en raison de :
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>Maintenances programmées (notifiées à l'avance)</li>
              <li>Pannes techniques imprévues</li>
              <li>Cas de force majeure (catastrophes naturelles, attaques informatiques, etc.)</li>
              <li>Problèmes liés à votre fournisseur d'accès Internet ou vos équipements</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">6.2 Qualité du Streaming</h3>
            <p className="text-gray-300 leading-relaxed">
              La qualité de streaming (SD, HD, 4K) dépend de votre formule d'abonnement, de votre connexion Internet
              et de vos équipements. Débit minimum recommandé :
            </p>
            <ul className="text-gray-300 space-y-1 mt-2">
              <li>• <strong className="text-white">SD (480p) :</strong> 3 Mbps</li>
              <li>• <strong className="text-white">HD (1080p) :</strong> 8 Mbps</li>
              <li>• <strong className="text-white">4K (2160p) :</strong> 25 Mbps</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">6.3 Modifications du Catalogue</h3>
            <p className="text-gray-300 leading-relaxed">
              Le catalogue de contenu peut évoluer sans préavis. Nous nous réservons le droit d'ajouter,
              modifier ou retirer des contenus en fonction de nos accords avec les ayants droit.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">7. Responsabilité</h2>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">7.1 Limitation de Responsabilité</h3>
            <p className="text-gray-300 leading-relaxed">
              TerranoVision ne saurait être tenu responsable :
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>Des interruptions temporaires du service</li>
              <li>Des dommages indirects (perte de données, manque à gagner, etc.)</li>
              <li>De la qualité de votre connexion Internet</li>
              <li>De l'incompatibilité de vos équipements avec le service</li>
              <li>Du contenu des publicités de tiers (le cas échéant)</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">7.2 Indemnisation</h3>
            <p className="text-gray-300 leading-relaxed">
              Vous acceptez d'indemniser TerranoVision de toute réclamation résultant de votre utilisation
              non conforme du service ou de votre violation des présentes CGU.
            </p>
          </section>

          {/* Section 8 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">8. Protection des Mineurs</h2>

            <p className="text-gray-300 leading-relaxed">
              Certains contenus peuvent ne pas convenir aux mineurs. Nous proposons un système de
              <strong className="text-white"> contrôle parental </strong> permettant :
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>De créer des profils enfants avec contenus adaptés</li>
              <li>De bloquer l'accès aux contenus pour adultes (18+)</li>
              <li>De définir un code PIN pour les contenus sensibles</li>
              <li>De consulter l'historique de visionnage</li>
            </ul>

            <p className="text-gray-300 leading-relaxed mt-4">
              Il appartient aux parents et tuteurs légaux de surveiller l'utilisation du service par les mineurs.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">9. Modifications des CGU</h2>

            <p className="text-gray-300 leading-relaxed">
              Nous pouvons modifier ces CGU à tout moment. Les modifications substantielles vous seront notifiées
              par email ou via une notification sur la plateforme au moins <strong className="text-white">30 jours</strong> avant
              leur entrée en vigueur. Votre utilisation continue du service après cette période vaut acceptation des nouvelles conditions.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">10. Droit Applicable et Juridiction</h2>

            <p className="text-gray-300 leading-relaxed">
              Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation
              ou à leur exécution relève de la compétence exclusive des tribunaux français, sauf disposition
              légale impérative contraire.
            </p>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-300 mb-2"><strong className="text-white">Règlement des litiges :</strong></p>
              <p className="text-sm text-gray-300 mb-2">
                1. Contactez notre service client : <a href="mailto:support@terranovision.cloud" className="text-cyan-400">support@terranovision.cloud</a>
              </p>
              <p className="text-sm text-gray-300 mb-2">
                2. Médiation : Si aucune solution amiable n'est trouvée, vous pouvez saisir le Médiateur de la consommation
              </p>
              <p className="text-sm text-gray-300 mb-0">
                3. Tribunal compétent : En dernier recours
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">11. Dispositions Générales</h2>

            <ul className="text-gray-300 space-y-3">
              <li>
                <strong className="text-white">Intégralité de l'accord :</strong> Les présentes CGU constituent
                l'intégralité de l'accord entre vous et TerranoVision
              </li>
              <li>
                <strong className="text-white">Divisibilité :</strong> Si une clause est jugée invalide, les autres
                dispositions restent en vigueur
              </li>
              <li>
                <strong className="text-white">Renonciation :</strong> Le fait de ne pas exercer un droit ne constitue
                pas une renonciation à ce droit
              </li>
              <li>
                <strong className="text-white">Cession :</strong> Vous ne pouvez pas céder vos droits sans notre accord écrit
              </li>
              <li>
                <strong className="text-white">Langue :</strong> En cas de traduction, la version française fait foi
              </li>
            </ul>
          </section>

          {/* Contact */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 mt-12">
            <h3 className="text-xl font-bold text-white mb-4">Nous Contacter</h3>
            <p className="text-gray-300 mb-4">
              Pour toute question concernant ces Conditions Générales d'Utilisation :
            </p>
            <div className="space-y-2">
              <p className="text-gray-300 m-0">
                📧 Support : <a href="mailto:support@terranovision.cloud" className="text-cyan-400 hover:text-cyan-300">support@terranovision.cloud</a>
              </p>
              <p className="text-gray-300 m-0">
                📧 Juridique : <a href="mailto:legal@terranovision.cloud" className="text-cyan-400 hover:text-cyan-300">legal@terranovision.cloud</a>
              </p>
              <p className="text-gray-300 m-0">
                📮 Adresse : TerranoVision, Service Juridique, [Adresse complète]
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link
                href="/privacy"
                className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-6 py-3 rounded-lg transition-all"
              >
                <Shield className="w-5 h-5" />
                Politique de Confidentialité
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Voir les Tarifs
              </Link>
            </div>
          </div>

          {/* Acceptance */}
          <div className="bg-cyan-500/10 border border-cyan-500 rounded-xl p-6 mt-8">
            <p className="text-center text-white font-semibold mb-2">
              ✓ En utilisant TerranoVision, vous reconnaissez avoir lu, compris et accepté ces CGU
            </p>
            <p className="text-center text-sm text-gray-400 mb-0">
              Version 2.0 - Effective au 3 octobre 2025
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
