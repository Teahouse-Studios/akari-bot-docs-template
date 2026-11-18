import { inBrowser, type Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";

import { provideAkariSiteData } from "./composables/useLocales";
import AkariFluidWall from "./components/content/AkariFluidWall.vue";
import ChatExample from "./components/content/ChatExample.vue";
import DocsHome from "./components/content/DocsHome.vue";
import CommandUsage from "./components/content/CommandUsage.vue";
import ImagePreview from "./components/content/ImagePreview.vue";
import ModuleAlias from "./components/content/ModuleAlias.vue";
import ModuleConfig from "./components/content/ModuleConfig.vue";
import ModuleData from "./components/content/ModuleData.vue";
import ModuleMeta from "./components/content/ModuleMeta.vue";
import NoticeBox from "./components/content/NoticeBox.vue";
import SearchDock from "./search/components/SearchDock.vue";
import Layout from "./layouts/AkariLayout.vue";
import { routeComponentLinks } from "./links";
import "./styles/index.css";

if (!import.meta.env.SSR) {
  void import("./m3e").then(() => {
    document.documentElement.dataset.akariReady = "";
    window.dispatchEvent(new Event("akari-ready"));
  });
}

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {
    provideAkariSiteData(app, siteData);
    app.component("ModuleMeta", ModuleMeta);
    app.component("NoticeBox", NoticeBox);
    app.component("CommandUsage", CommandUsage);
    app.component("ChatExample", ChatExample);
    app.component("ModuleConfig", ModuleConfig);
    app.component("ModuleData", ModuleData);
    app.component("ModuleAlias", ModuleAlias);
    app.component("DocsHome", DocsHome);
    app.component("AkariFluidWall", AkariFluidWall);
    app.component("AkariImagePreview", ImagePreview);
    app.component("SearchDock", SearchDock);
    app.component("AkariSearchDock", SearchDock);
    if (inBrowser) routeComponentLinks(router);
  },
} satisfies Theme;

export {
  AkariFluidWall,
  ChatExample,
  DocsHome,
  ImagePreview,
  CommandUsage,
  ModuleAlias,
  ModuleConfig,
  ModuleData,
  ModuleMeta,
  NoticeBox,
};
export * from "./types";
export { defineAkariConfig, defineAkariThemeConfig } from "./config";
export { defineAkariLanguage } from "./define";
export { AKARI_LANGUAGES, resolveLanguage } from "./i18n";
export {
  AKARI_CONTENT_ID,
  AKARI_SETTINGS_ID,
  AKARI_SIDEBAR_ID,
} from "./constants";
export {
  provideAkariComponents,
  useAkariConfig,
} from "./composables/useAkariConfig";
export { useAkariColorScheme } from "./composables/useColorScheme";
export { useAkariI18n } from "./composables/useI18n";
export { useAkariLocales } from "./composables/useLocales";
export type { AkariLocaleOption } from "./composables/useLocales";
export { default as AkariImagePreview } from "./components/content/ImagePreview.vue";
export * from "./image-preview";
export { useAkariSettings } from "./composables/useSettings";
export { useSidebar } from "./composables/useSidebar";
export { registerSearchBackend } from "./search/registry";
export { useAkariSearch } from "./search/useSearch";
export type { AkariSearchTriggerRole } from "./search/useSearch";
export { useAkariSearchDock } from "./search/useSearchDock";
export type { AkariSearchDockApi } from "./search/useSearchDock";
export type {
  AkariSearchBackend,
  AkariSearchHandler,
} from "./search/types";
