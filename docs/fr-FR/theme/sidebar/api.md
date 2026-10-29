---
tab: API
---

# Navigation latérale : API

## Frontmatter des articles

| Champ | Type | Description |
| --- | --- | --- |
| `title` | `string` | Nom dans la navigation ; par défaut le premier h1, sinon le nom du dossier |
| `icon` | `string` | Icône de l'élément de navigation |
| `badge` | `string` | Badge de l'élément de navigation |
| `order` | `number` | Position dans la catégorie, les plus petites valeurs en premier ; les pages sans ce champ viennent en dernier, triées par nom de dossier |
| `parallel` | `string[]` | Pages parallèles dans le même dossier |
| `tab` | `string` | Titre dans la barre d'onglets ; par défaut le titre de la page |
| `category` | `string` | Seulement pour la page d'accueil d'une langue : la catégorie qu'elle rejoint |

Pour tous les champs du frontmatter, voir [Rédiger des pages](/fr-FR/getting-started/writing/api#frontmatter).

## sidebar

| Champ | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `categories` | `Record<string, AkariSidebarCategory>` | aucune | Catégories de la navigation générée à partir des dossiers. Les clés sont les noms des dossiers de catégorie ; leur ordre est celui du rail |
| `items` | `AkariSidebarItem[] \| Record<string, AkariSidebarItem[]>` | aucune | Navigation écrite à la main ; quand elle est définie, la navigation n'est plus générée à partir des dossiers |
| `width` | `number` | `320` | Largeur de référence du tiroir de navigation, limitée à 240–400 |

Champs de `AkariSidebarCategory` :

| Champ | Type | Description |
| --- | --- | --- |
| `text` | `string` | Nom de la catégorie ; par défaut le nom du dossier |
| `icon` | `string` | Icône dans le rail ; par défaut `category` |
| `collapsed` | `boolean` | Avec `false`, la catégorie est dépliée par défaut dans le tiroir mobile ; elle s'ouvre quand vous allez sur une page qu'elle contient, et reste dans l'état où le lecteur l'a laissée après l'avoir ouverte ou fermée |

Le tiroir de navigation sur ordinateur fait `max(240px, width - 96px)` de large : 240px par défaut, et 304px quand `width` atteint son maximum de 400. Le tiroir mobile utilise directement `width`.

## Navigation écrite à la main {#navigation-written-by-hand}

`sidebar.items` est une liste d'`AkariSidebarItem`. La navigation générée à partir des dossiers a la même structure.

| Champ | Type | Description |
| --- | --- | --- |
| `text` | `string` | Obligatoire. Le texte affiché |
| `link` | `string` | Adresse cible ; les adresses du site commencent par `/` |
| `icon` | `string` | Un nom d'icône enregistrée. Les éléments de premier niveau l'affichent dans le rail et dans le menu de premier niveau du tiroir mobile ; par défaut `category` |
| `badge` | `string` | Badge. Sur un élément de premier niveau, il s'affiche en haut à droite de l'icône du rail ; sur un élément enfant, il s'affiche dans le tiroir |
| `collapsed` | `boolean` | Avec `false`, le groupe est déplié par défaut ; il s'ouvre quand vous allez sur une page qu'il contient ; un groupe que le lecteur a ouvert ou fermé garde cet état quand le tiroir passe à une autre catégorie puis revient |
| `items` | `AkariSidebarItem[]` | Éléments enfants, imbriqués à n'importe quelle profondeur |
| `tabs` | `AkariSidebarItem[]` | Pages parallèles : les pages du groupe deviennent un seul élément de la navigation latérale, qui pointe vers la première page, et une barre d'onglets s'affiche en haut de la page |

```ts
sidebar: {
  items: [
    {
      text: "Styles",
      icon: "style",
      items: [
        { text: "Couleur", link: "/styles/color" },
        {
          text: "Icônes",
          tabs: [
            { text: "Vue d'ensemble", link: "/styles/icons" },
            { text: "Choisir les icônes", link: "/styles/icons/choosing" },
            { text: "Utiliser les icônes", link: "/styles/icons/using" },
          ],
        },
      ],
    },
  ],
},
```

`items` peut aussi être un objet : les clés sont des préfixes de chemin, et les valeurs la navigation affichée sous ces chemins. Le plus long préfixe du chemin courant l'emporte (`/theme/settings` l'emporte sur `/theme/`, et `/` correspond à tous les chemins).

Seuls les éléments de `tabs` qui ont un `link` deviennent des onglets. Si aucun onglet n'a de `link`, l'élément est traité comme un élément de navigation ordinaire.

## Navigation latérale native

Quand il n'y a ni dossier de langue ni `sidebar.items`, le thème lit le `themeConfig.sidebar` de VitePress (dans `.vitepress/config.mts`) et le convertit dans la même structure. `icon`, `badge` et `tabs` sur les éléments natifs sont conservés, et la `base` d'un groupe est ajoutée devant les liens de ses éléments enfants et de ses onglets.

```ts
export default defineConfig({
  themeConfig: {
    sidebar: {
      "/theme/": [
        {
          text: "Thème",
          items: [
            { text: "Mise en page et barre d'application", link: "/theme/layout", icon: "view_quilt" },
            { text: "Étendre le thème", link: "/theme/extending", badge: "Extension" },
          ],
        },
      ],
    },
  },
});
```

## Variables CSS de la barre d'onglets {#tab-bar-css-variables}

| Variable | Par défaut | Effet |
| --- | --- | --- |
| `--akari-app-bar-tabs-gap` | `24px` | Une fois la barre d'onglets ancrée dans la barre d'application, l'espace entre elle et le titre, et entre elle et les boutons de droite |
| `--akari-page-tabs-docked-max-width` | `none` | Largeur maximale de la barre d'onglets une fois ancrée dans la barre d'application ; si elle est définie, la barre d'onglets est centrée dans l'espace libre |

## useSidebar

```ts
import { useSidebar } from "@theme";

const { items, prevNext, tabGroup, isActive, hasActive } = useSidebar();
```

| Valeur renvoyée | Type | Description |
| --- | --- | --- |
| `items` | `ComputedRef<AkariSidebarItem[]>` | Arbre de navigation de la page courante |
| `prevNext` | `ComputedRef<{ prev?, next? }>` | Page précédente et page suivante dans le groupe parallèle de la page courante ; absentes aux deux extrémités du groupe et hors de tout groupe |
| `tabGroup` | `ComputedRef<AkariSidebarItem \| undefined>` | Groupe de pages parallèles auquel appartient la page courante |
| `isActive(link)` | `(link?: string) => boolean` | Indique si cette adresse est la page courante |
| `hasActive(item)` | `(item: AkariSidebarItem) => boolean` | Indique si cet élément, ou l'un de ses éléments enfants ou de ses onglets, est la page courante |

Ne l'appelez que depuis des composants situés dans la mise en page.

## Icônes

Les icônes utilisées dans la navigation doivent d'abord être enregistrées dans `docs/.vitepress/theme/icons.ts`. Voir [Utiliser les icônes](/fr-FR/styles/icons/using). Les icônes non enregistrées s'affichent vides.
