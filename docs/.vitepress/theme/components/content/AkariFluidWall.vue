<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from "vue";

import {
  buildFluidRibbons,
  FLUID_FALLBACK_TOKENS,
  FLUID_TEXTURE_SIZES,
  FLUID_TEXTURE_WEIGHTS,
  fluidCurtain,
  fluidLoopOffsets,
  fluidNumber,
  fluidPalette,
  fluidRenderSize,
  fluidTextureTone,
  resolveFluid,
  ribbonBandPath,
  ribbonLacePath,
  ribbonScallopAmplitude,
  ribbonScallopPath,
  type FluidPalette,
  type FluidRgb,
  type FluidScheme,
  type FluidRibbon,
  type FluidTexture,
  type FluidTokens,
} from "../../fluid";
import {
  createVine3d,
  normalizeVineSeed,
  readVinePopout,
  readVineSeed,
  VINE_POPOUT_EVENT,
  VINE_MAX_RIPPLES,
  VINE_RIPPLE_RINGS,
  VINE_RIPPLE_SPEED,
  VINE_SEED_EVENT,
  type Vine3dController,
  VINE_MAX_KEEP,
} from "../../vine3d";
import { VINE_POP_ALL, vinePopBleed, type VineRect } from "../../vinePlan";

/** Every overlay except the empty one, which is drawn by nothing at all. */
type OverlayKind = Exclude<FluidTexture, "none">;

const props = withDefaults(
  defineProps<{
    /** Height of the wall, as any CSS length. */
    height?: string;
    /** Which end of the wall the virtual light sits at. */
    light?: "start" | "center" | "end";
    /**
     * The shape of the wall. Each variant is a starting point: the props below
     * override whatever it sets, so `silk` with another `scale` is still silk.
     */
    variant?: string;
    /** Multiplies the speed of the flow; 1 is the variant's own drift. */
    speed?: number | string;
    /** How large a slice of the noise field is shown; larger means finer folds. */
    scale?: number | string;
    /** How hard the curl term drags the field; 0 is a plain, undirected flow. */
    curl?: number | string;
    /** 0 is the designed contrast, 1 washes the wall out into its surface. */
    tone?: number | string;
    /** How far the warped noise drags the field; lower is softer and quieter. */
    warp?: number | string;
    /** Cell of the grid laid over the flow, in px; 0 draws no grid. */
    grid?: number | string;
    /** Strength of the soft light that follows the pointer; 0 turns it off. */
    glow?: number | string;
    /**
     * How far the folds curl into petal arms; 0 keeps the plain flow, 1 is the
     * strongest the blossoms get before they read as a drawn flower.
     */
    petal?: number | string;
    /** Overlay drawn above the flow. */
    texture?: string;
    /** Cell of that overlay, in px. */
    textureSize?: number | string;
    /** Density multiplier of generated texture units; lower values are sparser. */
    textureDensity?: number | string;
    /** Alpha of the overlay, 0..1; the variant picks a starting value. */
    textureOpacity?: number | string;
    /** Whether the overlay is drawn as ink or as light; `auto` follows the scheme. */
    textureTone?: "auto" | "ink" | "light";
    /** Where the slotted content sits across the wall. */
    placement?: "start" | "center" | "end";
    /**
     * Lets a few vine shoots grow out past the wall's edge (出屏). `auto`
     * follows the switch in `<VineSeedControl>`, which every wall shares.
     */
    popout?: boolean | "auto";
    /**
     * 出屏 inward as well: a few shoots come up through the wall inside it and
     * arch toward the viewer. `auto` goes along with `popout`.
     */
    inward?: boolean | "auto";
    /**
     * 安全区, the parts of the wall the vines keep clear of. `auto` keeps clear
     * of whatever is written on the wall; `none` (or `false`) lets them grow
     * anywhere. A string lists rects as CSS insets from the wall's edges
     * (`top right bottom left`, px or %), separated by commas, and may name
     * `auto` among them: `"auto, 0 0 70% 60%"`.
     */
    safeZone?: boolean | string | readonly string[];
  }>(),
  {
    height: "clamp(220px, 34vh, 380px)",
    light: "end",
    variant: "silk",
    speed: undefined,
    scale: undefined,
    curl: undefined,
    tone: undefined,
    warp: undefined,
    grid: undefined,
    glow: undefined,
    petal: undefined,
    texture: undefined,
    textureSize: undefined,
    textureDensity: undefined,
    textureOpacity: undefined,
    textureTone: "auto",
    placement: "start",
    popout: "auto",
    inward: "auto",
    safeZone: "auto",
  },
);

const slots = useSlots();
const hasContent = computed(() => Boolean(slots.default || slots.top || slots.bottom));

/** What the wall actually runs with: the variant's table, then this tag. */
const spec = computed(() =>
  resolveFluid(props.variant, {
    scale: props.scale,
    curl: props.curl,
    tone: props.tone,
    warp: props.warp,
    grid: props.grid,
    glow: props.glow,
    speed: props.speed,
    petal: props.petal,
    texture: props.texture,
    textureOpacity: props.textureOpacity,
  }),
);
/** The grid keeps whole pixels, so its lines stay one device pixel sharp. */
const gridSize = computed(() => Math.round(spec.value.grid));
/** The overlay the wall draws, once the variant and the tag are merged. */
const overlay = computed(() => spec.value.texture);
const overlayKind = computed<OverlayKind>(() =>
  overlay.value === "none" ? "sakura" : overlay.value,
);
/** The overlay follows the variant unless the tag says otherwise. */
const textureOpacity = computed(() =>
  fluidNumber(props.textureOpacity, 0, 1, spec.value.textureOpacity),
);
const textureSize = computed(() =>
  Math.round(fluidNumber(props.textureSize, 80, 640, FLUID_TEXTURE_SIZES[overlay.value])),
);
const textureDensity = computed(() =>
  fluidNumber(props.textureDensity, 0, 3, overlay.value === "sakura" ? 0.55 : 1),
);
/** Denser overlays need less alpha than sparse ones to read at the same weight. */
const textureAlpha = computed(
  () => textureOpacity.value * FLUID_TEXTURE_WEIGHTS[overlay.value],
);
const scheme = ref<FluidScheme>("light");
const textureTone = computed(() => fluidTextureTone(props.textureTone, scheme.value));

const wall = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const vineCanvas = ref<HTMLCanvasElement | null>(null);
const vineGhost = ref<HTMLCanvasElement | null>(null);
const litGrid = ref<HTMLElement | null>(null);
const litTexture = ref<HTMLElement | null>(null);
const litRibbons = ref<SVGElement | null>(null);
const ribbonSvg = ref<SVGElement | null>(null);
/** Set once a frame has been drawn, so the card is never shown empty. */
const painted = ref(false);

/** Shape fragments used by the generated overlays. */
const LEAF_PATH =
  "M0 0 C -7 -10 -11 -24 -9 -35 C -8 -44 -3 -47 0 -43 C 3 -47 8 -44 9 -35 C 11 -24 7 -10 0 0 Z";

const PETAL_PATH =
  "M0 -6 C -13 -14 -20 -30 -15 -40 C -11 -47 -4 -46 0 -39 C 4 -46 11 -47 15 -40 C 20 -30 13 -14 0 -6 Z";

/**
 * One texture tile, painted as a mask. Every motif belongs to a cell of a
 * grid anchored at the wall's centre and is drawn from that cell's own hash,
 * so the layout does not depend on the wall's size: a resize only reveals or
 * crops at the edges. Crowding is settled per cell as well (Matérn III): a
 * motif survives unless a surviving neighbour of higher rank covers it.
 */
type TextureCandidate = {
  x: number;
  y: number;
  radius: number;
};

type TextureCell = TextureCandidate & {
  rank: number;
  random: () => number;
};

function textureRandom(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = Math.imul(state ^ (state >>> 16), 0x21f0aaad);
    state = Math.imul(state ^ (state >>> 15), 0x735a2d97);
    state ^= state >>> 15;
    return (state >>> 0) / 0x100000000;
  };
}

function textureCellHash(seed: number, column: number, row: number): number {
  let hash = Math.imul(seed ^ column, 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13) ^ row, 0xc2b2ae35);
  return (hash ^ (hash >>> 16)) >>> 0;
}

function textureOverlapRatio(first: TextureCandidate, second: TextureCandidate): number {
  const distance = Math.hypot(first.x - second.x, first.y - second.y);
  const firstRadius = first.radius;
  const secondRadius = second.radius;
  if (distance >= firstRadius + secondRadius) return 0;
  if (distance <= Math.abs(firstRadius - secondRadius)) return 1;
  const firstAngle = Math.acos(
    Math.min(
      1,
      Math.max(-1, (distance ** 2 + firstRadius ** 2 - secondRadius ** 2) / (2 * distance * firstRadius)),
    ),
  );
  const secondAngle = Math.acos(
    Math.min(
      1,
      Math.max(-1, (distance ** 2 + secondRadius ** 2 - firstRadius ** 2) / (2 * distance * secondRadius)),
    ),
  );
  const triangle = Math.sqrt(
    Math.max(
      0,
      (-distance + firstRadius + secondRadius) *
        (distance + firstRadius - secondRadius) *
        (distance - firstRadius + secondRadius) *
        (distance + firstRadius + secondRadius),
    ),
  );
  const intersection = firstRadius ** 2 * firstAngle + secondRadius ** 2 * secondAngle - triangle / 2;
  return Math.min(1, intersection / (Math.PI * Math.min(firstRadius, secondRadius) ** 2));
}

function textureClash(first: TextureCandidate, second: TextureCandidate): boolean {
  const distance = Math.hypot(first.x - second.x, first.y - second.y);
  return distance < (first.radius + second.radius) * 0.68 || textureOverlapRatio(first, second) > 0.8;
}

/**
 * Motifs whose footprint touches the `width` x `height` window centred on
 * the origin. `spacing` is the cell pitch, `reach` the largest radius.
 */
function scatterTexture(
  seed: number,
  width: number,
  height: number,
  spacing: number,
  reach: number,
  radius: (random: () => number) => number,
): TextureCell[] {
  const cells = new Map<string, TextureCell>();
  const cell = (column: number, row: number): TextureCell => {
    const key = `${column},${row}`;
    let found = cells.get(key);
    if (!found) {
      const random = textureRandom(textureCellHash(seed, column, row));
      const x = (column + random()) * spacing;
      const y = (row + random()) * spacing;
      const rank = random();
      found = { x, y, rank, radius: radius(random), random };
      cells.set(key, found);
    }
    return found;
  };
  const range = Math.ceil((reach * 2) / spacing);
  const alive = new Map<string, boolean>();
  const survives = (column: number, row: number): boolean => {
    const key = `${column},${row}`;
    const known = alive.get(key);
    if (known !== undefined) return known;
    const self = cell(column, row);
    let result = true;
    for (let dx = -range; dx <= range && result; dx += 1) {
      for (let dy = -range; dy <= range; dy += 1) {
        if (!dx && !dy) continue;
        const other = cell(column + dx, row + dy);
        // Only higher ranks can remove a motif, so this recursion climbs and ends.
        if (other.rank > self.rank && textureClash(self, other) && survives(column + dx, row + dy)) {
          result = false;
          break;
        }
      }
    }
    alive.set(key, result);
    return result;
  };
  const kept: TextureCell[] = [];
  const left = Math.floor((-width / 2 - reach) / spacing);
  const right = Math.floor((width / 2 + reach) / spacing);
  const top = Math.floor((-height / 2 - reach) / spacing);
  const bottom = Math.floor((height / 2 + reach) / spacing);
  for (let row = top; row <= bottom; row += 1) {
    for (let column = left; column <= right; column += 1) {
      const found = cell(column, row);
      if (Math.abs(found.x) > width / 2 + found.radius || Math.abs(found.y) > height / 2 + found.radius) continue;
      if (survives(column, row)) kept.push(found);
    }
  }
  return kept;
}

/** Tiles are drawn over a frame rounded up to this step, so most resizes reuse them. */
const TEXTURE_FRAME_STEP = 256;

function textureFrameSize(size: number): number {
  return Math.ceil(Math.max(1, size) / TEXTURE_FRAME_STEP) * TEXTURE_FRAME_STEP;
}

/**
 * Motifs per `cellSize` square at density 1, and how much denser the hashed
 * grid has to be for that many to survive the crowding test.
 */
const TEXTURE_COUNTS = {
  sakura: { count: 9, fill: 1.05 },
  petals: { count: 13, fill: 1.2 },
  stars: { count: 15, fill: 1 },
} as const;

function textureTile(
  kind: OverlayKind,
  filled: boolean,
  seed: number,
  frameWidth: number,
  frameHeight: number,
  cellSize: number,
  density: number,
): string {
  const width = Math.max(1, frameWidth || 320);
  const height = Math.max(1, frameHeight || 320);
  const scale = Math.max(0.2, cellSize / 320);
  const paint = filled
    ? 'fill="#000" stroke="#000" stroke-width="1.1"'
    : 'fill="none" stroke="#000" stroke-width="2.3" stroke-linejoin="round"';
  const blossomPaint = 'fill="#000" fill-opacity="0.3" stroke="#000" stroke-width="1.1"';
  const petal = (turn: number, scale: number, path = PETAL_PATH) =>
    `<path d="${path}" transform="rotate(${turn.toFixed(1)}) scale(${scale.toFixed(3)})" ${paint}/>`;
  const blossomPetal = (turn: number, scale: number) =>
    `<path d="${PETAL_PATH}" transform="rotate(${turn}) scale(${scale.toFixed(3)})" ${blossomPaint}/>`;
  const leaf = (turn: number, scale: number) => petal(turn, scale, LEAF_PATH);
  const blossom = (x: number, y: number, r: number, turn: number) =>
    `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${turn.toFixed(1)})">${[0, 72, 144, 216, 288]
      .map((rotation) => blossomPetal(rotation, r / 44))
      .join("")}<circle cx="0" cy="0" r="${(r * 0.09).toFixed(1)}" ${blossomPaint}/></g>`;
  const sparkle = (x: number, y: number, r: number) =>
    `<path d="M0 ${(-r).toFixed(2)} Q 1.2 -1.2 ${r.toFixed(2)} 0 Q 1.2 1.2 0 ${r.toFixed(2)} Q -1.2 1.2 ${(-r).toFixed(2)} 0 Q -1.2 -1.2 0 ${(-r).toFixed(2)} Z" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" fill="#000"/>`;
  const dot = (x: number, y: number, r: number) =>
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#000"/>`;
  if (kind === "lace" || kind === "vine") return "";

  let kindSeed = 0;
  for (const character of kind) kindSeed = (kindSeed * 31 + character.charCodeAt(0)) >>> 0;
  const centreX = width / 2;
  const centreY = height / 2;
  let body = "";
  if (kind === "sakura" || kind === "petals" || kind === "stars") {
    if (density <= 0) return "";
    const { count, fill } = TEXTURE_COUNTS[kind];
    const spacing = cellSize / Math.sqrt(count * density * fill);
    const leafScale = (random: () => number) => (0.24 + random() * 0.5) * 1.45 * scale;
    const sizes = {
      sakura: { radius: (random: () => number) => (14 + random() * 30) * scale, reach: 44 * scale },
      petals: { radius: (random: () => number) => 47 * leafScale(random), reach: 47 * 0.74 * 1.45 * scale },
      stars: { radius: (random: () => number) => (4 + random() * 16) * scale, reach: 20 * scale },
    }[kind];
    const cells = scatterTexture(seed ^ kindSeed, width, height, spacing, sizes.reach, sizes.radius);
    body = cells
      .map(({ x, y, radius, random }) => {
        const px = x + centreX;
        const py = y + centreY;
        if (kind === "sakura") return blossom(px, py, radius, random() * 360);
        if (kind === "petals") {
          return `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)})">${leaf(random() * 360, radius / 47)}</g>`;
        }
        return sparkle(px, py, radius);
      })
      .join("");
  } else {
    const columnSpacing = Math.max(12, 40 * scale);
    const rowSpacing = Math.max(14, 46 * scale);
    const radius = Math.max(1, 2.2 * scale);
    const rows = Math.ceil(height / 2 / rowSpacing) + 1;
    const columns = Math.ceil(width / 2 / columnSpacing) + 1;
    const dots: string[] = [];
    for (let row = -rows; row <= rows; row += 1) {
      const shift = (Math.abs(row) % 2) * 0.5;
      for (let column = -columns; column <= columns; column += 1) {
        dots.push(dot(centreX + (column + shift) * columnSpacing, centreY + row * rowSpacing, radius));
      }
    }
    body = dots.join("");
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Gradient ids must be unique per wall, since several can share a page. */
let ribbonCounter = 0;
const uid = ++ribbonCounter;

/** Wall size in CSS px, used to lay the ribbons out edge to edge. */
const ribbonSize = ref({ width: 0, height: 0 });
/** The wall size the lace was picked for; a resize stretches it until it passes the stretch limit. */
const ribbonLayout = ref({ width: 0, height: 0 });
/** Redrawn per mount: the crossings should not repeat between visits. */
const ribbonSeed = Math.floor(Math.random() * 0x7fffffff) || 1;
const vineSeed = ref(readVineSeed());
const vinePopoutSwitch = ref(readVinePopout());
/** Edges a 出屏 shoot may leave by, as `1 << edge` bits; 0 keeps the vines inside. */
const vinePopEdges = ref(0);
const vineBleed = ref({ left: 0, top: 0, right: 0, bottom: 0 });
const vinePopout = computed(() =>
  props.popout === "auto" ? vinePopoutSwitch.value : props.popout !== false,
);
const vineInward = computed(() => (props.inward === "auto" ? vinePopout.value : props.inward !== false));
/** The safe zone the vines were planned around, in plan px about the centre (y up). */
let vinePlannedKeep: VineRect[] = [];
const vineCanvasStyle = computed(() => {
  const { left, top, right, bottom } = vineBleed.value;
  if (left + top + right + bottom <= 0) return undefined;
  return {
    left: `${-left}px`,
    top: `${-top}px`,
    width: `calc(100% + ${left + right}px)`,
    height: `calc(100% + ${top + bottom}px)`,
  };
});

const ribbons = computed<FluidRibbon[]>(() =>
  overlay.value === "lace" && ribbonSize.value.width > 0
    ? buildFluidRibbons(ribbonSize.value.width, ribbonSize.value.height, ribbonSeed, 6, ribbonLayout.value)
    : [],
);

function ribbonOccluders(ribbon: FluidRibbon): FluidRibbon[] {
  return ribbons.value.filter((other) => other.layer > ribbon.layer);
}

/**
 * Which edges have room for 出屏 shoots. A canvas that reached past the side
 * of the viewport would make the page scroll sideways, so those stay shut.
 */
function measureVinePopEdges(): number {
  const element = wall.value;
  if (!vinePopout.value || overlay.value !== "vine" || !element) return 0;
  const rect = element.getBoundingClientRect();
  const reach = vinePopBleed(rect.width, rect.height);
  const viewport = document.documentElement.clientWidth;
  let edges = VINE_POP_ALL;
  if (rect.left - reach < 0) edges &= ~0b0001;
  if (rect.right + reach > viewport) edges &= ~0b0100;
  return edges;
}

/** Room left around what is written on the wall, px. */
const VINE_KEEP_PAD = 12;
/** How far the written content may outgrow the zone it was planned around before the vines are re-planned, px. */
const VINE_KEEP_SLACK = 16;

/** One CSS inset (`top right bottom left`, px or %) as a rect in wall px about the centre, y up. */
function vineInsetRect(inset: string, width: number, height: number): VineRect | null {
  const parts = inset.trim().split(/\s+/);
  if (!parts[0] || parts.length > 4) return null;
  const [top, right = top, bottom = top, left = right] = parts;
  const length = (value: string, span: number): number => {
    const match = /^(-?\d*\.?\d+)(px|%)?$/.exec(value);
    if (!match) return Number.NaN;
    return match[2] === "%" ? (Number(match[1]) / 100) * span : Number(match[1]);
  };
  const insets = [length(top, height), length(right, width), length(bottom, height), length(left, width)];
  if (insets.some((value) => !Number.isFinite(value))) return null;
  const rect = {
    x0: insets[3]! - width / 2,
    x1: width / 2 - insets[1]!,
    y0: insets[2]! - height / 2,
    y1: height / 2 - insets[0]!,
  };
  return rect.x1 > rect.x0 && rect.y1 > rect.y0 ? rect : null;
}

/** The text and controls written on the wall, each as a tight rect padded by `VINE_KEEP_PAD`. */
function measureVineContent(frame: DOMRect): VineRect[] {
  const centreX = frame.left + frame.width / 2;
  const centreY = frame.top + frame.height / 2;
  const rects: VineRect[] = [];
  const range = document.createRange();
  for (const block of wall.value?.querySelectorAll<HTMLElement>(".akari-fluid-wall__block") ?? []) {
    const parts = block.children.length ? Array.from(block.children) : [block];
    for (const part of parts) {
      // The range hugs the text, where the element box would take the whole measure.
      range.selectNodeContents(part);
      let box: DOMRect = range.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) box = part.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) continue;
      rects.push({
        x0: box.left - VINE_KEEP_PAD - centreX,
        x1: box.right + VINE_KEEP_PAD - centreX,
        y0: centreY - box.bottom - VINE_KEEP_PAD,
        y1: centreY - box.top + VINE_KEEP_PAD,
      });
    }
  }
  range.detach();
  return rects;
}

function unionRect(a: VineRect, b: VineRect): VineRect {
  return { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) };
}

function rectArea(rect: VineRect): number {
  return (rect.x1 - rect.x0) * (rect.y1 - rect.y0);
}

/** Merges rects that touch, then the cheapest pairs, until the shader can take them all. */
function mergeVineKeep(input: VineRect[]): VineRect[] {
  const rects = input.slice();
  for (;;) {
    let best: [number, number] | null = null;
    let bestCost = Infinity;
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i]!;
        const b = rects[j]!;
        const touching = a.x0 <= b.x1 && b.x0 <= a.x1 && a.y0 <= b.y1 && b.y0 <= a.y1;
        const cost = touching ? -1 : rectArea(unionRect(a, b)) - rectArea(a) - rectArea(b);
        if (cost < bestCost) {
          bestCost = cost;
          best = [i, j];
        }
      }
    }
    if (!best || (bestCost >= 0 && rects.length <= VINE_MAX_KEEP)) return rects;
    const [i, j] = best;
    rects[i] = unionRect(rects[i]!, rects[j]!);
    rects.splice(j, 1);
  }
}

/** The safe zone as the wall is laid out now, in wall px about its centre (y up). */
function measureVineKeep(): VineRect[] {
  const option = props.safeZone;
  const frame = canvas.value?.getBoundingClientRect();
  if (option === false || option === "none" || !frame || frame.width < 1 || frame.height < 1) return [];
  const entries =
    option === true || option === undefined
      ? ["auto"]
      : typeof option === "string"
        ? option.split(",")
        : option;
  const rects: VineRect[] = [];
  for (const entry of entries) {
    if (entry.trim() === "auto") rects.push(...measureVineContent(frame));
    else {
      const rect = vineInsetRect(entry, frame.width, frame.height);
      if (rect) rects.push(rect);
    }
  }
  return mergeVineKeep(rects);
}

function scaleVineKeep(rects: readonly VineRect[], sx: number, sy: number): VineRect[] {
  return rects.map((rect) => ({ x0: rect.x0 * sx, x1: rect.x1 * sx, y0: rect.y0 * sy, y1: rect.y1 * sy }));
}

/**
 * Hands the wall's safe zone to the vines as it is now. Vines that end up
 * inside it fade out; once the content has outgrown the zone they were
 * planned around, the wall gets a fresh plan around the new one.
 */
function syncVineKeep(): boolean {
  if (!vineScene) return false;
  const keep = measureVineKeep();
  vineScene.setKeep(keep);
  const { width, height } = ribbonSize.value;
  if (!(width > 0 && height > 0)) return false;
  const planned = scaleVineKeep(keep, vineScene.planWidth / width, vineScene.planHeight / height);
  return planned.some(
    (rect) =>
      !vinePlannedKeep.some(
        (zone) =>
          rect.x0 >= zone.x0 - VINE_KEEP_SLACK &&
          rect.x1 <= zone.x1 + VINE_KEEP_SLACK &&
          rect.y0 >= zone.y0 - VINE_KEEP_SLACK &&
          rect.y1 <= zone.y1 + VINE_KEEP_SLACK,
      ),
  );
}

let vineKeepDrifted = false;

/** Re-measures the safe zone after the written content has moved. */
function checkVineKeep(): void {
  if (!vineScene) return;
  vineKeepDrifted = syncVineKeep();
  if (vineKeepDrifted) scheduleVineReplan();
  if (!frame) draw();
}

/**
 * Re-plans when the wall has moved into or out of room for its shoots. Styles
 * and fonts can still be settling when the wall mounts, so this runs on any
 * layout change that could move it, not only on a window resize.
 */
function checkVinePopEdges(): void {
  const edges = measureVinePopEdges();
  if (edges === vinePopEdges.value) return;
  // Shoots are planned after the wall, so planning at the same size keeps
  // every vine that was already there in place.
  rebuildVineScene(currentVinePlan());
  if (!frame) draw();
}

function vineNeedsReplan(): boolean {
  return vineStretched() || vineKeepDrifted;
}

/**
 * A resize stretches the vines and the lace that are already laid out (see
 * `createVine3d` and `buildFluidRibbons`), so dragging a window edge moves
 * them smoothly instead of redrawing the wall every frame. Only once the size
 * has settled this far from the planned one does the wall get a fresh layout,
 * faded in over the old one.
 */
const STRETCH_LIMIT = Math.log(1.3);
const REPLAN_DELAY = 260;
const REPLAN_FADE_MS = 520;
let vineReplanTimer = 0;
let vineFade = 0;

function vineStretched(): boolean {
  return vineScene !== null && stretchedFrom({ width: vineScene.planWidth, height: vineScene.planHeight });
}

function stretchedFrom(plan: { width: number; height: number }): boolean {
  const { width, height } = ribbonSize.value;
  return (
    !(plan.width > 0 && plan.height > 0) ||
    Math.abs(Math.log(width / plan.width)) > STRETCH_LIMIT ||
    Math.abs(Math.log(height / plan.height)) > STRETCH_LIMIT
  );
}

let laceReplanTimer = 0;

function cancelLaceReplan(): void {
  if (laceReplanTimer) window.clearTimeout(laceReplanTimer);
  laceReplanTimer = 0;
}

/**
 * The shader field's frame, in CSS pixels: the field point at the wall's middle
 * and the height one field unit spans. It is taken from the first size the wall
 * settles at and then held, so resizing crops or reveals the field about the
 * middle. Only a height change past the stretch limit re-fits the span, and it
 * eases there (geometrically, so the zoom reads as even) instead of jumping.
 */
const field = { centre: 0.5, span: 0, from: 0, to: 0, since: 0 };
let fieldReplanTimer = 0;

function cancelFieldReplan(): void {
  if (fieldReplanTimer) window.clearTimeout(fieldReplanTimer);
  fieldReplanTimer = 0;
}

function fieldStretched(height: number): boolean {
  return !(field.to > 0) || Math.abs(Math.log(height / field.to)) > STRETCH_LIMIT;
}

/** The span to draw with at `now`, advancing the ease when one is running. */
function fieldSpanAt(now: number): number {
  if (!field.since) return field.span;
  const t = Math.min(1, (now - field.since) / REPLAN_FADE_MS);
  const eased = 1 - (1 - t) ** 3;
  field.span = field.from * (field.to / field.from) ** eased;
  if (t >= 1) {
    field.span = field.to;
    field.since = 0;
  }
  return field.span;
}

function scheduleFieldReplan(): void {
  cancelFieldReplan();
  fieldReplanTimer = window.setTimeout(() => {
    fieldReplanTimer = 0;
    const height = ribbonSize.value.height;
    if (!(height > 0) || !fieldStretched(height)) return;
    field.from = fieldSpanAt(performance.now());
    field.to = height;
    if (reduced || !frame) {
      field.span = height;
      field.since = 0;
      draw();
    } else {
      field.since = performance.now();
    }
  }, REPLAN_DELAY);
}

/** Re-picks the lace for the settled size and fades the new ribbons in. */
function scheduleLaceReplan(): void {
  cancelLaceReplan();
  laceReplanTimer = window.setTimeout(() => {
    laceReplanTimer = 0;
    if (!stretchedFrom(ribbonLayout.value)) return;
    ribbonLayout.value = { ...ribbonSize.value };
    if (reduced || overlay.value !== "lace") return;
    void nextTick(() => {
      for (const svg of [ribbonSvg.value, litRibbons.value]) {
        if (!svg) continue;
        const opacity = getComputedStyle(svg).opacity;
        svg.animate([{ opacity: 0 }, { opacity }], {
          duration: REPLAN_FADE_MS,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
        });
      }
    });
  }, REPLAN_DELAY);
}

function cancelVineReplan(): void {
  if (vineReplanTimer) window.clearTimeout(vineReplanTimer);
  vineReplanTimer = 0;
}

function scheduleVineReplan(): void {
  cancelVineReplan();
  vineReplanTimer = window.setTimeout(() => {
    vineReplanTimer = 0;
    if (vineNeedsReplan()) replanVineScene();
  }, REPLAN_DELAY);
}

/** Copies the old vines into the ghost canvas and fades them out under the new plan. */
function replanVineScene(): void {
  const element = vineCanvas.value;
  const ghost = vineGhost.value;
  const context2d = !reduced && element && ghost && vineScene ? ghost.getContext("2d") : null;
  if (element && ghost && context2d && vineScene) {
    const { left, top, right, bottom } = vineScene.bleed;
    ghost.width = element.width;
    ghost.height = element.height;
    Object.assign(ghost.style, {
      left: `${-left}px`,
      top: `${-top}px`,
      width: `calc(100% + ${left + right}px)`,
      height: `calc(100% + ${top + bottom}px)`,
    });
    // Without preserveDrawingBuffer the frame is only readable in the task that drew it.
    vineScene.render();
    context2d.drawImage(element, 0, 0);
    const fade = ++vineFade;
    const timing = { duration: REPLAN_FADE_MS, easing: "cubic-bezier(0.2, 0, 0, 1)" };
    ghost.animate([{ opacity: 1 }, { opacity: 0 }], timing).finished.then(
      () => {
        if (fade !== vineFade) return;
        ghost.width = 0;
        ghost.height = 0;
      },
      () => undefined,
    );
    rebuildVineScene();
    element.animate([{ opacity: 0 }, { opacity: 1 }], timing);
  } else {
    rebuildVineScene();
  }
  if (!frame) draw();
}

/**
 * The size and safe zone the wall's vines are planned around now, for a
 * rebuild that only adds or drops 出屏 shoots: the base wall comes out the
 * same only if it is planned the same.
 */
function currentVinePlan(): VinePlanSize | undefined {
  if (!vineScene) return undefined;
  return {
    width: vineScene.planWidth,
    height: vineScene.planHeight,
    keep: vineKeepDrifted ? undefined : vinePlannedKeep,
  };
}

interface VinePlanSize {
  width: number;
  height: number;
  /** Safe zone in plan px; measured afresh when left out. */
  keep?: readonly VineRect[];
}

function rebuildVineScene(plan?: VinePlanSize): void {
  cancelVineReplan();
  vineScene?.dispose();
  vineScene = null;
  vinePopEdges.value = measureVinePopEdges();
  vineBleed.value = { left: 0, top: 0, right: 0, bottom: 0 };
  const { width, height } = ribbonSize.value;
  if (overlay.value !== "vine" || textureOpacity.value <= 0 || !vineCanvas.value || width < 1 || height < 1) {
    return;
  }
  const planWidth = plan?.width ?? width;
  const planHeight = plan?.height ?? height;
  const keep = measureVineKeep();
  vinePlannedKeep = plan?.keep ? [...plan.keep] : scaleVineKeep(keep, planWidth / width, planHeight / height);
  vineKeepDrifted = false;
  vineScene = createVine3d(
    vineCanvas.value,
    planWidth,
    planHeight,
    vineSeed.value,
    textureDensity.value,
    readTokens(scheme.value).onSurface,
    textureOpacity.value,
    {
      popout: vinePopEdges.value,
      inward: vineInward.value,
      keep: vinePlannedKeep,
      radius: wall.value ? Number.parseFloat(getComputedStyle(wall.value).borderTopLeftRadius) || 0 : 0,
    },
  );
  if (planWidth !== width || planHeight !== height || plan?.keep) {
    vineScene.resize(width, height);
    vineScene.setKeep(keep);
  }
  vineBleed.value = { ...vineScene.bleed };
  if (vineStretched()) scheduleVineReplan();
}

function ribbonPath(ribbon: FluidRibbon): string {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = ribbon.curve;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} C${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} ${x3.toFixed(1)} ${y3.toFixed(1)}`;
}

function onVineSeedChange(event: Event): void {
  vineSeed.value = normalizeVineSeed((event as CustomEvent<unknown>).detail);
}

function onVinePopoutChange(event: Event): void {
  vinePopoutSwitch.value = Boolean((event as CustomEvent<unknown>).detail);
}

/** The tile's own size; it is centred on the wall, so it only changes by whole steps. */
const textureFrameWidth = computed(() => textureFrameSize(ribbonSize.value.width));
const textureFrameHeight = computed(() => textureFrameSize(ribbonSize.value.height));
const textureMask = computed(() =>
  textureTile(
    overlayKind.value,
    textureTone.value === "light",
    ribbonSeed,
    textureFrameWidth.value,
    textureFrameHeight.value,
    textureSize.value,
    textureDensity.value,
  ),
);

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/** How far, in CSS px, the silk is pushed along a ripple's rings at their crest. */
const WALL_RIPPLE_SHIFT = 16;

/**
 * The flow itself: two levels of warped noise, a curl term that drags the
 * grain along with it, and one swirl that decides where the warm end of the
 * ramp lands. The palette arrives as uniforms, so a theme change repaints the
 * same field instead of rebuilding the program.
 */
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_grain_resolution;
uniform vec2 u_loops[4];
uniform vec3 u_c1, u_c2, u_c3, u_c4, u_c5;
uniform vec3 u_core, u_halo, u_spark;
uniform vec2 u_light_pos, u_cursor;
uniform float u_light_core, u_light_halo;
uniform float u_vignette, u_grain;
uniform float u_bloom_threshold, u_bloom_range, u_bloom_strength;
uniform float u_glow, u_petal, u_petal_light, u_petal_ink;
uniform float u_sparkle, u_time, u_scale, u_curl, u_warp;
uniform vec2 u_offset;
uniform vec2 u_stretch;
// The field is laid out in CSS pixels about the wall's centre: u_span is the
// height one field unit covers, u_centre the field point at the middle of the
// wall. Both are fixed when the wall first sizes, so a resize crops or reveals
// the field about its middle instead of rescaling it from a corner.
uniform vec2 u_centre;
uniform float u_span;
uniform float u_mote, u_curtain, u_curtain_amt, u_curtain_gain;
// Where 出屏 vines come up through the wall, in the same CSS px about its
// centre: x, y, radius, phase. The silk ripples there as if it were water.
uniform vec4 u_ripples[${VINE_MAX_RIPPLES}];
uniform int u_ripple_count;
// A dark wall shows the same highlight far brighter, so it gets less of it.
uniform float u_ripple_light;

out vec4 fragColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float amp = 0.6;
  for (int i = 0; i < 1; i++) {
    v += amp * snoise(p);
    p = p * 2.0 + vec3(100.0);
    amp *= 0.4;
  }
  return v;
}

float fluidNoise(vec2 uv) {
  float n1 = fbm(vec3(uv * 0.6, 0.0) + vec3(u_loops[0].y, 0.0, u_loops[0].x));
  float n2 = fbm(vec3(uv * 0.6 + 5.2, 1.3) + vec3(0.0, u_loops[0].y, u_loops[0].x));
  vec2 w1 = vec2(n1, n2) * 0.6 * u_warp;
  float n3 = fbm(vec3((uv + w1) * 0.7 + 1.7, 3.1) + vec3(u_loops[1].y, 0.0, u_loops[1].x));
  float n4 = fbm(vec3((uv + w1) * 0.7 + 9.2, 5.7) + vec3(0.0, u_loops[1].y, u_loops[1].x));
  vec2 w2 = vec2(n3, n4) * 0.5 * u_warp;
  return fbm(vec3((uv + w1 + w2) * 0.5, 0.0) + vec3(u_loops[2].y, 0.0, u_loops[2].x));
}

vec2 curlish(vec2 uv) {
  float eps = 0.02;
  float n = snoise(vec3(uv * 0.8, 0.0) + vec3(0.0, u_loops[2].y, u_loops[2].x));
  float nx = snoise(vec3((uv + vec2(eps, 0.0)) * 0.8, 0.0) + vec3(0.0, u_loops[2].y, u_loops[2].x));
  float ny = snoise(vec3((uv + vec2(0.0, eps)) * 0.8, 0.0) + vec3(0.0, u_loops[2].y, u_loops[2].x));
  return vec2(-(ny - n) / eps, (nx - n) / eps) * 0.003;
}

/*
 * Three loose five-armed swirls. They bend the sampling domain itself, so the
 * creases of the silk curl into petal-like arms instead of having a flower
 * painted over them.
 */
vec2 petalSwirl(vec2 screen, float strength) {
  vec2 total = vec2(0.0);
  for (int i = 0; i < 3; i++) {
    vec2 centre = vec2(0.15 + 0.38 * float(i), 0.54 + 0.13 * sin(float(i) * 2.1));
    vec2 d = screen - centre;
    float r = length(d) + 0.08;
    float a = atan(d.y, d.x);
    float arm = 0.5 + 0.5 * cos(a * 5.0 + r * 2.2 + float(i));
    total += vec2(-d.y, d.x) / r * arm;
  }
  return total * strength;
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 css = (uv - 0.5) * u_grain_resolution;
  // Rings running out from each portal: the field is pushed along them, and
  // their slope lit from the upper left like a water surface.
  float rippleSlope = 0.0;
  float rippleWell = 0.0;
  float rippleCrest = 0.0;
  for (int i = 0; i < ${VINE_MAX_RIPPLES}; i++) {
    if (i >= u_ripple_count) break;
    vec4 ripple = u_ripples[i];
    vec2 from = css - ripple.xy;
    float dist = length(from);
    float x = dist / ripple.z;
    if (x >= 1.0) continue;
    vec2 dir = from / max(dist, 0.001);
    float env = (1.0 - x) * (1.0 - x) * smoothstep(0.0, 0.2, x);
    float phase = 6.2831853 * (x * ${VINE_RIPPLE_RINGS.toFixed(2)} - u_time * ${VINE_RIPPLE_SPEED.toFixed(2)}) + ripple.w;
    css += dir * sin(phase) * env * ${WALL_RIPPLE_SHIFT.toFixed(1)};
    rippleSlope += cos(phase) * env * dot(dir, vec2(-0.55, 0.83));
    rippleWell += 1.0 - smoothstep(0.0, 0.3, x);
    rippleCrest += pow(0.5 + 0.5 * cos(phase), 3.0) * env;
  }
  vec2 field = css / u_span + u_centre;
  vec2 suv = field * u_scale * u_stretch + u_offset;

  vec2 curl = curlish(suv);
  vec2 uvD = suv + curl * u_curl;
  if (u_petal > 0.0) {
    uvD += petalSwirl(field, 0.2 * u_petal) / max(u_scale, 0.4);
  }
  float f = fluidNoise(uvD);
  float swirl = snoise(vec3(uvD * 0.8 + f * 1.5, 0.0) + vec3(u_loops[3].y, 0.0, u_loops[3].x)) * 0.5 + 0.5;
  float n = f * 0.5 + 0.5;

  /*
   * Five-lobed blossoms around a drifting centre, bent by the same noise as the
   * folds. The field is folded into the colour value instead of drawn on top:
   * the masses turn into petal shapes where the silk creases, and vanish into
   * the flow elsewhere, which is the misty look rather than an ornament.
   */
  float petalField = 0.0;
  if (u_petal > 0.0) {
    // A faint swell left where the swirls turn, so the petals also read as a
    // breath of light in the mist rather than only as a change of the folds.
    for (int i = 0; i < 3; i++) {
      vec2 centre = vec2(0.15 + 0.38 * float(i), 0.54 + 0.13 * sin(float(i) * 2.1));
      vec2 pc = (uv - centre) * vec2(aspect, 1.0);
      float pr = length(pc);
      float lobe = 0.5 + 0.5 * cos(atan(pc.y, pc.x) * 5.0 + float(i));
      petalField += smoothstep(mix(0.2, 0.44, lobe) + 0.24, mix(0.2, 0.44, lobe) - 0.16, pr);
    }
    petalField = clamp(petalField * 0.6, 0.0, 1.0);
  }

  // Wide windows: the masses have to run into each other, not sit side by side
  // as patches.
  vec3 col = mix(u_c1, u_c2, smoothstep(0.12, 0.62, n));
  col = mix(col, u_c3, smoothstep(0.24, 0.78, n + swirl * 0.25));
  col = mix(col, u_c4, smoothstep(0.42, 0.95, swirl) * 0.42);
  col = mix(col, u_c5, smoothstep(0.4, 0.9, n * swirl) * 0.28);
  if (u_petal > 0.0) {
    // Faint light inside the blossoms on a dark wall, a faint shade inside them
    // on a pale one: the same shape, read as glow or as depth.
    float bloomShape = smoothstep(0.0, 1.0, petalField);
    col += u_core * bloomShape * u_petal_light * u_petal;
    col = mix(col, u_c3, bloomShape * u_petal_ink * u_petal);
  }

  if (u_curtain_amt > 0.0) {
    // Hanging sheets of light: a band travelling along x, bent by the same
    // noise that shapes the folds, so the edge never reads as a stripe.
    float band = 0.5 + 0.5 * sin(suv.x * 3.1 + u_curtain + (n - 0.5) * 3.4 + suv.y * 0.5);
    // A second, faster comb breaks the first one into strands instead of columns.
    float comb = 0.5 + 0.5 * sin(suv.x * 7.4 - u_curtain * 0.55 + (f - 0.5) * 2.2);
    band = mix(band, comb, 0.4);
    // A pale wall cannot take the same swing as a dark one before it clips.
    col *= mix(1.0, mix(1.0 - u_curtain_gain, 1.0 + u_curtain_gain, band), u_curtain_amt);
  }

  vec2 flow = (uvD - suv) * u_span;

  if (u_grain > 0.0) {
    vec2 grain = floor((css + flow) / 5.0);
    col += (hash(grain) * 2.0 - 1.0) * u_grain;
  }

  if (u_sparkle > 0.0) {
    // A lattice that only shifts by a fraction of a cell with the flow: the
    // motes drift, but stay round instead of smearing along the curl.
    vec2 cell = (css + flow * 0.06) / max(u_mote, 1.0);
    float seed = hash(floor(cell) + 17.3);
    float mote = exp(-dot(fract(cell) - 0.5, fract(cell) - 0.5) * 52.0);
    float twinkle = 0.55 + 0.45 * sin(u_time * 1.4 + seed * 40.0);
    col += u_spark * mote * step(0.992, seed) * twinkle * u_sparkle;
  }

  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  float bloom = smoothstep(u_bloom_threshold - u_bloom_range, u_bloom_threshold + u_bloom_range, luma);
  col += (col * 0.85 + vec3(0.15, 0.145, 0.13)) * bloom * u_bloom_strength;

  float ld = length((uv - u_light_pos) * vec2(min(aspect, 2.0), 1.0));
  col += u_core * exp(-ld * ld * 7.0) * u_light_core;
  col += u_halo * exp(-ld * 2.4) * u_light_halo;

  float vig = 1.0 - smoothstep(0.35, 0.75, length(uv - 0.5));
  // A soft light under the pointer, wide and weak: it lifts the flow without
  // turning into a spotlight. Added before the vignette so corners still sink.
  float gd = length((uv - u_cursor) * vec2(aspect, 1.0));
  float g2 = gd * gd;
  col += u_core * u_glow * exp(-g2 * 3.4) * 0.32;

  // The ripples catch the light on the near side of each ring and along every
  // crest, and the wall dips a little where the vine comes through it.
  col += u_core * u_ripple_light * (max(rippleSlope, 0.0) * 0.1 + rippleCrest * 0.035);
  col *= 1.0 - max(-rippleSlope, 0.0) * 0.05 - min(rippleWell, 1.0) * 0.035;

  col = mix(col * (1.0 - u_vignette), col, vig);

  fragColor = vec4(col, 1.0);
}`;

const UNIFORMS = [
  "u_resolution",
  "u_grain_resolution",
  "u_loops",
  "u_c1",
  "u_c2",
  "u_c3",
  "u_c4",
  "u_c5",
  "u_core",
  "u_halo",
  "u_spark",
  "u_light_pos",
  "u_cursor",
  "u_glow",
  "u_petal",
  "u_petal_light",
  "u_petal_ink",
  "u_light_core",
  "u_light_halo",
  "u_vignette",
  "u_grain",
  "u_bloom_threshold",
  "u_bloom_range",
  "u_bloom_strength",
  "u_sparkle",
  "u_time",
  "u_scale",
  "u_curl",
  "u_warp",
  "u_offset",
  "u_stretch",
  "u_centre",
  "u_span",
  "u_mote",
  "u_curtain",
  "u_curtain_amt",
  "u_curtain_gain",
  "u_ripples",
  "u_ripple_count",
  "u_ripple_light",
] as const;

type UniformName = (typeof UNIFORMS)[number];

/** Tokens the shader's palette is built from. */
const TOKEN_NAMES = [
  "primary",
  "primary-container",
  "secondary",
  "secondary-container",
  "tertiary",
  "tertiary-container",
  "surface-container-lowest",
  "surface-container",
  "on-surface",
] as const;

/** Where the noise field starts inside its tile. */
const FIELD_OFFSET: readonly [number, number] = [-1.0, -0.22];
/** Frames are capped here: the flow reads the same at 30 as at 60. */
const FRAME_INTERVAL = 1000 / 30;
const LIGHT_POSITIONS = { start: 0.2, center: 0.5, end: 0.82 } as const;

let context: WebGL2RenderingContext | null = null;
let program: WebGLProgram | null = null;
let vineScene: Vine3dController | null = null;
let locations = new Map<UniformName, WebGLUniformLocation | null>();
let palette: FluidPalette = fluidPalette(FLUID_FALLBACK_TOKENS.light, "light");
let frame = 0;
let drawnAt = 0;
let elapsed = 0; /* seconds */
/** The pointer drags the field and the light a little, so the wall answers it. */
const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
/** The glow reads this raw position: easing it made the light trail the cursor. */
const cursor = { x: 0.5, y: 0.5 };
/** The pointer light is eased in and out, so the wall never snaps. */
let glow = 0;
let glowTarget = 0;
let probe: HTMLElement | null = null;
let sample: CanvasRenderingContext2D | null = null;
let paintedFrame = false;
let reduced = false;
let onScreen = false;
let refreshFrame = 0;
let themeObserver: MutationObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;
/** Watches the page box, whose changes can slide the wall sideways. */
let pageObserver: ResizeObserver | null = null;
let keepObserver: ResizeObserver | null = null;
let motionQuery: MediaQueryList | null = null;

function compile(type: number, source: string): WebGLShader | null {
  if (!context) return null;
  const shader = context.createShader(type);
  if (!shader) return null;
  context.shaderSource(shader, source);
  context.compileShader(shader);
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    context.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(): boolean {
  if (!context) return false;
  const vertex = compile(context.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(context.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return false;

  const created = context.createProgram();
  if (!created) return false;
  context.attachShader(created, vertex);
  context.attachShader(created, fragment);
  context.linkProgram(created);
  context.deleteShader(vertex);
  context.deleteShader(fragment);
  if (!context.getProgramParameter(created, context.LINK_STATUS)) return false;

  const buffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, buffer);
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    context.STATIC_DRAW,
  );
  const position = context.getAttribLocation(created, "a_position");
  context.enableVertexAttribArray(position);
  context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);

  context.useProgram(created);
  program = created;
  locations = new Map(
    UNIFORMS.map((name) => [name, context!.getUniformLocation(created, name)]),
  );
  return true;
}

function setColor3(name: UniformName, color: FluidRgb): void {
  const location = locations.get(name);
  if (context && location) context.uniform3f(location, color[0], color[1], color[2]);
}

function setFloat(name: UniformName, value: number): void {
  const location = locations.get(name);
  if (context && location) context.uniform1f(location, value);
}

/** Reads one token as a colour, through a hidden probe inside the wall. */
function readToken(name: string): FluidRgb | null {
  if (!probe || !sample) return null;
  probe.style.color = `var(--md-sys-color-${name})`;
  const value = getComputedStyle(probe).color;
  if (!value || value === "rgba(0, 0, 0, 0)" || value === "transparent") return null;
  try {
    sample.clearRect(0, 0, 1, 1);
    sample.fillStyle = value;
    sample.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = sample.getImageData(0, 0, 1, 1).data;
    if (!a) return null;
    return [r! / 255, g! / 255, b! / 255];
  } catch {
    return null;
  }
}

function currentScheme(): FluidScheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function readTokens(scheme: FluidScheme): FluidTokens {
  const fallback = FLUID_FALLBACK_TOKENS[scheme];
  const read = (name: (typeof TOKEN_NAMES)[number], key: keyof FluidTokens): FluidRgb =>
    readToken(name) ?? fallback[key];
  return {
    primary: read("primary", "primary"),
    primaryContainer: read("primary-container", "primaryContainer"),
    secondary: read("secondary", "secondary"),
    secondaryContainer: read("secondary-container", "secondaryContainer"),
    tertiary: read("tertiary", "tertiary"),
    tertiaryContainer: read("tertiary-container", "tertiaryContainer"),
    surface: read("surface-container-lowest", "surface"),
    surfaceContainer: read("surface-container", "surfaceContainer"),
    onSurface: read("on-surface", "onSurface"),
  };
}

/** Pushes the parts of the palette that never change between frames. */
function applyPalette(): void {
  if (!context || !program) return;
  const [c1, c2, c3, c4, c5] = palette.stops;
  setColor3("u_c1", c1);
  setColor3("u_c2", c2);
  setColor3("u_c3", c3);
  setColor3("u_c4", c4);
  setColor3("u_c5", c5);
  setColor3("u_core", palette.core);
  setColor3("u_halo", palette.halo);
  setColor3("u_spark", palette.spark);
  setFloat("u_light_core", palette.lightCore);
  setFloat("u_light_halo", palette.lightHalo);
  setFloat("u_bloom_threshold", palette.bloomThreshold);
  setFloat("u_bloom_range", palette.bloomRange);
  setFloat("u_bloom_strength", palette.bloomStrength);
  setFloat("u_vignette", palette.vignette);
  setFloat("u_grain", palette.grain);
  setFloat("u_sparkle", palette.sparkle);
  setFloat("u_scale", spec.value.scale);
  setFloat("u_curl", spec.value.curl);
  setFloat("u_warp", spec.value.warp);
  setFloat("u_mote", spec.value.mote);
  setFloat("u_curtain_amt", spec.value.curtain);
  const stretch = locations.get("u_stretch");
  if (context && stretch) {
    context.uniform2f(stretch, spec.value.stretch[0], spec.value.stretch[1]);
  }
}

/** Re-reads the tokens; a seed, variant, contrast or scheme change lands here. */
function refresh(): void {
  if (!context || !program) return;
  scheme.value = currentScheme();
  const tokens = readTokens(scheme.value);
  palette = fluidPalette(tokens, scheme.value, spec.value.tone, spec.value.accent);
  vineScene?.setColor(tokens.onSurface);
  applyPalette();
  if (!frame) draw();
}

function scheduleRefresh(): void {
  if (refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    refresh();
  });
}

function resize(): boolean {
  const element = canvas.value;
  if (!context || !element) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return false;
  const size = fluidRenderSize(rect.width, rect.height, window.devicePixelRatio || 1);
  if (element.width !== size.width || element.height !== size.height) {
    element.width = size.width;
    element.height = size.height;
  }
  context.viewport(0, 0, size.width, size.height);
  const resolution = locations.get("u_resolution");
  const grain = locations.get("u_grain_resolution");
  if (resolution) context.uniform2f(resolution, size.width, size.height);
  // The grain and the motes are measured in CSS pixels, so they keep their
  // size on screen whatever the backing store was scaled to.
  if (grain) context.uniform2f(grain, rect.width, rect.height);
  const sizeChanged = ribbonSize.value.width !== rect.width || ribbonSize.value.height !== rect.height;
  if (sizeChanged) {
    ribbonSize.value = { width: rect.width, height: rect.height };
    if (!(field.to > 0)) {
      field.centre = (0.5 * rect.width) / rect.height;
      field.span = field.from = field.to = rect.height;
    } else if (fieldStretched(rect.height)) scheduleFieldReplan();
    else cancelFieldReplan();
    if (!(ribbonLayout.value.width > 0)) ribbonLayout.value = { width: rect.width, height: rect.height };
    else if (stretchedFrom(ribbonLayout.value)) scheduleLaceReplan();
    else cancelLaceReplan();
    if (vineScene) {
      vineScene.resize(rect.width, rect.height);
      vineKeepDrifted = syncVineKeep();
      if (vineNeedsReplan()) scheduleVineReplan();
      else cancelVineReplan();
    } else if (overlay.value === "vine") {
      rebuildVineScene();
    }
  }
  return true;
}

const rippleData = new Float32Array(VINE_MAX_RIPPLES * 4);

/** The portals of the 出屏 vines, stretched with the wall the way the vines are. */
function uploadRipples(): void {
  if (!context) return;
  const portals = overlay.value === "vine" && vineScene ? vineScene.portals : [];
  const count = Math.min(portals.length, VINE_MAX_RIPPLES);
  if (vineScene && count) {
    const warpX = ribbonSize.value.width / vineScene.planWidth || 1;
    const warpY = ribbonSize.value.height / vineScene.planHeight || 1;
    for (let index = 0; index < count; index += 1) {
      const portal = portals[index]!;
      rippleData.set([portal.x * warpX, portal.y * warpY, portal.ripple, portal.phase], index * 4);
    }
  }
  const ripples = locations.get("u_ripples");
  if (ripples && count) context.uniform4fv(ripples, rippleData);
  const total = locations.get("u_ripple_count");
  if (total) context.uniform1i(total, count);
}

function draw(): void {
  if (!context || !program) return;
  pointer.x += (pointer.targetX - pointer.x) * 0.14;
  pointer.y += (pointer.targetY - pointer.y) * 0.14;

  const loops = locations.get("u_loops");
  if (loops) context.uniform2fv(loops, fluidLoopOffsets(elapsed));
  setFloat("u_time", elapsed);

  const centre = locations.get("u_centre");
  if (centre) context.uniform2f(centre, field.centre, 0.5);
  setFloat("u_span", fieldSpanAt(performance.now()) || 1);

  const drift = 0.06;
  const offset = locations.get("u_offset");
  if (offset) {
    context.uniform2f(
      offset,
      FIELD_OFFSET[0] + (pointer.x - 0.5) * drift,
      FIELD_OFFSET[1] + (pointer.y - 0.5) * drift * 0.8,
    );
  }
  const light = locations.get("u_light_pos");
  if (light) {
    context.uniform2f(
      light,
      LIGHT_POSITIONS[props.light] + (pointer.x - 0.5) * 0.1,
      0.48 + (pointer.y - 0.5) * 0.08,
    );
  }

  setFloat("u_petal", spec.value.petal);
  setFloat("u_curtain", fluidCurtain(elapsed, spec.value.speed));
  setFloat("u_curtain_gain", scheme.value === "dark" ? 0.62 : 0.24);
  setFloat("u_ripple_light", scheme.value === "dark" ? 0.45 : 1);
  setFloat("u_petal_light", palette.petalLight);
  setFloat("u_petal_ink", palette.petalInk);

  // Lights up quickly, dies away slowly, the way a real highlight does.
  glow += (glowTarget - glow) * (glowTarget > glow ? 0.5 : 0.08);
  const cursorUniform = locations.get("u_cursor");
  if (cursorUniform) context.uniform2f(cursorUniform, cursor.x, 1 - cursor.y);
  setFloat("u_glow", glow * palette.glow * spec.value.glow);

  uploadRipples();
  context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
  vineScene?.render(elapsed);
  if (!paintedFrame) {
    paintedFrame = true;
    painted.value = true;
  }
}

function tick(now: number): void {
  frame = requestAnimationFrame(tick);
  if (drawnAt && now - drawnAt < FRAME_INTERVAL - 1) return;
  const delta = drawnAt ? Math.min(now - drawnAt, 100) : FRAME_INTERVAL;
  drawnAt = now;
  elapsed += (delta / 1000) * spec.value.speed;
  draw();
}

function start(): void {
  if (frame || reduced || !context || !onScreen || document.hidden) return;
  drawnAt = 0;
  frame = requestAnimationFrame(tick);
}

function stop(): void {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  drawnAt = 0;
}

function onPointerMove(event: PointerEvent): void {
  if (event.pointerType === "touch") return;
  const element = wall.value;
  if (!element) return;
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  pointer.targetX = x;
  pointer.targetY = y;
  cursor.x = x;
  cursor.y = y;
  // Written straight to the element: the grid light must not wait for a render
  // pass, and inline custom properties skip Vue's diffing entirely.
  const grid = gridSize.value;
  const alpha = String(Math.min(1, spec.value.glow) * 0.9);
  const glowRadius = Math.max(96, Math.min(160, Math.max(grid, textureSize.value) * 0.48));
  for (const layer of [litGrid.value, litTexture.value]) {
    if (!layer) continue;
    layer.style.setProperty("--_glow-x", `${(x * 100).toFixed(2)}%`);
    layer.style.setProperty("--_glow-y", `${(y * 100).toFixed(2)}%`);
    layer.style.setProperty("--_glow-radius", `${glowRadius}px`);
    layer.style.setProperty("--_lit-alpha", alpha);
  }
  vineScene?.setPointer(x, y, true, !reduced);
  if (litRibbons.value) {
    litRibbons.value.style.setProperty("--_ribbon-glow-x", `${(x * 100).toFixed(2)}%`);
    litRibbons.value.style.setProperty("--_ribbon-glow-y", `${(y * 100).toFixed(2)}%`);
    litRibbons.value.style.setProperty(
      "--_ribbon-glow-radius",
      `${glowRadius}px`,
    );
    litRibbons.value.style.setProperty("--_ribbon-lit-alpha", String(Number(alpha) * 0.62));
  }
  glowTarget = 1;
  // With the loop stopped (reduced motion, or a still frame) the light still
  // answers the pointer, so the wall is not dead under the cursor.
  if (!frame) requestAnimationFrame(draw);
}

function onPointerLeave(): void {
  glowTarget = 0;
  vineScene?.setPointer(pointer.targetX, pointer.targetY, false);
  litGrid.value?.style.setProperty("--_lit-alpha", "0");
  litTexture.value?.style.setProperty("--_lit-alpha", "0");
  litRibbons.value?.style.setProperty("--_ribbon-lit-alpha", "0");
}

function onVisibilityChange(): void {
  if (document.hidden) stop();
  else start();
}

function onContextLost(event: Event): void {
  event.preventDefault();
  stop();
  program = null;
}

function onContextRestored(): void {
  if (createProgram()) {
    resize();
    refresh();
    start();
  }
}

function onMotionChange(): void {
  reduced = motionQuery?.matches ?? false;
  if (reduced) {
    stop();
    elapsed = 0;
    draw();
  } else {
    start();
  }
}

function bootstrap(): void {
  const element = canvas.value;
  const host = wall.value;
  if (!element || !host || context) return;

  context = element.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  if (!context) return;

  // A probe the shader never sees: computed style resolves `var()` for us, and
  // a one-pixel canvas turns whatever colour space the token uses into sRGB.
  probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:absolute;inline-size:0;block-size:0;overflow:hidden;visibility:hidden;pointer-events:none";
  host.appendChild(probe);
  sample = document.createElement("canvas").getContext("2d", { willReadFrequently: false });

  if (!createProgram()) {
    context = null;
    return;
  }
  if (!resize()) return;
  refresh();
  draw();

  element.addEventListener("webglcontextlost", onContextLost);
  element.addEventListener("webglcontextrestored", onContextRestored);
  host.addEventListener("pointermove", onPointerMove, { passive: true });
  host.addEventListener("pointerleave", onPointerLeave, { passive: true });

  // The token values live on whichever element carries them, so both the
  // document (scheme) and the theme host (seed, variant, contrast) are watched.
  const scope = host.closest("m3e-theme") ?? document.documentElement;
  themeObserver = new MutationObserver(scheduleRefresh);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style"],
  });
  if (scope !== document.documentElement) {
    themeObserver.observe(scope, {
      attributes: true,
      attributeFilter: ["color", "variant", "scheme", "contrast"],
    });
  }
  window.addEventListener("akari-ready", scheduleRefresh);

  resizeObserver = new ResizeObserver(() => {
    if (resize()) draw();
  });
  resizeObserver.observe(element);

  intersectionObserver = new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    if (onScreen) {
      checkVinePopEdges();
      start();
    } else {
      stop();
    }
  });
  intersectionObserver.observe(host);
  pageObserver = new ResizeObserver(checkVinePopEdges);
  pageObserver.observe(document.documentElement);
  // Text reflows and late fonts move what is written on the wall without
  // resizing the wall itself.
  keepObserver = new ResizeObserver(checkVineKeep);
  for (const block of host.querySelectorAll(".akari-fluid-wall__block")) keepObserver.observe(block);
  void document.fonts?.ready.then(checkVineKeep);

  document.addEventListener("visibilitychange", onVisibilityChange);
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionQuery.addEventListener("change", onMotionChange);
  onMotionChange();
}

// The wall's look is set from the tag, so a changed attribute repaints the
// same program instead of remounting it.
watch(
  () => [props.variant, props.scale, props.curl, props.tone, props.warp, props.petal, props.glow, props.light],
  () => {
    applyPalette();
    if (!frame) draw();
  },
);

watch(
  () => [overlay.value, textureSize.value, textureDensity.value, textureOpacity.value],
  () => {
    void nextTick(() => rebuildVineScene());
  },
);

watch([vineSeed, () => props.safeZone], () => {
  if (overlay.value === "vine") void nextTick(() => rebuildVineScene());
});

// Turning 出屏 on or off only adds or drops shoots; the wall stays as planned.
watch([vinePopout, vineInward], () => {
  if (overlay.value === "vine") void nextTick(() => rebuildVineScene(currentVinePlan()));
});

onMounted(() => {
  window.addEventListener(VINE_SEED_EVENT, onVineSeedChange);
  window.addEventListener(VINE_POPOUT_EVENT, onVinePopoutChange);
  window.addEventListener("resize", checkVinePopEdges, { passive: true });
  bootstrap();
});

onBeforeUnmount(() => {
  stop();
  cancelVineReplan();
  cancelLaceReplan();
  cancelFieldReplan();
  vineScene?.dispose();
  vineScene = null;
  if (refreshFrame) cancelAnimationFrame(refreshFrame);
  themeObserver?.disconnect();
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
  pageObserver?.disconnect();
  keepObserver?.disconnect();
  motionQuery?.removeEventListener("change", onMotionChange);
  window.removeEventListener("akari-ready", scheduleRefresh);
  window.removeEventListener(VINE_SEED_EVENT, onVineSeedChange);
  window.removeEventListener(VINE_POPOUT_EVENT, onVinePopoutChange);
  window.removeEventListener("resize", checkVinePopEdges);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  wall.value?.removeEventListener("pointermove", onPointerMove);
  wall.value?.removeEventListener("pointerleave", onPointerLeave);
  canvas.value?.removeEventListener("webglcontextlost", onContextLost);
  canvas.value?.removeEventListener("webglcontextrestored", onContextRestored);
  probe?.remove();
  probe = null;
  sample = null;
  program = null;
  context = null;
});
</script>

<template>
  <!--
    A wall of the fluid, either as decoration or as the ground for a heading.
    The canvas is drawn by the fragment shader above; the card's own gradient
    stands in for it where WebGL is missing, before the first frame, and behind
    a slow machine's single frame.
  -->
  <div
    ref="wall"
    class="akari-fluid-wall"
    :class="{ 'is-painted': painted, 'is-popout': vinePopEdges > 0 }"
    :style="{ '--_wall-height': props.height }"
    :data-placement="props.placement"
  >
    <div class="akari-fluid-wall__canvas" aria-hidden="true">
      <canvas ref="canvas"></canvas>
    </div>
    <canvas
      v-if="spec.texture === 'vine' && textureOpacity > 0"
      ref="vineCanvas"
      class="akari-fluid-wall__vine-canvas"
      :style="vineCanvasStyle"
      aria-hidden="true"
    ></canvas>
    <canvas
      v-if="spec.texture === 'vine' && textureOpacity > 0"
      ref="vineGhost"
      class="akari-fluid-wall__vine-ghost"
      width="0"
      height="0"
      aria-hidden="true"
    ></canvas>
    <div
      v-if="gridSize > 0"
      class="akari-fluid-wall__grid"
      aria-hidden="true"
      :style="{ '--_grid-size': `${gridSize}px`, '--_grid-alpha': String(spec.gridAlpha) }"
    >
      <div ref="litGrid" class="akari-fluid-wall__grid-lit"></div>
    </div>
    <div
      v-if="spec.texture !== 'none' && spec.texture !== 'lace' && spec.texture !== 'vine' && textureOpacity > 0"
      class="akari-fluid-wall__texture"
      :class="`is-${textureTone}`"
      aria-hidden="true"
      :style="{
        '--_texture-alpha': String(textureAlpha),
        '--_overlay': textureMask,
        '--_overlay-size': `${textureFrameWidth}px ${textureFrameHeight}px`,
      }"
    >
      <div class="akari-fluid-wall__texture-pattern"></div>
      <div ref="litTexture" class="akari-fluid-wall__texture-lit"></div>
    </div>
    <svg
      v-if="ribbons.length > 0"
      ref="ribbonSvg"
      class="akari-fluid-wall__ribbons"
      :viewBox="`0 0 ${ribbonSize.width.toFixed(1)} ${ribbonSize.height.toFixed(1)}`"
      preserveAspectRatio="none"
      aria-hidden="true"
      :style="{
        '--_ribbon-alpha': String(Math.min(0.92, textureAlpha * (scheme === 'light' ? 0.78 : 0.8))),
        '--_ribbon-fill': scheme === 'light' ? '0.16' : '0.2',
      }"
    >
      <g
        v-for="(ribbon, index) in ribbons"
        :key="`ribbon-${index}`"
        class="akari-fluid-wall__ribbon"
        :style="{ opacity: (0.72 + (index % 3) * 0.12).toFixed(2) }"
      >
        <path
          class="akari-fluid-wall__ribbon-lace"
          :d="ribbonLacePath(ribbon, ribbonOccluders(ribbon))"
        />
        <path
          v-for="side in [1, -1]"
          :key="`scallop-${side}`"
          class="akari-fluid-wall__ribbon-scallop"
          :d="ribbonScallopPath(ribbon, side as 1 | -1, 0, ribbonOccluders(ribbon))"
        />
      </g>
    </svg>
    <svg
      v-if="ribbons.length > 0"
      ref="litRibbons"
      class="akari-fluid-wall__ribbons-hover"
      :viewBox="`0 0 ${ribbonSize.width.toFixed(1)} ${ribbonSize.height.toFixed(1)}`"
      preserveAspectRatio="none"
      aria-hidden="true"
      :style="{
        '--_ribbon-hover-color':
          scheme === 'dark'
            ? 'var(--md-sys-color-on-surface, #e6e1e5)'
            : 'var(--md-sys-color-on-surface, #1d1b20)',
        '--_ribbon-hover-fill-alpha': scheme === 'dark' ? '0.18' : '0.12',
        '--_ribbon-hover-stroke-alpha': scheme === 'dark' ? '0.42' : '0.28',
      }"
    >
      <g v-for="(ribbon, index) in ribbons" :key="`ribbon-hover-${index}`">
        <path
          class="akari-fluid-wall__ribbon-hover-fill"
          :d="ribbonBandPath(ribbon, ribbonScallopAmplitude(ribbon))"
        />
        <path
          class="akari-fluid-wall__ribbon-hover-lace"
          :d="ribbonLacePath(ribbon, ribbonOccluders(ribbon))"
        />
        <path
          v-for="side in [1, -1]"
          :key="`hover-scallop-${side}`"
          class="akari-fluid-wall__ribbon-hover-scallop"
          :d="ribbonScallopPath(ribbon, side as 1 | -1, 0, ribbonOccluders(ribbon))"
        />
      </g>
    </svg>
    <div v-if="hasContent" class="akari-fluid-wall__veil" aria-hidden="true"></div>
    <div v-if="hasContent" class="akari-fluid-wall__body">
      <div v-if="slots.top" class="akari-fluid-wall__block" data-slot="top">
        <slot name="top" />
      </div>
      <div v-if="slots.default" class="akari-fluid-wall__block" data-slot="main">
        <slot />
      </div>
      <div v-if="slots.bottom" class="akari-fluid-wall__block" data-slot="bottom">
        <slot name="bottom" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * The wall fills the width its container gives it and keeps the page's corner
 * radius, so it reads as one more Material surface rather than as a banner.
 * The gradient under the canvas is the same field the shader draws, coarse:
 * a lit mass toward the light, the primary role folded into the surface.
 */
.akari-fluid-wall {
  position: relative;
  display: block;
  --_wall-radius: calc(var(--akari-doc-radius, 28px) * 0.72);
  overflow: hidden;
  block-size: var(--_wall-height, clamp(220px, 34vh, 380px));
  border-radius: var(--_wall-radius);
  isolation: isolate;
  contain: paint;
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-lowest, #ffffff) 82%,
    var(--md-sys-color-primary, #6750a4) 18%
  );
  background-image: radial-gradient(
    118% 132% at 84% 48%,
    color-mix(in srgb, var(--md-sys-color-primary, #6750a4) 34%, transparent) 0%,
    transparent 62%
  );
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--md-sys-color-outline-variant, #cac4d0) 26%, transparent);
}

html.dark .akari-fluid-wall {
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-lowest, #0f0d13) 88%,
    var(--md-sys-color-primary-container, #4f378b) 12%
  );
  background-image: radial-gradient(
    118% 132% at 84% 48%,
    color-mix(in srgb, var(--md-sys-color-primary, #d0bcff) 22%, transparent) 0%,
    transparent 64%
  );
}

.akari-fluid-wall__canvas {
  position: absolute;
  inset: 0;
}

/*
 * 出屏: the wall stops clipping so the vine canvas can reach past its edge,
 * and every other layer clips itself to the card instead. The vines inside
 * the card are clipped by their own shader.
 */
.akari-fluid-wall.is-popout {
  /* Shoots hang over the page, so paint above whatever follows the wall. */
  z-index: 1;
  overflow: visible;
  contain: none;
}

.akari-fluid-wall.is-popout
  > :not(.akari-fluid-wall__vine-canvas, .akari-fluid-wall__vine-ghost, .akari-fluid-wall__body) {
  clip-path: inset(0 round var(--_wall-radius));
}

.akari-fluid-wall__canvas canvas {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  opacity: 0;
  transition: opacity 900ms cubic-bezier(0.2, 0, 0, 1);
}

.akari-fluid-wall.is-painted .akari-fluid-wall__canvas canvas {
  opacity: 1;
}

.akari-fluid-wall__vine-canvas {
  position: absolute;
  inset: 0;
  display: block;
  inline-size: 100%;
  block-size: 100%;
  pointer-events: none;
}

/* Holds the old plan's last frame while a new one fades in over it. */
.akari-fluid-wall__vine-ghost {
  position: absolute;
  inset: 0;
  display: block;
  inline-size: 100%;
  block-size: 100%;
  opacity: 0;
  pointer-events: none;
}

/*
 * The grid is CSS, not part of the shader: it costs no second draw call, stays
 * one physical pixel wide at any density, and lines up with the card's corners.
 * A fine cell every `--_grid-size`, a stronger line every fifth.
 */
.akari-fluid-wall__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* Lines need more weight on the dark wall, less on the pale one. */
  --_grid-fine: rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / calc(0.05 * var(--_grid-alpha, 1)));
  --_grid-coarse: rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / calc(0.08 * var(--_grid-alpha, 1)));
  background-image:
    linear-gradient(to right, var(--_grid-fine) 1px, transparent 1px),
    linear-gradient(to bottom, var(--_grid-fine) 1px, transparent 1px),
    linear-gradient(to right, var(--_grid-coarse) 1px, transparent 1px),
    linear-gradient(to bottom, var(--_grid-coarse) 1px, transparent 1px);
  background-size:
    var(--_grid-size) var(--_grid-size),
    var(--_grid-size) var(--_grid-size),
    calc(var(--_grid-size) * 4) calc(var(--_grid-size) * 4),
    calc(var(--_grid-size) * 4) calc(var(--_grid-size) * 4);
  mask-image: radial-gradient(135% 155% at 80% 46%, #000 0%, rgba(0, 0, 0, 0.55) 58%, transparent 96%);
}

/*
 * The pointer lights the grid, not the liquid: a second copy of the same grid
 * in brighter ink, masked to a soft circle under the cursor. Because it is a
 * child of the masked grid, the two masks intersect and the light dies out
 * toward the corner exactly as the plain lines do.
 */
.akari-fluid-wall__grid-lit {
  position: absolute;
  inset: 0;
  pointer-events: none;
  --_glow-x: 50%;
  --_glow-y: 50%;
  --_lit-alpha: 0;
  --_lit-fine: rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 0.22);
  --_lit-coarse: rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 0.34);
  background-image:
    linear-gradient(to right, var(--_lit-fine) 1px, transparent 1px),
    linear-gradient(to bottom, var(--_lit-fine) 1px, transparent 1px),
    linear-gradient(to right, var(--_lit-coarse) 1px, transparent 1px),
    linear-gradient(to bottom, var(--_lit-coarse) 1px, transparent 1px);
  background-size:
    var(--_grid-size) var(--_grid-size),
    var(--_grid-size) var(--_grid-size),
    calc(var(--_grid-size) * 4) calc(var(--_grid-size) * 4),
    calc(var(--_grid-size) * 4) calc(var(--_grid-size) * 4);
  mask-image: radial-gradient(
    circle var(--_glow-radius, 240px) at var(--_glow-x) var(--_glow-y),
    #000 0%,
    rgba(0, 0, 0, 0.55) 42%,
    transparent 74%
  );
  opacity: var(--_lit-alpha);
  transition: opacity 460ms cubic-bezier(0.2, 0, 0, 1);
}

html.dark .akari-fluid-wall__grid-lit {
  --_lit-fine: rgb(from var(--md-sys-color-on-surface, #e6e1e5) r g b / 0.3);
  --_lit-coarse: rgb(from var(--md-sys-color-on-surface, #e6e1e5) r g b / 0.46);
}

html.dark .akari-fluid-wall__grid {
  --_grid-fine: rgb(from var(--md-sys-color-on-surface, #e6e1e5) r g b / calc(0.06 * var(--_grid-alpha, 1)));
  --_grid-coarse: rgb(from var(--md-sys-color-on-surface, #e6e1e5) r g b / calc(0.1 * var(--_grid-alpha, 1)));
}

/*
 * The blossom overlay is a mask rather than an image: the geometry stays crisp
 * at any size, and its colour comes from the tokens, so it belongs to the same
 * scheme as the wall instead of being a picture pasted on top.
 */
.akari-fluid-wall__texture {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mask-image: radial-gradient(135% 155% at 80% 46%, #000 0%, rgba(0, 0, 0, 0.55) 58%, transparent 96%);
}

.akari-fluid-wall__texture-pattern,
.akari-fluid-wall__texture-lit {
  position: absolute;
  inset: 0;
  -webkit-mask-image: var(--_overlay);
  mask-image: var(--_overlay);
  -webkit-mask-size: var(--_overlay-size, 100% 100%);
  mask-size: var(--_overlay-size, 100% 100%);
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.akari-fluid-wall__texture-pattern {
  background-color: rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 1);
  opacity: calc(var(--_texture-alpha) * 0.105);
}

html.dark .akari-fluid-wall__texture-pattern {
  opacity: calc(var(--_texture-alpha) * 0.145);
}

.akari-fluid-wall__texture.is-vine .akari-fluid-wall__texture-pattern {
  background: linear-gradient(
    135deg,
    rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 0.72),
    rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 1) 48%,
    rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 0.68)
  );
}

/*
 * The pointer field is a background gradient clipped by the generated texture
 * geometry, so every texture unit receives the same local response.
 */
.akari-fluid-wall__texture-lit {
  --_glow-x: 50%;
  --_glow-y: 50%;
  --_lit-alpha: 0;
  background: radial-gradient(
    circle var(--_glow-radius, 240px) at var(--_glow-x) var(--_glow-y),
    rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 0.82) 0%,
    rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 0.45) 45%,
    transparent 72%
  );
  opacity: calc(var(--_lit-alpha) * var(--_texture-alpha) * 0.55);
  transition: opacity 460ms cubic-bezier(0.2, 0, 0, 1);
}

/*
 * The scrim follows the content instead of sitting on one edge: a wall that
 * hosts a headline on the left must not wash out its right side, where the
 * flow is supposed to show.
 */
.akari-fluid-wall__ribbons,
.akari-fluid-wall__ribbons-hover {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  overflow: hidden;
  pointer-events: none;
  opacity: var(--_ribbon-alpha, 0.5);
}

.akari-fluid-wall__ribbon-lace {
  fill: none;
  stroke: var(--md-sys-color-on-surface);
  stroke-opacity: 0.16;
  stroke-width: 0.85;
  stroke-linejoin: miter;
  transition: stroke-opacity 260ms cubic-bezier(0.2, 0, 0, 1);
}

.akari-fluid-wall__ribbon-scallop {
  fill: none;
  stroke: var(--md-sys-color-on-surface);
  stroke-opacity: 0.18;
  stroke-width: 0.9;
  transition: stroke-opacity 260ms cubic-bezier(0.2, 0, 0, 1);
}

.akari-fluid-wall__ribbons-hover {
  --_ribbon-glow-x: 50%;
  --_ribbon-glow-y: 50%;
  --_ribbon-glow-radius: 240px;
  --_ribbon-lit-alpha: 0;
  opacity: var(--_ribbon-lit-alpha);
  mask-image: radial-gradient(
    circle var(--_ribbon-glow-radius) at var(--_ribbon-glow-x) var(--_ribbon-glow-y),
    #000 0%,
    #000 18%,
    rgba(0, 0, 0, 0.72) 44%,
    rgba(0, 0, 0, 0.2) 70%,
    transparent 100%
  );
  transition: opacity 420ms cubic-bezier(0.2, 0, 0, 1);
}

.akari-fluid-wall__ribbon-hover-fill {
  fill: var(--_ribbon-hover-color, #fff);
  fill-opacity: var(--_ribbon-hover-fill-alpha, 0.14);
  stroke: none;
}

.akari-fluid-wall__ribbon-hover-lace,
.akari-fluid-wall__ribbon-hover-scallop {
  fill: none;
  stroke: var(--_ribbon-hover-color, #fff);
  stroke-opacity: var(--_ribbon-hover-stroke-alpha, 0.34);
  stroke-width: 1;
}

html.dark .akari-fluid-wall__veil {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    100deg,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 72%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 32%, transparent) 48%,
    transparent 86%
  );
}

.akari-fluid-wall[data-placement="center"] .akari-fluid-wall__veil {
  background-image: radial-gradient(
    130% 170% at 50% 62%,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 74%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 34%, transparent) 52%,
    transparent 86%
  );
}

.akari-fluid-wall[data-placement="end"] .akari-fluid-wall__veil {
  background-image: linear-gradient(
    260deg,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 72%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 32%, transparent) 48%,
    transparent 86%
  );
}

html.dark .akari-fluid-wall__veil {
  background-image: linear-gradient(
    100deg,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 64%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 22%, transparent) 50%,
    transparent 88%
  );
}

html.dark .akari-fluid-wall[data-placement="center"] .akari-fluid-wall__veil {
  background-image: radial-gradient(
    130% 170% at 50% 62%,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 76%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 32%, transparent) 54%,
    transparent 88%
  );
}

html.dark .akari-fluid-wall[data-placement="end"] .akari-fluid-wall__veil {
  background-image: linear-gradient(
    260deg,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 64%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 22%, transparent) 50%,
    transparent 88%
  );
}

/*
 * Slots share one column: a header rail, the body, a footer rail. Each block is
 * a plain flex child, so a caller can drop in headings, chips or a form without
 * the wall imposing its own rhythm.
 */
.akari-fluid-wall__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(8px, 1.2vw, 14px);
  block-size: 100%;
  padding: clamp(20px, 3.4vw, 34px);
  color: var(--md-sys-color-on-surface, CanvasText);
}

.akari-fluid-wall[data-placement="center"] .akari-fluid-wall__body {
  align-items: center;
  text-align: center;
}

.akari-fluid-wall[data-placement="end"] .akari-fluid-wall__body {
  align-items: flex-end;
  text-align: right;
}

.akari-fluid-wall__block {
  inline-size: 100%;
  max-inline-size: min(62ch, var(--akari-doc-text-measure, 760px));
}

.akari-fluid-wall__block[data-slot="main"] {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1vw, 10px);
}

.akari-fluid-wall__block[data-slot="top"] {
  position: absolute;
  inset-block-start: clamp(20px, 3.4vw, 34px);
  inset-inline-end: clamp(20px, 3.4vw, 34px);
  inline-size: auto;
}

.akari-fluid-wall__block[data-slot="bottom"] {
  position: absolute;
  inset-block-end: clamp(20px, 3.4vw, 34px);
  inset-inline-start: clamp(20px, 3.4vw, 34px);
  inline-size: auto;
}

/* Headings inside a slot inherit the wall's ink rather than the page's. */
.akari-fluid-wall__block :is(h1, h2, h3, p) {
  margin: 0;
  color: inherit;
}

@media (prefers-reduced-motion: reduce) {
  .akari-fluid-wall__canvas canvas {
    transition: none;
  }
}
</style>
