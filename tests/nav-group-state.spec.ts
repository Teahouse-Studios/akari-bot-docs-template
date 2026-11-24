import { describe, expect, it } from "vitest";

import {
  resetNavGroupState,
  useNavGroupState,
} from "../docs/.vitepress/theme/composables/useNavGroupState";

describe("navigation group state", () => {
  it("is one map for every drawer, keyed by the group's identity", () => {
    const a = useNavGroupState();
    const b = useNavGroupState();
    expect(a).toBe(b);

    a.set("Theme\nLayout and app bar\n/theme/layout", true);
    expect(b.get("Theme\nLayout and app bar\n/theme/layout")).toBe(true);
  });

  it("forgets the reader's choices on the next page", () => {
    const groups = useNavGroupState();
    groups.set("Theme\nLayout and app bar\n/theme/layout", true);
    groups.set("Theme\nHero\n/theme/hero", false);

    resetNavGroupState();

    expect(groups.size).toBe(0);
  });
});
