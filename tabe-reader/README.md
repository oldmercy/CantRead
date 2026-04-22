# TABE Reader — Obsidian Plugin

> **For brains that bounce off walls of text.**

Automatically applies TABE-style visual formatting in Reading View — without touching your source markdown.

---

## What is TABE?

TABE is a reading format that uses semantic emphasis layers to give your eye clear visual anchors as it scans text. Think of it as **syntax highlighting for natural language**.

| Layer | Style | Semantic role |
|-------|-------|--------------|
| `**bold**` | **font-weight 700** | Nouns & proper nouns — the "label" |
| `==highlight==` | 🟡 yellow background | Main verbs — the action/state |
| `*italic*` | 🟢 green italic | Adjectives & adverbs — supplements |
| numbers | 🟠 orange accent | Numeric values & dates |

---

## How It Works

1. Hooks into Obsidian's **Reading View** via `registerMarkdownPostProcessor`
2. For each plain paragraph, runs **compromise.js** (local NLP, no API) to identify word roles
3. Wraps words in `<span>` tags with TABE CSS classes
4. **Skips** paragraphs that already have manual formatting (`**bold**`, `==highlight==`, etc.)
5. **Never touches** your source markdown file

---

## Installation (Self-use)

1. Build or download the plugin files (`main.js`, `manifest.json`, `styles.css`)
2. Copy the folder into `.obsidian/plugins/tabe-reader/`
3. Open Obsidian → Settings → Community Plugins → Enable "TABE Reader"

**Share with others:** Upload to a GitHub repo and others can install via [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat).

---

## Commands

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + T` | Toggle TABE formatting on/off |

---

## Settings

All layers can be toggled independently in Settings → TABE Reader:

- Enable/disable master toggle
- Bold — Nouns & Proper Nouns
- Highlight — Main Verbs
- Italic green — Adjectives & Adverbs
- Accent — Numbers & Dates
- Skip manually formatted paragraphs

---

## Tech Stack

- **TypeScript** · Obsidian Plugin API
- **compromise.js** v14 — browser-side NLP, runs 100% locally
- **esbuild** — bundles everything into a single `main.js`

---

## Roadmap

- [x] Phase 0: Obsidian plugin — Reading View auto-formatting
- [ ] Phase 1: Chrome + Firefox browser extension
- [ ] Phase 2: AI API layer (Claude / GPT) for semantic accuracy
- [ ] Phase 3: Mobile (iOS Safari Extension / Bookmarklet)

---

## License

MIT · [CantRead](https://github.com/CantRead)
