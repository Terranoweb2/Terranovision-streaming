'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import type { XtreamChannel } from '@/lib/xtream';
import { getProxiedImageUrl } from '@/lib/image-proxy';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface TVChannelGridProps {
  channels: XtreamChannel[];
  columns?: number;
  onChannelSelect?: (channel: XtreamChannel) => void;
}

export function TVChannelGrid({ channels, columns, onChannelSelect }: TVChannelGridProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const deviceInfo = useDeviceDetection();

  // Calculer le nombre de colonnes selon l'appareil
  const gridColumns = columns || (
    deviceInfo.isTV ? 8 :
    deviceInfo.isTablet ? 6 :
    deviceInfo.isMobile ? 3 :
    6
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!deviceInfo.isTV && !deviceInfo.isDesktop) return;

      let newIndex = focusedIndex;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newIndex = Math.max(0, focusedIndex - gridColumns);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newIndex = Math.min(channels.length - 1, focusedIndex + gridColumns);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (focusedIndex % gridColumns !== 0) {
            newIndex = focusedIndex - 1;
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if ((focusedIndex + 1) % gridColumns !== 0 && focusedIndex < channels.length - 1) {
            newIndex = focusedIndex + 1;
          }
          break;
        case 'Enter':
          e.preventDefault();
          const element = itemsRef.current[focusedIndex];
          if (element) {
            element.click();
            if (onChannelSelect) {
              onChannelSelect(channels[focusedIndex]);
            }
          }
          return;
      }

      if (newIndex !== focusedIndex) {
        setFocusedIndex(newIndex);
        const element = itemsRef.current[newIndex];
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, channels, gridColumns, deviceInfo, onChannelSelect]);

  // Auto-focus au montage sur TV
  useEffect(() => {
    if (deviceInfo.isTV && itemsRef.current[0]) {
      itemsRef.current[0].focus();
    }
  }, [deviceInfo.isTV]);

  const gridClass = `grid gap-2 ${
    deviceInfo.isTV
      ? 'grid-cols-8 gap-4'
      : deviceInfo.isTablet
      ? 'grid-cols-6 gap-3'
      : deviceInfo.isMobile
      ? 'grid-cols-3 gap-2'
      : 'grid-cols-6 md:grid-cols-8 gap-3'
  }`;

  return (
    <div className={gridClass}>
      {channels.map((channel, index) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          index={index}
          isFocused={index === focusedIndex}
          ref={(el) => { itemsRef.current[index] = el; }}
          isTV={deviceInfo.isTV}
          isMobile={deviceInfo.isMobile}
        />
      ))}
    </div>
  );
}

interface ChannelCardProps {
  channel: XtreamChannel;
  index: number;
  isFocused: boolean;
  isTV: boolean;
  isMobile: boolean;
}

const ChannelCard = React.forwardRef<HTMLAnchorElement, ChannelCardProps>(
  ({ channel, index, isFocused, isTV, isMobile }, ref) => {
    const logoUrl = channel.logo
      ? getProxiedImageUrl(channel.logo)
      : '/placeholder-channel.png';

    return (
      <Link
        ref={ref}
        href={`/watch/${channel.id}`}
        tabIndex={0}
        className={`
          relative aspect-square rounded-lg overflow-hidden
          transition-all duration-200 ease-out
          focus:outline-none
          ${isFocused && isTV
            ? 'ring-4 ring-primary-500 scale-110 z-10 shadow-2xl shadow-primary-500/50'
            : 'hover:scale-105 hover:shadow-xl'
          }
          ${isTV ? 'p-4' : isMobile ? 'p-2' : 'p-3'}
          bg-secondary-800/50 backdrop-blur-sm border border-primary-900/20
          hover:border-primary-500/50
        `}
        aria-label={`Regarder ${channel.name}`}
      >
        {/* Logo */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={logoUrl}
            alt={channel.name}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-channel.png';
            }}
          />

          {/* Overlay avec nom (visible au focus/hover) */}
          <div
            className={`
              absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent
              flex items-end justify-center p-2
              transition-opacity duration-200
              ${isFocused || isTV ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}
          >
            <p
              className={`
                text-white text-center font-medium line-clamp-2
                ${isTV ? 'text-lg' : isMobile ? 'text-xs' : 'text-sm'}
              `}
            >
              {channel.name}
            </p>
          </div>
        </div>

        {/* Badge HD/4K */}
        {(channel.quality === 'HD' || channel.quality === '4K') && (
          <div className="absolute top-2 right-2">
            <span
              className={`
                bg-primary-600 text-white font-bold rounded px-2 py-1
                ${isTV ? 'text-base' : 'text-xs'}
              `}
            >
              {channel.quality}
            </span>
          </div>
        )}
      </Link>
    );
  }
);

ChannelCard.displayName = 'ChannelCard';

// Import React for forwardRef
import * as React from 'react';
