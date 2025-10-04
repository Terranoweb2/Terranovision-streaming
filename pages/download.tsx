'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Smartphone, Tv, Shield, Zap, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export default function DownloadPage() {
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
              <Download className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl md:text-2xl font-bold">Télécharger l'Application</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10" />
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Regardez TerranoVision
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Partout, À Tout Moment
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-4">
            Profitez de TerranoVision directement depuis votre navigateur web ou téléchargez
            nos applications natives (bientôt disponibles)
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-8 py-3 rounded-lg transition-all shadow-lg mb-8"
          >
            <Globe className="w-5 h-5" />
            Accéder à la Version Web
          </Link>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm">100% Gratuit</span>
            </div>
            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="text-sm">Sécurisé</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-sm">Installation Rapide</span>
            </div>
          </div>
        </div>
      </section>

      {/* Download Cards */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Android Mobile */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-cyan-500/20 p-4 rounded-2xl">
                  <Smartphone className="w-10 h-10 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Android Mobile</h3>
                  <p className="text-gray-400">Smartphones & Tablettes</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Interface tactile optimisée</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Mode portrait & paysage</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Chromecast intégré</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Téléchargement hors ligne</span>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Version</span>
                  <span className="text-white font-semibold">1.0.0</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Taille</span>
                  <span className="text-white font-semibold">25 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Minimum</span>
                  <span className="text-white font-semibold">Android 8.0+</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-2">
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">Bientôt Disponible</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">L'APK Mobile sera disponible prochainement</p>
                </div>

                <Link
                  href="/"
                  className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-lg text-center transition-all shadow-lg shadow-cyan-500/20"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Globe className="w-5 h-5" />
                    Utiliser la Version Web
                  </div>
                  <span className="text-xs opacity-80">Accès immédiat depuis votre navigateur</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Android TV */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-purple-500/20 p-4 rounded-2xl">
                  <Tv className="w-10 h-10 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Android TV</h3>
                  <p className="text-gray-400">Smart TV & Box Android</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Interface TV 10-foot</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Navigation télécommande</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Streaming 4K/HDR</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Guide TV intégré</span>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Version</span>
                  <span className="text-white font-semibold">1.0.0</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Taille</span>
                  <span className="text-white font-semibold">28 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Minimum</span>
                  <span className="text-white font-semibold">Android TV 8.0+</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-2">
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">Bientôt Disponible</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">L'APK TV sera disponible prochainement</p>
                </div>

                <Link
                  href="/"
                  className="block w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 rounded-lg text-center transition-all shadow-lg shadow-purple-500/20"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Globe className="w-5 h-5" />
                    Utiliser la Version Web
                  </div>
                  <span className="text-xs opacity-80">Compatible avec le navigateur de votre TV</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Instructions */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-cyan-400" />
            Instructions d'Installation
          </h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3 text-cyan-400">1. Autoriser les sources inconnues</h4>
              <p className="text-gray-300 mb-2">Sur Android :</p>
              <ul className="list-disc list-inside text-gray-400 space-y-1 ml-4">
                <li>Paramètres → Sécurité → Sources inconnues (activer)</li>
                <li>Ou : Paramètres → Applications → Accès spécial → Installer des apps inconnues</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3 text-cyan-400">2. Télécharger l'APK</h4>
              <p className="text-gray-300">
                Cliquez sur le bouton de téléchargement ci-dessus (Mobile ou TV selon votre appareil)
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3 text-cyan-400">3. Installer l'application</h4>
              <ul className="list-disc list-inside text-gray-400 space-y-1 ml-4">
                <li>Ouvrez le fichier APK téléchargé</li>
                <li>Appuyez sur "Installer"</li>
                <li>Attendez la fin de l'installation</li>
                <li>Appuyez sur "Ouvrir" pour lancer l'app</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3 text-cyan-400">4. Se connecter</h4>
              <p className="text-gray-300">
                Utilisez vos identifiants TerranoVision pour vous connecter et profiter de vos chaînes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold mb-8 text-center">Questions Fréquentes</h3>

        <div className="space-y-4">
          <details className="bg-gray-900 border border-gray-800 rounded-lg p-6 group">
            <summary className="font-semibold cursor-pointer flex items-center justify-between">
              L'application est-elle vraiment gratuite ?
              <span className="text-cyan-400">+</span>
            </summary>
            <p className="text-gray-400 mt-4">
              Oui, le téléchargement et l'installation de l'application sont 100% gratuits.
              Vous devez cependant disposer d'un abonnement actif TerranoVision pour accéder au contenu.
            </p>
          </details>

          <details className="bg-gray-900 border border-gray-800 rounded-lg p-6 group">
            <summary className="font-semibold cursor-pointer flex items-center justify-between">
              L'APK est-il sûr ?
              <span className="text-cyan-400">+</span>
            </summary>
            <p className="text-gray-400 mt-4">
              Absolument. Nos APKs sont signés numériquement et ne contiennent aucun malware.
              Téléchargez uniquement depuis notre site officiel terranovision.cloud.
            </p>
          </details>

          <details className="bg-gray-900 border border-gray-800 rounded-lg p-6 group">
            <summary className="font-semibold cursor-pointer flex items-center justify-between">
              Quelle est la différence entre Mobile et TV ?
              <span className="text-cyan-400">+</span>
            </summary>
            <p className="text-gray-400 mt-4">
              L'APK Mobile est optimisé pour smartphones et tablettes avec interface tactile.
              L'APK TV est conçu pour Android TV avec navigation télécommande et interface 10-foot adaptée au grand écran.
            </p>
          </details>

          <details className="bg-gray-900 border border-gray-800 rounded-lg p-6 group">
            <summary className="font-semibold cursor-pointer flex items-center justify-between">
              Comment mettre à jour l'application ?
              <span className="text-cyan-400">+</span>
            </summary>
            <p className="text-gray-400 mt-4">
              Revenez sur cette page pour télécharger la dernière version.
              Les mises à jour automatiques seront disponibles prochainement via le Play Store.
            </p>
          </details>

          <details className="bg-gray-900 border border-gray-800 rounded-lg p-6 group">
            <summary className="font-semibold cursor-pointer flex items-center justify-between">
              Sur quels appareils puis-je installer l'app ?
              <span className="text-cyan-400">+</span>
            </summary>
            <p className="text-gray-400 mt-4">
              <strong>APK Mobile :</strong> Smartphones et tablettes Android 8.0+
              <br />
              <strong>APK TV :</strong> Smart TV Android, Box Android (Mi Box, Shield TV, Fire TV, etc.)
            </p>
          </details>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Besoin d'Aide ?</h3>
          <p className="text-cyan-100 mb-6">
            Notre équipe support est disponible 24/7 pour vous assister
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@terranovision.cloud"
              className="bg-white text-cyan-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all"
            >
              Contacter le Support
            </a>
            <Link
              href="/pricing"
              className="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-lg hover:bg-white/10 transition-all"
            >
              Voir les Offres
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
