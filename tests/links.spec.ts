import { describe, expect, it } from "vitest";

import { isPagePath } from "../docs/.vitepress/theme/links";

describe("isPagePath", () => {
  it("treats .html files and extensionless paths as pages", () => {
    expect(isPagePath("/zh-CN/getting-started/installation.html")).toBe(true);
    expect(isPagePath("/getting-started/installation")).toBe(true);
    expect(isPagePath("/zh-CN/")).toBe(true);
    expect(isPagePath("/")).toBe(true);
    expect(isPagePath("/page.HTM")).toBe(true);
  });

  it("leaves files to the browser", () => {
    expect(isPagePath("/hero/akari.svg")).toBe(false);
    expect(isPagePath("/files/guide.pdf")).toBe(false);
    expect(isPagePath("/assets/app.js")).toBe(false);
  });

  it("only looks at the last segment", () => {
    expect(isPagePath("/v1.2/guide")).toBe(true);
    expect(isPagePath("/v1.2/guide.html")).toBe(true);
  });
});
