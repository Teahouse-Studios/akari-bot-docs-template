import type {
  AkariSidebarItem,
  ResolvedSidebarConfig,
} from "./types";

interface NativeSidebarItem {
  text?: string;
  link?: string;
  items?: NativeSidebarItem[];
  tabs?: NativeSidebarItem[];
  collapsed?: boolean;
  base?: string;
  icon?: string;
  badge?: string;
}

type NativeSidebarItems =
  | NativeSidebarItem[]
  | Record<string, NativeSidebarItem[]>;

function stripQueryAndHash(input: string): string {
  return input.split(/[?#]/)[0] ?? "";
}

export function normalizePath(input: string, base = "/"): string {
  let path = stripQueryAndHash(input || "/");
  const normalizedBase =
    base === "/" ? "" : stripQueryAndHash(base).replace(/\/+$/, "");

  if (
    normalizedBase &&
    (path === normalizedBase || path.startsWith(`${normalizedBase}/`))
  ) {
    path = path.slice(normalizedBase.length) || "/";
  }

  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/+$/, "");
  path = path.replace(/\.html$/, "");

  return path || "/";
}

export function isExternalLink(link: string): boolean {
  if (!link) return false;
  return link.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(link);
}

/**
 * A page's link as the site serves it: with `.html` when clean URLs are
 * off (`cleanUrls: false`), so the address bar shows the file the server
 * has. Links are written either way; a folder's (`/zh-CN/`), a file's
 * (`/logo.svg`), an anchor and an external link stay as they are.
 */
export function pageLink(link: string, cleanUrls = false): string {
  if (cleanUrls || !link || isExternalLink(link) || link.startsWith("#")) {
    return link;
  }
  const [, path = "", rest = ""] = /^([^?#]*)(.*)$/.exec(link) ?? [];
  if (!path || path.endsWith("/") || /\.[a-z0-9]+$/i.test(path)) return link;
  return `${path}.html${rest}`;
}

function joinLink(base: string, link: string): string {
  if (
    !link ||
    isExternalLink(link) ||
    link.startsWith("/") ||
    link.startsWith("#")
  ) {
    return link;
  }

  const prefix = base.replace(/\/+$/, "");
  return `${prefix}/${link.replace(/^\/+/, "")}`;
}

function pickItems<T>(
  config: T[] | Record<string, T[]>,
  path: string,
  base: string,
): T[] {
  if (Array.isArray(config)) return config;

  const current = normalizePath(path, base);
  const entries = Object.entries(config)
    .map(([key, items]) => ({ key: normalizePath(key, base), items }))
    .sort((a, b) => b.key.length - a.key.length);

  const match = entries.find(({ key }) =>
    key === "/"
      ? current.startsWith("/")
      : current === key || current.startsWith(`${key}/`),
  );

  return match?.items ?? [];
}

function normalizeNativeItems(
  items: NativeSidebarItem[],
  parentBase = "",
): AkariSidebarItem[] {
  return items.map((item) => {
    const childBase = item.base ? joinLink(parentBase, item.base) : parentBase;
    const children = Array.isArray(item.items)
      ? normalizeNativeItems(item.items, childBase)
      : undefined;
    const tabs = Array.isArray(item.tabs)
      ? normalizeNativeItems(item.tabs, childBase)
      : undefined;

    return {
      text: item.text ?? item.link ?? "",
      link: item.link ? joinLink(parentBase, item.link) : undefined,
      icon: item.icon,
      badge: item.badge,
      collapsed: item.collapsed,
      ...(children ? { items: children } : {}),
      ...(tabs ? { tabs } : {}),
    };
  });
}

function isNativeSidebar(value: unknown): value is NativeSidebarItems {
  return Array.isArray(value) || (!!value && typeof value === "object");
}

export function resolveSidebarItems(
  config: ResolvedSidebarConfig,
  path: string,
  base = "/",
): AkariSidebarItem[] {
  if (config.source === "akari" && config.akariItems) {
    return pickItems<AkariSidebarItem>(config.akariItems, path, base);
  }

  if (!isNativeSidebar(config.nativeItems)) return [];

  return normalizeNativeItems(
    pickItems<NativeSidebarItem>(config.nativeItems, path, base),
  );
}

export function isActiveLink(
  currentPath: string,
  target: string,
  base = "/",
): boolean {
  if (!target || isExternalLink(target) || target.startsWith("#")) return false;
  return normalizePath(currentPath, base) === normalizePath(target, base);
}

/** Whether an item stands for parallel pages switched with a tab bar. */
export function isTabGroup(item: AkariSidebarItem): boolean {
  return item.tabs?.some((tab) => !!tab.link) ?? false;
}

export function hasActiveItem(
  item: AkariSidebarItem,
  currentPath: string,
  base = "/",
): boolean {
  if (item.link && isActiveLink(currentPath, item.link, base)) return true;
  if (
    item.tabs?.some(
      (tab) => !!tab.link && isActiveLink(currentPath, tab.link, base),
    )
  ) {
    return true;
  }
  return (
    item.items?.some((child) =>
      hasActiveItem(child, currentPath, base),
    ) ?? false
  );
}

/**
 * The pages of a navigation tree in reading order. A tab group contributes
 * its tabs, so stepping through pages visits each of them; with
 * `tabs: "group"` it contributes a single entry for the group instead.
 */
export function flattenSidebar(
  items: AkariSidebarItem[],
  options: { tabs?: "expand" | "group" } = {},
): AkariSidebarItem[] {
  const result: AkariSidebarItem[] = [];

  for (const item of items) {
    if (isTabGroup(item)) {
      const tabs = item.tabs!.filter((tab) => !!tab.link);
      if (options.tabs === "group") {
        result.push({ ...item, link: item.link ?? tabs[0]!.link });
      } else {
        result.push(...tabs);
      }
    } else if (item.link) {
      result.push(item);
    }
    if (item.items) result.push(...flattenSidebar(item.items, options));
  }

  return result;
}

/**
 * The first navigable link of an item, depth-first: its own, its first
 * tab's, then its children's.
 */
export function findFirstLink(item: AkariSidebarItem): string | undefined {
  return (
    item.link ??
    item.tabs?.find((tab) => !!tab.link)?.link ??
    flattenSidebar(item.items ?? [])[0]?.link
  );
}

/** The tab group the current page belongs to, if any. */
export function findTabGroup(
  items: AkariSidebarItem[],
  currentPath: string,
  base = "/",
): AkariSidebarItem | undefined {
  for (const item of items) {
    if (
      isTabGroup(item) &&
      item.tabs!.some(
        (tab) => !!tab.link && isActiveLink(currentPath, tab.link, base),
      )
    ) {
      return item;
    }

    const nested = item.items && findTabGroup(item.items, currentPath, base);
    if (nested) return nested;
  }

  return undefined;
}

/**
 * The pages before and after the current one within its parallel page
 * group, for the pager: it moves between the parts of one document only.
 * The group's first page has no previous one, its last no next one, and a
 * page outside any group has neither.
 */
export function findPrevNext(
  items: AkariSidebarItem[],
  currentPath: string,
  base = "/",
): { prev?: AkariSidebarItem; next?: AkariSidebarItem } {
  const group = findTabGroup(items, currentPath, base);
  const tabs = group?.tabs?.filter((tab) => !!tab.link) ?? [];
  const index = tabs.findIndex((tab) =>
    isActiveLink(currentPath, tab.link!, base),
  );

  if (index < 0) return {};

  return { prev: tabs[index - 1], next: tabs[index + 1] };
}
