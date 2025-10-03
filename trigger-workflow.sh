#!/bin/bash
# Script pour déclencher le workflow GitHub Actions

echo "🚀 Déclenchement du workflow Build Android APK..."

# Informations du repository
REPO_OWNER="Terranoweb2"
REPO_NAME="Terranovision-streaming"
WORKFLOW_FILE="build-apk.yml"
BRANCH="main"

# URL de l'API GitHub
API_URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches"

echo "📋 Repository: ${REPO_OWNER}/${REPO_NAME}"
echo "📝 Workflow: ${WORKFLOW_FILE}"
echo "🌿 Branch: ${BRANCH}"
echo ""

# Note: Ce script nécessite un token GitHub
# Pour créer un token: https://github.com/settings/tokens
# Permissions requises: repo, workflow

echo "⚠️  Pour déclencher le workflow, vous devez:"
echo "1. Aller sur: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions"
echo "2. Cliquer sur 'Build Android APK' dans la liste des workflows"
echo "3. Cliquer sur 'Run workflow' (bouton vert)"
echo "4. Sélectionner la branche 'main'"
echo "5. Cliquer sur 'Run workflow' pour confirmer"
echo ""
echo "📱 Le workflow construira l'APK avec:"
echo "   - Node.js 22"
echo "   - Java JDK 17"
echo "   - Android Gradle Plugin 8.7.2"
echo ""
echo "⏱️  Durée estimée: 5-10 minutes"
echo ""
echo "✅ Après le build, téléchargez l'APK depuis la section 'Artifacts'"
