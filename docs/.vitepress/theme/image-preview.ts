/**
 * Geometry for the image preview overlay. Kept apart from the component so the
 * limits that decide what a view is (and whether it still counts as "reset")
 * can be tested without a DOM.
 */

/** The scale a preview opens at. */
export const IMAGE_PREVIEW_FIT = 1;
/** Zoom limits: past these the picture is either a thumbnail or mush. */
export const IMAGE_PREVIEW_MIN_SCALE = 0.5;
export const IMAGE_PREVIEW_MAX_SCALE = 4;
/** One click of the zoom buttons. */
export const IMAGE_PREVIEW_ZOOM_STEP = 0.25;
/** One wheel notch scales by this factor. */
export const IMAGE_PREVIEW_WHEEL_FACTOR = 1.1;
/** Rotation step of the rotate buttons, in degrees. */
export const IMAGE_PREVIEW_ROTATION_STEP = 90;

export interface ImagePreviewView {
  scale: number;
  /** Degrees, multiples of 90 as applied by the buttons. */
  rotation: number;
  /** Pan offset in CSS pixels. */
  x: number;
  y: number;
}

export interface ImagePreviewSize {
  width: number;
  height: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Scales are rounded to whole percents: the overlay shows the zoom level, and
 * a scale of 1.0499 would read as 105% while painting 104.99%.
 */
export function clampImageScale(value: number): number {
  if (!Number.isFinite(value)) {
    return IMAGE_PREVIEW_FIT;
  }
  return clamp(
    Math.round(value * 100) / 100,
    IMAGE_PREVIEW_MIN_SCALE,
    IMAGE_PREVIEW_MAX_SCALE,
  );
}

export function zoomImageScale(scale: number, delta: number): number {
  return clampImageScale(scale + delta);
}

export function wheelImageScale(scale: number, direction: number): number {
  const factor = direction < 0 ? IMAGE_PREVIEW_WHEEL_FACTOR : 1 / IMAGE_PREVIEW_WHEEL_FACTOR;
  return clampImageScale(scale * factor);
}

export function rotateImage(rotation: number, delta: number): number {
  return rotation + delta;
}

/**
 * Angle a turning picture should reach so it lands upright by the shortest turn.
 *
 * Rotations accumulate, so five left turns leave a picture at 450 degrees;
 * flying it back to 0 would spin it a full extra turn. Aiming at the nearest
 * multiple of 360 keeps the return short. A perfect half turn is equally far
 * either way, so it always unwinds backwards.
 */
export function unwindRotation(rotation: number): number {
  const turn = ((rotation % 360) + 360) % 360;
  if (turn === 0) {
    return rotation;
  }
  if (turn < 180) {
    return rotation - turn;
  }
  if (turn > 180) {
    return rotation + (360 - turn);
  }
  return rotation - 180;
}

/** Rotation a reset returns to: the nearest upright quarter turn. */
export function uprightRotation(rotation: number): number {
  const turns = Math.round(rotation / 360) * 360;
  // A negative angle near zero rounds to -0, which is not 0 to a comparison.
  return turns === 0 ? 0 : turns;
}

export function isImageTransformed(view: ImagePreviewView): boolean {
  return (
    view.scale !== IMAGE_PREVIEW_FIT ||
    Math.round(view.rotation) % 360 !== 0 ||
    view.x !== 0 ||
    view.y !== 0
  );
}

/** Height the overlay's own chrome takes out of the viewport. */
export function previewChrome(viewportWidth: number): number {
  return viewportWidth <= 640 ? 120 : 148;
}

/**
 * A quarter turn swaps the picture's axes, so it may no longer fit in a wide
 * window. The rotor carries this factor; the user's own zoom is applied on top
 * of it so that resetting the view does not undo the fit.
 */
export function rotationFitScale(
  rotation: number,
  image: ImagePreviewSize,
  viewport: ImagePreviewSize,
  chrome: number,
): number {
  // Half turns keep the axes where they were; only quarter turns swap them.
  if (Math.abs(rotation % 180) < 1e-6) {
    return 1;
  }
  if (!image.width || !image.height || !viewport.width || !viewport.height) {
    return 1;
  }
  const maxWidth = Math.max(160, viewport.width - 48);
  const maxHeight = Math.max(120, viewport.height - chrome);
  return Math.min(1, maxWidth / image.height, maxHeight / image.width);
}

/** `104%`, as shown next to the zoom buttons. */
export function scaleLabel(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}
