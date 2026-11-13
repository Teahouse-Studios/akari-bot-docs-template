import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import ChatExample from "../docs/.vitepress/theme/components/content/ChatExample.vue";
import {
  chatBubbles,
  chatButtonBubbles,
  chatSegments,
} from "../docs/.vitepress/theme/components/content/chat";

describe("chatBubbles", () => {
  it("按前缀区分用户与机器人消息", () => {
    expect(chatBubbles(["用户：~whois example.com", "机器人：域名：example.com"])).toEqual([
      { role: "user", text: "~whois example.com" },
      { role: "bot", text: "域名：example.com" },
    ]);
  });

  it("无前缀的续行归入上一条气泡", () => {
    expect(chatBubbles(["机器人：第一行", "第二行", "", "用户：收到"])).toEqual([
      { role: "bot", text: "第一行\n第二行" },
      { role: "user", text: "收到" },
    ]);
  });

  it("续行保留缩进", () => {
    expect(chatBubbles(["机器人：列表", "  * 一", "    * 二"])).toEqual([
      { role: "bot", text: "列表\n  * 一\n    * 二" },
    ]);
  });

  it("波浪线渲染为时间分隔，并结束上一条气泡", () => {
    expect(
      chatBubbles([
        "用户：~module enable arcaea-rss",
        "机器人：成功：开启模块“arcaea-rss”。",
        "〰〰〰",
        "机器人：发现新的 Arcaea 版本：7.1.0c",
      ]),
    ).toEqual([
      { role: "user", text: "~module enable arcaea-rss" },
      { role: "bot", text: "成功：开启模块“arcaea-rss”。" },
      { role: "divider", text: "" },
      { role: "bot", text: "发现新的 Arcaea 版本：7.1.0c" },
    ]);
  });

  it("分隔后的无前缀行另起机器人气泡", () => {
    expect(chatBubbles(["机器人：之前", "〰〰〰", "之后"])).toEqual([
      { role: "bot", text: "之前" },
      { role: "divider", text: "" },
      { role: "bot", text: "之后" },
    ]);
  });

  it("消息数组优先于日志", () => {
    expect(
      chatBubbles(["用户：日志"], [{ role: "bot", text: "显式消息" }]),
    ).toEqual([{ role: "bot", text: "显式消息" }]);
  });

  it("只有显式 markdown 消息保留 markdown 标记", () => {
    expect(
      chatBubbles([], [{ role: "bot", text: "**成功**", markdown: true }]),
    ).toEqual([{ role: "bot", text: "**成功**", markdown: true }]);
    expect(chatBubbles(["机器人：**成功**"])).toEqual([
      { role: "bot", text: "**成功**" },
    ]);
  });

  it("尾部图片另起气泡，文本留在原气泡", () => {
    expect(
      chatBubbles(["机器人：搜索结果", "![苔藓块](moss.png)"]),
    ).toEqual([
      { role: "bot", text: "搜索结果" },
      { role: "bot", text: "![苔藓块](moss.png)" },
    ]);
  });

  it("多张尾部图片共用一个气泡", () => {
    expect(
      chatBubbles(["机器人：结果", "![苔藓块](moss.png)", "![苍白苔藓块](pale.png)"]),
    ).toEqual([
      { role: "bot", text: "结果" },
      { role: "bot", text: "![苔藓块](moss.png)\n![苍白苔藓块](pale.png)" },
    ]);
  });
  it("拆分尾部图片时保留 natural 标记", () => {
    expect(
      chatBubbles(["机器人：渲染图", "![渲染图](render.png){natural}"]),
    ).toEqual([
      { role: "bot", text: "渲染图" },
      { role: "bot", text: "![渲染图](render.png){natural}" },
    ]);
  });

  it("非尾部图片仍与文本留在同一气泡", () => {
    expect(
      chatBubbles(["机器人：前 ![苔藓块](moss.png) 后"]),
    ).toEqual([{ role: "bot", text: "前 ![苔藓块](moss.png) 后" }]);
  });

  it("只有图片的消息保持为一个气泡", () => {
    expect(chatBubbles(["机器人：![苔藓块](moss.png)"])).toEqual([
      { role: "bot", text: "![苔藓块](moss.png)" },
    ]);
  });

  it("显式消息数组同样拆分尾部图片", () => {
    expect(
      chatBubbles([], [{ role: "bot", text: "文本\n![图](a.png)" }]),
    ).toEqual([
      { role: "bot", text: "文本" },
      { role: "bot", text: "![图](a.png)" },
    ]);
  });
});

describe("chatButtonBubbles", () => {
  it("把按钮的字符串回复折成气泡", () => {
    expect(
      chatButtonBubbles({
        label: "查看 B30",
        reply: "机器人：![B30 成绩图](/images/b30.png)",
      }),
    ).toEqual([{ role: "bot", text: "![B30 成绩图](/images/b30.png)" }]);
  });

  it("按钮回复支持多行日志", () => {
    expect(
      chatButtonBubbles({
        label: "继续",
        reply: ["用户：继续", "机器人：已完成"],
      }),
    ).toEqual([
      { role: "user", text: "继续" },
      { role: "bot", text: "已完成" },
    ]);
  });

  it("按钮回复的尾部图片另起气泡", () => {
    expect(
      chatButtonBubbles({
        label: "查看",
        reply: ["机器人：结果", "![图](/images/a.png)"],
      }),
    ).toEqual([
      { role: "bot", text: "结果" },
      { role: "bot", text: "![图](/images/a.png)" },
    ]);
  });

  it("按钮显式消息优先于回复日志", () => {
    expect(
      chatButtonBubbles({
        label: "继续",
        reply: "机器人：日志",
        messages: [{ role: "bot", text: "显式消息" }],
      }),
    ).toEqual([{ role: "bot", text: "显式消息" }]);
  });
});

describe("chatSegments", () => {
  it("把反引号内容切成代码片段", () => {
    expect(chatSegments("执行 `~whois example.com` 后返回")).toEqual([
      { text: "执行 " },
      { code: "~whois example.com" },
      { text: " 后返回" },
    ]);
  });

  it("把 Markdown 图片切成独立片段并保留说明", () => {
    expect(chatSegments("成绩如下：![B30 成绩图](/images/b30.png)\n仅供参考")).toEqual([
      { text: "成绩如下：" },
      { image: { src: "/images/b30.png", alt: "B30 成绩图" } },
      { text: "\n仅供参考" },
    ]);
  });

  it("图片与行内代码交替出现时保持顺序", () => {
    expect(chatSegments("`~b30` ![结果](/b30.png) 完成")).toEqual([
      { code: "~b30" },
      { text: " " },
      { image: { src: "/b30.png", alt: "结果" } },
      { text: " 完成" },
    ]);
  });

  it("不完整的图片写法按文本保留", () => {
    expect(chatSegments("待补：![缺少地址]")).toEqual([{ text: "待补：![缺少地址]" }]);
  });
  it("图片后的 natural 标记表示按原始尺寸展示", () => {
    expect(chatSegments("![渲染图](/images/render.png){natural}")).toEqual([
      { image: { src: "/images/render.png", alt: "渲染图", natural: true } },
    ]);
  });
});

function renderChat(props: Record<string, unknown>): Promise<string> {
  const app = createSSRApp({ render: () => h(ChatExample, props) });
  // 测试环境没有注册 M3E 的图标元素，用同名组件记录名称即可。
  app.component(
    "m3e-icon",
    defineComponent({
      props: { name: { type: String, default: "" } },
      setup(props) {
        return () => h("span", { class: "m3e-icon", "data-name": props.name });
      },
    }),
  );
  app.component(
    "m3e-icon-button",
    defineComponent({
      setup(_, { slots }) {
        return () => h("button", { class: "m3e-icon-button" }, slots.default?.());
      },
    }),
  );
  return renderToString(app);
}

describe("ChatExample", () => {
  it("渲染用户与机器人气泡，并显示机器人头像", async () => {
    const html = await renderChat({
      botAvatar: "/site-avatar.jpg",
      log: ["用户：~whois example.com", "机器人：域名：`example.com`"],
    });
    expect(html).toContain("chat-example__row--user");
    expect(html).toContain("chat-example__row--bot");
    expect(html).toContain('src="/site-avatar.jpg"');
    expect(html).toContain("<code>example.com</code>");
    expect(html).toContain('data-name="person"');
  });

  it("只把显式 markdown 消息按 Markdown 渲染", async () => {
    const html = await renderChat({
      messages: [
        {
          role: "bot",
          markdown: true,
          text: "**成功**，见 [文档](https://example.com)。\n- 第一项\n- 第二项\n\n```js\nconst answer = 42;\n```",
        },
      ],
    });
    expect(html).toContain("<strong>成功</strong>");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
    expect(html).toContain("<ul>");
    expect(html).toContain("<pre><code class=\"language-js\">");
  });

  it("log 简写与未标记消息按纯文本渲染", async () => {
    const logHtml = await renderChat({
      log: ["机器人：**成功**，见 [文档](https://example.com)。"],
    });
    expect(logHtml).toContain("**成功**");
    expect(logHtml).toContain("[文档](https://example.com)");
    expect(logHtml).not.toContain("<strong>");

    const messageHtml = await renderChat({
      messages: [{ role: "bot", text: "**成功**" }],
    });
    expect(messageHtml).toContain("**成功**");
    expect(messageHtml).not.toContain("<strong>");
  });

  it("显式 markdown 消息中的图片保留 natural 与查看入口", async () => {
    const html = await renderChat({
      messages: [{ role: "bot", markdown: true, text: "![泥土](/images/dirt.jpg){natural}" }],
    });
    expect(html).toContain("chat-example__image--natural");
    expect(html).toContain('data-chat-image');
    expect(html).toContain('data-natural="1"');
    expect(html).toContain('src="/images/dirt.jpg"');
  });

  it("不执行显式 markdown 消息中的原始 HTML", async () => {
    const html = await renderChat({
      messages: [{ role: "bot", markdown: true, text: "<script>alert(1)</script>" }],
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("没有头像时退回机器人图标", async () => {
    const html = await renderChat({ log: ["机器人：你好"] });
    expect(html).toContain('data-name="smart_toy"');
    expect(html).not.toContain("chat-example__avatar--bot\"><img");
  });

  it("渲染时间分隔而不渲染头像", async () => {
    const html = await renderChat({
      log: ["机器人：成功。", "〰〰〰", "机器人：推送内容"],
    });
    expect(html).toContain("chat-example__divider");
    expect(html).toContain('role="separator"');
    expect(html).toContain("Some time later");
    const divider = html.slice(
      html.indexOf("chat-example__divider"),
      html.indexOf("chat-example__row"),
    );
    expect(divider).not.toContain("chat-example__avatar");
  });

  it("渲染消息按钮与重置入口，按钮结果不在初始内容中", async () => {
    const html = await renderChat({
      log: ["用户：~wiki search 苔藓块", "机器人：搜索结果：1. 苔藓块"],
      buttons: [
        {
          label: "苔藓块",
          reply: ["机器人：懒加载结果", "![苔藓块](/images/moss.png)"],
        },
      ],
    });
    expect(html).toContain("chat-example__buttons");
    expect(html).toContain("苔藓块");
    expect(html).toContain('aria-label="Reset conversation example"');
    expect(html).toContain('data-name="restart_alt"');
    expect(html).not.toContain("懒加载结果");
  });

  it("末条为用户消息时不挂消息按钮", async () => {
    const html = await renderChat({
      log: ["用户：~wiki"],
      buttons: [{ label: "渲染预览图" }],
    });
    expect(html).toContain("chat-example__row--user");
    expect(html).not.toContain("chat-example__buttons");
  });

  it("渲染机器人卡片消息", async () => {
    const html = await renderChat({
      log: ["用户：~wiki 石头"],
      card: {
        title: "石头",
        description: "石头（Stone）是在主世界中大量存在的方块。",
        url: "https://zh.minecraft.wiki/w/石头",
        image: "wiki-card-stone.png",
        domain: "zh.minecraft.wiki",
      },
    });
    expect(html).toContain("chat-example__row--card");
    expect(html).toContain("wiki-card__title");
    expect(html).toContain("石头（Stone）是在主世界中大量存在的方块。");
    expect(html).toContain("zh.minecraft.wiki");
    expect(html).toContain('data-name="link"');
    expect(html).toContain("wiki-card-stone.png");
  });

  it("在气泡对应位置渲染图片缩略图", async () => {
    const html = await renderChat({
      log: ["机器人：成绩如下：![B30 成绩图](/images/b30.png)"],
    });
    expect(html).toContain("chat-example__image");
    expect(html.match(/chat-example__row--bot/g)).toHaveLength(2);
    expect(html).toContain('src="/images/b30.png"');
    expect(html).toContain('alt="B30 成绩图"');
    expect(html).toContain('aria-label="View image: B30 成绩图"');
    expect(html.match(/chat-example__bubble--image/g)).toHaveLength(1);
    expect(html).not.toContain("chat-lightbox");
  });

  it("纯图片消息不套气泡", async () => {
    const html = await renderChat({
      log: ["机器人：![图一](/images/a.png)", "![图二](/images/b.png)"],
    });
    expect(html.match(/chat-example__bubble--image/g)).toHaveLength(1);
    expect(html).toContain("chat-example__image");
  });
  it("natural 图片使用原始尺寸样式", async () => {
    const html = await renderChat({
      log: ["机器人：![渲染图](/images/render.png){natural}"],
    });
    expect(html).toContain("chat-example__image--natural");
    expect(html).toContain('src="/images/render.png"');
  });

  it("固定图片宽度时写入样式变量", async () => {
    const html = await renderChat({
      imageWidth: 320,
      log: ["机器人：![棋盘](/images/board.png)", "![键盘](/images/keyboard.png)"],
    });
    expect(html).toContain("chat-example--fixed-image-width");
    expect(html).toContain("--chat-example-image-width:320px");
  });
});
