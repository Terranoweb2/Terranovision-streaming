# 🔌 Exemples d'utilisation de l'API Xtream

## 📡 Endpoints disponibles

### 1. GET /api/xtream/list

Récupère la liste complète des chaînes disponibles.

#### Requête

```bash
curl http://localhost:3000/api/xtream/list
```

#### Réponse (200 OK)

```json
{
  "channels": [
    {
      "id": 1,
      "name": "TF1 HD",
      "logo": "http://example.com/logos/tf1.png",
      "group": "France",
      "urlHls": "http://line.l-ion.xyz/live/CanaL-IPTV/63KQ5913/1.m3u8",
      "urlTs": "http://line.l-ion.xyz/live/CanaL-IPTV/63KQ5913/1.ts"
    },
    {
      "id": 2,
      "name": "France 2 HD",
      "logo": "http://example.com/logos/france2.png",
      "group": "France",
      "urlHls": "http://line.l-ion.xyz/live/CanaL-IPTV/63KQ5913/2.m3u8",
      "urlTs": "http://line.l-ion.xyz/live/CanaL-IPTV/63KQ5913/2.ts"
    }
  ],
  "count": 1500
}
```

#### Headers de réponse

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, s-maxage=600, stale-while-revalidate=300
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1706624400000
```

#### Erreur : Rate limit dépassé (429)

```bash
curl http://localhost:3000/api/xtream/list
```

```json
{
  "error": "Rate limit exceeded",
  "message": "Trop de requêtes. Veuillez réessayer dans quelques instants.",
  "resetTime": "2025-01-30T15:30:00.000Z"
}
```

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706624400000
```

#### Erreur : Credentials manquantes (500)

```json
{
  "error": "Configuration error",
  "message": "Credentials Xtream manquantes"
}
```

---

### 2. GET /api/xtream/epg

Récupère l'EPG (guide des programmes) pour une chaîne spécifique.

#### Requête avec channelId

```bash
curl "http://localhost:3000/api/xtream/epg?channelId=123"
```

#### Réponse (200 OK)

```json
{
  "epg": {
    "epg_listings": [
      {
        "id": "456",
        "epg_id": "789",
        "title": "Journal de 20h",
        "lang": "fr",
        "start": "2025-01-30 20:00:00",
        "end": "2025-01-30 20:45:00",
        "description": "Actualités nationales et internationales",
        "channel_id": "123",
        "start_timestamp": 1706634000,
        "stop_timestamp": 1706636700,
        "has_archive": 1
      },
      {
        "id": "457",
        "title": "Météo",
        "start": "2025-01-30 20:45:00",
        "end": "2025-01-30 20:50:00",
        "description": "Prévisions météorologiques"
      }
    ]
  }
}
```

#### Erreur : channelId manquant (400)

```bash
curl http://localhost:3000/api/xtream/epg
```

```json
{
  "error": "Missing channelId parameter"
}
```

```http
HTTP/1.1 400 Bad Request
```

#### Erreur : channelId invalide (400)

```bash
curl "http://localhost:3000/api/xtream/epg?channelId=invalid"
```

```json
{
  "error": "Invalid channelId format"
}
```

---

## 🧪 Tests avec différents outils

### cURL

```bash
# Liste des chaînes
curl -v http://localhost:3000/api/xtream/list

# EPG d'une chaîne
curl "http://localhost:3000/api/xtream/epg?channelId=123"

# Avec headers
curl -H "Accept: application/json" \
     -H "User-Agent: Mozilla/5.0" \
     http://localhost:3000/api/xtream/list

# Tester le rate limiting (100 requêtes)
for i in {1..100}; do
  curl -s http://localhost:3000/api/xtream/list | head -1
done
```

### HTTPie

```bash
# Installer HTTPie
pip install httpie

# Liste des chaînes
http GET http://localhost:3000/api/xtream/list

# EPG
http GET http://localhost:3000/api/xtream/epg channelId==123

# Avec headers personnalisés
http GET http://localhost:3000/api/xtream/list \
  User-Agent:"Custom Client" \
  Accept:"application/json"
```

### JavaScript (fetch)

```javascript
// Liste des chaînes
fetch('http://localhost:3000/api/xtream/list')
  .then(res => res.json())
  .then(data => {
    console.log(`${data.count} chaînes disponibles`);
    console.log(data.channels);
  })
  .catch(err => console.error(err));

// EPG
fetch('http://localhost:3000/api/xtream/epg?channelId=123')
  .then(res => res.json())
  .then(data => console.log(data.epg))
  .catch(err => console.error(err));

// Avec gestion d'erreur complète
async function getChannels() {
  try {
    const response = await fetch('/api/xtream/list');

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Rate limit dépassé. Réessayez dans ${retryAfter}s`);
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.channels;
  } catch (error) {
    console.error('Erreur:', error.message);
    throw error;
  }
}
```

### Python

```python
import requests

# Liste des chaînes
response = requests.get('http://localhost:3000/api/xtream/list')
data = response.json()
print(f"{data['count']} chaînes disponibles")

for channel in data['channels'][:5]:
    print(f"{channel['id']} - {channel['name']}")

# EPG
response = requests.get(
    'http://localhost:3000/api/xtream/epg',
    params={'channelId': 123}
)
epg = response.json()
print(epg['epg'])

# Vérifier les headers de rate limit
response = requests.get('http://localhost:3000/api/xtream/list')
print(f"Requêtes restantes: {response.headers.get('X-RateLimit-Remaining')}")
print(f"Reset à: {response.headers.get('X-RateLimit-Reset')}")
```

---

## 🔍 Scénarios de test

### Test 1 : Récupération des chaînes (nominal)

```bash
# 1. Première requête (cache miss)
time curl -s http://localhost:3000/api/xtream/list > /dev/null
# Attendu : ~1-2s

# 2. Deuxième requête (cache hit)
time curl -s http://localhost:3000/api/xtream/list > /dev/null
# Attendu : ~50ms
```

### Test 2 : Rate limiting

```bash
# Envoyer 70 requêtes rapidement
for i in {1..70}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/xtream/list)
  echo "Requête $i: $STATUS"
done

# Attendu :
# Requêtes 1-60 : 200
# Requêtes 61-70 : 429
```

### Test 3 : Gestion d'erreur

```bash
# 1. Arrêter le serveur Xtream (simuler)
# (modifier temporairement XTREAM_BASE_URL pour pointer vers une URL invalide)

curl http://localhost:3000/api/xtream/list
# Attendu : 500 avec message d'erreur

# 2. Credentials invalides
# (modifier XTREAM_USERNAME/PASSWORD)

curl http://localhost:3000/api/xtream/list
# Attendu : 500 ou 503
```

### Test 4 : EPG

```bash
# 1. EPG valide
curl "http://localhost:3000/api/xtream/epg?channelId=123"
# Attendu : 200 avec données EPG

# 2. channelId manquant
curl http://localhost:3000/api/xtream/epg
# Attendu : 400

# 3. channelId invalide
curl "http://localhost:3000/api/xtream/epg?channelId=abc"
# Attendu : 400
```

---

## 📊 Monitoring et debugging

### Vérifier les headers

```bash
curl -I http://localhost:3000/api/xtream/list
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: public, s-maxage=600, stale-while-revalidate=300
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1706624400000
```

### Mesurer la performance

```bash
# Temps de réponse
time curl -s http://localhost:3000/api/xtream/list > /dev/null

# Avec détails
curl -w "\nTime: %{time_total}s\nStatus: %{http_code}\n" \
     -s http://localhost:3000/api/xtream/list > /dev/null
```

### Logs côté serveur

```bash
# Lancer le serveur avec logs
pnpm dev

# Observer les logs :
# [Xtream] Fetched 1500 channels
# [Xtream] Returning cached channels
# [API] Rate limit hit for IP 127.0.0.1
```

---

## 🎯 Cas d'usage réels

### Frontend React/Next.js

```typescript
// hooks/useChannels.ts
import { useState, useEffect } from 'react';
import type { XtreamChannel } from '@/lib/xtream';

export function useChannels() {
  const [channels, setChannels] = useState<XtreamChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/xtream/list')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setChannels(data.channels);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { channels, loading, error };
}
```

### Mobile (React Native)

```javascript
// services/xtream.js
const API_URL = 'https://terranovision.app';

export async function fetchChannels() {
  try {
    const response = await fetch(`${API_URL}/api/xtream/list`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    return data.channels;
  } catch (error) {
    console.error('Erreur fetch channels:', error);
    throw error;
  }
}

export async function fetchEPG(channelId) {
  const response = await fetch(`${API_URL}/api/xtream/epg?channelId=${channelId}`);
  const data = await response.json();
  return data.epg;
}
```

---

## 🔐 Sécurité

### ✅ Ce qui est safe

```javascript
// OK : Appeler l'API depuis le client
fetch('/api/xtream/list')

// OK : Utiliser les URLs de flux retournées
const stream = channel.urlHls;
```

### ❌ Ce qui ne doit JAMAIS être fait

```javascript
// ❌ NE JAMAIS exposer les credentials
const url = `http://line.l-ion.xyz/player_api.php?username=CanaL-IPTV&password=63KQ5913`;

// ❌ NE JAMAIS hardcoder les credentials
const BASE_URL = 'http://line.l-ion.xyz';
const USER = 'CanaL-IPTV';
const PASS = '63KQ5913';
```

---

## 📝 Notes

- Les URLs de flux (HLS/TS) contiennent les credentials, mais c'est normal pour Xtream
- Le cache côté serveur évite de surcharger l'API Xtream
- Le rate limiting protège votre serveur des abus
- Les retries gèrent automatiquement les erreurs temporaires (884, timeout, etc.)

---

**Documentation complète** : Voir [XTREAM_SETUP.md](./XTREAM_SETUP.md)
