<!-- 自动生成，请勿直接修改。源文件：scripts/readme-src/ROADMAP.md，运行 npm run readme 重新生成。 -->
<!-- Generated file — edit scripts/readme-src/ROADMAP.md and run "npm run readme". -->

# CantRead Roadmap

**English** | [简体中文](ROADMAP.zh-CN.md)

> **North star:** this <mark>is</mark> not about **reading** *faster*. **It** <mark>is</mark> about **lowering the barrier to opening the thing at all** — the **newsletter you** <mark>subscribed</mark> to but never <mark>open</mark>, the *long* **email you** <mark>want</mark> to <mark>close</mark> *right away*, the **paper** that <mark>will</mark> not <mark>go in</mark>. First, <mark>make</mark> **people** <mark>willing</mark> to <mark>start reading</mark>.

**Direction:** **browser** first. *Most* **reading** <mark>happens</mark> in the **browser**, and an **extension** <mark>asks</mark> **you** to <mark>import</mark> **nothing**, so **it** <mark>has</mark> the least **friction**. The **standalone app** <mark>is</mark> not <mark>cancelled</mark>; **it** <mark>is</mark> on **hold** until **we** <mark>see</mark> how much the **extension** <mark>can cover</mark>.

Legend: ✅ <mark>shipped</mark> · 🚧 in **progress ·** 📋 *planned* · 💭 **idea**, not <mark>decided</mark>

---

## ✅ Shipped

- **Obsidian plugin v0.1.1** — **formats Reading View** *automatically* ([`tabe-reader/`](tabe-reader/))
- **Web demo** — <https://oldmercy.github.io/CantRead/>
- **Shared engine `@cantread/core`** — every **product** <mark>uses</mark> the *same* **TABE engine** ([`packages/core/`](packages/core/))
- **Firefox extension v1.0** — *whole*-**page** and **selection** <mark>highlighting</mark>, a **settings panel** with a **switch** for each **layer**, a **keyboard shortcut**, an **English** and **Chinese interface**, and no **data collection** ([`packages/firefox-extension/`](packages/firefox-extension/))

## 🚧 In progress

- **Listing on the Firefox Add-ons store (AMO)** — one-**click** <mark>install</mark> and *automatic* **updates** *once* **it** <mark>is approved</mark>

---

## 📋 v1.1 — smoother everyday use

- **Auto-highlight on chosen sites** — **pages you** <mark>trust</mark>, *like* **your newsletters** or **school email**, <mark>are highlighted</mark> as soon as **they** <mark>open</mark>. Off by **default**; **you** <mark>add</mark> the **sites yourself**
- **Android** — **Firefox** for **Android** <mark>supports</mark> **extensions**; <mark>adapt</mark> the **panel** for *small* **screens** and <mark>touch</mark>
- **Gmail and webmail tuning** — **email pages** <mark>have</mark> *messy* **structure** and <mark>need</mark> *specific* **handling**
- **Dynamic content** — <mark>text</mark> that <mark>appears</mark> *later*, from *infinite* **scroll** or an "**expand**" **button**, <mark>gets highlighted</mark> *too*
- **Lighter loading** — the **extension** *currently* <mark>waits on</mark> every **page** with the **engine** (about 450 **KB**) *already* <mark>loaded</mark>; <mark>load</mark> **it** *only* when **you** <mark>click</mark>, so **pages** <mark>stay</mark> *fast* and the **install** <mark>prompt</mark> *no longer* <mark>asks</mark> for **access** to *all* **sites**
- **Better Chinese** — <mark>improve</mark> **Chinese word segmentation**, which *currently* <mark>splits</mark> *proper* **nouns** <mark>like</mark> *多*伦*多大*<mark>学</mark> *incorrectly*

## 📋 v1.2 — more browsers

- **Chrome / Edge** — **they** <mark>use</mark> the *same* **extension standard**, so this *mostly* <mark>needs</mark> **configuration** <mark>changes</mark> and a **Chrome Web Store listing**
- 💭 **Safari / iPhone** — <mark>requires packaging</mark> as an **app** with **Xcode** for the **App Store**; *costly*, so **it** <mark>depends</mark> on **demand**

## 📋 v2 — ADHD reading aids, in the extension

These <mark>were planned</mark> for the **desktop app** and <mark>tested</mark> in the [ADHD prototype](prototypes/adhd-reading-demo.html). Each one <mark>will be</mark> a **switch you** <mark>can combine</mark> with the **others**:

- **Read-along** — <mark>reads</mark> **sentence** by <mark>sentence</mark> while the *current* **sentence stays** <mark>highlighted</mark> and the **page scrolls**. The **volume** <mark>goes</mark> down to 0, which <mark>turns</mark> **it** into a *silent visual* **metronome**. **It** <mark>starts</mark> with the **system voice** (**Web Speech API**), so no **AI model** <mark>is</mark> *needed*
- **Sentence focus** — the *current* **sentence** <mark>stays clear</mark>, the **text** around **it** <mark>fades</mark>, and the **arrow** <mark>keys move</mark> **you** <mark>forward</mark>
- **Position memory** — <mark>close</mark> the **page**, <mark>open</mark> **it** *again*, and **you** <mark>are</mark> **back** at the **sentence** where **you** <mark>stopped</mark>. This <mark>is</mark> for "**I** <mark>drifted</mark> off and <mark>lost</mark> **my place**"
- **Skim skeleton** — *important* **sentences** <mark>are marked</mark> *automatically*, and one **switch** <mark>flips</mark> between the *full* **text** and the **skeleton**

## 📋 v3 — reading papers

- **A PDF reader inside the extension** — <mark>open</mark> a **PDF** in the **extension** and <mark>get</mark> the *same* **highlighting**. **Firefox's** <mark>built</mark>-in **PDF viewer** <mark>does</mark> not <mark>allow</mark> **extensions** to <mark>change</mark> **it**, so the **extension** <mark>needs</mark> **its** *own* **viewer** (<mark>based</mark> on **pdf.js**)
- **Term extraction with hover definitions**, **section detection and jumping**, and **export to Obsidian**

## 💭 Later / exploring

- **System-wide popup (macOS)** — *select* **text** in any **app**, <mark>press</mark> a **shortcut**, and a **window** <mark>shows</mark> **it** with **TABE** <mark>highlighting</mark>. A **system font** <mark>cannot</mark> <mark>do</mark> this: **fonts** *only* <mark>know</mark> **letter shapes**, not whether a **word** <mark>is</mark> a **noun** or a **verb**
- **Long-sentence splitting** — <mark>use</mark> **AI** to <mark>break tangled</mark> *long* **sentences** into a few *short* **ones**
- **AI mode (Route C) in the extension** — <mark>bring</mark> **your** *own* **API key** or a *local* **model** (**Ollama**) for *more accurate* **meaning**
- **More natural read-along voices** — a *small local* **text**-to-**speech model**
- **Standalone desktop app** — <mark>decided</mark> *once* **we** <mark>know</mark> how much the **extension** <mark>covers</mark>

---

**Ideas** or <mark>requests</mark>? [Open an issue](https://github.com/oldmercy/CantRead/issues).
