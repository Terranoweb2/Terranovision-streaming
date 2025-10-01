/**
 * Génère une URL proxifiée pour les images
 * Évite les problèmes CORS et Mixed Content
 */
export function getProxiedImageUrl(originalUrl?: string): string | undefined {
  if (!originalUrl) return undefined;

  // Si c'est déjà une URL HTTPS sécurisée (Cloudinary, etc.), la retourner directement
  if (originalUrl.startsWith('https://res.cloudinary.com') ||
      originalUrl.startsWith('https://cdn.')) {
    return originalUrl;
  }

  // Sinon, passer par le proxy
  return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
}
