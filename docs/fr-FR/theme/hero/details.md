---
tab: Détails
---

# Hero : détails

## Extraction de la couleur

Une page avec un hero prend une couleur de l'image comme couleur source du thème.

- Elle utilise la bibliothèque officielle de Material, [material-color-utilities](https://github.com/material-foundation/material-color-utilities) : l'image est réduite à 128px au plus, quantifiée en ses couleurs principales, puis les couleurs sont notées selon leur aptitude à servir de thème d'interface. C'est le même algorithme qu'Android utilise pour tirer les couleurs du fond d'écran. Les pixels transparents et les couleurs trop ternes sont écartés.
- L'extraction a lieu au build, dans le plugin Vite `.vitepress/media-colors.ts` : le HTML produit contient déjà la couleur, donc la page n'attend jamais une image et ne lit plus ses pixels ; le rendu serveur et l'hydratation utilisent la même valeur.
- Le résultat est mis en cache dans `.vitepress/cache/media-colors.json`, indexé par la date de modification et la taille du fichier : seules les images modifiées sont rééchantillonnées. Rebâtissez après avoir changé une image ; il n'y a pas de cache à vider.
- Les images claire et sombre sont échantillonnées séparément : le jour utilise la couleur de l'image `light`, la nuit celle de l'image `dark` lorsqu'elle est affichée.
- Une image distante est téléchargée une fois au build pour l'échantillonnage ; un résultat réussi est mis en cache 7 jours. Si le build ne parvient pas à la récupérer, la couleur du lecteur reste en place. Vous pouvez aussi définir la couleur directement avec `color`.
- Quand l'image n'a aucune couleur assez vive, la couleur du lecteur reste également en place.

## Chargement

- Les images du contenu reçoivent `loading="lazy"` et `decoding="async"` au rendu du Markdown ; les balises `<img>` écrites directement dans le HTML aussi. Un attribut `loading` ou `decoding` explicite n'est jamais remplacé.
- Dans le navigateur, chaque image du contenu est enveloppée dans `.akari-lazy-media` : jusqu'à son arrivée, un voile la couvre, avec une bille `m3e-loading-indicator` au centre. Le voile reprend la taille enregistrée au build et la couleur extraite de l'image, puis s'efface avec `emphasized-accelerate` de MD3 quand elle est chargée. Un `<picture>` est enveloppé avec ses `<source>`, donc le choix de la source reste intact.
- Le hero utilise le même indicateur, posé sur sa carte d'image, et n'attend que l'image affichée par le mode clair ou sombre. L'image sombre n'est pas téléchargée en mode clair, et inversement.
- Une image rapide ne fait pas clignoter le voile : il n'apparaît qu'après environ 120 ms. Si le système demande moins d'animations, il n'y a pas d'animation : le voile apparaît ou disparaît d'un coup.
- Les vignettes du composant `ImagePreview` ont leur propre cadre : avant l'arrivée de l'image elles prennent son ratio calculé au build, affichent la même bille teintée et ignorent les clics. L'aperçu ouvert montre lui aussi la bille au ratio et à la couleur de l'image. Elles ne sont pas enveloppées, pour ne pas modifier leurs coins ni leur zone de clic.

## Titre

Avec un hero, le titre de la page s'affiche dans la carte hero et le premier `# Titre` du Markdown est masqué : la page n'a donc toujours qu'un seul `h1` visible. Le texte du titre vient du `title` du frontmatter ou, à défaut, du premier titre `#`, ce qui suit la règle de VitePress pour les titres de page. Le titre du hero porte `data-akari-page-title` ; une fois qu'il est passé sous la barre d'application, la barre d'application affiche le titre de la page.

Les dates sont mises en forme selon la langue de la page : `2026-05-19` s'affiche « 2026年5月19日 » sur les pages en chinois et « 19 mai 2026 » sur les pages en français.

## Mise en page

- Les deux cartes remplissent le haut de la surface du document et ne sont pas limitées par la `--akari-doc-max-width` du contenu. La distance entre les cartes et les bords haut, gauche et droit de la surface, ainsi que la distance entre les deux cartes, valent toutes `--akari-doc-hero-inset`. Les coins des cartes sont concentriques avec ceux de la surface.
- La taille du titre et la marge intérieure des cartes suivent la largeur du hero lui-même (requêtes de conteneur), et non celle de la fenêtre : quand le tiroir de navigation s'ouvre et que l'espace disponible se réduit, le titre rétrécit avec lui.
- Quand la fenêtre fait moins de 840px de large, les deux cartes s'empilent, le texte en haut et l'image affichée en 16:10.
- Quand la page appartient à un groupe de pages parallèles, la barre d'onglets se place au-dessus du hero, et le hero se place à la même distance sous la barre d'onglets. Ainsi, la barre d'onglets reste au même endroit sur chaque page du groupe et ne saute pas quand vous passez d'une page avec hero à une page sans hero.
- L'image porte `loading="lazy"` et `fetchpriority="high"` : sur le premier écran, le navigateur la charge tout de suite et la traite comme le plus grand élément ; quand la fenêtre est étroite et que le hero passe sous le premier écran, elle attend d'approcher la fenêtre. Le hero se trouve dans la surface du document : il disparaît et réapparaît donc en fondu avec la surface quand la page change.

## Motifs et lueur

- Les deux cartes utilisent le même motif. Il est le plus net dans le coin supérieur côté fin de la carte de texte et dans le coin inférieur côté début de la carte d'image, et s'estompe à partir de chacun : ensemble, les deux forment une diagonale.
- Le motif de la carte d'image se trouve sous l'image et n'apparaît que là où l'image est transparente ; une photo qui remplit la carte le recouvre entièrement.
- Quand le pointeur s'arrête sur une carte, une lueur très discrète de la couleur du thème s'allume autour de lui. Le motif est un peu plus net dans la lueur, le bord de la lueur s'estompe par paliers, et la lueur disparaît en fondu quand le pointeur s'éloigne. Un gestionnaire `pointermove` sur la surface du document écrit la position de la lueur à chaque image (`--akari-light-x`, `--akari-light-y`), et il ne réagit qu'à la souris et au stylet. Le fait que la lueur s'affiche dépend aussi du pointeur : pendant que le lecteur utilise une souris ou un stylet, `html` porte `data-akari-hover`, retiré au premier toucher, au lieu de s'appuyer sur la requête de média `(hover: hover)`.
- Le motif est choisi dans le navigateur. Le rendu côté serveur n'a pas de motif, et le motif apparaît en fondu après le montage : les pages du serveur et du navigateur concordent donc, sans incohérence d'hydratation.
- Les appareils tactiles n'affichent que le motif statique, et le mode couleurs forcées n'affiche aucune décoration. La décoration se trouve sous le texte et les images : elle ne gêne donc ni la sélection ni les clics.

Les éléments du contenu qui ont un fond utilisent le même ensemble de motifs ; voir [Typographie](/fr-FR/styles/typography/api#patterns).
