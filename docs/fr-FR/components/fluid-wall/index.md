---
icon: wallpaper
order: 5
tab: Vue d'ensemble
parallel:
  - api
---

<script setup>
import FluidWallPlayground from "../../../.vitepress/theme/components/content/FluidWallPlayground.vue";
</script>

# Mur fluide : Vue d'ensemble

`AkariFluidWall` est un panneau de fond dessiné en WebGL2 : deux niveaux de bruit déformé qui se tirent l'un l'autre, colorés uniquement par les jetons `--md-sys-color-*` du thème. Il suit donc la palette et le passage clair/sombre, et l'on peut écrire dessus comme le laisser servir de sol mouvant.

::: tip
Un arrêt apparent est normal : avec « réduire les animations », un onglet en arrière-plan ou un élément hors du viewport, le mur se met en pause et reprend au retour.
:::

## Usage minimal

```html
<AkariFluidWall />
```

Sans attribut, c'est la variante `silk` : plis moyens, bras de pétales, grille fine de 72 px, lumière au pointeur, hauteur `clamp(220px, 34vh, 380px)`.

## Aire de jeu

Le bloc ci-dessous est interactif : l'aperçu en haut, tous les réglages de style en dessous. Les changements ne touchent que cette instance, et l'extrait reprend la configuration courante, prêt à être copié dans une page.

<FluidWallPlayground />

## Variantes

`variant` choisit la forme d'ensemble. Chacune n'est qu'un jeu de valeurs de départ : tous les nombres du tableau d'attributs restent surchargeables, donc `silk` avec un `scale` plus grand reste `silk`, simplement plus fin.

`silk` est la valeur par défaut : plis, pétales et grille réunis, au plus près d'un satin en mouvement.

`aurora` comprime le domaine du bruit sur la largeur en rideaux verticaux et les fait dériver par un peigne plus rapide ; ni pétales ni grille.

`mesh` calme presque le flux, garde un fond doux et renforce la grille et le projecteur du pointeur : la surface la plus lisible pour du texte.

`nebula` est la plus fine : échelle de bruit plus grande, dérive très lente, vignettage marqué et une couche de sakura très légère.

`blossom` adoucit les plis de `silk`, pose une texture de sakura plus dense et ne trace pas de grille.

## Textures superposées

`texture` dessine un motif statique au-dessus du flux. Il est indépendant du flux et ne se déplace pas avec lui, ce qui le rend utile en filigrane ou en bordure de dentelle.

`sakura` est une fleur à cinq pétales : trait en clair, plein en sombre ; `texture-tone` force l'un ou l'autre.

`lace` n'est pas une tuile : chaque bande est construite séparément, entre et sort du cadre au hasard, avec deux bords festonnés et une rangée de motifs. Position et direction viennent de `seed` ; omise, elles changent à chaque chargement, une graine fixe les reproduit.

`vine` fait pousser des tiges, qui peuvent dépasser du cadre.

::: tip
Demander `texture="stars"` sans `variant` serait invisible, car `silk` part avec une opacité nulle ; `resolveFluid` la relève à `0,55` pour qu'une texture nommée se voie toujours. `texture-opacity` permet de la baisser.
:::

## Écrire sur le mur

Le slot par défaut est une colonne centrée ; `top` se fixe en haut à droite, `bottom` en bas à gauche. `placement` déplace la colonne centrale.

Quand un slot contient quelque chose, un voile est posé sous le texte pour rester lisible ; il tourne avec `placement` (`start`, `center`, `end`). Sans contenu, aucun voile n'est dessiné.

## Lianes hors cadre

Avec `texture="vine"`, quelques tiges sortent du panneau et d'autres montent en arc vers le spectateur.

`popout` les laisse sortir du cadre, `inward` les laisse monter à l'intérieur, et `safe-zone` énumère les zones qu'elles évitent.

`base` dans `vine-colors` définit la couleur de toutes les parties sans valeur explicite ; chaque partie (`fill`, `tint`, `halo`, `edge`, `fine`) peut aussi recevoir sa propre couleur et son alpha, les parties omises suivant `texture-color`.

## Suivre la palette

Toutes les couleurs viennent de `--md-sys-color-*` et `--md-sys-motion-*` : le bouton de palette de la barre d'application ne demande aucune configuration. Les jetons sont lus par une sonde cachée dans le mur, et non en analysant des chaînes `getComputedStyle`, de sorte que les couleurs relatives comme `color-mix` ou `rgb(from …)` se résolvent correctement.

## Détection du GPU

Avant de créer un contexte WebGL, le mur appelle `getGPUTier("BAD")` de `detect-gpu.js`. La détection s'exécute une seule fois par page.

Le résultat est stocké dans `document.documentElement.dataset.akariGpuTier`. Lorsqu'il vaut `BAD`, le mur ne crée ni contexte WebGL2 ni scène 3D de vigne et n'affiche que le dégradé CSS de secours. `BAD` couvre l'absence de WebGL2, le rendu logiciel SwiftShader ou llvmpipe, et les cas similaires.

Le mur écrit ensuite un avertissement `[akari]` avec la raison de la détection dans la console.

## Performance

- Le shader ne tourne qu'au besoin : il démarre à l'entrée dans le viewport et s'arrête à la sortie ou quand l'onglet est masqué ; avec `prefers-reduced-motion: reduce`, seule la première image est dessinée.
- Plafond à 30 fps, DPR limité à 1,5, budget de 1,1 M de pixels ; les grands canevas sont réduits puis étirés en CSS.
- Sans WebGL2, repli sur un dégradé CSS : mêmes couleurs, sans mouvement.
- N'en mettez pas une douzaine sur une page : chaque mur a sa boucle rAF et son canevas.

Les attributs, slots, classes CSS et fonctions de géométrie exportées sont sur la page `API`.
