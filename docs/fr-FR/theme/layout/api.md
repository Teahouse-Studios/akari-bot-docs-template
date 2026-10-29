---
tab: API
---

# Mise en page et barre d'application : API

## appBar

| Champ | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `title` | `string` | `title` du site | Nom du site dans la barre d'application |
| `version` | `string` | Aucune | Étiquette de version à côté du nom, comme `v1.0.0` |
| `logo` | `string` | `logo` de la configuration | Image de marque ; `base` est ajouté automatiquement aux chemins du site |
| `showSidebarToggle` | `boolean` | `true` | Afficher ou non le bouton de menu qui ouvre le tiroir de navigation sur écran étroit |
| `showSettingsToggle` | `boolean` | `true` | Afficher ou non le bouton des paramètres ; toujours masqué quand `settings.enabled` vaut `false` |
| `socialLinks` | `AkariSocialLink[]` | `[]` | Liens sociaux, ouverts dans un nouvel onglet |

Champs de `AkariSocialLink` :

| Champ | Type | Description |
| --- | --- | --- |
| `icon` | `string` | `github` et `npm` affichent des logos de marque intégrés ; toute autre valeur sert de nom d'une icône m3e enregistrée |
| `link` | `string` | URL |
| `label` | `string` | Nom accessible et texte de l'infobulle du bouton, ainsi que son texte dans le menu « Plus » |

## toc

| Champ | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Afficher ou non la table des matières (celle de droite et le bouton de table des matières sur écran étroit) |
| `maxDepth` | `number` | `3` | Liste les titres de `h2` à `h{maxDepth}` ; ramené entre 1 et 6 |
| `overline` | `string` | Selon la langue ; « Sur cette page » | Petit titre en haut de la table des matières, et nom accessible de la navigation de la table des matières |

Pour désactiver la table des matières sur une seule page, écrivez `toc: false` dans son frontmatter. Les titres qui portent l'attribut `m3e-toc-ignore` sont exclus de la table des matières.

## loadingBar

| Champ | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Afficher ou non une barre de progression en haut de la fenêtre pendant le chargement d'une page |

## footer

| Champ | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `message` | `string` | Selon la langue | Texte sous le logo et le nom du site dans le pied de page |
| `copyright` | `string` | `""` | Mention de copyright en bas du pied de page ; non affichée si elle est vide |
| `showPrevNext` | `boolean` | `true` | Afficher ou non les cartes de page précédente et de page suivante du groupe à la fin du contenu des pages parallèles |
| `links` | `AkariFooterLinkGroup[] \| false` | Tirées de la navigation | Colonnes de liens du pied de page ; par défaut, les quatre premières catégories de la navigation, avec six éléments au plus par colonne ; `false` les masque |

```ts
footer: {
  links: [
    {
      title: "Ressources",
      items: [
        { text: "GitHub", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs" },
        { text: "Journal des modifications", link: "/changelog" },
      ],
    },
  ],
},
```

Les liens externes s'ouvrent dans un nouvel onglet. Un groupe de pages parallèles devient un seul élément dans les colonnes de liens.

## Variables CSS {#css-variables}

Redéfinissez-les dans les styles de votre site, par exemple sur `:root` :

| Variable | Par défaut | Rôle |
| --- | --- | --- |
| `--akari-doc-radius` | `28px` | Rayon des coins de la surface du document et de la surface du pied de page |
| `--akari-doc-padding` | `32px` | Marge intérieure des surfaces, et espace entre le contenu et la table des matières |
| `--akari-doc-top-space` | `32px` | Distance entre la surface du document et la barre d'application |
| `--akari-doc-max-width` | `1280px` | Largeur maximale du contenu et de la table des matières dans la surface ; le contenu du pied de page utilise la même largeur |
| `--akari-doc-text-measure` | `760px` | Longueur de ligne maximale des paragraphes, des listes, des citations et des encadrés |
| `--akari-doc-text-offset` | `22px` | Retrait des paragraphes par rapport aux titres |
| `--akari-doc-toc-offset` | `128px` | Distance sous la barre d'application à laquelle la table des matières reste fixée |
| `--akari-toc-width` | `208px` | Largeur de la table des matières |
| `--akari-doc-gap` | `16px` | Distance entre un titre et la barre d'application après un saut vers une ancre |
| `--akari-doc-surface-color` | `--md-sys-color-surface` | Couleur de fond de la surface du document et de la surface du pied de page ; définissez-la à l'intérieur de `m3e-theme` (par exemple sur `.akari-main`) pour que les jetons de couleur soient résolus |
| `--akari-doc-divider-strength` | `30%` | Intensité du séparateur du rail et du contour de la surface après défilement |
| `--akari-wavy-divider-color` | `--md-sys-color-outline-variant` | Couleur du séparateur ondulé au-dessus du pied de page |
| `--akari-doc-app-bar-height` | `64px` | Hauteur de la barre d'application ; en lecture seule, sert à calculer les positions collantes |
| `--akari-doc-rail-width` | `96px` | Largeur du rail ; en lecture seule |
| `--akari-loading-bar-height` | `4px` | Hauteur de la barre de chargement |
| `--akari-loading-bar-color` | `--md-sys-color-primary` | Couleur de la barre de chargement |

```css
:root {
  --akari-doc-radius: 24px;
  --akari-doc-max-width: 1440px;
}

.akari-main {
  --akari-doc-surface-color: var(--md-sys-color-surface-container-lowest);
}
```

## État de la page

| Marqueur | Où | Signification |
| --- | --- | --- |
| `data-akari-ready` | `html` | Les composants m3e ont fini de s'enregistrer |
| `data-akari-scrolled` | `html` | La surface du document est passée sous la barre d'application |
| `akari-tabs-pinned` | Nom de classe sur `html` | La barre d'onglets des pages parallèles reste sous la barre d'application |
| `data-akari-page-title` | Élément | Le titre de page que suit le changement de titre de la barre d'application ; par défaut, le `h1` du contenu ou le titre du hero |

| id d'élément | Contenu |
| --- | --- |
| `akari-doc-content` | Conteneur de contenu, dans lequel la table des matières lit ses titres ; l'export `AKARI_CONTENT_ID` |
| `akari-sidebar` | Tiroir de navigation mobile ; `AKARI_SIDEBAR_ID` |
| `akari-settings` | Panneau des paramètres ; `AKARI_SETTINGS_ID` |

## Remplacer des composants

Vous pouvez remplacer la barre d'application, la navigation sur ordinateur, le tiroir mobile, le hero, la table des matières, les cartes de pagination, le pied de page et le conteneur de contenu ; voir [Étendre le thème](/fr-FR/theme/extending/api#provideakaricomponents).
