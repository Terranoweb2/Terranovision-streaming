/**
 * Génère une URL proxifiée pour les images
 * Utilise le cache serveur pour éviter erreurs 509 bandwidth
 */
export function getProxiedImageUrl(originalUrl?: string): string | undefined {
  if (!originalUrl) return undefined;

  // Si c'est déjà une URL HTTPS sécurisée (Cloudinary, etc.), la retourner directement
  if (originalUrl.startsWith('https://res.cloudinary.com') ||
      originalUrl.startsWith('https://cdn.')) {
    return originalUrl;
  }

  // Utiliser le cache serveur au lieu du proxy Next.js API
  // Cache 24h côté serveur = 95% réduction bande passante
  return `http://terranovision.cloud/logo-proxy?url=${encodeURIComponent(originalUrl)}`;
}
