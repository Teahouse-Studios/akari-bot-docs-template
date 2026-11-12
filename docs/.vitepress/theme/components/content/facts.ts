/**
 * 模块事实句的文本构造。
 *
 * 模块页在「配置」「数据表」「命令」三处重复同一批句子，句式固定、只有表名与模块名变化。
 * 组件只负责呈现，句子在这里拼装，便于单测与后续新增事实类型。
 */

/** 片段为纯文本或代码片段，代码片段渲染为 `<code>`。 */
export type FactSegment = { text: string } | { code: string };

function text(value: string): FactSegment {
  return { text: value };
}

function code(value: string): FactSegment {
  return { code: value };
}

export interface ConfigFacts {
  /** 模块配置表名，取自 `manifest.toml` 的 `config_table`。 */
  table?: string;
  /** 配置文件路径；缺省为 `config/<表名>.toml`。 */
  file?: string;
}

export function configSegments(props: ConfigFacts): FactSegment[] {
  const table = (props.table ?? "").trim();
  if (!table) {
    return [text("模块没有配置项。")];
  }
  const file = (props.file ?? "").trim() || `config/${table}.toml`;
  return [text("配置表 "), code(table), text("，配置文件位于 "), code(file), text("。")];
}

export interface DataFacts {
  /** 模块拥有的数据表，数组或以逗号分隔的表名。 */
  tables?: string | string[];
  /** 表结构所在文件；缺省为 `database/models.py`。 */
  model?: string;
  /** 是否在句中列出表名；页面随后用表格罗列表结构时关闭。 */
  list?: boolean;
}

export function tableNames(tables?: string | string[]): string[] {
  if (!tables) {
    return [];
  }
  const items = Array.isArray(tables) ? tables : tables.split(",");
  return items.map((item) => item.trim()).filter(Boolean);
}

export function dataSegments(props: DataFacts): FactSegment[] {
  const tables = tableNames(props.tables);
  if (!tables.length) {
    return [text("模块不保存数据。")];
  }
  const model = (props.model ?? "").trim() || "database/models.py";
  if (props.list === false) {
    const count = `${tables.length} 张数据表`;
    return [text("模块共有 "), text(count), text("，表结构位于 "), code(model), text("。")];
  }
  const declaration = code(`owned_tables = [${tables.map((table) => `"${table}"`).join(", ")}]`);
  return [text("模块的数据表为 "), declaration, text("，表结构位于 "), code(model), text("。")];
}

export interface AliasFacts {
  /** 模块级别名，数组或以逗号分隔的别名。 */
  names?: string | string[];
}

/** 模块级别名（`module(..., alias=...)`），对模块下所有命令生效。 */
export function aliasNames(names?: string | string[]): string[] {
  return tableNames(names);
}

/** 用法片段：普通文本，或一个参数占位符。 */
export type UsageSegment =
  | { kind: "text"; text: string }
  | { kind: "param"; text: string; name: string; required: boolean };

/**
 * 解析用法行：`<name>` 为必填参数，`[<name>]` 为可选参数，方括号可嵌套。
 * 方括号本身留在文本片段里，只有尖括号内的名字会成为参数。
 */
export function usageSegments(usage: string): UsageSegment[] {
  const segments: UsageSegment[] = [];
  let depth = 0;
  let buffer = "";
  const flush = () => {
    if (buffer) {
      segments.push({ kind: "text", text: buffer });
      buffer = "";
    }
  };
  for (let index = 0; index < usage.length; index += 1) {
    const char = usage[index];
    if (char === "[") {
      depth += 1;
      buffer += char;
      continue;
    }
    if (char === "]") {
      depth = Math.max(0, depth - 1);
      buffer += char;
      continue;
    }
    if (char === "<") {
      const end = usage.indexOf(">", index + 1);
      const name = end > index + 1 ? usage.slice(index + 1, end).trim() : "";
      if (name && !/\s/.test(name)) {
        flush();
        segments.push({ kind: "param", text: usage.slice(index, end + 1), name, required: depth === 0 });
        index = end;
        continue;
      }
    }
    buffer += char;
  }
  flush();
  return segments;
}

/** 参数说明：`["name=说明"]` 或 `{ name: "说明" }`。 */
export type ParamSpec = Record<string, string> | string[];

export interface ParamDoc {
  name: string;
  /** 用法里的写法，必填为 `<name>`，可选为 `[name]`。 */
  symbol: string;
  description: string;
  required: boolean;
}

function paramSpec(specs?: ParamSpec): Record<string, string> {
  if (!specs) {
    return {};
  }
  if (!Array.isArray(specs)) {
    return { ...specs };
  }
  const map: Record<string, string> = {};
  for (const entry of specs) {
    const separator = entry.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const name = entry.slice(0, separator).trim();
    const description = entry.slice(separator + 1).trim();
    if (name && description) {
      map[name] = description;
    }
  }
  return map;
}

/**
 * 按用法行的出现顺序汇总参数；同一参数出现在多条用法里时，
 * 只要有一处必填就记为必填（该命令在某些用法下无法省略）。
 */
export function paramDocs(usages: string[], specs?: ParamSpec): ParamDoc[] {
  const descriptions = paramSpec(specs);
  const order: string[] = [];
  const required = new Map<string, boolean>();
  for (const usage of usages) {
    for (const segment of usageSegments(usage)) {
      if (segment.kind !== "param") {
        continue;
      }
      if (!required.has(segment.name)) {
        order.push(segment.name);
        required.set(segment.name, false);
      }
      required.set(segment.name, required.get(segment.name) || segment.required);
    }
  }
  return order.map((name) => {
    const isRequired = required.get(name) === true;
    return {
      name,
      symbol: isRequired ? `<${name}>` : `[${name}]`,
      description: descriptions[name] ?? "",
      required: isRequired,
    };
  });
}
