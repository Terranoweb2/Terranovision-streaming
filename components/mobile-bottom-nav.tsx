'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Tv, Heart, User } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/channels', icon: Tv, label: 'Chaînes' },
    { href: '/favorites', icon: Heart, label: 'Favoris' },
    { href: '/subscription', icon: User, label: 'Abonnement' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-gray-800 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'text-cyan-400 bg-cyan-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-cyan-400' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
