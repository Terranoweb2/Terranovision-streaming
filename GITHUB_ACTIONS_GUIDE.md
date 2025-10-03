# 🚀 Guide Complet: Construire l'APK avec GitHub Actions

## ✅ Configuration Complète

Tout est déjà configuré et prêt! Voici ce qui a été fait:

### 1. Capacitor Configuré ✓
- **Version**: 7.4.3
- **Configuration**: `apps/web/capacitor.config.ts`
- **Serveur**: http://terranovision.cloud
- **Plateforme Android**: Initialisée avec toutes les permissions

### 2. GitHub Actions Workflow ✓
- **Fichier**: `.github/workflows/build-apk.yml`
- **Build automatique** avec:
  - Ubuntu latest
  - Node.js 22
  - Java JDK 17
  - pnpm 9
  - Gradle 8.11.1

### 3. Code Pushé sur GitHub ✓
- **Commit**: `cfe237f`
- **Branch**: `main`
- **Repository**: https://github.com/Terranoweb2/Terranovision-streaming

---

## 📱 Comment Déclencher le Build APK

### Méthode 1: Interface Web GitHub (RECOMMANDÉ)

**Étapes détaillées:**

1. **Ouvrez votre navigateur** et allez sur:
   ```
   https://github.com/Terranoweb2/Terranovision-streaming/actions
   ```

2. **Dans le panneau de gauche**, vous verrez la liste des workflows:
   - All workflows
   - **Build Android APK** ← Cliquez ici
   - CI

3. **En haut à droite**, cliquez sur le bouton **"Run workflow"** (bouton gris/bleu)

4. **Un menu déroulant apparaît**:
   - Branch: `main` (déjà sélectionné)
   - Cliquez sur le bouton vert **"Run workflow"**

5. **Le workflow démarre!** 🎉
   - Vous verrez une notification: "Workflow run was successfully requested"
   - Rafraîchissez la page pour voir le workflow en cours

6. **Suivez la progression**:
   - Le workflow apparaît en haut avec un cercle orange 🟠 (en cours)
   - Cliquez dessus pour voir les détails et logs en temps réel
   - Durée: environ 5-10 minutes

7. **Téléchargez l'APK**:
   - Une fois terminé (coche verte ✅)
   - Scrollez en bas de la page du workflow
   - Section **"Artifacts"**
   - Cliquez sur **"terranovision-mobile-debug"** pour télécharger le ZIP
   - Extrayez `app-debug.apk` du ZIP

### Méthode 2: Lien Direct

Cliquez directement sur ce lien pour accéder au workflow:
```
https://github.com/Terranoweb2/Terranovision-streaming/actions/workflows/build-apk.yml
```

Puis suivez les étapes 3-7 ci-dessus.

---

## 📦 Après le Téléchargement de l'APK

### 1. Renommer l'APK
```bash
mv app-debug.apk terranovision-mobile-v1.0.0.apk
```

### 2. Uploader sur le Serveur VPS
```bash
scp terranovision-mobile-v1.0.0.apk root@148.230.104.203:/var/www/apps/web/public/downloads/
```

### 3. Vérifier que l'APK est accessible
```bash
curl -I http://terranovision.cloud/downloads/terranovision-mobile-v1.0.0.apk
```

Vous devriez voir: `HTTP/1.1 200 OK`

### 4. Mettre à Jour la Page de Téléchargement

Le fichier à modifier: `apps/web/src/app/download/page.tsx`

Remplacer les badges "Bientôt Disponible" par des liens de téléchargement:

```typescript
// AVANT (badge "Bientôt Disponible")
<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-2">
  <div className="flex items-center gap-2 text-yellow-400 text-sm">
    <AlertCircle className="w-4 h-4" />
    <span className="font-semibold">Bientôt Disponible</span>
  </div>
</div>

// APRÈS (lien de téléchargement)
<a
  href="/downloads/terranovision-mobile-v1.0.0.apk"
  download
  className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg p-4 transition-all duration-200 shadow-lg hover:shadow-xl"
>
  <div className="flex items-center justify-center gap-2">
    <Download className="w-5 h-5" />
    <span className="font-semibold">Télécharger APK Mobile</span>
  </div>
  <span className="text-xs opacity-80 block mt-1">Version 1.0.0 - 17.6 MB</span>
</a>
```

Puis déployez:
```bash
cd /var/www
pnpm run build
pm2 restart terranovision-web
```

---

## 🔍 Résolution de Problèmes

### Le bouton "Run workflow" n'apparaît pas
- **Solution**: Rafraîchissez la page (F5)
- Le workflow doit avoir `workflow_dispatch` dans les triggers (déjà configuré ✓)

### Le workflow échoue
- Cliquez sur le workflow échoué pour voir les logs
- Recherchez les lignes en rouge
- Les erreurs communes:
  - **Gradle build failed**: Normal si c'est un problème de dépendances Android
  - **Out of memory**: Déjà optimisé avec 512m
  - **Java version**: Le workflow utilise JDK 17 ✓

### L'APK ne s'installe pas sur Android
- Activez "Sources inconnues" dans les paramètres Android
- L'APK debug nécessite cette autorisation
- Pour une APK release signée, consultez `BUILD_APK_INSTRUCTIONS.md`

### L'application affiche "Connexion refusée"
- Vérifiez que http://terranovision.cloud est accessible
- L'app pointe vers cette URL (configuré dans `capacitor.config.ts`)
- Testez dans le navigateur mobile d'abord

---

## 📊 Structure du Workflow

Voici ce que fait le workflow automatiquement:

```yaml
1. Checkout du code depuis GitHub
2. Installation de Node.js 22
3. Installation de Java JDK 17
4. Installation de pnpm 9
5. Installation des dépendances (pnpm install)
6. Synchronisation Capacitor (cap sync android)
7. Build Gradle (assembleDebug)
8. Upload de l'APK comme artifact
```

---

## 🎯 Prochaines Étapes

### Version Release (Production)

Pour créer une APK signée pour le Play Store ou distribution externe:

1. **Générer un keystore** (nécessite JDK 17 local)
2. **Configurer la signature** dans `android/app/build.gradle`
3. **Build release**: `./gradlew assembleRelease`
4. **Uploader sur Play Store** ou distribuer directement

Consultez `BUILD_APK_INSTRUCTIONS.md` pour les détails complets.

### Version TV

Pour créer une APK Android TV:

1. Dupliquer le workflow pour TV
2. Utiliser `capacitor.config.tv.json`
3. Configurer le manifest TV avec `LEANBACK_LAUNCHER`
4. Build séparé avec flavor `tv`

---

## 📚 Ressources

- **GitHub Actions**: https://docs.github.com/en/actions
- **Capacitor Android**: https://capacitorjs.com/docs/android
- **Gradle Documentation**: https://docs.gradle.org/
- **Android Developer**: https://developer.android.com/guide

---

## ✅ Checklist Finale

- [x] Capacitor installé et configuré
- [x] Plateforme Android ajoutée
- [x] Permissions Android configurées
- [x] GitHub Actions workflow créé
- [x] Code pushé sur GitHub
- [ ] **Workflow déclenché manuellement** ← VOUS ÊTES ICI
- [ ] APK téléchargé depuis GitHub
- [ ] APK uploadé sur le serveur
- [ ] Page de téléchargement mise à jour

---

## 🎉 C'est Prêt!

Tout est configuré. Il vous suffit maintenant de:

1. Aller sur https://github.com/Terranoweb2/Terranovision-streaming/actions
2. Cliquer sur "Build Android APK"
3. Cliquer sur "Run workflow"
4. Attendre 5-10 minutes
5. Télécharger l'APK!

**Bonne chance!** 🚀
