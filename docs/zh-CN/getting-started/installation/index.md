---
icon: package_2
order: 1
---

# 安装

Vitepress Theme Akari Docs 是一个 GitHub 模板仓库。用它创建自己的仓库后，仓库里就有主题源码、配置与示例文档。不需要另外安装主题包。

## 从模板创建仓库

1. 打开 [OasisAkari/vitepress-theme-akari-docs](https://github.com/OasisAkari/vitepress-theme-akari-docs)，点击 **Use this template** → **Create a new repository**。
2. 填写仓库名称与可见性后创建。新仓库带有模板的全部文件，提交历史从头开始，与模板原仓库之间没有分叉关系。
3. 克隆到本地，安装依赖并启动：

   ```bash
   git clone https://github.com/<账号>/<仓库名>.git
   cd <仓库名>
   npm install
   npm run dev
   ```

用 GitHub CLI 可以一步创建并克隆：

```bash
gh repo create my-docs --template OasisAkari/vitepress-theme-akari-docs --public --clone
```

## 环境要求

- Node.js 版本为 `>=22.12.0`，见 `package.json` 的 `engines`。模板在 Node.js `24.21.0`、npm `12.2.1` 下验证。
- 需要 npm。仓库只保留一份 `package-lock.json`，持续集成中用 `npm ci` 按锁文件安装。

## 常用命令

开发服务器默认运行在 `http://localhost:5173`。

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器。修改 Markdown 即时更新，修改 `config.ts` 后自动重启 |
| `npm run build` | 构建静态站点到 `docs/.vitepress/dist` |
| `npm run preview` | 本地预览构建结果 |
| `npm run typecheck` | 用 `vue-tsc --noEmit` 检查主题与测试 |
| `npm test` | 运行 Vitest 单元测试 |

## 换成自己的站点

- 站点名称、版本号、社交链接与页尾都在 `docs/config.ts` 与各语言的 `config.ts` 中设置，见[配置](/zh-CN/getting-started/configuration)。
- logo 是 `docs/public/logo.svg`。
- 本站文档放在各语言的文件夹里。保留需要的语言，删去其余的文件夹，再在留下的文件夹里写自己的页面。写法见[撰写页面](/zh-CN/getting-started/writing)。

## 同步模板的更新

用模板创建的仓库与模板原仓库之间没有关联，模板之后的更新不会自动进入你的仓库。需要时把模板加为远程仓库，再取回主题所在的 `docs/.vitepress`：

```bash
git remote add template https://github.com/OasisAkari/vitepress-theme-akari-docs.git
git fetch template
git checkout template/main -- docs/.vitepress
```

这条命令会用模板的版本覆盖这个目录，自己对主题的修改要重新合并。`package.json` 中依赖的变化也要一并对照。

## 版本基线

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| `vitepress` | `2.0.0-alpha.21` | 固定版本，基于 Vite 8 / Rolldown 与 Vue 3.5 |
| `@m3e/web` | `2.10.3` | Material 3 Expressive Web Components |
| `@m3e/icons` | `1.0.21` | 按需注册的 Material Symbols 图标 |

VitePress 仍处于 alpha 阶段，升级时需要一并检查主题代码、配置类型与构建输出。

## 目录结构

```text
.
├── docs/
│   ├── config.ts                  各语言共用的配置
│   ├── en-US/                     English，放在站点根路径
│   │   ├── config.ts              覆写共用配置
│   │   ├── index.md               首页
│   │   └── getting-started/       rail 分类
│   │       └── installation/
│   │           └── index.md       文章 /getting-started/installation.html
│   ├── zh-CN/                     简体中文，放在 /zh-CN/
│   ├── public/                    静态资源
│   └── .vitepress/
│       ├── config.mts             把主题接入 VitePress
│       ├── content/               由目录生成语言、地址与导航
│       └── theme/                 主题源码
├── tests/                         单元测试
└── package.json
```

页面与配置的放置方式见[配置](/zh-CN/getting-started/configuration)与[撰写页面](/zh-CN/getting-started/writing)，主题源码的结构见[扩展主题](/zh-CN/theme/extending/api#源码结构)。

## 部署

`npm run build` 的产物是纯静态文件，可以放到任意静态托管服务上。

- **页面地址**：本站关闭了 `cleanUrls`，页面地址带 `.html`（`/theme/layout.html`）。地址与构建产物中的文件一一对应，任何静态托管都能直接提供。
- **不带扩展名的地址**：在 `.vitepress/config.mts` 中设置 `cleanUrls: true`。这时托管服务找不到文件，需要补上 `.html` 再找一次。GitHub Pages、Netlify 与 Cloudflare Pages 默认如此。Vercel 需要在 `vercel.json` 中设置 `"cleanUrls": true`。Nginx 写 `try_files $uri $uri.html $uri/ =404;`。
- **部署在子路径**：例如 `https://example.com/docs/`，在 `.vitepress/config.mts` 中设置 `base: "/docs/"`。导航、头图、logo 与搜索索引的站内地址都会自动加上它。
- **搜索索引**：每种语言的索引在构建时打包进产物的 `assets/chunks/`，不需要额外步骤。

## 常见问题

### 页面空白或组件没有样式

主题在浏览器中注册 m3e 组件，注册完成后给 `html` 加上 `data-akari-ready`。页面空白时，先看浏览器控制台有没有模块加载错误。

脚本被禁用或加载失败时，正文会在 3 秒后以纯 HTML 显示。浏览器需要支持 Custom Elements、Shadow DOM 与原生 ES 模块。

### 组件只在浏览器注册

m3e 组件是 Lit 自定义元素，注册要用 `customElements.define`，Node.js 中没有这个 API。主题入口只在浏览器中导入 `m3e.ts`，服务端渲染只输出元素标记与插槽内容。不要在服务端执行的代码里导入 `@m3e/web` 的组件模块。

### 新增的组件或图标不显示

组件与图标都按需注册。组件在 `docs/.vitepress/theme/m3e.ts` 中导入对应子路径，图标在 `icons.ts` 中导入。不要导入 `@m3e/web/all`，它会注册全部组件。未注册的图标显示为空白。

### 构建时提示未知的 Vue 组件

`.vitepress/config.mts` 用 `vue.template.compilerOptions.isCustomElement` 放行了以 `m3e-` 开头的标签。在别的项目中复用主题时，需要保留这段配置。
