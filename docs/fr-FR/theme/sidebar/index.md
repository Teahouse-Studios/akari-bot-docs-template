---
icon: view_sidebar
order: 3
tab: Vue d'ensemble
parallel:
  - api
  - details
---

# Navigation latérale

Sur ordinateur, un rail de 96px de large à gauche liste les catégories, et le tiroir de navigation liste les pages de la catégorie courante. Quand la fenêtre fait moins de 960px de large, le bouton de menu de la barre d'application ouvre un tiroir de navigation qui contient toutes les pages.

## Rail et tiroir de navigation

- **Rail** : une icône par catégorie. La catégorie de la page courante apparaît sélectionnée, et son icône devient pleine. Un clic sur une catégorie ouvre sa première page. En bas du rail se trouve le bouton d'apparence, ainsi qu'un bouton de langue quand le site a plusieurs langues.
- **Tiroir de navigation** : à partir de 1600px de large, il reste ouvert à droite du rail. Entre 960 et 1599px, il glisse de sous le rail quand le pointeur s'arrête sur une catégorie, et se rétracte quand le pointeur s'en va. Sur écran tactile, toucher une catégorie l'ouvre ou le ferme.
- **Écrans étroits** : le rail et le tiroir sont masqués. Le bouton de menu ouvre le tiroir de navigation complet, dont le menu de premier niveau correspond aux catégories du rail. Les boutons d'apparence et de langue se trouvent en bas du tiroir.

<div class="demo-surface" style="max-width: 320px;">
  <m3e-nav-menu aria-label="Démo de navigation latérale">
    <m3e-nav-menu-item open>
      <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
      <span slot="label">Premiers pas</span>
      <m3e-nav-menu-item selected>
        <a slot="label" href="/fr-FR/">Vue d'ensemble</a>
      </m3e-nav-menu-item>
      <m3e-nav-menu-item>
        <a slot="label" href="/fr-FR/getting-started/installation.html">Installation</a>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
    <m3e-nav-menu-item>
      <m3e-icon slot="icon" name="palette"></m3e-icon>
      <span slot="label">Thème</span>
      <m3e-nav-menu-item>
        <a slot="label" href="/fr-FR/theme/extending.html">Étendre le thème</a>
        <span slot="badge">Extension</span>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
  </m3e-nav-menu>
</div>

## D'où vient la navigation

La navigation est générée à partir des dossiers du dossier de langue : chaque dossier de catégorie devient une catégorie du rail, et les dossiers d'articles d'une catégorie en sont les pages. Les noms, les icônes et l'ordre se définissent dans le frontmatter de chaque article. Voir [Rédiger des pages](/fr-FR/getting-started/writing).

Les noms et les icônes des catégories se placent dans `sidebar.categories` de la configuration :

```ts
// docs/config.ts
sidebar: {
  categories: {
    "getting-started": { icon: "rocket_launch" },
    theme: { icon: "palette" },
  },
},

// docs/fr-FR/config.ts
sidebar: {
  categories: {
    "getting-started": { text: "Premiers pas" },
    theme: { text: "Thème" },
  },
},
```

Vous pouvez aussi écrire toute la navigation à la main avec `sidebar.items` dans la configuration. Voir l'[API](/fr-FR/theme/sidebar/api#navigation-written-by-hand).

## Pages parallèles {#parallel-pages}

Un article peut être découpé en plusieurs pages, à la manière de la page Icons de [m3.material.io](https://m3.material.io/styles/icons), découpée en Overview, Guidelines et Specs. Ces pages n'occupent qu'une entrée dans la navigation latérale, et une barre d'onglets en haut de la page permet de passer de l'une à l'autre.

- Quand vous faites défiler vers le bas, la barre d'onglets rétrécit et vient se loger dans l'espace libre à droite du titre de la barre d'application. Quand vous remontez, elle revient dans la page.
- Quand la barre d'application n'a pas la place de l'accueillir, la barre d'onglets reste sous la barre d'application, avec une légère ombre.
- Quand vous changez de page au sein du groupe, le contenu glisse vers la gauche ou vers la droite. Si la barre d'onglets s'est ancrée dans la barre d'application, elle ne bouge pas, et la nouvelle page commence directement au début du texte.
- Les cartes de page précédente et de page suivante à la fin du contenu restent dans le groupe : sa première page n'a pas de page précédente, sa dernière n'a pas de page suivante.

Les pages [Icônes](/fr-FR/styles/icons) et tous les documents sur le thème de ce site sont organisés ainsi. Voir [Rédiger des pages](/fr-FR/getting-started/writing#parallel-pages).

Pour chaque champ, voir l'[API](/fr-FR/theme/sidebar/api). Pour savoir quand le tiroir s'ouvre, comment la barre d'onglets se déplace et le reste, voir les [Détails](/fr-FR/theme/sidebar/details).
