---
tab: API
---

# Rédiger des pages : API

## Frontmatter {#frontmatter}

| Champ | Type | Utilisé sur | Description |
| --- | --- | --- | --- |
| `title` | `string` | Toutes les pages | Titre de la page, et aussi nom de l'article dans la navigation. Par défaut, le premier titre de niveau 1, puis le nom du dossier |
| `description` | `string` | Toutes les pages | Description de la page, écrite dans `<meta name="description">` ; c'est aussi le résumé par défaut du hero |
| `icon` | `string` | Articles | Icône de l'élément de navigation ; doit être une icône enregistrée |
| `badge` | `string` | Articles | Badge de l'élément de navigation, comme `New` |
| `order` | `number` | Articles | Position dans la catégorie, la plus petite en premier. Les articles sans `order` viennent après, triés par nom de dossier |
| `parallel` | `string[]` | Articles | Pages parallèles : les noms d'autres fichiers `.md` du même dossier (`.md` peut être omis), placés après l'article dans l'ordre de la barre d'onglets |
| `tab` | `string` | Articles et pages parallèles | Titre dans la barre d'onglets ; par défaut, le titre de la page |
| `category` | `string` | Page d'accueil de la langue | La page d'accueil n'est pas dans la navigation par défaut. Donnez-lui le nom de dossier d'une catégorie et elle rejoint cette catégorie, en première position sauf si elle a un `order` |
| `hero` | `string \| object` | Toutes les pages | Le hero en haut de la page ; pour ses champs, voir [Hero](/fr-FR/theme/hero/api) |
| `toc` | `boolean` | Toutes les pages | Avec `false`, masque la table des matières à droite et le bouton de la table des matières sur les écrans étroits |

Un article est le fichier `index.md` d'un dossier situé dans un dossier de catégorie. Les champs de frontmatter de VitePress lui-même (comme `head` et `titleTemplate`) fonctionnent comme d'habitude.

```yaml
---
title: Icônes
description: Les icônes Material Symbols utilisées par le thème
icon: interests
order: 2
badge: New
tab: Vue d'ensemble
parallel:
  - choosing
  - using
hero:
  image: /hero/icons-hero.svg
  fit: contain
---
```

## Tableaux

Syntaxe standard avec des barres verticales. Avec `akariMarkdown` activé, chaque tableau est enveloppé dans un conteneur à bordure de contour M3, et un tableau trop large défile horizontalement à l'intérieur de la bordure.

```md
| Champ | Description |
| --- | --- |
| `title` | Titre de la page |
```

Un `<table>` écrit directement en HTML n'a pas de conteneur extérieur. Le tableau lui-même a le même style.

## Images {#images}

```md
![Description](./image.png)
![Description](/hero/image.svg)
![Description](https://example.com/image.png)
```

Au rendu d'une page, chaque image Markdown reçoit ses propres attributs `width` et `height`. La page réserve la place de l'image avant son chargement, donc rien ne saute une fois qu'elle est chargée. Les images s'adaptent toujours avec `max-width: 100%` et gardent leurs proportions.

| Image | Mesurée par |
| --- | --- |
| Dans le dossier de l'article (`./image.png`) | VitePress, qui lit l'image à côté du fichier source |
| Dans `docs/public` (`/hero/image.svg`) | VitePress |
| Distante (`https://…`) | [markdown-it-image-size](https://github.com/boyum/markdown-it-image-size), ajouté par le thème : il télécharge l'image au rendu de la page pour lire ses dimensions, et les met en cache par URL pendant une semaine (`node_modules/markdown-it-image-size/.cache`) |

- Une image locale qui n'a que `width` ou que `height` reçoit l'autre dimension, calculée proportionnellement. Une image qui a les deux est laissée telle quelle.
- Quand une image distante ne peut pas être téléchargée (hors ligne, URL erronée), le terminal affiche un avertissement, l'image ne reçoit ni largeur ni hauteur, et la page est générée normalement. Le téléchargement est synchrone : le serveur de développement marque donc une courte pause quand il rend une page avec une nouvelle image distante ; ensuite, le cache répond directement.
- Un `<img>` écrit directement en HTML n'est pas mesuré. Écrivez vous-même sa largeur et sa hauteur.
- Vous pouvez désactiver la mesure des images distantes, ou régler son cache, dans `.vitepress/config.mts` ; voir [Configuration](/fr-FR/getting-started/configuration/api#akarimarkdown).

## Liens

Les liens du texte sont précédés d'une icône de la même taille que le texte : `link` pour les liens internes, et `open_in_new` pour les liens qui s'ouvrent dans un nouvel onglet (`target="_blank"`, liens externes compris). Ces liens n'ont pas d'icône : les ancres des titres, les liens qui entourent une image, les appels de note de bas de page, et les liens placés dans un slot de composant (avec un attribut `slot`).

## Conteneurs personnalisés et code

Les conteneurs personnalisés et les groupes de code de VitePress ont tous des styles correspondants dans le thème :

````md
::: tip Astuce
Une remarque facultative.
:::

::: warning
Un point auquel faire attention.
:::

::: code-group

```bash [npm]
npm install
```

```bash [pnpm]
pnpm install
```

:::
````

Les conteneurs personnalisés sont `info`, `tip`, `warning`, `danger` et `details`. Un bloc de code avec un langage reçoit la coloration syntaxique et un bouton de copie. Le texte du bouton de copie et les titres des conteneurs écrits sans titre viennent du `markdown` du pack de langue, et la configuration de langue peut les remplacer.

## Classes utilitaires des démos

| Classe | Rôle |
| --- | --- |
| `demo-surface` | Zone de démo avec un contour et un fond `surface-container-low`, un rayon d'angle et une marge intérieure de 16px |
| `demo-row` | Ligne horizontale qui passe à la ligne, espacement de 12px |
| `demo-grid` | Grille de cartes, chaque colonne d'au moins 240px, une seule colonne sur les écrans étroits |
| `demo-stack` | Pile verticale, espacement de 16px |

```html
<div class="demo-surface">
  <div class="demo-row">
    <m3e-button variant="filled">OK</m3e-button>
    <m3e-button variant="outlined">Annuler</m3e-button>
  </div>
</div>
```

## Composants m3e

Vous pouvez écrire les composants m3e enregistrés directement dans le Markdown. Le thème enregistre ceux-ci dans `docs/.vitepress/theme/m3e.ts` :

`app-bar`, `badge`, `button`, `card`, `checkbox`, `chips`, `content-pane`, `dialog`, `divider`, `drawer-container`, `heading`, `icon`, `icon-button`, `list`, `loading-indicator`, `menu`, `nav-bar`, `nav-menu`, `nav-rail`, `search`, `segmented-button`, `snackbar`, `switch`, `tabs`, `theme`, `tooltip`.

Pour utiliser un autre composant, importez son sous-chemin dans `m3e.ts`, par exemple `import "@m3e/web/slider";`.

- Pour un titre à l'intérieur d'un composant, utilisez `<m3e-heading>`. Avec l'attribut `m3e-toc-ignore`, il n'apparaît pas dans la table des matières.
- Écrivez une icône sous la forme `<m3e-icon name="search"></m3e-icon>`. L'icône doit d'abord être enregistrée dans `icons.ts` ; voir [Utiliser les icônes](/fr-FR/styles/icons/using).
- Un composant muni d'un `href` (bouton, carte, puce, élément de liste, etc.) qui renvoie vers une page du site passe à cette page sur place, comme un lien ordinaire, sans recharger toute la page. Avec `target="_self"`, la page est entièrement rechargée, selon la convention de VitePress. Avec `target="_blank"`, elle s'ouvre dans un nouvel onglet.
