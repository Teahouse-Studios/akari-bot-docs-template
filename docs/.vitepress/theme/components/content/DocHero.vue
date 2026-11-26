<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { onContentUpdated, useData, withBase } from "vitepress";
import imageColors from "virtual:akari-image-colors";

import { FLUID_HERO_TEXTURES, randomFluidHeroTexture, type FluidHeroTexture } from "../../fluid";
import { useAkariColorScheme } from "../../composables/useColorScheme";
import { useHero } from "../../composables/useHero";
import { usePagePattern } from "../../composables/usePattern";
import { heroImageHref } from "../../hero";
import { lookupImageMeta } from "../../heroColorCache";
import AkariFluidWall from "./AkariFluidWall.vue";

const { page, site } = useData();
const hero = useHero();
const { resolved: scheme } = useAkariColorScheme();
const pattern = usePagePattern();
const fluid = ref<InstanceType<typeof AkariFluidWall> | null>(null);

function forwardFluidPointer(event: PointerEvent): void {
  const target = event.target as Element | null;
  if (target?.closest(".akari-doc-hero__fluid")) return;
  const host = fluid.value?.$el;
  if (!(host instanceof HTMLElement)) return;
  host.dispatchEvent(
    new PointerEvent(event.type, {
      clientX: event.clientX,
      clientY: event.clientY,
      pointerType: event.pointerType,
      bubbles: false,
    }),
  );
}

const src = computed(() =>
  hero.value ? heroImageHref(hero.value.src, withBase) : "",
);
const darkSrc = computed(() =>
  hero.value?.darkSrc ? heroImageHref(hero.value.darkSrc, withBase) : "",
);

// The image the current scheme shows is the one the loading indicator waits
// for; the other one is hidden and, being lazy, is not fetched at all.
const mounted = ref(false);
const lightImage = ref<HTMLImageElement | null>(null);
const darkImage = ref<HTMLImageElement | null>(null);
const lightLoaded = ref(false);
const darkLoaded = ref(false);
const hasDark = computed(() => !!darkSrc.value);
const loaded = computed(() =>
  scheme.value === "dark" && hasDark.value
    ? darkLoaded.value
    : lightLoaded.value,
);

// The scrim takes the color of the image the current scheme shows, so the
// wait looks like the picture that is arriving rather than a generic card.
const overlayStyle = computed(() => {
  const shown =
    scheme.value === "dark" && hero.value?.darkSrc
      ? hero.value.darkSrc
      : hero.value?.src;
  if (!shown) return undefined;
  const meta = lookupImageMeta(
    imageColors,
    shown,
    page.value.filePath,
    site.value.base,
  );
  return meta?.color ? { "--akari-media-color": meta.color } : undefined;
});

function markLightLoaded(): void {
  lightLoaded.value = true;
}

function markDarkLoaded(): void {
  darkLoaded.value = true;
}

// A cached image can finish before Vue has attached the load listener, so
// look at `complete` once the element is in the page.
function checkComplete(): void {
  if (lightImage.value?.complete) lightLoaded.value = true;
  if (darkImage.value?.complete) darkLoaded.value = true;
}

// The indicator is a client-side enhancement: without JavaScript the image
// simply shows, instead of sitting under a spinner that never goes away.
onMounted(() => {
  mounted.value = true;
  checkComplete();
});

watch([src, darkSrc], async () => {
  lightLoaded.value = false;
  darkLoaded.value = false;
  await nextTick();
  checkComplete();
});

// The server and the hydrating client settle on this per-page pick, so no
// texture swap takes place while the page comes up.
function pageSeed(path: string): number {
  let value = 2166136261;
  for (let index = 0; index < path.length; index += 1) {
    value = Math.imul(value ^ path.charCodeAt(index), 16777619);
  }
  return value >>> 0;
}

const fallbackTexture = computed<FluidHeroTexture>(() => {
  const path = page.value.relativePath || page.value.filePath || page.value.title;
  return FLUID_HERO_TEXTURES[pageSeed(path) % FLUID_HERO_TEXTURES.length]!;
});

// Drawn in the browser only, like the page pattern: each view of a hero gets
// one of the still textures, and reloading the page draws a new one.
const drawnTexture = ref<FluidHeroTexture | null>(null);
const fluidTexture = computed<FluidHeroTexture>(
  () => drawnTexture.value ?? fallbackTexture.value,
);

function drawTexture(): void {
  drawnTexture.value = randomFluidHeroTexture();
}

onMounted(drawTexture);
onContentUpdated(drawTexture);
</script>

<template>
  <!--
    Header of a page with a hero image: the title, its date and tagline on
    one card, the image on the other. It carries the page's h1, so the
    layout hides the h1 of the Markdown content. `data-akari-page-title` marks
    the title the app bar takes over once it scrolls away.
  -->
  <header v-if="hero" class="akari-doc-hero">
    <div
      class="akari-doc-hero__text"
      @pointermove="forwardFluidPointer"
      @pointerdown="forwardFluidPointer"
    >
      <AkariFluidWall
        ref="fluid"
        class="akari-doc-hero__fluid"
        height="100%"
        :texture="fluidTexture"
        :texture-opacity="0.35"
        :grid="0"
        :data-texture="fluidTexture"
        aria-hidden="true"
      />
      <!-- A soft light under the pointer, below the text. -->
      <span class="akari-doc-hero__light" aria-hidden="true">
        <span class="akari-doc-hero__glow"></span>
      </span>
      <time
        v-if="hero.date?.datetime"
        class="akari-doc-hero__date"
        :datetime="hero.date.datetime"
      >{{ hero.date.text }}</time>
      <p v-else-if="hero.date" class="akari-doc-hero__date">
        {{ hero.date.text }}
      </p>
      <h1 class="akari-doc-hero__title" data-akari-page-title>{{ page.title }}</h1>
      <p v-if="hero.tagline" class="akari-doc-hero__tagline">
        {{ hero.tagline }}
      </p>
    </div>
    <div
      class="akari-doc-hero__media"
      :data-fit="hero.fit"
      :data-state="loaded ? 'loaded' : 'loading'"
      :style="hero.background ? { '--_background': hero.background } : undefined"
    >
      <!-- The image card keeps the page pattern and its pointer focus. -->
      <template v-if="pattern">
        <span class="akari-doc-hero__pattern" aria-hidden="true"></span>
        <span class="akari-doc-hero__light" aria-hidden="true">
          <span class="akari-doc-hero__glow"></span>
          <span class="akari-doc-hero__focus"></span>
        </span>
      </template>
      <!--
        With a dark-scheme image, each image shows in its own scheme. Both
        load lazily: an image that is not displayed is then never fetched,
        and the one on screen still loads at once.
      -->
      <template v-if="darkSrc">
        <img
          ref="lightImage"
          class="akari-doc-hero__image akari-doc-hero__image--light"
          :src="src"
          :alt="hero.alt"
          loading="lazy"
          decoding="async"
          fetchpriority="high"
          @load="markLightLoaded"
          @error="markLightLoaded"
        />
        <img
          ref="darkImage"
          class="akari-doc-hero__image akari-doc-hero__image--dark"
          :src="darkSrc"
          :alt="hero.alt"
          loading="lazy"
          decoding="async"
          fetchpriority="high"
          @load="markDarkLoaded"
          @error="markDarkLoaded"
        />
      </template>
      <img
        v-else
        ref="lightImage"
        class="akari-doc-hero__image"
        :src="src"
        :alt="hero.alt"
        loading="lazy"
        decoding="async"
        fetchpriority="high"
        @load="markLightLoaded"
        @error="markLightLoaded"
      />
      <!-- Covers the image's own box with a centered Material indicator
           until the image this scheme shows has arrived; then it fades out
           instead of disappearing. -->
      <Transition name="akari-media-fade">
        <span
          v-if="mounted && !loaded"
          class="akari-doc-hero__loading"
          :style="overlayStyle"
          aria-hidden="true"
        >
          <m3e-loading-indicator></m3e-loading-indicator>
        </span>
      </Transition>
    </div>
  </header>
</template>

<style scoped>
/*
 * Two equal cards across the top of the surface, as on the Material Design
 * blog. The hero leaves the surface's padding: it sits as far from the
 * surface's edges as the cards sit from each other, and its corners stay
 * concentric with the surface's. The first margin offsets the surface cap
 * that precedes it, the same way the cap's own rule does for other content.
 * Sizes follow the hero's own width, so the title scales with the space it
 * gets rather than with the window.
 */
.akari-doc-hero {
  --_inset: var(--akari-doc-hero-inset, 8px);
  container-type: inline-size;
  display: grid;
  flex: none;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--_inset);
  margin-block: calc(
      var(--_inset) + var(--akari-doc-padding) - var(--akari-doc-radius)
    )
    48px;
  margin-inline: calc(var(--_inset) - var(--akari-doc-padding));
}

.akari-doc-hero__text,
.akari-doc-hero__media {
  min-width: 0;
  border-radius: calc(var(--akari-doc-radius) - var(--_inset));
}

.akari-doc-hero__text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  min-height: clamp(240px, 32cqi, 400px);
  padding: clamp(24px, 4.5cqi, 56px);
  background-color: transparent;
  color: var(--md-sys-color-on-surface);
}

/*
 * The cards' hidden decoration. The page's pattern tile (on the surface,
 * see styles/pattern.css; the layout moves the light) masks a layer of ink: at rest it is barely there, strongest in the far
 * corner of the pair (the title card's top end, the image card's bottom
 * start) and fading out from it. With the pointer on a card a light comes
 * up around it: a wide, soft glow of the primary colour and, within a
 * smaller circle, the pattern in clear ink, both easing in and out. It all
 * sits below the text, and below the image, which hides it but where it is
 * transparent; it lets pointers through.
 */
.akari-doc-hero__text,
.akari-doc-hero__media {
  --akari-light-x: 50%;
  --akari-light-y: 50%;
  --_ink: var(--md-sys-color-on-surface);
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.akari-doc-hero__pattern,
.akari-doc-hero__light,
.akari-doc-hero__glow,
.akari-doc-hero__focus {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.akari-doc-hero__pattern,
.akari-doc-hero__focus {
  background-color: var(--_ink);
  -webkit-mask-image: var(--akari-pattern-tile), var(--_reach);
  mask-image: var(--akari-pattern-tile), var(--_reach);
  -webkit-mask-size: var(--akari-pattern-size), 100% 100%;
  mask-size: var(--akari-pattern-size), 100% 100%;
  -webkit-mask-repeat: repeat, no-repeat;
  mask-repeat: repeat, no-repeat;
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}

.akari-doc-hero__pattern {
  --_reach: radial-gradient(
    circle at 100% 0%,
    #000,
    transparent 75%
  );
  opacity: 0.07;
  animation: akari-hero-pattern-in var(--md-sys-motion-duration-long-2, 500ms)
    var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)) both;
}

@keyframes akari-hero-pattern-in {
  from {
    opacity: 0;
  }
}

:root[dir="rtl"] .akari-doc-hero__pattern {
  --_reach: radial-gradient(circle at 0% 0%, #000, transparent 75%);
}

.akari-doc-hero__media .akari-doc-hero__pattern {
  --_reach: radial-gradient(circle at 0% 100%, #000, transparent 75%);
}

:root[dir="rtl"] .akari-doc-hero__media .akari-doc-hero__pattern {
  --_reach: radial-gradient(circle at 100% 100%, #000, transparent 75%);
}

/* The light's position, taken down from the card (see styles/pattern.css). */
.akari-doc-hero__light,
.akari-doc-hero__glow,
.akari-doc-hero__focus {
  --akari-light-x: inherit;
  --akari-light-y: inherit;
}

.akari-doc-hero__light {
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-medium-2, 300ms)
    var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
}

/* Both fall off in several steps, for an edge that is never felt. */
.akari-doc-hero__glow {
  background: radial-gradient(
    circle 360px at var(--akari-light-x) var(--akari-light-y),
    color-mix(
        in srgb,
        var(--md-sys-color-primary) var(--akari-pattern-glow),
        transparent
      )
      0%,
    color-mix(
        in srgb,
        var(--md-sys-color-primary) calc(var(--akari-pattern-glow) * 0.75),
        transparent
      )
      25%,
    color-mix(
        in srgb,
        var(--md-sys-color-primary) calc(var(--akari-pattern-glow) * 0.35),
        transparent
      )
      55%,
    color-mix(
        in srgb,
        var(--md-sys-color-primary) calc(var(--akari-pattern-glow) * 0.12),
        transparent
      )
      80%,
    transparent 100%
  );
}

.akari-doc-hero__focus {
  --_reach: radial-gradient(
    circle 220px at var(--akari-light-x) var(--akari-light-y),
    #000 0%,
    rgb(0 0 0 / 0.7) 25%,
    rgb(0 0 0 / 0.35) 55%,
    rgb(0 0 0 / 0.1) 80%,
    transparent 100%
  );
  opacity: var(--akari-pattern-spot);
}

/* Lit only under a mouse or pen (data-akari-hover, see useContentLight). */
:root[data-akari-hover]
  :is(.akari-doc-hero__text, .akari-doc-hero__media):hover
  .akari-doc-hero__light {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .akari-doc-hero__pattern {
    animation: none;
  }

  .akari-doc-hero__light {
    transition: none;
  }
}

@media (forced-colors: active) {
  .akari-doc-hero__pattern,
  .akari-doc-hero__light {
    display: none;
  }
}

.akari-doc-hero__date {
  margin: 0 0 24px;
  color: var(--md-sys-color-on-surface);
  font-size: var(--md-sys-typescale-title-medium-font-size, 1rem);
  font-weight: var(--md-sys-typescale-title-medium-font-weight, 500);
  line-height: var(--md-sys-typescale-title-medium-line-height, 1.5rem);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking, 0.009375rem);
}

.akari-doc-hero__title {
  margin: 0;
  font-size: clamp(2rem, 4.6cqi, 3.5625rem);
  font-weight: 400;
  line-height: 1.12;
  letter-spacing: -0.015625em;
  overflow-wrap: anywhere;
}

.akari-doc-hero__tagline {
  margin: 16px 0 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-font-size, 1rem);
  line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
  letter-spacing: var(--md-sys-typescale-body-large-tracking, 0.03125rem);
}

.akari-doc-hero__media {
  position: relative;
  overflow: hidden;
  background-color: var(
    --_background,
    var(--akari-doc-hero-media-color, var(--md-sys-color-primary-container))
  );
}

.akari-doc-hero__image {
  position: absolute;
  inset: 0;
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.akari-doc-hero__media[data-fit="contain"] .akari-doc-hero__image {
  padding: clamp(16px, 3cqi, 40px);
  object-fit: contain;
}

/* Narrow: the cards stack, title first, the image at a wide aspect. */
@media (max-width: 839.98px) {
  .akari-doc-hero {
    grid-template-columns: minmax(0, 1fr);
    margin-block-end: 32px;
  }

  .akari-doc-hero__title {
    font-size: clamp(2rem, 7cqi, 2.8125rem);
  }

  .akari-doc-hero__media {
    aspect-ratio: 16 / 10;
  }
}
.akari-doc-hero__fluid {
  position: absolute;
  inset: 0;
  z-index: -2;
  border-radius: inherit;
}
</style>

<style>
/*
 * Each image shows in its own scheme. Unscoped, because it depends on the
 * root's .dark class (a scoped :global() would apply to the root itself).
 */
html.dark .akari-doc-hero__image--light,
html:not(.dark) .akari-doc-hero__image--dark {
  display: none;
}
</style>
