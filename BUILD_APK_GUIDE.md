# Guide de Build APK - TerranoVision

Ce guide explique comment créer les APKs Android Mobile et Android TV pour TerranoVision.

## 📋 Prérequis

### 1. Installer les outils nécessaires

```bash
# Node.js 18+ et pnpm
node --version  # v18+
pnpm --version

# Android Studio
# Télécharger depuis: https://developer.android.com/studio

# Java JDK 11+
java -version  # 11+

# Capacitor CLI
pnpm add -g @capacitor/cli
```

### 2. Variables d'environnement

Ajouter dans `~/.bashrc` ou `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

## 🚀 Build APK Mobile

### Étape 1: Préparer le projet Next.js

```bash
cd apps/web

# Build statique Next.js
pnpm run build
pnpm run export  # Génère le dossier 'out'
```

### Étape 2: Initialiser Capacitor (première fois uniquement)

```bash
# À la racine du monorepo
pnpm add @capacitor/core @capacitor/cli @capacitor/android

# Initialiser
npx cap init "TerranoVision" "com.terranovision.app" --web-dir=apps/web/out
```

### Étape 3: Ajouter la plateforme Android

```bash
# Ajouter Android
npx cap add android

# Copier les fichiers web dans Android
npx cap copy android

# Synchroniser
npx cap sync android
```

### Étape 4: Générer le keystore (une seule fois)

```bash
keytool -genkey -v \
  -keystore release-key.keystore \
  -alias terranovision \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Renseigner:
# - Mot de passe: [VOTRE_MOT_DE_PASSE]
# - Nom complet: TerranoVision
# - Organisation: TerranoVision
# - Ville, Pays, etc.
```

### Étape 5: Configurer le build de release

Créer `android/app/build.gradle` avec:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('../../release-key.keystore')
            storePassword 'VOTRE_MOT_DE_PASSE'
            keyAlias 'terranovision'
            keyPassword 'VOTRE_MOT_DE_PASSE'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Étape 6: Build l'APK

```bash
cd android

# Build Release APK
./gradlew assembleRelease

# L'APK sera généré dans:
# android/app/build/outputs/apk/release/app-release.apk
```

### Étape 7: Renommer et déplacer

```bash
cp android/app/build/outputs/apk/release/app-release.apk \
   apps/web/public/downloads/terranovision-mobile-v1.0.0.apk
```

## 📺 Build APK Android TV

### Étape 1: Créer le projet TV

```bash
# Utiliser la config TV
npx cap init "TerranoVision TV" "com.terranovision.tv" \
  --web-dir=apps/web/out \
  --config=capacitor.config.tv.json

# Ajouter Android avec nom différent
npx cap add android --capacitorConfig=capacitor.config.tv.json
```

### Étape 2: Modifier AndroidManifest.xml

Utiliser le fichier `android-tv/app/src/main/AndroidManifest.xml` créé avec:
- `android:banner` pour le launcher TV
- `android.software.leanback` requis
- `LEANBACK_LAUNCHER` intent filter
- `screenOrientation="landscape"`

### Étape 3: Ajouter les ressources TV

```bash
# Banner TV (320x180)
# Créer: android/app/src/main/res/drawable-xhdpi/tv_banner.png
```

### Étape 4: Build APK TV

```bash
cd android

# Build Release APK TV
./gradlew assembleRelease

# Renommer
cp android/app/build/outputs/apk/release/app-release.apk \
   apps/web/public/downloads/terranovision-tv-v1.0.0.apk
```

## 🎨 Assets requis

### Icônes Mobile

Générer avec: https://appicon.co/

Tailles nécessaires:
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

### Banner TV

- `drawable-xhdpi/tv_banner.png` (320x180)

### Splash Screen

- `drawable/splash.png` (1920x1080)
- Fond noir avec logo TerranoVision centré

## 🔧 Script de build automatique

```bash
#!/bin/bash
# build-apks.sh

set -e

echo "🏗️  Building TerranoVision APKs..."

# 1. Build Next.js
echo "📦 Building Next.js..."
cd apps/web
pnpm run build
pnpm run export

# 2. Sync Capacitor
echo "🔄 Syncing Capacitor..."
cd ../..
npx cap copy android
npx cap sync android

# 3. Build Mobile APK
echo "📱 Building Mobile APK..."
cd android
./gradlew clean assembleRelease
cp app/build/outputs/apk/release/app-release.apk \
   ../apps/web/public/downloads/terranovision-mobile-v1.0.0.apk

# 4. Build TV APK (si configuré)
echo "📺 Building TV APK..."
# Répéter avec capacitor.config.tv.json

echo "✅ APKs built successfully!"
echo "📱 Mobile: apps/web/public/downloads/terranovision-mobile-v1.0.0.apk"
echo "📺 TV: apps/web/public/downloads/terranovision-tv-v1.0.0.apk"
```

## 📤 Upload des APKs

```bash
# Uploader sur le serveur VPS
scp apps/web/public/downloads/*.apk \
    root@148.230.104.203:/var/www/apps/web/public/downloads/

# Vérifier les permissions
ssh root@148.230.104.203 "chmod 644 /var/www/apps/web/public/downloads/*.apk"
```

## ✅ Vérification

```bash
# Vérifier la signature
jarsigner -verify -verbose -certs terranovision-mobile-v1.0.0.apk

# Obtenir les infos APK
aapt dump badging terranovision-mobile-v1.0.0.apk

# Tester sur émulateur
adb install terranovision-mobile-v1.0.0.apk
```

## 🔐 Sécurité

1. **NE JAMAIS** commiter le keystore dans Git
2. Ajouter dans `.gitignore`:
   ```
   *.keystore
   *.jks
   release-key.properties
   ```
3. Sauvegarder le keystore dans un endroit sécurisé
4. Noter le mot de passe dans un gestionnaire de mots de passe

## 📝 Versions

Mettre à jour les versions dans:
- `android/app/build.gradle`: `versionCode` et `versionName`
- `package.json`: `version`
- Noms des fichiers APK

## 🐛 Troubleshooting

### Erreur: SDK not found
```bash
# Installer Android SDK via Android Studio
# Ou avec sdkmanager:
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
```

### Erreur: Gradle build failed
```bash
# Nettoyer le build
cd android
./gradlew clean

# Vider le cache Gradle
./gradlew --stop
rm -rf ~/.gradle/caches/
```

### APK trop volumineux
```bash
# Activer ProGuard et la minification
# Déjà configuré dans build.gradle release
# Vérifier: minifyEnabled true, shrinkResources true
```

## 📚 Ressources

- [Capacitor Android](https://capacitorjs.com/docs/android)
- [Android Studio](https://developer.android.com/studio)
- [Android TV Guidelines](https://developer.android.com/training/tv)
- [App Signing](https://developer.android.com/studio/publish/app-signing)
