---
tab: Détails
---

# Recherche : détails

## Transformation de conteneur {#container-transform}

Le panneau de recherche est un `<dialog>` modal natif. Il se déploie avec une transformation de conteneur M3 construite sur la Web Animations API. Le sélecteur de langue et la boîte de dialogue des paramètres utilisent la même implémentation (`useContainerTransform`).

- Ce qui s'anime est toujours le vrai panneau, mis en page à sa taille finale dès la première image. Au départ, une fenêtre en forme de bouton (une capsule `clip-path`) ne laisse voir que le début de la barre de recherche du panneau, et une translation place cette fenêtre au-dessus du bouton. La première image ressemble donc toujours au champ de recherche « icône + texte indicatif ».
- Pendant le déploiement, la translation revient à zéro et la fenêtre s'agrandit jusqu'au panneau entier (ombre comprise). Le contenu se révèle progressivement, la zone des résultats et le bouton de fermeture apparaissent ensemble en fondu, et aucune surface vide n'apparaît en cours de route. L'état final de l'animation est le style au repos du panneau : retirer l'animation ne provoque donc aucun saut.
- Une copie en pixels du bouton se place sur la fenêtre et se déplace avec elle. Les contenus du bouton et du panneau ne se fondent pas l'un dans l'autre : l'un disparaît avant que l'autre n'apparaisse (fade through M3). À l'ouverture, la surface du panneau apparaît d'abord en fondu sous la copie, puis la copie disparaît, puis la barre de recherche du panneau apparaît. Deux textes de tailles différentes ne s'affichent jamais en même temps.
- À la fermeture, le panneau repart par le même chemin : la zone des résultats et la barre de recherche disparaissent d'abord, la copie du bouton réapparaît à mi-parcours pour prendre le relais, puis la surface du panneau disparaît en dessous. Dans la dernière portion du retour vers le bouton, rebond de l'animation expressive compris, ce que vous voyez est le bouton lui-même, et l'animation se termine exactement comme le vrai bouton. Un bouton sans fond (comme le bouton en forme d'engrenage) ne fait donc pas apparaître une tache de fond à la fin. Si l'ouverture ou la fermeture est interrompue, le mouvement repart en sens inverse depuis l'image courante.
- La taille et le rayon des coins de la fenêtre viennent de la position et de la taille actuelles du bouton. La position du panneau est de nouveau mesurée au début de l'animation ; rien ne dépend de coordonnées fixes.

| Animations | Déploiement | Repli |
| --- | --- | --- |
| Standard | Environ 300ms, `cubic-bezier(0.2, 0, 0, 1)` | Environ 250ms, sans rebond |
| Expressif | Environ 500ms, `cubic-bezier(0.38, 1.21, 0.22, 1)`, dépasse légèrement puis se stabilise | Environ 400ms, même courbe, avec un léger rebond au repli |

Quand l'option « réduire les animations » du système est activée, le panneau s'ouvre et se ferme sans animation. La boîte de dialogue native fournit l'affichage dans la couche supérieure (top layer), un arrière-plan inerte et la fermeture avec `Esc`. À l'ouverture, le focus passe dans le champ de saisie ; à la fermeture, il revient là où il était avant l'ouverture, ou sur le bouton de recherche si cet élément n'est plus disponible.

## Construction de l'index

- La recherche locale de VitePress construit l'index : elle rend chaque page avec le moteur Markdown du site, la découpe en sections aux titres qui ont une ancre, et construit un index par langue, chacun regroupé dans un seul fichier au moment du build. Tant que le serveur de développement tourne, l'index est mis à jour quand les pages changent et envoyé au navigateur.
- Les chemins et les ancres viennent des pages rendues : ils correspondent donc aux vrais chemins des pages et aux ids de titre, y compris les chemins réécrits et les titres à ancre personnalisée.
- Le texte est le HTML rendu sans balises, blocs de code compris, donc les noms qui figurent dans du code sont eux aussi trouvables. Les pages dont le frontmatter contient `search: false` sont exclues.
- Le chinois et le japonais n'ont pas d'espaces : ils sont découpés en mots avec `Intl.Segmenter`. Le thème découpe les requêtes de la même façon (`tokenizeSearchText`), si bien que les requêtes et l'index se rejoignent sur les mêmes mots.

## Correspondance et classement

La requête est découpée en mots comme l'index, et MiniSearch les met en correspondance :

- Un mot correspond tel que saisi, ou comme début d'un mot plus long. Les mots plus longs peuvent comporter une faute de frappe, avec une distance d'édition allant jusqu'à 20 % de leur longueur.
- Chaque mot doit correspondre. Quand aucune section ne les contient tous, on accepte à la place les sections qui en contiennent au moins un.
- La pertinence est calculée avec BM25, avec un poids de 4 pour le titre de la section, 2 pour le texte et 1 pour les titres qui la précèdent.

Les résultats sont ensuite classés par paliers selon la requête telle que saisie, où « titre » désigne le titre propre de la section :

| Palier | Condition |
| --- | --- |
| 4 | Le titre est exactement la requête entière |
| 3 | Le titre commence par la requête entière |
| 2 | Le titre contient la requête entière |
| 1 | Les titres qui précèdent ou le texte contiennent la requête entière mot pour mot, comme une expression chinoise |
| 0 | Tout le reste |

Les paliers les plus élevés viennent en premier. Dans les paliers 4 et 3, une page passe avant ses sections. À l'intérieur d'un palier, les résultats suivent la pertinence de MiniSearch, puis leur titre. Un seul résultat est conservé par URL, et `maxResults` au plus sont renvoyés. Chaque résultat porte les mots qui ont correspondu (`terms`), y compris ceux saisis en partie ou avec une faute, et le panneau les met en évidence.

Chaque langue a son propre index : les résultats viennent donc toujours de la langue courante.

## Chargement et cache

- L'index de chaque langue se charge à la première recherche dans cette langue, puis il est mis en cache dans la page. En développement, le cache est vidé quand l'index est mis à jour.
- La saisie est soumise à un anti-rebond de `debounce`. Quand une nouvelle requête est saisie ou que le panneau se ferme, la requête en cours est interrompue au moyen d'`AbortSignal`.
- Si l'index ne se charge pas ou est mal formé, le panneau affiche une erreur et un bouton pour réessayer.

## États du panneau

| État | Affichage |
| --- | --- |
| Saisie vide | Indication de recherche et aide sur le raccourci |
| Chargement | Indicateur de chargement M3 |
| Résultats | Titre de la page, titre de section, extrait et correspondances mises en évidence ; l'élément courant a un fond `secondary-container` ; la liste se lit comme un seul bloc : seuls les coins supérieurs du premier élément et les coins inférieurs du dernier sont arrondis, les éléments intermédiaires sont carrés |
| Aucun résultat | Une suggestion d'essayer un autre mot-clé |
| Échec | La cause de l'erreur et un bouton pour réessayer |

Ouvrir un résultat passe par le routeur de VitePress, ce qui conserve la navigation SPA. Le champ de saisie, la liste des résultats et le message d'erreur ont chacun un nom ARIA. Le rappel du raccourci dans la barre d'application utilise le style typographique `label-small` et des touches entièrement arrondies ; les indications des flèches, de `Enter` et de `Esc` dans le panneau utilisent des coins `shape-extra-small`.

## Limites connues

- La recherche locale met en correspondance des mots, sans recherche sémantique ni synonymes. Si vous en avez besoin, utilisez un backend HTTP ou un backend enregistré. Le découpage du chinois et du japonais en mots dépend de `Intl.Segmenter` du navigateur ; les navigateurs qui en sont dépourvus ne peuvent découper qu'aux espaces et à la ponctuation.
- L'index local n'est construit que pendant que le serveur de développement tourne ou pendant un build. Le Markdown modifié alors que le serveur de développement est arrêté devient trouvable après le prochain `npm run dev` ou `npm run build`.
