import { describe, expect, it } from "vitest";

import {
  IMAGE_PREVIEW_MAX_SCALE,
  IMAGE_PREVIEW_MIN_SCALE,
  IMAGE_PREVIEW_ZOOM_STEP,
  clampImageScale,
  isImageTransformed,
  previewChrome,
  rotateImage,
  rotationFitScale,
  scaleLabel,
  uprightRotation,
  unwindRotation,
  wheelImageScale,
  zoomImageScale,
} from "../docs/.vitepress/theme/image-preview";

describe("clampImageScale", () => {
  it("keeps the scale inside the zoom limits", () => {
    expect(clampImageScale(0.1)).toBe(IMAGE_PREVIEW_MIN_SCALE);
    expect(clampImageScale(99)).toBe(IMAGE_PREVIEW_MAX_SCALE);
  });

  it("rounds to whole percents, so the label matches the picture", () => {
    expect(clampImageScale(1.2345)).toBe(1.23);
    expect(clampImageScale(1.0499)).toBe(1.05);
  });

  it("falls back to the fit scale when the input is not a number", () => {
    expect(clampImageScale(Number.NaN)).toBe(1);
    expect(clampImageScale(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe("zoomImageScale", () => {
  it("adds one step and stops at both limits", () => {
    expect(zoomImageScale(1, IMAGE_PREVIEW_ZOOM_STEP)).toBe(1.25);
    expect(zoomImageScale(1, -IMAGE_PREVIEW_ZOOM_STEP)).toBe(0.75);
    expect(zoomImageScale(IMAGE_PREVIEW_MAX_SCALE, IMAGE_PREVIEW_ZOOM_STEP)).toBe(
      IMAGE_PREVIEW_MAX_SCALE,
    );
    expect(zoomImageScale(IMAGE_PREVIEW_MIN_SCALE, -IMAGE_PREVIEW_ZOOM_STEP)).toBe(
      IMAGE_PREVIEW_MIN_SCALE,
    );
  });
});

describe("wheelImageScale", () => {
  it("scales up on a wheel towards the user and down away from it", () => {
    expect(wheelImageScale(1, -1)).toBeCloseTo(1.1, 2);
    expect(wheelImageScale(1.1, 1)).toBeCloseTo(1, 2);
  });

  it("is bounded like the buttons", () => {
    expect(wheelImageScale(IMAGE_PREVIEW_MAX_SCALE, -1)).toBe(IMAGE_PREVIEW_MAX_SCALE);
    expect(wheelImageScale(IMAGE_PREVIEW_MIN_SCALE, 1)).toBe(IMAGE_PREVIEW_MIN_SCALE);
  });
});

describe("rotation", () => {
  it("turns by the step, in either direction", () => {
    expect(rotateImage(0, 90)).toBe(90);
    expect(rotateImage(0, -90)).toBe(-90);
  });

  it("resets to the nearest upright quarter turn", () => {
    expect(uprightRotation(0)).toBe(0);
    expect(uprightRotation(90)).toBe(0);
    expect(uprightRotation(450)).toBe(360);
    expect(uprightRotation(-90)).toBe(0);
    expect(uprightRotation(-400)).toBe(-360);
  });

  it("unwinds rotations by the shortest turn", () => {
    expect(unwindRotation(0)).toBe(0);
    expect(unwindRotation(90)).toBe(0);
    expect(unwindRotation(270)).toBe(360);
    expect(unwindRotation(450)).toBe(360);
    expect(unwindRotation(630)).toBe(720);
    expect(unwindRotation(-90)).toBe(0);
    expect(unwindRotation(-270)).toBe(-360);
    expect(unwindRotation(720)).toBe(720);
  });

  it("unwinds a half turn the same way every time", () => {
    expect(unwindRotation(180)).toBe(0);
    expect(unwindRotation(540)).toBe(360);
    expect(unwindRotation(-180)).toBe(-360);
  });
});

describe("isImageTransformed", () => {
  const reset = { scale: 1, rotation: 0, x: 0, y: 0 };

  it("is false for a view that was never touched", () => {
    expect(isImageTransformed(reset)).toBe(false);
    expect(isImageTransformed({ ...reset, rotation: 360 })).toBe(false);
  });

  it("is true once the picture is zoomed, turned or moved", () => {
    expect(isImageTransformed({ ...reset, scale: 1.25 })).toBe(true);
    expect(isImageTransformed({ ...reset, rotation: 90 })).toBe(true);
    expect(isImageTransformed({ ...reset, x: 4 })).toBe(true);
    expect(isImageTransformed({ ...reset, y: -4 })).toBe(true);
  });
});

describe("previewChrome", () => {
  it("takes more of a wide window than a compact one", () => {
    expect(previewChrome(640)).toBe(120);
    expect(previewChrome(641)).toBe(148);
  });
});

describe("rotationFitScale", () => {
  const viewport = { width: 1200, height: 900 };
  const chrome = previewChrome(viewport.width);

  it("leaves an upright picture alone", () => {
    expect(
      rotationFitScale(0, { width: 800, height: 400 }, viewport, chrome),
    ).toBe(1);
    expect(
      rotationFitScale(180, { width: 800, height: 400 }, viewport, chrome),
    ).toBe(1);
  });

  it("shrinks a turned picture that no longer fits", () => {
    // 1600 wide by 400 tall turned a quarter: 1600 tall, past the 752 the
    // wide window leaves once its chrome is out.
    expect(
      rotationFitScale(90, { width: 1600, height: 400 }, viewport, chrome),
    ).toBeCloseTo((900 - chrome) / 1600, 3);
  });

  it("does not grow a small picture", () => {
    expect(
      rotationFitScale(90, { width: 200, height: 100 }, viewport, chrome),
    ).toBe(1);
  });

  it("waits for the picture to report its size", () => {
    expect(
      rotationFitScale(90, { width: 0, height: 0 }, viewport, chrome),
    ).toBe(1);
  });
});

describe("scaleLabel", () => {
  it("reads as whole percents", () => {
    expect(scaleLabel(1)).toBe("100%");
    expect(scaleLabel(1.05)).toBe("105%");
    expect(scaleLabel(0.5)).toBe("50%");
  });
});
