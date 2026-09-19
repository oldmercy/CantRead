# CantRead — Firefox 插件

网页/邮件正文 TABE 高亮：**名词加粗 · 动词黄高亮 · 形容词绿斜体 · 数字橙色**。
本地运行，不发送任何数据。直接复用 `@cantread/core` 的 NLP 引擎，不重写 POS tagger。

## 怎么用

- **点工具栏图标** → 当前整页开/关 TABE 高亮（再点一次还原）。
- **选中一段文字 → 右键 → 「CantRead：高亮选中文字」** → 只处理选中的那段。

## 本地安装（临时加载，重启 Firefox 会消失）

1. 先构建（在 monorepo 根目录）：
   ```bash
   npm run build -w @cantread/core          # 先出 core 的 dist
   npm run build -w @cantread/firefox-extension
   ```
2. Firefox 地址栏输入 `about:debugging#/runtime/this-firefox`
3. 点 **「临时载入附加组件…」(Load Temporary Add-on)**
4. 选中本目录里的 **`manifest.json`**
5. 工具栏出现橙色图标 → 打开任意网页，点它试试

> 临时加载只在本次 Firefox 会话有效。想永久安装需要签名打包（`web-ext`），过渡期先临时加载够用。

## 开发

```bash
npm run watch -w @cantread/firefox-extension   # esbuild 监听重构建
npm run typecheck -w @cantread/firefox-extension
```

改完 `src/` 后在 `about:debugging` 页点 **「重新载入」(Reload)** 即可看到更新。

## 结构

| 文件 | 作用 |
|------|------|
| `manifest.json` | MV3 声明（Firefox `gecko` 段） |
| `src/content.ts` | 遍历文字节点 → `tokenizeTABE()` → 高亮 span，保留原页面结构；支持整页 toggle 还原 + 选区处理 |
| `src/background.ts` | 工具栏点击 / 右键菜单 → 通知 content 脚本 |
| `tabe.css` | TABE 配色（独立版，light/dark 自适配） |
| `build.mjs` | esbuild 打包（把 core + compromise 捆进 `dist/`） |
