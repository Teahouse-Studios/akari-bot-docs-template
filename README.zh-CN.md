[English](README.md) | 简体中文

# Vitepress Theme Akari Docs

Vitepress Theme Akari Docs 是一个使用 VitePress 与 [`@m3e/web`](https://github.com/matraic/m3e) Material 3 Expressive Web Components 构建的文档主题，相较于 [Vitepress Theme Akari Blog](https://github.com/OasisAkari/vitepress-theme-akari-blog) 来说，针对文档场景优化了布局。

## 示例

![](./imgs/overview-zh.png)

![](./imgs/overview-dark-zh.png)

## 环境要求

- Node.js >= 22.12
- npm

## 开发

```bash
npm install
npm run dev
```

默认开发地址为 `http://localhost:5173`。

## 构建与检查

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

生产输出位于 `docs/.vitepress/dist`。

## 配置文档

有关本主题的更多配置文档，请见[这里](https://vitepress-theme-akari-docs.vercel.app/zh-CN/)。
## 与 AkariBot 文档引擎配合

主题以源码目录方式接入。仓库根目录的 `docs-theme.json` 是接入契约，声明主题目录、VitePress 与
Node 版本、npm 依赖与生成配置选项；引擎只复制主题目录，不导入主题代码。

在实例的 `docs.toml` 中指定主题：

```toml
[theme]
source = "file:/path/to/akari-bot-docs-template"
```

以下组件已全局注册，所有 Markdown 页面均可直接使用：

- `ModuleMeta`：模块名、别名、能力、权限与平台标记。
- `ModuleConfig`：配置表与配置文件路径；未声明配置表时说明模块没有配置项。
- `ModuleData`：模块拥有的数据表与表结构位置；没有表时说明不保存数据。
- `ModuleAlias`：模块级别名；写在章节标题下，对该节所有命令生效。
- `NoticeBox`：提示框，类型取 `info`、`tip`、`warning`、`danger`、`example`、`help`。
- `CommandUsage`：权限与别名标记、带站点命令前缀的用法行、参数清单，以及以列表呈现的选项；`params` 逐项说明用法里的 `<占位符>`（尖括号必填、方括号可选，由用法行自动判定），前缀取自主题配置的 `commandPrefix`，`prefix` 可覆盖，`type` 只在正则等非前缀触发方式上设置。

组件使用 M3E 颜色令牌，界面会跟随读者的种子色、明暗模式与对比度设置。
