'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported?: number;
    updated?: number;
    errors?: number;
    message?: string;
  } | null>(null);

  const handleAutoImport = async () => {
    setImporting(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:4000/ingest/import/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setResult({
        success: true,
        imported: data.imported,
        updated: data.updated,
        errors: data.errors,
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Une erreur est survenue lors de l\'import',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleManualImport = async (url: string) => {
    if (!url.trim()) {
      setResult({
        success: false,
        message: 'Veuillez entrer une URL valide',
      });
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:4000/ingest/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setResult({
        success: true,
        imported: data.imported,
        updated: data.updated,
        errors: data.errors,
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Une erreur est survenue lors de l\'import',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-900 via-secondary-800 to-secondary-900">
      {/* Header */}
      <header className="border-b border-primary-900/20 bg-secondary-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-primary-500">Import de Playlist M3U</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Auto Import Section */}
          <div className="bg-secondary-800/50 backdrop-blur-sm border border-primary-900/20 rounded-xl p-8 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-primary-500/10 p-3 rounded-lg">
                <Upload className="w-6 h-6 text-primary-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-primary-400 mb-2">
                  Import Automatique
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Utilise l'URL M3U configurée dans les variables d'environnement
                  (M3U_ENDPOINT)
                </p>
                <Button
                  onClick={handleAutoImport}
                  disabled={importing}
                  className="w-full sm:w-auto"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Import en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Importer depuis M3U_ENDPOINT
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <div
                className={`mt-6 p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    {result.success ? (
                      <>
                        <h3 className="font-semibold text-green-400 mb-2">
                          Import réussi !
                        </h3>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>✅ Chaînes importées : {result.imported || 0}</p>
                          <p>🔄 Chaînes mises à jour : {result.updated || 0}</p>
                          {result.errors! > 0 && (
                            <p className="text-yellow-400">
                              ⚠️ Erreurs : {result.errors}
                            </p>
                          )}
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="mt-4"
                        >
                          <Link href="/channels">Voir les chaînes</Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-red-400 mb-2">
                          Erreur lors de l'import
                        </h3>
                        <p className="text-sm text-gray-300">{result.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Vérifiez que le service Ingest API est démarré (port 4000) et que
                          M3U_ENDPOINT est configuré.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Import Section */}
          <div className="bg-secondary-800/50 backdrop-blur-sm border border-primary-900/20 rounded-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-primary-500/10 p-3 rounded-lg">
                <Upload className="w-6 h-6 text-primary-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-primary-400 mb-2">
                  Import Manuel
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Importez une playlist M3U depuis une URL personnalisée
                </p>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const url = formData.get('url') as string;
                    handleManualImport(url);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                      URL de la playlist M3U
                    </label>
                    <input
                      id="url"
                      name="url"
                      type="url"
                      placeholder="http://example.com/playlist.m3u"
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={importing} className="w-full sm:w-auto">
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Import en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Importer depuis URL
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-2">ℹ️ Information</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• L'import peut prendre plusieurs minutes selon la taille de la playlist</li>
              <li>• Les chaînes existantes seront mises à jour automatiquement</li>
              <li>• Les catégories sont assignées automatiquement selon les groupes M3U</li>
              <li>• Les flux RTMP seront transcodés en HLS pour la lecture web</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
