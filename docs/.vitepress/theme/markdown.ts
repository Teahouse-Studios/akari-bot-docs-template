import { markdownItImageSize } from "markdown-it-image-size";
import type { MarkdownRenderer } from "vitepress";

/** The options of markdown-it-image-size, such as `cache` and `cacheDir`. */
export type AkariImageSizeOptions = NonNullable<
  Parameters<typeof markdownItImageSize>[1]
>;

export interface AkariMarkdownOptions {
  /**
   * Whether to give remote images their width and height, downloading each
   * one when a page renders; or the options to do it with. Defaults to true.
   */
  remoteImageSize?: boolean | AkariImageSizeOptions;
}

/**
 * The theme's Markdown setup; pass it to `markdown.config` in the site
 * config. It frames tables and gives remote images their size.
 */
export function akariMarkdown(
  md: MarkdownRenderer,
  options: AkariMarkdownOptions = {},
): void {
  frameTables(md);
  const { remoteImageSize = true } = options;
  if (remoteImageSize !== false) {
    sizeRemoteImages(md, remoteImageSize === true ? {} : remoteImageSize);
  }
  lazyImages(md);
}

/**
 * Wraps every table in a `.akari-table` frame: the frame draws the table's
 * rounded outline and scrolls sideways when the table is wider than the
 * column, so the table itself can keep the full column width.
 */
function frameTables(md: MarkdownRenderer): void {
  const open = md.renderer.rules.table_open;
  const close = md.renderer.rules.table_close;

  md.renderer.rules.table_open = (tokens, index, options, env, self) =>
    `<div class="akari-table">${
      open
        ? open(tokens, index, options, env, self)
        : self.renderToken(tokens, index, options)
    }`;

  md.renderer.rules.table_close = (tokens, index, options, env, self) =>
    `${
      close
        ? close(tokens, index, options, env, self)
        : self.renderToken(tokens, index, options)
    }</div>`;
}

const REMOTE = /^(?:https?:)?\/\//i;

/**
 * VitePress writes the width and height of local images (in the public
 * folder or beside the page) into their tags, so the page keeps their room
 * before they load. markdown-it-image-size does the same for remote images:
 * it downloads each one once and caches its size for a week, keyed by its
 * address, in `node_modules/markdown-it-image-size/.cache` unless `options`
 * say otherwise.
 */
function sizeRemoteImages(
  md: MarkdownRenderer,
  options: AkariImageSizeOptions,
): void {
  const local = md.renderer.rules.image;
  md.use(markdownItImageSize, options);
  const remote = md.renderer.rules.image!;

  md.renderer.rules.image = (tokens, index, options, env, self) => {
    const rule = REMOTE.test(tokens[index]?.attrGet("src") ?? "")
      ? remote
      : local;
    return rule
      ? rule(tokens, index, options, env, self)
      : self.renderToken(tokens, index, options);
  };
}

/**
 * Makes every image wait until it is near the viewport, and lets the browser
 * decode it off the main thread. Applies to Markdown images and to `<img>`
 * tags written straight into the page. The theme adds the loading indicator
 * that covers them until they arrive (see useLazyMedia); an explicit
 * `loading` or `decoding` attribute is left alone.
 */
function lazyImages(md: MarkdownRenderer): void {
  const render = md.renderer.rules.image;

  md.renderer.rules.image = (tokens, index, options, env, self) => {
    const token = tokens[index];
    if (token) {
      if (token.attrGet("loading") === null) token.attrSet("loading", "lazy");
      if (token.attrGet("decoding") === null) token.attrSet("decoding", "async");
      // Keep the source the author wrote: the bundler may rewrite `src` to a
      // hashed asset URL, while the build's color map is keyed by this path.
      const src = token.attrGet("src");
      if (src && token.attrGet("data-akari-image-src") === null) {
        token.attrSet("data-akari-image-src", src);
      }
    }
    return render
      ? render(tokens, index, options, env, self)
      : self.renderToken(tokens, index, options);
  };

  // An `<img>` written as HTML is not an image token; edit the raw tag.
  // Scripts, styles and comments may contain the text `<img>` without
  // rendering one, so they are left untouched.
  md.core.ruler.push("akari_lazy_html_images", (state) => {
    const visit = (tokens: typeof state.tokens): void => {
      for (const token of tokens) {
        if (token.type === "html_block" || token.type === "html_inline") {
          if (!RAW_SKIP.test(token.content)) {
            token.content = token.content.replace(IMG_TAG, (tag) =>
              withLazyAttributes(tag),
            );
          }
        }
        if (token.children) visit(token.children);
      }
    };
    visit(state.tokens);
  });
}

const RAW_SKIP = /^\s*<(?:script|style|!--)/i;

const IMG_TAG = /<img\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi;

function withLazyAttributes(tag: string): string {
  const attributes: string[] = [];
  if (!/\sloading\s*=/i.test(tag)) attributes.push('loading="lazy"');
  if (!/\sdecoding\s*=/i.test(tag)) attributes.push('decoding="async"');

  if (!/\sdata-akari-image-src\s*=/i.test(tag)) {
    const src = /\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(tag);
    const value = src?.[1] ?? src?.[2];
    if (value) {
      attributes.push(`data-akari-image-src="${escapeAttribute(value)}"`);
    }
  }

  if (!attributes.length) return tag;

  const selfClosing = tag.endsWith("/>");
  const body = tag.slice(0, selfClosing ? -2 : -1).trimEnd();
  return `${body} ${attributes.join(" ")}${selfClosing ? " />" : ">"}`;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
