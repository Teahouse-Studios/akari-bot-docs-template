---
tab: API
---

# Boutons : API

Le contenu ci-dessous provient des métadonnées de composants de `@m3e/web` 2.10.3.

## m3e-button

| Attribut | Valeurs | Défaut | Description |
| --- | --- | --- | --- |
| `variant` | `elevated`, `filled`, `tonal`, `outlined`, `text` | `text` | Apparence |
| `size` | `extra-small`, `small`, `medium`, `large`, `extra-large` | `small` | Taille |
| `shape` | `rounded`, `square` | `rounded` | Forme |
| `disabled` | Booléen | `false` | Désactivé et non focalisable |
| `disabled-interactive` | Booléen | `false` | Désactivé mais toujours focalisable, pour que les lecteurs puissent découvrir l'action |
| `toggle` | Booléen | `false` | Se comporte comme un interrupteur à deux états |
| `selected` | Booléen | `false` | État sélectionné de l'interrupteur |
| `href` | Chaîne | `""` | Transforme le bouton en lien quand il est défini |
| `target` | `_self`, `_blank`, `_parent`, `_top` ou un nom de fenêtre | `""` | Où s'ouvre le lien |
| `rel` | Chaîne | `""` | Relation entre le lien et la page actuelle |
| `download` | Chaîne | Aucun | En fait un lien de téléchargement ; la valeur est le nom du fichier |
| `type` | `button`, `submit`, `reset` | `button` | Comportement dans un formulaire |
| `name`, `value` | Chaîne | Aucun | Nom et valeur envoyés à la soumission du formulaire |

| Slot | Contenu |
| --- | --- |
| (par défaut) | Texte du bouton |
| `icon` | Icône avant le texte |
| `trailing-icon` | Icône après le texte |
| `selected` | Texte à l'état sélectionné |
| `selected-icon` | Icône à l'état sélectionné |

| Événement | Quand |
| --- | --- |
| `click` | Au clic |
| `beforeinput` | L'interrupteur est sur le point de basculer ; peut être annulé |
| `input`, `change` | L'interrupteur a basculé |

## m3e-icon-button

Mêmes attributs que `m3e-button`, plus :

| Attribut | Valeurs | Défaut | Description |
| --- | --- | --- | --- |
| `variant` | `standard`, `filled`, `tonal`, `outlined`, `elevated` | `standard` | Apparence |
| `width` | `default`, `narrow`, `wide` | `default` | Largeur |

| Slot | Contenu |
| --- | --- |
| (par défaut) | Icône |
| `selected` | Icône à l'état sélectionné |

Les événements sont les mêmes que pour `m3e-button`.

## m3e-tooltip

| Attribut | Valeurs | Défaut | Description |
| --- | --- | --- | --- |
| `for` | Id d'élément | Aucun | Le contrôle auquel appartient l'info-bulle |
| `position` | `above`, `below`, `before`, `after` | `below` | Position par rapport au contrôle |
| `show-delay` | Millisecondes | `0` | Délai avant l'affichage |
| `hide-delay` | Millisecondes | `200` | Délai avant le masquage |
| `touch-gestures` | `auto`, `on`, `off` | `auto` | Gestion des gestes tactiles |
| `disabled` | Booléen | `false` | Désactive l'info-bulle |

## Utiliser les boutons dans la documentation

- Un `m3e-button` interne avec `href` est pris en charge par le thème, qui effectue la navigation dans la page ; avec `target="_self"`, la page complète est chargée. Quand vous devez naviguer depuis un script, vous pouvez appeler `useRouter().go()`, voir [Navigation](/fr-FR/components/navigation#spa-navigation).
- Quelle que soit sa taille visuelle, un bouton garde une zone tactile d'au moins 48×48dp.
- Le `m3e.ts` du thème enregistre les composants (`@m3e/web/button`, `@m3e/web/icon-button`, `@m3e/web/tooltip`).
