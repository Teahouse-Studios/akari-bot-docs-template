---
tab: Détails
---

# Paramètres et apparence : détails

## Résolution du mode clair et du mode sombre

| Mode | Résolution |
| --- | --- |
| Système `auto` | Lit `prefers-color-scheme`, et la page suit quand le système change. Quand le navigateur ne peut pas fournir de préférence système (il ne prend pas en charge cette requête média, ou ni le clair ni le sombre ne correspondent), le mode est traité comme « Selon l'heure » |
| Clair `light` | Clair |
| Sombre `dark` | Sombre |
| Selon l'heure `time` | Sombre quand l'heure locale est avant 7 h 00 ou après 18 h 59, clair sinon |

En mode « Selon l'heure », et en mode « Système » quand le navigateur ne peut pas indiquer de préférence système, le thème lit l'heure actuelle une fois par minute et bascule automatiquement au passage de 7 h ou de 19 h. Sinon, ce minuteur ne tourne pas. Le résultat (`light` ou `dark`) est écrit dans l'attribut `scheme` de `m3e-theme` et dans la classe `html.dark`.

## Avant la première image

`akariHead()` ajoute un petit script en ligne dans `<head>`. Il lit le mode enregistré dans `localStorage`, le résout comme dans le tableau ci-dessus et définit `html.dark` avant que la première image ne soit peinte : une page sombre ne s'affiche donc jamais brièvement en clair. Le script utilise la même `storageKey` et le même mode par défaut que le thème : si vous changez l'un ou l'autre, passez la même valeur à `akariHead()`. Le serveur de développement ne pré-rend pas les pages : ce n'est donc que dans le résultat du build que le script s'exécute avant la première image.

## Snackbar de changement

Chaque appui sur le bouton d'apparence affiche une `m3e-snackbar` en bas de l'écran, qui disparaît après environ 2,5 secondes. Un nouvel appui remplace l'ancienne snackbar par une nouvelle. Le texte vient des textes d'interface `schemeChanged` (« Thème changé : {mode} ») et `schemeChangedFollowing` (« Thème changé : {mode} ({scheme}) »). Voir [Internationalisation](/fr-FR/theme/i18n/api#messages).

## Où s'applique chaque option

La couleur, la variante, le mode clair et le mode sombre, le contraste et les animations sont liés au `m3e-theme` à la racine de l'application :

```vue
<m3e-theme
  :color="heroColor ?? settings.color"
  :variant="settings.variant"
  :scheme="resolvedScheme"
  :contrast="settings.contrast"
  :motion="settings.motion"
  strong-focus
>
  <!-- application -->
</m3e-theme>
```

Le sens du texte et la taille du texte ne passent pas par des attributs de composant. Ils sont écrits sur l'élément racine du document :

```ts
document.documentElement.dir =
  settings.direction === "auto" ? dir : settings.direction;
document.documentElement.style.fontSize = settings.textSize;
```

- `auto` (« Selon la langue ») prend le `dir` de la langue courante (`useData().dir`, issu de la configuration de langue, ou du pack de langue quand la configuration ne le définit pas) et change avec lui quand vous passez à une autre langue. Une langue qui s'écrit de droite à gauche, comme l'arabe, s'affiche donc de droite à gauche par défaut.
- Changer le sens du texte agit sur la mise en page bidirectionnelle et sur l'orientation des icônes des composants m3e, et l'animation de changement de page des pages parallèles s'inverse avec lui.
- Changer la taille du texte agit sur toutes les tailles calculées en `rem` : le texte, les titres, les espacements, les blocs de code et le reste s'agrandissent proportionnellement. La taille du texte des composants m3e est fixée par les jetons des composants : elle ne double donc pas simplement, mais la mise en page reste utilisable.
- La mise en page synchronise la palette générée par `m3e-theme` avec l'élément racine. `html` et `body`, la barre d'application, la navigation, la surface du document, la table des matières et toutes les boîtes de dialogue suivent la couleur source, la variante, le mode clair ou sombre et le contraste. Il n'existe pas de jeu distinct de couleurs fixes.

## Lecture, écriture et repli

- Le rendu côté serveur ne produit que les valeurs par défaut. `localStorage` est lu après le montage de la page dans le navigateur, pour éviter une incohérence d'hydratation. Le mode clair ou sombre est appliqué en avance par le script décrit plus haut.
- Les paramètres sont écrits dans `localStorage` après chaque changement. Quand le contenu stocké est corrompu, qu'un champ manque ou qu'une valeur est invalide, chaque champ revient à sa valeur par défaut, indépendamment des autres.
- Quand la lecture ou l'écriture échoue à cause de la navigation privée ou d'un quota plein, l'erreur est ignorée silencieusement et la page fonctionne normalement.
- Avec `persist: false`, les paramètres ne durent que le temps de la page courante, et reviennent aux valeurs par défaut au rechargement.
- Chaque navigateur, domaine et port a son propre `localStorage`. Les paramètres ne se synchronisent pas entre appareils et ne sont jamais réécrits dans le dépôt.

## Boîte de dialogue des paramètres

La boîte de dialogue des paramètres utilise la même transformation de conteneur M3 que la recherche et le sélecteur de langue. Le bouton se déploie en un panneau centré, et l'icône d'engrenage placée avant le titre du panneau est le bouton lui-même. La fermeture refait le même chemin en sens inverse. Avec l'animation expressive, le déploiement et le repli ont tous deux un léger rebond. `Escape`, un clic sur le voile ou le bouton de fermeture en haut à droite la ferment, et le focus revient au bouton qui l'a ouverte. Pour le détail de l'animation, voir [Recherche](/fr-FR/theme/search/details#container-transform). Lorsque la fenêtre est trop courte pour afficher toutes les options (téléphone, fenêtre basse), le contenu du panneau défile sous son titre, avec une barre de défilement fine.

- La couleur utilise un `<input type="color">` natif. Choisir une couleur génère aussitôt une nouvelle palette.
- La variante utilise `m3e-filter-chip-set` (apparence de sélection multiple, comportement de sélection unique). Le contraste, les animations, le sens du texte et la taille du texte utilisent `m3e-segmented-button`.
- L'API des paramètres fournit `reset()`, mais l'interface n'a pas de bouton « Rétablir les valeurs par défaut », comme dans la documentation officielle.
