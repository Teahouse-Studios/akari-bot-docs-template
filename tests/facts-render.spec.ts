import { createSSRApp, h, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import CommandUsage from "../docs/.vitepress/theme/components/content/CommandUsage.vue";
import ModuleAlias from "../docs/.vitepress/theme/components/content/ModuleAlias.vue";
import ModuleConfig from "../docs/.vitepress/theme/components/content/ModuleConfig.vue";
import ModuleData from "../docs/.vitepress/theme/components/content/ModuleData.vue";
import ModuleMeta from "../docs/.vitepress/theme/components/content/ModuleMeta.vue";

function render(component: Component, props: Record<string, unknown> = {}): Promise<string> {
  return renderToString(createSSRApp({ render: () => h(component, props) }));
}

describe("module fact components", () => {
  it("ModuleConfig 渲染缺少配置项的说明", async () => {
    const html = await render(ModuleConfig);
    expect(html).toContain('class="module-fact module-fact--config"');
    expect(html).toContain("模块没有配置项。");
  });

  it("ModuleConfig 渲染配置表与配置文件路径", async () => {
    const html = await render(ModuleConfig, { table: "module_coin" });
    expect(html).toContain("<code>module_coin</code>");
    expect(html).toContain("<code>config/module_coin.toml</code>");
  });

  it("ModuleData 渲染表名与表结构位置", async () => {
    const html = await render(ModuleData, { tables: ["module_a", "module_b"] });
    expect(html).toContain('class="module-fact module-fact--data"');
    // 属性值里的双引号在 HTML 中会转义。
    expect(html).toContain(
      "<code>owned_tables = [&quot;module_a&quot;, &quot;module_b&quot;]</code>",
    );
    expect(html).toContain("<code>database/models.py</code>");
  });

  it("ModuleData 在关闭列表时只报数量", async () => {
    const html = await render(ModuleData, { tables: "module_a,module_b", list: false });
    expect(html).toContain("2 张数据表");
    expect(html).not.toContain("module_a");
  });

  it("CommandUsage 的用法行带冒号与显式前缀", async () => {
    const html = await render(CommandUsage, { usage: "wiki list", permission: "public", prefix: "~" });
    expect(html).toContain("用法：");
    expect(html).toContain(">~wiki list<");
  });

  it("CommandUsage 未取得前缀时原样输出用法", async () => {
    const html = await render(CommandUsage, { usage: "wiki list" });
    expect(html).toContain(">wiki list<");
  });

  it("CommandUsage 的正则命令不带前缀", async () => {
    const html = await render(CommandUsage, { usage: "mai_regex", type: "regex", prefix: "~" });
    expect(html).toContain(">mai_regex<");
    expect(html).not.toContain("~mai_regex");
  });

  it("CommandUsage 把参数渲染为可悬浮的字段并列出含义", async () => {
    const html = await render(CommandUsage, {
      usage: "wiki <pagename> [<section>]",
      params: ["pagename=页面名称", "section=章节名"],
    });
    expect(html).toContain('class="command-usage__param"');
    expect(html).toContain('class="command-usage__tip"');
    expect(html).toContain("页面名称");
    expect(html).toContain("章节名");
    expect(html).toContain("必填");
    expect(html).toContain("可选");
    expect(html).toContain('class="command-usage__params"');
    expect(html).toContain("尖括号表示必填参数");
  });

  it("CommandUsage 渲染平台限制徽章", async () => {
    const html = await render(CommandUsage, { usage: "about permissions", platforms: "QQBot" });
    expect(html).toContain("meta-badge--platform");
    expect(html).toContain("仅 QQBot");

    const excluded = await render(CommandUsage, { usage: "restart", excluded: "Web" });
    expect(excluded).toContain("meta-badge--platform-excluded");
    expect(excluded).toContain("Web 不可用");
  });

  it("CommandUsage 的别名单独成行，不再塞进胶囊", async () => {
    const html = await render(CommandUsage, { usage: "chemical-code", aliases: ["cc", "chemicalcode"] });
    expect(html).toContain('class="module-alias command-usage__aliases"');
    expect(html).toContain("<code>cc</code>");
    expect(html).not.toContain("meta-badge--alias");

    const aliasesOnly = await render(CommandUsage, { usage: "chemical-code", aliases: ["cc"] });
    expect(aliasesOnly).toContain("command-usage__aliases");
    expect(aliasesOnly).not.toContain("command-usage__meta");
  });

  it("CommandUsage 在含无参数用法时逐行排列", async () => {
    const stacked = await render(CommandUsage, { usage: ["wiki", "wiki <pagename>"], prefix: "~" });
    expect(stacked).toContain("command-usage__usage--stacked");
    const inline = await render(CommandUsage, {
      usage: ["wiki <pagename>", "wiki <section>"],
      prefix: "~",
    });
    expect(inline).not.toContain("command-usage__usage--stacked");
  });

  it("CommandUsage 没有参数时不输出参数说明", async () => {
    const html = await render(CommandUsage, { usage: "wiki list" });
    expect(html).not.toContain("command-usage__param");
    expect(html).not.toContain("command-usage__syntax");
  });

  it("CommandUsage 把插槽示例收进高度容器，服务端输出不预设高度", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(CommandUsage, { usage: "demo" }, { default: () => h("p", "示例消息") }),
      }),
    );
    expect(html).toContain("示例消息");
    expect(html).toContain("command-usage__slot");
    expect(html).not.toContain("height:");
  });

  it("ModuleMeta 的别名与模块说明同一写法", async () => {
    const html = await render(ModuleMeta, {
      modules: [{ name: "chemical_code", aliases: ["cc", "chemicalcode"], type: ["command"] }],
    });
    expect(html).toContain('class="module-meta__item"');
    expect(html).toContain("module-alias module-meta__alias");
    expect(html).toContain("meta-badge--command");
    expect(html).not.toContain("meta-badge--alias");
  });

  it("ModuleAlias 渲染模块级别名", async () => {
    const html = await render(ModuleAlias, { names: ["wiki_bot", "wbot"] });
    expect(html).toContain('class="module-alias"');
    expect(html).toContain("<code>wiki_bot</code>");
    expect(html).toContain("<code>wbot</code>");
  });

  it("ModuleAlias 接受逗号分隔的别名", async () => {
    const html = await render(ModuleAlias, { names: "mai" });
    expect(html).toContain("<code>mai</code>");
  });

  it("ModuleAlias 没有别名时不输出", async () => {
    const html = await render(ModuleAlias);
    expect(html).not.toContain("module-alias");
  });
});
