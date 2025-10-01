const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const M3U_URL = 'http://line.l-ion.xyz/get.php?username=CanaL-IPTV&password=63KQ5913&type=m3u&output=rtmp';
const OUTPUT_FILE = path.join(__dirname, '..', 'playlist.m3u');

const USER_AGENTS = [
  'VLC/3.0.16 LibVLC/3.0.16',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
  'IPTV Smarters/1.0',
  'GSE SMART IPTV/7.5',
];

function httpGet(url, headers, attempt = 0) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const userAgent = USER_AGENTS[attempt % USER_AGENTS.length];

    console.log(`🔄 Tentative ${attempt + 1}/${USER_AGENTS.length} avec User-Agent: ${userAgent}`);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        ...headers,
      },
      timeout: 60000,
    };

    const req = http.request(options, (res) => {
      console.log(`📡 Status: ${res.statusCode} ${res.statusMessage}`);

      if (res.statusCode === 884 || (res.statusCode >= 400 && res.statusCode < 600)) {
        if (attempt < USER_AGENTS.length - 1) {
          console.log(`⚠️  Erreur ${res.statusCode}, nouvelle tentative...\n`);
          setTimeout(() => {
            httpGet(url, headers, attempt + 1).then(resolve).catch(reject);
          }, 1000 * (attempt + 1)); // Délai croissant
          return;
        }
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      let data = '';
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', (error) => {
      if (attempt < USER_AGENTS.length - 1) {
        console.log(`⚠️  Erreur réseau: ${error.message}, nouvelle tentative...\n`);
        setTimeout(() => {
          httpGet(url, headers, attempt + 1).then(resolve).catch(reject);
        }, 1000 * (attempt + 1));
        return;
      }
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function downloadM3U() {
  console.log('📥 Téléchargement de la playlist M3U...');
  console.log('URL:', M3U_URL);
  console.log('');

  try {
    const response = await httpGet(M3U_URL, {});

    if (!response.data || response.data.length === 0) {
      throw new Error('Fichier vide reçu');
    }

    fs.writeFileSync(OUTPUT_FILE, response.data, 'utf8');
    console.log('\n✅ Playlist téléchargée avec succès!');
    console.log('📁 Fichier sauvegardé:', OUTPUT_FILE);
    console.log('📊 Taille:', (response.data.length / 1024).toFixed(2), 'KB');

    // Parse channels count
    const lines = response.data.split('\n');
    const channelCount = lines.filter(line => line.trim().startsWith('#EXTINF:')).length;
    console.log('📺 Nombre de chaînes:', channelCount);

    return OUTPUT_FILE;
  } catch (error) {
    console.error('\n❌ Erreur lors du téléchargement:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('Le serveur a refusé la connexion.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Le délai de connexion a expiré.');
    }

    throw error;
  }
}

async function importToAPI() {
  console.log('\n📤 Import vers l\'API...');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/ingest/import/auto',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0,
      },
      timeout: 120000,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 400) {
          console.error('❌ Erreur lors de l\'import:', res.statusCode);
          console.error('Détails:', data);
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        console.log('✅ Import réussi!');
        console.log('Résultat:', data);
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erreur lors de l\'import:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      const filePath = await downloadM3U();

      // Ask user if they want to import
      console.log('\n🤔 Voulez-vous importer vers l\'API? (Le fichier est sauvegardé dans:', filePath, ')');
      console.log('Vous pouvez maintenant utiliser la commande: curl -X POST http://localhost:4000/ingest/import/auto');

    } catch (error) {
      console.error('\n💥 Échec:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { downloadM3U, importToAPI };
