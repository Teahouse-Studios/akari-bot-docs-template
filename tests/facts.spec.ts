import { describe, expect, it } from "vitest";

import {
  configSegments,
  dataSegments,
  paramDocs,
  tableNames,
  usageSegments,
  type FactSegment,
} from "../docs/.vitepress/theme/components/content/facts";

function plain(segments: FactSegment[]): string {
  return segments.map((segment) => ("code" in segment ? segment.code : segment.text)).join("");
}

describe("configSegments", () => {
  it("缺少表名时说明没有配置项", () => {
    expect(plain(configSegments({}))).toBe("模块没有配置项。");
  });

  it("声明 config_table 时给出配置表与默认配置文件路径", () => {
    expect(plain(configSegments({ table: "module_coin" }))).toBe(
      "配置表 module_coin，配置文件位于 config/module_coin.toml。",
    );
  });

  it("允许覆盖配置文件路径", () => {
    expect(plain(configSegments({ table: "bot_telegram", file: "config/bot_telegram-alt.toml" }))).toBe(
      "配置表 bot_telegram，配置文件位于 config/bot_telegram-alt.toml。",
    );
  });
});

describe("dataSegments", () => {
  it("缺少表名时说明不保存数据", () => {
    expect(plain(dataSegments({}))).toBe("模块不保存数据。");
  });

  it("列出表名并给出表结构位置", () => {
    expect(plain(dataSegments({ tables: "module_phigros_bind_info" }))).toBe(
      '模块的数据表为 owned_tables = ["module_phigros_bind_info"]，表结构位于 database/models.py。',
    );
  });

  it("接受表名数组并保持顺序", () => {
    expect(plain(dataSegments({ tables: ["module_a", "module_b"] }))).toBe(
      '模块的数据表为 owned_tables = ["module_a", "module_b"]，表结构位于 database/models.py。',
    );
  });

  it("关闭列表时只报数量", () => {
    expect(plain(dataSegments({ tables: "module_a,module_b", list: false }))).toBe(
      "模块共有 2 张数据表，表结构位于 database/models.py。",
    );
  });
});

describe("tableNames", () => {
  it("忽略空白项", () => {
    expect(tableNames(" module_a , ,module_b ")).toEqual(["module_a", "module_b"]);
    expect(tableNames(undefined)).toEqual([]);
  });
});

describe("usageSegments", () => {
  it("把必填参数与前后文本分开", () => {
    expect(usageSegments("wiki <pagename>")).toEqual([
      { kind: "text", text: "wiki " },
      { kind: "param", text: "<pagename>", name: "pagename", required: true },
    ]);
  });

  it("方括号内的参数为可选，括号本身留在文本里", () => {
    expect(usageSegments("查询 [<city>]")).toEqual([
      { kind: "text", text: "查询 [" },
      { kind: "param", text: "<city>", name: "city", required: false },
      { kind: "text", text: "]" },
    ]);
  });

  it("嵌套方括号内的参数仍为可选", () => {
    const params = usageSegments("[<a> [<b>]]").filter((segment) => segment.kind === "param");
    expect(params.map((segment) => segment.required)).toEqual([false, false]);
  });
});

describe("paramDocs", () => {
  it("按出现顺序汇总并补上说明", () => {
    expect(paramDocs(["wiki <pagename> [<section>]"], ["section=章节名", "pagename=页面名称"])).toEqual([
      { name: "pagename", symbol: "<pagename>", description: "页面名称", required: true },
      { name: "section", symbol: "[section]", description: "章节名", required: false },
    ]);
  });

  it("同一参数在任一用法中必填即记为必填", () => {
    const [doc] = paramDocs(["list [<count>]", "list <count>"]);
    expect(doc.required).toBe(true);
    expect(doc.symbol).toBe("<count>");
  });

  it("接受对象形式的说明并忽略空说明", () => {
    expect(paramDocs(["<a> <b>"], { a: "甲" })).toEqual([
      { name: "a", symbol: "<a>", description: "甲", required: true },
      { name: "b", symbol: "<b>", description: "", required: true },
    ]);
  });
});
