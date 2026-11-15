---
icon: image
order: 4
tab: Vue d'ensemble
parallel:
  - api
---

# Aperçu d'image

`AkariImagePreview` enveloppe une image dans une vignette que l'on ouvre d'un clic. L'image remplit alors la zone de contenu, où elle peut être agrandie, tournée et déplacée, et le clavier permet les mêmes opérations.

## Utilisation

<AkariImagePreview src="/hero/theme-hero.svg" alt="L'apparence du thème" label="Voir l'apparence du thème">
  <img src="/hero/theme-hero.svg" alt="L'apparence du thème" width="360" />
</AkariImagePreview>

```html
<AkariImagePreview src="/hero/theme-hero.svg" alt="L'apparence du thème" label="Voir l'apparence du thème">
  <img src="/hero/theme-hero.svg" alt="L'apparence du thème" width="360" />
</AkariImagePreview>
```

Le slot par défaut est la vignette elle-même. Omis, le composant dessine son propre `<img>` ; fourni, il respecte votre mise en page et se contente d'envelopper le tout dans un bouton.

Les propriétés, les slots, les classes CSS et les fonctions de géométrie exportées se trouvent dans l'onglet **API**.

## Clavier

| Touche | Action |
| --- | --- |
| `Échap` | Fermer l'aperçu |
| `+`, `=` | Agrandir d'un cran |
| `-`, `_` | Réduire d'un cran |
| `0` | Rétablir la vue |
| `r` | Tourner de 90° dans le sens horaire |
| `Maj` + `r` | Tourner de 90° dans le sens antihoraire |

Le zoom va de 50 % à 400 %, à la molette, au double clic ou par les boutons de la barre. Un glisser déplace l'image ; un double clic sur l'image ou le bouton de rétablissement ramène à la vue d'ouverture.

## Animation et repli

À l'ouverture, l'image s'étend depuis sa vignette, et se rétracte à la fermeture. Une fois la vue agrandie, tournée ou déplacée, il n'y a plus une seule boîte de retour : l'animation est sautée et seule une transition d'opacité reste. Quand l'option « réduire les animations » est active, l'aperçu ne fait que s'estomper.

La couche d'aperçu est téléportée dans `.akari-frame`, elle n'est donc pas rognée par la colonne de texte ni par son `overflow`. Le défilement de la page est verrouillé pendant l'ouverture, et le focus revient au bouton déclencheur à la fermeture.
