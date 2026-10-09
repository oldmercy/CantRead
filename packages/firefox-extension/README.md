# CantRead — 浏览器插件 *Browser extension*

把网页和邮件里密密麻麻的文字变得**能扫读**：

**名词加粗** · <mark>动词黄色高亮</mark> · *形容词绿色斜体* · 数字橙色

*Makes walls of text scannable: nouns bold, verbs highlighted, adjectives green italic, numbers orange.*

![Before / After](store/before-after-light.png)

- 🔒 **全部在本机运行**，不联网、不收集、不上传任何数据 · *Runs entirely on your device. No data collected.*
- 🧩 只改文字的样式，链接、图片、页面布局都不动，随时可以还原原文
- 🌏 中英文都支持（英文更准确，中文分词还在改进）

当前版本 **v1.0.0** · 支持 Firefox 128+（桌面版）。Chrome / Edge 版本在 [路线图](../../ROADMAP.md) 里。

---

## 安装 *Install*

### 方式一：Firefox 插件商店（推荐） *From the Firefox Add-ons store*

> 🕐 **正在审核中**。审核通过后，这里会放商店链接，点「添加到 Firefox」就装好了，以后也会自动更新。
>
> *Under review on addons.mozilla.org — the store link will be added here once approved.*

### 方式二：从源码临时加载（开发者 / 等不及审核） *Load from source (temporary)*

> ⚠️ 这种方式**重启 Firefox 后插件会消失**，要重新加载一次。适合开发者或想抢先试用的人。

1. 安装 [Node.js](https://nodejs.org)（18 或以上）
2. 下载代码并构建：
   ```bash
   git clone https://github.com/oldmercy/CantRead.git
   cd CantRead
   npm install
   npm run build
   ```
3. Firefox 地址栏输入 `about:debugging#/runtime/this-firefox`，回车
4. 点 **「临时载入附加组件…」**（*Load Temporary Add-on…*）
5. 选择 `packages/firefox-extension/manifest.json`
6. 工具栏出现 CantRead 图标，就装好了

---

## 怎么用 *How to use*

| 操作 | 效果 |
|------|------|
| **点工具栏图标** | 当前页面立刻高亮，同时弹出设置面板。（如果是装插件之前就打开的页面，先刷新一下） |
| 面板里点 **「还原原文」** | 去掉高亮，页面恢复原样 |
| 面板里的 **开关** | 单独关掉某一层（比如觉得太密，只留名词和动词）。设置会被记住 |
| 快捷键 **⌥⇧H**（Windows/Linux：**Alt+Shift+H**） | 直接开/关高亮，不打开面板 |
| **选中一段文字 → 右键 → 「CantRead：高亮选中文字」** | 只高亮那一段 |

快捷键可以在 Firefox 的 `about:addons` → 齿轮 ⚙️ → **管理扩展快捷键** 里改。

**哪些页面用不了**：Firefox 的设置页、插件商店页面、Firefox 自带的 PDF 阅读器——这些页面浏览器不允许任何插件修改。

---

## 隐私 *Privacy*

CantRead **不收集任何数据**。分析文字用的是打包在插件里的 [compromise.js](https://github.com/spencermountain/compromise)（英文）和规则引擎（中文），全部在你的电脑上运行，不联网。唯一保存的东西是你的层开关设置，存在浏览器本地（`storage.local`）。

插件会在每个网页里**待命**（所以安装时 Firefox 会提示它可以访问网站内容），但只有在你**主动点击图标 / 按快捷键 / 用右键菜单**时才会处理当前页面的文字。处理全部在本机完成，不读取、不保存、不上传网页内容。

---

## 开发 *Development*

```bash
npm run build -w @cantread/core                 # 先构建共享的 TABE 引擎
npm run watch -w @cantread/firefox-extension    # 改代码时自动重新构建
npm run typecheck -w @cantread/firefox-extension
```

改完代码后，在 `about:debugging` 页面点插件旁边的 **「重新载入」**（*Reload*）就能看到效果。

### 打包上传商店 *Package for AMO*

```bash
git commit ...              # 源码包取的是已提交的版本，先 commit
npm run package:firefox     # 在 monorepo 根目录运行
```

会在 `packages/firefox-extension/web-ext-artifacts/` 生成两个文件：
- `cantread-firefox-<版本>.zip` —— 插件本体，上传到商店
- `cantread-source-<版本>.zip` —— 源码包，商店审核要求一起上传

### 代码结构 *Structure*

| 文件 | 作用 |
|------|------|
| `manifest.json` | 插件声明（Manifest V3，Firefox `gecko` 段，声明不收集数据） |
| `src/content.ts` | 注入到网页里：遍历文字节点 → `tokenizeTABE()` → 高亮；还原；选区处理；层开关 |
| `src/background.ts` | 快捷键、右键菜单 |
| `src/popup.ts` + `popup/` | 点图标弹出的设置面板 |
| `src/inject.ts` | 兜底注入（插件装好之前就打开的标签页） |
| `src/settings.ts` | 层开关的读写（`storage.local`） |
| `_locales/` | 中英文界面文字 |
| `tabe.css` | TABE 配色，亮色/暗色模式自动适配 |
| `build.mjs` / `package.mjs` | esbuild 打包 / 生成商店 zip |
| `store/` | 商店截图 |

---

## Build instructions for AMO reviewers

The extension's `dist/*.js` files are produced by bundling TypeScript sources with esbuild (no minification). To reproduce:

**Requirements:** Node.js 18+ and npm 9+ (tested with Node 22). Works on macOS, Linux and Windows.

```bash
# from the root of the source archive
npm ci
npm run build -w @cantread/core
npm run build -w @cantread/firefox-extension
```

The output is written to `packages/firefox-extension/dist/` (`content.js`, `background.js`, `popup.js`). Every other file in the submitted package (`manifest.json`, `_locales/`, `icons/`, `popup/`, `tabe.css`) is used as-is from `packages/firefox-extension/`.

- `packages/core` contains the TABE NLP engine (TypeScript). It depends on the open-source library [compromise](https://www.npmjs.com/package/compromise) (MIT) for English part-of-speech tagging.
- No remote code is loaded and no network requests are made.
