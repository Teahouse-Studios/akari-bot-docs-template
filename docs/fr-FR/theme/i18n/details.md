---
tab: Détails
---

# Internationalisation : détails

## À quelle langue appartient une page

Le chemin détermine la langue : une page dont le chemin commence par `/<dossier de langue>/` appartient à cette langue, et toutes les autres pages appartiennent à la langue racine. Dans les sources, les pages de la langue racine se trouvent dans leur propre dossier (`docs/en-US/`), mais elles sont servies sans le nom du dossier ; voir [Rédiger des pages : détails](/fr-FR/getting-started/writing/details#path-rules).

La configuration qu'obtient une page est le `config.ts` de son dossier de langue, appliqué par-dessus la configuration partagée et la configuration de locale de VitePress ; voir [Configuration : détails](/fr-FR/getting-started/configuration/details#how-the-two-levels-layer).

## Choix du pack de langue

1. Les packs possibles sont les six packs intégrés (`zh`, `en`, `ja`, `ko`, `fr`, `ar`) plus ceux de `languages` ; un pack qui porte le code d'un pack intégré s'applique par-dessus celui-ci.
2. Prendre le `lang` de la langue courante, le mettre en minuscules (en remplaçant `_` par `-`) et chercher un pack qui porte exactement ce code.
3. S'il n'y en a pas, comparer la langue principale : `zh-CN` et `zh-TW` utilisent tous deux le chinois, `en-GB` utilise l'anglais et `fr-CA` utilise le français.
4. S'il n'y en a toujours pas, utiliser l'anglais.
5. Combler les manques : les textes d'interface manquants sont en anglais, un pack sans `fonts` utilise les polices du thème, et un pack sans `dir` s'écrit de gauche à droite.
6. Les `messages`, `fonts`, `dir` et `markdown` écrits dans la configuration de langue s'appliquent par-dessus le pack.

Lorsque `settings.title`, `settings.labels`, `toc.overline`, `footer.message` et `search.placeholder` ne sont pas définis, ils proviennent aussi de cette table : une seule configuration partagée a ainsi des valeurs par défaut adaptées dans chaque langue. Les textes écrits dans la configuration partagée sont hérités par toutes les langues ; les textes qui varient selon la langue vont dans la configuration de langue.

## Où les packs de langue sont utilisés {#where-language-packs-are-used}

- Au moment du build, `akariContent` génère une locale VitePress pour chaque langue. `label` vaut par défaut le nom de la langue dans sa propre langue, fourni par `Intl.DisplayNames`, avec une majuscule initiale (comme `Français`) ; `dir` vaut par défaut le sens du pack ; `markdown` reprend les textes Markdown du pack, avec ceux de la configuration de langue appliqués par-dessus ; et `head` contient les balises de polices de la langue. VitePress rend le bouton de copie des blocs de code et les titres des conteneurs à partir du `markdown` de la locale.
- Dans la page, le thème résout les textes d'interface et les polices de la langue courante : les `messages` et les `fonts` de `useAkariConfig()`.
- Les parties d'une page marquées d'un attribut `lang` (comme les noms des langues dans la boîte de dialogue des langues) utilisent la pile de polices de cette langue. Ces règles sont générées à partir de chaque pack qui a des `fonts` ; les feuilles de style ne nomment aucune langue.

## Où mène le changement de langue

1. Transposer le chemin courant dans la langue cible : `/getting-started/installation.html` → `/zh-CN/getting-started/installation.html`, et retirer le préfixe dans l'autre sens.
2. Si la navigation de la langue cible contient ce chemin, l'ouvrir. La navigation comprend chaque page d'un groupe de pages parallèles.
3. Sinon, ouvrir la page d'accueil de la langue cible : `/` pour la langue racine, `/<dossier de langue>/` pour les autres.

Seule la navigation de la langue cible compte : une page absente de la navigation (par exemple, une page hors de la structure) n'est donc jamais une cible de changement de langue.

## Boîte de dialogue des langues

- Le bouton de langue est un bouton icône rond à contour (`m3e-icon-button variant="outlined"`). Il n'est pas rendu quand il n'y a qu'une seule langue.
- La boîte de dialogue utilise la même transformation de conteneur que le panneau de recherche : le bouton se déploie en un panneau centré, l'icône placée avant le titre du panneau est le bouton lui-même, et à la fermeture le panneau repart par le même chemin.
- Chaque langue occupe deux lignes dans la liste : son `label` sur la première et, en dessous, son nom dans la langue actuelle de l'interface, fourni par `Intl.DisplayNames` (dans une interface en français, `zh-CN` s'affiche « chinois (Chine) »). La langue courante est mise en évidence par une icône de coche. Comme pour les résultats de recherche, seul le premier élément de la liste a des coins supérieurs arrondis, et seul le dernier a des coins inférieurs arrondis.
- Un clic sur une langue passe à cette langue et ferme la boîte de dialogue, avec une navigation SPA. Un clic avec `⌘`, `Ctrl` ou une autre touche de modification enfoncée l'ouvre dans un nouvel onglet.
- À l'ouverture, le focus est sur la langue courante, et `Tab` passe d'une langue à l'autre. `Esc`, un clic sur le voile ou sur le bouton de fermeture ferment la boîte de dialogue, et le focus revient au bouton de langue.
- Sur écran étroit, le bouton se trouve en bas du tiroir de navigation, et la boîte de dialogue recouvre le tiroir.

## Portée de la recherche

Chaque langue a son propre index local, et une recherche ne charge que celui de la langue courante : les résultats viennent donc toujours de la langue courante. Les backends HTTP et les backends enregistrés reçoivent le `lang` et le `locale` de la langue courante et décident eux-mêmes de la portée. Les textes et les messages d'erreur du panneau de recherche suivent la langue.
