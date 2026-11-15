---
tab: Détails
---

# Mise en page et barre d'application : détails

## Structure de la page

En simplifiant, la structure rendue par `AkariLayout.vue` est la suivante :

```text
<m3e-theme>
  <div class="akari-frame">                  Grille de la page : 3 colonnes, 2 lignes
    <div class="akari-frame__bar">
      <AppBar />                           Colonnes 2–3, collante
    </div>
    <DesktopNav />                         Rail : colonne 1, toute la hauteur ; tiroir épinglé : colonne 2
    <div class="akari-main">                 Colonne 3
      <main class="akari-doc">               Surface du document, repère principal de la page
        <DocTabs />                        Barre d'onglets des pages parallèles
        <Hero />                           Quand il y a un hero
        <div class="akari-doc__inner">       Couche de largeur maximale, animation de changement de page
          <div class="akari-doc__layout">
            <Content id="akari-doc-content" />
            <Toc />
          </div>
          <Pager />
        </div>
      </main>
      <Footer />                           Séparateur ondulé et surface du pied de page
    </div>
  </div>
  <DocFabs />                              Boutons d'action flottants
  <AppBarMenu />                           Menu « Plus »
  <m3e-drawer-container>                   Tiroir de navigation mobile
  <LocaleDialog /> <SettingsDialog />      Boîtes de dialogue des langues et des paramètres
</m3e-theme>
```

- C'est la fenêtre qui fait défiler la page, et non un conteneur de défilement interne. L'élément racine déclare `overflow-y: auto` pour que les observateurs de défilement de m3e puissent écouter le défilement du document. `scroll-padding-top` vaut la hauteur de la barre d'application plus `--akari-doc-gap` : les sauts vers les ancres s'arrêtent donc sous la barre d'application.
- Le rail et la barre d'application sont tous deux en `position: sticky`. Quand la fenêtre fait 960px de large ou plus, la cellule en haut du rail, aussi haute que la barre d'application, contient le logo du site, et le titre de la barre d'application ne garde que le nom du site et la version. Sans navigation sur ordinateur, les deux premières colonnes de la grille ont une largeur nulle.
- `m3e-theme` enveloppe toute l'application et fournit la couleur dynamique, le mode clair et le mode sombre, le contraste et les animations. La mise en page synchronise la palette courante avec l'élément racine : les couleurs de fond et de texte de `html` et de `body` la suivent.

## Barre d'application

### Jonction avec la surface

La barre d'application n'a ni couleur de fond, ni séparateur, ni ombre. Ce qui apparaît à travers est le fond de la page, et la surface du document passe dessous en défilant. Un masque de hauteur nulle est fixé au bord inférieur de la barre d'application. À chaque extrémité de la colonne du document, il dessine un coin inversé du même rayon que la surface : la surface reste ainsi arrondie là où la barre d'application la coupe.

Une fois que la surface du document est passée sous la barre d'application, `html` reçoit `data-akari-scrolled`, et un contour très léger apparaît en fondu autour de la surface du document et de la surface du pied de page (de la même intensité que le séparateur du rail, réglée par `--akari-doc-divider-strength` ; le bord inférieur du pied de page n'en a pas). Le premier enfant de chaque surface est un « chapeau de surface » qui colle au bord inférieur de la barre d'application. Il n'y reste que tant que sa propre surface est passée sous la barre d'application, et il dessine les coins inversés, deux arcs et le bord supérieur là où la surface est coupée : le contour forme donc là aussi une boucle complète. L'intensité du contour suit une transition grâce à la propriété personnalisée enregistrée `--akari-doc-edge-strength`, et elle est mélangée à la couleur de la surface pour donner une couleur opaque (`--akari-doc-edge-color`) : les chevauchements ne s'assombrissent donc pas. Aucune des deux propriétés n'est héritée : elles ne sont définies que sur les éléments qui dessinent le contour (les deux surfaces, leurs chapeaux et les coins des chapeaux), chacune avec la même durée et la même courbe de transition, si bien que chaque image du fondu ne recalcule et ne redessine que ces éléments plutôt que toute la page. Le fondu se déroule souvent pendant que la barre d'onglets s'envole vers la barre d'application.

### Changement de titre

Une fois que le titre de l'article (le `h1`, ou le titre du hero) est entièrement passé sous la barre d'application, le titre de la barre d'application passe du nom du site au titre de la page : le nom du site disparaît en fondu vers le haut et le titre de la page apparaît en fondu par le bas. Remonter inverse le mouvement. Le titre de page de la barre d'application est masqué pour les technologies d'assistance, afin qu'il ne soit pas lu une seconde fois en plus du `h1` du contenu. L'élément suivi est celui qui porte `data-akari-page-title` ou, à défaut, le premier `h1` du contenu.

### Regroupement des boutons

La barre d'application dispose les boutons de droite selon sa largeur réelle :

- Le nom du site garde toujours la place du logo, de la version et d'environ six caractères (tout le nom s'il est plus court). Quand l'affichage de tous les liens sociaux et du bouton des paramètres prendrait cette place, tous les boutons sauf la recherche se regroupent dans un bouton « Plus » (`more_vert`), qui ouvre un menu déroulant `m3e-menu`. Ils se déploient de nouveau dès que la fenêtre est assez large. Le regroupement et le déploiement sont tous deux des transitions de largeur avec 8px d'hystérésis, pour que les boutons ne basculent pas sans cesse quand la largeur oscille autour du seuil.
- Seul le nom du site décide du regroupement, et non le titre de page affiché après le défilement, car un titre de page peut être long et il est de toute façon tronqué.
- « Paramètres » dans le menu « Plus » ouvre la boîte de dialogue des paramètres, qui se déploie depuis le bouton « Plus » et s'y replie. Le menu est rendu en dehors du cadre de la page : il s'ouvre donc au bon endroit même après un défilement. Placer le focus sur un élément du menu ne fait pas défiler la page.
- Le champ de recherche a des paliers de taille selon la largeur de la fenêtre : sur grand écran, c'est un champ de recherche avec un texte indicatif et un rappel du raccourci ; en dessous de 768px, il se réduit à un bouton rond de 40px. Entre les paliers, la largeur et la marge intérieure changent en douceur, le texte indicatif disparaît en fondu et le rappel du raccourci se replie. Le champ de recherche ne participe pas au rétrécissement flex. Seule la largeur de la fenêtre fixe sa largeur : il n'interfère donc pas avec le calcul de la largeur du titre.

## Transitions de page

Quand vous allez vers un autre groupe de pages, toute la surface du document disparaît d'abord en fondu (environ 250ms). Une fois la nouvelle page chargée, elle apparaît en fondu (environ 450ms) et remonte de 16px jusqu'à sa place, portée par le ressort spatial lent de m3e. Le fondu de sortie se déroule pendant le chargement de la nouvelle page : il ne ralentit donc pas la navigation. Les sauts vers des ancres dans une même page ne jouent aucune animation. Passer d'une page à l'autre au sein d'un même groupe parallèle fait plutôt glisser le contenu latéralement ; voir [Navigation latérale](/fr-FR/theme/sidebar/details#switching-pages). Quand l'option « réduire les animations » est activée dans le système, les pages changent sans animation.

## Barre de chargement

La barre est un indicateur de progression linéaire M3 de 4px en haut de la fenêtre : l'indicateur actif est de la couleur primaire, sans piste. Elle se place au-dessus de la barre d'application et grandit du début de la ligne vers sa fin, en miroir dans les mises en page de droite à gauche.

- Navigation dans le site : elle démarre quand VitePress commence à charger la page suivante. La taille du script de cette page est inconnue, donc la progression avance vers 70 % par pas de plus en plus petits sans l'atteindre. Une fois la page rendue, le thème recense les images et les polices encore en cours de chargement, et chacune qui se termine rapproche la progression de 100 % d'une part. Les images avec `loading="lazy"` ne se chargent qu'une fois que le lecteur a fait défiler la page jusqu'à ce qu'elles soient près de la fenêtre d'affichage, et ne sont comptées qu'à ce moment-là ; les autres sont comptées dès le chargement de la page. Les images non affichées (comme l'image claire ou sombre du hero que le mode courant n'utilise pas) ne comptent pas. Chaque ressource est attendue au plus 8 secondes.
- Ouverture du site : avant l'exécution des scripts, la barre rendue par le serveur avance seule avec une animation CSS. Quand le script prend le relais, il continue là où la barre en est et attend l'événement `load` de la page, ses images et ses polices. Sans scripts, une règle `<noscript>` dans `akariHead()` la masque.
- Un chargement qui se termine en moins de 150ms n'affiche pas de barre, donc elle ne fait jamais que clignoter. À 100 %, la barre reste 200ms, puis disparaît en fondu. Un chargement encore en cours après 15 secondes cesse de s'afficher.
- La barre a `role="progressbar"` et `aria-valuenow`, tire son nom de la chaîne d'interface `loadingLabel` et est masquée pour les technologies d'assistance tant qu'elle n'est pas affichée. Avec « réduire les animations » activé dans le système, elle n'a aucune transition ; en mode couleurs forcées, elle utilise la couleur de surbrillance du système.
- Le calcul de la progression est dans `loading.ts`, et le suivi dans le composable `useLoadingBar`, qui se branche sur `onBeforePageLoad` du routeur VitePress comme le font les transitions de page.

## Table des matières

- **Section courante** : le dernier titre qui a franchi la ligne de lecture (96px sous la barre d'application). Une fois arrivé en bas de la page, le dernier titre encore à l'écran.
- **Longue table des matières** : au-delà de 15 entrées, la liste n'est pas plus haute que 15 entrées. Elle reçoit sa propre barre de défilement fine et défile avec votre position de lecture pour garder l'entrée courante au milieu.
- **Clic** : fait défiler la page en douceur jusqu'au titre, déplace le focus sur le titre et met à jour le hash de l'URL. Pendant le défilement, la mise en évidence reste sur l'entrée cliquée jusqu'à l'arrêt du défilement (événement `scrollend`, ou aucun nouveau défilement pendant 200ms). Les entrées portent `target="_self"` : la table des matières gère donc elle-même le clic, et le routeur de VitePress ne remplace pas le défilement en douceur par un saut instantané.
- **Structure** : la table des matières lit les titres `h2` à `h{maxDepth}` du contenu et ignore ceux qui portent `m3e-toc-ignore`. Elle se reconstruit après un changement de route ou une mise à jour du contenu. L'entrée courante porte `aria-current="location"`. L'apparence suit `m3e-toc` : un surtitre, des entrées en `body-large` et un indicateur glissant au contour arrondi.
- **Position** : la table des matières reste fixée à `--akari-doc-toc-offset` sous la barre d'application. Après la fin du contenu, elle défile avec la page : elle ne recouvre donc jamais le pied de page.

## Boutons d'action flottants

Les deux boutons sont des FAB M3 de 56px : coins `large`, couleurs `secondary-container` et élévation de niveau 1 (niveau 2 au survol du pointeur). Ils se placent à 16px des bords de la fenêtre quand celle-ci fait moins de 840px de large, et à 24px sinon. Ils sont masqués à l'impression.

### Haut de page

- Apparaît en s'agrandissant et en fondu quand la page quitte le haut (`scrollY > 0`), et disparaît en rétrécissant et en fondu quand la page revient en haut.
- Un clic fait remonter la page en haut avec `cubic-bezier(0.2, 0, 0, 1)`. La durée augmente avec la distance : `300ms + distance × 0.12`, ramenée entre 400 et 900ms. Pendant le trajet, le bouton se déploie dans sa forme étendue avec le texte « Haut de page », et il se replie à l'arrivée.
- Si vous appuyez de nouveau dessus pendant le trajet, ou si vous faites défiler avec la molette, au toucher ou au clavier, la page s'arrête là où elle est et le bouton se replie.
- Quand l'option « réduire les animations » est activée dans le système, la page saute directement en haut.

### Table des matières sur écran étroit

- Apparaît quand la fenêtre fait moins de 960px de large et que la page a une table des matières, au-dessus du bouton de retour en haut. Quand le bouton de retour en haut est masqué, il descend pour prendre sa place.
- Un clic déploie le bouton vers le haut et vers la gauche en un panneau : large de `min(100vw - 32px, 360px)`, aussi haut que ses entrées l'exigent, jusqu'à 60 % de la fenêtre. Le bouton lui-même devient une barre le long du bas du panneau, avec le texte « Sommaire ».
- Comme dans la table des matières sur ordinateur, un contour arrondi marque la section courante, et son texte est en gras. Le contour glisse avec votre position de lecture.
- À l'ouverture, le panneau défile jusqu'à la section courante et y place le focus. Le panneau ne peut pas défiler avant la fin de l'animation de déploiement : aucune barre de défilement n'apparaît donc pendant le déploiement.
- Un clic sur une entrée fait défiler la page en douceur jusqu'au titre et met à jour le hash. Le panneau reste ouvert, et le contour reste sur l'entrée cliquée pendant le défilement. Cliquez en dehors du panneau (sur le voile), cliquez sur la barre « Sommaire » en bas ou appuyez sur `Esc` pour fermer le panneau ; le focus revient au bouton. Le panneau se ferme aussi de lui-même quand la page change.

## Pied de page

- Le séparateur ondulé se trouve sur le fond de la page, entre les deux surfaces, et prend sa couleur dans `--akari-wavy-divider-color`.
- Le pied de page est une surface distincte dont seuls les deux coins supérieurs sont arrondis, et il s'étend jusqu'au bas de la page. C'est le repère `contentinfo` de la page, en dehors de `<main>`.
- Les liens des colonnes de liens ne sont pas soulignés au repos. Au survol du pointeur ou au focus clavier, un soulignement se trace du début à la fin du texte en 300ms ; quand le pointeur ou le focus s'en va, il poursuit sa course vers la fin pour disparaître.
- Les liens sociaux n'apparaissent que dans la barre d'application ou dans le menu « Plus » et ne sont pas répétés dans le pied de page : les boutons d'action flottants en bas à droite ne les recouvrent donc jamais.

## Changements de taille de la fenêtre

- Quand la largeur franchit 960px, la mise en page change en douceur : le rail referme sa colonne et glisse au-delà du bord de la fenêtre (ou entre en glissant, dans l'autre sens), la barre d'application et la surface du document se déplacent avec lui, et le bouton de menu et le logo de la barre d'application se déploient ou se replient. Sur grand écran, le tiroir de navigation mobile reste mis en page mais invisible : après le passage à un écran étroit, il s'ouvre donc déjà dans son état final.
- En dessous de 600px, la surface du document s'étend jusqu'aux bords de la fenêtre, ne garde arrondis que ses deux coins supérieurs, et sa marge intérieure se réduit à 20px.
- Les points de rupture utilisés dans les scripts se trouvent dans `constants.ts` (`AKARI_NAV_RAIL_QUERY`, `AKARI_NAV_DRAWER_PINNED_QUERY`). Si vous les modifiez, gardez-les cohérents avec les requêtes média de `base.css`.

## Premier rendu

Tant que les composants m3e ne sont pas enregistrés dans le navigateur, tout composant pas encore mis à niveau (`:not(:defined)`) reste masqué, et la page n'affiche que sa couleur de fond. Une fois l'enregistrement terminé, `html` reçoit `data-akari-ready` et la page apparaît dans sa mise en page finale en une seule image. Si les scripts sont désactivés ou ne se chargent pas, le contenu s'affiche en HTML simple au bout de 3 secondes. Le bouton de copie des blocs de code est le `button.copy` qu'injecte VitePress ; le thème ne fait que modifier son style.
