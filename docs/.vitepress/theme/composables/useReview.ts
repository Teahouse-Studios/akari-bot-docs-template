import {
  computed,
  inject,
  onMounted,
  provide,
  ref,
  watch,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from "vue";
import { useData, useRoute } from "vitepress";

export interface ReviewAnnotation {
  id: string;
  page: string;
  title: string;
  quote: string;
  comment: string;
  createdAt: string;
}

export interface ReviewApi {
  enabled: Ref<boolean>;
  annotations: Ref<Record<string, ReviewAnnotation[]>>;
  current: ComputedRef<ReviewAnnotation[]>;
  total: ComputedRef<number>;
  pageKey: ComputedRef<string>;
  pageTitle: ComputedRef<string>;
  status: Ref<string>;
  addAnnotation: (quote: string, comment: string) => void;
  removeAnnotation: (id: string) => void;
  clearPage: () => void;
  clearAll: () => void;
  toggleEnabled: () => void;
  copyExport: () => Promise<void>;
  downloadExport: () => void;
  exportText: ComputedRef<string>;
}

const key: InjectionKey<ReviewApi> = Symbol("akari-review");

const STORAGE_KEY = "akari-doc-review";
const ENABLED_KEY = "akari-doc-review-enabled";

function getStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function provideReview(): ReviewApi {
  const route = useRoute();
  const { page } = useData();

  const enabled = ref(false);
  const annotations = ref<Record<string, ReviewAnnotation[]>>({});
  const status = ref("");
  const pageKey = computed(() => route.path);
  const pageTitle = computed(() => page.value.title || pageKey.value);
  const current = computed(() => annotations.value[pageKey.value] ?? []);
  const total = computed(() =>
    Object.values(annotations.value).reduce(
      (sum, items) => sum + items.length,
      0,
    ),
  );

  let hydrated = false;

  function save(): void {
    if (!hydrated) return;
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(annotations.value));
      storage.setItem(ENABLED_KEY, enabled.value ? "1" : "0");
    } catch {
      // Keep the current page usable when storage is blocked or full.
    }
  }

  function load(): void {
    const storage = getStorage();
    if (storage) {
      try {
        enabled.value = storage.getItem(ENABLED_KEY) === "1";
        const raw = storage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            annotations.value = parsed as Record<string, ReviewAnnotation[]>;
          }
        }
      } catch {
        annotations.value = {};
      }
    }
    hydrated = true;
  }

  function addAnnotation(quote: string, comment: string): void {
    const text = quote.trim();
    if (!text) return;
    const item: ReviewAnnotation = {
      id: newId(),
      page: pageKey.value,
      title: pageTitle.value,
      quote: text,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    annotations.value = {
      ...annotations.value,
      [pageKey.value]: [...current.value, item],
    };
    status.value = "已记录";
  }

  function removeAnnotation(id: string): void {
    const items = current.value.filter((item) => item.id !== id);
    const next = { ...annotations.value };
    if (items.length) next[pageKey.value] = items;
    else delete next[pageKey.value];
    annotations.value = next;
  }

  function clearPage(): void {
    if (!current.value.length) return;
    const next = { ...annotations.value };
    delete next[pageKey.value];
    annotations.value = next;
  }

  function clearAll(): void {
    if (!total.value) return;
    annotations.value = {};
    status.value = "已清空全部标注";
  }

  function toggleEnabled(): void {
    enabled.value = !enabled.value;
  }

  const exportText = computed(() => {
    const groups = Object.entries(annotations.value).filter(
      ([, items]) => items.length,
    );
    if (!groups.length) return "";

    const lines = ["# 文档标注", ""];
    for (const [path, items] of groups) {
      lines.push(`## ${items[0].title}`, "", `页面：${path}`, "");
      for (const item of items) {
        lines.push(`> ${item.quote.replace(/\n/g, "\n> ")}`, "");
        if (item.comment) lines.push(item.comment, "");
      }
    }
    return lines.join("\n").trimEnd();
  });

  async function copyExport(): Promise<void> {
    const text = exportText.value;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      status.value = "已复制到剪贴板";
      return;
    } catch {
      // Fall back to the selection command when the clipboard is blocked.
    }

    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    status.value = copied ? "已复制到剪贴板" : "无法访问剪贴板，请下载文件";
  }

  function downloadExport(): void {
    const text = exportText.value;
    if (!text) return;
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "文档标注.md";
    anchor.click();
    URL.revokeObjectURL(url);
    status.value = "已下载";
  }

  watch(enabled, save);
  watch(annotations, save, { deep: true });
  onMounted(load);

  const api: ReviewApi = {
    enabled,
    annotations,
    current,
    total,
    pageKey,
    pageTitle,
    status,
    addAnnotation,
    removeAnnotation,
    clearPage,
    clearAll,
    toggleEnabled,
    copyExport,
    downloadExport,
    exportText,
  };

  provide(key, api);
  return api;
}

export function useReview(): ReviewApi {
  const api = inject(key);
  if (!api) {
    throw new Error(
      "[vitepress-akari-theme-docs] useReview() must be called inside AkariLayout.",
    );
  }
  return api;
}
