/**
 * 命令对话示例的文本构造。
 *
 * 页面用简短的往返消息展示命令效果；每条以「用户：」或「机器人：」开头，
 * 续行不带前缀，归入上一条气泡。
 */

export type ChatRole = "user" | "bot" | "divider";

export interface ChatBubble {
  role: ChatRole;
  text: string;
}

export interface ChatImage {
  src: string;
  alt: string;
  /** 按原始尺寸展示，不缩到 320×200 的缩略框内。 */
  natural?: boolean;
}

export type ChatSegment =
  | { text: string }
  | { code: string }
  | { image: ChatImage };

export interface ChatMessage {
  role: string;
  text: string;
}

/** 消息下方附带的按钮；点击后把 `reply` 或 `messages` 追加到对话末尾。 */
export interface ChatButton {
  label: string;
  reply?: string | readonly string[];
  messages?: readonly ChatMessage[];
  loading?: string;
  /** 追加回复后，在回复末尾显示的操作按钮。 */
  buttons?: readonly ChatButton[];
  /** 点击后删除这条按钮所属的回复及其后续内容。 */
  dismiss?: boolean;
}

const USER_PREFIX = /^(?:用户|user)\s*[：:]\s*/i;
const BOT_PREFIX = /^(?:机器人|bot)\s*[：:]\s*/i;
const DIVIDER = /^[〰~～\s\uFE0F]+$/u;

function isDivider(line: string): boolean {
  const text = line.trim();
  return DIVIDER.test(text) && text.replace(/[\s\uFE0F]/gu, "").length >= 3;
}

function roleOf(line: string): { role: ChatRole; text: string } | null {
  const user = USER_PREFIX.exec(line);
  if (user) {
    return { role: "user", text: line.slice(user[0].length) };
  }
  const bot = BOT_PREFIX.exec(line);
  if (bot) {
    return { role: "bot", text: line.slice(bot[0].length) };
  }
  return null;
}

/**
 * 把简写日志折成气泡。不带前缀的行续接上一条，多行回复不必重复前缀。
 */
export function chatBubbles(
  log: readonly string[] = [],
  messages: readonly ChatMessage[] = [],
): ChatBubble[] {
  if (messages.length) {
    return splitTrailingImages(
      messages
        .filter((message) => message.text.trim())
        .map((message) => ({
          role:
            message.role === "divider"
              ? ("divider" as const)
              : message.role === "user"
                ? ("user" as const)
                : ("bot" as const),
          text: message.text,
        })),
    );
  }

  const bubbles: ChatBubble[] = [];
  for (const raw of log) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      continue;
    }
    if (isDivider(line)) {
      bubbles.push({ role: "divider", text: "" });
      continue;
    }
    const parsed = roleOf(line);
    if (parsed) {
      bubbles.push(parsed);
    } else if (bubbles.length && bubbles[bubbles.length - 1].role !== "divider") {
      bubbles[bubbles.length - 1].text += `\n${line}`;
    } else {
      bubbles.push({ role: "bot", text: line.trimStart() });
    }
  }
  return splitTrailingImages(bubbles);
}

/** 把按钮的回复折成气泡，写法与 `log` 相同。 */
export function chatButtonBubbles(button: ChatButton): ChatBubble[] {
  const reply = typeof button.reply === "string" ? [button.reply] : (button.reply ?? []);
  return chatBubbles(reply, button.messages ?? []);
}

/**
 * 按行内代码与图片切分一条消息，其余内容原样保留。
 *
 * 图片使用 Markdown 的 `![说明](地址)` 写法，缩略图插在消息中的对应位置。
 */
export function chatSegments(text: string): ChatSegment[] {
  const segments: ChatSegment[] = [];
  let index = 0;
  while (index < text.length) {
    const codeStart = text.indexOf("`", index);
    const imageStart = text.indexOf("![", index);
    const next = [codeStart, imageStart].filter((position) => position >= 0).sort((a, b) => a - b)[0];

    if (next === undefined) {
      pushText(segments, text.slice(index));
      break;
    }
    if (next > index) {
      pushText(segments, text.slice(index, next));
    }

    if (next === imageStart) {
      const image = parseImage(text, next);
      if (image) {
        segments.push({ image: image.image });
        index = image.end;
        continue;
      }
      pushText(segments, text[next]);
      index = next + 1;
      continue;
    }

    const codeEnd = text.indexOf("`", next + 1);
    if (codeEnd < 0) {
      pushText(segments, text.slice(next));
      break;
    }
    const code = text.slice(next + 1, codeEnd);
    if (code) {
      segments.push({ code });
    }
    index = codeEnd + 1;
  }
  return mergeText(segments);
}

function segmentSource(segment: ChatSegment): string {
  if ("text" in segment) {
    return segment.text;
  }
  if ("code" in segment) {
    return `\`${segment.code}\``;
  }
  const marker = segment.image.natural ? "{natural}" : "";
  return `![${segment.image.alt}](${segment.image.src})${marker}`;
}

/**
 * 尾部图片单独成气泡；多张尾部图片合并到同一个气泡。
 *
 * 正文与图片混排时，正文保留原气泡，图片按出现顺序移到后面的气泡。
 */
function splitTrailingImages(bubbles: ChatBubble[]): ChatBubble[] {
  const split: ChatBubble[] = [];
  for (const bubble of bubbles) {
    if (bubble.role === "divider") {
      split.push(bubble);
      continue;
    }
    const segments = chatSegments(bubble.text);
    let end = segments.length;
    const images: ChatImage[] = [];
    while (end > 0) {
      const segment = segments[end - 1];
      if ("image" in segment) {
        images.unshift(segment.image);
        end -= 1;
        continue;
      }
      if ("text" in segment && !segment.text.trim() && images.length) {
        end -= 1;
        continue;
      }
      break;
    }
    if (!images.length || end === 0) {
      split.push(bubble);
      continue;
    }
    const text = segments.slice(0, end).map(segmentSource).join("").trimEnd();
    if (!text) {
      split.push(bubble);
      continue;
    }
    split.push(
      { role: bubble.role, text },
      {
        role: bubble.role,
        text: images
          .map((image) => `![${image.alt}](${image.src})${image.natural ? "{natural}" : ""}`)
          .join("\n"),
      },
    );
  }
  return split;
}

function mergeText(segments: ChatSegment[]): ChatSegment[] {
  const merged: ChatSegment[] = [];
  for (const segment of segments) {
    const previous = merged[merged.length - 1];
    if ("text" in segment && previous && "text" in previous) {
      previous.text += segment.text;
    } else {
      merged.push(segment);
    }
  }
  return merged;
}

function pushText(segments: ChatSegment[], text: string): void {
  if (text) {
    segments.push({ text });
  }
}

function parseImage(
  text: string,
  start: number,
): { image: ChatImage; end: number } | null {
  const closeAlt = text.indexOf("](", start + 2);
  if (closeAlt < 0) {
    return null;
  }
  const closeSrc = text.indexOf(")", closeAlt + 2);
  if (closeSrc < 0) {
    return null;
  }
  const src = text.slice(closeAlt + 2, closeSrc).trim();
  if (!src || /\s/.test(src)) {
    return null;
  }
  let end = closeSrc + 1;
  let natural = false;
  if (text.startsWith("{natural}", end)) {
    natural = true;
    end += "{natural}".length;
  }
  return {
    image: {
      src,
      alt: text.slice(start + 2, closeAlt).trim(),
      ...(natural ? { natural: true } : {}),
    },
    end,
  };
}
