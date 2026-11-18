---
tab: Dock
---
<script setup>
import SearchDockDemo from "../../../.vitepress/theme/components/content/SearchDockDemo.vue";
</script>


# Floating search demo

This page is the live example for [`<SearchDock>`](/theme/search/api#searchdock). The tag sits in the dashed landing box below; the field leaves the app bar and lands on it.

<SearchDockDemo />

Try it in four ways:

- Reload this page: the field is already in the box, with no fly-in transition.
- Leave this page (for example via **Overview**) and come back: it flies from the app bar to the box.
- Change **Variant** or **Align**: the field re-shapes and re-aligns in place.
- Turn on **Fill box**: the tag takes the whole outer box (`width: 100%; height: 100%`), so the field follows whatever size the surrounding layout gives it. Turn it off to return to the variant's natural size.
- Turn on **Immersive**: click the field and type; results appear in a compact list under it, without the search dialog.

The field stays interactive while docked: with `immersive` off, click it or press `⌘K` (`Ctrl K`) to open the search panel from where it stands. With `immersive` on, click and type directly; the shortcut still opens the full dialog.