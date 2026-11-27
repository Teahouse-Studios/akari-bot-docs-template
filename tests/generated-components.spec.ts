import { readFileSync } from "node:fs";

import { createSSRApp, defineComponent, h, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";

const boxes = vi.hoisted(() => ({
  theme: { value: {} as Record<string, unknown> },
  site: { value: { title: "Docs", lang: "zh-CN" } },
  lang: { value: "zh-CN" },
}));

vi.mock("vitepress", () => ({
  useData: () => ({ theme: boxes.theme, site: boxes.site, lang: boxes.lang }),
}));

import AdapterCapabilities from "../docs/.vitepress/theme/components/content/AdapterCapabilities.vue";
import CliCommandOptions from "../docs/.vitepress/theme/components/content/CliCommandOptions.vue";
import ModuleConfigFields from "../docs/.vitepress/theme/components/content/ModuleConfigFields.vue";
import { formatGeneratedLabel } from "../docs/.vitepress/theme/components/content/generated";
import { provideAkariConfig } from "../docs/.vitepress/theme/composables/useAkariConfig";

const labels = {
  gen_field: "字段",
  gen_type: "类型",
  gen_default: "默认值",
  gen_comment: "说明",
  gen_required: "必填",
  gen_secret: "（敏感）",
  gen_placeholder: "—",
  gen_true: "True",
  gen_false: "False",
  gen_missing_config: "未找到配置表 {table} 的生成数据。",
  gen_empty_config: "该表没有配置字段。",
  gen_capability: "能力",
  gen_status: "状态",
  gen_package: "包",
  gen_supported: "支持",
  gen_missing_features: "未找到适配器能力数据。",
  gen_option: "选项",
  gen_value: "取值",
  gen_flag: "开关",
  gen_arguments: "参数：",
  gen_argument_required: "必填",
  gen_argument_optional: "可选",
  gen_argument_separator: "、",
  gen_missing_command: "未找到命令 {command} 的生成数据。",
  gen_feature_image: "图片",
  gen_feature_audio: "音频",
  gen_feature_rss: "RSS 推送",
};

const Shell = defineComponent({
  setup(_, { slots }) {
    provideAkariConfig();
    return () => slots.default?.();
  },
});

function render(component: Component, props: Record<string, unknown> = {}): Promise<string> {
  return renderToString(
    createSSRApp({
      render: () => h(Shell, null, { default: () => h(component, props) }),
    }),
  );
}

beforeEach(() => {
  boxes.theme.value = { akari: { generated: {} } };
});

describe("generated labels", () => {
  it("填充占位符，未给出的名字保持原样", () => {
    expect(formatGeneratedLabel("共 {count} 项", { count: 3 })).toBe("共 3 项");
    expect(formatGeneratedLabel("表 {table}", {})).toBe("表 {table}");
  });
});

describe("ModuleConfigFields", () => {
  it("按文案渲染表头、字段行与占位", async () => {
    boxes.theme.value = {
      akari: {
        generated: {
          labels,
          packages: {
            demo: {
              facts: {
                config: [
                  {
                    table: "module_demo",
                    file: "config/module_demo.toml",
                    secret: false,
                    fields: [
                      { name: "limit", type: "int", default: 3, secret: true, comment: "数量上限。", required: true },
                      { name: "flag", type: "bool", default: false, secret: false, comment: "" },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    };
    const html = await render(ModuleConfigFields, { table: "module_demo" });
    expect(html).toContain("字段");
    expect(html).toContain("limit");
    expect(html).toContain("必填");
    expect(html).toContain("（敏感）");
    expect(html).toContain("False");
    expect(html).toContain("数量上限。");
  });

  it("缺少表时用文案拼出提示", async () => {
    boxes.theme.value = { akari: { generated: { labels } } };
    const html = await render(ModuleConfigFields, { table: "module_missing" });
    expect(html).toContain("未找到配置表 module_missing 的生成数据。");
    expect(html).not.toContain("<table");
  });

  it("表存在但没有字段时给出空表提示", async () => {
    boxes.theme.value = {
      akari: {
        generated: {
          labels,
          packages: { demo: { facts: { config: [{ table: "module_demo", file: "", secret: false, fields: [] }] } } },
        },
      },
    };
    const html = await render(ModuleConfigFields, { table: "module_demo" });
    expect(html).toContain("该表没有配置字段。");
  });
});

describe("AdapterCapabilities", () => {
  const packages = {
    satori: { facts: { features: { support_image: true, support_rss: false } } },
    kook: { facts: { features: { support_audio: true, support_image: false } } },
  };

  it("矩阵按文案顺序排列能力列", async () => {
    boxes.theme.value = { akari: { generated: { labels, packages } } };
    const html = await render(AdapterCapabilities);
    const image = html.indexOf(">图片<");
    const audio = html.indexOf(">音频<");
    const rss = html.indexOf(">RSS 推送<");
    expect(image).toBeGreaterThan(-1);
    expect(image).toBeLessThan(audio);
    expect(audio).toBeLessThan(rss);
    expect(html).toContain("kook");
    expect(html).toContain("支持");
  });

  it("单适配器模式只列该包的能力", async () => {
    boxes.theme.value = { akari: { generated: { labels, packages } } };
    const html = await render(AdapterCapabilities, { adapter: "satori" });
    expect(html).toContain(">图片<");
    expect(html).toContain(">RSS 推送<");
    expect(html).not.toContain(">音频<");
    expect(html).not.toContain("<code>kook</code>");
  });

  it("没有能力数据时用文案提示", async () => {
    boxes.theme.value = { akari: { generated: { labels } } };
    const html = await render(AdapterCapabilities);
    expect(html).toContain("未找到适配器能力数据。");
  });
});

describe("CliCommandOptions", () => {
  it("渲染用法、参数与选项表", async () => {
    boxes.theme.value = {
      akari: {
        generated: {
          labels,
          cli: {
            "module add": {
              usage: "akaribot module add [OPTIONS] [name]",
              summary: "安装模块。",
              arguments: [{ name: "name", required: false }],
              options: [
                { names: ["--dist"], metavar: "TEXT", help: "发行名。", isFlag: false, required: false, default: null },
                { names: ["--force", "-f"], metavar: "", help: "强制安装。", isFlag: true, required: false, default: "false" },
              ],
            },
          },
        },
      },
    };
    const html = await render(CliCommandOptions, { command: "module add" });
    expect(html).toContain("akaribot module add [OPTIONS] [name]");
    expect(html).toContain("参数：");
    expect(html).toContain("可选");
    expect(html).toContain("--dist");
    expect(html).toContain("TEXT");
    expect(html).toContain("开关");
  });

  it("缺少命令时用文案拼出提示", async () => {
    boxes.theme.value = { akari: { generated: { labels } } };
    const html = await render(CliCommandOptions, { command: "module ghost" });
    expect(html).toContain("未找到命令 module ghost 的生成数据。");
  });
});

describe("generated components", () => {
  const names = ["ModuleConfigFields", "AdapterCapabilities", "CliCommandOptions"];

  it("模板里没有硬编码文案，文字全部来自 labels", () => {
    for (const name of names) {
      const file = new URL(`../docs/.vitepress/theme/components/content/${name}.vue`, import.meta.url);
      const source = readFileSync(file, "utf-8");
      const template = source.split("<template>")[1]?.split("</template>")[0] ?? "";
      expect(template.length).toBeGreaterThan(0);
      expect(template).not.toMatch(/[\u4e00-\u9fff]/);
      expect(source).toMatch(/label\("gen_[a-z_]+"/);
    }
  });
});
