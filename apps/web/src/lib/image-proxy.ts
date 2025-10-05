/**
 * Génère une URL proxifiée pour les images
 * Utilise une API route locale pour éviter les problèmes CORS
 */
export function getProxiedImageUrl(originalUrl?: string): string | undefined {
  if (!originalUrl) return undefined;

  // Nettoyer l'URL
  const cleanUrl = originalUrl.trim();

  // Si l'URL est vide après nettoyage
  if (!cleanUrl) return undefined;

  // Si c'est déjà une URL HTTPS sécurisée (Cloudinary, etc.), la retourner directement
  if (cleanUrl.startsWith('https://res.cloudinary.com') ||
      cleanUrl.startsWith('https://cdn.')) {
    return cleanUrl;
  }

  // Vérifier si l'URL est valide
  try {
    new URL(cleanUrl);
  } catch {
    // URL invalide, retourner undefined
    return undefined;
  }

  // Utiliser notre API route locale pour proxifier l'image
  return `/api/image-proxy?url=${encodeURIComponent(cleanUrl)}`;
}
