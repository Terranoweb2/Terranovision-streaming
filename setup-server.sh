#!/bin/bash

# ============================================
# Script de Configuration Initiale VPS
# TerranoVision Server Setup
# ============================================

set -e  # Exit on error

echo "🔧 Configuration Initiale du Serveur VPS"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Ce script doit être exécuté en tant que root${NC}"
    echo "Utilisez: sudo ./setup-server.sh"
    exit 1
fi

echo -e "${BLUE}📦 Étape 1/8: Mise à jour du système...${NC}"
apt-get update -qq
apt-get upgrade -y -qq
echo -e "${GREEN}✓${NC} Système mis à jour"

echo ""
echo -e "${BLUE}📦 Étape 2/8: Installation Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}✓${NC} Node.js installé: $(node --version)"
else
    echo -e "${GREEN}✓${NC} Node.js déjà installé: $(node --version)"
fi

echo ""
echo -e "${BLUE}📦 Étape 3/8: Installation pnpm et PM2...${NC}"
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@8.15.0
    echo -e "${GREEN}✓${NC} pnpm installé: $(pnpm --version)"
else
    echo -e "${GREEN}✓${NC} pnpm déjà installé: $(pnpm --version)"
fi

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✓${NC} PM2 installé"
else
    echo -e "${GREEN}✓${NC} PM2 déjà installé"
fi

echo ""
echo -e "${BLUE}📦 Étape 4/8: Installation PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
    echo -e "${GREEN}✓${NC} PostgreSQL installé"
else
    echo -e "${GREEN}✓${NC} PostgreSQL déjà installé"
fi

echo ""
echo -e "${BLUE}📦 Étape 5/8: Installation Git...${NC}"
if ! command -v git &> /dev/null; then
    apt-get install -y git
    echo -e "${GREEN}✓${NC} Git installé: $(git --version)"
else
    echo -e "${GREEN}✓${NC} Git déjà installé: $(git --version)"
fi

echo ""
echo -e "${BLUE}📦 Étape 6/8: Installation outils utiles...${NC}"
apt-get install -y curl wget nano htop net-tools
echo -e "${GREEN}✓${NC} Outils installés"

echo ""
echo -e "${BLUE}🔥 Étape 7/8: Configuration Firewall UFW...${NC}"
if ! command -v ufw &> /dev/null; then
    apt-get install -y ufw
fi

# Configuration UFW
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
echo -e "${GREEN}✓${NC} Firewall configuré"

echo ""
echo -e "${BLUE}🛡️  Étape 8/8: Installation Fail2ban...${NC}"
if ! command -v fail2ban-client &> /dev/null; then
    apt-get install -y fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    echo -e "${GREEN}✓${NC} Fail2ban installé et démarré"
else
    echo -e "${GREEN}✓${NC} Fail2ban déjà installé"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Configuration initiale terminée!"
echo "==========================================${NC}"

echo ""
echo -e "${BLUE}📊 Résumé de l'installation:${NC}"
echo "  • Node.js:     $(node --version)"
echo "  • npm:         $(npm --version)"
echo "  • pnpm:        $(pnpm --version)"
echo "  • PostgreSQL:  $(psql --version | head -n1)"
echo "  • Git:         $(git --version)"
echo "  • PM2:         Installé"
echo "  • UFW:         Actif"
echo "  • Fail2ban:    Actif"

echo ""
echo -e "${YELLOW}🔐 Configuration de la Base de Données${NC}"
echo "Voulez-vous créer la base de données TerranoVision maintenant? (o/n)"
read -p "> " create_db

if [[ $create_db =~ ^[Oo]$ ]]; then
    echo ""
    echo "Entrez le mot de passe pour l'utilisateur PostgreSQL 'terranovision':"
    read -s db_password

    sudo -u postgres psql << EOF
CREATE DATABASE terranovision;
CREATE USER terranovision WITH PASSWORD '$db_password';
GRANT ALL PRIVILEGES ON DATABASE terranovision TO terranovision;
ALTER DATABASE terranovision OWNER TO terranovision;
EOF

    echo ""
    echo -e "${GREEN}✓${NC} Base de données 'terranovision' créée"
    echo ""
    echo -e "${YELLOW}📝 Notez votre DATABASE_URL:${NC}"
    echo "postgresql://terranovision:$db_password@localhost:5432/terranovision?schema=public"
else
    echo ""
    echo -e "${YELLOW}⚠️  N'oubliez pas de créer la base de données plus tard:${NC}"
    echo "sudo -u postgres psql"
    echo "CREATE DATABASE terranovision;"
    echo "CREATE USER terranovision WITH PASSWORD 'votre_mot_de_passe';"
    echo "GRANT ALL PRIVILEGES ON DATABASE terranovision TO terranovision;"
fi

echo ""
echo -e "${YELLOW}🔐 Sécurité Additionnelle (Recommandé)${NC}"
echo "Voulez-vous créer un utilisateur non-root? (o/n)"
read -p "> " create_user

if [[ $create_user =~ ^[Oo]$ ]]; then
    echo "Nom d'utilisateur:"
    read username

    adduser $username
    usermod -aG sudo $username

    echo -e "${GREEN}✓${NC} Utilisateur '$username' créé avec privilèges sudo"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo "1. Testez la connexion avec ce nouvel utilisateur"
    echo "2. Configurez les clés SSH pour cet utilisateur"
    echo "3. Puis désactivez le login root dans /etc/ssh/sshd_config"
fi

echo ""
echo -e "${GREEN}🎯 Prochaines Étapes:${NC}"
echo ""
echo "1. Cloner le projet:"
echo "   cd /var/www"
echo "   git clone https://github.com/VOTRE_USERNAME/terranovision.git"
echo "   cd terranovision"
echo ""
echo "2. Configurer l'environnement:"
echo "   cp .env.vps.example .env.vps"
echo "   nano .env.vps"
echo ""
echo "3. Déployer l'application:"
echo "   chmod +x deploy-vps.sh"
echo "   ./deploy-vps.sh"
echo ""
echo "4. Installer Nginx (optionnel):"
echo "   apt-get install -y nginx"
echo "   # Puis configurer avec le guide VPS_DEPLOYMENT.md"
echo ""
echo -e "${BLUE}📚 Documentation complète: VPS_DEPLOYMENT.md${NC}"
echo ""
echo -e "${GREEN}🚀 Votre serveur est prêt!${NC}"
