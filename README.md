# CantRead

**For brains that bounce off walls of text.** · 献给被长篇大论劝退的你和我。

CantRead 把 NLP 的**词性识别**变成视觉信号——就像代码的语法高亮，只不过是给自然语言用的。眼睛有了落脚点，扫一眼就能抓住句子的骨架，再决定要不要细读。

*Syntax highlighting, but for natural language.*

![Before / After](packages/firefox-extension/store/before-after-light.png)

| 层 Layer | 样式 Style | 作用 Role |
|---|---|---|
| **名词 Nouns** | **加粗** | 概念标签：这句话在说什么 |
| **动词 Verbs** | 🟡 黄色高亮 | 动作：发生了什么 |
| *形容词/副词 Adj/Adv* | 🟢 绿色斜体 | 修饰：补充细节 |
| 数字 Numbers | 🟠 橙色 | 数量、日期 |

这套格式叫 **TABE**。它来自作者 Ahui（dyslexia + ADHD）找工作期间做笔记时自然形成的写法，后来发现对所有「一看到大段文字就读不进去」的人都有用。

---

## 产品 *Products*

CantRead 是一个大项目，里面有几个产品，**共用同一个 TABE 引擎**（[`packages/core/`](packages/core/)）：

| 产品 | 状态 | 在哪 | 安装 |
|---|---|---|---|
| 🦊 **Firefox 插件** —— 读网页、邮件、新闻 | ✅ v1.0 · 商店审核中 | [`packages/firefox-extension/`](packages/firefox-extension/) | [安装说明](packages/firefox-extension/README.md#安装-install) |
| 🌐 **Chrome / Edge 插件** | 📋 计划中 | —— | —— |
| 🟣 **Obsidian 插件** —— 在 Obsidian 里读笔记 | ✅ v0.1.1 | [`tabe-reader/`](tabe-reader/) | [安装说明](#obsidian-插件) |
| 🧪 **网页 demo** —— 粘贴文字直接试 | ✅ 在线 | [`docs/`](docs/) | <https://oldmercy.github.io/CantRead/> |
| 📄 **PDF / 论文阅读、ADHD 带读模式……** | 📋 计划中 | —— | 见 [路线图](ROADMAP.md) |

👉 **以后要做什么**：见 [**ROADMAP.md**](ROADMAP.md)。方向是**插件优先**——大部分阅读都发生在浏览器里，插件的摩擦最低。

---

## 🦊 Firefox 插件

点一下工具栏图标，当前页面就高亮；可以单独关掉某一层；快捷键 **⌥⇧H**；选中一段右键只高亮那段。**全部在本机运行，不收集任何数据。**

详细的安装和使用说明：[packages/firefox-extension/README.md](packages/firefox-extension/README.md)

---

## 🟣 Obsidian 插件

在 Obsidian 的 **Reading View** 里自动加 TABE 格式，**不修改你的源文件**。

**通过 BRAT 安装**

1. 在 Obsidian 安装 BRAT 插件：`Settings → Community Plugins → Browse → BRAT`
2. `BRAT → Add Beta Plugin`，填入 `https://github.com/oldmercy/CantRead`
3. 在 Community Plugins 里启用 **TABE Reader**，打开任意笔记的 Reading View 就生效

**手动安装**：把 [`tabe-reader/`](tabe-reader/) 里的 `main.js` · `manifest.json` · `styles.css` 三个文件放进 `.obsidian/plugins/tabe-reader/`，然后在 Community Plugins 里启用。

**使用**：`⌘⇧T` 开关格式化 · `⌘⇧A` 切换 AI 模式 · `Settings → TABE Reader` 可以单独开关每一层。

> 📦 **想要最初那个纯 Obsidian 版本的仓库快照？** 在 GitHub 的 [Releases / Tags](https://github.com/oldmercy/CantRead/tags) 里选 **`0.1.1`**，那一版永远保持原样。

### 三条技术路线 *Three routes*（Obsidian 插件）

- **Route A · 机械 Bionic** —— 每个词前几个字母加粗，不分析词性，完全离线
- **Route B · 本地 NLP（默认）** —— 英文用 [compromise.js](https://github.com/spencermountain/compromise)，中文用规则引擎；免费、离线、不需要 API key
- **Route C · AI 语义（可选）** —— 接入 OpenAI / Claude / Ollama 等，用户自带 API key，key 只存在你本地

| Provider | 默认模型 | API Key |
|---|---|---|
| OpenAI | `gpt-4o-mini` | `sk-…` |
| Claude | `claude-3-5-haiku-20241022` | `sk-ant-…` |
| Custom / Ollama | `llama3` | 可留空 |

---

## 语言支持 *Languages*

- **英文** —— compromise.js 词性标注，比较准确
- **中文** —— 规则引擎（最大前向匹配 + 内建词典），还在改进中
- **中英混合** —— 自动检测，按段落分别处理

---

## 仓库结构 *Repository layout*

```
CantRead/
├── packages/
│   ├── core/               TABE 引擎（所有产品共用）
│   └── firefox-extension/  浏览器插件
├── tabe-reader/            Obsidian 插件
├── docs/                   网页 demo（GitHub Pages）
├── prototypes/             ADHD 阅读辅助的实验原型
└── ROADMAP.md              路线图
```

**开发**：`npm install` → `npm run build`（构建引擎 + 浏览器插件）→ `npm test`。各产品的细节见各自目录的 README。

---

## 参与 *Contributing*

欢迎提 [Issue](https://github.com/oldmercy/CantRead/issues) 或 PR，尤其是中文词典扩充、新语言支持、以及「我读 X 类网页时效果不好」这类真实反馈。

MIT License · Made by Ahui ([@oldmercy](https://github.com/oldmercy))
