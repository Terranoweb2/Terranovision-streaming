#!/bin/bash

# ============================================
# Script de Déploiement du Fix des Logos
# TerranoVision - Mise à jour VPS
# ============================================

set -e

# Configuration
VPS_IP="148.230.104.203"
VPS_USER="root"
VPS_PATH="/var/www/terranovision"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Déploiement Fix Logos sur VPS${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Vérifier la connexion SSH
echo -e "${YELLOW}🔐 Test de connexion SSH...${NC}"
if ssh -o ConnectTimeout=5 ${VPS_USER}@${VPS_IP} "echo 'Connexion OK'" &> /dev/null; then
    echo -e "${GREEN}✓ Connexion SSH réussie${NC}"
else
    echo -e "${RED}✗ Impossible de se connecter au VPS${NC}"
    echo "Vérifiez:"
    echo "  - L'IP: ${VPS_IP}"
    echo "  - L'utilisateur: ${VPS_USER}"
    echo "  - Votre connexion internet"
    exit 1
fi

echo ""
echo -e "${YELLOW}📦 Fichiers à transférer:${NC}"
echo "  1. apps/web/src/app/api/image-proxy/route.ts (NOUVEAU)"
echo "  2. apps/web/src/lib/image-proxy.ts (MODIFIÉ)"
echo "  3. apps/web/src/components/channel-logo.tsx (NOUVEAU)"
echo ""

# Créer un répertoire temporaire pour les fichiers
TEMP_DIR=$(mktemp -d)
echo -e "${BLUE}📁 Préparation des fichiers...${NC}"

# Copier les fichiers modifiés
mkdir -p "${TEMP_DIR}/apps/web/src/app/api/image-proxy"
mkdir -p "${TEMP_DIR}/apps/web/src/lib"
mkdir -p "${TEMP_DIR}/apps/web/src/components"

cp "apps/web/src/app/api/image-proxy/route.ts" "${TEMP_DIR}/apps/web/src/app/api/image-proxy/" 2>/dev/null || echo "Fichier 1 non trouvé"
cp "apps/web/src/lib/image-proxy.ts" "${TEMP_DIR}/apps/web/src/lib/" 2>/dev/null || echo "Fichier 2 non trouvé"
cp "apps/web/src/components/channel-logo.tsx" "${TEMP_DIR}/apps/web/src/components/" 2>/dev/null || echo "Fichier 3 non trouvé"

echo -e "${GREEN}✓ Fichiers préparés${NC}"
echo ""

# Transférer les fichiers
echo -e "${BLUE}📤 Transfert des fichiers vers le VPS...${NC}"

# Créer les répertoires sur le VPS
ssh ${VPS_USER}@${VPS_IP} "mkdir -p ${VPS_PATH}/apps/web/src/app/api/image-proxy"
ssh ${VPS_USER}@${VPS_IP} "mkdir -p ${VPS_PATH}/apps/web/src/lib"
ssh ${VPS_USER}@${VPS_IP} "mkdir -p ${VPS_PATH}/apps/web/src/components"

# Transférer les fichiers
scp "${TEMP_DIR}/apps/web/src/app/api/image-proxy/route.ts" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/apps/web/src/app/api/image-proxy/ 2>/dev/null && echo -e "${GREEN}✓ route.ts transféré${NC}" || echo -e "${RED}✗ Erreur route.ts${NC}"
scp "${TEMP_DIR}/apps/web/src/lib/image-proxy.ts" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/apps/web/src/lib/ 2>/dev/null && echo -e "${GREEN}✓ image-proxy.ts transféré${NC}" || echo -e "${RED}✗ Erreur image-proxy.ts${NC}"
scp "${TEMP_DIR}/apps/web/src/components/channel-logo.tsx" ${VPS_USER}@${VPS_IP}:${VPS_PATH}/apps/web/src/components/ 2>/dev/null && echo -e "${GREEN}✓ channel-logo.tsx transféré${NC}" || echo -e "${RED}✗ Erreur channel-logo.tsx${NC}"

# Nettoyer le répertoire temporaire
rm -rf "${TEMP_DIR}"

echo ""
echo -e "${BLUE}🔨 Rebuild de l'application sur le VPS...${NC}"

# Exécuter les commandes sur le VPS
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
cd /var/www/terranovision

echo "📦 Installation des dépendances..."
pnpm install --filter @terranovision/web

echo "🔨 Build de l'application web..."
pnpm --filter @terranovision/web build

echo "🔄 Redémarrage de l'application..."
pm2 restart web

echo "✅ Mise à jour terminée !"
ENDSSH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Déploiement Réussi !${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Vérifications:${NC}"
echo ""
echo "1. Vérifier les logs:"
echo "   ssh ${VPS_USER}@${VPS_IP} 'pm2 logs web --lines 20'"
echo ""
echo "2. Tester l'API image-proxy:"
echo "   curl http://${VPS_IP}:3000/api/image-proxy?url=http://51.158.145.100/picons/logos/france/820880.png"
echo ""
echo "3. Accéder à l'application:"
echo "   http://${VPS_IP}:3000/channels"
echo ""
echo -e "${YELLOW}💡 Les logos devraient maintenant s'afficher correctement !${NC}"

