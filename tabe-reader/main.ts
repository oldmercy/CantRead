import { App, Plugin, PluginSettingTab, Setting, MarkdownPostProcessorContext, Command } from 'obsidian';
import nlp from 'compromise';

// ─── Settings ────────────────────────────────────────────────────────────────

interface TABESettings {
  enabled: boolean;
  highlightNouns: boolean;
  highlightVerbs: boolean;
  highlightAdjectives: boolean;
  highlightNumbers: boolean;
  skipAlreadyFormatted: boolean;
}

const DEFAULT_SETTINGS: TABESettings = {
  enabled: true,
  highlightNouns: true,
  highlightVerbs: true,
  highlightAdjectives: true,
  highlightNumbers: true,
  skipAlreadyFormatted: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Detect if a paragraph already has manual TABE / markdown emphasis.
 * If so, skip auto-formatting to avoid double-processing.
 */
function hasManualFormatting(el: HTMLElement): boolean {
  return (
    el.querySelector('strong, em, mark, u') !== null ||
    el.innerHTML.includes('==') ||
    el.innerHTML.includes('<b>') ||
    el.innerHTML.includes('<i>')
  );
}

/**
 * Check whether a node is inside a block we should never touch:
 * code blocks, frontmatter, headings, tables, blockquotes.
 */
function isInSkippedBlock(el: HTMLElement): boolean {
  const tag = el.tagName?.toLowerCase() ?? '';
  const skippedTags = ['code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'th', 'td'];
  if (skippedTags.includes(tag)) return true;

  let parent = el.parentElement;
  while (parent) {
    const ptag = parent.tagName?.toLowerCase() ?? '';
    if (['pre', 'code', 'blockquote'].includes(ptag)) return true;
    if (parent.classList.contains('frontmatter')) return true;
    parent = parent.parentElement;
  }
  return false;
}

/**
 * Escape HTML special characters before inserting raw text.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Core NLP formatter ───────────────────────────────────────────────────────

/**
 * Apply TABE visual formatting to a plain text string using compromise.js.
 *
 * Emphasis hierarchy (mirrors TABE manual convention):
 *   **bold**      → nouns / proper nouns  → .tabe-bold
 *   ==highlight== → main verbs            → .tabe-highlight
 *   *italic*      → adjectives / adverbs  → .tabe-italic  (rendered green)
 *   special       → numbers / dates       → .tabe-number
 */
function applyTABEFormatting(text: string, settings: TABESettings): string {
  if (!text.trim()) return escapeHtml(text);

  const doc = nlp(text);

  // Build a token-level annotation map
  // compromise gives us term offsets we can use to reconstruct annotated HTML
  type Annotation = 'noun' | 'verb' | 'adj' | 'number' | 'none';

  interface Token {
    text: string;
    pre: string;
    post: string;
    annotation: Annotation;
  }

  const tokens: Token[] = [];

  // Iterate over each term in the doc
  doc.forEach((sent: any) => {
    sent.terms().forEach((term: any) => {
      const tags: string[] = Object.keys(term.tags ?? {});
      let annotation: Annotation = 'none';

      if (settings.highlightNumbers && (tags.includes('Value') || tags.includes('Date') || tags.includes('NumericValue'))) {
        annotation = 'number';
      } else if (settings.highlightNouns && (tags.includes('ProperNoun') || tags.includes('Noun'))) {
        annotation = 'noun';
      } else if (settings.highlightVerbs && tags.includes('Verb')) {
        annotation = 'verb';
      } else if (settings.highlightAdjectives && (tags.includes('Adjective') || tags.includes('Adverb'))) {
        annotation = 'adj';
      }

      tokens.push({
        text: term.text ?? '',
        pre: term.pre ?? '',
        post: term.post ?? '',
        annotation,
      });
    });
  });

  // Reconstruct HTML from tokens
  let html = '';
  for (const token of tokens) {
    const escapedPre = escapeHtml(token.pre);
    const escapedText = escapeHtml(token.text);
    const escapedPost = escapeHtml(token.post);

    if (token.annotation === 'none' || !escapedText) {
      html += escapedPre + escapedText + escapedPost;
      continue;
    }

    const classMap: Record<Annotation, string> = {
      noun: 'tabe-bold',
      verb: 'tabe-highlight',
      adj: 'tabe-italic',
      number: 'tabe-number',
      none: '',
    };

    const cls = classMap[token.annotation];
    html += `${escapedPre}<span class="${cls}">${escapedText}</span>${escapedPost}`;
  }

  return html || escapeHtml(text);
}

// ─── Process a single paragraph element ───────────────────────────────────────

function processParagraph(el: HTMLElement, settings: TABESettings): void {
  if (!settings.enabled) return;
  if (isInSkippedBlock(el)) return;
  if (settings.skipAlreadyFormatted && hasManualFormatting(el)) return;

  // Only process text-only paragraphs (avoid breaking complex DOM)
  const hasComplexChildren = Array.from(el.childNodes).some(
    (node) => node.nodeType === Node.ELEMENT_NODE
  );
  if (hasComplexChildren) return;

  const originalText = el.textContent ?? '';
  if (!originalText.trim()) return;

  const formattedHTML = applyTABEFormatting(originalText, settings);
  el.innerHTML = formattedHTML;
  el.classList.add('tabe-processed');
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default class TABEReaderPlugin extends Plugin {
  settings: TABESettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    // Register Reading View post-processor
    this.registerMarkdownPostProcessor(
      (element: HTMLElement, context: MarkdownPostProcessorContext) => {
        if (!this.settings.enabled) return;

        // Process all paragraph elements in the rendered view
        const paragraphs = element.querySelectorAll('p, li');
        paragraphs.forEach((p) => {
          processParagraph(p as HTMLElement, this.settings);
        });
      }
    );

    // Toggle command: Cmd/Ctrl + Shift + T
    this.addCommand({
      id: 'toggle-tabe-formatting',
      name: 'Toggle TABE formatting',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 't' }],
      callback: () => {
        this.settings.enabled = !this.settings.enabled;
        this.saveSettings();
        // Notify user
        const state = this.settings.enabled ? 'enabled ✦' : 'disabled';
        // @ts-ignore
        new (this.app as any).Notice(`TABE Reader ${state}`);
        // Trigger re-render of active leaf
        this.refreshActiveLeaf();
      },
    } as Command);

    // Settings tab
    this.addSettingTab(new TABESettingTab(this.app, this));

    console.log('TABE Reader loaded ✦');
  }

  onunload() {
    console.log('TABE Reader unloaded');
  }

  /** Force the active markdown leaf to re-render so toggle takes effect immediately */
  refreshActiveLeaf() {
    const leaf = this.app.workspace.getActiveViewOfType(
      // @ts-ignore – MarkdownView is available at runtime
      (this.app as any).workspace.getLeavesOfType('markdown')[0]?.view?.constructor
    );
    if (leaf) {
      // @ts-ignore
      leaf.previewMode?.rerender(true);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

// ─── Settings Tab UI ──────────────────────────────────────────────────────────

class TABESettingTab extends PluginSettingTab {
  plugin: TABEReaderPlugin;

  constructor(app: App, plugin: TABEReaderPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'TABE Reader Settings' });
    containerEl.createEl('p', {
      text: 'TABE-style formatting layers: bold (nouns) · highlight (verbs) · italic green (adjectives) · number accent',
      cls: 'tabe-settings-desc',
    });

    // Master toggle
    new Setting(containerEl)
      .setName('Enable TABE formatting')
      .setDesc('Auto-apply TABE visual style in Reading View. Shortcut: Cmd/Ctrl + Shift + T')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enabled).onChange(async (value) => {
          this.plugin.settings.enabled = value;
          await this.plugin.saveSettings();
        })
      );

    // Skip already formatted
    new Setting(containerEl)
      .setName('Skip manually formatted paragraphs')
      .setDesc('If a paragraph already has bold / highlight / italic, leave it untouched.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.skipAlreadyFormatted).onChange(async (value) => {
          this.plugin.settings.skipAlreadyFormatted = value;
          await this.plugin.saveSettings();
        })
      );

    containerEl.createEl('h3', { text: 'Formatting Layers' });

    // Nouns
    new Setting(containerEl)
      .setName('Bold — Nouns & Proper Nouns')
      .setDesc('Wrap nouns in bold (font-weight: 700). The "label" layer of TABE.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.highlightNouns).onChange(async (value) => {
          this.plugin.settings.highlightNouns = value;
          await this.plugin.saveSettings();
        })
      );

    // Verbs
    new Setting(containerEl)
      .setName('Highlight — Main Verbs')
      .setDesc('Wrap verbs in yellow highlight (#ffe066). The "main recognition point" layer.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.highlightVerbs).onChange(async (value) => {
          this.plugin.settings.highlightVerbs = value;
          await this.plugin.saveSettings();
        })
      );

    // Adjectives
    new Setting(containerEl)
      .setName('Italic green — Adjectives & Adverbs')
      .setDesc('Wrap adjectives/adverbs in green italic. The "supplement" layer.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.highlightAdjectives).onChange(async (value) => {
          this.plugin.settings.highlightAdjectives = value;
          await this.plugin.saveSettings();
        })
      );

    // Numbers
    new Setting(containerEl)
      .setName('Accent — Numbers & Dates')
      .setDesc('Give numbers and dates a distinct accent color (#e06c00).')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.highlightNumbers).onChange(async (value) => {
          this.plugin.settings.highlightNumbers = value;
          await this.plugin.saveSettings();
        })
      );

    // Color reference
    containerEl.createEl('h3', { text: 'Color Reference' });
    const colorTable = containerEl.createEl('table', { cls: 'tabe-color-table' });
    const rows = [
      ['**bold**', 'Nouns', '#000 / font-weight 700', 'tabe-bold'],
      ['==highlight==', 'Verbs', '#ffe066 background', 'tabe-highlight'],
      ['*italic*', 'Adjectives', '#4caf50 green', 'tabe-italic'],
      ['123', 'Numbers', '#e06c00 orange', 'tabe-number'],
    ];
    rows.forEach(([syntax, role, color, cls]) => {
      const tr = colorTable.createEl('tr');
      tr.createEl('td', { text: syntax });
      tr.createEl('td', { text: role });
      tr.createEl('td', { text: color });
      tr.createEl('td').createEl('span', { text: 'Sample', cls });
    });
  }
}
