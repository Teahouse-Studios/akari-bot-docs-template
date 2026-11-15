---
icon: radio_button_checked
order: 1
tab: Vue d'ensemble
parallel:
  - api
---

# Boutons

`m3e-button` déclenche une action. `m3e-icon-button` est un bouton compact qui ne contient qu'une icône. Les deux prennent en charge les variantes, les tailles, les formes, l'état désactivé, les liens et la sélection.

## Variantes

Les cinq variantes expriment différents degrés de mise en valeur :

<div class="demo-row">
  <m3e-button variant="elevated">Elevated</m3e-button>
  <m3e-button variant="filled">Filled</m3e-button>
  <m3e-button variant="tonal">Tonal</m3e-button>
  <m3e-button variant="outlined">Outlined</m3e-button>
  <m3e-button variant="text">Text</m3e-button>
</div>

```html
<m3e-button variant="elevated">Elevated</m3e-button>
<m3e-button variant="filled">Filled</m3e-button>
<m3e-button variant="tonal">Tonal</m3e-button>
<m3e-button variant="outlined">Outlined</m3e-button>
<m3e-button variant="text">Text</m3e-button>
```

- `filled` : l'action la plus importante de la page. En général, une seule apparaît dans une zone.
- `tonal` : une action secondaire, plus douce que `filled`.
- `outlined` : une action qui a besoin d'une limite claire, mais pas d'une forte mise en valeur.
- `text` : une action peu mise en valeur, dans une barre d'outils ou un pied de carte.
- `elevated` : une action principale qui doit paraître surélevée. Elle s'associe bien aux cartes ou aux surfaces.

## Taille et forme

Les tailles vont de `extra-small` à `extra-large`. La valeur par défaut est `small` :

<div class="demo-row">
  <m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
  <m3e-button variant="tonal" size="small">Small</m3e-button>
  <m3e-button variant="tonal" size="medium">Medium</m3e-button>
  <m3e-button variant="tonal" size="large">Large</m3e-button>
  <m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
</div>

```html
<m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
<m3e-button variant="tonal" size="small">Small</m3e-button>
<m3e-button variant="tonal" size="medium">Medium</m3e-button>
<m3e-button variant="tonal" size="large">Large</m3e-button>
<m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
```

La forme par défaut est `rounded`. Définissez `shape="square"` pour la rendre carrée :

<div class="demo-row">
  <m3e-button variant="filled" shape="square">Square Filled</m3e-button>
  <m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
  <m3e-button variant="text" shape="square">Square Text</m3e-button>
</div>

```html
<m3e-button variant="filled" shape="square">Square Filled</m3e-button>
<m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
<m3e-button variant="text" shape="square">Square Text</m3e-button>
```

Quelle que soit sa taille visuelle, un bouton garde une zone tactile d'au moins 48×48dp.

## Icônes

Le slot `icon` se place avant le texte, et le slot `trailing-icon` après :

<div class="demo-row">
  <m3e-button variant="filled">
    <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
    Commencer à construire
  </m3e-button>
  <m3e-button variant="tonal">
    Copier la configuration
    <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined">
    Suivant
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled">
  <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
  Commencer à construire
</m3e-button>
<m3e-button variant="tonal">
  Copier la configuration
  <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined">
  Suivant
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
```

Les icônes sont masquées par défaut aux technologies d'assistance, et le nom accessible du bouton vient de son texte visible. Un bouton qui n'a qu'une icône doit avoir un `aria-label`.

## Boutons d'icône

Les boutons d'icône existent en cinq variantes : `standard`, `filled`, `tonal`, `outlined` et `elevated`. Ils n'ont pas de texte : utilisez une info-bulle pour indiquer ce qu'ils font :

<div class="demo-row">
  <m3e-icon-button id="button-demo-back" aria-label="Retour">
    <m3e-icon name="arrow_back"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-back">Retour</m3e-tooltip>

  <m3e-icon-button id="button-demo-settings" aria-label="Paramètres" variant="tonal">
    <m3e-icon name="settings"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-settings">Paramètres</m3e-tooltip>

  <m3e-icon-button id="button-demo-close" aria-label="Fermer" variant="outlined">
    <m3e-icon name="close"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-close">Fermer</m3e-tooltip>

  <m3e-icon-button id="button-demo-confirm" aria-label="Confirmer" variant="filled">
    <m3e-icon name="check"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-confirm">Confirmer</m3e-tooltip>
</div>

```html
<m3e-icon-button id="button-demo-settings" aria-label="Paramètres" variant="tonal">
  <m3e-icon name="settings"></m3e-icon>
</m3e-icon-button>
<m3e-tooltip for="button-demo-settings">Paramètres</m3e-tooltip>
```

Le `for` de chaque info-bulle pointe vers un `id` unique. Des `id` en double dans une même page font apparaître une info-bulle au mauvais endroit, ou la font fonctionner uniquement pour le premier élément.

## Boutons désactivés et boutons-liens

Par défaut, un bouton désactivé ne peut pas recevoir le focus clavier. `disabled-interactive` le garde focalisable, pour que les utilisateurs puissent quand même découvrir l'action :

<div class="demo-row">
  <m3e-button variant="filled" disabled>Désactivé</m3e-button>
  <m3e-button variant="filled" disabled-interactive>Désactivé mais focalisable</m3e-button>
  <m3e-button variant="tonal" href="https://m3.material.io/" target="_blank" rel="noreferrer">
    Ouvrir Material 3
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined" href="/fr-FR/components/card.html">
    Voir les cartes
    <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" disabled>Désactivé</m3e-button>
<m3e-button variant="filled" disabled-interactive>Désactivé mais focalisable</m3e-button>
<m3e-button
  variant="tonal"
  href="https://m3.material.io/"
  target="_blank"
  rel="noreferrer"
>
  Ouvrir Material 3
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined" href="/fr-FR/components/card.html">
  Voir les cartes
  <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
</m3e-button>
```

Avec `href`, le bouton est rendu avec une sémantique de lien et prend en charge `target`, `rel` et `download`. Le thème intercepte les liens internes et effectue la navigation dans la page ; avec `target="_self"`, la page complète est chargée, et avec `target="_blank"`, le lien s'ouvre dans un nouvel onglet. Quand vous devez naviguer depuis un script, vous pouvez appeler `useRouter().go()`. Voir [Navigation](/fr-FR/components/navigation).

## État de sélection

`toggle` transforme le bouton en interrupteur à deux états, et `selected` définit son état initial :

<div class="demo-row">
  <m3e-button variant="filled" toggle selected>
    <m3e-icon slot="icon" name="check"></m3e-icon>
    Sélectionné
  </m3e-button>
  <m3e-button variant="tonal" toggle>Basculer</m3e-button>
  <m3e-button variant="outlined" toggle>
    <m3e-icon slot="icon" name="close"></m3e-icon>
    <m3e-icon slot="selected-icon" name="check"></m3e-icon>
    Suivre
    <span slot="selected">Suivi</span>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" toggle selected>
  <m3e-icon slot="icon" name="check"></m3e-icon>
  Sélectionné
</m3e-button>
<m3e-button variant="tonal" toggle>Basculer</m3e-button>
<m3e-button variant="outlined" toggle>
  <m3e-icon slot="icon" name="close"></m3e-icon>
  <m3e-icon slot="selected-icon" name="check"></m3e-icon>
  Suivre
  <span slot="selected">Suivi</span>
</m3e-button>
```

Quand le bouton est sélectionné, `m3e-icon` passe automatiquement au glyphe plein. Vous pouvez aussi remplacer l'icône et le texte avec les slots `selected-icon` et `selected`. Le basculement déclenche les événements `beforeinput`, `input` et `change`, et vous pouvez l'annuler dans `beforeinput`.

## Conseils d'accessibilité

- Un bouton qui n'a qu'une icône doit définir `aria-label` et être accompagné d'un `m3e-tooltip`.
- Gardez uniques dans une page les `id` ciblés par les info-bulles.
- Si les utilisateurs doivent connaître l'existence d'une action désactivée, utilisez `disabled-interactive` et expliquez pourquoi elle est indisponible.
- Utilisez `href` pour les boutons-liens. Ne liez pas une logique de routage à un simple bouton au prix de la sémantique de lien.
- Utilisez `filled` pour l'action principale, et évitez plusieurs boutons très mis en valeur dans la même zone visuelle.

Pour tous les attributs, slots et événements, voir [API](/fr-FR/components/button/api).
