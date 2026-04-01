---
url: /fr-FR/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: Terminé en 10 minutes ! Étapes détaillées pour connecter AI Magic Resume aux services d'IA gratuits
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  Ce tutoriel vous guidera pour configurer des services d'IA gratuits comme OpenRouter dans votre AI Magic Resume.

categories:
  - tweets

tags:
  - AI Magic Resume
  - cmdragon
  - Services d'IA gratuits
  - Configurer le service d'IA
  - Clé API
  - Ressources de tutoriel
  - Outils en ligne

---

## Étape 1 : Accéder à AI Magic Resume

Ouvrez le site web AI Magic Resume :  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

Sélectionnez l'option **"Fournisseur d'IA"** dans la barre de navigation gauche.

![Sélectionner le fournisseur d'IA](https://cdn.game-share.store/aBClo3u1L9-mfxakQY_6H.png)

---

## Étape 2 : Obtenir la clé API OpenRouter

### 2.1 Ouvrir le site web OpenRouter (en prenant OpenRouter comme exemple)

Sur la page de configuration du fournisseur d'IA, cliquez sur le bouton **"Obtenir la clé API"**.

![Cliquez pour obtenir la clé API](https://cdn.game-share.store/syW9LMwLw0mBa1zn4p7DI.png)

Le système ouvrira le site officiel OpenRouter dans un nouvel onglet :

![Site officiel OpenRouter](https://cdn.game-share.store/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 S'inscrire/Se connecter

- **Déjà un compte** : Connectez-vous directement
- **Pas encore de compte** : Cliquez pour vous inscrire

> 💡 **Astuce**
> : Si vous ne voulez pas utiliser votre email habituel, vous pouvez utiliser notre [service d'email temporaire](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email (assurez-vous qu'OpenRouter prend en charge les emails temporaires).

![Service d'email temporaire](https://cdn.game-share.store/Dn0WKPCb4GJRJzJTViZMl.png)
![Inscrire un compte](https://cdn.game-share.store/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 Créer une clé API

Après vous être connecté, suivez ce chemin :

1. Cliquez sur **"Settings"** dans la barre de navigation supérieure
2. Sélectionnez **"API Keys"** dans le menu gauche
3. Cliquez sur le bouton **"Create API Key"**

![Page des paramètres](https://cdn.game-share.store/lKVZ6Umc3EkhQRowk7O_E.png)
![Gérer les clés API](https://cdn.game-share.store/B6lzexbzcIwpT6oltMdNr.png)
![Créer une clé API](https://cdn.game-share.store/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 Copier la clé API

- Copiez la chaîne de clé qui commence par `sk-`
- **Important** : Veuillez sauvegarder cette clé en toute sécurité, vous ne pourrez pas revoir la clé complète plus tard

---

## Étape 3 : Configurer AI Magic Resume

Revenez à la page de configuration AI Magic Resume et remplissez les informations suivantes :

| Champ          | Contenu                           |
|-------------|--------------------------------|
| **Clé API** | La clé que vous avez copiée et qui commence par `sk-`              |
| **Nom du fournisseur**   | `openrouter`                   |
| **Point de terminaison API**  | `https://openrouter.ai/api/v1` |
| **ID du modèle**   | Sélectionnez un modèle gratuit (voir l'étape suivante)                   |

![Remplir les informations de configuration](https://cdn.game-share.store/JRme33gZtIKB8x-zxZXw-.png)

---

## Étape 4 : Sélectionner un modèle gratuit

### 4.1 Trouver des modèles gratuits

Sur le site web OpenRouter, entrez **`free`** dans la zone de recherche de modèles pour filtrer tous les modèles gratuits.

![Rechercher des modèles gratuits](https://cdn.game-share.store/EF-1D1wvVhMMWmtGRXD93.png)

![Copier l'ID du modèle](https://cdn.game-share.store/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 Copier l'ID du modèle

Sélectionnez n'importe quel modèle gratuit et copiez son ID complet (format comme : `google/gemma-3-27b-it:free`).

> ⚠️ **Remarque** : Les modèles gratuits ont des limites d'utilisation et ne sont pas illimités.

---

## Étape 5 : Commencer à utiliser

Une fois la configuration terminée, vous pouvez utiliser le modèle d'IA pour modifier votre CV.

![Configuration terminée](https://cdn.game-share.store/ObI005LhshzPDb6w0qG9W.png)
![Modifier le CV](https://cdn.game-share.store/aDU_mXaziu4vj2te6KWvW.png)
![Image](https://cdn.game-share.store/RUmsRZYEV-nY4_oswvgaW.png)
![Affichage des fonctionnalités d'IA](https://cdn.game-share.store/hFDK6Na-Fi7gTL2VyMCva.png)
![Résultats générés](https://cdn.game-share.store/7MEWP09NvTPOC0idG4Pz0.png)

## Étape 6 : Exporter et imprimer le CV

### Exporter le CV en PDF

Cliquez sur le bouton **"Exporter le CV"**, le système générera automatiquement un fichier CV au format PDF standard.

![Exporter le CV](https://cdn.game-share.store/XtOsWjb5TvEadMHFbtgD5.png)

**Méthodes d'exportation** :

- **Exportation serveur** : Générer un fichier PDF directement sur le serveur, assurant un format uniforme et une belle mise en page, prêt à utiliser après téléchargement
  ![Image](https://cdn.game-share.store/80GzYvsfodwhT4jzExPgs.png)
- **Impression navigateur** : Appelle la fonction d'impression native du navigateur, peut se connecter à une imprimante pour sortir des copies papier directement
  ![Image](https://cdn.game-share.store/v5gj00PLvRkg2Px9RKAEe.png)

**Scénarios d'utilisation** :

- 📄 **Version électronique** : Pour soumission en ligne, envoi par email, partage WeChat, etc.
- 🖨️ **Version papier** : Pour les entretiens, les salons de recrutement et autres scénarios hors ligne

**Astuce** : Il est recommandé de prévisualiser l'effet PDF avant la soumission, pour s'assurer que les informations clés comme les coordonnées et l'expérience de projet sont complètes et exactes.

---

## Questions fréquemment posées

### Code d'erreur 429 : Limite de fréquence de requête

Si vous rencontrez l'erreur suivante :

![Limite de fréquence](https://cdn.game-share.store/N8XAuxGLIdlIRaeAjkGMN.png)

```json
{
  "error": {
    "message": "Provider returned Error",
    "code": 429,
    "metadata": {
      "raw": "google/gemma-3-27b-it:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations",
      "provider_name": "Google AI Studio",
      "is_byok": false
    }
  },
  "user_id": "user_2vDtkMeeWdLNDw24VQIEI0SunB3"
}
```

**Signification de l'erreur** : Le modèle gratuit utilisé a atteint la limite de fréquence d'accès.

**Solutions** :

1. **Attendre et réessayer** : La limite pour les modèles gratuits est temporaire, attendez généralement quelques minutes à quelques heures ou même plus.
2. **Changer de modèle** : Essayez d'autres modèles gratuits
3. **Utiliser un modèle payant** : Retirez le suffixe `:free` de l'ID du modèle et utilisez la version payante, nécessite un rechargement
4. **Lier votre propre clé API** : Liez votre propre clé API Google AI Studio dans les paramètres OpenRouter pour utiliser un quota indépendant

---

## Conseils de sécurité

- **La clé API est une information sensible**, veuillez ne pas la partager avec d'autres
- Il est recommandé de sauvegarder la clé API dans un endroit sécurisé (comme un gestionnaire de mots de passe)
- Si vous soupçonnez une fuite de clé, veuillez la supprimer et la recréer immédiatement dans le backend OpenRouter

---

## Ressources connexes

- [Site officiel OpenRouter](https://openrouter.ai) : https://openrouter.ai
- [Liste des modèles OpenRouter](https://openrouter.ai/models) : https://openrouter.ai/models
- [Service d'email temporaire](https://tools.cmdragon.cn/zh/apps/temp-email) : https://tools.cmdragon.cn/zh/apps/temp-email
- [Générateur de mots de passe](https://tools.cmdragon.cn/zh/apps/password-generator) : https://tools.cmdragon.cn/zh/apps/password-generator
- [Adresse de parrainage](https://tools.cmdragon.cn/zh/sponsor) : https://tools.cmdragon.cn/zh/sponsor
- [Contactez-nous](mailto:contact@cmdragon.cn) : mailto:contact@cmdragon.cn

---

**Tutoriel terminé !** Vous pouvez maintenant utiliser le modèle d'IA configuré pour optimiser et modifier votre CV.
