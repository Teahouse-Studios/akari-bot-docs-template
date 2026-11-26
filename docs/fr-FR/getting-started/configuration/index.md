---
icon: tune
order: 2
tab: Vue d'ensemble
parallel:
  - api
  - details
---

# Configuration

La configuration se trouve dans le dossier `docs`, sur deux niveaux :

- `docs/config.ts` : la configuration partagée par toutes les langues.
- `docs/<code de langue>/config.ts` : la configuration d'une langue, par exemple `docs/fr-FR/config.ts`. Un dossier qui contient ce fichier est un dossier de langue.

Un champ d'une configuration de langue remplace le champ du même nom dans la configuration partagée, et les objets sont fusionnés champ par champ : une configuration de langue ne contient donc que ce qui diffère pour cette langue. `docs/.vitepress/config.mts` ne fait que brancher le thème sur VitePress ; vous aurez rarement besoin de le modifier.

```text
docs/
├─ config.ts                 configuration partagée
├─ en-US/                    anglais, à la racine du site
│  ├─ config.ts              configuration de langue
│  └─ …                      pages, voir « Rédiger des pages »
├─ zh-CN/                    chinois simplifié, sous /zh-CN/
│  ├─ config.ts
│  └─ …
└─ .vitepress/config.mts
```

## Configuration partagée

Ce qui est identique dans toutes les langues : la langue racine, le logo, la version et les liens sociaux, les icônes et l'ordre des catégories, les paramètres et la recherche.

```ts
// docs/config.ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

export default defineAkariConfig({
  // Le dossier de langue servi à la racine du site
  rootLanguage: "en-US",
  logo: "/logo.svg",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  appBar: {
    version: "v1.0.0",
    socialLinks: [
      { icon: "github", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs", label: "GitHub" },
    ],
  },
  sidebar: {
    // Noms des dossiers de catégorie et icônes ; l'ordre des clés est l'ordre dans le rail
    categories: {
      "getting-started": { icon: "rocket_launch" },
      theme: { icon: "palette" },
    },
  },
  settings: { storageKey: "akari-docs-settings" },
  search: { maxResults: 8 },
  images: { webp: true },
  footer: { copyright: "Vitepress Theme Akari Docs" },
});
```

## Configuration de langue

Les titres et les textes de la langue sur ce site. `lang` vaut par défaut le nom du dossier, et le thème s'en sert pour choisir le [pack de langue](/fr-FR/theme/i18n#language-packs) : le nom dans le menu des langues, le sens du texte, les textes de l'interface et le texte du bouton de copie des blocs de code viennent tous du pack, et vous les remplacez ici au besoin.

```ts
// docs/fr-FR/config.ts
import { defineAkariConfig } from "../.vitepress/theme/define.ts";

export default defineAkariConfig({
  title: "Vitepress Theme Akari Docs",
  description: "Un thème de documentation construit avec VitePress et M3E Web Components",
  appBar: { title: "Vitepress Theme Akari Docs" },
  sidebar: {
    categories: {
      "getting-started": { text: "Premiers pas" },
      theme: { text: "Thème" },
    },
  },
  footer: { message: "Conçu avec VitePress et M3E Web Components" },
});
```

## Modifications courantes

| Pour | Où l'écrire | Champ |
| --- | --- | --- |
| Changer le nom du site | Configuration de langue | `title`, `appBar.title` |
| Ajouter une version ou des liens sociaux | Configuration partagée | `appBar.version`, `appBar.socialLinks` |
| Changer l'ordre ou les icônes des catégories | Configuration partagée | `sidebar.categories` |
| Renommer une catégorie | Configuration de langue | `sidebar.categories.<folder>.text` |
| Changer la couleur par défaut et le mode clair ou sombre | Configuration partagée | `settings.defaults` |
| Désactiver la recherche ou brancher un backend de recherche | Configuration partagée | `search` |
| Changer le message et le copyright du pied de page | Configuration de langue / configuration partagée | `footer.message`, `footer.copyright` |
| Réécrire les textes de l'interface | Configuration de langue | `messages` |
| Convertir les images du site en WebP | Configuration partagée | `images.webp` |
| Ajouter une langue | Un nouveau dossier de langue | Voir [Internationalisation](/fr-FR/theme/i18n) |

Pour le type et la valeur par défaut de chaque champ, voir [API](/fr-FR/getting-started/configuration/api). Pour la façon dont les configurations se superposent et dont les langues et la navigation sont générées, voir [Détails](/fr-FR/getting-started/configuration/details).
