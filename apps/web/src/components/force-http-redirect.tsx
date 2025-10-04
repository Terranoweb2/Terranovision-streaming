'use client';

import { useEffect } from 'react';

/**
 * Force HTTP redirect to avoid Mixed Content blocking
 * The Xtream server only works with HTTP streams
 */
export function ForceHttpRedirect() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      // Redirect to HTTP version
      const httpUrl = window.location.href.replace('https://', 'http://');
      console.log('[ForceHttpRedirect] Redirecting to HTTP:', httpUrl);
      window.location.replace(httpUrl);
    }
  }, []);

  return null;
}
