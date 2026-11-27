import { inBrowser, type Theme } from "vitepress";
import type { Component } from "vue";
import DefaultTheme from "vitepress/theme-without-fonts";

import { provideAkariSiteData } from "./composables/useLocales";
import { getAkariGpuTier } from "./gpu-tier";
import AkariFluidWall from "./components/content/AkariFluidWall.vue";
import AdapterCapabilities from "./components/content/AdapterCapabilities.vue";
import ChatExample from "./components/content/ChatExample.vue";
import CliCommandOptions from "./components/content/CliCommandOptions.vue";
import CommandUsage from "./components/content/CommandUsage.vue";
import ImagePreview from "./components/content/ImagePreview.vue";
import ModuleAlias from "./components/content/ModuleAlias.vue";
import ModuleConfig from "./components/content/ModuleConfig.vue";
import ModuleConfigFields from "./components/content/ModuleConfigFields.vue";
import ModuleData from "./components/content/ModuleData.vue";
import ModuleMeta from "./components/content/ModuleMeta.vue";
import NoticeBox from "./components/content/NoticeBox.vue";
import ApiCatalog from "./components/content/ApiCatalog.vue";
import PackageDependencies from "./components/content/PackageDependencies.vue";
import ReviewTool from "./components/content/ReviewTool.vue";
import SupportedLanguages from "./components/content/SupportedLanguages.vue";
import VineSeedControl from "./components/content/VineSeedControl.vue";
import SearchDock from "./search/components/SearchDock.vue";
import Layout from "./layouts/AkariLayout.vue";
import { routeComponentLinks } from "./links";
import "./styles/index.css";

const homeModules = import.meta.glob<{ default: Component }>("./components/content/DocsHome.vue", { eager: true });
const DocsHome = Object.values(homeModules)[0]?.default;

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
    app.component("ApiCatalog", ApiCatalog);
    app.component("PackageDependencies", PackageDependencies);
    app.component("ReviewTool", ReviewTool);
    app.component("SupportedLanguages", SupportedLanguages);
    app.component("CommandUsage", CommandUsage);
    app.component("ChatExample", ChatExample);
    app.component("ModuleConfig", ModuleConfig);
    app.component("ModuleConfigFields", ModuleConfigFields);
    app.component("ModuleData", ModuleData);
    app.component("ModuleAlias", ModuleAlias);
    app.component("AdapterCapabilities", AdapterCapabilities);
    app.component("CliCommandOptions", CliCommandOptions);
    if (DocsHome) app.component("DocsHome", DocsHome);
    app.component("AkariFluidWall", AkariFluidWall);
    app.component("VineSeedControl", VineSeedControl);
    app.component("AkariImagePreview", ImagePreview);
    app.component("SearchDock", SearchDock);
    app.component("AkariSearchDock", SearchDock);
    if (inBrowser) {
      // Publish the tier on <html> before the first scroll; CSS uses it to
      // choose the GPU topbar transition over the cheaper surface mask.
      void getAkariGpuTier();
      routeComponentLinks(router);
    }
  },
} satisfies Theme;

export {
  AdapterCapabilities,
  AkariFluidWall,
  ChatExample,
  CliCommandOptions,
  ImagePreview,
  CommandUsage,
  ModuleAlias,
  ModuleConfig,
  ModuleConfigFields,
  ModuleData,
  ModuleMeta,
  NoticeBox,
  ApiCatalog,
  PackageDependencies,
  ReviewTool,
  SupportedLanguages,
  VineSeedControl,
};
export * from "./types";
export * from "./fluid";
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
