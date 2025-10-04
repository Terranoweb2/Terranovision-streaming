'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Mail } from 'lucide-react';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export default function PrivacyPage() {
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
              <Shield className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl md:text-2xl font-bold">Politique de Confidentialité</h1>
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
              Chez <strong className="text-white">TerranoVision</strong>, nous accordons une importance primordiale à la protection
              de vos données personnelles. Cette politique de confidentialité vous informe de la manière dont nous collectons,
              utilisons et protégeons vos informations.
            </p>
            <p className="text-sm text-gray-400 mt-4 mb-0">
              <strong>Dernière mise à jour :</strong> 3 octobre 2025
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <Database className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">1. Données Collectées</h2>
            </div>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">1.1 Informations d'Identification</h3>
            <p className="text-gray-300 leading-relaxed">
              Nous collectons les informations suivantes lors de votre inscription :
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>Nom et prénom</li>
              <li>Adresse e-mail</li>
              <li>Numéro de téléphone (optionnel)</li>
              <li>Pays de résidence</li>
              <li>Date de naissance (pour vérification de l'âge)</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">1.2 Données de Navigation</h3>
            <ul className="text-gray-300 space-y-2">
              <li>Adresse IP et localisation géographique approximative</li>
              <li>Type d'appareil et navigateur utilisé</li>
              <li>Pages visitées et temps passé sur le service</li>
              <li>Historique de visionnage et préférences de contenu</li>
              <li>Recherches effectuées sur la plateforme</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mt-6 mb-3">1.3 Informations de Paiement</h3>
            <p className="text-gray-300 leading-relaxed">
              Les informations de paiement sont traitées de manière sécurisée par nos partenaires de paiement certifiés
              (Stripe, PayPal). Nous ne stockons jamais vos informations bancaires complètes.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <Eye className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">2. Utilisation des Données</h2>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Vos données personnelles sont utilisées pour :
            </p>
            <ul className="text-gray-300 space-y-2">
              <li><strong className="text-white">Fournir le service :</strong> Gérer votre compte, traiter vos abonnements et vous donner accès au contenu</li>
              <li><strong className="text-white">Personnaliser l'expérience :</strong> Recommander du contenu adapté à vos préférences</li>
              <li><strong className="text-white">Communication :</strong> Vous envoyer des notifications importantes, des mises à jour et des offres promotionnelles (avec votre consentement)</li>
              <li><strong className="text-white">Amélioration du service :</strong> Analyser l'utilisation pour optimiser notre plateforme</li>
              <li><strong className="text-white">Sécurité :</strong> Détecter et prévenir les fraudes et abus</li>
              <li><strong className="text-white">Conformité légale :</strong> Respecter nos obligations légales et réglementaires</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <Lock className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">3. Protection des Données</h2>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
            </p>
            <ul className="text-gray-300 space-y-2">
              <li><strong className="text-white">Chiffrement SSL/TLS :</strong> Toutes les communications sont chiffrées</li>
              <li><strong className="text-white">Serveurs sécurisés :</strong> Hébergement dans des centres de données certifiés ISO 27001</li>
              <li><strong className="text-white">Accès restreint :</strong> Seul le personnel autorisé peut accéder aux données sensibles</li>
              <li><strong className="text-white">Surveillance 24/7 :</strong> Détection et réponse aux incidents de sécurité</li>
              <li><strong className="text-white">Sauvegardes régulières :</strong> Protection contre la perte de données</li>
              <li><strong className="text-white">Authentification à deux facteurs :</strong> Option disponible pour renforcer la sécurité de votre compte</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <UserCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">4. Vos Droits</h2>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Conformément au RGPD et aux lois applicables sur la protection des données, vous disposez des droits suivants :
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">✓ Droit d'Accès</h4>
                <p className="text-sm text-gray-300 m-0">Obtenir une copie de vos données personnelles</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">✓ Droit de Rectification</h4>
                <p className="text-sm text-gray-300 m-0">Corriger vos données inexactes ou incomplètes</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">✓ Droit à l'Effacement</h4>
                <p className="text-sm text-gray-300 m-0">Demander la suppression de vos données</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">✓ Droit d'Opposition</h4>
                <p className="text-sm text-gray-300 m-0">Vous opposer au traitement de vos données</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">✓ Droit à la Portabilité</h4>
                <p className="text-sm text-gray-300 m-0">Récupérer vos données dans un format structuré</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-cyan-400 font-semibold mb-2">✓ Droit de Limitation</h4>
                <p className="text-sm text-gray-300 m-0">Limiter le traitement de vos données</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">5. Cookies et Technologies Similaires</h2>

            <p className="text-gray-300 leading-relaxed">
              Nous utilisons des cookies et technologies similaires pour :
            </p>
            <ul className="text-gray-300 space-y-2">
              <li><strong className="text-white">Cookies essentiels :</strong> Nécessaires au fonctionnement du site (connexion, panier, préférences)</li>
              <li><strong className="text-white">Cookies analytiques :</strong> Mesurer l'audience et améliorer nos services</li>
              <li><strong className="text-white">Cookies de personnalisation :</strong> Mémoriser vos préférences et recommandations</li>
              <li><strong className="text-white">Cookies publicitaires :</strong> Afficher des publicités pertinentes (avec votre consentement)</li>
            </ul>

            <p className="text-gray-300 leading-relaxed mt-4">
              Vous pouvez gérer vos préférences de cookies à tout moment depuis les paramètres de votre navigateur.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">6. Partage des Données</h2>

            <p className="text-gray-300 leading-relaxed">
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement avec :
            </p>
            <ul className="text-gray-300 space-y-2">
              <li><strong className="text-white">Prestataires de services :</strong> Hébergement, paiement, analyses (sous accord de confidentialité strict)</li>
              <li><strong className="text-white">Partenaires de contenu :</strong> Fournisseurs de chaînes et programmes (données anonymisées uniquement)</li>
              <li><strong className="text-white">Autorités légales :</strong> En cas d'obligation légale ou de procédure judiciaire</li>
              <li><strong className="text-white">Entreprises affiliées :</strong> Au sein du groupe TerranoVision (même niveau de protection)</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">7. Conservation des Données</h2>

            <p className="text-gray-300 leading-relaxed">
              Nous conservons vos données personnelles pendant la durée strictement nécessaire :
            </p>
            <ul className="text-gray-300 space-y-2">
              <li><strong className="text-white">Compte actif :</strong> Pendant toute la durée de votre abonnement</li>
              <li><strong className="text-white">Après résiliation :</strong> 3 ans maximum (obligations légales et comptables)</li>
              <li><strong className="text-white">Données de paiement :</strong> Conformément aux exigences légales (généralement 5-10 ans)</li>
              <li><strong className="text-white">Données analytiques :</strong> 24 mois maximum sous forme anonymisée</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">8. Transferts Internationaux</h2>

            <p className="text-gray-300 leading-relaxed">
              Vos données peuvent être transférées et traitées dans des pays en dehors de l'Union Européenne.
              Dans ce cas, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types,
              Privacy Shield, etc.) pour protéger vos données conformément au RGPD.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">9. Mineurs</h2>

            <p className="text-gray-300 leading-relaxed">
              Notre service est destiné aux personnes âgées de 18 ans et plus. Nous ne collectons pas sciemment
              d'informations personnelles auprès de mineurs sans le consentement parental. Un contrôle parental
              est disponible pour protéger les enfants.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white m-0">10. Contact</h2>
            </div>

            <p className="text-gray-300 leading-relaxed mb-4">
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits,
              vous pouvez nous contacter :
            </p>

            <div className="bg-gray-900 border border-cyan-500/20 rounded-lg p-6">
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Délégué à la Protection des Données (DPO)</strong>
              </p>
              <p className="text-gray-300 mb-2">
                📧 Email : <a href="mailto:privacy@terranovision.cloud" className="text-cyan-400 hover:text-cyan-300">privacy@terranovision.cloud</a>
              </p>
              <p className="text-gray-300 mb-2">
                📮 Adresse : TerranoVision, Service Protection des Données, [Adresse complète]
              </p>
              <p className="text-gray-300 mb-0">
                ⏱️ Délai de réponse : 30 jours maximum
              </p>
            </div>

            <p className="text-sm text-gray-400 mt-4">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation
              auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) ou de l'autorité
              de protection des données de votre pays.
            </p>
          </section>

          {/* Modifications */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">11. Modifications</h2>

            <p className="text-gray-300 leading-relaxed">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
              Toute modification substantielle vous sera notifiée par email ou via une notification sur la plateforme.
              La version mise à jour entrera en vigueur dès sa publication.
            </p>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 mt-12">
            <p className="text-center text-gray-300 mb-4">
              Vous avez des questions sur la protection de vos données ?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="mailto:privacy@terranovision.cloud"
                className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-6 py-3 rounded-lg transition-all"
              >
                <Mail className="w-5 h-5" />
                Nous Contacter
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Lire les CGU
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
