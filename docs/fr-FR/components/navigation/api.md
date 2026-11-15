---
tab: API
---

# Navigation : API

Le contenu ci-dessous provient des métadonnées de composants de `@m3e/web` 2.10.3.

## m3e-nav-menu et m3e-nav-menu-item

`m3e-nav-menu` n'a pas d'attributs. Son slot par défaut contient des éléments `m3e-nav-menu-item`.

| Attribut | Valeurs | Défaut | Description |
| --- | --- | --- | --- |
| `open` | Booléen | `false` | Déplie les éléments enfants |
| `selected` | Booléen | `false` | L'élément actuel ; le composant le traduit en `aria-current` |
| `disabled` | Booléen | `false` | Désactive cet élément et tous ses enfants |

| Slot | Contenu |
| --- | --- |
| (par défaut) | Éléments enfants imbriqués |
| `label` | Texte, généralement un lien |
| `icon` | Icône |
| `selected-icon` | Icône à l'état sélectionné |
| `badge` | Badge |
| `toggle-icon` | Icône de dépliage et de repliage |

| Événement | Quand |
| --- | --- |
| `opening`, `opened`, `closing`, `closed` | Début et fin du dépliage et du repliage |
| `click` | Au clic |

## m3e-tabs, m3e-tab et m3e-tab-panel

| Attribut de `m3e-tabs` | Valeurs | Défaut | Description |
| --- | --- | --- | --- |
| `variant` | `primary`, `secondary` | `secondary` | Apparence |
| `stretch` | Booléen | `false` | Les onglets prennent des largeurs égales et remplissent le conteneur |
| `header-position` | `before`, `after` | `before` | Place la barre d'onglets avant ou après les panneaux |
| `disable-pagination` | Booléen | `false` | Masque les boutons de pagination quand les onglets débordent |
| `disable-swipe` | Booléen | `false` | Désactive le balayage sur un panneau pour changer d'onglet |
| `previous-page-label`, `next-page-label` | Chaîne | `"Previous page"`, `"Next page"` | Noms accessibles des boutons de pagination |

| Attribut de `m3e-tab` | Valeurs | Défaut | Description |
| --- | --- | --- | --- |
| `for` | Id du panneau | Aucun | Le `m3e-tab-panel` correspondant |
| `selected` | Booléen | `false` | L'onglet actuel ; un seul est autorisé |
| `disabled` | Booléen | `false` | Désactivé |

Écrivez `m3e-tab` et `m3e-tab-panel` directement dans `m3e-tabs`, comme dans l'exemple de la page [Vue d'ensemble](/fr-FR/components/navigation#tabs). Les slots `prev-icon` et `next-icon` remplacent les icônes de pagination. Changer d'onglet déclenche `beforeinput` (annulable), `input` et `change`. `m3e-tab` a aussi un slot `icon`.

## m3e-chip et m3e-filter-chip

| Attribut | Utilisé par | Valeurs | Défaut | Description |
| --- | --- | --- | --- | --- |
| `variant` | Les deux | `outlined`, `elevated` | `outlined` | Apparence |
| `value` | Les deux | Chaîne | Aucun | Valeur |
| `selected` | Filtre | Booléen | `false` | Sélectionné |
| `disabled`, `disabled-interactive` | Filtre | Booléen | `false` | Désactivé |

Les deux ont un slot par défaut (le texte) ainsi que les slots `icon` et `trailing-icon`. `m3e-chip` n'est pas interactif. `m3e-filter-chip` déclenche `beforeinput`, `input` et `change` quand il bascule.

`m3e-filter-chip-set` regroupe des chips de filtre : `multi` autorise plusieurs sélections, `vertical` les empile verticalement, `hide-selection-indicator` masque la marque de sélection, `disabled` désactive tout le groupe, et `name` sert aux formulaires. Il déclenche `change` quand la sélection change.

## m3e-badge

| Attribut | Valeurs | Défaut | Description |
| --- | --- | --- | --- |
| `size` | `small`, `medium`, `large` | `medium` | Taille |
| `for` | Id d'élément | Aucun | Ancre le badge à cet élément |
| `position` | `above-after`, `above-before`, `below-before`, `below-after`, `before`, `after`, `above`, `below` | `above-after` | Position par rapport à l'élément quand le badge est ancré |

Un badge n'a pas de rôle ARIA par défaut. Quand vous l'attachez à un élément interactif, décrivez le nombre avec `aria-describedby` ou avec un texte visible correspondant.

Le `m3e.ts` du thème enregistre les composants (`@m3e/web/nav-menu`, `@m3e/web/tabs`, `@m3e/web/chips`, `@m3e/web/badge`).
