# Instructions pour Construire l'APK TerranoVision

## ⚠️ Prérequis Système

Pour construire l'APK Android, vous avez besoin de:

1. **Java JDK 17** (minimum JDK 11)
2. **Android SDK** (via Android Studio ou ligne de commande)
3. **Node.js 18+** et **pnpm**

### Problème Rencontré

❌ **Votre système actuel utilise Java 8 (JRE 1.8.0_451)** qui n'est **pas compatible** avec Android Gradle Plugin 8.7.2 (nécessite Java 11+).

## 🔧 Solutions Disponibles

### Option 1: Construction Automatique via GitHub Actions (RECOMMANDÉ)

La manière la plus simple est d'utiliser GitHub Actions qui construira l'APK automatiquement sur les serveurs GitHub avec tous les outils nécessaires déjà installés.

#### Étapes:

1. **Committez et pushez le code vers GitHub**
   ```bash
   git add .
   git commit -m "feat: Configuration Capacitor pour APK Android"
   git push origin main
   ```

2. **Lancez le workflow GitHub Actions**
   - Allez sur votre repository GitHub
   - Cliquez sur l'onglet "Actions"
   - Sélectionnez "Build Android APK"
   - Cliquez sur "Run workflow"
   - Choisissez la branche "main"
   - Cliquez sur "Run workflow" (bouton vert)

3. **Téléchargez l'APK**
   - Attendez que le workflow se termine (~5-10 minutes)
   - Cliquez sur le workflow complété
   - Dans la section "Artifacts", téléchargez `terranovision-mobile-debug.zip`
   - Extrayez le fichier `app-debug.apk`

4. **Uploadez sur le serveur**
   ```bash
   scp app-debug.apk root@148.230.104.203:/var/www/apps/web/public/downloads/terranovision-mobile-v1.0.0.apk
   ```

### Option 2: Installation de Java JDK 17 Localement

Si vous voulez construire localement, installez Java JDK 17:

#### Téléchargement:

**Windows:**
- Eclipse Temurin JDK 17: https://adoptium.net/temurin/releases/?version=17
- Oracle JDK 17: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html

**Installation:**

1. Téléchargez l'installateur Windows (.msi ou .exe)
2. Exécutez l'installateur
3. Ajoutez au PATH (l'installateur peut le faire automatiquement)
4. Définissez JAVA_HOME:
   ```cmd
   setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.XX-hotspot"
   setx PATH "%PATH%;%JAVA_HOME%\bin"
   ```

5. **Redémarrez votre terminal** et vérifiez:
   ```bash
   java -version
   # Devrait afficher: openjdk version "17.0.XX"
   ```

6. **Construisez l'APK:**
   ```bash
   cd "D:\les coder\Claud Streaming\apps\web\android"
   ./gradlew assembleDebug
   ```

7. **L'APK sera généré ici:**
   ```
   D:\les coder\Claud Streaming\apps\web\android\app\build\outputs\apk\debug\app-debug.apk
   ```

### Option 3: Utiliser Android Studio

1. **Téléchargez Android Studio:** https://developer.android.com/studio
2. **Installez-le** (inclut Java JDK 17 et Android SDK)
3. **Ouvrez le projet:**
   - Lancez Android Studio
   - File > Open
   - Sélectionnez: `D:\les coder\Claud Streaming\apps\web\android`
4. **Construisez:**
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - L'APK sera dans: `app/build/outputs/apk/debug/`

## 📦 Après Construction

### 1. Renommez l'APK
```bash
mv app-debug.apk terranovision-mobile-v1.0.0.apk
```

### 2. Uploadez sur le serveur
```bash
scp terranovision-mobile-v1.0.0.apk root@148.230.104.203:/var/www/apps/web/public/downloads/
```

### 3. Mettez à jour la page de téléchargement

Le fichier `/var/www/apps/web/src/app/download/page.tsx` sera automatiquement mis à jour une fois l'APK uploadé.

## 🔐 Pour une APK de Production Signée

Pour publier sur Google Play Store ou pour une distribution externe, vous devez créer une APK signée:

### 1. Générer un keystore (avec JDK 17)
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore terranovision-release.keystore \
  -alias terranovision \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass VOTRE_MOT_DE_PASSE_SECURISE \
  -keypass VOTRE_MOT_DE_PASSE_SECURISE \
  -dname "CN=TerranoVision, OU=Development, O=TerranoVision, L=Paris, S=IDF, C=FR"
```

⚠️ **IMPORTANT:** Sauvegardez le keystore et les mots de passe en lieu sûr!

### 2. Configurez la signature dans `android/app/build.gradle`

Ajoutez avant `android {`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('keystore.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Dans `android { ... }`, ajoutez:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 3. Créez `android/keystore.properties`
```properties
storePassword=VOTRE_MOT_DE_PASSE
keyPassword=VOTRE_MOT_DE_PASSE
keyAlias=terranovision
storeFile=../terranovision-release.keystore
```

⚠️ **N'ajoutez JAMAIS `keystore.properties` à Git!**

### 4. Construisez l'APK Release
```bash
cd android
./gradlew assembleRelease
```

L'APK signée sera dans: `app/build/outputs/apk/release/app-release.apk`

## 📱 Test de l'APK

1. Activez "Sources inconnues" sur votre appareil Android
2. Transférez l'APK sur votre téléphone
3. Installez et testez

## ❓ Dépannage

### Erreur: "Could not reserve enough space for object heap"
- Réduisez la mémoire dans `android/gradle.properties`:
  ```properties
  org.gradle.jvmargs=-Xmx512m -Dfile.encoding=UTF-8
  ```

### Erreur: "Dependency requires at least JVM runtime version 11"
- Installez Java JDK 17 (voir Option 2 ci-dessus)

### Gradle daemon ne démarre pas
- Arrêtez tous les daemons: `./gradlew --stop`
- Nettoyez le cache: `rm -rf ~/.gradle/caches/`
- Relancez la construction

## 📚 Ressources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Adoptium JDK Downloads](https://adoptium.net/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
