import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img
              src="https://res.cloudinary.com/dxy0fiahv/image/upload/v1736099542/TERRANOVISION_LOGO_copie_plw60b.png"
              alt="TerranoVision"
              className="h-24 w-auto object-contain"
            />
          </div>
          <p className="text-gray-400">Créer votre compte</p>
        </div>

        <div className="bg-secondary-800 rounded-2xl p-8 border border-primary-900/20">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                placeholder="Votre nom"
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
              />
            </div>

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
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Déjà un compte ?{' '}
              <Link href="/auth/signin" className="text-primary-500 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Un lien de confirmation sera envoyé à votre adresse email
          </div>
        </div>
      </div>
    </div>
  );
}
