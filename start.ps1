# TerranoVision - Script de démarrage
# Ce script configure les variables d'environnement et lance tous les services

Write-Host "🎬 Démarrage de TerranoVision..." -ForegroundColor Cyan

# Charger les variables d'environnement depuis .env
if (Test-Path ".env") {
    Write-Host "📋 Chargement des variables d'environnement depuis .env..." -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
            Write-Host "  ✓ $name défini" -ForegroundColor Green
        }
    }
} else {
    Write-Host "❌ Fichier .env introuvable!" -ForegroundColor Red
    Write-Host "Copiez .env.example vers .env et configurez-le." -ForegroundColor Yellow
    exit 1
}

# Vérifier que PostgreSQL est accessible
Write-Host "`n🔍 Vérification de PostgreSQL..." -ForegroundColor Yellow
$pgCheck = docker ps --filter "name=postgres" --format "{{.Names}}"
if ($pgCheck) {
    Write-Host "  ✓ PostgreSQL actif: $pgCheck" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Aucun container PostgreSQL trouvé" -ForegroundColor Yellow
    Write-Host "     Assurez-vous que PostgreSQL est démarré" -ForegroundColor Gray
}

# Vérifier que Docker Desktop est lancé
Write-Host "`n🐳 Vérification de Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "  ✓ Docker Desktop actif" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Docker Desktop n'est pas démarré" -ForegroundColor Yellow
    Write-Host "     Lancez Docker Desktop avant de continuer" -ForegroundColor Gray
}

Write-Host "`n🚀 Lancement de tous les services..." -ForegroundColor Cyan
Write-Host "   - Web App:        http://localhost:3000" -ForegroundColor Gray
Write-Host "   - Ingest API:     http://localhost:4000" -ForegroundColor Gray
Write-Host "   - Stream Gateway: http://localhost:4001" -ForegroundColor Gray
Write-Host "`nAppuyez sur Ctrl+C pour arrêter les services.`n" -ForegroundColor Yellow

# Lancer pnpm dev
pnpm run dev
