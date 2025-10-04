'use client';

import { useEffect } from 'react';

export function FullscreenHandler() {
  useEffect(() => {
    const handleFullscreenChange = async () => {
      // Vérifier si on est en mode plein écran
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      // Si on est en mode plein écran sur mobile
      if (isFullscreen && window.innerWidth < 768) {
        try {
          // Forcer l'orientation paysage
          const screenOrientation = screen.orientation as any;
          if (screenOrientation && typeof screenOrientation.lock === 'function') {
            await screenOrientation.lock('landscape').catch((err: any) => {
              console.log('Screen orientation lock not supported:', err);
            });
          }
        } catch (err) {
          console.log('Could not lock screen orientation:', err);
        }
      } else {
        // Sortie du plein écran - déverrouiller l'orientation
        try {
          const screenOrientation = screen.orientation as any;
          if (screenOrientation && typeof screenOrientation.unlock === 'function') {
            screenOrientation.unlock();
          }
        } catch (err) {
          console.log('Could not unlock screen orientation:', err);
        }
      }
    };

    // Écouter les changements de plein écran
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return null;
}
