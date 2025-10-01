import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TerranoVision - Streaming TV',
  description:
    'Application de streaming TV multi-plateforme avec support IPTV, EPG et contrôle parental',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TerranoVision',
  },
  icons: {
    icon: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1736099542/TERRANOVISION_LOGO_copie_plw60b.png',
    apple: 'https://res.cloudinary.com/dxy0fiahv/image/upload/v1736099542/TERRANOVISION_LOGO_copie_plw60b.png',
  },
};

export const viewport = {
  themeColor: '#0B1E3A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
