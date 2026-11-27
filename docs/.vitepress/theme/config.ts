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
  CliCommand,
  GeneratedData,
  GeneratedFacts,
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

function normalizeSupportedLanguages(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const entries = Object.entries(value as Record<string, unknown>);
  const result: Record<string, string> = {};
  for (const [code, label] of entries) {
    if (typeof label !== "string") continue;
    const key = code.trim();
    const text = label.trim();
    if (key && text) result[key] = text;
  }
  return result;
}

function normalizeDependencies(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object") return {};
  const entries = Object.entries(value as Record<string, unknown>);
  const result: Record<string, string[]> = {};
  for (const [key, items] of entries) {
    if (!Array.isArray(items)) continue;
    const dependencies = items
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    if (dependencies.length) result[key] = dependencies;
  }
  return result;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/**
 * Narrows the facts the docs engine writes at build time. Both maps are
 * always objects here, so the content components read them without guarding;
 * entries whose shape the build did not follow are dropped rather than
 * reaching the tables.
 */
function normalizeGenerated(value: unknown): GeneratedData {
  const source: { packages?: unknown; cli?: unknown; labels?: unknown } =
    isRecord(value) ? value : {};
  const packages: NonNullable<GeneratedData["packages"]> = {};
  if (isRecord(source.packages)) {
    for (const [key, entry] of Object.entries(source.packages)) {
      if (!isRecord(entry)) continue;
      packages[key] = entry as { facts?: GeneratedFacts };
    }
  }
  const cli: NonNullable<GeneratedData["cli"]> = {};
  if (isRecord(source.cli)) {
    for (const [key, entry] of Object.entries(source.cli)) {
      if (!isRecord(entry)) continue;
      cli[key] = entry as unknown as CliCommand;
    }
  }
  const labels: NonNullable<GeneratedData["labels"]> = {};
  if (isRecord(source.labels)) {
    for (const [key, entry] of Object.entries(source.labels)) {
      if (typeof entry === "string") labels[key] = entry;
    }
  }
  return { packages, cli, labels };
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
  const brand = akari.brand ?? {};
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
    dependencies: normalizeDependencies(akari.dependencies),
    supportedLanguages: normalizeSupportedLanguages(akari.supportedLanguages),
    apiCatalog: akari.apiCatalog ?? { groups: [] },
    generated: normalizeGenerated(akari.generated),
    messages,
    brand: {
      logo: brand.logo ?? appBar.logo ?? themeConfig.logo,
      logoDark: brand.logoDark ?? appBar.logoDark,
      avatar: brand.avatar ?? akari.chatAvatar,
      character: brand.character,
      credits: brand.credits,
    },
    appBar: {
      title: appBar.title ?? site.title ?? "Documentation",
      version: appBar.version,
      logo: appBar.logo ?? themeConfig.logo,
      logoDark: appBar.logoDark,
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
