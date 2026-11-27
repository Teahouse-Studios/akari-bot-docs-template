---
icon: image
order: 4
tab: Overview
parallel:
  - api
---

# Image preview

`AkariImagePreview` wraps a picture in a thumbnail that opens to fill the content area, where it can be zoomed, rotated and panned, with the keyboard doing the same work.

## Usage

<AkariImagePreview src="/hero/theme-hero.svg" alt="The theme" label="View the theme">
  <img src="/hero/theme-hero.svg" alt="The theme" width="360" />
</AkariImagePreview>

```html
<AkariImagePreview src="/hero/theme-hero.svg" alt="The theme" label="View the theme">
  <img src="/hero/theme-hero.svg" alt="The theme" width="360" />
</AkariImagePreview>
```

The default slot is the thumbnail. Leave it out and the component renders an `<img>` of its own. Provide it and the component uses your markup as-is, only wrapping it in a button.

Props, slots, CSS classes and exported geometry functions are documented on the **API** tab.

## Keyboard

| Key | Action |
| --- | --- |
| `Esc` | Close the preview |
| `+`, `=` | Zoom in one step |
| `-`, `_` | Zoom out one step |
| `0` | Reset the view |
| `r` | Rotate 90° clockwise |
| `Shift` + `r` | Rotate 90° counter-clockwise |

Zoom runs from 50% to 400%, by wheel, double-click or the buttons in the bar. Drag to pan; double-click the picture or press the reset button to return to the opening view.

## Motion and fallbacks

Opening grows the picture out of its thumbnail and closing shrinks it back. Once the view has been zoomed, rotated or panned that animation is skipped and the overlay only fades, because there is no longer a single thumbnail-sized box for it to return to. With reduced motion enabled the overlay only fades throughout.

Until the thumbnail has loaded the trigger is disabled and shows a centered loading ball. The opened preview shows the same ball until the full picture is in place; clicking the backdrop is ignored during that time, while the close button and `Esc` still work. Both masks take the picture's build-time ratio and color, then fade out with MD3 duration and easing tokens.

The overlay is teleported to `.akari-frame`, so the prose column and its `overflow` cannot clip it. Page scrolling is locked while it is open, and focus returns to the trigger on close.
