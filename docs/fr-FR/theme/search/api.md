---
tab: API
---

# Recherche : API

## search

| Champ | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Afficher ou non l'accès à la recherche et enregistrer ou non le raccourci |
| `placeholder` | `string` | Selon la langue, « Rechercher » | Texte indicatif du champ de recherche |
| `shortcut` | `string` | `"k"` | Touche combinée avec `⌘` / `Ctrl` ; une chaîne vide désactive le raccourci |
| `maxResults` | `number` | `8` | Nombre maximal de résultats, ramené entre 1 et 20 |
| `debounce` | `number` | `180` | Délai d'anti-rebond de la saisie en millisecondes, ramené entre 0 et 1 000 |
| `backend` | `AkariSearchBackendConfig` | Index local | `local`, `http` ou `registered` |

`search` peut figurer dans une configuration de langue, pour donner à chaque langue son propre backend.

## SearchDock

`<SearchDock>` est enregistré globalement par le thème. Placez-le dans une page, là où le champ de recherche doit atterrir ; aucun import n'est nécessaire. Il rend un cadre réservé, et la copie fixe du déclencheur de la barre supérieure vole au-dessus et reprend ses propriétés.

```md
<SearchDock variant="hero" align="center" placeholder="Rechercher dans le guide" />
```

| Propriété | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `placeholder` | `string` | `search.placeholder` | Texte indicatif une fois amarré ici |
| `variant` | `"bar" \| "pill" \| "icon" \| "hero"` | `"bar"` | Apparence du champ |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alignement de l'icône, du libellé et du raccourci dans le champ |
| `width` | `string \| number` | Largeur de la variante | Longueur CSS ou largeur en pixels du cadre réservé |
| `height` | `string \| number` | Hauteur de la variante | Longueur CSS ou hauteur en pixels du cadre réservé |
| `fill` | `boolean` | `false` | Remplir le cadre parent au lieu de la taille naturelle de la variante |
| `priority` | `number` | `0` | Prioritaire sur les autres tags de la même page |

`bar` est le champ de la barre supérieure, `pill` un champ tonal, `icon` un bouton flottant rond et `hero` un grand champ tonal. `width` et `height` acceptent une longueur CSS (`"20rem"`, `"min(100%, 30rem)"`) ou un nombre de pixels ; sans eux, le cadre naturel de la variante est utilisé. Ajoutez `fill` pour occuper le cadre parent (`width: 100%; height: 100%`) ; le parent doit avoir une largeur et une hauteur définies, et `width` / `height` explicites l'emportent encore sur un axe.

Le tag accepte aussi le slot par défaut, placé dans le cadre réservé derrière le champ. Il est marqué `aria-hidden` ; c'est le champ lui-même qui ouvre la recherche.

Plusieurs tags peuvent coexister sur une page. Le `priority` le plus élevé gagne, à égalité le premier enregistré, et les cadres de taille nulle ou masqués sont ignorés. Un tag doit aussi tenir entièrement dans la zone de page et la fenêtre, sans chevaucher la barre supérieure ni la rangée d'onglets ; sinon le champ reste dans la barre jusqu'à ce que le défilement libère de la place. Laissez un seul tag par page : au démontage, le champ revient dans la barre et s'efface ; entre deux pages à tags, il anime d'un cadre à l'autre. Un premier chargement direct le place sans transition. Toutes les durées viennent des jetons de ressort MD3 du thème, donc du réglage Standard/Expressive et de `prefers-reduced-motion`.

`<AkariSearchDock>` est un alias du même composant.

## Backend local

```ts
backend: { type: "local" },
```

Il utilise l'index que construit la recherche locale de VitePress (`provider: "local"`) : un par langue, chargé selon la clé de locale VitePress (`root` pour la langue racine). Quand une langue utilise le backend local, `akariContent` l'active dans la configuration du site et fait conserver par l'index le texte de chaque section, pour les extraits des résultats :

```ts
// La configuration du site que génère akariContent
themeConfig: {
  search: {
    provider: "local",
    options: { miniSearch: { options: { storeFields: ["title", "titles", "text"] } } },
  },
},
```

Chaque section est un document de l'index : `id` est le chemin de la page suivi de l'ancre du titre, `title` est le titre de la section, `titles` sont les titres qui la précèdent (le titre de la page en premier), et `text` est son texte sans balises. La section sous le titre de niveau 1 de la page représente la page elle-même, et son résultat renvoie en haut de la page.

Si `.vitepress/config.mts` ne définit pas de `themeConfig`, `...content.site` apporte ce réglage ; s'il en définit un, fusionnez-y `content.site.themeConfig`.

## Backend HTTP

```ts
backend: {
  type: "http",
  endpoint: "/api/docs/search",
  method: "POST",
  headers: { Authorization: "Bearer YOUR_TOKEN" },
  credentials: "include",
  queryParam: "q",
  limitParam: "limit",
},
```

| Champ | Type | Par défaut | Description |
| --- | --- | --- | --- |
| `endpoint` | `string` | Obligatoire | URL de l'endpoint ; `base` est ajouté aux chemins relatifs, les URL absolues restent telles quelles |
| `method` | `"GET" \| "POST"` | `"GET"` | `GET` place le texte recherché dans les paramètres de l'URL ; `POST` envoie du JSON : `{ "q": "mot-clé", "limit": 8 }` |
| `headers` | `Record<string, string>` | `{}` | En-têtes de la requête |
| `credentials` | `RequestCredentials` | `"same-origin"` | Envoyer ou non les cookies |
| `queryParam` | `string` | `"q"` | Nom du paramètre du texte recherché |
| `limitParam` | `string` | `"limit"` | Nom du paramètre de la limite de résultats |

La réponse peut être un tableau de résultats ou `{ "results": [...] }`. Le thème lit ces champs dans chaque résultat : `title` ; `href` (ou `url`, `path`) ; `pageTitle` ; `heading` ; `excerpt` (ou `content`, `snippet`, `description`) ; `id`.

```json
{
  "results": [
    {
      "id": "button-variants",
      "title": "Variantes",
      "pageTitle": "Boutons",
      "heading": "Variantes",
      "href": "/fr-FR/components/button.html#variants",
      "excerpt": "Cinq styles expriment l'emphase, de la plus forte à la plus faible…"
    }
  ]
}
```

Une réponse hors 2xx, une erreur réseau ou une réponse dont la structure est invalide affiche une erreur et un bouton pour réessayer.

## Backends enregistrés {#registered-backends}

Enregistrez une fonction dans le point d'entrée du thème, puis faites référence à son id dans la configuration :

```ts
// docs/.vitepress/theme/index.ts
import { registerSearchBackend } from "./search/registry";

registerSearchBackend("my-search", async (query, { limit, signal, lang }) => {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&lang=${lang}`,
    { signal },
  );
  if (!response.ok) throw new Error("La recherche a échoué");
  const data = await response.json();
  return data.results.slice(0, limit);
});
```

```ts
// docs/config.ts
search: { backend: { type: "registered", id: "my-search" } },
```

```ts
function registerSearchBackend(id: string, handler: AkariSearchHandler): void;

type AkariSearchHandler = (
  query: string,
  context: AkariSearchContext,
) => AkariSearchResult[] | Promise<AkariSearchResult[]>;

interface AkariSearchContext {
  limit: number;
  signal?: AbortSignal;   // interrompu quand une nouvelle recherche est saisie ou que le panneau se ferme
  lang?: string;          // langue courante, par exemple "zh-CN"
  locale?: string;        // clé de locale VitePress, "root" pour la langue racine
}
```

Si la configuration fait référence à un id qui n'est pas enregistré, le panneau affiche une erreur explicite.

## AkariSearchResult

| Champ | Type | Description |
| --- | --- | --- |
| `id` | `string` | Identifiant unique |
| `title` | `string` | Titre du résultat |
| `href` | `string` | URL ; les URL internes utilisent la navigation SPA, les URL externes s'ouvrent dans un nouvel onglet |
| `pageTitle` | `string` | Titre de la page à laquelle il appartient, affiché au-dessus du résultat |
| `heading` | `string` | Section à laquelle il appartient |
| `excerpt` | `string` | Extrait ; les mots trouvés sont mis en évidence |

Tout le texte est rendu en texte brut.

## useAkariSearch

```ts
import { useAkariSearch } from "@theme";

const { isOpen, query, results, loading, error, openSearch, closeSearch } =
  useAkariSearch();
```

Pour un accès à la recherche de votre cru : `openSearch()` ouvre le panneau, et `query`, `results`, `loading` et `error` constituent l'état du panneau. Ne l'appelez que dans des composants situés dans la mise en page.
