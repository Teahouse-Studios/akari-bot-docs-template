---
tab: Details
---

# Layout and app bar: Details

## Page structure

Simplified, the structure that `AkariLayout.vue` renders is:

```text
<m3e-theme>
  <div class="akari-frame">                  Page grid: 3 columns, 2 rows
    <div class="akari-frame__bar">
      <AppBar />                           Columns 2–3, sticky
    </div>
    <DesktopNav />                         Rail: column 1, full height; pinned drawer: column 2
    <div class="akari-main">                 Column 3
      <main class="akari-doc">               Document surface, the page's main landmark
        <DocTabs />                        Tab bar of parallel pages
        <Hero />                           When there is a hero
        <div class="akari-doc__inner">       Max-width layer, page switch animation
          <div class="akari-doc__layout">
            <Content id="akari-doc-content" />
            <Toc />
          </div>
          <Pager />
        </div>
      </main>
      <Footer />                           Wavy divider and footer surface
    </div>
  </div>
  <DocFabs />                              Floating action buttons
  <AppBarMenu />                           "More" menu
  <m3e-drawer-container>                   Mobile navigation drawer
  <LocaleDialog /> <SettingsDialog />      Language and settings dialogs
</m3e-theme>
```

- The window scrolls the page, not an inner scroll container. The root element declares `overflow-y: auto` so that m3e's scroll observers can listen to document scrolling. `scroll-padding-top` equals the app bar height plus `--akari-doc-gap`, so anchor jumps stop below the app bar.
- The rail and the app bar are both `position: sticky`. When the window is 960px or wider, the cell at the top of the rail, as tall as the app bar, holds the site logo, and the app bar title keeps only the site name and version. Without desktop navigation, the first two grid columns have zero width.
- `m3e-theme` wraps the whole app and provides dynamic color, light and dark mode, contrast and motion. The layout syncs the current palette to the root element, so the background and text colors of `html` and `body` follow it.

## App bar

### Meeting the surface

The app bar has no background color, divider or shadow. What shows through is the page background, and the document surface passes beneath it as it scrolls. A zero-height mask is fixed to the bottom edge of the app bar. At each end of the document column it draws an inverted corner with the same radius as the surface, so the surface stays rounded where the app bar cuts it off.

On devices with a usable GPU, the scroll mask is removed. The app bar no longer paints a fixed background color; instead, its background itself fades from the original surface color to transparent, so content passing beneath the bar blends into it naturally instead of being cut off. The app bar and its contents sit on a higher layer and are never covered by content. When the GPU detector reports BAD, all non-essential animations and transitions are turned off and finish on a single frame, reducing the load on software rendering.

Once the document surface scrolls under the app bar, `html` gets `data-akari-scrolled`, and a very light outline fades in around both the document surface and the footer surface (as strong as the rail divider, set by `--akari-doc-divider-strength`; the bottom edge of the footer has none). The first child of each surface is a "surface cap" that sticks to the bottom edge of the app bar. It stays there only while its own surface is scrolled under the app bar, and it draws the inverted corners, two arcs and the top edge where the surface is cut off, so the outline is a complete loop there too. The outline strength transitions through the registered custom property `--akari-doc-edge-strength` and is mixed into the surface color to give an opaque color (`--akari-doc-edge-color`), so overlaps do not get darker. Neither property inherits: both are set only on the elements that draw the outline (the two surfaces, their caps and the caps' corners), each transitioning with the same duration and easing, so every frame of the fade restyles and repaints just those elements instead of the whole page. The fade often runs while the tab bar flies into the app bar.

### Title swap

Once the article title (the `h1`, or the title in the hero) has scrolled fully under the app bar, the app bar title changes from the site name to the page title: the site name fades out upward and the page title fades in from below. Scrolling back reverses this. The page title in the app bar is hidden from assistive technology, so it is not read out a second time along with the `h1` of the content. The element it follows is the one with `data-akari-page-title`, or the first `h1` of the content if there is none.

### Collapsing buttons

The app bar arranges the buttons on the right by its actual width:

- The site name always keeps room for the logo, the version and about six characters (all of the name if it is shorter). When showing every social link and the settings button would take that room, all buttons except search collapse into a "More" button (`more_vert`), which opens an `m3e-menu` drop-down menu. They expand again once the window is wide enough. Collapsing and expanding are both width transitions with 8px of hysteresis, so the buttons do not flip back and forth when the width hovers around the threshold.
- Only the site name decides whether to collapse, not the page title shown after scrolling, because a page title may be long and is truncated anyway.
- "Settings" in the "More" menu opens the settings dialog, which expands from the "More" button and collapses back into it. The menu renders outside the page frame, so it opens in the right place after the page scrolls. Focusing a menu item does not scroll the page.
- The search box has size steps based on the window width: on wide screens it is a search box with placeholder text and a shortcut hint; below 768px it shrinks to a 40px round button. Between steps, the width and padding transition smoothly, the placeholder text fades out and the shortcut hint folds away. The search box does not take part in flex shrinking. Only the window width sets its width, so it does not interfere with the calculation of the title width.

## Page transitions

When you go to another group of pages, the whole document surface first fades out (about 250ms). Once the new page has loaded, it fades in (about 450ms) and rises 16px from below into place on m3e's slow spatial spring. The fade-out runs while the new page loads, so it does not slow down navigation. Anchor jumps within a page play no animation. Switching between pages of the same parallel group slides sideways instead; see [Side navigation](/theme/sidebar/details#switching-pages). When "reduce motion" is turned on in the system, pages switch without animation.

## Loading bar

The bar is a 4px M3 linear progress indicator along the top of the window: the active indicator in the primary color, without a track. It sits over the app bar and grows from the start of the line towards its end, mirrored in right-to-left layouts.

- Navigating within the site: it starts when VitePress begins loading the next page. The size of that page's script can't be known, so the progress creeps towards 70% in ever smaller steps without reaching it. Once the page has rendered, the theme collects the images and fonts it is still loading, and each one that finishes moves the progress a share closer to 100%. Lazy images (`loading="lazy"`) load only once they near the viewport, and count only then; other images count as soon as the page loads. Images that aren't displayed (such as the one of a hero's light and dark images the current mode doesn't use) don't count. Each resource is waited for at most 8 seconds.
- Opening the site: before the scripts run, the server-rendered bar creeps on its own with a CSS animation. When the script takes over, it carries on from where the bar got to and waits for the page's `load` event, its images and fonts. Without scripts, a `<noscript>` rule in `akariHead()` hides it.
- A load that finishes within 150ms shows no bar, so it never just flashes. At 100% the bar holds for 200ms, then fades. A load still going after 15 seconds stops showing.
- The bar has `role="progressbar"` and `aria-valuenow`, takes its name from the interface string `loadingLabel`, and is hidden from assistive technology while it isn't shown. With "reduce motion" turned on in the system it has no transitions; in forced colors mode it uses the system highlight color.
- The progress math is in `loading.ts`, and the tracking in the composable `useLoadingBar`, which chains onto the VitePress router's `onBeforePageLoad` like the page transitions do.

## Table of contents

- **Current section**: the last heading that has passed the reading line (96px below the app bar). When you scroll to the bottom of the page, the last heading still on screen.
- **Long TOC**: with more than 15 entries, the list is only as tall as 15 entries. It gets a thin scrollbar of its own and scrolls with your reading position to keep the current entry in the middle.
- **Clicking**: scrolls smoothly to the heading, moves focus to the heading and updates the hash in the URL. While scrolling, the highlight stays on the clicked entry until scrolling stops (the `scrollend` event, or no new scroll within 200ms). Entries have `target="_self"`, so the TOC handles the click itself and VitePress's router does not replace the smooth scroll with an instant jump.
- **Structure**: the TOC reads the `h2` to `h{maxDepth}` headings in the content and skips headings with `m3e-toc-ignore`. It rebuilds after a route change or a content update. The current entry has `aria-current="location"`. The look follows `m3e-toc`: an overline, `body-large` entries and a sliding indicator with a rounded outline.
- **Position**: the TOC sticks at `--akari-doc-toc-offset` below the app bar. After the content ends, it scrolls away with the page, so it never covers the footer.

## Floating action buttons

Both buttons are 56px M3 FABs: `large` corners, `secondary-container` colors and level 1 elevation (level 2 when the pointer hovers). They sit 16px from the window edges when the window is narrower than 840px, and 24px otherwise. They are hidden when printing.

### Back to top

- Scales and fades in when the page leaves the top (`scrollY > 0`), and scales and fades out when the page returns to the top.
- A click scrolls back to the top with `cubic-bezier(0.2, 0, 0, 1)`. The duration grows with the distance: `300ms + distance × 0.12`, clamped to 400–900ms. On the way, the button expands into its extended form with the text "Back to top", and it collapses on arrival.
- If you press it again on the way, or scroll with the wheel, touch or keys, the page stops where it is and the button collapses.
- When "reduce motion" is turned on in the system, it jumps straight to the top.

### Table of contents on narrow screens

- Appears when the window is narrower than 960px and the page has a table of contents, above the back-to-top button. When the back-to-top button is hidden, it moves down to take its place.
- A click expands the button up and to the left into a panel: `min(100vw - 32px, 360px)` wide, as tall as its entries need, up to 60% of the window. The button itself becomes a bar along the bottom of the panel with the text "Contents".
- As in the desktop TOC, a rounded outline marks the current section, and its text is bold. The outline slides with your reading position.
- On opening, the panel scrolls to the current section and puts focus on it. The panel cannot scroll until the expand animation ends, so no scrollbar appears while it expands.
- Clicking an entry scrolls smoothly to the heading and updates the hash. The panel stays open, and the outline stays on the clicked entry while scrolling. Click outside the panel (the scrim), click the "Contents" bar at the bottom, or press `Esc` to close the panel; focus returns to the button. The panel also closes by itself when the page changes.

## Footer

- The wavy divider sits on the page background between the two surfaces and takes its color from `--akari-wavy-divider-color`.
- The footer is a separate surface with only its two top corners rounded, and it extends to the bottom of the page. It is the page's `contentinfo` landmark, outside `<main>`.
- Links in the link columns have no underline at rest. On pointer hover or keyboard focus, an underline draws from the start of the text to the end over 300ms; when the pointer or focus leaves, it carries on out toward the end.
- Social links appear only in the app bar or the "More" menu and are not repeated in the footer, so the floating action buttons at the bottom right never cover them.

## Window size changes

- When the width crosses 960px, the layout transitions smoothly: the rail closes its column and slides out past the window edge (or slides in, the other way), the app bar and the document surface move with it, and the menu button and the app bar logo expand or collapse. On wide screens, the mobile navigation drawer stays laid out but invisible, so after you switch to a narrow screen it opens already in its finished state.
- Below 600px, the document surface reaches the window edges, keeps only its two top corners rounded, and its padding tightens to 20px.
- The breakpoints used in scripts are in `constants.ts` (`AKARI_NAV_RAIL_QUERY`, `AKARI_NAV_DRAWER_PINNED_QUERY`). If you change them, keep them in line with the media queries in `base.css`.

## First paint

Until the m3e components have registered in the browser, every component not yet upgraded (`:not(:defined)`) stays hidden, and the page shows only its background color. Once registration finishes, `html` gets `data-akari-ready` and the page appears in its final layout in a single frame. If scripts are disabled or fail to load, the content shows as plain HTML after 3 seconds. The copy button on code blocks is the `button.copy` that VitePress injects; the theme only restyles it.
