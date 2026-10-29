---
tab: Details
---

# Side navigation: Details

## Rail and navigation drawer

- **Rail**: a strip that takes the full height of the left side of the page; the app bar starts to its right. In `m3e-nav-rail`, each category is an `m3e-nav-item`. A category with child items points to its first page, and a top-level item without child items is a link itself. The divider on its right appears only when a navigation drawer shows next to it.
- **Drawer content**: `m3e-nav-menu` lists the pages in the category. The category name already shows in the rail, so the drawer does not repeat it. Items in the drawer show text only; badges and nested groups are kept.
- **1600px and above**: when the current page belongs to a category, the drawer stays open to the right of the rail and takes width from the content. Whether it stays open depends on both the current route and a CSS media query, so the server render and the first screen are already in the final state, and no expand animation plays on reload. After that, when the window grows wider or you enter a category from a page without a submenu, the width expands from 0 with a spatial spring and the content area makes room; the reverse collapses it the same way. When you hover another category, the current list fades out, then that category's list fades in. When the pointer leaves the navigation area, the current category comes back.
- **960–1599px**: after the pointer rests on a category for about 100ms, the drawer slides out from under the rail. It takes the full page height and covers the app bar and the content (level 3 shadow, level 5 while the pointer is in the drawer; 16px rounded corners at the trailing end). Moving between categories fades the list out and back in. About 200ms after the pointer leaves the rail and the drawer, the drawer slides back.
- **Below 960px**: the rail and drawer are hidden, and the menu button in the app bar opens the full navigation drawer. Its top-level menu matches the rail and shows the same icons; child items show text only. The top of the drawer sits flush against the app bar with no rounded corners, and the bottom of its trailing end has a 16px rounded corner.
- **Clicking**: a mouse click on a category goes to its first page. A click with a modifier key is left to the browser, which opens a new tab. Touch screens have no hover, so tapping a category opens or closes the drawer instead, and tapping outside closes it. Links in the drawer use VitePress's SPA navigation, and the drawer closes after a click.
- **Groups**: a group the reader opened or closed stays that way when the drawer switches to another category and back, until the page is reloaded; going to a page in a group opens it.

All transitions use the M3 Expressive motion tokens from `m3e-theme` (`--md-sys-motion-spring-*`), and switch between standard and expressive with the "Motion" setting. When the system has "reduce motion" turned on, everything switches instantly.

## Finding the current page

- Route comparison ignores `base`, trailing slashes, query parameters and the hash, and treats `.html` as the same path: `/guide/intro/`, `/guide/intro.html` and `/guide/intro?from=nav` all match the same item. External links and anchor-only links never become the current item.
- Once the current item is found, its ancestor groups get `open` and the item itself gets `selected`; `m3e-nav-menu-item` maps `selected` to `aria-current`. A parallel page group is selected on any page in the group.
- Navigation written as an object is first sorted by path length, longest first, and the first key that matches the current path is used.

## Previous and next page

The pager cards at the end of the content appear only on parallel pages and move between the pages of the same group: they take the page before and after the current one in the group, titled with their tab labels. The group's first page has no previous page and its last no next page; pages outside any group show no pager, so it never takes the reader into another document. The footer's link columns come from the whole navigation tree, where a parallel group counts as one entry.

## The parallel pages tab bar

### Position and look

- Every page in the group has a tab bar at the top of its surface, with the same side margins as the hero. When there is a hero, it goes below the tab bar, so the tab bar sits in the same place on every page in the group.
- Each tab is an ordinary link, and clicking it uses SPA navigation. The current page's tab has `aria-current="page"` and is marked by an indicator with a `secondary-container` background. After a click, the indicator slides to the new tab at once, without waiting for the new page to load. Sliding to the first or last tab uses a curve without bounce, so the indicator does not overshoot the rounded end.
- The tab bar is a named `<nav>` landmark, for example "Icons pages". Only one copy of the tab bar is visible to assistive technology at any time, and the copy in flight cannot take focus.
- Clicking the current page's tab does nothing. It does not scroll back to the top of the page.

### Horizontal scrolling

When the window is too narrow for all the tabs, the tabs keep their width, the tab bar scrolls horizontally, and a thin 4px scrollbar appears at the bottom. Until the reader scrolls it, the tab bar scrolls itself so the current tab is fully visible, and realigns after a page switch or a change in window width. Once the reader has scrolled it with the wheel, by dragging, by touch or with the arrow keys, it stops interfering until the next page switch. Scrolling is allowed only when the tabs themselves are too wide; the indicator's animation overshooting the end never makes a scrollbar appear.

### Docking into the app bar

- When you scroll down and the tab bar comes within 24px of the app bar, it shrinks into a 40px-high compact tab bar that fills the empty space between the app bar title and the first button on the right, with `--akari-app-bar-tabs-gap` on each side. When its original position is again more than 24px from the app bar, it returns to the page.
- Between the two positions, a copy of the tab bar moves across, with its position, size, text size and background color transitioning together. The horizontal and vertical directions are each driven by an M3 default spatial spring: damping ratio 0.8 and stiffness 380 for expressive motion, 0.9 and 700 for standard motion. The springs start from rest, and with expressive motion the end has a slight bounce.
- The two directions start one after the other and partly overlap. When docking, the copy first narrows below the app bar, and rises past the bottom edge of the app bar just as it becomes narrow enough to fit the empty space. When returning to the page, it first drops at the compact width, then expands once it is clear of the app bar. The start time of the second direction is computed from the trajectories of the two springs, so within the app bar the copy always stays inside the empty space: it never passes over the title or the search box, and is never cut off.
- The copy's landing point is measured again on every frame, so it lands accurately even while the page is still scrolling. If the scroll direction changes mid-animation, the copy turns back from where it is.
- If fast scrolling has already slid the tab bar partly under the bottom edge of the app bar, the copy first comes out from the bottom edge and moves back below the app bar, then docks in the order above. If the tab bar jumps back only after the surface that holds it has scrolled entirely out of the viewport (for example, when jumping from the footer to an anchor), there is no starting point to fly from, and the tab bar in the app bar simply fades in.

### Sharing space with the title

- The theme measures the app bar title (the site name, or the page title that replaces it) at its untruncated width, and measures again when the title changes, the window resizes or fonts load.
- When docking, the tab bar first gets its content width plus the gaps on both sides. The title uses at most the remaining width, and anything longer is truncated with an ellipsis. The tab bar then fills the rest of the space.
- While the tab bar is docked in the app bar, changes in title width (the site name and page title swapping, or switching to another page whose title has a different length) transition smoothly, and the tab bar grows and shrinks with them. During the transition the title is clipped without an ellipsis; the ellipsis shows again when it ends. Differences under 2px do not start a new transition.

### Held below the app bar

- The tab bar docks into the app bar only if the title can keep at least the logo, the version and about six characters (shorter titles are kept whole). Both the site name and the page title must pass this check, because either one may show once the tab bar is docked. So whether it docks depends only on the window width, and does not flip back and forth during scrolling as the app bar swaps titles.
- When the check fails, the tab bar stops when it scrolls up to the app bar and stays held below it, slightly raised with a level 2 shadow, floating above the body text that scrolls past. The text around it stays visible and clickable. The shadow fades in when the tab bar sticks and fades out when it leaves. While it is held, `html` has the `akari-tabs-pinned` class: anchor jumps and the sticky position of the table of contents both leave room for it, and when the article title scrolls behind it, the app bar likewise switches to the page title.
- When the window grows wide enough for the app bar to fit it, the tab bar flies from below the app bar into the app bar. When the window narrows and it no longer fits, it flies below the app bar the same way: the copy starts from the part still showing in the app bar (or, if it has been squeezed out completely, from the position of the empty space at zero width), first drops below the app bar, then expands, and is never squeezed narrower on the way.
- While you drag the window, the search box and the buttons are still transitioning their widths, and the space in the app bar is not final. So the theme waits about 200ms for it to settle before deciding whether to dock. It leaves the app bar at once only when the docked tab bar no longer fits and would be cut off.
- The body text and the hero each form their own stacking context, so content inside them (such as the copy button of a code block) does not float above the held tab bar when it scrolls beneath it.

## Switching pages

When you switch pages within a group, the document surface stays still and only the content moves left or right, in the direction of the tab (M3 shared axis X). When you switch to a tab on the right, the current content fades out to the left and the new content slides in from 30px to the right; the other direction is the reverse, and right-to-left layouts mirror the direction. The tab bar itself does not move:

- When the tab bar is docked in the app bar or held below it, it stays where it is after the switch, and the new page is positioned right at the start of the body text. The article title (the hero or the opening h1) has already scrolled under the app bar (or the held tab bar), and the app bar shows the new page's title. If the new page is too short to scroll that far, the tab bar returns to the page. If the link has an anchor, the anchor takes precedence. On browser back and forward, the earlier scroll position is restored.
- When the tab bar is in the page, the new page starts at the top as usual, and the tab bar stays where it is. If the page had scrolled down a little before the switch, the tab bar moves smoothly back to its place at the top.

When you leave the group, the whole surface fades out and in as usual. When the system has "reduce motion" turned on, the tab bar and the content both switch instantly.

## Accessibility

- The `m3e-nav-menu` root element has an `aria-label` ("Documentation") and is the page's main navigation landmark. The rail has its own name ("Documentation sections").
- In the rail, arrow keys move focus between categories, and category items have `aria-haspopup`, `aria-expanded` and `aria-controls`. At 960–1599px, `Enter` or Space opens the drawer and moves focus into the menu, and `Escape` closes it and returns focus to the category. At 1600px and above, `Enter` on the current category moves focus straight into the open drawer.
- A closed drawer has `inert`, so it is out of the Tab order and the accessibility tree.
- Icons are hidden from assistive technology; the name comes from the text in the `label` slot. When you customize the navigation, keep the structure "menu root element + link in the label + `selected` state", and do not use a `div` to imitate a link.
