# 🚀 Déploiement du Stream Gateway sur Render.com

Ce guide explique comment déployer le service `stream-gateway` sur Render.com pour résoudre les problèmes de streaming sur Netlify.

## 🎯 Problème

Netlify est une plateforme statique qui ne peut pas:
- ❌ Proxifier les streams vidéo en continu (limite 10 secondes)
- ❌ Charger des ressources HTTP depuis un site HTTPS (Mixed Content)
- ❌ Gérer les connexions persistantes pour le streaming

**Solution**: Déployer le `stream-gateway` sur Render.com (Node.js persistant)

## 📋 Étapes de déploiement

### 1. Créer un compte Render.com

1. Allez sur https://render.com
2. Créez un compte (gratuit)
3. Connectez votre dépôt GitHub `Terranovision-streaming`

### 2. Créer un nouveau Web Service

1. Dans le dashboard Render → **New** → **Web Service**
2. Sélectionnez votre repo GitHub
3. Configurez comme suit:

```yaml
Name: terranovision-stream-gateway
Region: Frankfurt (ou le plus proche de vos utilisateurs)
Branch: main
Root Directory: (laisser vide)
Runtime: Node
Build Command: cd services/stream-gateway && npm install && npm run build
Start Command: cd services/stream-gateway && npm start
Instance Type: Free
```

### 3. Variables d'environnement

Dans **Environment** → **Add Environment Variable**, ajoutez:

```
NODE_ENV=production
PORT=4001
XTREAM_BASE_URL=http://line.l-ion.xyz
XTREAM_USERNAME=CanaL-IPTV
XTREAM_PASSWORD=63KQ5913
CORS_ORIGIN=https://terranovision-streaming.netlify.app
LOG_LEVEL=info
```

### 4. Déployer

1. Cliquez sur **Create Web Service**
2. Attendez la fin du déploiement (5-10 minutes)
3. Récupérez l'URL du service (ex: `https://terranovision-stream-gateway.onrender.com`)

### 5. Configurer Netlify

Une fois le gateway déployé, ajoutez la variable d'environnement sur Netlify:

```
NEXT_PUBLIC_STREAM_GATEWAY_URL=https://terranovision-stream-gateway.onrender.com
```

Puis redéployez Netlify.

## 🔧 Architecture finale

```
┌─────────────┐
│   Browser   │
│   (HTTPS)   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Netlify Web    │  ← Frontend Next.js (HTTPS)
│  (Static)       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Render Gateway │  ← Stream Gateway (HTTPS)
│  (Node.js)      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Xtream Server  │  ← Serveur IPTV (HTTP)
│  (HTTP)         │
└─────────────────┘
```

## ✅ Avantages

- ✅ **Pas de limite de temps** (connexions persistantes)
- ✅ **HTTPS → HTTPS** (pas de Mixed Content)
- ✅ **Gratuit** (plan Free de Render)
- ✅ **Auto-deploy** (déploiement automatique à chaque push)
- ✅ **Health checks** (redémarre automatiquement en cas d'erreur)

## 📝 Notes

- Le plan Free de Render **se met en veille après 15 minutes d'inactivité**
- Le premier chargement peut prendre **30-60 secondes** (réveil du service)
- Pour éviter cela, passez au plan **Starter ($7/mois)** avec 0 downtime

## 🐛 Dépannage

### Le service ne démarre pas

Vérifiez les logs dans Render → **Logs**

### Erreur 502 Bad Gateway

Le service n'est pas encore prêt, attendez 30-60 secondes

### CORS Error

Vérifiez que `CORS_ORIGIN` correspond exactement à l'URL Netlify

## 🔄 Alternative: Railway.app

Si Render ne fonctionne pas, vous pouvez utiliser Railway.app:

1. https://railway.app
2. Même configuration que Render
3. Plan gratuit avec $5 de crédit/mois
