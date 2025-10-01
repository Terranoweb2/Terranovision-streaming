# 🔧 Guide de Dépannage - TerranoVision

## 🚨 Problèmes Courants et Solutions

### 1. Erreur "DATABASE_URL not found" (Service Ingest)

**Symptôme** :
```
PrismaClientInitializationError: error: Environment variable not found: DATABASE_URL
```

**Cause** : Le service NestJS ne trouve pas la variable d'environnement DATABASE_URL.

**Solutions** :

#### Solution A : Créer .env dans le service (Rapide)
```bash
cd services/ingest
echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/terranovision?schema=public" > .env
```

#### Solution B : Utiliser le script de démarrage
```bash
# Windows (PowerShell)
.\start.ps1

# Windows (Command Prompt)
start.bat
```

#### Solution C : Définir la variable manuellement (Windows)
```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/terranovision?schema=public"
pnpm run dev
```

---

### 2. Erreur "Port already in use" (4000, 4001, 3000)

**Symptôme** :
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Cause** : Des processus Node.js zombies occupent les ports.

**Solutions** :

#### Solution A : Tuer tous les processus Node.js
**Windows (PowerShell) :**
```powershell
taskkill /F /IM node.exe
```

**Windows (Gestionnaire des tâches) :**
1. Ctrl + Shift + Esc
2. Onglet "Détails"
3. Chercher tous les `node.exe`
4. Clic droit > "Fin de tâche"

#### Solution B : Trouver et tuer un port spécifique
**Windows :**
```powershell
# Trouver le PID qui utilise le port 4000
netstat -ano | findstr :4000

# Tuer le processus (remplacer PID)
taskkill /F /PID <PID>
```

#### Solution C : Redémarrer l'ordinateur
Le plus simple pour nettoyer tous les processus zombies.

---

### 3. Erreur "Failed to proxy" (500) lors de l'import M3U

**Symptôme** :
```
Failed to proxy http://localhost:4000/ingest/import
Erreur HTTP: 500
```

**Cause** : Le service Ingest API (port 4000) n'est pas démarré.

**Solutions** :
1. Vérifier que le service Ingest démarre correctement dans les logs
2. Résoudre l'erreur DATABASE_URL (voir problème #1)
3. Vérifier que PostgreSQL est accessible

**Test** :
```bash
# Vérifier si le port 4000 répond
curl http://localhost:4000/health
```

---

### 4. PostgreSQL "Connection refused"

**Symptôme** :
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Cause** : PostgreSQL n'est pas démarré.

**Solutions** :

#### Si vous utilisez Docker :
```bash
# Vérifier les containers PostgreSQL
docker ps | findstr postgres

# Démarrer un nouveau PostgreSQL
docker run --name terranovision-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16-alpine
```

#### Si PostgreSQL local :
- Vérifier que le service PostgreSQL est démarré
- Windows : Services > PostgreSQL
- Vérifier la connexion :
  ```bash
  psql -h localhost -U postgres -d terranovision
  ```

---

### 5. "Module not found" ou erreurs TypeScript

**Symptôme** :
```
Cannot find module '@nestjs/config'
TS2307: Cannot find module
```

**Cause** : Dépendances manquantes ou node_modules corrompus.

**Solutions** :

#### Solution A : Réinstaller les dépendances
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
pnpm install
```

#### Solution B : Régénérer Prisma Client
```bash
cd packages/database
pnpm run generate
```

#### Solution C : Nettoyer le cache
```bash
# Nettoyer le cache Turbo et pnpm
pnpm run clean
rm -rf .turbo
pnpm install --force
```

---

### 6. Page blanche ou erreurs React

**Symptôme** : Page blanche dans le navigateur, erreurs dans la console

**Solutions** :

1. **Vider le cache du navigateur** : Ctrl + Shift + R
2. **Vérifier les logs du terminal** pour les erreurs de compilation
3. **Redémarrer Next.js** : Tuer le processus et relancer `pnpm run dev`

---

### 7. FFmpeg introuvable (Stream Gateway)

**Symptôme** :
```
Error: spawn ffmpeg ENOENT
```

**Cause** : FFmpeg n'est pas installé ou pas dans le PATH.

**Solutions** :

#### Windows :
```powershell
# Via Chocolatey
choco install ffmpeg

# Ou télécharger depuis https://ffmpeg.org
# Extraire et ajouter bin/ au PATH
```

#### Configurer le chemin dans .env :
```bash
FFMPEG_PATH="C:/ffmpeg/bin/ffmpeg.exe"
```

#### Vérifier l'installation :
```bash
ffmpeg -version
```

---

### 8. Docker Desktop ne démarre pas

**Symptôme** : Erreurs Docker, containers inaccessibles

**Solutions** :

1. **Vérifier que Docker Desktop est lancé**
   - Icône Docker dans la barre des tâches
   - Doit être en "Engine running"

2. **Redémarrer Docker Desktop**
   - Clic droit sur l'icône Docker
   - "Restart"

3. **Vérifier WSL 2** (Windows)
   ```powershell
   wsl --list --verbose
   wsl --update
   ```

---

## 🔍 Commandes de Diagnostic

### Vérifier l'état des services

```bash
# Voir tous les processus Node.js
tasklist | findstr node

# Voir les ports utilisés
netstat -ano | findstr "3000 4000 4001"

# Voir les containers Docker
docker ps

# Tester les services
curl http://localhost:3000      # Web
curl http://localhost:4000/health # Ingest
curl http://localhost:4001/health # Gateway
```

### Voir les logs

```bash
# Les logs sont affichés dans le terminal où vous avez lancé pnpm run dev

# Pour filtrer les logs d'un service spécifique :
# Chercher les lignes commençant par :
# @terranovision/web:dev:
# @terranovision/ingest:dev:
# @terranovision/stream-gateway:dev:
```

---

## 🚀 Redémarrage Complet (Reset)

Si rien ne fonctionne, suivez ces étapes :

```bash
# 1. Arrêter tous les services
# Ctrl + C dans tous les terminaux

# 2. Tuer tous les processus Node.js
taskkill /F /IM node.exe

# 3. Nettoyer les builds et caches
cd "d:\les coder\Claud Streaming"
pnpm run clean
rm -rf .turbo .next dist

# 4. Réinstaller les dépendances
pnpm install --force

# 5. Régénérer Prisma
cd packages/database
pnpm run generate
cd ../..

# 6. Recréer les tables DB
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/terranovision?schema=public"
cd packages/database
pnpm run push
cd ../..

# 7. Relancer
pnpm run dev
```

---

## 📞 Besoin d'Aide Supplémentaire ?

1. **Vérifier les logs** : Tous les services affichent des logs détaillés
2. **STATUS.md** : Consulter le fichier pour l'état actuel
3. **GitHub Issues** : https://github.com/your-org/terranovision/issues
4. **Documentation** : Voir README.md et QUICKSTART.md

---

**Conseil** : En cas de doute, un redémarrage de l'ordinateur résout 90% des problèmes de ports/processus zombies ! 🔄
