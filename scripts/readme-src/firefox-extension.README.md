# CantRead — Browser extension

**English** | [简体中文](README.zh-CN.md)

CantRead makes dense web pages and emails scannable: **nouns bold**, <mark>verbs highlighted</mark>, *adjectives green italic*, and numbers orange.

![Before / After](store/before-after-light.png)

- 🔒 **Runs entirely on your device.** It makes no network requests and collects no data.
- 🧩 Only the text styling changes. Links, images and the page layout stay the same, and you can switch back to the original at any time.
- 🌏 Works with English and Chinese. English is more accurate; Chinese word segmentation is still improving.

Current version **v1.0.0** for Firefox 128+ on desktop. Chrome and Edge are on the [roadmap](../../ROADMAP.md).

---

## Install

### Option 1: Firefox Add-ons store (recommended)

> 🕐 **Currently under review.** Once it is approved, the store link goes here: click "Add to Firefox" and you are done, with automatic updates from then on. <!-- tabe:off -->

### Option 2: load from source (temporary)

> ⚠️ With this method **the extension disappears when Firefox restarts**, so you have to load it again. It suits developers and anyone who cannot wait for the review. <!-- tabe:off -->

1. Install [Node.js](https://nodejs.org) (version 18 or newer)
2. Download the code and build it:
   ```bash
   git clone https://github.com/oldmercy/CantRead.git
   cd CantRead
   npm install
   npm run build
   ```
3. Type `about:debugging#/runtime/this-firefox` in the Firefox address bar and press Enter
4. Click **Load Temporary Add-on…**
5. Choose `packages/firefox-extension/manifest.json`
6. The CantRead icon appears in the toolbar (or under the 🧩 menu) and you are ready

---

## How to use

| Action | Result |
|---|---|
| **Click the toolbar icon** | The current page is highlighted right away and the settings panel opens. Refresh pages that were open before you installed the extension |
| **Show original** in the panel | Removes the highlighting and restores the page |
| **Switches** in the panel | Turn off a single layer, for example keep only nouns and verbs on a busy page. Your choice is remembered |
| `Alt+Shift+H` (`⌥⇧H` on Mac) | Toggles highlighting without opening the panel |
| **Select text → right-click → "CantRead: highlight selected text"** | Highlights only that part |

You can change the shortcut in Firefox under `about:addons` → ⚙️ → **Manage Extension Shortcuts**.

**Pages where it cannot work:** Firefox settings pages, the add-ons store, and Firefox's built-in PDF viewer. Firefox does not let any extension change these pages.

---

## Privacy

CantRead **collects no data**. Text is analyzed by [compromise.js](https://github.com/spencermountain/compromise) (English) and a rule engine (Chinese), both bundled inside the extension and running on your computer without going online. The only thing saved is your layer settings, kept in your browser's local storage (`storage.local`).

The extension waits on every page, which is why Firefox mentions access to website content when you install it. It only processes text when **you click the icon, press the shortcut, or use the right-click menu**. Page content is never read for anything else, stored, or sent anywhere.

---

## Development

```bash
npm run build -w @cantread/core                 # build the shared TABE engine first
npm run watch -w @cantread/firefox-extension    # rebuild automatically while you edit
npm run typecheck -w @cantread/firefox-extension
```

After editing, click **Reload** next to the extension on the `about:debugging` page to see the change.

> ⚠️ Always build with esbuild through `npm run build`. A bundle made with a different tool once crashed in real Firefox even though it passed tests elsewhere. <!-- tabe:off -->

### Packaging for the store

```bash
git commit ...              # the source archive uses the committed version, so commit first
npm run package:firefox     # run from the monorepo root
```

This creates two files in `packages/firefox-extension/web-ext-artifacts/`:
- `cantread-firefox-<version>.zip` — the extension itself, uploaded to the store
- `cantread-source-<version>.zip` — the source archive, which the store review requires

### Structure

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (Manifest V3, Firefox `gecko` settings, declares no data collection) |
| `src/content.ts` | Runs in the page: walks text nodes → `tokenizeTABE()` → highlights; restore; selection; layer switches |
| `src/background.ts` | Keyboard shortcut and right-click menu |
| `src/popup.ts` + `popup/` | The settings panel that opens from the toolbar icon |
| `src/inject.ts` | Fallback injection for tabs that were open before the extension loaded |
| `src/settings.ts` | Reads and writes the layer switches (`storage.local`) |
| `_locales/` | English and Chinese interface text |
| `tabe.css` | TABE colors, adapting to light and dark mode |
| `build.mjs` / `package.mjs` | esbuild bundling / store zip packaging |
| `store/` | Store screenshots |

---

<!-- tabe:off-start -->
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
<!-- tabe:off-end -->
