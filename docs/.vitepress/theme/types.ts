import type { HeadConfig, MarkdownLocaleOptions } from "vitepress";
import type { Component } from "vue";

export type AkariThemeVariant =
  | "tonal-spot"
  | "vibrant"
  | "fidelity"
  | "expressive"
  | "monochrome"
  | "neutral"
  | "rainbow"
  | "fruit-salad";

/**
 * Appearance: light, dark, the system's preference (`auto`, which falls back
 * to the time of day when the system cannot say), or the time of day.
 */
export type AkariColorScheme = "light" | "dark" | "auto" | "time";
export type AkariContrastLevel = "standard" | "medium" | "high";
export type AkariMotionScheme = "standard" | "expressive";
/** Text direction: the page language's own (`auto`), or forced one way. */
export type AkariDirection = "auto" | "ltr" | "rtl";
export type AkariTextSize = "16px" | "24px" | "32px";

export type SettingsSectionKey =
  | "color"
  | "variant"
  | "contrast"
  | "motion"
  | "direction"
  | "textSize";

export interface AkariThemeSettings {
  color: string;
  variant: AkariThemeVariant;
  scheme: AkariColorScheme;
  contrast: AkariContrastLevel;
  motion: AkariMotionScheme;
  direction: AkariDirection;
  textSize: AkariTextSize;
}

export interface AkariSidebarItem {
  text: string;
  link?: string;
  icon?: string;
  badge?: string;
  collapsed?: boolean;
  items?: AkariSidebarItem[];
  /**
   * Parallel pages shown as one navigation entry and switched with a tab
   * bar on each page, like Overview / Guidelines / Specs. The entry links
   * to the first tab and is selected on any of them.
   */
  tabs?: AkariSidebarItem[];
}

export type AkariSidebarItems =
  | AkariSidebarItem[]
  | Record<string, AkariSidebarItem[]>;

export interface AkariSocialLink {
  icon: string;
  link: string;
  label: string;
}

/** Brand assets the theme can render. Every slot is optional; a site-level
 * value wins over one supplied by an installed brand package, and the docs
 * engine falls back to its bundled assets when neither exists. */
export interface AkariBrandConfig {
  /** Day-scheme logo. */
  logo?: string;
  /** Night-scheme logo; falls back to `logo`. */
  logoDark?: string;
  /** Avatar used by command examples. */
  avatar?: string;
  /** Character artwork for custom surfaces. */
  character?: string;
  /** Credits file or page for custom surfaces. */
  credits?: string;
}

export interface AkariAppBarConfig {
  title?: string;
  version?: string;
  logo?: string;
  /** Logo used while the dark scheme is active; falls back to `logo`. */
  logoDark?: string;
  showSidebarToggle?: boolean;
  showSettingsToggle?: boolean;
  socialLinks?: AkariSocialLink[];
}

/**
 * A rail category when the navigation comes from the docs' folders: the
 * folder of articles it stands for is named by its key in `categories`.
 */
export interface AkariSidebarCategory {
  /** Its name in the rail. Defaults to the folder's name. */
  text?: string;
  icon?: string;
  collapsed?: boolean;
}

export interface AkariSidebarConfig {
  /** Navigation written out by hand, in place of the one from the folders. */
  items?: AkariSidebarItems;
  /**
   * The rail categories of the navigation from the docs' folders, by
   * folder name. The order of the keys is the order in the rail; folders
   * left out follow in alphabetical order.
   */
  categories?: Record<string, AkariSidebarCategory>;
  width?: number;
}

export interface AkariSettingsConfig {
  /** Whether the settings dialog exists at all. */
  enabled?: boolean;
  /** Show the appearance (light / dark) button. Defaults to true. */
  showSchemeToggle?: boolean;
  title?: string;
  sections?: SettingsSectionKey[];
  labels?: Partial<Record<SettingsSectionKey, string>>;
  defaults?: Partial<AkariThemeSettings>;
  persist?: boolean;
  storageKey?: string;
}

/** The bar at the top of the window while a page loads. */
export interface AkariLoadingBarConfig {
  /** Defaults to `true`. */
  enabled?: boolean;
}

export interface AkariTocConfig {
  enabled?: boolean;
  maxDepth?: number;
  overline?: string;
}

export interface AkariFooterLink {
  text: string;
  link: string;
}

export interface AkariFooterLinkGroup {
  title: string;
  items: AkariFooterLink[];
}

export interface AkariFooterConfig {
  message?: string;
  copyright?: string;
  showPrevNext?: boolean;
  /**
   * Link columns of the page footer. Defaults to the sidebar's categories;
   * `false` hides the columns.
   */
  links?: AkariFooterLinkGroup[] | false;
}

export type AkariComponentSlot =
  | "AppBar"
  | "DesktopNav"
  | "Sidebar"
  | "Settings"
  | "Hero"
  | "Toc"
  | "Pager"
  | "Footer"
  | "Content";

/** How the hero image fills its card. */
export type AkariHeroFit = "cover" | "contain";

/** The faint pattern on the hero's title card, or none. */
export type AkariHeroPattern =
  | "dots"
  | "grid"
  | "plus"
  | "diagonal"
  | "waves"
  | "none";

/**
 * The `hero` frontmatter of a page: a header image shown beside the page
 * title. A plain string is the image path.
 */
export type AkariHeroFrontmatter =
  | string
  | {
      /**
       * The image: a path, `{ src, alt }`, or `{ light, dark, alt }` with a
       * separate image for the dark scheme.
       */
      image:
        | string
        | { src: string; alt?: string }
        | { light: string; dark: string; alt?: string };
      alt?: string;
      /** Shown above the title; a date such as `2026-10-28` is formatted. */
      date?: string | Date;
      /** Line under the title. Defaults to the page's `description`. */
      tagline?: string;
      /** CSS color behind the image. Defaults to the primary container. */
      background?: string;
      /** `cover` (default) fills the card; `contain` shows the whole image. */
      fit?: AkariHeroFit;
      /**
       * Theme seed color for the page. By default it is sampled from the
       * image; a `#rrggbb` value fixes it, `false` keeps the reader's color.
       */
      color?: string | false;
      /**
       * The faint pattern on the title card, brought out around the pointer.
       * By default (`auto`) one is picked at random each time the page loads.
       */
      pattern?: AkariHeroPattern | "auto";
    };

export interface AkariSearchResult {
  id: string;
  title: string;
  href: string;
  pageTitle?: string;
  heading?: string;
  excerpt?: string;
  /**
   * The words that matched, highlighted along with the query's: one the
   * query only started, or misspelled.
   */
  terms?: string[];
}

export type AkariSearchBackendConfig =
  | { type: "local" }
  | {
      type: "http";
      endpoint: string;
      method?: "GET" | "POST";
      headers?: Record<string, string>;
      credentials?: RequestCredentials;
      queryParam?: string;
      limitParam?: string;
    }
  | { type: "registered"; id: string };

/** The look the flying search trigger takes when a page docks it. */
export type AkariSearchDockVariant = "bar" | "pill" | "icon" | "hero";

/** Where a docked trigger's contents sit along its inline axis. */
export type AkariSearchDockAlign = "start" | "center" | "end";

/**
 * What a `<SearchDock>` tag tells the trigger. The tag itself supplies the
 * landing box; these options change how the copy looks once it arrives.
 */
export interface AkariSearchDockAnchorOptions {
  placeholder?: string;
  variant?: AkariSearchDockVariant;
  align?: AkariSearchDockAlign;
  /** Search inline in the dock instead of opening the dialog. */
  immersive?: boolean;
  /** Whether to show the keyboard shortcut hint. Defaults to true. */
  showShortcut?: boolean;
  /** CSS color for the field's surface; defaults to the variant's tone. */
  background?: string;
  /** CSS color for the field's border; defaults to the variant's rule. */
  borderColor?: string;
  /** Whether the floating field keeps its elevation shadow. */
  shadow?: boolean;
  /** MD3 elevation level, 0 to 5; 0 removes the shadow. */
  elevation?: number;
  /** Higher wins when one page contains more than one dock tag. */
  priority?: number;
}

export interface ResolvedAkariSearchDockAnchorOptions {
  placeholder?: string;
  variant: AkariSearchDockVariant;
  align: AkariSearchDockAlign;
  immersive: boolean;
  showShortcut: boolean;
  background?: string;
  borderColor?: string;
  shadow: boolean;
  elevation?: number;
  priority: number;
}

export interface AkariSearchConfig {
  enabled?: boolean;
  placeholder?: string;
  shortcut?: string;
  maxResults?: number;
  debounce?: number;
  backend?: AkariSearchBackendConfig;
}

export interface ResolvedAkariSearchConfig {
  enabled: boolean;
  placeholder: string;
  shortcut: string;
  maxResults: number;
  debounce: number;
  backend: AkariSearchBackendConfig;
}

/**
 * Interface strings of the theme. `{name}` placeholders are filled in at
 * runtime. Built-in translations cover Chinese (`zh`), English (`en`),
 * Japanese (`ja`), Korean (`ko`), French (`fr`) and Arabic (`ar`);
 * other languages fall back to English.
 */
export interface AkariMessages {
  navigationToggle: string;
  navigationLabel: string;
  railLabel: string;
  /** Placeholders: `{category}`. */
  categoryNavigation: string;
  /** Placeholders: `{category}`. */
  categoryPages: string;
  /** Placeholders: `{title}`. */
  homeLink: string;
  /** The app bar's overflow menu button, when its actions do not fit. */
  moreActions: string;
  /** The floating button that scrolls back to the top, and its label. */
  backToTop: string;
  /** Label of the dialog that shows a picture enlarged. Placeholders: `{alt}`. */
  imagePreview: string;
  /** The same dialog for a picture that carries no description. */
  imagePreviewNoAlt: string;
  /** Name of the button that opens the enlarged picture. */
  imagePreviewOpen: string;
  imagePreviewZoomIn: string;
  imagePreviewZoomOut: string;
  /** Placeholders: `{percentage}`. */
  imagePreviewZoomStatus: string;
  imagePreviewRotateLeft: string;
  imagePreviewRotateRight: string;
  imagePreviewResetView: string;
  imagePreviewClose: string;
  /** The floating button that opens the table of contents on compact windows. */
  tocButton: string;
  languageLabel: string;
  languageDialogTitle: string;
  languageDialogClose: string;
  /** Placeholders: `{mode}`. Label of the appearance button. */
  schemeToggle: string;
  settingsClose: string;
  tocOverline: string;
  pagerLabel: string;
  previousPage: string;
  nextPage: string;
  footerMessage: string;
  footerLinks: string;
  notFoundTitle: string;
  notFoundText: string;
  notFoundLink: string;
  settingsTitle: string;
  settingsColor: string;
  settingsVariant: string;
  settingsContrast: string;
  settingsMotion: string;
  settingsDirection: string;
  settingsTextSize: string;
  schemeLight: string;
  schemeAuto: string;
  schemeDark: string;
  schemeTime: string;
  /** The snackbar after a switch of mode. Placeholders: `{mode}`. */
  schemeChanged: string;
  /**
   * The snackbar after a switch to a mode that follows something, with
   * what it comes to now. Placeholders: `{mode}`, `{scheme}`.
   */
  schemeChangedFollowing: string;
  contrastStandard: string;
  contrastMedium: string;
  contrastHigh: string;
  motionStandard: string;
  motionExpressive: string;
  /** The text direction option that follows the page's language. */
  directionAuto: string;
  directionLtr: string;
  directionRtl: string;
  searchPlaceholder: string;
  searchLabel: string;
  /** Placeholders: `{label}`, `{shortcut}`. */
  searchShortcutLabel: string;
  searchClose: string;
  searchIntroTitle: string;
  searchIntroText: string;
  /** Placeholders: `{keys}`, rendered as keyboard keys. */
  searchIntroShortcut: string;
  searchLoading: string;
  searchErrorTitle: string;
  searchRetry: string;
  searchEmptyTitle: string;
  searchEmptyText: string;
  /** Placeholders: `{count}`. Used for counts in the plural category "one". */
  searchResultCountOne: string;
  /** Placeholders: `{count}`. */
  searchResultCount: string;
  searchResultsLabel: string;
  searchResultPage: string;
  searchHintSelect: string;
  searchHintOpen: string;
  searchHintClose: string;
  searchFailed: string;
  searchIndexUnavailable: string;
  searchIndexInvalid: string;
  /** Placeholders: `{status}`. */
  searchRequestFailed: string;
  /** Placeholders: `{id}`. */
  searchBackendMissing: string;
  /** The loading bar's name for assistive technology. */
  loadingLabel: string;
  /** Name of a command conversation example. */
  chatExample: string;
  /** Resets a conversation example to its initial transcript. */
  chatExampleReset: string;
  /** Placeholder bubble while a button reply loads. */
  chatExampleLoading: string;
  /** Status after a dismiss button removes its reply group. */
  chatExampleDeleted: string;
  /** Appended when a button reply contains images that fail to load. */
  chatExampleImageError: string;
  /** Status after a button reply has been appended. */
  chatExampleResultsLoaded: string;
  /** Status after resetting a conversation example. */
  chatExampleResetDone: string;
  /** Separator between parts of a conversation. */
  chatExampleDivider: string;
  /** Image button label. Placeholders: `{alt}`. */
  chatExampleViewImage: string;
  /** Image button label when the image has no description. */
  chatExampleViewImageNoAlt: string;
  /** Tooltip of an image thumbnail. */
  chatExampleViewLarge: string;
  /** Name of the button row below a message. */
  chatExampleActions: string;
  /** Dismiss button label. */
  chatExampleDismiss: string;
  /** Fallback label for a button without one. */
  chatExampleButton: string;
  /** SearchDock demo controls and labels. */
  dockDemoVariant: string;
  dockDemoAlign: string;
  dockDemoPlaceholder: string;
  dockDemoBar: string;
  dockDemoPill: string;
  dockDemoIcon: string;
  dockDemoHero: string;
  dockDemoStart: string;
  dockDemoCenter: string;
  dockDemoEnd: string;
  dockDemoFill: string;
  dockDemoNatural: string;
  dockDemoHideTag: string;
  dockDemoShowTag: string;
  dockDemoImmersive: string;
  dockDemoShortcut: string;
  dockDemoBackground: string;
  dockDemoBorder: string;
  dockDemoShadow: string;
  dockDemoElevation: string;
  dockDemoAuto: string;
  dockDemoReload: string;
  dockDemoCaption: string;
  dockDemoHint: string;
  /** AkariFluidWall playground controls and labels. */
  fluidDemoPreview: string;
  fluidDemoVariant: string;
  fluidDemoStructure: string;
  fluidDemoTexture: string;
  fluidDemoTextureAuto: string;
  fluidDemoTextureTone: string;
  fluidDemoTextureColor: string;
  fluidDemoColorTone: string;
  fluidDemoColorToken: string;
  fluidDemoColorCustom: string;
  fluidDemoColorPicker: string;
  fluidDemoAlpha: string;
  fluidDemoVineColors: string;
  fluidDemoVinePart: string;
  fluidDemoVineBase: string;
  fluidDemoVineLeaf: string;
  fluidDemoVineLeafStem: string;
  fluidDemoVineFlower: string;
  fluidDemoVineFlowerStem: string;
  fluidDemoVineBud: string;
  fluidDemoVineFill: string;
  fluidDemoVineTint: string;
  fluidDemoVineHalo: string;
  fluidDemoVineEdge: string;
  fluidDemoVineFine: string;
  fluidDemoVineResetPart: string;
  fluidDemoVineBlend: string;
  fluidDemoRipple: string;
  fluidDemoRippleSpeed: string;
  fluidDemoRippleSize: string;
  fluidDemoRippleRings: string;
  fluidDemoRippleSway: string;
  fluidDemoVineGlow: string;
  fluidDemoShadow: string;
  fluidDemoShadowSize: string;
  fluidDemoShadowColor: string;
  fluidDemoShadowAngle: string;
  fluidDemoShadowBlur: string;
  fluidDemoWallShadow: string;
  fluidDemoWallShadowSize: string;
  fluidDemoWallShadowColor: string;
  fluidDemoWallShadowAngle: string;
  fluidDemoWallShadowBlur: string;
  fluidDemoVineUnderlay: string;
  fluidDemoVineUnderlayColor: string;
  fluidDemoVineUnderlayBlend: string;
  fluidDemoMote: string;
  fluidDemoMoteColor: string;
  fluidDemoMoteBlend: string;
  fluidDemoPresets: string;
  fluidDemoPresetName: string;
  fluidDemoSavePreset: string;
  fluidDemoLoadPreset: string;
  fluidDemoDeletePreset: string;
  fluidDemoVinePopoutBlend: string;
  fluidDemoVinePopoutColors: string;
  fluidDemoVinePopoutOutsideColors: string;
  fluidDemoVinePopoutOutsideBlend: string;
  fluidDemoBlendSame: string;
  fluidDemoBlendNormal: string;
  fluidDemoBlendMultiply: string;
  fluidDemoBlendScreen: string;
  fluidDemoBlendOverlay: string;
  fluidDemoBlendSoftLight: string;
  fluidDemoBlendDifference: string;
  fluidDemoToneInk: string;
  fluidDemoToneLight: string;
  fluidDemoHeight: string;
  fluidDemoFlow: string;
  fluidDemoSpeed: string;
  fluidDemoScale: string;
  fluidDemoCurl: string;
  fluidDemoWarp: string;
  fluidDemoPetal: string;
  fluidDemoTone: string;
  fluidDemoLightGroup: string;
  fluidDemoLight: string;
  fluidDemoGlow: string;
  fluidDemoOverlay: string;
  fluidDemoGrid: string;
  fluidDemoTextureSize: string;
  fluidDemoTextureDensity: string;
  fluidDemoVineDensity: string;
  fluidDemoTextureOpacity: string;
  fluidDemoRandom: string;
  fluidDemoReset: string;
  fluidDemoCopy: string;
  fluidDemoCopied: string;
  fluidDemoHint: string;
  fluidDemoPopout: string;
  fluidDemoInward: string;
  fluidDemoSafeZone: string;
  fluidDemoOutsideSafeZone: string;
  fluidDemoWallVinesInSafeZone: string;
  fluidDemoOn: string;
  fluidDemoOff: string;
}

/**
 * The text's fonts. Unset fields take the language's defaults: Roboto and
 * the Noto Sans of its script from Google Fonts, then the system's fonts.
 */
export interface AkariFontsConfig {
  /**
   * Families to load from Google Fonts, each as the css2 API's `family`
   * value (`"Noto Sans JP:wght@100..900"`). `false` loads none, so the text
   * uses the fonts installed on the reader's device; `true` the defaults.
   */
  google?: boolean | string[];
  /**
   * The text's `font-family`, in order: each character takes the first
   * family that has it. Name the Google Fonts families here too.
   */
  family?: string[];
}

export interface ResolvedAkariFonts {
  /** The Google Fonts stylesheet, if anything is loaded from it. */
  stylesheet?: string;
  /** The `font-family` value. */
  family: string;
  /**
   * CSS giving text marked as another language (`lang="ja"`) that
   * language's fonts, as far as the device has them.
   */
  marked: string;
}

/** A language's fonts: what to load from Google Fonts, and the stack. */
export interface AkariLanguageFonts {
  /** Families in the Google Fonts css2 API's `family` form. */
  google: readonly string[];
  /** The `font-family` list, in order. */
  family: readonly string[];
}

/**
 * Everything the theme knows about a language, for the pages in it: its
 * interface strings, its fonts, its direction and its strings in rendered
 * Markdown. The theme comes with some (`AKARI_LANGUAGES`); a site adds
 * others, or changes those, with `languages` in its config. Write one with
 * `defineAkariLanguage`.
 */
export interface AkariLanguage {
  /**
   * The BCP 47 tag it serves. A page takes the language of its full tag
   * (`pt-BR`), else of its primary subtag (`pt`), else English.
   */
  code: string;
  /** Its writing direction. Defaults to `"ltr"`. */
  dir?: "ltr" | "rtl";
  /** Its fonts. Defaults to the theme's: Roboto and Noto Sans SC. */
  fonts?: AkariLanguageFonts;
  /** Its interface strings. Missing ones are English. */
  messages?: Partial<AkariMessages>;
  /** Its strings in rendered Markdown: code blocks' copy button, containers' titles. */
  markdown?: MarkdownLocaleOptions;
}

/** A page's language, its gaps filled. */
export interface ResolvedAkariLanguage {
  /** The code of the language serving the page. */
  code: string;
  dir: "ltr" | "rtl";
  fonts: AkariLanguageFonts;
  messages: AkariMessages;
  markdown: MarkdownLocaleOptions;
}

export interface AkariApiParameter {
  name: string;
  type: string;
  default: string;
  description: string;
}

export interface AkariApiMethod {
  name: string;
  kind: "method" | "property";
  description: string;
  signature: string;
  parameters: AkariApiParameter[];
}

export interface AkariApiEntry {
  name: string;
  kind: "class" | "function" | "constant";
  description: string;
  signature: string;
  parameters: AkariApiParameter[];
  methods?: AkariApiMethod[];
}

export interface AkariApiGroup {
  name: string;
  entries: AkariApiEntry[];
}

export interface AkariApiCatalog {
  groups: AkariApiGroup[];
}

export interface AkariThemeConfig {
  /**
   * Prefix of the documented commands, e.g. `~`. The docs engine fills it from
   * the instance configuration; content components that print a command line
   * read it from here.
   */
  commandPrefix?: string;
  /**
   * 机器人头像，用于命令对话示例；留空时组件显示机器人图标。
   */
  chatAvatar?: string;
  /**
   * 各包的运行依赖，键为包 key 或分发名。由文档引擎从包元数据写入。
   */
  dependencies?: Record<string, string[]>;
  /** 机器人支持的界面语言；由文档引擎从 core 的语言表写入。 */
  languages?: Record<string, string>;
  /** API 参考数据；由文档引擎从 core 的公开接口与 docstring 生成。 */
  apiCatalog?: AkariApiCatalog;
  brand?: AkariBrandConfig;
  appBar?: AkariAppBarConfig;
  sidebar?: AkariSidebarConfig;
  settings?: AkariSettingsConfig;
  toc?: AkariTocConfig;
  loadingBar?: AkariLoadingBarConfig;
  footer?: AkariFooterConfig;
  search?: AkariSearchConfig;
  fonts?: AkariFontsConfig;
  /**
   * Languages besides the theme's own, or changes to them: one with the
   * code of a built-in language is laid over it.
   */
  languages?: AkariLanguage[];
  /** Overrides for the interface strings of the current locale. */
  messages?: Partial<AkariMessages>;
  components?: Partial<Record<AkariComponentSlot, Component>>;
}

/**
 * A config file of the docs, written with `defineAkariConfig`:
 * `docs/config.ts` holds what every language shares, and the `config.ts`
 * in a language folder (`docs/zh-CN/config.ts`) what that language changes.
 * Each field of the language's file replaces the shared one; objects are
 * merged field by field.
 */
export interface AkariSiteConfig extends Omit<AkariThemeConfig, "components"> {
  /**
   * Shared config only: the language folder served at the site root. The
   * other languages are under `/<folder>/`. Defaults to the first folder
   * in alphabetical order.
   */
  rootLanguage?: string;
  /**
   * The language, e.g. `zh-CN`; it also picks the language the theme
   * takes strings, fonts and direction from. Defaults to the name of the
   * language folder.
   */
  lang?: string;
  /**
   * The language's name in the language menu. Defaults to its name for
   * itself ("日本語").
   */
  label?: string;
  /** Defaults to the language's direction. */
  dir?: "ltr" | "rtl" | "auto";
  title?: string;
  titleTemplate?: string | boolean;
  description?: string;
  head?: HeadConfig[];
  /** The brand image of the app bar. */
  logo?: string;
  /**
   * The language's strings in rendered markdown, such as code blocks' copy
   * button, laid over the language's own.
   */
  markdown?: MarkdownLocaleOptions;
}

/**
 * The same config in the shape VitePress reads from a directory's
 * `config.ts`: its own fields as they are, the theme's under
 * `themeConfig.akari`.
 */
export interface AkariDirectoryConfig {
  rootLanguage?: string;
  lang?: string;
  label?: string;
  dir?: "ltr" | "rtl" | "auto";
  title?: string;
  titleTemplate?: string | boolean;
  description?: string;
  head?: HeadConfig[];
  markdown?: MarkdownLocaleOptions;
  themeConfig?: { logo?: string; akari?: AkariThemeConfig };
}

/**
 * Frontmatter that places a page in the navigation from the docs'
 * folders. An article is `<category>/<article>/index.md` in a language
 * folder; its folder's name is its path.
 */
export interface AkariPageFrontmatter {
  /** Its name in the navigation and its page title. Defaults to the first heading. */
  title?: string;
  icon?: string;
  badge?: string;
  /** Its place in the category, lowest first; articles without one follow, by folder name. */
  order?: number;
  /**
   * Parallel pages: names of other markdown files in the article's folder,
   * in the order of the tab bar, after the article itself. They are not
   * in the sidebar.
   */
  parallel?: string[];
  /** The page's label in the tab bar. Defaults to its title. */
  tab?: string;
  /** The language's home page only: the category it shows in. */
  category?: string;
}

export interface ResolvedSidebarConfig {
  source: "akari" | "native";
  akariItems?: AkariSidebarItems;
  nativeItems?: unknown;
  width: number;
}

export interface ResolvedAkariThemeConfig {
  /** Language the interface strings resolved for, e.g. `zh-CN`. */
  lang: string;
  /** Prefix of the documented commands; empty when the site has none. */
  commandPrefix: string;
  /** 机器人头像；空串表示未配置。 */
  chatAvatar: string;
  dependencies: Record<string, string[]>;
  languages: Record<string, string>;
  apiCatalog: AkariApiCatalog;
  messages: AkariMessages;
  brand: AkariBrandConfig;
  appBar: {
    title: string;
    version?: string;
    logo?: string;
    logoDark?: string;
    showSidebarToggle: boolean;
    showSettingsToggle: boolean;
    socialLinks: AkariSocialLink[];
  };
  sidebar: ResolvedSidebarConfig;
  settings: {
    enabled: boolean;
    showSchemeToggle: boolean;
    title: string;
    sections: SettingsSectionKey[];
    labels: Record<SettingsSectionKey, string>;
    defaults: AkariThemeSettings;
    persist: boolean;
    storageKey: string;
  };
  toc: {
    enabled: boolean;
    maxDepth: number;
    overline: string;
  };
  loadingBar: {
    enabled: boolean;
  };
  footer: {
    message: string;
    copyright: string;
    showPrevNext: boolean;
    /** Undefined derives the columns from the sidebar. */
    links?: AkariFooterLinkGroup[] | false;
  };
  search: ResolvedAkariSearchConfig;
  fonts: ResolvedAkariFonts;
  components: Partial<Record<AkariComponentSlot, Component>>;
}

export interface AkariSettingsApi {
  settings: AkariThemeSettings;
  sections: SettingsSectionKey[];
  labels: Record<SettingsSectionKey, string>;
  defaults: AkariThemeSettings;
  setSetting<K extends keyof AkariThemeSettings>(
    key: K,
    value: AkariThemeSettings[K],
  ): void;
  reset(): void;
  isDefault(): boolean;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
