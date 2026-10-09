# CantRead —— 浏览器插件

[English](README.md) | **简体中文**

把网页和邮件里*密密麻麻*的文字<mark>变得</mark>**能扫读**：**名词加粗** · <mark>动词黄色高亮</mark> · *形容词绿色斜体* · 数字橙色

![Before / After](store/before-after-light.png)

- 🔒 **全部在本机运行**，不联网、不收集、不上传任何数据
- 🧩 只<mark>改</mark>**文字的样式**，链接、图片、页面布局都不动，*随时*可以<mark>还原</mark>原文
- 🌏 **中英文**都<mark>支持</mark>（英文*更准确*，**中文分词**还在<mark>改进</mark>）

当前版本 **v1.0.0** · 支持 Firefox 128+（桌面版）。Chrome / Edge 版本在[路线图](../../ROADMAP.zh-CN.md)里。

---

## 安装

### 方式一：Firefox 插件商店（推荐）

> 🕐 **正在审核中**。审核<mark>通过</mark>后，这里会<mark>放</mark>**商店链接**，点「添加到 Firefox」就装好了，以后也会*自动*<mark>更新</mark>。

### 方式二：从源码临时加载（开发者 / 等不及审核）

> ⚠️ 这种方式**重启 Firefox 后插件会消失**，要*重新*<mark>加载</mark>一次。*适合*开发者或想抢先<mark>试用</mark>的人。

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
6. 工具栏（或者 🧩 菜单里）出现 CantRead 图标，就装好了

---

## 怎么用

| 操作 | 效果 |
|------|------|
| **点工具栏图标** | 当前页面立刻<mark>高亮</mark>，同时<mark>弹出</mark>设置面板。（装插件*之前*就打开的页面，先<mark>刷新</mark>一下） |
| 面板里点 **「还原原文」** | <mark>去掉</mark>高亮，页面<mark>恢复</mark>原样 |
| 面板里的 **开关** | *单独*<mark>关掉</mark>某一层（比如觉得*太密*，只<mark>留</mark>名词和动词）。设置会被<mark>记住</mark> |
| 快捷键 `⌥⇧H`（Windows/Linux：`Alt+Shift+H`） | *直接*<mark>开/关</mark>高亮，不<mark>打开</mark>面板 |
| **选中一段文字 → 右键 → 「CantRead：高亮选中文字」** | 只<mark>高亮</mark>那一段 |

快捷键可以在 Firefox 的 `about:addons` → 齿轮 ⚙️ → **管理扩展快捷键** 里<mark>改</mark>。

**哪些页面用不了**：Firefox 的**设置页**、**插件商店页面**、Firefox *自带*的 **PDF 阅读器**——这些页面浏览器不<mark>允许</mark>任何插件修改。

---

## 隐私

CantRead **不收集任何数据**。<mark>分析</mark>文字用的是*打包在插件里*的 [compromise.js](https://github.com/spencermountain/compromise)（英文）和**规则引擎**（中文），*全部*在你的电脑上<mark>运行</mark>，不<mark>联网</mark>。*唯一*<mark>保存</mark>的东西是你的**层开关设置**，存在浏览器*本地*（`storage.local`）。

插件会在*每个*网页里<mark>待命</mark>（所以安装时 Firefox 会<mark>提示</mark>它可以访问网站内容），但只有在你**主动点击图标 / 按快捷键 / 用右键菜单**时才会<mark>处理</mark>当前页面的文字。处理*全部*在本机<mark>完成</mark>，不读取、不保存、不上传网页内容。

---

## 开发

```bash
npm run build -w @cantread/core                 # 先构建共享的 TABE 引擎
npm run watch -w @cantread/firefox-extension    # 改代码时自动重新构建
npm run typecheck -w @cantread/firefox-extension
```

改完代码后，在 `about:debugging` 页面点插件旁边的 **「重新载入」**（*Reload*）就能<mark>看到</mark>效果。

> ⚠️ *一定*要用 `npm run build`（esbuild）<mark>打包</mark>。曾经用*别的*工具打出来的包，在别处测试都*正常*，在*真* Firefox 里却一运行就<mark>崩溃</mark>。

### 打包上传商店

```bash
git commit ...              # 源码包取的是已提交的版本，先 commit
npm run package:firefox     # 在 monorepo 根目录运行
```

会在 `packages/firefox-extension/web-ext-artifacts/` <mark>生成</mark>两个文件：
- `cantread-firefox-<版本>.zip` —— **插件本体**，<mark>上传</mark>到商店
- `cantread-source-<版本>.zip` —— **源码包**，商店审核<mark>要求</mark>一起上传

### 代码结构

| 文件 | 作用 |
|------|------|
| `manifest.json` | 插件声明（Manifest V3，Firefox `gecko` 段，声明不收集数据） |
| `src/content.ts` | 在网页里运行：遍历文字节点 → `tokenizeTABE()` → 高亮；还原；选区处理；层开关 |
| `src/background.ts` | 快捷键、右键菜单 |
| `src/popup.ts` + `popup/` | 点图标弹出的设置面板 |
| `src/inject.ts` | 兜底注入（插件装好之前就打开的标签页） |
| `src/settings.ts` | 层开关的读写（`storage.local`） |
| `_locales/` | 中英文界面文字 |
| `tabe.css` | TABE 配色，亮色/暗色模式自动适配 |
| `build.mjs` / `package.mjs` | esbuild 打包 / 生成商店 zip |
| `store/` | 商店截图 |

商店审核员的构建说明（英文）见 [English README](README.md#build-instructions-for-amo-reviewers)。
