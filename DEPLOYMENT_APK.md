# Guide de Déploiement APK - TerranoVision

## 📦 Fichiers Créés

### Pages et Routes
- ✅ `/download` - Page de téléchargement APK
- ✅ Liens dans footer et menu

### Configuration Capacitor
- ✅ `capacitor.config.json` - Config Android Mobile
- ✅ `capacitor.config.tv.json` - Config Android TV

### Manifestes Android
- ✅ `android/app/src/main/AndroidManifest.xml` - Mobile
- ✅ `android-tv/app/src/main/AndroidManifest.xml` - TV

### Scripts de Build
- ✅ `build-apks.sh` - Script automatisé de build
- ✅ `BUILD_APK_GUIDE.md` - Guide complet
- ✅ `package.json.apk` - Scripts npm

### Assets
- ✅ `android/app/src/main/res/values/strings.xml`
- ✅ `android-tv/app/src/main/res/values/strings.xml`

## 🚀 Déploiement Rapide

### Étape 1: Installer Capacitor

```bash
cd /d/les\ coder/Claud\ Streaming

# Installer les dépendances
pnpm add @capacitor/core @capacitor/cli @capacitor/android

# Ou utiliser le package.json.apk
cp package.json.apk package.json
pnpm install
```

### Étape 2: Build Next.js

```bash
cd apps/web

# Build production
pnpm run build

# Export static
pnpm run export
# Crée le dossier apps/web/out
```

### Étape 3: Initialiser Capacitor

```bash
cd /d/les\ coder/Claud\ Streaming

# Initialiser avec la config mobile
npx cap init "TerranoVision" "com.terranovision.app" --web-dir=apps/web/out

# Ajouter Android
npx cap add android

# Copier et sync
npx cap copy android
npx cap sync android
```

### Étape 4: Créer le Keystore

```bash
keytool -genkey -v \
  -keystore release-key.keystore \
  -alias terranovision \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Remplir les informations:
# Password: [CHOISIR_MOT_DE_PASSE_SECURISE]
# First and Last Name: TerranoVision
# Organization: TerranoVision
# City, State, Country: [Vos informations]
```

**⚠️ IMPORTANT:** Sauvegarder le keystore et le mot de passe dans un endroit sécurisé!

### Étape 5: Configurer le Build de Release

Éditer `android/app/build.gradle`:

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

### Étape 6: Build l'APK Mobile

```bash
cd android

# Build release
./gradlew assembleRelease

# L'APK sera dans:
# android/app/build/outputs/apk/release/app-release.apk

# Copier vers downloads
mkdir -p ../apps/web/public/downloads
cp app/build/outputs/apk/release/app-release.apk \
   ../apps/web/public/downloads/terranovision-mobile-v1.0.0.apk
```

### Étape 7: Build l'APK TV (Optionnel)

```bash
cd /d/les\ coder/Claud\ Streaming

# Initialiser avec config TV
export CAPACITOR_CONFIG_PATH=capacitor.config.tv.json
npx cap add android
mv android android-tv

# Copier le manifest TV
cp android-tv/app/src/main/AndroidManifest.xml \
   android-tv/app/src/main/AndroidManifest.xml

# Build
cd android-tv
./gradlew assembleRelease

# Copier
cp app/build/outputs/apk/release/app-release.apk \
   ../apps/web/public/downloads/terranovision-tv-v1.0.0.apk
```

### Étape 8: Uploader sur le Serveur

```bash
# Uploader les APKs
scp apps/web/public/downloads/terranovision-mobile-v1.0.0.apk \
    root@148.230.104.203:/var/www/apps/web/public/downloads/

scp apps/web/public/downloads/terranovision-tv-v1.0.0.apk \
    root@148.230.104.203:/var/www/apps/web/public/downloads/

# Vérifier les permissions
ssh root@148.230.104.203 "chmod 644 /var/www/apps/web/public/downloads/*.apk"
```

### Étape 9: Déployer la Page de Téléchargement

```bash
# Uploader la page download
cat "D:\\les coder\\Claud Streaming\\pages\\download.tsx" | \
  ssh root@148.230.104.203 "mkdir -p /var/www/apps/web/src/app/download && cat > /var/www/apps/web/src/app/download/page.tsx"

# Rebuild Next.js sur le serveur
ssh root@148.230.104.203 "cd /var/www/apps/web && pnpm run build && pm2 restart terranovision-web"
```

## 📱 Utilisation du Script Automatique

```bash
# Rendre le script exécutable
chmod +x build-apks.sh

# Build Mobile uniquement
./build-apks.sh mobile

# Build TV uniquement
./build-apks.sh tv

# Build les deux
./build-apks.sh both
# ou
./build-apks.sh
```

## ✅ Vérification

### Tester l'APK Mobile

```bash
# Installer sur appareil connecté via ADB
adb install apps/web/public/downloads/terranovision-mobile-v1.0.0.apk

# Ou sur émulateur
adb -e install apps/web/public/downloads/terranovision-mobile-v1.0.0.apk
```

### Vérifier la Signature

```bash
jarsigner -verify -verbose -certs apps/web/public/downloads/terranovision-mobile-v1.0.0.apk
```

### Informations APK

```bash
aapt dump badging apps/web/public/downloads/terranovision-mobile-v1.0.0.apk
```

## 🌐 URLs de Téléchargement

Une fois déployé:

- **Page Download:** https://terranovision.cloud/download
- **APK Mobile:** https://terranovision.cloud/downloads/terranovision-mobile-v1.0.0.apk
- **APK TV:** https://terranovision.cloud/downloads/terranovision-tv-v1.0.0.apk

## 📝 Checklist Finale

- [ ] Next.js build et export réussi
- [ ] Capacitor initialisé
- [ ] Keystore créé et sauvegardé
- [ ] build.gradle configuré avec signing
- [ ] APK Mobile buildé et testé
- [ ] APK TV buildé et testé (optionnel)
- [ ] APKs uploadés sur serveur
- [ ] Page /download déployée
- [ ] Liens ajoutés dans navigation
- [ ] Tests de téléchargement depuis site

## 🔧 Troubleshooting

### Erreur: ANDROID_HOME not set

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Erreur: Gradle build failed

```bash
cd android
./gradlew clean
./gradlew --stop
rm -rf ~/.gradle/caches/
./gradlew assembleRelease
```

### APK non signé

Vérifier que `release-key.keystore` existe et que le mot de passe est correct dans `build.gradle`.

### Taille APK trop grande

- Activer minifyEnabled et shrinkResources (déjà fait)
- Utiliser ProGuard rules
- Supprimer les ressources inutilisées

## 🎯 Prochaines Étapes

1. ✅ Créer les icônes app (utiliser https://appicon.co/)
2. ✅ Créer le banner TV (320x180)
3. ✅ Créer le splash screen
4. ✅ Tester sur appareil réel
5. ✅ Publier sur site web
6. 🔜 Publier sur Google Play Store (optionnel)

## 📚 Documentation

- [BUILD_APK_GUIDE.md](BUILD_APK_GUIDE.md) - Guide détaillé complet
- [Capacitor Android](https://capacitorjs.com/docs/android)
- [Android Publishing](https://developer.android.com/studio/publish)
