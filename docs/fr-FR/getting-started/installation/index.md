---
icon: package_2
order: 1
---

# Installation

Vitepress Theme Akari Docs est un dépôt modèle GitHub. Créez votre propre dépôt à partir de lui pour obtenir le code source du thème, la configuration et les pages d'exemple ; il n'y a pas de paquet de thème séparé à installer.

## Créer un dépôt à partir du modèle

1. Ouvrez [OasisAkari/vitepress-theme-akari-docs](https://github.com/OasisAkari/vitepress-theme-akari-docs) et cliquez sur **Use this template** → **Create a new repository**.
2. Renseignez le nom et la visibilité du dépôt, puis créez-le. Le nouveau dépôt contient tous les fichiers du modèle, son historique de commits repart de zéro et ce n'est pas un fork du modèle.
3. Clonez-le, installez les dépendances et démarrez :

   ```bash
   git clone https://github.com/<compte>/<dépôt>.git
   cd <dépôt>
   npm install
   npm run dev
   ```

La CLI GitHub le crée et le clone en une seule étape :

```bash
gh repo create my-docs --template OasisAkari/vitepress-theme-akari-docs --public --clone
```

## Prérequis

- Node.js `>=22.12.0` (le champ `engines` de `package.json`). Le modèle est vérifié avec Node.js `24.21.0` et npm `12.2.1`.
- npm. Le dépôt ne contient qu'un seul `package-lock.json` ; en intégration continue, installez à partir de ce fichier avec `npm ci`.

## Commandes

Le serveur de développement tourne par défaut sur `http://localhost:5173`.

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement. Les modifications du Markdown s'appliquent immédiatement ; modifier un `config.ts` le redémarre |
| `npm run build` | Génère le site statique dans `docs/.vitepress/dist` |
| `npm run preview` | Prévisualise le build en local |
| `npm run typecheck` | Vérifie le thème et les tests avec `vue-tsc --noEmit` |
| `npm test` | Lance les tests unitaires Vitest |

## Faire de ce modèle votre site

- Le nom du site, la version, les liens sociaux et le pied de page se trouvent dans `docs/config.ts` et dans le `config.ts` de chaque langue ; voir [Configuration](/fr-FR/getting-started/configuration).
- Le logo est `docs/public/logo.svg`.
- Les dossiers de langue contiennent la documentation de ce site. Gardez les langues dont vous avez besoin, supprimez les autres dossiers et écrivez vos propres pages dans ceux qui restent ; voir [Rédiger des pages](/fr-FR/getting-started/writing).

## Récupérer les mises à jour du modèle

Un dépôt créé à partir du modèle n'a aucun lien avec lui : les mises à jour ultérieures du modèle n'arrivent donc pas toutes seules. Quand vous les voulez, ajoutez le modèle comme dépôt distant et récupérez `docs/.vitepress`, où se trouve le thème :

```bash
git remote add template https://github.com/OasisAkari/vitepress-theme-akari-docs.git
git fetch template
git checkout template/main -- docs/.vitepress
```

Cela remplace le dossier par la version du modèle ; les modifications que vous avez apportées au thème doivent donc être fusionnées à nouveau. Comparez aussi les dépendances de `package.json`.

## Versions de référence

| Dépendance | Version | Remarques |
| --- | --- | --- |
| `vitepress` | `2.0.0-alpha.21` | Version figée ; repose sur Vite 8 / Rolldown et Vue 3.5 |
| `@m3e/web` | `2.10.3` | Web Components Material 3 Expressive |
| `@m3e/icons` | `1.0.21` | Icônes Material Symbols, enregistrées à la demande |

VitePress est encore en alpha. Quand vous le mettez à jour, vérifiez ensemble le code du thème, les types de configuration et le résultat du build.

## Organisation des dossiers

```text
.
├── docs/
│   ├── config.ts                  configuration partagée par toutes les langues
│   ├── en-US/                     anglais, à la racine du site
│   │   ├── config.ts              remplace la configuration partagée
│   │   ├── index.md               page d'accueil
│   │   └── getting-started/       catégorie du rail
│   │       └── installation/
│   │           └── index.md       article /getting-started/installation.html
│   ├── zh-CN/                     chinois simplifié, sous /zh-CN/
│   ├── public/                    ressources statiques
│   └── .vitepress/
│       ├── config.mts             branche le thème sur VitePress
│       ├── content/               langues, chemins et navigation tirés des dossiers
│       └── theme/                 code source du thème
├── tests/                         tests unitaires
└── package.json
```

Pour savoir où placer les pages et la configuration, voir [Configuration](/fr-FR/getting-started/configuration) et [Rédiger des pages](/fr-FR/getting-started/writing). Pour la structure du code source du thème, voir [Étendre le thème](/fr-FR/theme/extending/api#source-layout).

## Déploiement {#deployment}

`npm run build` produit de simples fichiers statiques, que n'importe quel hébergeur statique peut servir.

- **Chemins de page** : ce site désactive `cleanUrls`, donc les chemins de page se terminent par `.html` (`/theme/layout.html`) et correspondent un à un aux fichiers du résultat du build ; n'importe quel hébergeur statique les sert tels quels. Pour des chemins sans extension, définissez `cleanUrls: true` dans `.vitepress/config.mts`. L'hébergeur doit alors réessayer en ajoutant `.html` quand un fichier est introuvable. GitHub Pages, Netlify et Cloudflare Pages le font par défaut ; Vercel a besoin de `"cleanUrls": true` dans `vercel.json` ; pour Nginx, écrivez `try_files $uri $uri.html $uri/ =404;`.
- **Sous un sous-chemin** : par exemple `https://example.com/docs/`, définissez `base: "/docs/"` dans `.vitepress/config.mts`. Il est ajouté automatiquement aux chemins internes de la navigation, du hero, du logo et de l'index de recherche.
- **Index de recherche** : l'index de chaque langue est regroupé dans `assets/chunks/` de la sortie au moment du build. Aucune étape supplémentaire n'est nécessaire.

## Questions fréquentes

### Page blanche, ou composants sans styles

Le thème enregistre les composants m3e dans le navigateur, puis ajoute `data-akari-ready` à `html` une fois qu'ils sont enregistrés. Commencez par chercher des erreurs de chargement de modules dans la console du navigateur. Quand les scripts sont désactivés ou ne se chargent pas, le contenu s'affiche en HTML simple au bout de 3 secondes. Le navigateur doit prendre en charge les Custom Elements, le Shadow DOM et les modules ES natifs.

### Pourquoi les composants ne sont enregistrés que dans le navigateur

Les composants m3e sont des éléments personnalisés Lit. Leur enregistrement nécessite `customElements.define`, que Node.js ne possède pas. L'entrée du thème n'importe `m3e.ts` que dans le navigateur, et le rendu côté serveur ne produit que les balises des éléments et le contenu de leurs slots. N'importez pas les modules de composants de `@m3e/web` dans du code exécuté sur le serveur.

### Un nouveau composant ou une nouvelle icône ne s'affiche pas

Les composants comme les icônes sont enregistrés à la demande. Pour un composant, importez son sous-chemin dans `docs/.vitepress/theme/m3e.ts` (n'importez pas `@m3e/web/all`, qui enregistre tous les composants). Pour une icône, importez-la dans `icons.ts`. Une icône non enregistrée s'affiche vide.

### Le build signale un composant Vue inconnu

`.vitepress/config.mts` laisse passer les balises qui commencent par `m3e-` grâce à `vue.template.compilerOptions.isCustomElement`. Conservez ce réglage si vous réutilisez le thème dans un autre projet.
