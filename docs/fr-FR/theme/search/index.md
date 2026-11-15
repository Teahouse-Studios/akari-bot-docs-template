---
icon: search
order: 5
tab: Vue d'ensemble
parallel:
  - api
  - details
  - dock
---

# Recherche

La recherche se trouve à droite de la barre d'application. Sur grand écran, c'est un champ de recherche avec un texte indicatif et un rappel du raccourci ; sur écran étroit, elle se réduit à un bouton rond. Cliquez dessus ou appuyez sur `⌘K` (`Ctrl K` sous Windows et Linux), et le champ de recherche se déploie en panneau de recherche.

## Utilisation

| Touche | Action |
| --- | --- |
| `⌘K` / `Ctrl K` | Ouvrir la recherche depuis n'importe quelle page |
| `↑` / `↓` | Passer d'un résultat à l'autre |
| `Enter` | Ouvrir le résultat courant |
| `Esc` | Fermer la recherche |

Les résultats sont listés par page et par section, chacun avec un extrait de la correspondance. Ouvrir le résultat d'une section fait défiler la page jusqu'à son titre. Sur un site multilingue, seules les pages de la langue courante sont renvoyées.

## Recherche flottante

Placez `<SearchDock>` là où le champ de recherche doit atterrir. Le tag réserve seulement un cadre ; le vrai champ quitte la barre supérieure, mesure ce cadre et y reste tant que la page est ouverte.

```md
# Guide

<SearchDock variant="hero" align="center" placeholder="Rechercher dans le guide" />
```

| Propriété | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `placeholder` | `string` | `search.placeholder` | Texte indicatif une fois amarré ici |
| `variant` | `"bar" \| "pill" \| "icon" \| "hero"` | `"bar"` | Apparence du champ |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Position de l'icône, du libellé et du raccourci |
| `width` | `string \| number` | Largeur de la variante | Longueur CSS ou largeur en pixels du cadre réservé |
| `height` | `string \| number` | Hauteur de la variante | Longueur CSS ou hauteur en pixels du cadre réservé |
| `fill` | `boolean` | `false` | Remplir le cadre parent au lieu de la taille naturelle de la variante |
| `priority` | `number` | `0` | Prioritaire sur les autres tags de la même page |

Le tag est enregistré globalement : la page n'a pas besoin de l'importer. Placez-le dans le flux, à l'endroit où le champ doit vivre ; la mise en page environnante décide de la position exacte.

Ouvrir cette page directement place le champ dans le cadre sans transition. Depuis une autre page, il s'envole de la barre supérieure ou de son amarre précédente ; vers une page sans tag, il revient dans la barre et s'efface. Modifier une propriété redimensionne ou réaligne le champ sur place. Si une page contient plusieurs tags, le `priority` le plus élevé gagne, et à égalité le premier rendu.

Pendant que le champ est amarré, le titre de la barre et les onglets amarrés reprennent l'espace libéré ; cet espace se rouvre en douceur au retour du champ. Un tag ne reçoit le champ que si son cadre tient entièrement dans la zone de page et la fenêtre, sans chevaucher la barre supérieure ni la rangée d'onglets. Sinon le champ reste dans la barre et s'envole plus tard, quand le défilement amène le tag dans une zone dégagée. Pendant le vol, le défilement déplace le champ avec le tag au lieu de le laisser derrière et de le faire sauter à la fin ; si un tag redevient utilisable pendant le retour, le vol fait demi-tour depuis sa position actuelle sans repartir de zéro. Au retour, le champ prend la surface, la typographie et les marges de la barre pendant le vol, et non à l'atterrissage. Les durées et courbes viennent des jetons de mouvement MD3 du thème : elles suivent le réglage Standard/Expressive et respectent `prefers-reduced-motion`.

Voir la [démo en direct](/fr-FR/theme/search/dock) et l'[API](/fr-FR/theme/search/api#searchdock) pour toutes les propriétés.

## Index local

Par défaut, aucun backend n'est nécessaire. Le thème utilise l'index que construit la recherche locale de VitePress, un par langue, téléchargé seulement à la première recherche dans cette langue. Les pages sont découpées en sections à leurs titres, et [MiniSearch](https://lucaong.github.io/minisearch/) fait la correspondance : le chinois et le japonais sont découpés en mots, un mot peut n'être saisi qu'en partie, et les mots plus longs tolèrent une faute de frappe ou deux. Tant que le serveur de développement tourne, l'index suit vos modifications.

## Utiliser une autre recherche

Si vous avez besoin de recherche sémantique ou de contenu extérieur au site, passez à un endpoint HTTP ou à une fonction JS de votre choix :

```ts
// docs/config.ts
search: {
  backend: { type: "http", endpoint: "/api/docs/search" },
},
```

Voir l'[API](/fr-FR/theme/search/api) pour écrire un backend et pour le format des résultats, et les [Détails](/fr-FR/theme/search/details) pour l'animation du panneau, ainsi que la construction et le classement de l'index.
