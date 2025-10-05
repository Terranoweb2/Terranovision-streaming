#!/bin/bash

# ============================================
# TerranoVision VPS Diagnostic Script
# ============================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher avec couleur
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================
# 1. Informations Système
# ============================================
print_header "1. INFORMATIONS SYSTÈME"

echo "Hostname: $(hostname)"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Kernel: $(uname -r)"
echo "Uptime: $(uptime -p)"
echo ""

# ============================================
# 2. Ressources
# ============================================
print_header "2. RESSOURCES SYSTÈME"

echo "=== CPU ==="
lscpu | grep -E "Model name|CPU\(s\):|Thread"
echo ""

echo "=== Mémoire ==="
free -h
echo ""

echo "=== Disque ==="
df -h | grep -E "Filesystem|/$|/var"
echo ""

# ============================================
# 3. Logiciels Installés
# ============================================
print_header "3. LOGICIELS INSTALLÉS"

# Node.js
if command -v node &> /dev/null; then
    print_success "Node.js: $(node --version)"
else
    print_error "Node.js: Non installé"
fi

# npm
if command -v npm &> /dev/null; then
    print_success "npm: $(npm --version)"
else
    print_error "npm: Non installé"
fi

# pnpm
if command -v pnpm &> /dev/null; then
    print_success "pnpm: $(pnpm --version)"
else
    print_error "pnpm: Non installé"
fi

# PM2
if command -v pm2 &> /dev/null; then
    print_success "PM2: $(pm2 --version)"
else
    print_error "PM2: Non installé"
fi

# Docker
if command -v docker &> /dev/null; then
    print_success "Docker: $(docker --version)"
else
    print_error "Docker: Non installé"
fi

# Docker Compose
if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose: $(docker-compose --version)"
else
    print_error "docker-compose: Non installé"
fi

# PostgreSQL
if command -v psql &> /dev/null; then
    print_success "PostgreSQL: $(psql --version)"
else
    print_error "PostgreSQL: Non installé"
fi

# Nginx
if command -v nginx &> /dev/null; then
    print_success "Nginx: $(nginx -v 2>&1)"
else
    print_error "Nginx: Non installé"
fi

# Git
if command -v git &> /dev/null; then
    print_success "Git: $(git --version)"
else
    print_error "Git: Non installé"
fi

echo ""

# ============================================
# 4. Services Actifs
# ============================================
print_header "4. SERVICES ACTIFS"

# Nginx
if systemctl is-active --quiet nginx; then
    print_success "Nginx: Actif"
else
    print_warning "Nginx: Inactif ou non installé"
fi

# PostgreSQL
if systemctl is-active --quiet postgresql; then
    print_success "PostgreSQL: Actif"
else
    print_warning "PostgreSQL: Inactif ou non installé"
fi

# Docker
if systemctl is-active --quiet docker; then
    print_success "Docker: Actif"
else
    print_warning "Docker: Inactif ou non installé"
fi

echo ""

# ============================================
# 5. Processus Node.js
# ============================================
print_header "5. PROCESSUS NODE.JS"

NODE_PROCESSES=$(ps aux | grep node | grep -v grep | wc -l)
if [ "$NODE_PROCESSES" -gt 0 ]; then
    print_success "Processus Node.js trouvés: $NODE_PROCESSES"
    ps aux | grep node | grep -v grep | awk '{print $2, $11, $12, $13, $14}'
else
    print_warning "Aucun processus Node.js actif"
fi

echo ""

# ============================================
# 6. PM2 Status
# ============================================
print_header "6. PM2 STATUS"

if command -v pm2 &> /dev/null; then
    PM2_APPS=$(pm2 list | grep -c "online\|stopped\|errored" || echo "0")
    if [ "$PM2_APPS" -gt 0 ]; then
        print_success "Applications PM2 trouvées: $PM2_APPS"
        pm2 list
    else
        print_warning "Aucune application PM2"
    fi
else
    print_warning "PM2 non installé"
fi

echo ""

# ============================================
# 7. Ports Ouverts
# ============================================
print_header "7. PORTS OUVERTS"

echo "Ports importants pour TerranoVision:"
netstat -tulpn 2>/dev/null | grep -E ":(80|443|3000|4000|4001|5432)" || print_warning "Aucun port TerranoVision ouvert"

echo ""

# ============================================
# 8. Docker Containers
# ============================================
print_header "8. DOCKER CONTAINERS"

if command -v docker &> /dev/null; then
    CONTAINERS=$(docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | tail -n +2 | wc -l)
    if [ "$CONTAINERS" -gt 0 ]; then
        print_success "Containers Docker trouvés: $CONTAINERS"
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        print_warning "Aucun container Docker"
    fi
else
    print_warning "Docker non installé"
fi

echo ""

# ============================================
# 9. Recherche du Projet
# ============================================
print_header "9. RECHERCHE DU PROJET TERRANOVISION"

print_info "Recherche dans /var/www..."
find /var/www -maxdepth 2 -name "*terranovision*" -o -name "*Claud*" 2>/dev/null || print_warning "Rien trouvé dans /var/www"

print_info "Recherche dans /root..."
find /root -maxdepth 2 -name "*terranovision*" -o -name "*Claud*" 2>/dev/null || print_warning "Rien trouvé dans /root"

print_info "Recherche dans /home..."
find /home -maxdepth 3 -name "*terranovision*" -o -name "*Claud*" 2>/dev/null || print_warning "Rien trouvé dans /home"

echo ""

# ============================================
# 10. Configuration Nginx
# ============================================
print_header "10. CONFIGURATION NGINX"

if [ -d "/etc/nginx" ]; then
    print_success "Nginx configuré"
    echo "Sites disponibles:"
    ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "Aucun"
    echo ""
    echo "Sites activés:"
    ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "Aucun"
else
    print_warning "Nginx non configuré"
fi

echo ""

# ============================================
# 11. Bases de Données PostgreSQL
# ============================================
print_header "11. BASES DE DONNÉES POSTGRESQL"

if command -v psql &> /dev/null && systemctl is-active --quiet postgresql; then
    print_success "PostgreSQL actif"
    sudo -u postgres psql -c "\l" 2>/dev/null | grep -E "Name|terranovision|---" || print_warning "Base terranovision non trouvée"
else
    print_warning "PostgreSQL non actif ou non installé"
fi

echo ""

# ============================================
# 12. Firewall
# ============================================
print_header "12. FIREWALL (UFW)"

if command -v ufw &> /dev/null; then
    print_success "UFW installé"
    sudo ufw status
else
    print_warning "UFW non installé"
fi

echo ""

# ============================================
# RÉSUMÉ
# ============================================
print_header "RÉSUMÉ DU DIAGNOSTIC"

echo "✓ Système: Ubuntu 24.04 LTS"
echo "✓ Hostname: $(hostname)"
echo "✓ IP: $(hostname -I | awk '{print $1}')"
echo ""

# Vérifications critiques
CRITICAL_OK=0
CRITICAL_TOTAL=5

command -v node &> /dev/null && ((CRITICAL_OK++)) || echo "✗ Node.js manquant"
command -v pnpm &> /dev/null && ((CRITICAL_OK++)) || echo "✗ pnpm manquant"
command -v pm2 &> /dev/null && ((CRITICAL_OK++)) || echo "✗ PM2 manquant"
command -v psql &> /dev/null && ((CRITICAL_OK++)) || echo "✗ PostgreSQL manquant"
command -v nginx &> /dev/null && ((CRITICAL_OK++)) || echo "✗ Nginx manquant"

echo ""
echo "Score: $CRITICAL_OK/$CRITICAL_TOTAL composants critiques installés"

if [ "$CRITICAL_OK" -eq "$CRITICAL_TOTAL" ]; then
    print_success "Tous les composants critiques sont installés !"
elif [ "$CRITICAL_OK" -ge 3 ]; then
    print_warning "Certains composants manquent, mais le système est partiellement prêt"
else
    print_error "Plusieurs composants critiques manquent"
fi

echo ""
print_info "Diagnostic terminé !"
print_info "Pour déployer TerranoVision, consultez: QUICK_START_VPS.md"

