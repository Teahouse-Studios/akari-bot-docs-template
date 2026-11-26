<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
import { Content, useData } from "vitepress";

import DefaultAppBar from "../components/shell/AppBar.vue";
import DesktopNavigation from "../components/sidebar/DesktopNavigation.vue";
import DefaultSidebar from "../components/sidebar/SidebarNav.vue";
import SettingsDialog from "../components/settings/SettingsDialog.vue";
import DefaultHero from "../components/content/DocHero.vue";
import DocTabs from "../components/content/DocTabs.vue";
import DocFabs from "../components/content/DocFabs.vue";
import AppBarMenu from "../components/shell/AppBarMenu.vue";
import DefaultToc from "../components/content/DocToc.vue";
import DefaultPager from "../components/content/DocPager.vue";
import ReviewTool from "../components/content/ReviewTool.vue";
import DefaultFooter from "../components/content/DocFooter.vue";
import LocaleDialog from "../components/shell/LocaleDialog.vue";
import LoadingBar from "../components/shell/LoadingBar.vue";
import { applyFonts } from "../fonts";
import { provideAkariColorScheme } from "../composables/useColorScheme";
import { provideAkariLocaleDialog } from "../composables/useLocaleDialog";
import { useAkariLocales } from "../composables/useLocales";
import { useHero } from "../composables/useHero";
import { useHeroColor } from "../composables/useHeroColor";
import { useLazyMedia } from "../composables/useLazyMedia";
import { useLogoColor } from "../composables/useLogoColor";
import {
  providePagePattern,
  useContentLight,
} from "../composables/usePattern";
import { provideAkariConfig } from "../composables/useAkariConfig";
import { usePageTransition } from "../composables/usePageTransition";
import { useScrolledUnder } from "../composables/useScrolledUnder";
import { provideAkariSettings } from "../composables/useSettings";
import { provideReview } from "../composables/useReview";
import { provideAkariSettingsDialog } from "../composables/useSettingsDialog";
import { provideAkariTabs } from "../composables/useTabs";
import SearchDialog from "../search/components/SearchDialog.vue";
import SearchDockLayer from "../search/components/SearchDockLayer.vue";
import { provideAkariSearch } from "../search/useSearch";
import { provideAkariSearchDock } from "../search/useSearchDock";
import {
  AKARI_CONTENT_ID,
  AKARI_NAV_RAIL_QUERY,
  AKARI_SIDEBAR_ID,
} from "../constants";

const config = provideAkariConfig();
const settingsApi = provideAkariSettings(config);
provideReview();
const { settings } = settingsApi;
const { resolved: resolvedScheme } = provideAkariColorScheme(settingsApi);
const search = provideAkariSearch(config);
provideAkariSearchDock(search);
provideAkariLocaleDialog();
provideAkariSettingsDialog();
const tabs = provideAkariTabs(config);
const { page } = useData();
// The fonts of the page's language, which the page's head already set up
// for the first paint; switching language changes them.
watchEffect(() => applyFonts(config.value.fonts));
const { homeHref, locales } = useAkariLocales();
const hero = useHero();
const heroColor = useHeroColor(hero, resolvedScheme);
const logo = computed(() => {
  const brand = config.value.brand;
  return resolvedScheme.value === "dark"
    ? (brand.logoDark ?? brand.logo ?? "")
    : (brand.logo ?? "");
});
const logoColor = useLogoColor(logo);
// The hidden pattern on the page's surfaces, and the light the pointer moves.
const pattern = providePagePattern(hero);

// A hero page wears its image's colors. Elsewhere the reader's own color
// wins, and the logo's dominant color seeds the theme until they pick one.
const themeColor = computed(
  () =>
    heroColor.value ??
    (settings.color === config.value.settings.defaults.color
      ? logoColor.value ?? settings.color
      : settings.color),
);
// m3e follows the system until the page knows the reader's mode.
const themeScheme = computed(() => resolvedScheme.value ?? "auto");
const themeElement = ref<HTMLElement | null>(null);
const drawerElement = ref<(HTMLElement & { start: boolean }) | null>(null);
const pageElement = ref<HTMLElement | null>(null);
const scrollSentinel = ref<HTMLElement | null>(null);
const isNotFound = computed(() => page.value.isNotFound === true);

const components = computed(() => ({
  AppBar: config.value.components.AppBar ?? DefaultAppBar,
  DesktopNav:
    config.value.components.DesktopNav ?? DesktopNavigation,
  Sidebar: config.value.components.Sidebar ?? DefaultSidebar,
  Hero: config.value.components.Hero ?? DefaultHero,
  Toc: config.value.components.Toc ?? DefaultToc,
  Pager: config.value.components.Pager ?? DefaultPager,
  Footer: config.value.components.Footer ?? DefaultFooter,
  Content: config.value.components.Content ?? "div",
}));

usePageTransition(pageElement, tabs.direction);
useContentLight(pageElement);
useLazyMedia(pageElement);
useScrolledUnder(scrollSentinel);

const desktopNavMedia =
  typeof window === "undefined"
    ? undefined
    : window.matchMedia(AKARI_NAV_RAIL_QUERY);

function closeMobileNavOnDesktop(): void {
  if (desktopNavMedia?.matches && drawerElement.value) {
    drawerElement.value.start = false;
  }
}

const SHELL_COLOR_TOKENS = [
  "--md-sys-color-surface-container-low",
  "--md-sys-color-on-surface",
  "--md-sys-color-outline",
  "--md-sys-color-outline-variant",
  "--m3e-scrollbar-thumb-color",
] as const;

function copyThemeColorTokens(theme: HTMLElement): void {
  // Every token is read before any is written: a new value on the root
  // invalidates the whole page's style, so reading the next token after it
  // would recompute all of it again, once per token.
  const computed = getComputedStyle(theme);
  const values = SHELL_COLOR_TOKENS.map((token) =>
    computed.getPropertyValue(token).trim(),
  );
  const rootStyle = document.documentElement.style;

  SHELL_COLOR_TOKENS.forEach((token, index) => {
    if (values[index]) rootStyle.setProperty(token, values[index]);
  });
}

function syncBodyScheme(): void {
  if (typeof document === "undefined") return;

  // Before mount the head script has already set the scheme.
  const scheme = resolvedScheme.value;
  if (scheme) {
    document.documentElement.classList.toggle("dark", scheme === "dark");
    document.documentElement.style.colorScheme = scheme;
  }
}

function syncBodyTheme(): void {
  if (typeof document === "undefined") return;

  syncBodyScheme();
  const theme = themeElement.value;
  if (!theme) return;

  // m3e-theme is nested inside #app, so the palette it publishes on its
  // shadow host never reaches html/body on its own. Copy the active color
  // tokens to the document root; html/body then resolve their background and
  // foreground from the same dynamic palette as everything inside the theme.
  copyThemeColorTokens(theme);
}

function syncThemeAttributes(): void {
  const theme = themeElement.value;
  if (!theme) return;

  theme.setAttribute("color", themeColor.value);
  theme.setAttribute("variant", settings.variant);
  theme.setAttribute("scheme", themeScheme.value);
  theme.setAttribute("contrast", settings.contrast);
  theme.setAttribute("motion", settings.motion);
}

// The palette follows when m3e-theme reports its change (syncBodyTheme):
// read when the scheme changes, it would still be the old one, at the cost
// of recomputing the whole page's style.
watch(resolvedScheme, () => syncBodyScheme(), { immediate: true });
watch(
  () => [
    themeColor.value,
    settings.variant,
    themeScheme.value,
    settings.contrast,
    settings.motion,
  ],
  syncThemeAttributes,
  { flush: "post" },
);
onMounted(() => {
  desktopNavMedia?.addEventListener("change", closeMobileNavOnDesktop);
  syncThemeAttributes();
  requestAnimationFrame(syncBodyTheme);
});
onUnmounted(() => {
  desktopNavMedia?.removeEventListener("change", closeMobileNavOnDesktop);
});
</script>

<template>
  <!--
    The window scrolls the document. The app bar and the desktop navigation
    stay put with position: sticky; the drawer container is a fixed layer
    that only hosts the mobile navigation drawer. Search, language and
    settings open as modal dialogs.
  -->
  <m3e-theme
    ref="themeElement"
    :color="themeColor"
    :variant="settings.variant"
    :scheme="themeScheme"
    :contrast="settings.contrast"
    :motion="settings.motion"
    :style="{
      '--m3e-drawer-container-width': `min(${config.sidebar.width}px, 90vw)`,
    }"
    strong-focus
    @change="syncBodyTheme"
  >
    <LoadingBar v-if="config.loadingBar.enabled" />
    <!--
      Page grid: the rail owns the full-height strip at the start, the app bar
      and the document sit beside it, and a pinned drawer takes the column
      between rail and document below the app bar.
    -->
    <div class="akari-frame">
      <div class="akari-frame__bar">
        <component :is="components.AppBar" />
      </div>
      <component :is="components.DesktopNav" />
      <div class="akari-main">
        <div
          ref="scrollSentinel"
          class="akari-doc-sentinel"
          aria-hidden="true"
        ></div>
        <!--
          The surface is the main landmark, so a hero heading the page sits
          inside it. The hero spans the surface itself rather than the reading
          column and carries the page title; data-hero hides the Markdown h1
          it replaces.
        -->
        <main
          ref="pageElement"
          class="akari-doc"
          :data-pattern="pattern ?? undefined"
        >
          <div class="akari-surface-cap" aria-hidden="true"></div>
          <!--
            Parallel pages keep their tab bar first, above any hero, so it
            sits in the same place on every page of the group.
          -->
          <DocTabs />
          <component :is="components.Hero" v-if="hero" class="akari-doc__page" />
          <div class="akari-doc__inner akari-doc__page">
            <div
              class="akari-doc__layout"
              :data-hero="hero ? '' : undefined"
            >
              <component
                :is="components.Content"
                :id="AKARI_CONTENT_ID"
                class="akari-content"
              >
                <div v-if="isNotFound" class="akari-not-found">
                  <p class="akari-not-found__code">404</p>
                  <h1>{{ config.messages.notFoundTitle }}</h1>
                  <p>{{ config.messages.notFoundText }}</p>
                  <a class="akari-not-found__link" :href="homeHref">
                    {{ config.messages.notFoundLink }}
                  </a>
                </div>
                <div v-else class="akari-prose">
                  <Content />
                </div>
              </component>
              <component :is="components.Toc" />
            </div>
            <component :is="components.Pager" />
          </div>
        </main>
        <component :is="components.Footer" />
      </div>
    </div>
    <DocFabs />
    <AppBarMenu />
    <m3e-drawer-container
      ref="drawerElement"
      class="akari-drawers"
      start-mode="over"
    >
      <div :id="AKARI_SIDEBAR_ID" class="akari-sidebar-slot" slot="start">
        <component :is="components.Sidebar" />
      </div>
    </m3e-drawer-container>
    <SearchDockLayer v-if="config.search.enabled" />
    <SearchDialog v-if="config.search.enabled" />
    <LocaleDialog v-if="locales.length > 1" />
    <SettingsDialog v-if="config.settings.enabled" />
    <ReviewTool />
  </m3e-theme>
</template>
