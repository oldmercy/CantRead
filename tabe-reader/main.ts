import { App, Notice, Plugin, PluginSettingTab, Setting,
         MarkdownPostProcessorContext, Command } from 'obsidian';
import nlp from 'compromise';
import { applyTABE, TABELayers } from './src/tabe-nlp';
import { applyTABEWithAI, testConnection, AIConfig, AIProvider, PROVIDER_DEFAULTS } from './src/tabe-ai';

// ─── Settings ────────────────────────────────────────────────────────────────

interface TABESettings {
  // General
  enabled: boolean;
  skipAlreadyFormatted: boolean;

  // Route B — Local NLP layers
  highlightNouns: boolean;
  highlightVerbs: boolean;
  highlightAdjectives: boolean;
  highlightNumbers: boolean;

  // Route C — AI API
  aiEnabled: boolean;
  aiProvider: AIProvider;
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl: string;
  /** Fall back to Route B if AI call fails */
  aiFallbackToLocal: boolean;
}

const DEFAULT_SETTINGS: TABESettings = {
  enabled: true,
  skipAlreadyFormatted: true,

  highlightNouns: true,
  highlightVerbs: true,
  highlightAdjectives: true,
  highlightNumbers: true,

  aiEnabled: false,
  aiProvider: 'openai',
  aiApiKey: '',
  aiModel: 'gpt-4o-mini',
  aiBaseUrl: '',
  aiFallbackToLocal: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasManualFormatting(el: HTMLElement): boolean {
  return el.querySelector('strong, em, mark, u') !== null;
}

function isInSkippedBlock(el: HTMLElement): boolean {
  const tag = el.tagName?.toLowerCase() ?? '';
  if (['code','pre','h1','h2','h3','h4','h5','h6','table','thead','tbody','th','td'].includes(tag)) return true;
  let parent = el.parentElement;
  while (parent) {
    const ptag = parent.tagName?.toLowerCase() ?? '';
    if (['pre','code','blockquote'].includes(ptag)) return true;
    if (parent.classList.contains('frontmatter')) return true;
    parent = parent.parentElement;
  }
  return false;
}

// ─── Paragraph processor ─────────────────────────────────────────────────────

async function processParagraph(el: HTMLElement, settings: TABESettings): Promise<void> {
  if (!settings.enabled) return;
  if (isInSkippedBlock(el)) return;
  if (settings.skipAlreadyFormatted && hasManualFormatting(el)) return;

  // Skip elements that already have child elements (complex DOM)
  const hasComplexChildren = Array.from(el.childNodes).some(n => n.nodeType === Node.ELEMENT_NODE);
  if (hasComplexChildren) return;

  const text = el.textContent ?? '';
  if (!text.trim()) return;

  const layers: TABELayers = {
    nouns:   settings.highlightNouns,
    verbs:   settings.highlightVerbs,
    adjs:    settings.highlightAdjectives,
    numbers: settings.highlightNumbers,
  };

  // ── Route C: AI ──────────────────────────────────────────
  if (settings.aiEnabled && settings.aiApiKey) {
    const aiConfig: AIConfig = {
      provider: settings.aiProvider,
      apiKey:   settings.aiApiKey,
      model:    settings.aiModel || PROVIDER_DEFAULTS[settings.aiProvider].model,
      baseUrl:  settings.aiBaseUrl || undefined,
    };
    try {
      el.innerHTML = await applyTABEWithAI(text, aiConfig);
      el.classList.add('tabe-processed', 'tabe-ai');
      return;
    } catch (e) {
      console.warn('[CantRead] AI call failed, falling back to local NLP:', e);
      if (!settings.aiFallbackToLocal) return;
    }
  }

  // ── Route B: Local NLP ───────────────────────────────────
  el.innerHTML = applyTABE(text, layers);
  el.classList.add('tabe-processed');
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export default class CantReadPlugin extends Plugin {
  settings: TABESettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    // Reading View post-processor
    this.registerMarkdownPostProcessor(
      (element: HTMLElement, _ctx: MarkdownPostProcessorContext) => {
        if (!this.settings.enabled) return;
        element.querySelectorAll('p, li').forEach(p => {
          processParagraph(p as HTMLElement, this.settings);
        });
      }
    );

    // Toggle: Cmd/Ctrl + Shift + T
    this.addCommand({
      id:   'toggle-cantread',
      name: 'Toggle CantRead formatting',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 't' }],
      callback: () => {
        this.settings.enabled = !this.settings.enabled;
        this.saveSettings();
        new Notice(`CantRead ${this.settings.enabled ? 'enabled ✦' : 'disabled'}`);
        this.refreshActiveLeaf();
      },
    } as Command);

    // Toggle AI: Cmd/Ctrl + Shift + A
    this.addCommand({
      id:   'toggle-cantread-ai',
      name: 'Toggle CantRead AI mode',
      hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'a' }],
      callback: () => {
        if (!this.settings.aiApiKey) {
          new Notice('CantRead: Set your API key in Settings first.');
          return;
        }
        this.settings.aiEnabled = !this.settings.aiEnabled;
        this.saveSettings();
        new Notice(`CantRead AI ${this.settings.aiEnabled ? 'enabled ✦ (Route C)' : 'disabled → Route B'}`);
        this.refreshActiveLeaf();
      },
    } as Command);

    this.addSettingTab(new CantReadSettingTab(this.app, this));
    console.log('CantRead loaded ✦');
  }

  onunload() { console.log('CantRead unloaded'); }

  refreshActiveLeaf() {
    try {
      // @ts-ignore
      this.app.workspace.getLeavesOfType('markdown').forEach((leaf: any) => {
        leaf.view?.previewMode?.rerender(true);
      });
    } catch (_) {}
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() { await this.saveData(this.settings); }
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

class CantReadSettingTab extends PluginSettingTab {
  plugin: CantReadPlugin;

  constructor(app: App, plugin: CantReadPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // ── Header ──────────────────────────────────────────────
    containerEl.createEl('h2', { text: 'CantRead Settings' });
    containerEl.createEl('p', {
      text: 'For brains that bounce off walls of text.',
      cls: 'tabe-settings-desc',
    });

    // ── General ─────────────────────────────────────────────
    containerEl.createEl('h3', { text: 'General' });

    new Setting(containerEl)
      .setName('Enable CantRead')
      .setDesc('Auto-apply TABE formatting in Reading View.  Shortcut: ⌘⇧T')
      .addToggle(t => t.setValue(this.plugin.settings.enabled).onChange(async v => {
        this.plugin.settings.enabled = v;
        await this.plugin.saveSettings();
      }));

    new Setting(containerEl)
      .setName('Skip manually formatted paragraphs')
      .setDesc('Paragraphs already using bold / highlight / italic are left untouched.')
      .addToggle(t => t.setValue(this.plugin.settings.skipAlreadyFormatted).onChange(async v => {
        this.plugin.settings.skipAlreadyFormatted = v;
        await this.plugin.saveSettings();
      }));

    // ── Route B: Local NLP ──────────────────────────────────
    containerEl.createEl('h3', { text: 'Route B — Local NLP (free, offline)' });
    containerEl.createEl('p', {
      text: 'compromise.js for English · rule-based lexicon for Chinese · auto-detected per paragraph.',
      cls: 'tabe-settings-desc',
    });

    const layerSettings: Array<[keyof TABESettings, string, string]> = [
      ['highlightNouns',      'Bold — Nouns & Proper Nouns',       'Labels and key concepts.'],
      ['highlightVerbs',      'Highlight — Main Verbs',            'Actions and state-change words. Yellow background.'],
      ['highlightAdjectives', 'Italic green — Adjectives & Adverbs','Qualifiers and supplements.'],
      ['highlightNumbers',    'Accent — Numbers & Dates',          'Numeric values, dates, statistics.'],
    ];

    layerSettings.forEach(([key, name, desc]) => {
      new Setting(containerEl).setName(name).setDesc(desc)
        .addToggle(t => t.setValue(this.plugin.settings[key] as boolean).onChange(async v => {
          (this.plugin.settings[key] as boolean) = v;
          await this.plugin.saveSettings();
        }));
    });

    // ── Route C: AI API ─────────────────────────────────────
    containerEl.createEl('h3', { text: 'Route C — AI API (semantic accuracy)' });
    containerEl.createEl('p', {
      text: 'Use your own API key. CantRead never stores or proxies keys — they stay in your Obsidian vault only.',
      cls: 'tabe-settings-desc',
    });

    new Setting(containerEl)
      .setName('Enable AI formatting')
      .setDesc('Route C: send paragraphs to AI for semantic TABE annotation.  Shortcut: ⌘⇧A')
      .addToggle(t => t.setValue(this.plugin.settings.aiEnabled).onChange(async v => {
        this.plugin.settings.aiEnabled = v;
        await this.plugin.saveSettings();
        // Re-render to show/hide dependent fields
        this.display();
      }));

    // Provider selector
    new Setting(containerEl)
      .setName('AI Provider')
      .setDesc('OpenAI (gpt-4o-mini recommended) · Claude · Custom/Local (Ollama, LM Studio…)')
      .addDropdown(dd => {
        dd.addOption('openai',  'OpenAI');
        dd.addOption('claude',  'Claude (Anthropic)');
        dd.addOption('custom',  'Custom / Local LLM');
        dd.setValue(this.plugin.settings.aiProvider);
        dd.onChange(async (v: AIProvider) => {
          this.plugin.settings.aiProvider = v;
          // Auto-fill model default when switching provider
          this.plugin.settings.aiModel   = PROVIDER_DEFAULTS[v].model;
          this.plugin.settings.aiBaseUrl  = v === 'custom' ? PROVIDER_DEFAULTS.custom.baseUrl : '';
          await this.plugin.saveSettings();
          this.display();
        });
      });

    // API Key
    new Setting(containerEl)
      .setName('API Key')
      .setDesc(this.plugin.settings.aiProvider === 'claude'
        ? 'Anthropic API key (sk-ant-…)'
        : 'OpenAI API key (sk-…) or key for your custom endpoint')
      .addText(text => {
        text.inputEl.type = 'password';
        text.setPlaceholder('sk-…')
            .setValue(this.plugin.settings.aiApiKey)
            .onChange(async v => {
              this.plugin.settings.aiApiKey = v.trim();
              await this.plugin.saveSettings();
            });
      });

    // Model
    new Setting(containerEl)
      .setName('Model')
      .setDesc('e.g. gpt-4o-mini · gpt-4o · claude-3-5-haiku-20241022 · llama3')
      .addText(text => text
        .setPlaceholder(PROVIDER_DEFAULTS[this.plugin.settings.aiProvider].model)
        .setValue(this.plugin.settings.aiModel)
        .onChange(async v => {
          this.plugin.settings.aiModel = v.trim();
          await this.plugin.saveSettings();
        }));

    // Custom base URL (only show for custom provider)
    if (this.plugin.settings.aiProvider === 'custom') {
      new Setting(containerEl)
        .setName('Base URL')
        .setDesc('OpenAI-compatible endpoint, e.g. http://localhost:11434/v1')
        .addText(text => text
          .setPlaceholder('http://localhost:11434/v1')
          .setValue(this.plugin.settings.aiBaseUrl)
          .onChange(async v => {
            this.plugin.settings.aiBaseUrl = v.trim();
            await this.plugin.saveSettings();
          }));
    }

    // Fallback toggle
    new Setting(containerEl)
      .setName('Fall back to local NLP on AI error')
      .setDesc('If the AI call fails (no internet, quota exceeded, etc.), use Route B automatically.')
      .addToggle(t => t.setValue(this.plugin.settings.aiFallbackToLocal).onChange(async v => {
        this.plugin.settings.aiFallbackToLocal = v;
        await this.plugin.saveSettings();
      }));

    // Test connection button
    new Setting(containerEl)
      .setName('Test connection')
      .setDesc('Send a short probe to verify your API key and model are working.')
      .addButton(btn => {
        btn.setButtonText('Test').onClick(async () => {
          if (!this.plugin.settings.aiApiKey) {
            new Notice('Please enter an API key first.');
            return;
          }
          btn.setButtonText('Testing…').setDisabled(true);
          const config: AIConfig = {
            provider: this.plugin.settings.aiProvider,
            apiKey:   this.plugin.settings.aiApiKey,
            model:    this.plugin.settings.aiModel || PROVIDER_DEFAULTS[this.plugin.settings.aiProvider].model,
            baseUrl:  this.plugin.settings.aiBaseUrl || undefined,
          };
          const result = await testConnection(config);
          btn.setButtonText('Test').setDisabled(false);
          if (result.ok) {
            new Notice('✅ CantRead AI connection OK!');
          } else {
            new Notice(`❌ Connection failed: ${result.error}`);
          }
        });
      });

    // ── Color Reference ─────────────────────────────────────
    containerEl.createEl('h3', { text: 'Color Reference' });
    const tbl = containerEl.createEl('table', { cls: 'tabe-color-table' });
    [
      ['**bold**',      'Nouns',      '#000 bold',        'tabe-bold'],
      ['==highlight==', 'Verbs',      '#ffe066 bg',       'tabe-highlight'],
      ['*italic*',      'Adj/Adv',    '#4caf50 green',    'tabe-italic'],
      ['123',           'Numbers',    '#e06c00 orange',   'tabe-number'],
    ].forEach(([syntax, role, color, cls]) => {
      const tr = tbl.createEl('tr');
      tr.createEl('td', { text: syntax });
      tr.createEl('td', { text: role });
      tr.createEl('td', { text: color });
      tr.createEl('td').createEl('span', { text: 'Sample', cls });
    });
  }
}
