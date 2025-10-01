import { Button } from '@/components/ui/button';
import { Tv } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-500 p-4 rounded-full">
              <Tv className="w-12 h-12 text-secondary-900" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary-500 mb-2">TerranoVision</h1>
          <p className="text-gray-400">Connectez-vous pour continuer</p>
        </div>

        <div className="bg-secondary-800 rounded-2xl p-8 border border-primary-900/20">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Envoyer le lien magique
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Pas de compte ?{' '}
              <Link href="/auth/signup" className="text-primary-500 hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Un lien de connexion sera envoyé à votre adresse email
          </div>
        </div>
      </div>
    </div>
  );
}
