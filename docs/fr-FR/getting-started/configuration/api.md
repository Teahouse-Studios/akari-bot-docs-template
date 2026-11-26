---
tab: API
---

# Configuration : API

## defineAkariConfig

```ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

function defineAkariConfig(config: AkariSiteConfig): AkariDirectoryConfig;
```

Les deux niveaux de fichiers de configuration exportent leur configuration avec cette fonction. Les champs de VitePress restent tels quels. Les champs du thème sont déplacés sous le `themeConfig.akari` que lit VitePress, et bénéficient de l'aide au typage. Les types sont définis dans `docs/.vitepress/theme/types.ts`.

## Site et langue

| Champ | Type | Défaut | Description |
| --- | --- | --- | --- |
| `rootLanguage` | `string` | Le premier dossier de langue par ordre alphabétique | Ne s'applique que dans la configuration partagée : le dossier de langue servi à la racine du site. Les chemins des autres langues commencent par le nom de leur dossier |
| `lang` | `string` | Le nom du dossier de langue | Code de langue. Sert pour `<html lang>` et détermine le [pack de langue](/fr-FR/theme/i18n/api#akarilanguage) |
| `label` | `string` | Le nom de la langue dans sa propre langue | Nom dans le menu des langues |
| `dir` | `"ltr" \| "rtl" \| "auto"` | Celui du pack de langue | Sens du texte |
| `title` | `string` | Aucun | Titre du site ; c'est aussi le titre par défaut de la barre d'application |
| `titleTemplate` | `string \| boolean` | Aucun | Suffixe ou modèle des titres de page, comme dans VitePress |
| `description` | `string` | Aucun | Description du site |
| `head` | `HeadConfig[]` | `[]` | Balises `<head>` supplémentaires, fusionnées avec le niveau supérieur |
| `logo` | `string` | Aucun | Image de marque dans la barre d'application et le pied de page |
| `markdown` | `MarkdownLocaleOptions` | Celui du pack de langue | Les textes de la langue dans le Markdown, comme l'info-bulle du bouton de copie des blocs de code, appliqués par-dessus ceux du pack de langue |
| `images` | `AkariImagesConfig` | Aucune | Ce qu'un build fait des images du site : `webp` convertit chaque image matricielle pointée par les pages construites et fait pointer les pages vers le fichier WebP |

`lang`, `label`, `dir` et `markdown` décrivent une langue et vont dans la configuration de langue. Tous les autres champs peuvent aller dans la configuration partagée comme valeur par défaut, et une configuration de langue peut les remplacer.

## Champs du thème

| Champ | Contenu | Voir |
| --- | --- | --- |
| `appBar` | Titre, version, logo, boutons et liens sociaux de la barre d'application | [Mise en page et barre d'application](/fr-FR/theme/layout/api#appbar) |
| `toc` | Table des matières à droite | [Mise en page et barre d'application](/fr-FR/theme/layout/api#toc) |
| `loadingBar` | La barre en haut de la fenêtre pendant le chargement d'une page | [Mise en page et barre d'application](/fr-FR/theme/layout/api#loadingbar) |
| `footer` | Cartes de pagination et pied de page | [Mise en page et barre d'application](/fr-FR/theme/layout/api#footer) |
| `sidebar` | Catégories, navigation écrite à la main et largeur du tiroir | [Navigation latérale](/fr-FR/theme/sidebar/api#sidebar) |
| `settings` | Boîte de dialogue des paramètres et bouton d'apparence | [Paramètres et apparence](/fr-FR/theme/settings/api#settings) |
| `search` | Point d'entrée et backends de la recherche | [Recherche](/fr-FR/theme/search/api#search) |
| `messages` | Textes de l'interface | [Internationalisation](/fr-FR/theme/i18n/api#messages) |
| `fonts` | Chargement ou non des polices depuis Google Fonts, et pile de polices | [Typographie](/fr-FR/styles/typography/api#fonts) |
| `languages` | Packs de langue en plus des packs intégrés, ou modifications de ceux-ci | [Internationalisation](/fr-FR/theme/i18n/api#akarilanguage) |

Le remplacement des composants de l'interface ne se fait pas dans les fichiers de configuration ; voir [Étendre le thème](/fr-FR/theme/extending/api#provideakaricomponents).

## .vitepress/config.mts

La partie qui branche le thème sur VitePress. Vous aurez rarement besoin de la modifier :

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { akariContent } from "./content";
import { akariHead } from "./theme/head";
import { akariMarkdown } from "./theme/markdown";

const docsDir = fileURLToPath(new URL("../", import.meta.url));
const content = await akariContent(docsDir);

export default defineConfig({
  ...content.site,
  cleanUrls: false,
  appearance: false,
  head: akariHead(),
  markdown: { config: (md) => akariMarkdown(md) },
  vue: {
    template: {
      compilerOptions: { isCustomElement: (tag) => tag.startsWith("m3e-") },
    },
  },
  vite: {
    plugins: [content.plugin],
  },
});
```

| Option | Rôle |
| --- | --- |
| `...content.site` | `locales`, `rewrites` et les `lang`, `title`, `description` du site, générés à partir des dossiers ; avec la recherche locale, aussi `themeConfig.search`, qui active l'index de recherche local de VitePress |
| `cleanUrls: false` | Les chemins de page se terminent par `.html` et correspondent un à un aux fichiers du résultat du build ; avec `true`, ils n'ont pas d'extension, voir [Installation](/fr-FR/getting-started/installation#deployment) pour les exigences d'hébergement |
| `appearance: false` | Désactive le sélecteur clair/sombre intégré à VitePress ; c'est le thème qui s'en charge |
| `head: akariHead()` | Un script qui applique le mode clair ou sombre avant la première image affichée |
| `akariMarkdown` | Bordures M3 pour les tableaux et dimensions des images distantes |
| `isCustomElement` | Indique à Vue de traiter `m3e-*` comme des éléments personnalisés |
| `content.plugin` | En développement, met à jour la navigation quand des fichiers Markdown sont ajoutés ou supprimés et quand le frontmatter change |

## akariContent

```ts
function akariContent(
  srcDir: string,
  logger?: { warn(message: string): void },
): Promise<AkariContent>;
```

Lit les fichiers de configuration et les dossiers de `srcDir`. `logger` vaut `console` par défaut et reçoit les avertissements, par exemple pour des pages hors de la structure ou des pages parallèles introuvables.

| Champ renvoyé | Type | Description |
| --- | --- | --- |
| `site` | `{ lang, title, description, locales, rewrites }` | À étaler dans `defineConfig` |
| `plugin` | `Plugin` Vite | Met à jour la navigation dans le serveur de développement |
| `route` | `(page: string) => string` | Chemin du fichier source → chemin de la page, par exemple `zh-CN/theme/layout/index.md` → `/zh-CN/theme/layout` |
| `rewrite` | `(page: string) => string` | Chemin du fichier source → chemin servi par VitePress, par exemple `zh-CN/theme/layout/index.md` → `theme/layout.md` |
| `languages` | `{ folder, key, prefix }[]` | Dossiers de langue, langue racine en premier. `key` est la clé de locale VitePress (`root` pour la langue racine) ; `prefix` est le préfixe des chemins |
| `config` | `AkariSiteConfig \| undefined` | La configuration partagée telle que l'écrit `config.ts`, pour ce que le build lit avant qu'une page n'existe, comme `images` |

## akariHead

```ts
function akariHead(options?: {
  storageKey?: string;
  defaultScheme?: "light" | "dark" | "auto" | "time";
}): HeadConfig[];
```

Renvoie un script inline qui applique le mode clair ou sombre avant que la première image ne soit peinte. Les balises `<head>` des polices diffèrent selon la langue : c'est donc `akariContent` qui les écrit dans la locale de chaque langue ; voir [Typographie](/fr-FR/styles/typography/api#fonts). Si vous modifiez `settings.storageKey` ou `settings.defaults.scheme`, passez les mêmes valeurs ici pour que le script lise les mêmes paramètres.

## akariMarkdown

```ts
function akariMarkdown(
  md: MarkdownRenderer,
  options?: { remoteImageSize?: boolean | AkariImageSizeOptions },
): void;
```

Appelez-la dans `markdown.config`. Elle fait deux choses :

- Elle enveloppe chaque tableau Markdown dans `<div class="akari-table">`, ce qui donne au tableau une bordure de contour M3 et un défilement horizontal.
- Elle écrit la largeur et la hauteur des images distantes avec [markdown-it-image-size](https://github.com/boyum/markdown-it-image-size). Pour les images locales, VitePress les écrit lui-même. Voir [Rédiger des pages](/fr-FR/getting-started/writing/api#images).

| Option | Défaut | Description |
| --- | --- | --- |
| `remoteImageSize` | `true` | Avec `false`, les images distantes ne sont pas mesurées. L'option peut aussi contenir les options du plugin, par exemple `{ cacheDir: ".image-size" }` pour garder le cache dans le dépôt, ou `{ cache: false }` pour se passer de cache |
