---
icon: language
order: 3
badge: Nouveau
tab: Vue d'ensemble
parallel:
  - api
---

# Navigation

Les composants m3e de navigation se répartissent en trois groupes : `m3e-nav-menu` organise des pages sur plusieurs niveaux, `m3e-tabs` fait passer d'une vue à l'autre dans une même page, et les chips et les badges indiquent des états et des filtres.

## Navigation latérale

`m3e-nav-menu` contient une navigation sur plusieurs niveaux. `m3e-nav-menu-item` organise son contenu avec les slots `label`, `icon` et `badge`. Utilisez `open` pour déplier un groupe et `selected` pour mettre en évidence l'élément feuille actuel :

<div class="demo-surface" style="max-width: 320px; max-block-size: 320px;">
  <m3e-nav-menu aria-label="Démo de navigation des composants">
    <m3e-nav-menu-item open>
      <m3e-icon slot="icon" name="widgets"></m3e-icon>
      <span slot="label">Composants</span>
      <m3e-nav-menu-item>
        <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
        <a slot="label" href="/fr-FR/components/button.html">Boutons</a>
      </m3e-nav-menu-item>
      <m3e-nav-menu-item selected>
        <m3e-icon slot="icon" name="language"></m3e-icon>
        <a slot="label" href="/fr-FR/components/navigation.html">Navigation</a>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
    <m3e-nav-menu-item>
      <m3e-icon slot="icon" name="dashboard"></m3e-icon>
      <a slot="label" href="/fr-FR/components/card.html">Cartes</a>
      <span slot="badge">Nouveau</span>
    </m3e-nav-menu-item>
  </m3e-nav-menu>
</div>

```html
<m3e-nav-menu aria-label="Démo de navigation des composants">
  <m3e-nav-menu-item open>
    <m3e-icon slot="icon" name="widgets"></m3e-icon>
    <span slot="label">Composants</span>
    <m3e-nav-menu-item selected>
      <m3e-icon slot="icon" name="language"></m3e-icon>
      <a slot="label" href="/fr-FR/components/navigation.html">Navigation</a>
    </m3e-nav-menu-item>
  </m3e-nav-menu-item>
  <m3e-nav-menu-item>
    <m3e-icon slot="icon" name="dashboard"></m3e-icon>
    <a slot="label" href="/fr-FR/components/card.html">Cartes</a>
    <span slot="badge">Nouveau</span>
  </m3e-nav-menu-item>
</m3e-nav-menu>
```

`open` contrôle si un groupe est déplié. À l'exécution, le composant peut aussi le gérer lui-même, d'après l'état de sélection des éléments enfants. `disabled` désactive l'élément et tous ses enfants. Par défaut, le menu défile à l'intérieur de lui-même quand sa hauteur est limitée.

## Onglets {#tabs}

Les enfants directs de `m3e-tabs` ne peuvent être que des `m3e-tab` et des `m3e-tab-panel`. Le `for` de chaque `m3e-tab` pointe vers l'`id` de son panneau, et un seul onglet peut avoir `selected` :

<m3e-tabs variant="primary">
  <m3e-tab selected for="nav-demo-panel-overview">
    <m3e-icon slot="icon" name="home"></m3e-icon>
    Vue d'ensemble
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-button">
    <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
    Boutons
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-card">
    <m3e-icon slot="icon" name="dashboard"></m3e-icon>
    Cartes
  </m3e-tab>
  <m3e-tab-panel id="nav-demo-panel-overview">
    Panneau Vue d'ensemble : à quoi sert le composant, ses variantes et des conseils d'utilisation.
  </m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-button">
    Panneau Boutons : les cinq variantes de <code>m3e-button</code> et <code>m3e-icon-button</code>.
  </m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-card">
    Panneau Cartes : les slots, les variantes et le mode interactif de <code>m3e-card</code>.
  </m3e-tab-panel>
</m3e-tabs>

```html
<m3e-tabs variant="primary">
  <m3e-tab selected for="nav-demo-panel-overview">
    <m3e-icon slot="icon" name="home"></m3e-icon>
    Vue d'ensemble
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-button">
    <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
    Boutons
  </m3e-tab>
  <m3e-tab-panel id="nav-demo-panel-overview">Contenu du panneau Vue d'ensemble.</m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-button">Contenu du panneau Boutons.</m3e-tab-panel>
</m3e-tabs>
```

`variant="primary"` est le style d'onglets principal (la valeur par défaut est `secondary`), et `stretch` donne aux onglets une largeur égale pour remplir le conteneur. Quand il y a beaucoup d'onglets, autorisez le défilement horizontal ou la pagination. Ne comprimez pas le texte au point de le rendre illisible.

## Chips et filtres

`m3e-chip` est un chip non interactif qui sert à afficher des catégories, des états et des stacks techniques. Entourez les chips de `.demo-row` pour contrôler l'espacement :

<div class="demo-row">
  <m3e-chip>
    <m3e-icon slot="icon" name="palette"></m3e-icon>
    Thème
  </m3e-chip>
  <m3e-chip>
    <m3e-icon slot="icon" name="layers"></m3e-icon>
    Composants
  </m3e-chip>
  <m3e-chip variant="elevated">
    <m3e-icon slot="icon" name="check"></m3e-icon>
    Activé
  </m3e-chip>
</div>

```html
<div class="demo-row">
  <m3e-chip>
    <m3e-icon slot="icon" name="palette"></m3e-icon>
    Thème
  </m3e-chip>
  <m3e-chip>
    <m3e-icon slot="icon" name="layers"></m3e-icon>
    Composants
  </m3e-chip>
  <m3e-chip variant="elevated">
    <m3e-icon slot="icon" name="check"></m3e-icon>
    Activé
  </m3e-chip>
</div>
```

Quand les utilisateurs doivent filtrer du contenu, utilisez le chip de filtre interactif :

<m3e-filter-chip-set aria-label="Filtrer la documentation">
  <m3e-filter-chip selected value="all">Tout</m3e-filter-chip>
  <m3e-filter-chip value="theme">Thème</m3e-filter-chip>
  <m3e-filter-chip value="style">Styles</m3e-filter-chip>
  <m3e-filter-chip value="component">Composants</m3e-filter-chip>
</m3e-filter-chip-set>

```html
<m3e-filter-chip-set aria-label="Filtrer la documentation">
  <m3e-filter-chip selected value="all">Tout</m3e-filter-chip>
  <m3e-filter-chip value="theme">Thème</m3e-filter-chip>
  <m3e-filter-chip value="style">Styles</m3e-filter-chip>
  <m3e-filter-chip value="component">Composants</m3e-filter-chip>
</m3e-filter-chip-set>
```

Un chip de filtre a son propre état sélectionné et sa propre gestion du clavier. `selected` définit la valeur initiale, et un clic déclenche un événement de changement. Son sens diffère de celui du `m3e-chip` non interactif : ne mélangez pas les deux.

## Badges

Un badge peut afficher un nombre seul, ou s'ancrer à un bouton ou à une icône grâce à `for` :

<div class="demo-row">
  <m3e-badge size="small">3</m3e-badge>
  <m3e-badge size="medium">12</m3e-badge>
  <m3e-badge size="large">99+</m3e-badge>
  <m3e-button id="navigation-demo-update" variant="outlined">Mises à jour</m3e-button>
  <m3e-badge for="navigation-demo-update" position="above-after">4</m3e-badge>
</div>

```html
<m3e-badge size="small">3</m3e-badge>
<m3e-badge size="medium">12</m3e-badge>
<m3e-badge size="large">99+</m3e-badge>
<m3e-button id="navigation-demo-update" variant="outlined">Mises à jour</m3e-button>
<m3e-badge for="navigation-demo-update" position="above-after">4</m3e-badge>
```

Un badge ancré suit les changements de mise en page de son élément cible, et `position` définit où il se place. Un badge n'a pas de rôle ARIA par défaut. Quand vous l'attachez à un élément interactif, décrivez le nombre avec `aria-describedby` ou avec un texte visible correspondant.

## Navigation SPA {#spa-navigation}

Les liens internes de la barre latérale et du pied de page doivent produire de vrais éléments `<a>`. VitePress 2 intercepte les clics internes en phase de capture et effectue la navigation SPA. VitePress 2 a supprimé vue-router et `RouterLink` : ne les importez pas et ne suivez pas les anciens exemples :

```vue
<a
  v-if="item.link && !isExternalLink(item.link)"
  slot="label"
  :href="withBase(item.link)"
  :aria-current="isActive(item.link) ? 'page' : undefined"
>
  {{ item.text }}
</a>
<a
  v-else-if="item.link"
  slot="label"
  :href="item.link"
  target="_blank"
  rel="noreferrer"
>
  {{ item.text }}
</a>
```

`withBase` vient de `vitepress` et ajoute la base de déploiement aux chemins internes. Le cœur de VitePress prend en charge les clics gauches simples, tandis que le clic du milieu pour ouvrir un nouvel onglet, la copie du lien et la sémantique d'accessibilité continuent de fonctionner. Les liens externes gardent leur comportement natif et reçoivent `target="_blank"` et `rel="noreferrer"`.

Si vous devez naviguer depuis un script, utilisez `useRouter().go()` :

```ts
import { useRouter, withBase } from "vitepress";

const router = useRouter();

function navigate(event: MouseEvent, link: string): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
    return;
  }

  event.preventDefault();
  void router.go(withBase(link));
}
```

Les ancres générées à l'intérieur d'un bouton ou d'un bouton d'icône m3e sont prises en charge par le thème : les liens internes effectuent la navigation dans la page ; avec `target="_self"`, la page complète est chargée, et avec `target="_blank"`, le lien s'ouvre dans un nouvel onglet. C'est seulement lorsque vous simulez un clic avec un élément qui n'est pas un lien que vous devez écouter les clics sur l'élément hôte et appeler `router.go()`. Les démos statiques de cette page utilisent de simples éléments `<a>` : VitePress gère donc les clics internes, tandis que les liens externes chargent toujours la page complète. Quelle que soit l'approche, ne simulez pas un lien avec un `div` et un gestionnaire de clic, et ne retirez pas le vrai `href` de la navigation interne.

## Accessibilité

- Définissez `aria-label` sur la racine du menu, pour qu'il soit clair qu'il s'agit du repère de navigation de la documentation.
- Marquez l'élément de menu actuel avec `selected`. Le composant produit `aria-current`.
- Les onglets sont reliés aux `id` des panneaux par `for`, et un seul onglet peut être `selected`.
- Gardez un texte visible sur les chips de filtre. Ne comptez pas sur la seule couleur pour indiquer l'état sélectionné.
- Un bouton qui n'a qu'une icône doit avoir un `aria-label` et une info-bulle.

Pour tous les attributs, slots et événements, voir [API](/fr-FR/components/navigation/api).
