# TerranoVision Android & Android TV

Application Android native pour TerranoVision avec support pour mobiles, tablettes et Android TV.

## 🎯 Fonctionnalités

### Mobile & Tablette
- Grille de chaînes avec logos
- Recherche instantanée
- Favoris synchronisés
- Lecteur vidéo avec contrôles tactiles
- Support HLS et RTMP (via extension)
- Mode portrait et paysage

### Android TV
- Interface Leanback optimisée pour la télécommande
- Grille de chaînes en carousel
- Navigation D-pad fluide
- Lecteur plein écran
- Guide TV (EPG) intégré
- Contrôle parental

## 🛠️ Technologies

- **Kotlin** - Langage principal
- **ExoPlayer** (Media3) - Lecteur vidéo
  - Support HLS natif
  - Extension RTMP pour flux RTMP
  - Support RTSP
- **Leanback** - UI Android TV
- **Retrofit** - API REST client
- **Glide** - Chargement d'images
- **Coroutines** - Programmation asynchrone

## 📦 Build & Installation

### Prérequis
- Android Studio Hedgehog ou supérieur
- JDK 17
- Android SDK 34
- Gradle 8.x

### Build Debug
```bash
./gradlew assembleDebug
```

### Build Release
```bash
./gradlew assembleRelease
```

### Installation sur appareil
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## 🎮 Tests sur Android TV

### Émulateur Android TV
1. Dans Android Studio : Tools > Device Manager
2. Create Device > TV > Select "Android TV (1080p)"
3. Download System Image (API 33+)
4. Launch emulator

### Tests avec télécommande
- **D-Pad** : Navigation dans la grille
- **Center/OK** : Sélection chaîne
- **Back** : Retour
- **Menu** : Options

## 📁 Structure

```
apps/android/
├── src/
│   ├── main/
│   │   ├── java/com/terranovision/tv/
│   │   │   ├── tv/              # Android TV UI (Leanback)
│   │   │   ├── mobile/          # Mobile UI
│   │   │   ├── player/          # Video player
│   │   │   ├── data/            # API & models
│   │   │   └── utils/           # Utilities
│   │   ├── res/                 # Resources
│   │   └── AndroidManifest.xml
│   └── test/                    # Unit tests
├── build.gradle.kts
└── proguard-rules.pro
```

## 🔐 Configuration

Configurer l'URL de l'API dans `build.gradle.kts` :

```kotlin
buildTypes {
    release {
        buildConfigField("String", "API_BASE_URL", "\"https://your-api.com\"")
    }
    debug {
        buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:4000\"")
    }
}
```

## 📝 Notes importantes

### Support RTMP
L'extension RTMP d'ExoPlayer est incluse pour lire les flux RTMP directement sur Android. Cependant, pour une meilleure compatibilité web, il est recommandé d'utiliser le stream-gateway pour transcoder en HLS.

### Licences
Vérifier les licences des dépendances avant distribution commerciale, notamment pour l'extension RTMP.

## 🚀 Distribution

### Google Play Store
1. Créer un keystore de release
2. Configurer signing dans `build.gradle.kts`
3. Build AAB : `./gradlew bundleRelease`
4. Upload sur Play Console

### Amazon Fire TV
Compatible avec Amazon Fire TV via APK sideload ou Amazon Appstore.
