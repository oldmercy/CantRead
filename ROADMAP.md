# CantRead 路线图 *Roadmap*

> **北极星 North star**：不是让人读得更快，而是**降低「敢点开」的门槛**。
> 订了却不敢点开的报纸、一打开就想关掉的长邮件、读不进去的论文——先让人愿意开始读。
>
> *Not about reading faster — about lowering the barrier to opening the thing at all.*

**方向 Direction**：**插件优先**。大部分人读的东西都在浏览器里，插件不需要导入任何东西，摩擦最低。独立 App 不是取消了，而是先看插件能覆盖多少，再决定还需不需要。

*Browser-first: most reading happens in the browser, and an extension needs no importing. A standalone app is on hold until we see how far the extension can go.*

图例：✅ 已完成 · 🚧 进行中 · 📋 计划中 · 💭 想法，还没定

---

## ✅ 已完成 *Shipped*

- **Obsidian 插件 v0.1.1** —— Reading View 自动 TABE 格式化（[`tabe-reader/`](tabe-reader/)）
- **网页 demo** —— <https://oldmercy.github.io/CantRead/>
- **共享引擎 `@cantread/core`** —— 所有产品共用同一份 TABE 引擎（[`packages/core/`](packages/core/)）
- **Firefox 插件 v1.0** —— 整页 / 选区高亮、设置面板（单独开关每一层）、快捷键、中英双语界面、按需加载、不收集数据（[`packages/firefox-extension/`](packages/firefox-extension/)）

## 🚧 进行中 *In progress*

- **上架 Firefox 插件商店（AMO）** —— 审核通过后，一键安装、自动更新

---

## 📋 v1.1 —— 让每天用起来更顺 *Everyday polish*

- **指定网站自动开启** —— 在你信任的网站（订阅的报纸、学校邮箱）打开就自动高亮，不用每次点。默认关闭，由你自己加网站
- **Android 手机** —— Android 版 Firefox 支持插件；适配手机屏幕和触控
- **Gmail / 邮箱优化** —— 邮件页面结构乱，针对性调整
- **动态加载的内容** —— 无限滚动、点「展开」后出现的新文字也自动高亮
- **更轻的加载方式** —— 现在插件在每个网页里预先待命（引擎约 450KB）；研究改成只在点击时才加载，让网页更快、安装时不再提示「访问网站内容」
- **更准的中文** —— 改进中文分词（现在会把「多伦多大学」这类专有名词切错）

## 📋 v1.2 —— 更多浏览器 *More browsers*

- **Chrome / Edge 版本** —— 用的是同一套插件标准，改配置即可，上架 Chrome 应用商店
- 💭 **Safari / iPhone** —— 需要用 Xcode 打包成 App 上架 App Store，成本高，看需求再定

## 📋 v2 —— ADHD 阅读辅助，搬进插件 *Reading aids*

这些原本规划给桌面 App，在 [ADHD 原型](prototypes/adhd-reading-demo.html) 里验证过，全部做成**可以叠加的开关**：

- **带读模式** —— 逐句朗读，当前句高亮跟着走，自动滚动；音量可以拉到 0，变成无声的视觉节拍器。先用系统自带的声音（Web Speech API），不需要 AI 模型
- **逐句 Focus** —— 当前这句正常显示，前后文变淡，用方向键往下走
- **位置记忆** —— 关掉页面再打开，回到上次读到的那一句（治「走神后找不回位置」）
- **骨架 Skim** —— 自动标出重要的句子，可以在全文和骨架之间一键切换

## 📋 v3 —— 读论文 *Papers*

- **插件内的 PDF 阅读页** —— 在插件里打开 PDF，同样加 TABE 高亮。Firefox 自带的 PDF 阅读器不允许插件修改，所以要自带一个（用 pdf.js）
- **术语提取 + 悬停解释**、**章节识别和跳转**、**导出到 Obsidian**

## 💭 更远的想法 *Later / exploring*

- **全局划词悬浮窗（macOS）** —— 在任何 App 里选中文字 → 按快捷键 → 弹出带 TABE 高亮的窗口。（直接改「系统字体」做不到：字体只认字母形状，不知道一个词是名词还是动词）
- **长难句拆解** —— 用 AI 把绕的长句拆成几句短的
- **AI 模式（Route C）搬进插件** —— 用户自带 API key 或本地模型（Ollama），语义更准
- **更自然的朗读声音** —— 本地小模型 TTS
- **独立桌面 App** —— 视插件能覆盖多少再决定

---

有想法或者需求？欢迎 [提 Issue](https://github.com/oldmercy/CantRead/issues)。*Ideas and requests welcome.*
