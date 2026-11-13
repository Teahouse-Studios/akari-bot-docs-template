import {
  DEFAULT_SEARCH_DEBOUNCE,
  DEFAULT_SEARCH_MAX_RESULTS,
  DEFAULT_SEARCH_SHORTCUT,
  DEFAULT_SETTINGS,
  SECTION_LABEL_MESSAGES,
  SETTINGS_SECTION_KEYS,
  SETTINGS_STORAGE_KEY,
} from "./constants";
import { resolveFonts } from "./fonts";
import {
  akariLanguages,
  DEFAULT_LANGUAGE,
  mergeMessages,
  resolveLanguage,
} from "./i18n";
import { mergeSettings } from "./settings";
import type {
  AkariFooterLink,
  AkariFooterLinkGroup,
  AkariSearchBackendConfig,
  AkariSocialLink,
  AkariThemeConfig,
  ResolvedAkariThemeConfig,
  SettingsSectionKey,
} from "./types";

interface ThemeConfigLike {
  logo?: string;
  sidebar?: unknown;
  akari?: AkariThemeConfig;
}

export { defineAkariConfig } from "./define";

export function defineAkariThemeConfig(config: AkariThemeConfig): AkariThemeConfig {
  return config;
}

function normalizeSections(
  value: SettingsSectionKey[] | undefined,
): SettingsSectionKey[] {
  if (!Array.isArray(value)) return [...SETTINGS_SECTION_KEYS];

  const filtered = value.filter((key): key is SettingsSectionKey =>
    SETTINGS_SECTION_KEYS.includes(key),
  );
  const unique = [...new Set(filtered)];
  return unique.length ? unique : [...SETTINGS_SECTION_KEYS];
}

function normalizeSocialLinks(
  value: AkariSocialLink[] | undefined,
): AkariSocialLink[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is AkariSocialLink =>
      !!item &&
      typeof item.icon === "string" &&
      typeof item.link === "string" &&
      typeof item.label === "string",
  );
}

function normalizeFooterLinks(
  value: AkariFooterLinkGroup[] | false | undefined,
): AkariFooterLinkGroup[] | false | undefined {
  if (value === false) return false;
  if (!Array.isArray(value)) return undefined;

  return value
    .filter(
      (group): group is AkariFooterLinkGroup =>
        !!group && typeof group.title === "string" && Array.isArray(group.items),
    )
    .map((group) => ({
      title: group.title,
      items: group.items.filter(
        (item): item is AkariFooterLink =>
          !!item &&
          typeof item.text === "string" &&
          typeof item.link === "string",
      ),
    }));
}

function clampNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;
}

function normalizeSearchBackend(
  value: AkariSearchBackendConfig | undefined,
): AkariSearchBackendConfig {
  if (value?.type === "http" && value.endpoint.trim()) {
    return {
      type: "http",
      endpoint: value.endpoint.trim(),
      method: value.method === "POST" ? "POST" : "GET",
      headers: value.headers ?? {},
      credentials: value.credentials ?? "same-origin",
      queryParam: value.queryParam?.trim() || "q",
      limitParam: value.limitParam?.trim() || "limit",
    };
  }

  if (value?.type === "registered" && value.id.trim()) {
    return { type: "registered", id: value.id.trim() };
  }

  return { type: "local" };
}

/**
 * Merges the theme options with their defaults. `site.lang` selects the
 * language the strings and fonts come from; VitePress passes the current
 * locale's.
 */
export function resolveAkariConfig(
  themeConfig: ThemeConfigLike = {},
  site: { title?: string; lang?: string } = {},
): ResolvedAkariThemeConfig {
  const akari = themeConfig.akari ?? {};
  const language = resolveLanguage(site.lang, akari.languages);
  const messages = mergeMessages(language.messages, akari.messages);
  const appBar = akari.appBar ?? {};
  const settings = akari.settings ?? {};
  const toc = akari.toc ?? {};
  const footer = akari.footer ?? {};
  const search = akari.search ?? {};

  const akariSidebarItems = akari.sidebar?.items;
  const hasAkariSidebar =
    !!akariSidebarItems &&
    (Array.isArray(akariSidebarItems) ||
      (typeof akariSidebarItems === "object" &&
        Object.keys(akariSidebarItems).length > 0));

  const width = Number.isFinite(akari.sidebar?.width)
    ? Math.min(400, Math.max(240, Number(akari.sidebar?.width)))
    : 320;

  const maxDepth = Number.isInteger(toc.maxDepth)
    ? Math.min(6, Math.max(1, Number(toc.maxDepth)))
    : 3;

  const sectionLabels = Object.fromEntries(
    SETTINGS_SECTION_KEYS.map((key) => [
      key,
      messages[SECTION_LABEL_MESSAGES[key]],
    ]),
  ) as Record<SettingsSectionKey, string>;

  return {
    lang: site.lang?.trim() || DEFAULT_LANGUAGE,
    commandPrefix: typeof akari.commandPrefix === "string" ? akari.commandPrefix : "",
    chatAvatar: typeof akari.chatAvatar === "string" ? akari.chatAvatar : "",
    messages,
    appBar: {
      title: appBar.title ?? site.title ?? "Documentation",
      version: appBar.version,
      logo: appBar.logo ?? themeConfig.logo,
      showSidebarToggle: appBar.showSidebarToggle ?? true,
      showSettingsToggle: appBar.showSettingsToggle ?? true,
      socialLinks: normalizeSocialLinks(appBar.socialLinks),
    },
    sidebar: {
      source: hasAkariSidebar ? "akari" : "native",
      akariItems: hasAkariSidebar ? akariSidebarItems : undefined,
      nativeItems: themeConfig.sidebar,
      width,
    },
    settings: {
      enabled: settings.enabled ?? true,
      showSchemeToggle: settings.showSchemeToggle ?? true,
      title: settings.title ?? messages.settingsTitle,
      sections: normalizeSections(settings.sections),
      labels: { ...sectionLabels, ...settings.labels },
      defaults: mergeSettings(DEFAULT_SETTINGS, settings.defaults),
      persist: settings.persist ?? true,
      storageKey: settings.storageKey ?? SETTINGS_STORAGE_KEY,
    },
    loadingBar: {
      enabled: akari.loadingBar?.enabled ?? true,
    },
    toc: {
      enabled: toc.enabled ?? true,
      maxDepth,
      overline: toc.overline ?? messages.tocOverline,
    },
    footer: {
      message: footer.message ?? messages.footerMessage,
      copyright: footer.copyright ?? "",
      showPrevNext: footer.showPrevNext ?? true,
      links: normalizeFooterLinks(footer.links),
    },
    search: {
      enabled: search.enabled ?? true,
      placeholder: search.placeholder?.trim() || messages.searchPlaceholder,
      shortcut:
        typeof search.shortcut === "string"
          ? search.shortcut.trim().toLowerCase().slice(0, 1)
          : DEFAULT_SEARCH_SHORTCUT,
      maxResults: clampNumber(
        search.maxResults,
        DEFAULT_SEARCH_MAX_RESULTS,
        1,
        20,
      ),
      debounce: clampNumber(search.debounce, DEFAULT_SEARCH_DEBOUNCE, 0, 1000),
      backend: normalizeSearchBackend(search.backend),
    },
    fonts: resolveFonts(
      akari.fonts,
      language.fonts,
      akariLanguages(akari.languages),
    ),
    components: akari.components ?? {},
  };
}
