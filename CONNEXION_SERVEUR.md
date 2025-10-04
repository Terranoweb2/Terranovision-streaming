# 🔧 Guide de Connexion Serveur - Résolution Problèmes

## ⚠️ Erreur: "REMOTE HOST IDENTIFICATION HAS CHANGED"

### Pourquoi cette erreur?
Le serveur a une nouvelle clé SSH (réinstallation ou changement). C'est normal après une nouvelle installation.

### ✅ Solution: Supprimer l'ancienne clé

**Étape 1: Ouvrir PowerShell en tant qu'Administrateur**
- Clic droit sur l'icône Windows → "Windows Terminal (Admin)"

**Étape 2: Supprimer l'ancienne clé du serveur**

```powershell
# Remplacez 148.230.104.203 par votre IP
ssh-keygen -R 148.230.104.203
```

**Étape 3: Réessayer la connexion**

```powershell
ssh root@148.230.104.203
```

Tapez `yes` quand demandé: "Are you sure you want to continue connecting?"

### Si l'erreur persiste

Supprimez manuellement le fichier known_hosts:

```powershell
del $env:USERPROFILE\.ssh\known_hosts
```

Puis reconnectez-vous:

```powershell
ssh root@148.230.104.203
```

---

## 🚀 Une fois connecté

Vous verrez un prompt comme: `root@vps:~#`

### Étape suivante: Configuration automatique

```bash
# 1. Télécharger le script de setup
curl -o setup-server.sh https://raw.githubusercontent.com/votre-repo/terranovision/main/setup-server.sh

# OU si pas de repo GitHub encore, créez le fichier:
nano setup-server.sh
# Copiez le contenu du fichier setup-server.sh
# Ctrl+X, puis Y, puis Enter pour sauvegarder

# 2. Rendre exécutable
chmod +x setup-server.sh

# 3. Exécuter
./setup-server.sh
```

Le script va installer automatiquement tous les outils nécessaires.
