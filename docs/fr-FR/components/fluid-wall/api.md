---
tab: API
---

# Mur fluide : API

`AkariFluidWall` appartient au thème et non à `@m3e/web` : il n'y a pas d'élément `m3e-` derrière. Il lit les jetons `--md-sys-color-*` et `--md-sys-motion-*`, d'où son suivi de la palette et des réglages de mouvement. La couleur est calculée dans le fragment shader WebGL2 et passée en uniforms : changer de palette repeint le même champ sans reconstruire le programme.

## AkariFluidWall

| Attribut | Type | Défaut | Description |
| --- | --- | --- | --- |
| `height` | `string` | `clamp(220px, 34vh, 380px)` | Toute longueur CSS |
| `variant` | `string` | `"silk"` | `silk`, `aurora`, `mesh`, `nebula`, `blossom` ; une valeur inconnue retombe sur `silk` |
| `light` | `"start" \| "center" \| "end"` | `"end"` | Où se trouve la lumière virtuelle ; oriente aussi le vignettage |
| `placement` | `"start" \| "center" \| "end"` | `"start"` | Position horizontale du contenu ; le voile tourne avec |
| `texture` | `string` | selon `variant` | `none`, `sakura`, `petals`, `stars`, `lace`, `vine`, `dots` |
| `texture-size` | `number \| string` | selon `texture` | Bord de tuile du motif, en px, borné à 80–640 |
| `texture-density` | `number \| string` | selon `texture` | Multiplicateur de densité, borné à 0–3 |
| `vine-density` | `number \| string` | `0.7` | Multiplicateur de densité des lianes. Borné à 0,2–2. Plus la valeur est faible, moins il y a de lianes. |
| `texture-opacity` | `number \| string` | selon `variant` | 0–1 ; l'alpha final multiplie aussi le poids du motif |
| `texture-tone` | `"auto" \| "ink" \| "light"` | `"auto"` | Trait ou plein ; `auto` suit le schéma |
| `texture-color` | `string` | — | Toute couleur CSS ; remplace `texture-tone` et s'applique à la texture et à la vigne. L'alpha ne s'applique qu'à la texture. |
| `vine-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | Couleurs par partie de la vigne ; les valeurs peuvent inclure alpha. `base` définit la couleur des parties non définies ; les autres suivent `texture-color`. |
| `vine-blend` | `"normal" \| "multiply" \| "screen" \| "overlay" \| "soft-light" \| "difference"` | `"normal"` | Mode de fusion entre la vigne et le flux (valeur CSS `mix-blend-mode`). |
| `vine-popout-blend` | `"normal" \| "multiply" \| "screen" \| "overlay" \| "soft-light" \| "difference"` | `vine-blend` | Mode de fusion propre à la couche de lianes débordantes ; un canevas séparé n’est utilisé que si la valeur diffère de `vine-blend`. |
| `vine-popout-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | Couleurs par partie des pousses une fois sorties de la paroi. |
| `speed` | `number \| string` | selon `variant` | Multiplicateur de vitesse ; 1 est la dérive de la variante |
| `scale` | `number \| string` | selon `variant` | Échelle du bruit ; plus grand, plis plus fins |
| `curl` | `number \| string` | selon `variant` | Force du bouclage ; 0 est un flux sans direction |
| `warp` | `number \| string` | selon `variant` | Distance de la déformation secondaire ; plus petit, plus calme |
| `tone` | `number \| string` | selon `variant` | 0 est le contraste prévu, 1 délave le mur jusqu'au fond de page |
| `grid` | `number \| string` | selon `variant` | Maille de la grille en px ; 0 n'en trace pas |
| `glow` | `number \| string` | selon `variant` | Force de la lumière qui suit le pointeur ; 0 l'éteint |
| `petal` | `number \| string` | selon `variant` | Jusqu'où les plis se recourbent en pétales ; 0 est un flux pur |
| `popout` | `boolean \| "auto"` | `"auto"` | Les lianes sortent-elles du cadre ; `auto` suit le réglage de la page |
| `inward` | `boolean \| "auto"` | `"auto"` | Les lianes montent-elles en arc à l'intérieur ; `auto` comme `popout` |
| `safe-zone` | `boolean \| string \| string[]` | `"auto"` | Zones évitées par les lianes ; `auto` évite le texte du mur |
| `outside-safe-zone` | `boolean \| string \| string[]` | `"none"` | Zones de sécurité hors du mur : rectangles que les pousses sortantes évitent. Même syntaxe que `safe-zone` ; les valeurs négatives dépassent du mur. |
| `wall-vines-in-safe-zone` | `boolean` | `true` | Les vignes murales peuvent-elles entrer dans `safe-zone` ? Si `false`, elles l’évitent ; les pousses extérieures l’évitent toujours. |
| `ripple` | `number` | `1` | Intensité de l’onde à chaque point de sortie ; 0 la désactive. |
| `ripple-speed` | `number` | `1` | Multiplicateur de vitesse de cette onde. |
| `ripple-size` | `number` | `1` | Multiplicateur de rayon de cette onde. |
| `ripple-rings` | `number \| string` | `2.2` | Anneaux dans un rayon d’onde, 0,5–6 |
| `ripple-sway` | `number \| string` | `1` | Amplitude avec laquelle une onde pousse les vignes, 0–3 |
| `vine-glow` | `number \| string` | `1` | Intensité de la lueur du pointeur sur la vigne, 0–2 ; 0 la coupe |
| `shadow` | `number` | `1` | Multiplicateur d’opacité de l’ombre des pousses ; 0 la désactive. |
| `shadow-size` | `number` | `1` | Multiplicateur de taille de cette ombre. |
| `shadow-color` | `string` | remplissage assombri | Couleur de l’ombre portée. |
| `shadow-angle` | `number` | `303.5` | Direction de l’ombre en degrés ; 0 = +x, 90 = +y. |
| `shadow-blur` | `number` | `6` | Rayon de flou de l’ombre, en pixels CSS ; 0 conserve un bord net. |
| `wall-shadow` | `number` | `1` | Multiplicateur d’opacité de l’ombre intérieure. |
| `wall-shadow-size` | `number` | `1` | Multiplicateur de taille de l’ombre intérieure. |
| `wall-shadow-color` | `string` | `Dérivée du remplissage des lianes` | Couleur de l’ombre intérieure. |
| `wall-shadow-angle` | `number` | `180` | Décalage angulaire de l’ombre intérieure par rapport à l’ombre portée, en degrés. |
| `wall-shadow-blur` | `number` | `6` | Rayon de flou de l’ombre intérieure, en pixels CSS ; 0 conserve un bord net. |
| `underlay-color` | `string` | `#ffffff` | Couleur du voile sous le remplissage de la vigne. |
| `underlay-opacity` | `number` | `0.18` | Opacité du voile, de 0 à 1. |
| `underlay-blend` | `string` | `additive` | Mode de fusion du voile : `additive`, `screen`, `normal`, `multiply`, `subtractive`. |
| `mote` | `number` | `1` | Multiplicateur du nombre de particules, de 0 à 3 ; 0 les désactive. |
| `mote-color` | `string` | Couleur de la fleur | Couleur des particules, toute couleur CSS. |
| `mote-blend` | `string` | `auto` | Mode de fusion des particules : `auto`, `normal`, `additive`, `multiply`, `subtractive`. |

Les attributs numériques acceptent aussi des chaînes CSS (`"1.2"`, `"72"`) et passent par `fluidNumber` ; une valeur illisible retombe sur celle de la variante.

| Slot | Contenu |
| --- | --- |
| défaut | Une colonne centrée, alignée horizontalement selon `placement` |
| `top` | Un badge fixé en haut à droite |
| `bottom` | Une note fixée en bas à gauche |

| Classe CSS | Emplacement |
| --- | --- |
| `.akari-fluid-wall` | Racine ; `data-placement` indique l'alignement |
| `.akari-fluid-wall__canvas` | Le canevas WebGL2, révélé après la première image |
| `.akari-fluid-wall__grid`, `__grid-lit` | La grille et sa copie éclairée au pointeur |
| `.akari-fluid-wall__texture`, `__texture-pattern`, `__texture-lit` | Le motif, son calque et sa copie éclairée |
| `.akari-fluid-wall__ribbons`, `__ribbon-lace`, `__ribbon-scallop` | La couche de dentelle, ses motifs et ses bords festonnés |
| `.akari-fluid-wall__vine-canvas` | Le canevas des lianes |
| `.akari-fluid-wall__veil` | Le dégradé sous le texte des slots |
| `.akari-fluid-wall__body`, `__block` | Le conteneur de slots et un bloc |

## Exports

La géométrie et la couleur vivent dans `fluid.ts` et sont exportées avec le composant depuis l'entrée du thème :

```ts
import {
  AkariFluidWall,
  FLUID_VARIANTS,
  FLUID_VARIANT_SPECS,
  FLUID_TEXTURES,
  FLUID_TEXTURE_SIZES,
  FLUID_TEXTURE_WEIGHTS,
  resolveFluid,
  fluidVariant,
  fluidTexture,
  fluidTextureTone,
  fluidNumber,
  fluidPalette,
  mixFluid,
  FLUID_LOOPS,
  fluidLoopOffset,
  fluidLoopOffsets,
  fluidRenderSize,
  FLUID_MAX_DPR,
  buildFluidRibbons,
  ribbonLacePitch,
  ribbonLacePath,
  ribbonScallopPath,
  ribbonScallopAmplitude,
  ribbonEdgePath,
  ribbonBandPath,
} from "vitepress-akari-theme-docs";
```

| Nom | Description |
| --- | --- |
| `FLUID_VARIANTS`, `FLUID_VARIANT_SPECS` | Les cinq variantes et le jeu complet de chacune |
| `FLUID_TEXTURES`, `FLUID_TEXTURE_SIZES`, `FLUID_TEXTURE_WEIGHTS` | Les sept motifs, leurs tailles de tuile et leurs poids |
| `resolveFluid(variant, overrides)` | Table en base, valeurs explicites par-dessus, bornées en `FluidVariantSpec` |
| `fluidVariant(v)`, `fluidTexture(v)` | Ramènent une entrée à une énumération légale, sinon `silk` / `none` |
| `fluidTextureTone(tone, scheme)` | Résout `auto` en `ink` ou `light` |
| `fluidNumber(value, min, max, fallback)` | Borne et repli ; tous les attributs numériques passent par là |
| `fluidPalette(tokens, scheme, tone, accent)` | Neuf jetons de couleur et deux réglages donnent un `FluidPalette` |
| `mixFluid(from, to, amount)` | Interpolation linéaire de même sémantique que `mix` en GLSL |
| `FLUID_LOOPS`, `fluidLoopOffset`, `fluidLoopOffsets` | Périodes des quatre dérives fermées et leurs phases |
| `fluidRenderSize`, `FLUID_MAX_DPR` | Résolution du canevas et budget de 1,1 M de pixels |
| `buildFluidRibbons(w, h, seed, count)` | Géométrie des bandes : extrémités, courbe, largeur, axe normal ; même seed, même jeu |
| `ribbonLacePitch(width)` | Pas de la dentelle, `max(26, width × 1.45)` |
| `ribbonLacePath(ribbon)` | Fleurons, anneaux, paires de points et perles d'encoche en sous-chemins d'arcs |
| `ribbonScallopPath(ribbon, side)` | Un bord festonné |
| `ribbonScallopAmplitude(ribbon)` | Amplitude du feston de cette bande |
| `ribbonEdgePath`, `ribbonBandPath` | Polyligne d'un côté et contour fermé de la bande |
| `FluidPalette`, `FluidTokens`, `FluidRibbon`, `FluidVariantSpec` | Le type de chaque couche |

## Accessibilité

- Les couches de fond sont `aria-hidden` et le canevas reste hors de l'arbre d'accessibilité ; un lecteur d'écran ne lit que le contenu des slots.
- Il ne capte ni clavier ni pointeur : `pointer-events: none` n'est posé que sur le canevas et les calques de motif, donc les boutons d'un slot fonctionnent.
- Avec « réduire les animations », il dessine la première image puis s'arrête : rien ne clignote ni ne dérive.
- Clair et sombre ont chacun leur palette et leur dégradé de repli, avec vignettage, bloom et grain réglés par schéma : passer en clair ne brûle jamais par lumière additive.

## Remarques

- Les motifs sont statiques : ils ne suivent pas le flux. Les faire bouger exige de changer le shader.
- `lace` retire une graine à chaque montage : les bandes changent de place au rechargement ; le composant n'expose pas de graine fixe.
- Aucune ressource externe : motifs et dentelle sont des SVG en ligne et des chemins générés à l'exécution, sans requête supplémentaire.
