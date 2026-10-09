<!-- 自动生成，请勿直接修改。源文件：scripts/readme-src/ROADMAP.zh-CN.md，运行 npm run readme 重新生成。 -->
<!-- Generated file — edit scripts/readme-src/ROADMAP.zh-CN.md and run "npm run readme". -->

# CantRead 路线图

[English](ROADMAP.md) | **简体中文**

> **北极星**：不是让人读得*更快*，而是<mark>降低</mark>**「敢点开」的门槛**。订了却不敢点开的**报纸**、一打开就想关掉的*长*邮件、读不进去的**论文**——先让人*愿意*<mark>开始</mark>读。

**方向**：**插件优先**。*大部分*人读的东西都在**浏览器**里，**插件**不需要<mark>导入</mark>任何东西，**摩擦***最低*。**独立 App** 不是<mark>取消</mark>了，而是先<mark>看</mark>插件能<mark>覆盖</mark>多少，再<mark>决定</mark>还需不需要。

图例：✅ 已完成 · 🚧 进行中 · 📋 计划中 · 💭 想法，还没定

---

## ✅ 已完成

- **Obsidian 插件 v0.1.1** —— Reading View *自动* TABE 格式化（[`tabe-reader/`](tabe-reader/)）
- **网页 demo** —— <https://oldmercy.github.io/CantRead/>
- **共享引擎 `@cantread/core`** —— *所有*产品<mark>共用</mark>同一份 **TABE 引擎**（[`packages/core/`](packages/core/)）
- **Firefox 插件 v1.0** —— **整页** / **选区**高亮、**设置面板**（*单独*开关每一层）、**快捷键**、*中英双语*界面、*不*<mark>收集</mark>数据（[`packages/firefox-extension/`](packages/firefox-extension/)）

## 🚧 进行中

- **上架 Firefox 插件商店（AMO）** —— 审核<mark>通过</mark>后，*一键*<mark>安装</mark>、*自动*<mark>更新</mark>

---

## 📋 v1.1 —— 让每天用起来更顺

- **指定网站自动开启** —— 在你*信任*的网站（订阅的**报纸**、学校**邮箱**）*打开*就*自动*<mark>高亮</mark>，不用每次<mark>点</mark>。*默认*关闭，由你*自己*<mark>加</mark>网站
- **Android 手机** —— Android 版 Firefox <mark>支持</mark>插件；<mark>适配</mark>**手机屏幕**和**触控**
- **Gmail / 邮箱优化** —— **邮件页面**结构*乱*，*针对性*<mark>调整</mark>
- **动态加载的内容** —— *无限*滚动、点「展开」后<mark>出现</mark>的*新*文字也*自动*<mark>高亮</mark>
- **更轻的加载方式** —— 现在插件在*每个*网页里预先<mark>待命</mark>（**引擎**约 450KB）；改成*只在点击时*才<mark>加载</mark>，让网页*更快*，安装时也不再<mark>提示</mark>「访问网站内容」
- **更准的中文** —— <mark>改进</mark>**中文分词**（现在会把「多伦多大学」这类**专有名词**<mark>切错</mark>）

## 📋 v1.2 —— 更多浏览器

- **Chrome / Edge** —— <mark>用</mark>的是*同一套*插件标准，主要是<mark>改</mark>配置，再<mark>上架</mark> **Chrome 应用商店**
- 💭 **Safari / iPhone** —— 需要用 **Xcode** <mark>打包</mark>成 App <mark>上架</mark> **App Store**，成本*高*，<mark>看</mark>需求再定

## 📋 v2 —— ADHD 阅读辅助，搬进插件

这些原本<mark>规划</mark>给桌面 App，在 [ADHD 原型](prototypes/adhd-reading-demo.html) 里<mark>验证</mark>过，*全部*做成*可以叠加*的**开关**：

- **带读模式** —— *逐句*<mark>朗读</mark>，**当前句**<mark>高亮</mark>跟着走，*自动*<mark>滚动</mark>；**音量**可以拉到 0，<mark>变成</mark>*无声*的**视觉节拍器**。先<mark>用</mark>*系统自带*的声音（Web Speech API），不需要 **AI 模型**
- **逐句 Focus** —— **当前这句***正常*显示，**前后文**<mark>变淡</mark>，用**方向键**往下<mark>走</mark>
- **位置记忆** —— <mark>关掉</mark>页面再<mark>打开</mark>，<mark>回到</mark>*上次*读到的那一句（<mark>治</mark>「走神后找不回位置」）
- **骨架 Skim** —— *自动*<mark>标出</mark>*重要*的**句子**，可以在**全文**和**骨架**之间*一键*<mark>切换</mark>

## 📋 v3 —— 读论文

- **插件内的 PDF 阅读页** —— 在插件里<mark>打开</mark> **PDF**，同样<mark>加</mark> TABE 高亮。Firefox *自带*的 PDF 阅读器不<mark>允许</mark>插件修改，所以要*自带*一个（用 pdf.js）
- **术语提取 + 悬停解释**、**章节识别和跳转**、**导出到 Obsidian**

## 💭 更远的想法

- **全局划词悬浮窗（macOS）** —— 在*任何* App 里<mark>选中</mark>文字 → <mark>按</mark>**快捷键** → <mark>弹出</mark>带 TABE 高亮的**窗口**。（*直接*改「系统字体」<mark>做不到</mark>：**字体**只认**字母形状**，不<mark>知道</mark>一个词是**名词**还是**动词**）
- **长难句拆解** —— <mark>用</mark> AI 把*绕*的**长句**<mark>拆</mark>成几句*短*的
- **AI 模式（Route C）搬进插件** —— **用户**<mark>自带</mark> **API key** 或**本地模型**（Ollama），**语义***更准*
- **更自然的朗读声音** —— *本地*小模型 TTS
- **独立桌面 App** —— <mark>视</mark>插件能<mark>覆盖</mark>多少再<mark>决定</mark>

---

有想法或者需求？欢迎 [提 Issue](https://github.com/oldmercy/CantRead/issues)。
