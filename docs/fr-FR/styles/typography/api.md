---
tab: API
---

# Typographie : API

## Polices par langue

Les polices du texte dépendent de la langue de la page. Les valeurs par défaut viennent des `fonts` du [pack de langue](/fr-FR/theme/i18n/api#akarilanguage) ; celles des packs intégrés figurent ci-dessous, et [`fonts`](#fonts) permet de toutes les changer :

| Langue | Chargées depuis Google Fonts | Pile de polices |
| --- | --- | --- |
| `ja` | Roboto, Noto Sans JP | Roboto, Noto Sans JP, Hiragino Sans, Hiragino Kaku Gothic ProN, Yu Gothic UI, Yu Gothic, Meiryo, system-ui, sans-serif |
| `ko` | Roboto, Noto Sans KR | Roboto, Noto Sans KR, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif |
| `ar` | Roboto, Noto Sans Arabic | Roboto, Noto Sans Arabic, Geeza Pro, Tahoma, system-ui, sans-serif |
| Autres | Roboto, Noto Sans SC | Roboto, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif |

La langue est déterminée selon les règles des packs de langue : d'abord le code complet, puis la langue principale ; `ja-JP` prend donc la ligne `ja`. Les packs sans `fonts`, comme l'anglais et le français, prennent la ligne « Autres ».

- Ces polices Google Fonts sont toutes à graisse variable. Noto Sans SC et les polices japonaise et coréenne sont découpées par plages Unicode : une page ne télécharge que les caractères qu'elle utilise.
- Chaque langue ne charge que ses propres polices : les polices japonaise, coréenne et arabe ne se chargent que sur les pages de cette langue, et sont téléchargées quand vous passez à cette langue.
- Les polices ne bloquent pas l'affichage de la page. `<head>` ne contient que des préconnexions et un `preload` ; le script du thème insère la feuille de style, et `display=swap` affiche d'abord le texte dans une police de secours. Sans scripts, c'est la feuille de style dans `<noscript>` qui s'applique. Quand Google Fonts est inaccessible, le texte utilise les polices système situées plus loin dans la pile.
- Les parties d'une page marquées comme étant dans une autre langue (comme les noms des langues dans la boîte de dialogue des langues) utilisent celles des polices de la pile du pack de cette langue qui sont présentes sur l'appareil.

## fonts

```ts
fonts?: {
  google?: boolean | string[];
  family?: string[];
};
```

| Champ | Type | Défaut | Description |
| --- | --- | --- | --- |
| `google` | `boolean \| string[]` | `true` | Polices chargées depuis Google Fonts. `false` n'en charge aucune et n'utilise que les polices de l'appareil du lecteur ; `true` charge les polices de la langue indiquées dans le tableau ci-dessus ; un tableau liste les polices à charger, chacune écrite comme le paramètre `family` de l'API css2 de Google Fonts, par exemple `"Noto Sans JP:wght@100..900"` |
| `family` | `string[]` | La pile de la langue dans le tableau ci-dessus | La `font-family` du texte, dans l'ordre : chaque caractère utilise la première police qui le contient. Écrivez les noms de police sans guillemets, et les familles génériques comme `system-ui` et `sans-serif` telles quelles |

Les deux champs sont indépendants : quand vous passez à d'autres polices Google Fonts, ajoutez-les aussi dans `family`. Dans la configuration partagée, ils s'appliquent à toutes les langues ; dans une configuration de langue, à cette langue seulement :

```ts
// docs/config.ts : aucune langue ne charge de polices depuis Google Fonts
export default defineAkariConfig({
  fonts: { google: false },
});
```

```ts
// docs/ja-JP/config.ts : les pages en japonais utilisent M PLUS 1p
export default defineAkariConfig({
  fonts: {
    google: ["M PLUS 1p:wght@400;500;700"],
    family: ["M PLUS 1p", "Hiragino Sans", "Meiryo", "sans-serif"],
  },
});
```

Pour changer les polices par défaut d'une langue sur tous les sites, changez les `fonts` de son pack de langue ; pour ce site uniquement, la configuration `fonts` suffit.

`akariContent` écrit, d'après son pack de langue et sa configuration, la pile de polices de chaque langue (la variable CSS `--akari-font-family`), les règles de polices des parties marquées avec `lang` et les balises de préchargement dans le `<head>` de ses pages : le premier affichage utilise donc déjà les bonnes polices ; quand vous changez de langue, le thème les remplace. Le code se trouve dans `docs/.vitepress/theme/fonts.ts` : `resolveFonts(fonts, defaults, languages)` calcule l'URL de la feuille de style et la `font-family` à partir de la configuration et des polices du pack, `markedFontRules(languages)` produit les règles de polices des parties marquées, `fontHead` produit les balises `<head>`, et `applyFonts` les applique dans la page. Les packs sans `fonts` utilisent `AKARI_DEFAULT_FONTS`.

## Tokens typographiques

m3e fournit les tokens typographiques de Material 3. Chaque palier a quatre propriétés :

```text
--md-sys-typescale-{role}-{size}-font-size
--md-sys-typescale-{role}-{size}-line-height
--md-sys-typescale-{role}-{size}-font-weight
--md-sys-typescale-{role}-{size}-tracking
```

Les rôles sont `display`, `headline`, `title`, `body` et `label`, et les tailles `large`, `medium` et `small`. Par exemple :

```css
.note {
  font-size: var(--md-sys-typescale-body-medium-font-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}
```

## Titres du document

| Élément | Taille | Interligne | Graisse | Sous 600px |
| --- | --- | --- | --- | --- |
| `h1` | 3.5625rem (57px) | 1.12 | 400 | 2.5rem |
| `h2` | 1.75rem (28px) | 1.3 | 500 | 1.5rem |
| `h3` | 1.5rem (24px) | 1.35 | 500 | 1.25rem |
| `h4` | 1.25rem (20px) | 1.4 | 500 | 1.125rem |

Les titres de deuxième et de troisième niveau sont listés dans la table des matières. Le survol d'un titre affiche son lien d'ancre ; VitePress génère l'id de l'ancre à partir du texte du titre.

## Tableaux

Avec `akariMarkdown` activé, les tableaux Markdown sont enveloppés dans `.akari-table` :

- Le cadre est un contour `outline-variant` aux angles arrondis de 12px. Il n'y a pas de lignes verticales à l'intérieur ; des séparateurs délimitent les lignes.
- La ligne d'en-tête repose sur `surface-container` et utilise `label-large` dans la couleur `on-surface-variant`, sans retour à la ligne. Les cellules utilisent `body-medium`.
- La ligne sous le pointeur affiche un calque d'état. Un tableau trop large défile horizontalement dans son cadre au lieu de comprimer la surface du document.
- Un `<table>` écrit directement en HTML n'a pas de cadre ; le tableau lui-même a les mêmes styles.

## Liens

- Pas de soulignement. Le texte est précédé d'une icône aussi grande que le texte : `link` pour les liens internes au site, `open_in_new` pour les liens avec `target="_blank"`. Les icônes sont dessinées avec un masque CSS et inversées en miroir dans les mises en page de droite à gauche.
- Au survol du pointeur, un lien affiche le même calque d'état qu'un bouton texte.
- Liens sans icône : les ancres des titres (`.header-anchor`), les appels et les liens de retour des notes de bas de page, les liens qui entourent des images, et les liens placés dans un slot de composant (avec un attribut `slot`).
- En mode couleurs forcées, les liens utilisent la couleur de lien du système.

## Motifs {#patterns}

Les éléments qui ont un fond dans l'article portent un motif presque invisible, comme les cartes du hero :

| Élément | Sélecteur |
| --- | --- |
| Blocs de code | `div[class*="language-"]` |
| Barre d'onglets des groupes de code | `.vp-code-group .tabs` |
| Tableaux | `.akari-table` |
| Encadrés | `.custom-block` |
| Citations | `blockquote` |
| Zones de démo | `.demo-surface` |

- Toute la page partage un seul motif, défini par le `pattern` du hero. Par défaut, un motif est tiré au hasard à chaque chargement du contenu : points, grille, croix, lignes diagonales ou vagues. Le motif est écrit dans l'attribut `data-pattern` de la surface du document ; sans motif, l'attribut est absent.
- Au repos, le motif n'est que faiblement visible dans le coin supérieur côté fin de l'élément. Quand le pointeur s'arrête sur l'élément, une lueur très légère dans la couleur du thème s'allume autour de lui. Dans la lueur, le motif est un peu plus net, et le bord s'estompe par paliers. Quand le pointeur s'en va, la lueur s'éteint en fondu.
- La décoration est dessinée sur `::before` (motif) et `::after` (lueur), sous le contenu : elle ne gêne donc ni la lecture, ni la sélection, ni les clics. La lueur n'apparaît que lorsque le lecteur pointe avec une souris ou un stylet. Le thème se fonde sur le type des événements de pointeur réellement reçus, et non sur la supposition du navigateur dans la requête de média `(hover: hover)` : un ordinateur équipé d'un écran tactile reçoit donc la lueur sous sa souris ; les écrans tactiles n'affichent que le motif statique, et un appui ne laisse aucune lueur derrière lui. Avec « réduire les animations », le motif et la lueur apparaissent immédiatement, sans transition. En mode couleurs forcées, aucune décoration n'est affichée.
- `--akari-pattern-glow` (par défaut `4%`) et `--akari-pattern-spot` (par défaut `0.1`) sur `.akari-doc` règlent l'intensité.

## Blocs de code

- La coloration syntaxique utilise les thèmes `github-light` et `github-dark` et suit le mode clair ou sombre.
- Le bouton de copie est le `button.copy` de VitePress. Le texte de son info-bulle vient du `markdown.codeCopyButton` du pack de langue, et la configuration de langue peut le remplacer.
- Sous 600px, le rayon d'angle des blocs de code passe à 12px.
