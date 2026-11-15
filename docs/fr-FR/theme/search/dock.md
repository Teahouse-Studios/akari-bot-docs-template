---
tab: Ancrage
---
<script setup>
import SearchDockDemo from "../../../.vitepress/theme/components/content/SearchDockDemo.vue";
</script>


# Démo de recherche flottante

Cette page est l'exemple vivant de [`<SearchDock>`](/fr-FR/theme/search/api#searchdock). Le tag se trouve dans le cadre d'atterrissage en pointillés ci-dessous ; le champ de recherche quitte la barre supérieure et vient s'y poser.

<SearchDockDemo />

À essayer :

- Rechargez cette page : le champ est déjà dans le cadre, sans animation d'entrée.
- Quittez la page (par exemple via **Vue d'ensemble**) puis revenez : il s'envole de la barre supérieure vers le cadre.
- Changez **Variante** ou **Alignement** : le champ change de forme et d'alignement sur place.
- Activez **Remplir le cadre** : le tag occupe tout le cadre extérieur (`width: 100%; height: 100%`) et suit la taille donnée par la mise en page ; désactivez-le pour revenir à la taille naturelle de la variante.

Le champ reste utilisable une fois amarré : cliquez dessus ou appuyez sur `⌘K` (`Ctrl K` sous Windows / Linux), et le panneau de recherche s'ouvre depuis sa position.
