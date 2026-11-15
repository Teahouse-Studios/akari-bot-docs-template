---
tab: API
---

# Cartes : API

Le contenu ci-dessous provient des métadonnées de composants de `@m3e/web` 2.10.3.

## m3e-card

| Attribut | Valeurs | Défaut | Description |
| --- | --- | --- | --- |
| `variant` | `elevated`, `filled`, `outlined` | `filled` | Apparence |
| `orientation` | `vertical`, `horizontal` | `vertical` | Sens dans lequel le contenu est disposé |
| `inline` | Booléen | `false` | Dispose la carte comme un élément inline |
| `actionable` | Booléen | `false` | Fait de toute la carte une seule zone interactive |
| `href`, `target`, `rel`, `download` | Comme pour le bouton | Comme pour le bouton | Transforme la carte en lien quand elle est `actionable` |
| `disabled`, `disabled-interactive` | Booléen | `false` | Désactive la carte quand elle est `actionable` |
| `type`, `name`, `value` | Comme pour le bouton | `button` | Comportement dans un formulaire quand elle est `actionable` |

| Slot | Contenu |
| --- | --- |
| (par défaut) | Sans marge intérieure ; convient aux images pleine largeur ou aux mises en page personnalisées |
| `header` | Titre, icône ou média, sans marge intérieure supplémentaire |
| `content` | Corps, avec une marge intérieure |
| `actions` | Boutons d'action, alignés par défaut sur le bord de début ; ajoutez l'attribut `end` à l'élément pour les aligner sur le bord de fin |
| `footer` | Métadonnées, copyright ou remarques secondaires |

| Événement | Quand |
| --- | --- |
| `click` | Une carte `actionable` est cliquée |

## m3e-dialog

| Attribut | Valeurs | Défaut | Description |
| --- | --- | --- | --- |
| `open` | Booléen | `false` | Indique si la boîte de dialogue est ouverte |
| `dismissible` | Booléen | `false` | Affiche un bouton de fermeture |
| `disable-close` | Booléen | `false` | Empêche la fermeture par un clic sur le voile ou par la touche `Esc` |
| `alert` | Booléen | `false` | Se comporte comme une boîte de dialogue d'alerte |
| `close-label` | Chaîne | `"Close"` | Nom accessible du bouton de fermeture |
| `no-focus-trap` | Booléen | `false` | Ne retient pas le focus `Tab` à l'intérieur de la boîte de dialogue |

| Slot | Contenu |
| --- | --- |
| (par défaut) | Corps |
| `header` | Titre |
| `actions` | Boutons d'action |
| `close-icon` | Icône du bouton de fermeture |

| Événement | Quand |
| --- | --- |
| `opening`, `opened` | L'ouverture commence, l'ouverture se termine |
| `closing`, `closed` | La fermeture commence, la fermeture se termine |
| `cancel` | Annulation par le voile ou par `Esc` |

`m3e-dialog-trigger` (attribut `for` : l'id de la boîte de dialogue) se place dans un bouton et ouvre la boîte de dialogue quand on clique sur ce bouton. `m3e-dialog-action` (attribut `return-value`) se place dans un bouton de la boîte de dialogue ; un clic dessus ferme la boîte de dialogue et renvoie cette valeur.

## Personnaliser l'apparence

Les variables `--m3e-card-*` règlent le rayon d'angle, la couleur et la marge intérieure de la carte. Par exemple, `--m3e-card-shape` est le rayon d'angle :

```html
<m3e-card variant="outlined" style="--m3e-card-shape: 28px;">…</m3e-card>
```

Le `m3e.ts` du thème enregistre les composants (`@m3e/web/card`, `@m3e/web/dialog`).
