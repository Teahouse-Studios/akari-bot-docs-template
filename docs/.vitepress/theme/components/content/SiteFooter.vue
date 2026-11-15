<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";

import { useAkariI18n } from "../../composables/useI18n";
import { useAkariLocales } from "../../composables/useLocales";
import { useAkariConfig } from "../../composables/useAkariConfig";
import { usePageHref } from "../../composables/usePageHref";
import { useSidebar } from "../../composables/useSidebar";
import { flattenSidebar, isExternalLink } from "../../sidebar";
import type { AkariFooterLinkGroup } from "../../types";

// Default columns: a sitemap of the first sidebar categories.
const MAX_GROUPS = 4;
const MAX_LINKS = 6;

const config = useAkariConfig();
const pageHref = usePageHref();
const { t } = useAkariI18n();
const { items } = useSidebar();
const { homeHref } = useAkariLocales();

const logo = computed(() => {
  const value = config.value.appBar.logo;
  return value ? withBase(value) : "";
});

const groups = computed<AkariFooterLinkGroup[]>(() => {
  const links = config.value.footer.links;
  if (links === false) return [];
  if (links) return links.filter((group) => group.items.length > 0);

  return items.value
    .filter((item) => (item.items?.length ?? 0) > 0)
    .slice(0, MAX_GROUPS)
    .map((item) => ({
      title: item.text,
      items: flattenSidebar(item.items ?? [], { tabs: "group" })
        .slice(0, MAX_LINKS)
        .map((child) => ({ text: child.text, link: child.link ?? "" })),
    }));
});

function hrefFor(link: string): string {
  return pageHref(link);
}
</script>

<template>
  <footer class="akari-site-footer">
    <div class="akari-surface-cap" aria-hidden="true"></div>
    <div class="akari-site-footer__inner">
      <div class="akari-site-footer__main">
        <section class="akari-site-footer__about">
          <a class="akari-site-footer__brand" :href="homeHref">
            <img
              v-if="logo"
              class="akari-site-footer__logo"
              :src="logo"
              alt=""
              decoding="async"
            />
            <span class="akari-site-footer__title">{{ config.appBar.title }}</span>
          </a>
          <p v-if="config.footer.message" class="akari-site-footer__message">
            {{ config.footer.message }}
          </p>
        </section>

        <nav
          v-if="groups.length"
          class="akari-site-footer__links"
          :aria-label="t('footerLinks')"
        >
          <div
            v-for="(group, groupIndex) in groups"
            :key="`${group.title}-${groupIndex}`"
            class="akari-site-footer__group"
          >
            <p
              :id="`akari-site-footer-group-${groupIndex}`"
              class="akari-site-footer__group-title"
            >
              {{ group.title }}
            </p>
            <ul :aria-labelledby="`akari-site-footer-group-${groupIndex}`">
              <li
                v-for="(item, itemIndex) in group.items"
                :key="`${item.link}-${itemIndex}`"
              >
                <a
                  class="akari-site-footer__link"
                  :href="hrefFor(item.link)"
                  :target="isExternalLink(item.link) ? '_blank' : undefined"
                  :rel="isExternalLink(item.link) ? 'noreferrer' : undefined"
                >{{ item.text }}</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <p v-if="config.footer.copyright" class="akari-site-footer__copyright">
        {{ config.footer.copyright }}
      </p>
    </div>
  </footer>
</template>

<style scoped>
/* A surface of its own, rounded at the top and running off the page bottom. */
.akari-site-footer {
  padding: 48px var(--akari-doc-padding) 32px;
  border-start-start-radius: var(--akari-doc-radius);
  border-start-end-radius: var(--akari-doc-radius);
  background-color: var(--akari-doc-surface-color, var(--md-sys-color-surface));
  /* Same scrolled edge as the document, open at the page bottom. */
  box-shadow:
    inset 1px 1px 0 var(--akari-doc-edge-color),
    inset -1px 0 0 var(--akari-doc-edge-color);
  --_cap-top: 48px;
  --_cap-bottom: 32px;
  color: var(--md-sys-color-on-surface);
}

.akari-site-footer__inner {
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: var(--akari-doc-max-width);
  margin-inline: auto;
}

.akari-site-footer__main {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: 40px 64px;
}

.akari-site-footer__about {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.akari-site-footer__brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  border-radius: var(--md-sys-shape-corner-small, 8px);
  color: inherit;
  text-decoration: none;
}

.akari-site-footer__logo {
  flex: none;
  width: 56px;
  height: 48px;
  object-fit: contain;
}

.akari-site-footer__title {
  font-size: var(--md-sys-typescale-title-large-font-size, 1.375rem);
  font-weight: var(--md-sys-typescale-title-large-font-weight, 400);
  line-height: var(--md-sys-typescale-title-large-line-height, 1.75rem);
}

.akari-site-footer__message {
  max-inline-size: 40ch;
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-font-size, 1rem);
  line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
}

.akari-site-footer__links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 32px 24px;
}

.akari-site-footer__group {
  min-width: 0;
}

.akari-site-footer__group-title {
  margin: 0 0 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-title-small-font-size, 0.875rem);
  font-weight: var(--md-sys-typescale-title-small-font-weight, 500);
  line-height: var(--md-sys-typescale-title-small-line-height, 1.25rem);
  letter-spacing: var(--md-sys-typescale-title-small-tracking, 0.00625rem);
}

.akari-site-footer__group ul {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/*
 * Links go without an underline at rest. The pointer (or keyboard focus)
 * draws one in from the text's start to its end, and taking it away lets
 * it run on out at the end, as one stroke passing through.
 */
.akari-site-footer__link {
  position: relative;
  display: inline-block;
  border-radius: var(--md-sys-shape-corner-extra-small, 4px);
  color: var(--md-sys-color-primary);
  font-size: var(--md-sys-typescale-body-large-font-size, 1rem);
  line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
  text-decoration: none;
}

.akari-site-footer__link::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: -1px;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: right center;
  transition: transform var(--md-sys-motion-duration-medium-2, 300ms)
    var(--md-sys-motion-easing-emphasized-decelerate, cubic-bezier(0.05, 0.7, 0.1, 1));
  pointer-events: none;
}

.akari-site-footer__link:is(:hover, :focus-visible)::after {
  transform: none;
  transform-origin: left center;
}

:root[dir="rtl"] .akari-site-footer__link::after {
  transform-origin: left center;
}

:root[dir="rtl"] .akari-site-footer__link:is(:hover, :focus-visible)::after {
  transform-origin: right center;
}

@media (prefers-reduced-motion: reduce) {
  .akari-site-footer__link::after {
    transition: none;
  }
}

.akari-site-footer__brand:focus-visible,
.akari-site-footer__link:focus-visible {
  outline: 2px solid var(--md-sys-color-secondary);
  outline-offset: 2px;
}

.akari-site-footer__copyright {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-font-size, 0.875rem);
  line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
}

@media (max-width: 840px) {
  .akari-site-footer__main {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
