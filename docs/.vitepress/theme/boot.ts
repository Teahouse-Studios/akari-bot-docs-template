/**
 * The boot screen: a static skeleton of the document shell, injected next to
 * `#app` when the site is built.
 *
 * It exists because everything inside `#app` stays hidden until the m3e
 * components register (`base.css`), and that wait is the whole first screen.
 * Being outside the app, the skeleton needs no JavaScript, no m3e component
 * and no hydration match: the stylesheet paints it on its own, and it leaves
 * in the same frame the app becomes ready.
 *
 * `m3e-skeleton` is deliberately not used here. Importing it would put Lit and
 * the m3e core into the initial chunk (+37 KB gzip) and it could not paint
 * before that chunk ran, which is the wait it would be covering.
 */

import {
  akariBootColorCss,
  akariBootPalette,
  type AkariBootColorOptions,
} from "./bootColors";
import { resolveHero } from "./hero";
import { heroColorKey } from "./heroColorCache";

/**
 * How long the boot screen tolerates *no progress* before offering a reload,
 * in ms. Progress is a stylesheet or module finishing — a slow page that keeps
 * receiving chunks is never treated as stalled.
 */
export const AKARI_BOOT_IDLE_TIMEOUT = 20_000;

/**
 * Hard ceiling for a first paint that never lands, in ms, even if resources
 * keep dribbling in. A page that is still moving after this long is stuck in
 * something the reader cannot wait out.
 */
export const AKARI_BOOT_MAX_TIMEOUT = 60_000;

const RETRY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-8 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35Z"/></svg>`;

/**
 * Follows the shell's proportions: 64px bar, 96px rail, document column.
 * Everything is decorative; the retry button is the only control.
 */
export const AKARI_BOOT_MARKUP = `
    <div id="akari-boot">
      <div class="akari-boot__bar" aria-hidden="true">
        <span class="akari-boot__mark"></span>
        <span class="akari-boot__brand"></span>
        <span class="akari-boot__spacer"></span>
        <span class="akari-boot__pill"></span>
        <span class="akari-boot__pill"></span>
      </div>
      <div class="akari-boot__frame" aria-hidden="true">
        <div class="akari-boot__rail">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="akari-boot__doc">
          <span class="akari-boot__title"></span>
          <span class="akari-boot__line"></span>
          <span class="akari-boot__line"></span>
          <span class="akari-boot__line akari-boot__line--short"></span>
          <div class="akari-boot__cards">
            <span></span><span></span><span></span><span></span>
          </div>
          <span class="akari-boot__line"></span>
          <span class="akari-boot__line"></span>
          <span class="akari-boot__line akari-boot__line--short"></span>
        </div>
      </div>
      <button type="button" id="akari-boot-retry" aria-label="Reload page">${RETRY_ICON}</button>
      <noscript><p class="akari-boot__noscript"></p></noscript>
    </div>`;

/**
 * The palette a hero page paints its skeleton with. The stylesheet carries
 * the site's palette, but a hero page takes its theme color from the image
 * the build sampled for it, so that page needs its own values: they are
 * written inline, ahead of the skeleton, and win over the stylesheet by
 * coming later in the document.
 *
 * `light` and `dark` seeds are resolved separately, the way the theme's
 * `resolveHeroColor` does it: a page can name a light and a dark hero image.
 */
export function akariBootPageStyle(
  frontmatter: Record<string, unknown>,
  filePath: string,
  heroes: Readonly<Record<string, string | null | undefined>>,
  options: AkariBootColorOptions = {},
): string {
  const hero = resolveHero(frontmatter, "en");
  if (!hero || hero.color === false) return "";

  const sampled = (src: string): string | null =>
    heroes[heroColorKey(src, filePath)] ?? null;
  const light = hero.color === "auto" ? sampled(hero.src) : hero.color;
  const dark = hero.color === "auto" ? sampled(hero.darkSrc ?? hero.src) : hero.color;
  // Neither scheme has a color of its own: the stylesheet's palette is right.
  if (light === null && dark === null) return "";

  const css = akariBootColorCss(
    akariBootPalette({ ...options, seed: light ?? undefined, darkSeed: dark }),
  );
  return `<style>${css}</style>`;
}

/**
 * `transformHtml` hook: put the boot screen at the end of the body, with the
 * control script right behind it. It stays outside `#app`, so Vue never
 * hydrates around it.
 *
 * The script is a file of its own, not an inline head tag: the skeleton is
 * pure HTML and CSS, so nothing about showing it waits for the script, and a
 * separate file is cacheable across pages and does not hold up the parse. It
 * is deferred, so it runs before `DOMContentLoaded` and can still catch a
 * chunk that fails afterwards; an asset that fails earlier than that is
 * caught by the idle timer instead.
 */
export function injectAkariBoot(
  html: string,
  controlHref: string,
  palette = "",
): string {
  const block = `${palette}${AKARI_BOOT_MARKUP}<script defer src="${controlHref}"></script>`;
  // The skeleton goes last in the body rather than ahead of `#app`: pages
  // that teleport to the body (the hero wall) put their anchors outside the
  // app container, and hydration drops every sibling before them.
  if (html.includes("</body>")) return html.replace(/<\/body>/, `${block}</body>`);
  return `${html}${block}`;
}

/**
 * The boot's control script: watch the boot, not the clock. It is written to
 * `assets/` at build time and loaded with `defer` (see `injectAkariBoot`).
 *
 * Time alone says little about a page that is still downloading: a slow link
 * can legitimately spend half a minute on the first screen. So the timer is
 * reset by evidence of progress (a resource finished, DOM ready, the document
 * became visible again) and only fires when nothing has completed for `idle`
 * ms — with `cap` ms from navigation as the outer bound. Two failures skip the
 * wait entirely: a stylesheet or module that failed to load, and the network
 * dropping. A hidden tab is never judged, because its timers are throttled;
 * the clock restarts when the reader comes back.
 *
 * Every arm is recoverable: if the app still becomes ready afterwards, CSS
 * fades the whole layer out, button included. An idle arm is also undone by
 * new progress — silence was the only evidence for it, so a chunk finishing
 * after all takes the button away again.
 *
 * Timing is read from `performance.now()`, whose zero is navigation start, so
 * running late (after a deferred fetch) does not buy the page extra time.
 */
export const AKARI_BOOT_CONTROL_SCRIPT = `(function(){var IDLE=${AKARI_BOOT_IDLE_TIMEOUT},CAP=${AKARI_BOOT_MAX_TIMEOUT},root=document.documentElement,start=0,last=0,timer=0,armed=false,reason="",bound=false;
function now(){return performance.now()}
function ready(){return root.hasAttribute("data-akari-ready")}
function bind(){if(bound)return;var b=document.getElementById("akari-boot-retry");if(!b)return;bound=true;b.addEventListener("click",function(){location.reload()})}
function arm(why){if(armed||ready())return;armed=true;reason=why;root.setAttribute("data-akari-boot-stalled","");bind()}
function disarm(){if(!armed)return;armed=false;reason="";root.removeAttribute("data-akari-boot-stalled")}
function stop(){if(timer){clearTimeout(timer);timer=0}}
function schedule(){stop();if(ready())return;var t=now(),wait=Math.min(IDLE-(t-last),CAP-(t-start));if(wait<=0)return check();timer=setTimeout(check,wait+40)}
function check(){timer=0;if(ready())return;if(document.visibilityState!=="visible")return;var t=now();if(t-start>=CAP)return arm("cap");if(t-last>=IDLE)return arm("idle");schedule()}
function progress(){last=now();if(armed){if(reason==="idle")disarm();else{bind();return}}schedule()}
if(window.PerformanceObserver){try{new PerformanceObserver(function(l){if(l.getEntries().length)progress()}).observe({type:"resource",buffered:true})}catch(e){}}
document.addEventListener("error",function(e){var t=e.target;if(!t||t===window)return;var tag=t.tagName;if(tag!=="SCRIPT"&&tag!=="LINK")return;var u=t.src||t.href||"";if(u.indexOf("/assets/")!==-1)arm("error")},true);
window.addEventListener("offline",function(){arm("offline")});
window.addEventListener("online",function(){if(reason==="offline")disarm();progress()});
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")progress()});
document.addEventListener("DOMContentLoaded",progress);
window.addEventListener("load",progress);
schedule();})();`;
