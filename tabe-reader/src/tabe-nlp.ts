/**
 * TABE NLP Engine — Multi-language support
 * Handles: English · Chinese · Mixed (中英混合)
 *
 * Strategy:
 *  - Detect language composition of each text chunk
 *  - English segments → compromise.js POS tagging
 *  - Chinese segments → rule-based lexicon + structural patterns
 *  - Mixed → split by script boundary, process each, merge
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TABEClass = 'tabe-bold' | 'tabe-highlight' | 'tabe-italic' | 'tabe-number' | null;

export interface TABEToken {
  text: string;
  cls: TABEClass;
}

export interface TABELayers {
  nouns: boolean;
  verbs: boolean;
  adjs: boolean;
  numbers: boolean;
}

export const DEFAULT_LAYERS: TABELayers = {
  nouns: true,
  verbs: true,
  adjs: true,
  numbers: true,
};

// ─── Language Detection ───────────────────────────────────────────────────────

/** CJK Unified Ideographs + CJK Extension ranges */
const CJK_RE = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
const LATIN_RE = /[a-zA-Z]/;

type LangType = 'zh' | 'en' | 'mixed' | 'other';

function detectLang(text: string): LangType {
  const hasCJK   = CJK_RE.test(text);
  const hasLatin = LATIN_RE.test(text);
  if (hasCJK && hasLatin) return 'mixed';
  if (hasCJK)  return 'zh';
  if (hasLatin) return 'en';
  return 'other';
}

// ─── Chinese Lexicons ─────────────────────────────────────────────────────────

/**
 * Structural / function words → never highlighted (connector role)
 * 这些词在 TABE 里相当于 · 的角色，是视觉上的"过渡"
 */
const ZH_FUNCTION = new Set([
  '的','地','得','了','着','过','和','与','及','或','但','而','却','也','都',
  '就','才','又','再','还','已','在','到','从','对','为','被','把','让','由',
  '以','于','向','往','给','跟','同','比','按','像','如','若','虽','即','凡',
  '这','那','这个','那个','这些','那些','此','其','之','者','所','何','哪',
  '是','有','没','不','非','无','否','很','太','更','最','极','挺','比较',
  '一','二','三','四','五','六','七','八','九','十','百','千','万','亿',
  '我','你','他','她','它','我们','你们','他们','她们','它们','自己',
  '什么','哪里','哪个','怎么','为什么','谁','哪','几','多少',
  '吗','吧','啊','呢','哦','嗯','呀','哇','哈','嘛','咯',
  '然后','所以','因此','因为','但是','而且','不过','另外','同时','其次',
  '一般','通常','往往','经常','总是','有时','偶尔','已经','正在','将要',
]);

/**
 * Chinese verbs → tabe-highlight (action / state recognition points)
 */
const ZH_VERBS = new Set([
  // 动作动词
  '做','写','说','看','听','走','跑','学','教','想','知','用','给','拿',
  '买','卖','吃','喝','睡','起','开','关','来','去','到','进','出','上','下',
  '发现','认为','觉得','感觉','相信','希望','担心','决定','计划','准备',
  '开始','结束','完成','实现','建立','创建','设计','开发','构建','搭建',
  '分析','研究','探索','测试','验证','优化','改进','解决','处理','管理',
  '发布','部署','运行','执行','触发','调用','返回','生成','转换','提取',
  '合并','拆分','过滤','排序','查询','存储','加载','下载','上传','同步',
  '联系','沟通','交流','讨论','分享','推荐','介绍','展示','演示','汇报',
  '找到','遇到','看到','听到','收到','获得','得到','拥有','失去','缺少',
  '提高','降低','增加','减少','扩展','缩小','加速','减缓','改变','保持',
  '支持','帮助','推动','阻止','影响','促进','导致','造成','引起','产生',
  '回去','出来','进来','上去','下来','过来','过去','回来','起来','下去',
]);

/**
 * Chinese nouns / proper noun patterns → tabe-bold
 * (labels / key concepts — the "anchor" layer)
 */
const ZH_NOUNS = new Set([
  // 技术名词
  '插件','功能','模块','系统','平台','框架','工具','接口','数据','算法',
  '模型','网络','服务','应用','程序','代码','文件','格式','结构','架构',
  '用户','客户','产品','项目','版本','文档','报告','方案','策略','计划',
  '问题','错误','结果','效果','性能','效率','质量','安全','稳定','可靠',
  '浏览器','服务器','数据库','云端','本地','端口','协议','标准','规范',
  // 人文名词
  '方法','方式','思路','逻辑','原则','规则','标准','目标','意义','价值',
  '挑战','机会','优势','劣势','风险','收益','成本','资源','时间','空间',
  '笔记','格式','排版','视觉','阅读','理解','记忆','注意力','专注',
  '社区','团队','成员','角色','职责','权限','流程','步骤','阶段','周期',
  // 常见专有名词前缀/后缀模式由代码处理
]);

/**
 * Chinese adjectives / descriptors → tabe-italic (green)
 */
const ZH_ADJS = new Set([
  '好','坏','大','小','多','少','快','慢','高','低','长','短','新','旧',
  '重要','关键','核心','主要','次要','基本','简单','复杂','困难','容易',
  '有效','无效','正确','错误','准确','精确','完整','完善','成熟','稳定',
  '自动','手动','本地','远程','实时','异步','同步','并行','串行','独立',
  '开源','免费','付费','商业','专业','通用','特定','专有','公共','私有',
  '强大','灵活','轻量','高效','安全','可靠','易用','友好','清晰','直观',
  '自然','流畅','丰富','简洁','优雅','规范','统一','标准','正式','随意',
  '明显','显著','微小','巨大','深入','浅显','广泛','具体','抽象','直接',
]);

// Numbers: Chinese number chars + Arabic digits
const ZH_NUMBER_RE = /^[\d０-９]+([.,，。][\d]+)?([%％]|万|亿|千|百|十)?$|^[零一二三四五六七八九十百千万亿]+$/;

// Date/time patterns in Chinese
const ZH_DATE_RE = /^\d{2,4}[-/年]\d{1,2}[-/月](\d{1,2}[日号]?)?$|^\d{1,2}[月]\d{1,2}[日号]$|^\d{1,2}:\d{2}(:\d{2})?$/;

// ─── Chinese Tokenizer ────────────────────────────────────────────────────────

/**
 * Segment Chinese text into tokens using a greedy max-match approach
 * against our lexicons, falling back to single-character tokens.
 * Returns tokens with their TABE classification.
 */
function tokenizeZh(text: string, layers: TABELayers): TABEToken[] {
  const tokens: TABEToken[] = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    // ── ASCII digits / numbers within Chinese text ──
    if (/\d/.test(ch)) {
      let num = '';
      while (i < text.length && /[\d.,，%％]/.test(text[i])) {
        num += text[i++];
      }
      // Check for trailing Chinese unit
      if (i < text.length && /[万亿千百十%％]/.test(text[i])) num += text[i++];
      tokens.push({ text: num, cls: layers.numbers ? 'tabe-number' : null });
      continue;
    }

    // ── Punctuation / whitespace → pass through as-is ──
    if (/[\s\u3000\r\n]/.test(ch)) {
      tokens.push({ text: ch, cls: null });
      i++; continue;
    }
    if (/[，。！？、；：""''【】《》（）…—～·\.,!?;:\-()[\]{}"']/.test(ch)) {
      tokens.push({ text: ch, cls: null });
      i++; continue;
    }

    // ── Greedy max-match forward (try 4-char, 3-char, 2-char, 1-char) ──
    let matched = false;
    for (let len = Math.min(4, text.length - i); len >= 2; len--) {
      const word = text.slice(i, i + len);

      if (ZH_FUNCTION.has(word)) {
        tokens.push({ text: word, cls: null });
        i += len; matched = true; break;
      }
      if (layers.verbs && ZH_VERBS.has(word)) {
        tokens.push({ text: word, cls: 'tabe-highlight' });
        i += len; matched = true; break;
      }
      if (layers.nouns && ZH_NOUNS.has(word)) {
        tokens.push({ text: word, cls: 'tabe-bold' });
        i += len; matched = true; break;
      }
      if (layers.adjs && ZH_ADJS.has(word)) {
        tokens.push({ text: word, cls: 'tabe-italic' });
        i += len; matched = true; break;
      }
    }

    if (!matched) {
      // Single character fallback
      const single = text[i];
      let cls: TABEClass = null;

      if (ZH_FUNCTION.has(single)) {
        cls = null;
      } else if (layers.numbers && (ZH_NUMBER_RE.test(single) || ZH_DATE_RE.test(single))) {
        cls = 'tabe-number';
      } else if (layers.verbs && ZH_VERBS.has(single)) {
        cls = 'tabe-highlight';
      } else if (layers.adjs && ZH_ADJS.has(single)) {
        cls = 'tabe-italic';
      } else if (layers.nouns && CJK_RE.test(single)) {
        // Heuristic: standalone CJK chars that aren't function words
        // are likely nouns (most common case in Chinese)
        cls = 'tabe-bold';
      }

      tokens.push({ text: single, cls });
      i++;
    }
  }

  // ── Post-process: merge consecutive tokens of same class ──
  return mergeConsecutive(tokens);
}

/** Merge runs of same-class tokens to reduce span noise */
function mergeConsecutive(tokens: TABEToken[]): TABEToken[] {
  if (!tokens.length) return tokens;
  const result: TABEToken[] = [{ ...tokens[0] }];
  for (let i = 1; i < tokens.length; i++) {
    const prev = result[result.length - 1];
    const cur  = tokens[i];
    // Only merge if same non-null class AND no punctuation between
    if (prev.cls && cur.cls === prev.cls && !/[，。！？、；：…—]/.test(prev.text.slice(-1))) {
      prev.text += cur.text;
    } else {
      result.push({ ...cur });
    }
  }
  return result;
}

// ─── English Tokenizer (compromise.js) ───────────────────────────────────────

/**
 * Process English text using compromise.js.
 * Expects `nlp` to be available globally (loaded via script tag or bundled).
 */
function tokenizeEn(text: string, layers: TABELayers): TABEToken[] {
  // @ts-ignore — nlp injected globally
  if (typeof nlp === 'undefined') {
    return [{ text, cls: null }];
  }

  const tokens: TABEToken[] = [];
  try {
    // @ts-ignore
    const doc = nlp(text);
    const sentences = doc.json({ tags: true }) as Array<{ terms: Array<{ text: string; pre: string; post: string; tags: string[] }> }>;

    for (const sent of sentences) {
      for (const term of (sent.terms || [])) {
        const tags  = Array.isArray(term.tags) ? term.tags : [];
        const has   = (...names: string[]) => names.some(n => tags.includes(n));
        const pre   = term.pre  || '';
        const post  = term.post || '';
        const txt   = term.text || '';

        let cls: TABEClass = null;
        if (layers.numbers && has('Value', 'Date', 'NumericValue', 'Cardinal', 'Ordinal')) {
          cls = 'tabe-number';
        } else if (layers.nouns && has('ProperNoun', 'Noun')) {
          cls = 'tabe-bold';
        } else if (layers.verbs && has('Verb')) {
          cls = 'tabe-highlight';
        } else if (layers.adjs && has('Adjective', 'Adverb')) {
          cls = 'tabe-italic';
        }

        if (pre)  tokens.push({ text: pre,  cls: null });
        tokens.push({ text: txt, cls: cls && txt.trim() ? cls : null });
        if (post) tokens.push({ text: post, cls: null });
      }
    }
  } catch (e) {
    return [{ text, cls: null }];
  }

  return tokens;
}

// ─── Mixed-language Splitter ──────────────────────────────────────────────────

interface Segment {
  text: string;
  lang: 'zh' | 'en' | 'other';
}

/**
 * Split mixed text into segments by script boundary.
 * Consecutive chars of same script are merged into one segment.
 * Digits, punctuation, spaces are assigned to surrounding context.
 *
 * e.g. "用 compromise.js 分析 NLP 效果"
 *   → [{zh:"用 "}, {en:"compromise.js "}, {zh:"分析 "}, {en:"NLP "}, {zh:"效果"}]
 */
function splitByScript(text: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (CJK_RE.test(ch)) {
      // Start of Chinese segment — include trailing spaces, punctuation, digits
      let seg = '';
      while (i < text.length && (CJK_RE.test(text[i]) || /[\s\d，。！？、；：""''【】《》（）…—～·]/.test(text[i]))) {
        // Stop if we hit Latin chars
        if (LATIN_RE.test(text[i]) && seg.length > 0) break;
        seg += text[i++];
      }
      if (seg) segments.push({ text: seg, lang: 'zh' });

    } else if (LATIN_RE.test(ch) || /\d/.test(ch)) {
      // Start of English/Latin segment
      let seg = '';
      while (i < text.length && !CJK_RE.test(text[i])) {
        seg += text[i++];
      }
      if (seg.trim()) segments.push({ text: seg, lang: 'en' });
      else if (seg)   segments.push({ text: seg, lang: 'other' });

    } else {
      // Punctuation / symbols
      let seg = '';
      while (i < text.length && !CJK_RE.test(text[i]) && !LATIN_RE.test(text[i]) && !/\d/.test(text[i])) {
        seg += text[i++];
      }
      if (seg) segments.push({ text: seg, lang: 'other' });
    }
  }

  return segments;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Tokenize any text into TABE-annotated tokens.
 * Handles English, Chinese, and mixed text automatically.
 */
export function tokenizeTABE(text: string, layers: TABELayers = DEFAULT_LAYERS): TABEToken[] {
  if (!text.trim()) return [{ text, cls: null }];

  const lang = detectLang(text);

  if (lang === 'en') {
    return tokenizeEn(text, layers);
  }

  if (lang === 'zh') {
    return tokenizeZh(text, layers);
  }

  if (lang === 'mixed') {
    // Split into segments, process each separately, flatten
    const segments = splitByScript(text);
    const allTokens: TABEToken[] = [];
    for (const seg of segments) {
      if (seg.lang === 'zh') {
        allTokens.push(...tokenizeZh(seg.text, layers));
      } else if (seg.lang === 'en') {
        allTokens.push(...tokenizeEn(seg.text, layers));
      } else {
        allTokens.push({ text: seg.text, cls: null });
      }
    }
    return allTokens;
  }

  // Fallback (numbers-only, symbols)
  return [{ text, cls: null }];
}

/**
 * Convert TABE tokens to HTML string.
 * Text content is HTML-escaped; only cls spans are injected.
 */
export function tokensToHtml(tokens: TABEToken[]): string {
  return tokens.map(t => {
    const escaped = escapeHtml(t.text);
    if (t.cls && t.text.trim()) {
      return `<span class="${t.cls}">${escaped}</span>`;
    }
    return escaped;
  }).join('');
}

function escapeHtml(t: string): string {
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * One-shot: tokenize + render to HTML
 */
export function applyTABE(text: string, layers: TABELayers = DEFAULT_LAYERS): string {
  return tokensToHtml(tokenizeTABE(text, layers));
}
