@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   TerranoVision - Demarrage
echo ========================================
echo.

REM Charger les variables d'environnement depuis .env
if exist .env (
    echo [INFO] Chargement des variables depuis .env...
    for /f "tokens=1,* delims==" %%a in (.env) do (
        set "line=%%a"
        if not "!line:~0,1!"=="#" (
            set "%%a=%%b"
        )
    )
    echo [OK] Variables chargees
) else (
    echo [ERREUR] Fichier .env introuvable!
    echo Copiez .env.example vers .env
    pause
    exit /b 1
)

echo.
echo [INFO] Demarrage des services...
echo   - Web App:        http://localhost:3000
echo   - Ingest API:     http://localhost:4000
echo   - Stream Gateway: http://localhost:4001
echo.
echo Appuyez sur Ctrl+C pour arreter.
echo.

pnpm run dev
