'use client';

import { ArrowLeft, Home, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onBack?: () => void;
  transparent?: boolean;
}

export function MobileHeader({
  title,
  showBackButton = true,
  showHomeButton = true,
  onBack,
  transparent = false,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${
        transparent
          ? 'bg-gradient-to-b from-black/90 via-black/70 to-transparent'
          : 'bg-secondary-900 border-b border-primary-900/20'
      } backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between px-3 py-2 safe-area-top">
        {/* Left section */}
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white hover:bg-white/10 -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          {title && (
            <h1 className="text-white font-semibold text-base truncate max-w-[180px]">
              {title}
            </h1>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {showHomeButton && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:bg-white/10"
            >
              <Link href="/channels">
                <Home className="w-5 h-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Safe area padding for notched devices */}
      <style jsx>{`
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
      `}</style>
    </header>
  );
}
