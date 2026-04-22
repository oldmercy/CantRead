/**
 * TABE AI Formatter — Route C
 *
 * Sends plain text to an LLM (OpenAI-compatible API or Claude)
 * and receives back TABE-annotated HTML spans.
 *
 * Supports:
 *   - OpenAI (gpt-4o, gpt-4o-mini, gpt-3.5-turbo …)
 *   - Claude via Anthropic API
 *   - Any OpenAI-compatible endpoint (local LLMs via Ollama, LM Studio, etc.)
 *
 * The user provides their own API key — CantRead never proxies or stores keys.
 */

// ─── Config ───────────────────────────────────────────────────────────────────

export type AIProvider = 'openai' | 'claude' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  /** OpenAI model name or Claude model name */
  model: string;
  /** For custom/local endpoints e.g. http://localhost:11434/v1 */
  baseUrl?: string;
  /** Max tokens for the response (default 2048) */
  maxTokens?: number;
}

export const PROVIDER_DEFAULTS: Record<AIProvider, { baseUrl: string; model: string; label: string }> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model:   'gpt-4o-mini',
    label:   'OpenAI',
  },
  claude: {
    baseUrl: 'https://api.anthropic.com/v1',
    model:   'claude-3-5-haiku-20241022',
    label:   'Claude (Anthropic)',
  },
  custom: {
    baseUrl: 'http://localhost:11434/v1',
    model:   'llama3',
    label:   'Custom / Local LLM',
  },
};

// ─── System Prompt ────────────────────────────────────────────────────────────

/**
 * The system prompt teaches the LLM the TABE semantic hierarchy.
 * It must output ONLY the HTML-wrapped result — no explanations.
 */
const SYSTEM_PROMPT = `You are a semantic text formatter for the TABE reading system.
TABE helps neurodivergent readers (ADHD, ASD) by adding visual anchors to plain text.

Your job: take the user's plain text and wrap words/phrases in TABE spans.

TABE emphasis hierarchy (apply in this priority order):
1. <span class="tabe-number">…</span>  → numbers, dates, percentages, statistics
2. <span class="tabe-bold">…</span>    → key nouns, proper nouns, core concepts, labels
3. <span class="tabe-highlight">…</span> → main verbs, actions, state-change words
4. <span class="tabe-italic">…</span>  → adjectives, adverbs, qualifiers, supplements

Rules:
- Output ONLY the formatted HTML — no markdown, no explanation, no code fences
- Preserve ALL original text, whitespace, and punctuation exactly
- Do NOT wrap function words (the, a, of, 的, 了, 是, etc.) unless they are the focus
- Do NOT double-wrap — each word gets at most one span
- Connector dots "·" should stay unwrapped
- For mixed Chinese-English text: apply rules to both languages simultaneously
- Aim for ~30-40% of content words annotated — avoid over-annotating
- Prefer semantic accuracy over quantity: only wrap words that genuinely help scanning

Examples:
Input:  "Met Sarah Chen at the AI startup mixer on Thursday."
Output: "Met <span class="tabe-bold">Sarah Chen</span> at the <span class="tabe-bold">AI startup mixer</span> on <span class="tabe-number">Thursday</span>."

Input:  "这个插件的核心功能是自动格式化阅读视图。"
Output: "这个<span class="tabe-bold">插件</span>的<span class="tabe-bold">核心功能</span>是<span class="tabe-highlight">自动格式化</span><span class="tabe-bold">阅读视图</span>。"

Input:  "用 compromise.js 分析 NLP 效果，完全免费离线运行。"
Output: "用 <span class="tabe-bold">compromise.js</span> <span class="tabe-highlight">分析</span> <span class="tabe-bold">NLP</span> 效果，<span class="tabe-italic">完全免费</span><span class="tabe-highlight">离线运行</span>。"`;

// ─── OpenAI-compatible call ───────────────────────────────────────────────────

async function callOpenAI(text: string, config: AIConfig): Promise<string> {
  const baseUrl = config.baseUrl || PROVIDER_DEFAULTS.openai.baseUrl;
  const model   = config.model   || PROVIDER_DEFAULTS.openai.model;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: config.maxTokens ?? 2048,
      temperature: 0.1,   // low temp → consistent formatting
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: text },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  return sanitizeAIOutput(content, text);
}

// ─── Claude (Anthropic) call ──────────────────────────────────────────────────

async function callClaude(text: string, config: AIConfig): Promise<string> {
  const model = config.model || PROVIDER_DEFAULTS.claude.model;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: config.maxTokens ?? 2048,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: text },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text ?? '';
  return sanitizeAIOutput(content, text);
}

// ─── Output Sanitizer ─────────────────────────────────────────────────────────

/**
 * Validate that AI output is safe HTML with only TABE spans.
 * Strip anything unexpected. Fall back to plain escaped text on failure.
 */
function sanitizeAIOutput(raw: string, originalText: string): string {
  if (!raw.trim()) return escapeHtml(originalText);

  // Remove markdown code fences if model wrapped output
  let clean = raw.replace(/^```(?:html)?\n?/i, '').replace(/\n?```$/, '').trim();

  // Allow only tabe-* spans — strip any other HTML tags
  const ALLOWED_SPAN = /<span class="tabe-(bold|highlight|italic|number)">([\s\S]*?)<\/span>/g;
  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = ALLOWED_SPAN.exec(clean)) !== null) {
    // Text before this span
    if (match.index > lastIndex) {
      parts.push(escapeHtml(clean.slice(lastIndex, match.index)));
    }
    // The span itself (content already escaped by LLM hopefully, but re-escape inner text)
    const cls     = match[1];
    const inner   = match[2];
    // Only allow plain text inside spans (no nested HTML)
    const safeInner = inner.replace(/<[^>]*>/g, '');
    parts.push(`<span class="tabe-${cls}">${escapeHtml(safeInner)}</span>`);
    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last span
  if (lastIndex < clean.length) {
    parts.push(escapeHtml(clean.slice(lastIndex)));
  }

  const result = parts.join('');

  // Sanity check: result should contain the original text's characters
  // (rough check — if too short, fall back)
  const origLen  = originalText.replace(/\s/g, '').length;
  const resultLen = result.replace(/<[^>]*>/g, '').replace(/&\w+;/g, 'X').replace(/\s/g, '').length;
  if (origLen > 0 && resultLen < origLen * 0.5) {
    console.warn('[CantRead] AI output sanity check failed, falling back to plain text');
    return escapeHtml(originalText);
  }

  return result;
}

function escapeHtml(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Main Entry ───────────────────────────────────────────────────────────────

/**
 * Format a plain text paragraph using the configured AI provider.
 * Returns TABE-annotated HTML.
 *
 * Throws on network/API error — caller should catch and fall back to Route B.
 */
export async function applyTABEWithAI(text: string, config: AIConfig): Promise<string> {
  if (!text.trim()) return escapeHtml(text);
  if (!config.apiKey) throw new Error('No API key configured');

  switch (config.provider) {
    case 'openai':
    case 'custom':
      return callOpenAI(text, {
        ...config,
        baseUrl: config.baseUrl || PROVIDER_DEFAULTS[config.provider].baseUrl,
      });
    case 'claude':
      return callClaude(text, config);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Test connectivity with a short probe string.
 * Returns { ok: true } or { ok: false, error: string }.
 */
export async function testConnection(config: AIConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    await applyTABEWithAI('Hello world. Testing TABE connection.', config);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message ?? String(e) };
  }
}
