<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase } from "vitepress";

import { useHero } from "../../composables/useHero";
import { usePagePattern } from "../../composables/usePattern";
import { heroImageHref } from "../../hero";

const { page } = useData();
const hero = useHero();

const src = computed(() =>
  hero.value ? heroImageHref(hero.value.src, withBase) : "",
);
const darkSrc = computed(() =>
  hero.value?.darkSrc ? heroImageHref(hero.value.darkSrc, withBase) : "",
);

// The page's pattern, shared with the article; the layout moves the light.
const pattern = usePagePattern();
</script>

<template>
  <!--
    Header of a page with a hero image: the title, its date and tagline on
    one card, the image on the other. It carries the page's h1, so the
    layout hides the h1 of the Markdown content. `data-akari-page-title` marks
    the title the app bar takes over once it scrolls away.
  -->
  <header v-if="hero" class="akari-doc-hero">
    <div class="akari-doc-hero__text">
      <!--
        Decoration, below the text: a faint pattern, and a soft light that
        brings it out around the pointer while it rests on the card.
      -->
      <template v-if="pattern">
        <span class="akari-doc-hero__pattern" aria-hidden="true"></span>
        <span class="akari-doc-hero__light" aria-hidden="true">
          <span class="akari-doc-hero__glow"></span>
          <span class="akari-doc-hero__focus"></span>
        </span>
      </template>
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
      :style="hero.background ? { '--_background': hero.background } : undefined"
    >
      <!-- The same decoration, below the image: it shows where the image is transparent. -->
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
          class="akari-doc-hero__image akari-doc-hero__image--light"
          :src="src"
          :alt="hero.alt"
          loading="lazy"
          decoding="async"
          fetchpriority="high"
        />
        <img
          class="akari-doc-hero__image akari-doc-hero__image--dark"
          :src="darkSrc"
          :alt="hero.alt"
          loading="lazy"
          decoding="async"
          fetchpriority="high"
        />
      </template>
      <img
        v-else
        class="akari-doc-hero__image"
        :src="src"
        :alt="hero.alt"
        decoding="async"
        fetchpriority="high"
      />
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
  background-color: var(
    --akari-doc-hero-text-color,
    var(--md-sys-color-surface-container)
  );
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

:dir(rtl) .akari-doc-hero__pattern {
  --_reach: radial-gradient(circle at 0% 0%, #000, transparent 75%);
}

.akari-doc-hero__media .akari-doc-hero__pattern {
  --_reach: radial-gradient(circle at 0% 100%, #000, transparent 75%);
}

:dir(rtl) .akari-doc-hero__media .akari-doc-hero__pattern {
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
