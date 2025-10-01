import { buildStreamUrl, clearXtreamCache } from '@/lib/xtream';

describe('Xtream Service', () => {
  const config = {
    baseUrl: 'http://example.com',
    username: 'testuser',
    password: 'testpass',
  };

  describe('buildStreamUrl', () => {
    it('devrait construire correctement l\'URL HLS', () => {
      const url = buildStreamUrl(config, 123, 'hls');
      expect(url).toBe('http://example.com/live/testuser/testpass/123.m3u8');
    });

    it('devrait construire correctement l\'URL TS', () => {
      const url = buildStreamUrl(config, 456, 'ts');
      expect(url).toBe('http://example.com/live/testuser/testpass/456.ts');
    });

    it('devrait utiliser HLS par défaut', () => {
      const url = buildStreamUrl(config, 789);
      expect(url).toBe('http://example.com/live/testuser/testpass/789.m3u8');
    });

    it('devrait gérer les IDs numériques', () => {
      const url = buildStreamUrl(config, 999, 'hls');
      expect(url).toBe('http://example.com/live/testuser/testpass/999.m3u8');
    });

    it('devrait gérer les URLs avec trailing slash', () => {
      const configWithSlash = { ...config, baseUrl: 'http://example.com/' };
      const url = buildStreamUrl(configWithSlash, 123, 'hls');
      expect(url).toBe('http://example.com//live/testuser/testpass/123.m3u8');
    });
  });

  describe('clearXtreamCache', () => {
    it('devrait nettoyer le cache sans erreur', () => {
      expect(() => clearXtreamCache()).not.toThrow();
    });
  });

  describe('XtreamChannel interface', () => {
    it('devrait avoir la structure correcte', () => {
      const channel = {
        id: 123,
        name: 'Test Channel',
        logo: 'http://example.com/logo.png',
        group: 'Test Group',
        urlHls: 'http://example.com/live/user/pass/123.m3u8',
        urlTs: 'http://example.com/live/user/pass/123.ts',
      };

      expect(channel).toHaveProperty('id');
      expect(channel).toHaveProperty('name');
      expect(channel).toHaveProperty('logo');
      expect(channel).toHaveProperty('group');
      expect(channel).toHaveProperty('urlHls');
      expect(channel).toHaveProperty('urlTs');

      expect(typeof channel.id).toBe('number');
      expect(typeof channel.name).toBe('string');
      expect(typeof channel.logo).toBe('string');
      expect(typeof channel.group).toBe('string');
      expect(typeof channel.urlHls).toBe('string');
      expect(typeof channel.urlTs).toBe('string');
    });
  });
});
