# CantRead

==For brains that bounce off walls of text.==

**CantRead** 是一个 Obsidian 插件 · *auto-formats plain text in Reading View* · 不改源文件 · ==让密集文字变得可以扫描==

**Live Demo** → https://oldmercy.github.io/CantRead/

---

## 它解决什么问题 *What problem it solves*

大段纯文本对 ==ADHD / ASD 用户==来说是障碍 · 眼睛找不到落脚点 · *the brain spends more energy tracking than comprehending*

**CantRead** 把 NLP 的 ==词性识别== 转化为视觉信号 · *like syntax highlighting, but for natural language* · 让读者眼睛能快速扫描 · ==抓住核心再补充细节==

---

## TABE 格式层级 *Semantic layers*

**名词 Nouns** ==概念标签== · 加粗 · *key labels and proper nouns*

**动词 Verbs** ==动作识别点== · 黄色高亮 · *actions and state-change words*

*形容词 / 副词 Adj/Adv* · 绿色斜体 · ==补充修饰层== · *qualifiers and supplements*

`数字 Numbers` ==统计 / 日期== · 橙色 · *numeric values and dates*

---

## 三条技术路线 *Three routes*

**Route A** ==机械 Bionic== · 每个词前几个字母加粗 · *no semantics, fully offline* · 最简单

**Route B** ==本地 NLP（默认）== · `compromise.js` 处理英文 · 规则引擎处理中文 · *free, offline, no API key*

**Route C** ==AI 语义（付费可选）== · 接入 OpenAI / Claude / 本地 LLM · *semantic accuracy, bring your own key* · <u>在设置页输入 API Key 启用</u>

---

## 安装方法 *Installation*

### 通过 BRAT 安装 *Install via BRAT*

<u>在 Obsidian 安装 BRAT 插件</u> → `Settings → Community Plugins → Browse → BRAT`

<u>添加 Beta 插件</u> → `BRAT → Add Beta Plugin` → 填入：

```
https://github.com/oldmercy/CantRead
```

<u>在 Community Plugins 启用 CantRead</u> · 打开任意笔记的 ==Reading View== · 自动生效

### 手动安装 *Manual install*

<u>下载以下三个文件</u>到 `.obsidian/plugins/cantread/`：

```
main.js · manifest.json · styles.css
```

---

## 使用方式 *Usage*

**Reading View** ==自动渲染== · 无需额外操作 · *formatting applies on open*

`⌘⇧T` ==开关 CantRead== · *toggle formatting on/off*

`⌘⇧A` ==切换 AI 模式== · *switch between Route B and Route C* · 需先在设置填入 API Key

**设置页** → `Settings → CantRead` · ==独立控制每个层级== · 可单独关闭名词 / 动词 / 形容词 / 数字

---

## 语言支持 *Language support*

**英文 English** ==compromise.js NLP== · 词性准确 · *part-of-speech tagging*

**中文 Chinese** ==规则引擎== · 最大前向匹配 · 内建词典 · *70+ function words · 80+ verbs · 100+ nouns*

**中英混合 Mixed** ==自动检测== · 按段分流 · *each segment routed to its engine automatically*

---

## Route C — AI 接口 *AI API setup*

`Settings → CantRead → Route C` · <u>选择 Provider 并填入 API Key</u>

| Provider | 默认模型 | API Key 格式 |
|----------|----------|-------------|
| **OpenAI** | `gpt-4o-mini` | `sk-…` |
| **Claude** | `claude-3-5-haiku-20241022` | `sk-ant-…` |
| **Custom / Ollama** | `llama3` | 可留空 |

==API Key 只存在你本地的 Obsidian vault== · *never sent to our servers* · CantRead 不代理任何请求

**自定义端点** *Custom Base URL* · 支持 `Ollama` · `LM Studio` · 任何 ==OpenAI-compatible== 接口

---

## 开发路线图 *Roadmap*

**Phase 0** ==Obsidian 插件 MVP== · ✅ 完成 · *Reading View auto-format, toggle, multilingual NLP, AI API*

**Phase 1** ==浏览器插件== · Chrome / Firefox · *WebExtensions API, ~90% code reuse*

**Phase 2** ==AI 层优化== · streaming · per-note toggle · *caching and cost control*

**Phase 3** ==移动端== · iOS Safari Extension · bookmarklet · *untethered reading*

**Phase 4** ==泛化== · PDF · RSS · e-reader · *TABE anywhere*

---

## 项目信息 *Project info*

**Repo** `oldmercy/CantRead` · *MIT License*

**起源** ==Ahui 在找工作期间== · 做 networking 笔记时自然发展出的写作格式 · *turns out it works for everyone who bounces off walls of text*

<u>欢迎提 Issue 或 PR</u> · 特别是中文词典扩充 / 新语言支持 · *contributions welcome*
