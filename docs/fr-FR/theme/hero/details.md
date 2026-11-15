---
tab: Détails
---

# Hero : détails

## Extraction de la couleur

Une page avec un hero prend une couleur de l'image comme couleur source du thème.

- Elle utilise la bibliothèque officielle de Material, [material-color-utilities](https://github.com/material-foundation/material-color-utilities) : l'image est réduite à 128px au plus, quantifiée en ses couleurs principales, puis les couleurs sont notées selon leur aptitude à servir de thème d'interface. C'est le même algorithme qu'Android utilise pour tirer les couleurs du fond d'écran. Les pixels transparents et les couleurs trop ternes sont écartés.
- L'extraction s'exécute dans le navigateur, et le résultat est mis en cache dans `localStorage` par URL d'image : il s'applique donc immédiatement lors des visites suivantes. À la première visite, la page change de couleur une fois, après le chargement de l'image. La bibliothèque de couleurs se charge à la demande, uniquement sur les pages avec un hero ; elle ne fait partie ni des autres pages ni du rendu côté serveur.
- En mode sombre, quand l'image `dark` est affichée, la couleur vient de cette image.
- Pour une image hébergée sur un autre domaine, le serveur doit envoyer des en-têtes CORS pour que ses pixels puissent être lus ; sinon, la couleur du lecteur reste en place. Vous pouvez aussi définir la couleur directement avec `color`.
- Quand l'image n'a aucune couleur assez vive, la couleur du lecteur reste également en place.

## Titre

Avec un hero, le titre de la page s'affiche dans la carte hero et le premier `# Titre` du Markdown est masqué : la page n'a donc toujours qu'un seul `h1` visible. Le texte du titre vient du `title` du frontmatter ou, à défaut, du premier titre `#`, ce qui suit la règle de VitePress pour les titres de page. Le titre du hero porte `data-akari-page-title` ; une fois qu'il est passé sous la barre d'application, la barre d'application affiche le titre de la page.

Les dates sont mises en forme selon la langue de la page : `2026-05-19` s'affiche « 2026年5月19日 » sur les pages en chinois et « 19 mai 2026 » sur les pages en français.

## Mise en page

- Les deux cartes remplissent le haut de la surface du document et ne sont pas limitées par la `--akari-doc-max-width` du contenu. La distance entre les cartes et les bords haut, gauche et droit de la surface, ainsi que la distance entre les deux cartes, valent toutes `--akari-doc-hero-inset`. Les coins des cartes sont concentriques avec ceux de la surface.
- La taille du titre et la marge intérieure des cartes suivent la largeur du hero lui-même (requêtes de conteneur), et non celle de la fenêtre : quand le tiroir de navigation s'ouvre et que l'espace disponible se réduit, le titre rétrécit avec lui.
- Quand la fenêtre fait moins de 840px de large, les deux cartes s'empilent, le texte en haut et l'image affichée en 16:10.
- Quand la page appartient à un groupe de pages parallèles, la barre d'onglets se place au-dessus du hero, et le hero se place à la même distance sous la barre d'onglets. Ainsi, la barre d'onglets reste au même endroit sur chaque page du groupe et ne saute pas quand vous passez d'une page avec hero à une page sans hero.
- L'image porte `fetchpriority="high"` : elle se charge en priorité, en tant que plus grand élément du premier écran. Le hero se trouve dans la surface du document : il disparaît et réapparaît donc en fondu avec la surface quand la page change.

## Motifs et lueur

- Les deux cartes utilisent le même motif. Il est le plus net dans le coin supérieur côté fin de la carte de texte et dans le coin inférieur côté début de la carte d'image, et s'estompe à partir de chacun : ensemble, les deux forment une diagonale.
- Le motif de la carte d'image se trouve sous l'image et n'apparaît que là où l'image est transparente ; une photo qui remplit la carte le recouvre entièrement.
- Quand le pointeur s'arrête sur une carte, une lueur très discrète de la couleur du thème s'allume autour de lui. Le motif est un peu plus net dans la lueur, le bord de la lueur s'estompe par paliers, et la lueur disparaît en fondu quand le pointeur s'éloigne. Un gestionnaire `pointermove` sur la surface du document écrit la position de la lueur à chaque image (`--akari-light-x`, `--akari-light-y`), et il ne réagit qu'à la souris et au stylet. Le fait que la lueur s'affiche dépend aussi du pointeur : pendant que le lecteur utilise une souris ou un stylet, `html` porte `data-akari-hover`, retiré au premier toucher, au lieu de s'appuyer sur la requête de média `(hover: hover)`.
- Le motif est choisi dans le navigateur. Le rendu côté serveur n'a pas de motif, et le motif apparaît en fondu après le montage : les pages du serveur et du navigateur concordent donc, sans incohérence d'hydratation.
- Les appareils tactiles n'affichent que le motif statique, et le mode couleurs forcées n'affiche aucune décoration. La décoration se trouve sous le texte et les images : elle ne gêne donc ni la sélection ni les clics.

Les éléments du contenu qui ont un fond utilisent le même ensemble de motifs ; voir [Typographie](/fr-FR/styles/typography/api#patterns).
