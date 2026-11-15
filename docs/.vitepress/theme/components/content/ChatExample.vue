<script setup lang="ts">
import { computed, ref } from "vue";
import * as vitepress from "vitepress";
import MarkdownIt from "markdown-it";

import { formatMessage } from "../../i18n";
import { AKARI_ENGLISH } from "../../i18n/languages";
import { useOptionalAkariConfig } from "../../composables/useAkariConfig";
import { isExternalLink } from "../../sidebar";
import {
  chatBubbles,
  chatButtonBubbles,
  chatSegments,
  type ChatBubble,
  type ChatButton,
  type ChatCard,
  type ChatImage,
  type ChatMessage,
} from "./chat";
import WikiCard from "./WikiCard.vue";

const props = withDefaults(
  defineProps<{
    /** 简写日志：`用户：…` / `机器人：…`，无前缀的行续接上一条。 */
    log?: string[];
    /** 需要显式控制角色时的消息数组，优先于 `log`。 */
    messages?: ChatMessage[];
    /** 气泡上方的说明，留空时不显示。 */
    caption?: string;
    /** 机器人头像，覆盖站点配置。 */
    botAvatar?: string;
    /** 消息下方附带的操作按钮；点击后把回复追加到对话末尾。 */
    buttons?: ChatButton[];
    /** 固定示例内所有图片的宽度（像素），用于同一气泡内多张图需要对齐的场景。 */
    imageWidth?: number;
    /** 机器人回复的卡片消息，渲染在对话末尾。 */
    card?: ChatCard | null;
    /** 点击任一按钮后禁用同组其余按钮，适用于一次性的验证选择。 */
    oneShot?: boolean;
  }>(),
  {
    log: () => [],
    messages: () => [],
    caption: "",
    botAvatar: "",
    buttons: () => [],
    imageWidth: 0,
    card: null,
    oneShot: false,
  },
);

const akari = useOptionalAkariConfig();
const i18nMessages = computed(() => akari?.value.messages ?? AKARI_ENGLISH.messages);

function t(
  key: keyof typeof AKARI_ENGLISH.messages,
  params?: Readonly<Record<string, string | number>>,
): string {
  return formatMessage(i18nMessages.value[key], params);
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

/**
 * 气泡内的 Markdown 渲染器：禁用原始 HTML，链接只补全外链的安全属性；
 * 图片改写成带查看叠层标记的按钮，沿用缩略图与 natural 的现有行为。
 */
function createMarkdownRenderer(): MarkdownIt {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true,
    typographer: false,
  });
  md.core.ruler.after("inline", "chat-natural-image", (state) => {
    for (const token of state.tokens) {
      const children = token.children;
      if (!children) {
        continue;
      }
      for (let index = 0; index < children.length; index += 1) {
        const child = children[index];
        const next = children[index + 1];
        if (
          child.type !== "image" ||
          next?.type !== "text" ||
          !next.content.startsWith("{natural}")
        ) {
          continue;
        }
        child.meta = { ...(child.meta ?? {}), natural: true };
        next.content = next.content.slice("{natural}".length);
        if (!next.content) {
          children.splice(index + 1, 1);
        }
      }
    }
  });
  md.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const token = tokens[index];
    if (isExternalLink(token.attrGet("href") ?? "")) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noreferrer noopener");
    }
    return self.renderToken(tokens, index, options);
  };
  md.renderer.rules.image = (tokens, index) => {
    const token = tokens[index];
    const src = token.attrGet("src") ?? "";
    const alt = token.content;
    const natural = token.meta?.natural === true;
    const label = alt
      ? t("chatExampleViewImage", { alt })
      : t("chatExampleViewImageNoAlt");
    return (
      `<button type="button" class="chat-example__image${
        natural ? " chat-example__image--natural" : ""
      }" data-chat-image data-src="${escapeHtml(src)}" data-alt="${escapeHtml(alt)}"${
        natural ? ' data-natural="1"' : ""
      } aria-label="${escapeHtml(label)}" title="${escapeHtml(
        t("chatExampleViewLarge"),
      )}"><img src="${escapeHtml(
        imageSrc(src),
      )}" alt="${escapeHtml(alt)}" loading="lazy" draggable="false" />` +
      '<span class="chat-example__image-hint" aria-hidden="true"><m3e-icon name="zoom_in"></m3e-icon></span></button>'
    );
  };
  return md;
}

const markdown = createMarkdownRenderer();
const bubbles = computed(() => chatBubbles(props.log, props.messages));

const imageWidthStyle = computed<Record<string, string> | undefined>(() =>
  props.imageWidth > 0
    ? { "--chat-example-image-width": `${props.imageWidth}px` }
    : undefined,
);

const cardView = computed<ChatCard | null>(() => {
  if (!props.card) {
    return null;
  }
  return {
    ...props.card,
    ...(props.card.image ? { image: imageSrc(props.card.image) } : {}),
  };
});

interface ActionGroup {
  id: number;
  parent: number;
  bubbles: ChatBubble[];
  buttons: ChatButton[];
}

const groups = ref<ActionGroup[]>([]);
const hiddenBaseFrom = ref<number | null>(null);
const pending = ref(false);
const busy = ref(false);
const completed = ref<Set<string>>(new Set());
const pendingLabel = ref("");
const status = ref("");
let actionRun = 0;
let nextGroup = 0;

interface TimelineBubble extends ChatBubble {
  key: string;
  appended: boolean;
  groupId: number;
  actions: readonly ChatButton[];
}

const timeline = computed<TimelineBubble[]>(() => {
  const items: TimelineBubble[] = [];
  const visible = bubbles.value
    .map((bubble, index) => ({ bubble, index }))
    .filter(({ index }) => hiddenBaseFrom.value === null || index < hiddenBaseFrom.value);

  visible.forEach(({ bubble, index }, visibleIndex) => {
    items.push({
      ...bubble,
      key: `base-${index}`,
      appended: false,
      groupId: 0,
      actions:
        bubble.role === "bot" && visibleIndex === visible.length - 1
          ? props.buttons
          : [],
    });
  });

  for (const group of groups.value) {
    group.bubbles.forEach((bubble, index) => {
      items.push({
        ...bubble,
        key: `group-${group.id}-${index}`,
        appended: true,
        groupId: group.id,
        actions: index === group.bubbles.length - 1 ? group.buttons : [],
      });
    });
  }
  return items;
});
const canReset = computed(
  () => groups.value.length > 0 || hiddenBaseFrom.value !== null || pending.value,
);

// 头像由文档引擎按品牌资源包、站点图标依次解析；主题单独使用时退回机器人图标。
const avatar = computed(() => props.botAvatar || akari?.value.chatAvatar || "");

function segments(text: string) {
  return chatSegments(text);
}

function renderMarkdown(text: string): string {
  return markdown.render(text).trim();
}

function isImageOnly(text: string): boolean {
  const parts = segments(text).filter(
    (segment) => !("text" in segment) || segment.text.trim(),
  );
  return parts.length > 0 && parts.every((segment) => "image" in segment);
}

function imageSrc(src: string): string {
  if (isExternalLink(src)) {
    return src;
  }
  // 测试环境只提供 VitePress 的类型桩，缺少运行时导出时按原路径渲染。
  return typeof vitepress.withBase === "function" ? vitepress.withBase(src) : src;
}

function imageSources(bubbles: ChatBubble[]): string[] {
  const sources = new Set<string>();
  for (const bubble of bubbles) {
    for (const segment of chatSegments(bubble.text)) {
      if ("image" in segment) {
        sources.add(segment.image.src);
      }
    }
  }
  return [...sources];
}

async function preloadImages(bubbles: ChatBubble[]): Promise<boolean> {
  const sources = imageSources(bubbles);
  if (!sources.length) {
    return true;
  }
  const outcomes = await Promise.all(
    sources.map(
      (src) =>
        new Promise<boolean>((resolve) => {
          const probe = new Image();
          probe.addEventListener("load", () => resolve(true), { once: true });
          probe.addEventListener("error", () => resolve(false), { once: true });
          probe.src = imageSrc(src);
          if (probe.complete && probe.naturalWidth) {
            resolve(true);
          }
        }),
    ),
  );
  return outcomes.every(Boolean);
}

// 预览层由共享的 AkariImagePreview 负责，这里只保留当前图片与位移动画的起点。
const previewOpen = ref(false);
const previewImage = ref<ChatImage | null>(null);
const previewOrigin = ref<HTMLElement | null>(null);

function openViewer(image: ChatImage, trigger: EventTarget | null): void {
  previewOrigin.value = trigger instanceof HTMLElement ? trigger : null;
  previewImage.value = image;
  previewOpen.value = true;
}

function onImageClick(image: ChatImage, event: Event): void {
  openViewer(image, event.currentTarget);
}

function onBubbleClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const trigger = target.closest<HTMLButtonElement>("[data-chat-image]");
  if (
    !trigger ||
    !(event.currentTarget instanceof HTMLElement) ||
    !event.currentTarget.contains(trigger)
  ) {
    return;
  }
  const src = trigger.dataset.src;
  if (!src) {
    return;
  }
  event.preventDefault();
  const alt = trigger.dataset.alt ?? "";
  const natural = trigger.dataset.natural === "1";
  openViewer({ src, alt, ...(natural ? { natural: true } : {}) }, trigger);
}

function actionKey(groupId: number, index: number): string {
  return `${groupId}:${index}`;
}

function removeGroup(groupId: number): void {
  const removed = new Set<number>([groupId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const group of groups.value) {
      if (!removed.has(group.id) && removed.has(group.parent)) {
        removed.add(group.id);
        changed = true;
      }
    }
  }
  groups.value = groups.value.filter((group) => !removed.has(group.id));
}

function dismissResponse(groupId: number): void {
  if (groupId !== 0) {
    removeGroup(groupId);
    return;
  }
  let lastUser = -1;
  bubbles.value.forEach((bubble, index) => {
    if (bubble.role === "user") {
      lastUser = index;
    }
  });
  hiddenBaseFrom.value = lastUser + 1;
  groups.value = [];
}

async function runAction(
  button: ChatButton,
  groupId: number,
  index: number,
): Promise<void> {
  const key = actionKey(groupId, index);
  if (busy.value || completed.value.has(key)) {
    return;
  }
  if (button.dismiss) {
    dismissResponse(groupId);
    completed.value = new Set(completed.value).add(key);
    status.value = t("chatExampleDeleted");
    return;
  }
  const token = ++actionRun;
  const started = Date.now();
  if (props.oneShot) {
    const group = groupId === 0 ? null : groups.value.find((item) => item.id === groupId);
    const siblings = groupId === 0 ? props.buttons : (group?.buttons ?? []);
    const next = new Set(completed.value);
    siblings.forEach((_, sibling) => next.add(actionKey(groupId, sibling)));
    completed.value = next;
  }
  busy.value = true;
  pending.value = true;
  pendingLabel.value = button.loading || t("chatExampleLoading");
  status.value = pendingLabel.value;

  let next = chatButtonBubbles(button);
  const loaded = await preloadImages(next);
  const hold = Math.max(0, 360 - (Date.now() - started));
  if (hold) {
    await new Promise((resolve) => setTimeout(resolve, hold));
  }
  if (token !== actionRun) {
    return;
  }
  if (!loaded) {
    next = [...next, { role: "bot", text: t("chatExampleImageError") }];
  }
  groups.value = [
    ...groups.value,
    {
      id: ++nextGroup,
      parent: groupId,
      bubbles: next,
      buttons: [...(button.buttons ?? [])],
    },
  ];
  completed.value = new Set(completed.value).add(key);
  pending.value = false;
  busy.value = false;
  status.value = t("chatExampleResultsLoaded");
}

function resetExample(): void {
  actionRun += 1;
  groups.value = [];
  hiddenBaseFrom.value = null;
  completed.value = new Set();
  pending.value = false;
  busy.value = false;
  status.value = t("chatExampleResetDone");
}
</script>

<template>
  <section
    v-if="bubbles.length || cardView"
    class="chat-example"
    :class="{ 'chat-example--fixed-image-width': props.imageWidth > 0 }"
    :style="imageWidthStyle"
    :aria-label="t('chatExample')"
    :aria-busy="pending"
  >
    <div v-if="props.caption || buttons.length" class="chat-example__header">
      <p v-if="props.caption" class="chat-example__caption">{{ props.caption }}</p>
      <button
        v-if="buttons.length"
        type="button"
        class="chat-example__reset"
        :disabled="!canReset"
        :aria-label="t('chatExampleReset')"
        :title="t('chatExampleReset')"
        @click="resetExample"
      >
        <m3e-icon name="restart_alt"></m3e-icon>
      </button>
    </div>
    <p class="chat-example__status" role="status" aria-live="polite">{{ status }}</p>

    <template v-for="bubble in timeline" :key="bubble.key">
      <div
        v-if="bubble.role === 'divider'"
        class="chat-example__divider"
        :class="{ 'chat-example__divider--appended': bubble.appended }"
        role="separator"
        :aria-label="t('chatExampleDivider')"
      >
        <span class="chat-example__divider-rule"></span>
        <span class="chat-example__divider-wave" aria-hidden="true">〰〰〰</span>
        <span class="chat-example__divider-rule"></span>
      </div>
      <div
        v-else
        class="chat-example__row"
        :class="[
          `chat-example__row--${bubble.role}`,
          { 'chat-example__row--appended': bubble.appended },
        ]"
      >
        <span
          v-if="bubble.role === 'bot'"
          class="chat-example__avatar chat-example__avatar--bot"
          aria-hidden="true"
        >
          <img v-if="avatar" :src="avatar" alt="" loading="lazy" />
          <m3e-icon v-else name="smart_toy"></m3e-icon>
        </span>
        <div
          class="chat-example__bubble"
          :class="{ 'chat-example__bubble--image': isImageOnly(bubble.text) }"
          @click="onBubbleClick"
        >
          <div
            v-if="bubble.markdown"
            class="chat-example__markdown"
            v-html="renderMarkdown(bubble.text)"
          ></div>
          <template v-else>
            <template v-for="(segment, segmentIndex) in segments(bubble.text)" :key="segmentIndex">
              <code v-if="'code' in segment">{{ segment.code }}</code>
              <button
                v-else-if="'image' in segment"
                type="button"
                class="chat-example__image"
                :class="{ 'chat-example__image--natural': segment.image.natural }"
                :aria-label="
                  segment.image.alt
                    ? t('chatExampleViewImage', { alt: segment.image.alt })
                    : t('chatExampleViewImageNoAlt')
                "
                :title="t('chatExampleViewLarge')"
                @click="onImageClick(segment.image, $event)"
              >
                <img
                  :src="imageSrc(segment.image.src)"
                  :alt="segment.image.alt"
                  loading="lazy"
                  draggable="false"
                />
                <span class="chat-example__image-hint" aria-hidden="true">
                  <m3e-icon name="zoom_in"></m3e-icon>
                </span>
              </button>
              <template v-else>{{ segment.text }}</template>
            </template>
          </template>
        </div>
        <span
          v-if="bubble.role === 'user'"
          class="chat-example__avatar chat-example__avatar--user"
          aria-hidden="true"
        >
          <m3e-icon name="person"></m3e-icon>
        </span>
      </div>
      <div
        v-if="bubble.actions.length"
        class="chat-example__buttons"
        role="group"
        :aria-label="t('chatExampleActions')"
      >
        <button
          v-for="(button, buttonIndex) in bubble.actions"
          :key="buttonIndex"
          type="button"
          class="chat-example__button"
          :class="{ 'chat-example__button--dismiss': button.dismiss }"
          :disabled="busy || completed.has(actionKey(bubble.groupId, buttonIndex))"
          :aria-label="
            button.dismiss
              ? t('chatExampleDismiss')
              : button.label || t('chatExampleButton')
          "
          @click="runAction(button, bubble.groupId, buttonIndex)"
        >
          {{ button.label || t("chatExampleButton") }}
        </button>
      </div>
    </template>

    <div
      v-if="cardView"
      class="chat-example__row chat-example__row--bot chat-example__row--card"
    >
      <span class="chat-example__avatar chat-example__avatar--bot" aria-hidden="true">
        <img v-if="avatar" :src="avatar" alt="" loading="lazy" />
        <m3e-icon v-else name="smart_toy"></m3e-icon>
      </span>
      <WikiCard v-bind="cardView" />
    </div>

    <div
      v-if="pending"
      class="chat-example__row chat-example__row--bot chat-example__loading"
      aria-hidden="true"
    >
      <span class="chat-example__avatar chat-example__avatar--bot">
        <img v-if="avatar" :src="avatar" alt="" loading="lazy" />
        <m3e-icon v-else name="smart_toy"></m3e-icon>
      </span>
      <div class="chat-example__bubble chat-example__bubble--loading">
        <span>{{ pendingLabel }}</span>
        <span class="chat-example__loading-dots">
          <span></span><span></span><span></span>
        </span>
      </div>
    </div>

    <AkariImagePreview
      v-model:open="previewOpen"
      :src="previewImage ? imageSrc(previewImage.src) : ''"
      :alt="previewImage?.alt ?? ''"
      :origin="previewOrigin"
    />
  </section>
</template>
