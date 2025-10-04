#!/bin/bash

# ============================================
# Script de déploiement TerranoVision sur VPS
# ============================================

set -e  # Exit on error

echo "🚀 Déploiement TerranoVision sur VPS"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.vps exists
if [ ! -f ".env.vps" ]; then
    echo -e "${RED}❌ Fichier .env.vps introuvable!${NC}"
    echo "Copiez .env.vps.example vers .env.vps et configurez-le."
    exit 1
fi

# Load environment variables
source .env.vps

echo -e "${GREEN}✓${NC} Variables d'environnement chargées"

# 1. Install dependencies
echo ""
echo "📦 Installation des dépendances..."
pnpm install

# 2. Generate Prisma client
echo ""
echo "🔧 Génération du client Prisma..."
pnpm --filter @terranovision/database generate

# 3. Run database migrations
echo ""
echo "🗄️  Exécution des migrations..."
pnpm --filter @terranovision/database deploy

# 4. Build packages
echo ""
echo "📦 Build des packages..."
pnpm --filter @terranovision/database build
pnpm --filter @terranovision/ui build

# 5. Build services
echo ""
echo "⚙️  Build du Stream Gateway..."
pnpm --filter @terranovision/stream-gateway build

# 6. Build web app
echo ""
echo "🌐 Build de l'application web..."
pnpm --filter @terranovision/web build

# 7. Stop existing PM2 processes
echo ""
echo "🛑 Arrêt des processus existants..."
pm2 delete all || true

# 8. Start services with PM2
echo ""
echo "▶️  Démarrage des services..."
pm2 start ecosystem.config.js

# 9. Save PM2 configuration
echo ""
echo "💾 Sauvegarde de la configuration PM2..."
pm2 save

# 10. Setup PM2 startup
echo ""
echo "🔄 Configuration du démarrage automatique..."
pm2 startup || echo -e "${YELLOW}⚠️  Exécutez manuellement la commande pm2 startup affichée ci-dessus${NC}"

echo ""
echo -e "${GREEN}✅ Déploiement terminé avec succès!${NC}"
echo ""
echo "📊 Commandes utiles:"
echo "  - pm2 status          : Voir le statut des services"
echo "  - pm2 logs            : Voir les logs"
echo "  - pm2 monit           : Monitoring en temps réel"
echo "  - pm2 restart all     : Redémarrer tous les services"
echo ""
echo "🌐 Votre application devrait être accessible sur:"
echo "   http://localhost:3000"
echo ""
