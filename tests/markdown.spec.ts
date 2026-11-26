import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  createMarkdownRenderer,
  disposeMdItInstance,
  type MarkdownRenderer,
} from "vitepress";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  akariMarkdown,
  type AkariMarkdownOptions,
} from "../docs/.vitepress/theme/markdown";

const svg = (width: number, height: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"></svg>`;

// The image server runs in a process of its own: the plugin downloads
// synchronously, which would block a server running in this one.
const SERVER = `
const server = require("node:http").createServer((request, response) => {
  response.writeHead(200, { "content-type": "image/svg+xml" });
  response.end(${JSON.stringify(svg(800, 450))});
});
server.listen(0, "127.0.0.1", () => console.log(server.address().port));
`;

let docs = "";
let server: ChildProcess | undefined;
let origin = "";
let md: MarkdownRenderer | undefined;
let mdOptions = "";

async function render(
  source: string,
  options: AkariMarkdownOptions = {},
): Promise<string> {
  // VitePress keeps one renderer per process; other options need a new one.
  const key = JSON.stringify(options);
  if (!md || key !== mdOptions) {
    disposeMdItInstance();
    mdOptions = key;
    md = await createMarkdownRenderer(
      docs,
      { config: (renderer) => akariMarkdown(renderer, options) },
      "/",
      undefined,
      path.join(docs, "public"),
    );
  }
  // As VitePress renders a rewritten page: served from `theme/layout.md`,
  // written in `zh-CN/theme/layout/index.md`.
  return md.renderAsync(source, {
    path: path.join(docs, "theme/layout.md"),
    realPath: path.join(docs, "zh-CN/theme/layout/index.md"),
    relativePath: "theme/layout.md",
    cleanUrls: false,
  });
}

beforeAll(async () => {
  docs = await mkdtemp(path.join(tmpdir(), "akari-markdown-"));
  await mkdir(path.join(docs, "public/hero"), { recursive: true });
  await mkdir(path.join(docs, "zh-CN/theme/layout"), { recursive: true });
  await writeFile(path.join(docs, "public/hero/wide.svg"), svg(1200, 600));
  await writeFile(
    path.join(docs, "zh-CN/theme/layout/shell.svg"),
    svg(320, 240),
  );

  server = spawn(process.execPath, ["--eval", SERVER]);
  const port = await new Promise<string>((resolve) =>
    server!.stdout!.once("data", (data) => resolve(String(data).trim())),
  );
  origin = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  disposeMdItInstance();
  server?.kill();
  await rm(docs, { recursive: true, force: true });
});

describe("akariMarkdown", () => {
  it("frames tables", async () => {
    expect(await render("| a |\n| --- |\n| b |\n")).toMatch(
      /^<div class="akari-table"><table[^>]*>[\s\S]*<\/table>\s*<\/div>/,
    );
  });

  it("leaves local images to VitePress, which sizes them", async () => {
    expect(await render("![](/hero/wide.svg)")).toContain(
      'width="1200" height="600"',
    );
    expect(await render("![](./shell.svg)")).toContain(
      'width="320" height="240"',
    );
  });

  it("makes Markdown images load lazily", async () => {
    const html = await render("![](/hero/wide.svg)");

    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain('width="1200" height="600"');
  });

  it("leaves explicit loading and decoding attributes alone", async () => {
    const html = await render(
      '<img src="/hero/wide.svg" alt="eager" loading="eager" decoding="sync">',
    );

    expect(html).toContain('loading="eager"');
    expect(html).toContain('decoding="sync"');
    expect(html).not.toContain('loading="lazy"');
  });

  it("makes an image written as HTML lazy too", async () => {
    const html = await render('<img src="/hero/wide.svg" alt="raw">');

    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it("leaves image text in comments alone", async () => {
    // VitePress extracts <script> blocks before rendering, so a comment is
    // the raw-HTML content that can carry the text <img> without an image.
    const html = await render(
      '<!-- <img src="/hero/wide.svg"> -->\n\nbefore <!-- <img src="/hero/wide.svg"> --> after',
    );

    expect(html).toContain('<!-- <img src="/hero/wide.svg"> -->');
    expect(html).not.toContain('loading="lazy"');
  });

  it("makes an inline image written as HTML lazy too", async () => {
    const html = await render(
      'before <img src="/hero/wide.svg" alt="inline"> after',
    );

    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it("sizes remote images, unless turned off", async () => {
    const src = `${origin}/remote.svg`;

    expect(
      await render(`![](${src})`, { remoteImageSize: { cache: false } }),
    ).toContain('width="800" height="450"');
    expect(
      await render(`![](${src})`, { remoteImageSize: false }),
    ).not.toContain("width=");
  });
});
