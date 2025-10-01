import { checkRateLimit, cleanupRateLimit } from '@/lib/rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Nettoyer avant chaque test
    cleanupRateLimit();
  });

  describe('checkRateLimit', () => {
    it('devrait autoriser la première requête', () => {
      const result = checkRateLimit('test-ip-1', { maxRequests: 60, windowMs: 60000 });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(59);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('devrait décrémenter le compteur à chaque requête', () => {
      const ip = 'test-ip-2';
      const config = { maxRequests: 5, windowMs: 60000 };

      const result1 = checkRateLimit(ip, config);
      expect(result1.remaining).toBe(4);

      const result2 = checkRateLimit(ip, config);
      expect(result2.remaining).toBe(3);

      const result3 = checkRateLimit(ip, config);
      expect(result3.remaining).toBe(2);
    });

    it('devrait bloquer après avoir atteint la limite', () => {
      const ip = 'test-ip-3';
      const config = { maxRequests: 3, windowMs: 60000 };

      // 3 requêtes autorisées
      checkRateLimit(ip, config);
      checkRateLimit(ip, config);
      checkRateLimit(ip, config);

      // 4ème requête bloquée
      const result = checkRateLimit(ip, config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('devrait réinitialiser après expiration de la fenêtre', () => {
      const ip = 'test-ip-4';
      const config = { maxRequests: 2, windowMs: 100 }; // 100ms window

      // Première requête
      const result1 = checkRateLimit(ip, config);
      expect(result1.allowed).toBe(true);

      // Deuxième requête
      const result2 = checkRateLimit(ip, config);
      expect(result2.allowed).toBe(true);

      // Troisième requête bloquée
      const result3 = checkRateLimit(ip, config);
      expect(result3.allowed).toBe(false);

      // Attendre l'expiration
      return new Promise(resolve => {
        setTimeout(() => {
          // Requête autorisée après expiration
          const result4 = checkRateLimit(ip, config);
          expect(result4.allowed).toBe(true);
          expect(result4.remaining).toBe(1);
          resolve(true);
        }, 150);
      });
    });

    it('devrait gérer plusieurs IPs indépendamment', () => {
      const config = { maxRequests: 2, windowMs: 60000 };

      const result1 = checkRateLimit('ip-1', config);
      const result2 = checkRateLimit('ip-2', config);

      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(1);

      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);
    });

    it('devrait utiliser la configuration par défaut', () => {
      const result = checkRateLimit('test-ip-5');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(59); // default maxRequests = 60
    });
  });

  describe('cleanupRateLimit', () => {
    it('devrait supprimer les entrées expirées', () => {
      const ip = 'test-ip-6';
      const config = { maxRequests: 5, windowMs: 50 };

      // Créer une entrée
      checkRateLimit(ip, config);

      // Attendre l'expiration
      return new Promise(resolve => {
        setTimeout(() => {
          cleanupRateLimit();

          // Nouvelle requête devrait avoir le compteur réinitialisé
          const result = checkRateLimit(ip, config);
          expect(result.remaining).toBe(4);
          resolve(true);
        }, 100);
      });
    });
  });

  describe('Edge cases', () => {
    it('devrait gérer maxRequests = 1', () => {
      const ip = 'test-ip-7';
      const config = { maxRequests: 1, windowMs: 60000 };

      const result1 = checkRateLimit(ip, config);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(0);

      const result2 = checkRateLimit(ip, config);
      expect(result2.allowed).toBe(false);
    });

    it('devrait gérer des fenêtres très courtes', () => {
      const ip = 'test-ip-8';
      const config = { maxRequests: 10, windowMs: 10 };

      const result = checkRateLimit(ip, config);
      expect(result.allowed).toBe(true);
      expect(result.resetTime).toBeGreaterThan(Date.now());
      expect(result.resetTime).toBeLessThan(Date.now() + 20);
    });

    it('devrait gérer des IPs avec caractères spéciaux', () => {
      const ips = [
        '192.168.1.1',
        '::1',
        '2001:0db8:85a3::8a2e:0370:7334',
        'unknown',
        'localhost',
      ];

      ips.forEach(ip => {
        const result = checkRateLimit(ip, { maxRequests: 5, windowMs: 60000 });
        expect(result.allowed).toBe(true);
      });
    });
  });

  describe('Performance', () => {
    it('devrait gérer un grand nombre de requêtes rapidement', () => {
      const start = Date.now();
      const config = { maxRequests: 1000, windowMs: 60000 };

      for (let i = 0; i < 1000; i++) {
        checkRateLimit(`ip-${i}`, config);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Moins de 1 seconde
    });
  });
});
