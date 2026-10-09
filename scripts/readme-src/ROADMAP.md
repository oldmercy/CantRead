# CantRead Roadmap

**English** | [简体中文](ROADMAP.zh-CN.md)

> **North star:** this is not about reading faster. It is about **lowering the barrier to opening the thing at all** — the newsletter you subscribed to but never open, the long email you want to close right away, the paper that will not go in. First, make people willing to start reading.

**Direction:** browser first. Most reading happens in the browser, and an extension asks you to import nothing, so it has the least friction. The standalone app is not cancelled; it is on hold until we see how much the extension can cover.

Legend: ✅ shipped · 🚧 in progress · 📋 planned · 💭 idea, not decided

---

## ✅ Shipped

- **Obsidian plugin v0.1.1** — formats Reading View automatically ([`tabe-reader/`](tabe-reader/))
- **Web demo** — <https://oldmercy.github.io/CantRead/>
- **Shared engine `@cantread/core`** — every product uses the same TABE engine ([`packages/core/`](packages/core/))
- **Firefox extension v1.0** — whole-page and selection highlighting, a settings panel with a switch for each layer, a keyboard shortcut, an English and Chinese interface, and no data collection ([`packages/firefox-extension/`](packages/firefox-extension/))

## 🚧 In progress

- **Listing on the Firefox Add-ons store (AMO)** — one-click install and automatic updates once it is approved

---

## 📋 v1.1 — smoother everyday use

- **Auto-highlight on chosen sites** — pages you trust, like your newsletters or school email, are highlighted as soon as they open. Off by default; you add the sites yourself
- **Android** — Firefox for Android supports extensions; adapt the panel for small screens and touch
- **Gmail and webmail tuning** — email pages have messy structure and need specific handling
- **Dynamic content** — text that appears later, from infinite scroll or an "expand" button, gets highlighted too
- **Lighter loading** — the extension currently waits on every page with the engine (about 450 KB) already loaded; load it only when you click, so pages stay fast and the install prompt no longer asks for access to all sites
- **Better Chinese** — improve Chinese word segmentation, which currently splits proper nouns like 多伦多大学 incorrectly

## 📋 v1.2 — more browsers

- **Chrome / Edge** — they use the same extension standard, so this mostly needs configuration changes and a Chrome Web Store listing
- 💭 **Safari / iPhone** — requires packaging as an app with Xcode for the App Store; costly, so it depends on demand

## 📋 v2 — ADHD reading aids, in the extension

These were planned for the desktop app and tested in the [ADHD prototype](prototypes/adhd-reading-demo.html). Each one will be a switch you can combine with the others:

- **Read-along** — reads sentence by sentence while the current sentence stays highlighted and the page scrolls. The volume goes down to 0, which turns it into a silent visual metronome. It starts with the system voice (Web Speech API), so no AI model is needed
- **Sentence focus** — the current sentence stays clear, the text around it fades, and the arrow keys move you forward
- **Position memory** — close the page, open it again, and you are back at the sentence where you stopped. This is for "I drifted off and lost my place"
- **Skim skeleton** — important sentences are marked automatically, and one switch flips between the full text and the skeleton

## 📋 v3 — reading papers

- **A PDF reader inside the extension** — open a PDF in the extension and get the same highlighting. Firefox's built-in PDF viewer does not allow extensions to change it, so the extension needs its own viewer (based on pdf.js)
- **Term extraction with hover definitions**, **section detection and jumping**, and **export to Obsidian**

## 💭 Later / exploring

- **System-wide popup (macOS)** — select text in any app, press a shortcut, and a window shows it with TABE highlighting. A system font cannot do this: fonts only know letter shapes, not whether a word is a noun or a verb
- **Long-sentence splitting** — use AI to break tangled long sentences into a few short ones
- **AI mode (Route C) in the extension** — bring your own API key or a local model (Ollama) for more accurate meaning
- **More natural read-along voices** — a small local text-to-speech model
- **Standalone desktop app** — decided once we know how much the extension covers

---

Ideas or requests? [Open an issue](https://github.com/oldmercy/CantRead/issues).
