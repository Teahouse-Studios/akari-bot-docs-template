---
tab: API
---

# Hero : API

## hero

`hero` dans le frontmatter de la page. Écrit sous forme de chaîne, c'est l'URL de l'image.

| Champ | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `image` | `string \| { src, alt? } \| { light, dark, alt? }` | Obligatoire | URL de l'image ; `base` est ajouté automatiquement aux chemins du site, et les URL externes sont utilisées telles quelles. Sous la forme `{ light, dark }`, les deux images servent en mode clair et en mode sombre |
| `alt` | `string` | `""` | Texte alternatif de l'image ; laissez-le vide pour une image purement décorative |
| `date` | `string \| Date` | Aucune | Affichée au-dessus du titre. Une date comme `2026-05-19` est mise en forme selon la langue de la page et produite dans un `<time datetime="2026-05-19">` ; tout autre texte s'affiche tel quel |
| `tagline` | `string` | La `description` de la page | Résumé d'une ligne sous le titre |
| `background` | `string` | `--md-sys-color-primary-container` | Couleur de fond de la carte d'image ; toute couleur CSS ou tout jeton |
| `fit` | `"cover" \| "contain"` | `"cover"` | `cover` remplit la carte et rogne ce qui dépasse ; `contain` montre toute l'image avec une marge, ce qui convient aux illustrations sur fond transparent |
| `color` | `string \| false` | Tirée de l'image (au build) | Couleur source du thème pour cette page : `#rrggbb` la fixe à cette couleur, `false` garde la couleur choisie par le lecteur dans les paramètres |
| `pattern` | `"dots" \| "grid" \| "plus" \| "diagonal" \| "waves" \| "none" \| "auto"` | `"auto"` | Motif discret de la page : points, grille, signes plus, lignes diagonales, vagues ; `none` n'affiche aucun motif, `auto` en choisit un au hasard à chaque chargement du contenu |

`pattern` s'applique à toute la page : les cartes hero et les éléments du contenu qui ont un fond utilisent le même motif. Les pages sans hero en choisissent aussi un au hasard.

```yaml
hero:
  image:
    light: /hero/theme-hero.svg
    dark: /hero/theme-hero-dark.svg
    alt: L'interface du thème de documentation dans une fenêtre d'ordinateur et sur un téléphone
  date: 2026-10-28
  tagline: Placez une image dans le frontmatter
  fit: contain
  color: "#6750a4"
  pattern: dots
```

## Variables CSS {#css-variables}

| Variable | Par défaut | Rôle |
| --- | --- | --- |
| `--akari-doc-hero-inset` | `8px` | Distance entre les cartes et les bords de la surface, et entre les deux cartes |
| `--akari-doc-hero-text-color` | `--md-sys-color-surface-container` | Couleur de fond de la carte de texte |
| `--akari-doc-hero-media-color` | `--md-sys-color-primary-container` | Couleur de fond par défaut de la carte d'image ; `background` est prioritaire |
| `--akari-pattern-glow` | `4%` | Intensité de la lueur autour du pointeur |
| `--akari-pattern-spot` | `0.1` | Netteté du motif à l'intérieur de la lueur |

Vous pouvez définir les trois premières sur `:root`. Les deux variables des motifs sont définies sur la surface du document `.akari-doc` : redéfinissez-les donc aussi sur `.akari-doc`.

## Remplacer le composant hero

Vous pouvez remplacer le hero par votre propre composant ; voir [Étendre le thème](/fr-FR/theme/extending/api#provideakaricomponents). La mise en page ne rend ce composant que si la page définit un `hero` avec une image, et elle masque le premier `h1` du contenu : un composant personnalisé doit donc rendre lui-même le titre de la page. Donnez au titre l'attribut `data-akari-page-title`, et le changement de titre de la barre d'application le suivra. Dans le composant, lisez le frontmatter avec `useData()` de VitePress. La mise en page donne à l'élément racine du composant la classe `akari-doc__page`, de sorte que, lorsque vous passez d'une page parallèle à l'autre dans un même groupe, le hero glisse latéralement avec le contenu, alors qu'un composant à plusieurs nœuds racines ne reçoit pas cette classe et que son hero reste en place.
