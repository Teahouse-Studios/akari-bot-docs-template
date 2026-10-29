import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";

import { provideAkariSiteData } from "./composables/useLocales";
import CommandUsage from "./components/content/CommandUsage.vue";
import ModuleMeta from "./components/content/ModuleMeta.vue";
import NoticeBox from "./components/content/NoticeBox.vue";
import Layout from "./layouts/AkariLayout.vue";
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
  enhanceApp({ app, siteData }) {
    provideAkariSiteData(app, siteData);
    app.component("ModuleMeta", ModuleMeta);
    app.component("NoticeBox", NoticeBox);
    app.component("CommandUsage", CommandUsage);
  },
} satisfies Theme;

export { CommandUsage, ModuleMeta, NoticeBox };
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
export { useAkariSettings } from "./composables/useSettings";
export { useSidebar } from "./composables/useSidebar";
export { registerSearchBackend } from "./search/registry";
export { useAkariSearch } from "./search/useSearch";
export type {
  AkariSearchBackend,
  AkariSearchHandler,
} from "./search/types";
