# CantRead

**English** | [简体中文](README.zh-CN.md)

**For brains that bounce off walls of text.**

> 💡 This README is formatted by CantRead's own engine — you are reading TABE right now. **GitHub's rules do not allow text colors**, so this page can only show **bold nouns**, <mark>highlighted verbs</mark> and *italic adjectives*; the green and orange layers are missing. See the full colors in the screenshot below or on the [live demo page](https://oldmercy.github.io/CantRead/). Prefer plain text? Read the [unformatted version](scripts/readme-src/README.md). <!-- tabe:off -->

CantRead turns grammar into visual signals. It works like syntax highlighting, but for natural language: your eyes get places to land, so you can scan the shape of a sentence first and decide whether to read closely.

![Before / After](packages/firefox-extension/store/before-after-light.png)

| Layer | Style | Role |
|---|---|---|
| **Nouns** | **bold** | Labels — what the sentence is about |
| <mark>Verbs</mark> | <mark>yellow highlight</mark> | Actions — what happened |
| *Adjectives / adverbs* | *green italic* | Details — the supplements |
| Numbers | orange | Quantities and dates |

The format is called **TABE**. It grew out of the notes the author, Ahui (dyslexia + ADHD), wrote while job hunting, and it turned out to help anyone who finds dense text hard to start.

---

## Products

CantRead is one project with several products. They all share the same TABE engine in [`packages/core/`](packages/core/).

| Product | Status | Where | Install |
|---|---|---|---|
| 🦊 **Firefox extension** — web pages, email, newsletters | ✅ v1.0 · in store review | [`packages/firefox-extension/`](packages/firefox-extension/) | [Guide](packages/firefox-extension/README.md#install) |
| 🌐 **Chrome / Edge extension** | 📋 Planned | — | — |
| 🟣 **Obsidian plugin** — your notes in Reading View | ✅ v0.1.1 | [`tabe-reader/`](tabe-reader/) | [Guide](#obsidian-plugin) |
| 🧪 **Web demo** — paste text and try it | ✅ Live | [`docs/`](docs/) | <https://oldmercy.github.io/CantRead/> |
| 📄 **PDF / paper reading, ADHD read-along…** | 📋 Planned | — | See the [roadmap](ROADMAP.md) |

👉 **What comes next:** see [**ROADMAP.md**](ROADMAP.md). The direction is browser first — most reading happens in the browser, and an extension asks you to import nothing.

---

## Firefox extension

Click the toolbar icon and the current page is highlighted. You can turn each layer on or off, press `Alt+Shift+H` (`⌥⇧H` on Mac) to toggle, or select some text and right-click to highlight just that part. **Everything runs on your device and no data is collected.**

Full install and usage guide: [packages/firefox-extension/README.md](packages/firefox-extension/README.md)

---

## Obsidian plugin

The plugin formats notes in Obsidian's **Reading View** automatically and never changes your source files.

**Install with BRAT**

1. In Obsidian, install the BRAT plugin: `Settings → Community Plugins → Browse → BRAT`
2. Open `BRAT → Add Beta Plugin` and enter `https://github.com/oldmercy/CantRead`
3. Enable **TABE Reader** under Community Plugins, then open any note in Reading View

**Manual install:** copy `main.js`, `manifest.json` and `styles.css` from [`tabe-reader/`](tabe-reader/) into `.obsidian/plugins/tabe-reader/`, then enable it under Community Plugins.

**Usage:** `⌘⇧T` toggles the formatting, `⌘⇧A` switches AI mode, and `Settings → TABE Reader` lets you turn each layer on or off.

> 📦 **Looking for the original Obsidian-only snapshot of this repository?** Pick tag **`0.1.1`** under [Tags](https://github.com/oldmercy/CantRead/tags). That version stays exactly as it was. <!-- tabe:off -->

### Three routes (Obsidian plugin)

- **Route A · Bionic** — bolds the first letters of each word, with no grammar analysis, fully offline
- **Route B · Local NLP (default)** — English uses [compromise.js](https://github.com/spencermountain/compromise) and Chinese uses a rule engine; free, offline, no API key
- **Route C · AI (optional)** — connects to OpenAI, Claude or Ollama with your own API key, which stays on your device

| Provider | Default model | API key |
|---|---|---|
| OpenAI | `gpt-4o-mini` | `sk-…` |
| Claude | `claude-3-5-haiku-20241022` | `sk-ant-…` |
| Custom / Ollama | `llama3` | optional |

---

## Languages

- **English** — part-of-speech tagging with compromise.js, fairly accurate
- **Chinese** — a rule engine with a built-in dictionary, still improving
- **Mixed text** — detected automatically and handled paragraph by paragraph

---

## Repository layout

```
CantRead/
├── packages/
│   ├── core/               TABE engine (shared by every product)
│   └── firefox-extension/  Browser extension
├── tabe-reader/            Obsidian plugin
├── docs/                   Web demo (GitHub Pages)
├── prototypes/             ADHD reading-aid experiments
├── scripts/readme-src/     Plain sources of these READMEs
└── ROADMAP.md              Roadmap
```

**Development:** run `npm install`, then `npm run build` to build the engine and the extension, then `npm test`. After editing a README source, run `npm run readme` to regenerate the formatted files. Each product folder has its own README with details.

---

## Contributing

Issues and pull requests are welcome — especially Chinese dictionary additions, support for new languages, and real feedback like "it works badly on this kind of page". Open one [here](https://github.com/oldmercy/CantRead/issues).

MIT License · Made by Ahui ([@oldmercy](https://github.com/oldmercy))
