---
icon: integration_instructions
order: 7
badge: Extension
tab: Vue d'ensemble
parallel:
  - api
---

# Étendre le thème

Il existe trois façons d'adapter le thème, et aucune ne demande de modifier son code source :

| Méthode | Adaptée à | Où |
| --- | --- | --- |
| Configuration | Titres, navigation, options des paramètres, table des matières, pied de page, textes de l'interface | `docs/config.ts` et le `config.ts` de chaque langue ; voir [Configuration](/fr-FR/getting-started/configuration) |
| Remplacer des composants | Une barre d'application aux couleurs de la marque, un pied de page particulier, un conteneur de contenu personnalisé | `enhanceApp` dans le point d'entrée du thème |
| Variables CSS | Rayon des coins, espacements, couleurs des surfaces, largeur de la table des matières | Styles du site |

## Remplacer des composants

Dans `enhanceApp` du point d'entrée du thème `docs/.vitepress/theme/index.ts`, appelez d'abord `provideAkariSiteData` pour transmettre au thème les données de langue et de configuration du site, puis passez à `provideAkariComponents` les parties à remplacer. Les parties omises gardent les composants intégrés :

```ts
import { type Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import { provideAkariSiteData } from "./composables/useLocales";
import { provideAkariComponents } from "./composables/useAkariConfig";
import Layout from "./layouts/AkariLayout.vue";
import CustomFooter from "./CustomFooter.vue";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, siteData }) {
    provideAkariSiteData(app, siteData);
    provideAkariComponents(app, { Footer: CustomFooter });
  },
} satisfies Theme;
```

Les composants personnalisés lisent la configuration et l'état au moyen des composables du thème, comme `useAkariConfig()` et `useSidebar()`. Consultez l'[API](/fr-FR/theme/extending/api) pour les parties remplaçables et les fonctions disponibles.

## Variables CSS

Redéfinissez les variables du thème et des composants m3e dans les styles de votre site :

```css
:root {
  --akari-doc-radius: 24px;
  --akari-doc-max-width: 1440px;
}
```

Vous pouvez aussi redéfinir un seul composant sur place. Les trois cartes ci-dessous ne changent que le rayon des coins :

<div class="demo-grid">
  <m3e-card variant="outlined" style="--m3e-card-shape: 4px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">Coins de 4px</m3e-heading>
    <div slot="content">Une carte plus compacte, adaptée aux panneaux d'outils et aux blocs de données.</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">Coins par défaut</m3e-heading>
    <div slot="content">Garde le jeton de forme par défaut de la carte m3e, cohérent avec les autres composants.</div>
  </m3e-card>
  <m3e-card variant="outlined" style="--m3e-card-shape: 28px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">Coins de 28px</m3e-heading>
    <div slot="content">Des coins plus grands, plus proches du langage visuel de la surface du document.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" style="--m3e-card-shape: 28px;">…</m3e-card>
```

Privilégiez les variables exposées par le thème et par les composants. Ne vous appuyez pas sur les noms de classes internes des composants ni sur la structure de leur Shadow DOM : ils changent d'une version à l'autre.

## Points d'attention

- Quand vous remplacez un composant, conservez la sémantique et les attributs d'accessibilité de l'élément racine d'origine (par exemple `m3e-app-bar` pour la barre d'application et `m3e-nav-menu` pour la navigation), ainsi que l'utilisation au clavier.
- Ne codez pas les couleurs en dur. Utilisez les jetons `--md-sys-color-*` pour que les couleurs suivent la couleur dynamique, le mode clair et le mode sombre, et le contraste.
- Quand vous utilisez un nouveau composant ou une nouvelle icône m3e, enregistrez-les à la demande dans `m3e.ts` et `icons.ts`. N'importez pas `@m3e/web/all`.
- N'accédez pas à `window`, `document` ou `localStorage` au niveau supérieur d'un module, sinon le rendu côté serveur échoue.
