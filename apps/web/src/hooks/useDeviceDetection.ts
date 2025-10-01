import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'tv';

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTV: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

/**
 * Hook personnalisé pour détecter le type d'appareil
 */
export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTV: false,
    isTouchDevice: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    orientation: 'landscape',
  });

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const orientation = width > height ? 'landscape' : 'portrait';

      // Détection TV Android
      const isTV =
        userAgent.includes('tv') ||
        userAgent.includes('googletv') ||
        userAgent.includes('android tv') ||
        userAgent.includes('web0s') ||
        userAgent.includes('netcast') ||
        userAgent.includes('smarttv') ||
        (width >= 1920 && height >= 1080 && !isTouchDevice);

      // Détection Mobile (< 768px)
      const isMobile = width < 768 && !isTV;

      // Détection Tablette (768px - 1024px)
      const isTablet = width >= 768 && width < 1024 && !isTV;

      // Détection Desktop
      const isDesktop = width >= 1024 && !isTV;

      // Type d'appareil
      let type: DeviceType = 'desktop';
      if (isTV) type = 'tv';
      else if (isMobile) type = 'mobile';
      else if (isTablet) type = 'tablet';

      setDeviceInfo({
        type,
        isMobile,
        isTablet,
        isDesktop,
        isTV,
        isTouchDevice,
        screenWidth: width,
        screenHeight: height,
        orientation,
      });

      // Log pour debug
      console.log('[Device Detection]', {
        type,
        width,
        height,
        userAgent: userAgent.substring(0, 100),
        isTouchDevice,
      });
    };

    // Détection initiale
    detectDevice();

    // Re-détecter au redimensionnement
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return deviceInfo;
}

/**
 * Hook pour obtenir les classes CSS adaptatives
 */
export function useResponsiveClasses() {
  const device = useDeviceDetection();

  return {
    container: device.isMobile
      ? 'container mx-auto'
      : device.isTablet
      ? 'container mx-auto'
      : device.isTV
      ? 'container mx-auto'
      : 'container mx-auto',

    padding: device.isMobile
      ? 'px-3 py-3'
      : device.isTablet
      ? 'px-4 py-4'
      : device.isTV
      ? 'px-8 py-6'
      : 'px-4 py-4',

    text: {
      small: device.isMobile ? 'text-xs' : device.isTV ? 'text-base' : 'text-sm',
      base: device.isMobile ? 'text-sm' : device.isTV ? 'text-xl' : 'text-base',
      title: device.isMobile ? 'text-lg' : device.isTV ? 'text-3xl' : 'text-xl',
      subtitle: device.isMobile ? 'text-base' : device.isTV ? 'text-2xl' : 'text-lg',
    },

    grid: device.isMobile
      ? 'grid grid-cols-6 sm:grid-cols-9 gap-1'
      : device.isTablet
      ? 'grid grid-cols-8 md:grid-cols-12 gap-1'
      : device.isTV
      ? 'grid grid-cols-16 lg:grid-cols-20 xl:grid-cols-24 gap-1'
      : 'grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 2xl:grid-cols-24 gap-1',

    button: device.isTV
      ? 'min-h-[60px] text-xl px-8'
      : device.isMobile
      ? 'min-h-[44px] text-sm px-4'
      : 'min-h-[48px] text-base px-6',
  };
}
