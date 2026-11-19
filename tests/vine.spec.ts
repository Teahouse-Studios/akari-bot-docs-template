import { describe, expect, it } from "vitest";

import {
  VINE_POP_TILT,
  planVineGarden,
  vineInsideDistance,
  vineKeepClearance,
  vinePortalScale,
  type VinePlan,
  type VineRect,
} from "../docs/.vitepress/theme/vinePlan";

const SIZES: readonly (readonly [number, number])[] = [
  [280, 280],
  [560, 280],
  [900, 560],
];
const SEEDS = [1, 42, 555, 20261116];

function keepFor(width: number, height: number): VineRect[] {
  return [
    { x0: -width * 0.32, x1: width * 0.08, y0: -height * 0.12, y1: height * 0.22 },
    { x0: width * 0.2, x1: width * 0.42, y0: -height * 0.42, y1: -height * 0.3 },
  ];
}

/** The most any of the plan's geometry, as drawn, pokes past `room` (a signed distance to free space). */
function reach(plan: VinePlan, room: (x: number, y: number) => number): number {
  const portal = plan.portal;
  let worst = Number.NEGATIVE_INFINITY;
  const at = (x: number, y: number, z: number, r: number) => {
    if (!portal) {
      worst = Math.max(worst, r - room(x, y));
      return;
    }
    const scale = vinePortalScale(portal, z);
    const tilt = Math.max(0, z - portal.z) * VINE_POP_TILT;
    worst = Math.max(
      worst,
      r * scale + tilt - room(portal.x + (x - portal.x) * scale, portal.y + (y - portal.y) * scale),
    );
  };
  for (const strand of plan.strands) {
    strand.points.forEach((point, index) => at(point.x, point.y, point.z, strand.radii[index] ?? 0));
  }
  for (const { origin, x, spec } of plan.blades) {
    at(origin.x + x.x * spec.length, origin.y + x.y * spec.length, origin.z + x.z * spec.length, 0);
  }
  for (const stroke of plan.strokes) for (const point of stroke.points) at(point.x, point.y, point.z, 0);
  return worst;
}

function finite(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (value && typeof value === "object") return Object.values(value).every(finite);
  return true;
}

describe("planVineGarden safe zones and inward shoots", () => {
  it("plans the same wall when neither option is used", () => {
    for (const [width, height] of SIZES) {
      for (const seed of SEEDS) {
        const base = JSON.stringify(planVineGarden(width, height, seed, 1, true));
        expect(JSON.stringify(planVineGarden(width, height, seed, 1, true, {}))).toBe(base);
        expect(JSON.stringify(planVineGarden(width, height, seed, 1, true, { keep: [], inward: false }))).toBe(base);
      }
    }
  });

  it("leaves the wall underneath alone when inward shoots are added", () => {
    for (const [width, height] of SIZES) {
      for (const seed of SEEDS) {
        const wall = (plans: VinePlan[]) => JSON.stringify(plans.filter((plan) => !plan.pop));
        expect(wall(planVineGarden(width, height, seed, 1, true, { inward: true }))).toBe(
          wall(planVineGarden(width, height, seed)),
        );
      }
    }
  });

  it("keeps wall vines out of the wall safe zones when wallKeep is set", () => {
    for (const [width, height] of SIZES) {
      const keep = keepFor(width, height);
      for (const seed of SEEDS) {
        for (const plan of planVineGarden(width, height, seed, 1, false, { wallKeep: keep })) {
          if (plan.pop) continue;
          const intrusion = reach(plan, (x, y) => vineKeepClearance(keep, x, y));
          expect(intrusion).toBeLessThanOrEqual(0);
        }
      }
    }
  });

  it("keeps every planned number finite", () => {
    for (const [width, height] of SIZES) {
      for (const seed of SEEDS) {
        const plans = planVineGarden(width, height, seed, 1, true, { keep: keepFor(width, height), inward: true });
        expect(plans.every(finite)).toBe(true);
      }
    }
  });

  it("keeps the popout budget balanced across all four edges", () => {
    for (const [width, height] of SIZES) {
      for (const seed of SEEDS) {
        const counts = [0, 0, 0, 0];
        for (const plan of planVineGarden(width, height, seed, 1, true)) {
          if (plan.pop) counts[plan.edge] += 1;
        }
        expect(Math.max(...counts)).toBeLessThanOrEqual(3);
      }
    }
  });

  it("keeps 出屏 shoots off the safe zones", () => {
    for (const [width, height] of SIZES) {
      const keep = keepFor(width, height);
      for (const seed of SEEDS) {
        for (const plan of planVineGarden(width, height, seed, 1, true, { keep, inward: true })) {
          if (!plan.pop) continue;
          const intrusion = reach(plan, (x, y) => vineKeepClearance(keep, x, y));
          expect(intrusion).toBeLessThanOrEqual(0);
        }
      }
    }
  });

  it("grows inward shoots that stay on the wall", () => {
    let count = 0;
    for (const [width, height] of SIZES) {
      for (const seed of SEEDS) {
        for (const plan of planVineGarden(width, height, seed, 1, false, { inward: true })) {
          if (!plan.inward) continue;
          count += 1;
          expect(plan.pop).toBe(true);
          expect(plan.portal).toBeDefined();
          expect(reach(plan, (x, y) => vineInsideDistance(width, height, x, y))).toBeLessThanOrEqual(-2);
        }
      }
    }
    expect(count).toBeGreaterThan(0);
  });
});
