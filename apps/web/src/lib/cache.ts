/**
 * Simple in-memory cache pour réduire les appels à l'API Xtream
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 10 * 60 * 1000; // 10 minutes par défaut

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });

    // Nettoyage automatique après expiration
    setTimeout(() => {
      this.delete(key);
    }, ttl || this.defaultTTL);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Vérifier si le cache a expiré
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Vérifier si le cache a expiré
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  /**
   * Retourne les stats du cache
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    this.cache.forEach((entry) => {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
    };
  }
}

// Instance singleton
export const cache = new MemoryCache();

/**
 * Helper pour wrapper une fonction avec cache
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Vérifier si la donnée est en cache
  const cached = cache.get<T>(key);
  if (cached !== null) {
    console.log(`[Cache] HIT for key: ${key}`);
    return cached;
  }

  console.log(`[Cache] MISS for key: ${key}`);

  // Exécuter la fonction et mettre en cache
  const data = await fn();
  cache.set(key, data, ttl);

  return data;
}
