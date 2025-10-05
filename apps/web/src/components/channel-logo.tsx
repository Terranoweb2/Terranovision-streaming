'use client';

import { useState } from 'react';
import { getProxiedImageUrl } from '@/lib/image-proxy';

interface ChannelLogoProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: string;
  iconSize?: string;
}

/**
 * Composant optimisé pour afficher les logos de chaînes
 * Gère automatiquement les erreurs de chargement avec un fallback
 */
export function ChannelLogo({
  src,
  alt,
  className = '',
  fallbackIcon = '📺',
  iconSize = 'text-4xl',
}: ChannelLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const proxiedUrl = getProxiedImageUrl(src);

  // Si pas d'URL ou erreur de chargement, afficher le fallback
  if (!proxiedUrl || imageError) {
    return (
      <div className={`flex items-center justify-center bg-secondary-700 ${className}`}>
        <span className={`${iconSize} text-gray-500`}>{fallbackIcon}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary-700 animate-pulse">
          <span className={`${iconSize} text-gray-600`}>⏳</span>
        </div>
      )}
      <img
        src={proxiedUrl}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
}

