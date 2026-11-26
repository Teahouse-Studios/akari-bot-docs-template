import { onBeforeUnmount, onMounted, type Ref } from "vue";
import { useData } from "vitepress";
import imageColors from "virtual:akari-image-colors";

import { lookupImageMeta } from "../heroColorCache";

const FRAME_CLASS = "akari-lazy-media";
const OVERLAY_CLASS = "akari-lazy-media__overlay";

/**
 * Frames an article image with the loading indicator that covers it until
 * it arrives, and asks the browser to load it only near the viewport. An
 * image inside a button is left alone: it belongs to a component that draws
 * its own thumbnail (ImagePreview), not to the article's text.
 */
function frameImage(
  image: HTMLImageElement,
  filePath: string | undefined,
  base: string,
): void {
  if (image.closest(`.${FRAME_CLASS}`)) return;
  if (image.closest("button, .akari-image-preview")) return;
  // Chat examples size their own pictures: the avatar sits in a 34px circle,
  // where a frame would take its place and shift the image out of centre.
  if (image.closest(".chat-example")) return;
  // The home page lays its own pictures out: a frame would take the place
  // of a flex item and pull the brand logo out of centre.
  if (image.closest(".akari-home")) return;

  if (!image.hasAttribute("loading")) image.setAttribute("loading", "lazy");
  if (!image.hasAttribute("decoding")) image.setAttribute("decoding", "async");

  const source =
    image.getAttribute("data-akari-image-src") ?? image.getAttribute("src");
  const meta = source && !source.startsWith("data:")
    ? lookupImageMeta(imageColors, source, filePath, base)
    : null;

  // The map knows the picture's shape before it arrives: keep its room and
  // let the overlay take exactly that shape. Width and height attributes
  // also survive CSS that only constrains the inline size.
  if (meta?.width && meta.height) {
    const width = Number(image.getAttribute("width"));
    const height = Number(image.getAttribute("height"));
    if (width > 0 && !(height > 0)) {
      image.height = Math.round((width * meta.height) / meta.width);
    } else if (height > 0 && !(width > 0)) {
      image.width = Math.round((height * meta.width) / meta.height);
    } else if (!(width > 0) && !(height > 0)) {
      image.width = meta.width;
      image.height = meta.height;
    }
  }

  // A <picture>'s sources must stay beside its <img>: frame the pair, not
  // the image alone, or the browser would ignore the sources.
  const target =
    image.parentElement?.tagName === "PICTURE" ? image.parentElement : image;
  if (target.closest(`.${FRAME_CLASS}`)) return;

  const frame = document.createElement("span");
  frame.className = FRAME_CLASS;
  frame.dataset.state = image.complete ? "loaded" : "loading";
  if (meta?.color) frame.style.setProperty("--akari-media-color", meta.color);

  target.replaceWith(frame);
  frame.append(target);

  if (!image.complete) {
    const overlay = document.createElement("span");
    overlay.className = OVERLAY_CLASS;
    overlay.setAttribute("aria-hidden", "true");
    overlay.append(document.createElement("m3e-loading-indicator"));
    frame.append(overlay);

    const settle = (): void => {
      frame.dataset.state = "loaded";
    };

    image.addEventListener("load", settle, { once: true });
    image.addEventListener("error", settle, { once: true });
    // A cached picture can finish while it is being inserted, before the
    // listeners exist; its `complete` flag is the only notice left.
    if (image.complete) settle();
  }
}

/** Wraps every image the article renders, including images written as HTML. */
export function enhanceLazyMedia(
  root: ParentNode,
  filePath?: string,
  base = "/",
): void {
  for (const image of root.querySelectorAll<HTMLImageElement>(".akari-prose img")) {
    frameImage(image, filePath, base);
  }
}

/**
 * Keeps article images covered by the loading indicator while they load,
 * across page changes and content updates.
 */
export function useLazyMedia(root: Ref<HTMLElement | null>): void {
  const { page, site } = useData();
  let observer: MutationObserver | undefined;
  let frame = 0;

  const run = (): void => {
    if (root.value) {
      enhanceLazyMedia(root.value, page.value.filePath, site.value.base);
    }
  };

  const schedule = (): void => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      run();
    });
  };

  onMounted(() => {
    run();
    observer = new MutationObserver(schedule);
    if (root.value) {
      observer.observe(root.value, { childList: true, subtree: true });
    }
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    if (frame) cancelAnimationFrame(frame);
  });
}
