'use client';

import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { Button } from './ui/button';
import type { XtreamQualityVariant } from '@/lib/xtream';

interface QualitySelectorProps {
  variants: XtreamQualityVariant[];
  currentQuality: string;
  onQualityChange: (variant: XtreamQualityVariant) => void;
  className?: string;
}

const qualityLabels: Record<string, { label: string; icon: string }> = {
  'UHD/4K': { label: 'Ultra HD 4K', icon: '⚡' },
  'HDR': { label: 'HDR', icon: '✨' },
  'FHD': { label: 'Full HD', icon: '🔥' },
  'HD': { label: 'HD', icon: '📺' },
  'SD': { label: 'SD', icon: '📱' },
  'Auto': { label: 'Auto', icon: '🔄' },
};

export function QualitySelector({
  variants,
  currentQuality,
  onQualityChange,
  className = '',
}: QualitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!variants || variants.length <= 1) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Zap className="w-4 h-4 mr-2" />
        {qualityLabels[currentQuality]?.label || currentQuality}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden z-50 min-w-[200px]">
            <div className="p-2 border-b border-white/10">
              <p className="text-xs text-gray-400 font-medium px-2">Qualité vidéo</p>
            </div>

            <div className="p-1">
              {variants.map((variant) => {
                const info = qualityLabels[variant.quality] || { label: variant.quality, icon: '📺' };
                const isActive = variant.quality === currentQuality;

                return (
                  <button
                    key={variant.id}
                    onClick={() => {
                      onQualityChange(variant);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md
                      transition-colors text-left
                      ${isActive
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <span className="text-xl">{info.icon}</span>
                    <span className="flex-1 font-medium">{info.label}</span>
                    {isActive && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>

            <div className="p-2 border-t border-white/10">
              <p className="text-xs text-gray-500 px-2">
                {variants.length} qualité{variants.length > 1 ? 's' : ''} disponible{variants.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
