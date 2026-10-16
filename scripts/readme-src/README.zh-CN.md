# CantRead

[English](README.md) | **简体中文**

**献给一看到大段文字就读不进去的你和我。** *For brains that bounce off walls of text.*

> 💡 这份 README 本身就是用 TABE 格式写的：你现在读到的就是它的效果。**受限于 GitHub 的规则（不允许给文字加颜色）**，这里只能显示**名词加粗**、<mark>动词高亮</mark>和*形容词斜体*，看不到绿色和橙色。完整颜色请看下方的对比图或[在线演示页面](https://oldmercy.github.io/CantRead/)。中文部分目前是**手动标注**的，因为引擎的中文分词还在改进。想看纯文字？这里是[无格式版本](scripts/readme-src/README.zh-CN.md)。

**CantRead** 把**词性识别**<mark>变成</mark>*视觉*信号，就像**代码**的**语法高亮**，只不过是给*自然*语言用的。**眼睛**有了**落脚点**，<mark>扫</mark>一眼就能<mark>抓住</mark>**句子**的**骨架**，再<mark>决定</mark>要不要*细*读。

![Before / After](packages/firefox-extension/store/before-after-light.png)

| 层 | 样式 | 作用 |
|---|---|---|
| **名词** | **加粗** | 概念标签：这句话在说什么 |
| <mark>动词</mark> | <mark>黄色高亮</mark> | 动作：发生了什么 |
| *形容词 / 副词* | *绿色斜体* | 修饰：补充细节 |
| 数字 | 橙色 | 数量、日期 |

这套**格式**<mark>叫</mark> **TABE**。它<mark>来自</mark>**作者**（**ADHD**）*找工作期间*<mark>做</mark>**笔记**时*自然*<mark>形成</mark>的**写法**，后来<mark>发现</mark>对*所有*「一看到大段文字就读不进去」的人都*有用*。

---

## 产品

CantRead 是**一个大项目**，里面有**几个产品**，<mark>共用</mark>**同一个 TABE 引擎**（[`packages/core/`](packages/core/)）。

| 产品 | 状态 | 在哪 | 安装 |
|---|---|---|---|
| 🦊 **Firefox 插件** —— 读网页、邮件、新闻 | ✅ v1.0 · 商店审核中 | [`packages/firefox-extension/`](packages/firefox-extension/) | [安装说明](packages/firefox-extension/README.zh-CN.md#安装) |
| 🌐 **Chrome / Edge 插件** | 📋 计划中 | —— | —— |
| 🟣 **Obsidian 插件** —— 在 Obsidian 里读笔记 | ✅ v0.1.1 | [`tabe-reader/`](tabe-reader/) | [安装说明](#obsidian-插件) |
| 🧪 **网页 demo** —— 粘贴文字直接试 | ✅ 在线 | [`docs/`](docs/) | <https://oldmercy.github.io/CantRead/> |
| 📄 **PDF / 论文阅读、ADHD 带读模式……** | 📋 计划中 | —— | 见[路线图](ROADMAP.zh-CN.md) |

👉 **以后要做什么**：见 [**路线图**](ROADMAP.zh-CN.md)。**方向**是**插件优先**：*大部分*阅读都<mark>发生</mark>在**浏览器**里，**插件**不需要<mark>导入</mark>任何东西，**摩擦***最低*。

---

## Firefox 插件

<mark>点</mark>一下**工具栏图标**，**当前页面**就<mark>高亮</mark>。可以*单独*<mark>关掉</mark>**某一层**，按 `⌥⇧H`（Windows：`Alt+Shift+H`）<mark>开关</mark>，或者<mark>选中</mark>**一段文字**后<mark>右键</mark>只<mark>高亮</mark>那一段。**全部在本机运行，不收集任何数据。**

详细的安装和使用说明：[packages/firefox-extension/README.zh-CN.md](packages/firefox-extension/README.zh-CN.md)

---

## Obsidian 插件

在 **Obsidian** 的 **Reading View** 里*自动*<mark>加上</mark> **TABE 格式**，*不*<mark>修改</mark>你的**源文件**。

**通过 BRAT 安装**

1. 在 Obsidian 安装 BRAT 插件：`Settings → Community Plugins → Browse → BRAT`
2. 打开 `BRAT → Add Beta Plugin`，填入 `https://github.com/oldmercy/CantRead`
3. 在 Community Plugins 里启用 **TABE Reader**，打开任意笔记的 Reading View 就生效

**手动安装**：把 [`tabe-reader/`](tabe-reader/) 里的 `main.js`、`manifest.json`、`styles.css` 三个文件<mark>放进</mark> `.obsidian/plugins/tabe-reader/`，然后在 Community Plugins 里<mark>启用</mark>。

**使用**：`⌘⇧T` 开关格式化 · `⌘⇧A` 切换 AI 模式 · `Settings → TABE Reader` 可以单独开关每一层。

> 📦 **想要最初那个纯 Obsidian 版本的仓库快照？** 在 [Tags](https://github.com/oldmercy/CantRead/tags) 里选 **`0.1.1`**，那一版永远保持原样。

### 三条技术路线（Obsidian 插件）

- **Route A · 机械 Bionic** —— 每个词前几个字母<mark>加粗</mark>，*不*<mark>分析</mark>**词性**，*完全离线*
- **Route B · 本地 NLP（默认）** —— **英文**<mark>用</mark> [compromise.js](https://github.com/spencermountain/compromise)，**中文**<mark>用</mark>**规则引擎**；*免费*、*离线*、不需要 **API key**
- **Route C · AI 语义（可选）** —— <mark>接入</mark> OpenAI / Claude / Ollama 等，**用户**<mark>自带</mark> **API key**，**key** 只<mark>存</mark>在你*本地*

| Provider | 默认模型 | API Key |
|---|---|---|
| OpenAI | `gpt-4o-mini` | `sk-…` |
| Claude | `claude-3-5-haiku-20241022` | `sk-ant-…` |
| Custom / Ollama | `llama3` | 可留空 |

---

## 语言支持

- **英文** —— compromise.js **词性标注**，*比较准确*
- **中文** —— **规则引擎**（**最大前向匹配** + **内建词典**），还在<mark>改进</mark>
- **中英混合** —— *自动*<mark>检测</mark>，按**段落***分别*<mark>处理</mark>

---

## 仓库结构

```
CantRead/
├── packages/
│   ├── core/               TABE 引擎（所有产品共用）
│   └── firefox-extension/  浏览器插件
├── tabe-reader/            Obsidian 插件
├── docs/                   网页 demo（GitHub Pages）
├── prototypes/             ADHD 阅读辅助的实验原型
├── scripts/readme-src/     这些 README 的纯文字源文件
└── ROADMAP.md              路线图
```

**开发**：`npm install` → `npm run build`（构建引擎 + 浏览器插件）→ `npm test`。改完 README 源文件后，运行 `npm run readme` 重新生成带格式的版本。各产品的细节见各自目录的 README。

---

## 参与

欢迎<mark>提</mark> [Issue](https://github.com/oldmercy/CantRead/issues) 或 PR，*尤其*是**中文词典扩充**、**新语言支持**，以及「我读 X 类网页时效果不好」这类*真实*的**反馈**。

MIT License · Made by Ahui ([@oldmercy](https://github.com/oldmercy))
