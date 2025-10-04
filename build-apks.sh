#!/bin/bash

# Script de build automatique des APKs TerranoVision
# Usage: ./build-apks.sh [mobile|tv|both]

set -e

VERSION="1.0.0"
BUILD_TYPE=${1:-both}

echo "🚀 TerranoVision APK Builder v$VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed."; exit 1; }
    command -v pnpm >/dev/null 2>&1 || { log_error "pnpm is required but not installed."; exit 1; }
    command -v npx >/dev/null 2>&1 || { log_error "npx is required but not installed."; exit 1; }

    if [ ! -d "$ANDROID_HOME" ]; then
        log_error "ANDROID_HOME not set or Android SDK not found"
        exit 1
    fi

    log_success "Prerequisites OK"
}

# Build Next.js
build_nextjs() {
    log_info "Building Next.js application..."
    cd apps/web

    # Clean previous builds
    rm -rf .next out

    # Build
    pnpm run build || { log_error "Next.js build failed"; exit 1; }

    # Export static
    pnpm run export || { log_error "Next.js export failed"; exit 1; }

    cd ../..
    log_success "Next.js build completed"
}

# Build Mobile APK
build_mobile_apk() {
    log_info "Building Mobile APK..."

    # Ensure Capacitor is initialized
    if [ ! -d "android" ]; then
        log_info "Initializing Capacitor for mobile..."
        npx cap add android
    fi

    # Copy web assets
    npx cap copy android
    npx cap sync android

    # Build APK
    cd android

    log_info "Running Gradle assembleRelease..."
    ./gradlew clean assembleRelease || { log_error "Gradle build failed"; cd ..; exit 1; }

    # Copy APK to downloads
    mkdir -p ../apps/web/public/downloads
    cp app/build/outputs/apk/release/app-release.apk \
       ../apps/web/public/downloads/terranovision-mobile-v${VERSION}.apk

    cd ..

    # Get APK size
    APK_SIZE=$(du -h apps/web/public/downloads/terranovision-mobile-v${VERSION}.apk | cut -f1)

    log_success "Mobile APK built: terranovision-mobile-v${VERSION}.apk ($APK_SIZE)"
}

# Build TV APK
build_tv_apk() {
    log_info "Building TV APK..."

    # Use TV configuration
    export CAPACITOR_CONFIG_PATH=capacitor.config.tv.json

    # Ensure Capacitor is initialized for TV
    if [ ! -d "android-tv" ]; then
        log_info "Initializing Capacitor for TV..."
        npx cap add android --capacitorConfig=capacitor.config.tv.json
        mv android android-tv
    fi

    # Copy web assets
    npx cap copy android --capacitorConfig=capacitor.config.tv.json
    npx cap sync android --capacitorConfig=capacitor.config.tv.json

    # Build APK
    cd android-tv

    log_info "Running Gradle assembleRelease for TV..."
    ./gradlew clean assembleRelease || { log_error "Gradle build failed"; cd ..; exit 1; }

    # Copy APK to downloads
    mkdir -p ../apps/web/public/downloads
    cp app/build/outputs/apk/release/app-release.apk \
       ../apps/web/public/downloads/terranovision-tv-v${VERSION}.apk

    cd ..

    # Get APK size
    APK_SIZE=$(du -h apps/web/public/downloads/terranovision-tv-v${VERSION}.apk | cut -f1)

    log_success "TV APK built: terranovision-tv-v${VERSION}.apk ($APK_SIZE)"
}

# Upload to server
upload_to_server() {
    log_info "Uploading APKs to server..."

    if [ ! -f ~/.ssh/id_rsa ]; then
        log_warning "SSH key not found, skipping upload"
        return
    fi

    scp apps/web/public/downloads/terranovision-*.apk \
        root@148.230.104.203:/var/www/apps/web/public/downloads/ || {
        log_warning "Upload failed, but continuing..."
        return
    }

    ssh root@148.230.104.203 "chmod 644 /var/www/apps/web/public/downloads/terranovision-*.apk"

    log_success "APKs uploaded to server"
}

# Main execution
main() {
    check_prerequisites
    build_nextjs

    case "$BUILD_TYPE" in
        mobile)
            build_mobile_apk
            ;;
        tv)
            build_tv_apk
            ;;
        both)
            build_mobile_apk
            build_tv_apk
            ;;
        *)
            log_error "Invalid build type. Use: mobile, tv, or both"
            exit 1
            ;;
    esac

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_success "Build completed successfully!"
    echo ""
    echo "📱 APKs available at:"
    [ -f "apps/web/public/downloads/terranovision-mobile-v${VERSION}.apk" ] && \
        echo "   - apps/web/public/downloads/terranovision-mobile-v${VERSION}.apk"
    [ -f "apps/web/public/downloads/terranovision-tv-v${VERSION}.apk" ] && \
        echo "   - apps/web/public/downloads/terranovision-tv-v${VERSION}.apk"
    echo ""

    # Offer to upload
    read -p "Upload APKs to server? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        upload_to_server
    fi

    log_success "All done! 🎉"
}

# Run
main
