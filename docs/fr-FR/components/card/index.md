---
icon: dashboard
order: 2
tab: Vue d'ensemble
parallel:
  - api
---

# Cartes

`m3e-card` réunit un en-tête, un corps, des actions et un pied sur une seule surface autonome. Utilisez-la pour les points d'entrée vers des fonctionnalités, les résumés de documentation, les paramètres et les médias.

## Variantes

Les trois variantes conviennent à différents niveaux :

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Filled</m3e-heading>
    <div slot="content">La variante par défaut. Sa couleur de conteneur vient de <code>surface-container-highest</code>, sans contour ni ombre.</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Outlined</m3e-heading>
    <div slot="content">A un contour de 1px. Convient aux listes denses et aux blocs de contenu qui ont besoin d'une limite claire.</div>
  </m3e-card>
  <m3e-card variant="elevated">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Elevated</m3e-heading>
    <div slot="content">A une ombre et une couleur de surface. Convient aux contenus importants qui flottent au-dessus du fond.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="filled">
  <m3e-heading slot="header" variant="title" size="large">Filled</m3e-heading>
  <div slot="content">La variante par défaut. Sa couleur de conteneur vient des niveaux de surface.</div>
</m3e-card>
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">Outlined</m3e-heading>
  <div slot="content">A un contour de 1px.</div>
</m3e-card>
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="title" size="large">Elevated</m3e-heading>
  <div slot="content">A une ombre et une couleur de surface.</div>
</m3e-card>
```

Sans `variant`, une carte utilise `filled`.

## Slots

Une carte a cinq zones :

- `header` : un titre, une icône ou un média, sans marge intérieure supplémentaire.
- `content` : la zone du corps, avec une marge intérieure.
- `actions` : des boutons d'action, alignés par défaut sur le bord de début. Ajoutez l'attribut `end` à l'élément pour les aligner sur le bord de fin.
- `footer` : métadonnées, copyright ou remarques secondaires.
- Slot par défaut : sans marge intérieure. Convient aux images pleine largeur ou aux mises en page personnalisées.

<div class="demo-grid">
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Résumé de la documentation</m3e-heading>
    <div slot="content">
      La zone du corps peut contenir des paragraphes, des listes, des chips et des badges. La carte gère la marge intérieure.
    </div>
    <div slot="actions" end>
      <m3e-button variant="text">Annuler</m3e-button>
      <m3e-button variant="filled">Continuer</m3e-button>
    </div>
    <div slot="footer">Mis à jour le 2026-10-27</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">Résumé de la documentation</m3e-heading>
  <div slot="content">
    La zone du corps peut contenir des paragraphes, des listes, des chips et des badges. La carte gère la marge intérieure.
  </div>
  <div slot="actions" end>
    <m3e-button variant="text">Annuler</m3e-button>
    <m3e-button variant="filled">Continuer</m3e-button>
  </div>
  <div slot="footer">Mis à jour le 2026-10-27</div>
</m3e-card>
```

Ordonnez les boutons de `actions` selon les conventions de la plateforme : annuler côté début, confirmer côté fin. Le texte du pied utilise une couleur secondaire pour ne pas disputer l'attention au corps.

## Combiner les contenus

Une carte peut mélanger titres, chips, badges et listes :

<m3e-card variant="elevated">
  <m3e-heading m3e-toc-ignore slot="header" variant="headline" size="small">Fonctionnalités du thème</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        Couleur dynamique
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        Remplacement de composants
      </m3e-chip>
      <m3e-badge size="small">Bêta</m3e-badge>
    </div>
    <ul>
      <li>Navigation et table des matières construites à partir de la configuration</li>
      <li>Paramètres enregistrés dans le navigateur utilisé</li>
      <li>Enregistrement côté client, compatible avec les builds SSR</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/fr-FR/theme/extending.html">
      Voir comment étendre le thème
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>

```html
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="headline" size="small">Fonctionnalités du thème</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        Couleur dynamique
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        Remplacement de composants
      </m3e-chip>
      <m3e-badge size="small">Bêta</m3e-badge>
    </div>
    <ul>
      <li>Navigation et table des matières construites à partir de la configuration</li>
      <li>Paramètres enregistrés dans le navigateur utilisé</li>
      <li>Enregistrement côté client, compatible avec les builds SSR</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/fr-FR/theme/extending.html">
      Voir comment étendre le thème
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>
```

Avec plus de contenu, une carte s'agrandit pour l'accueillir. Les cartes d'une même grille ne prennent pas automatiquement la même hauteur : gardez des textes de longueur similaire.

## Cartes interactives

Ajoutez `actionable` à une carte pour faire de toute sa surface une seule zone interactive. Avec `href`, elle fonctionne directement comme un lien :

<div class="demo-grid">
  <m3e-card variant="outlined" actionable href="/fr-FR/getting-started/installation.html">
    <m3e-icon slot="header" name="package_2"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Installation</m3e-heading>
    <div slot="content">Installez Node et les dépendances, puis produisez votre premier build.</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/fr-FR/getting-started/configuration.html">
    <m3e-icon slot="header" name="tune"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Configuration</m3e-heading>
    <div slot="content">Réglez la barre d'application, la navigation, les sections des paramètres et la profondeur de la table des matières.</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/fr-FR/theme/extending.html">
    <m3e-icon slot="header" name="integration_instructions"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Extension</m3e-heading>
    <div slot="content">Personnalisez l'interface en remplaçant des composants et avec les tokens CSS.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" actionable href="/fr-FR/getting-started/installation.html">
  <m3e-icon slot="header" name="package_2"></m3e-icon>
  <m3e-heading slot="header" variant="title" size="large">Installation</m3e-heading>
  <div slot="content">Installez Node et les dépendances, puis produisez votre premier build.</div>
</m3e-card>
```

Une carte interactive affiche un calque d'état au survol, au focus et à l'appui. Retirez tout autre élément interactif d'une carte cliquable dans son ensemble, pour que des boutons imbriqués ne déclenchent pas deux actions à la fois. Quand vous avez besoin de plusieurs actions, utilisez plutôt une carte simple avec le slot `actions`.

## Actions de dialogue

L'action d'une carte peut ouvrir une boîte de dialogue. Placez `m3e-dialog-trigger` dans le bouton. `m3e-dialog-action` ferme la boîte de dialogue et renvoie un résultat :

<m3e-card variant="outlined">
  <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Informations de version</m3e-heading>
  <div slot="content">Cette documentation correspond à VitePress 2.0.0-alpha.21 et @m3e/web 2.10.3.</div>
  <div slot="actions" end>
    <m3e-button variant="filled">
      <m3e-dialog-trigger for="card-demo-dialog">Voir les détails</m3e-dialog-trigger>
    </m3e-button>
  </div>
</m3e-card>

<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>Le thème utilise VitePress pour la génération statique et le routage, et m3e pour les composants d'interface et la couleur dynamique.</p>
  <p>Les paramètres sont enregistrés localement dans le navigateur et ne sont pas écrits dans la configuration du site.</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">Fermer</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>

```html
<m3e-button variant="filled">
  <m3e-dialog-trigger for="card-demo-dialog">Voir les détails</m3e-dialog-trigger>
</m3e-button>
<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>Le thème utilise VitePress pour la génération statique et le routage, et m3e pour les composants d'interface et la couleur dynamique.</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">Fermer</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>
```

`dismissible` ajoute un bouton de fermeture à la boîte de dialogue. Un clic sur le voile ou la touche `Escape` la ferme aussi. Pour un parcours bloquant, ajoutez `disable-close` et une action de confirmation explicite.

## Disposition en grille

Les grilles de cartes utilisent `.demo-grid`, qui passe à une seule colonne sur les écrans étroits. Limitez chaque carte à un sujet et à une action principale, et ne mettez pas le contenu de toute une page dans une seule carte.

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">Premiers pas</m3e-heading>
    <div slot="content">De l'installation à votre premier build en une dizaine de minutes.</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">Thème</m3e-heading>
    <div slot="content">Comprendre la structure de l'interface, la barre latérale et la boîte de dialogue des paramètres.</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">Styles</m3e-heading>
    <div slot="content">Découvrir les tokens de couleur et la hiérarchie typographique.</div>
  </m3e-card>
</div>

## Conseils d'utilisation

- Gardez des titres de carte courts et un corps de trois lignes au maximum. Déplacez les contenus longs sur leur propre page.
- N'utilisez qu'une seule variante dans une grille pour éviter le bruit visuel.
- N'imbriquez pas de boutons dans une carte cliquable dans son ensemble. Utilisez `actions` quand vous avez besoin de plusieurs actions.
- Placez les images dans le slot par défaut ou dans le slot `header`, et donnez-leur un texte alternatif.
- Ajustez le rayon d'angle, la couleur et la marge intérieure de la carte avec les variables `--m3e-card-*`. Voir [Étendre le thème](/fr-FR/theme/extending).

Pour tous les attributs, slots et événements, voir [API](/fr-FR/components/card/api).
