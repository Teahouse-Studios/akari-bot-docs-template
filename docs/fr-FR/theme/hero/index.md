---
title: Hero
hero:
  image:
    light: /hero/theme-hero.svg
    dark: /hero/theme-hero-dark.svg
    alt: L'interface du thème de documentation dans une fenêtre d'ordinateur et sur un téléphone
  date: 2026-10-28
  tagline: Placez une image dans le frontmatter, et le titre, la date et le résumé de la page s'affichent à côté, en haut de la page.
  fit: contain
icon: image
order: 2
tab: Vue d'ensemble
parallel:
  - api
  - details
---

# Hero

Comme sur le [blog Material Design](https://m3.material.io/blog), une page peut avoir une image hero : deux cartes côte à côte en haut de la surface du document, avec la date, le titre et le résumé à gauche, et l'image à droite. Le haut de cette page en est un exemple.

## Ajouter un hero

Écrivez `hero` dans le frontmatter de la page :

```yaml
---
title: Les nouveautés de Google I/O 2026
hero:
  image: /hero/io-2026.png
  alt: Les nouveaux composants sur un téléphone et une tablette
  date: 2026-05-19
  tagline: Les dernières mises à jour de Material facilitent la création de produits expressifs et adaptatifs
---
```

Si vous n'avez besoin que de l'image, utilisez la forme courte :

```yaml
hero: /hero/io-2026.png
```

Le titre de la page s'affiche dans la carte hero, et le titre de niveau 1 au début du contenu est masqué.

## Image pour le mode sombre

Pour fournir une image distincte en mode sombre, écrivez `light` et `dark` :

```yaml
hero:
  image:
    light: /hero/io-2026.png
    dark: /hero/io-2026-dark.png
    alt: Les nouveaux composants sur un téléphone et une tablette
```

L'image change dès que vous passez du mode clair au mode sombre ou inversement, et l'image qui n'est pas affichée n'est pas téléchargée.

## Couleur

Une page avec un hero prend une couleur de l'image comme couleur source du thème : la barre d'application, la navigation, les boutons et les liens adoptent une palette assortie à l'image. L'extraction a lieu au build, une fois pour l'image claire et une fois pour l'image sombre ; la page n'a plus besoin de lire l'image à l'ouverture. Quand vous quittez la page, la couleur du lecteur revient. Écrivez `color: "#3367d6"` pour fixer la couleur, ou `color: false` pour garder celle du lecteur.

## Images transparentes et motifs

Les illustrations sur fond transparent vont bien avec `fit: contain` : l'image s'affiche en entier, avec une marge à l'intérieur de la carte. Les deux cartes portent un motif très discret, et quand le pointeur s'arrête sur une carte, une douce lueur s'allume autour de lui. Le motif apparaît aussi derrière les images transparentes. Choisissez le motif avec `pattern`, ou écrivez `none` pour le désactiver.

Pour tous les champs, voir l'[API](/fr-FR/theme/hero/api). Pour le fonctionnement de l'extraction de la couleur, de la mise en page et des motifs, voir les [Détails](/fr-FR/theme/hero/details).
