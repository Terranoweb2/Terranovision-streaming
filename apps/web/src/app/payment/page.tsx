'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Smartphone, CreditCard, Check } from 'lucide-react';

type PaymentMethod = 'wave' | 'momo' | 'orange' | 'moov';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'monthly';
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('wave');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  const amount = plan === 'monthly' ? 2000 : 20000;
  const period = plan === 'monthly' ? 'Mensuel' : 'Annuel';

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // TODO: Implement payment processing with Wave/Mobile Money API
    setTimeout(() => {
      setProcessing(false);
      alert('Paiement en cours de traitement...');
    }, 2000);
  };

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
              <Link href="/pricing">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Payment Form */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Finaliser le paiement</h1>
          <p className="text-gray-400 text-center mb-8">
            Abonnement {period} - {amount.toLocaleString()} XOF
          </p>

          <div className="bg-secondary-800 rounded-2xl p-8 border border-primary-900/20 mb-6">
            <h2 className="text-xl font-bold text-white mb-6">Choisissez votre méthode de paiement</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <PaymentMethodButton
                method="wave"
                label="Wave"
                logo="https://res.cloudinary.com/dxy0fiahv/image/upload/v1759315536/wave_logo_ltbfal.png"
                selected={selectedMethod === 'wave'}
                onClick={() => setSelectedMethod('wave')}
              />
              <PaymentMethodButton
                method="momo"
                label="MTN MOMO"
                icon="💳"
                selected={selectedMethod === 'momo'}
                onClick={() => setSelectedMethod('momo')}
              />
              <PaymentMethodButton
                method="orange"
                label="Orange Money"
                icon="🟠"
                selected={selectedMethod === 'orange'}
                onClick={() => setSelectedMethod('orange')}
              />
              <PaymentMethodButton
                method="moov"
                label="Moov Money"
                icon="🔵"
                selected={selectedMethod === 'moov'}
                onClick={() => setSelectedMethod('moov')}
              />
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+225 XX XX XX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Entrez le numéro associé à votre compte {getMethodName(selectedMethod)}
                </p>
              </div>

              {/* Summary */}
              <div className="bg-secondary-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Plan {period}</span>
                  <span>{amount.toLocaleString()} XOF</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Frais de traitement</span>
                  <span>0 XOF</span>
                </div>
                <div className="border-t border-secondary-600 pt-3 flex justify-between text-white font-bold text-lg">
                  <span>Total à payer</span>
                  <span>{amount.toLocaleString()} XOF</span>
                </div>
              </div>

              {/* QR Code Section */}
              {selectedMethod === 'wave' && (
                <div className="bg-white rounded-lg p-6 text-center">
                  <p className="text-secondary-900 font-semibold mb-4">
                    Ou scannez ce QR code avec l'app Wave
                  </p>
                  <div className="flex justify-center mb-4">
                    <img
                      src="https://res.cloudinary.com/dxy0fiahv/image/upload/v1759314597/WAVE_wnsyxu.jpg"
                      alt="QR Code Wave"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Montant: {amount.toLocaleString()} XOF
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={processing || !phoneNumber}
              >
                {processing ? 'Traitement en cours...' : `Payer ${amount.toLocaleString()} XOF`}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Vous recevrez une notification de paiement sur votre téléphone.
                Validez le paiement pour activer votre abonnement.
              </p>
            </form>
          </div>

          {/* Security Notice */}
          <div className="bg-secondary-800/50 rounded-lg p-4 border border-primary-900/10">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-400">
                <p className="font-semibold text-white mb-1">Paiement 100% sécurisé</p>
                <p>
                  Vos informations de paiement sont cryptées et sécurisées. Nous n'avons jamais accès
                  à vos données bancaires.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodButton({
  method,
  label,
  icon,
  logo,
  selected,
  onClick,
}: {
  method: PaymentMethod;
  label: string;
  icon?: string;
  logo?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 transition-all ${
        selected
          ? 'border-primary-500 bg-primary-500/10'
          : 'border-secondary-600 bg-secondary-700 hover:border-primary-500/50'
      }`}
    >
      {selected && (
        <Check className="absolute top-2 right-2 w-4 h-4 text-primary-500" />
      )}
      {logo ? (
        <div className="h-12 mb-2 flex items-center justify-center">
          <img src={logo} alt={label} className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <div className="text-3xl mb-2">{icon}</div>
      )}
      <div className="text-xs text-white font-medium">{label}</div>
    </button>
  );
}

function getMethodName(method: PaymentMethod): string {
  switch (method) {
    case 'wave':
      return 'Wave';
    case 'momo':
      return 'MTN Mobile Money';
    case 'orange':
      return 'Orange Money';
    case 'moov':
      return 'Moov Money';
    default:
      return 'Mobile Money';
  }
}
