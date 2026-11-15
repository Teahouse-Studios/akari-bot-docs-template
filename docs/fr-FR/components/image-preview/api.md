---
tab: API
---

# Aperçu d'image : API

`AkariImagePreview` appartient au thème et non à `@m3e/web` : il n'y a pas d'élément `m3e-` derrière lui. Il lit les jetons `--md-sys-color-*` et `--md-sys-motion-*`, c'est pourquoi il suit les réglages de couleur et de mouvement.

## AkariImagePreview

| Propriété | Type | Défaut | Description |
| --- | --- | --- | --- |
| `src` | `string` | requis | Image affichée en grand, et source de la vignette par défaut |
| `alt` | `string` | `""` | Description de l'image, également `aria-label` de la boîte de dialogue |
| `label` | `string` | `imagePreviewOpen` de la langue courante | `aria-label` et `title` du bouton déclencheur |
| `open` | `boolean \| null` | `null` | État d'ouverture contrôlé. S'il est fourni, le bouton déclencheur n'est pas rendu et `v-model:open` porte l'état |
| `origin` | `HTMLElement \| null` | `null` | Élément d'où l'aperçu part et où il revient en mode contrôlé |

| Slot | Contenu |
| --- | --- |
| défaut | La vignette. Le composant l'enveloppe dans un `<button>` et y ajoute l'icône de zoom qui apparaît au survol |

| Sortie | Description |
| --- | --- |
| `update:open` | Émis à l'ouverture et à la fermeture, à coupler avec `v-model:open` |

| Classe CSS | Emplacement |
| --- | --- |
| `.akari-image-preview` | La racine, posée en ligne |
| `.akari-image-preview__trigger` | Le bouton autour de la vignette |
| `.akari-image-preview__thumb` | La vignette par défaut |
| `.akari-image-preview__overlay` | La couche d'aperçu, téléportée dans `.akari-frame` |

## Exports

Le composant et sa géométrie sont exportés depuis l'entrée du thème :

```ts
import {
  AkariImagePreview,
  clampImageScale,
  zoomImageScale,
  wheelImageScale,
  rotateImage,
  uprightRotation,
  unwindRotation,
  isImageTransformed,
  previewChrome,
  rotationFitScale,
  scaleLabel,
} from "vitepress-akari-theme-docs";
```

| Nom | Description |
| --- | --- |
| `IMAGE_PREVIEW_FIT` | Échelle d'ouverture de l'aperçu, `1` |
| `IMAGE_PREVIEW_MIN_SCALE`, `IMAGE_PREVIEW_MAX_SCALE` | Bornes du zoom, `0.5` et `4` |
| `IMAGE_PREVIEW_ZOOM_STEP` | Amplitude d'un clic sur un bouton, `0.25` |
| `IMAGE_PREVIEW_WHEEL_FACTOR` | Facteur d'un cran de molette, `1.1` |
| `IMAGE_PREVIEW_ROTATION_STEP` | Angle d'un clic sur un bouton de rotation, `90` |
| `clampImageScale(scale)` | Ramène dans les bornes et arrondit au pour cent entier |
| `zoomImageScale(scale, delta)` | Ajoute un cran puis ramène dans les bornes |
| `wheelImageScale(scale, direction)` | Applique un cran de molette puis ramène dans les bornes |
| `rotateImage(rotation, delta)` | Tourne de l'angle donné |
| `uprightRotation(rotation)` | L'angle de tour complet le plus proche, pour rétablir la vue |
| `unwindRotation(rotation)` | L'angle de tour complet le plus proche à rejoindre à la fermeture, en sens inverse sur un demi-tour |
| `isImageTransformed(view)` | Indique si la vue a été agrandie, tournée ou déplacée |
| `previewChrome(viewportWidth)` | Hauteur que la couche laisse à sa barre |
| `rotationFitScale(rotation, image, viewport, chrome)` | Le facteur qui garde une image tournée d'un quart dans la fenêtre |
| `scaleLabel(scale)` | Lit `1.05` comme `105 %` |
| `ImagePreviewView`, `ImagePreviewSize` | Types d'une vue et d'une taille |

## Accessibilité

- Le bouton déclencheur a un nom et la vignette a son `alt` ; un `alt` vide utilise le libellé sans description.
- La couche est `role="dialog"` avec `aria-modal="true"`, prend le focus à l'ouverture, se ferme avec `Échap`, et rend le focus au déclencheur.
- Le défilement de la page est verrouillé pendant l'ouverture ; réduire les animations coupe le déplacement.
