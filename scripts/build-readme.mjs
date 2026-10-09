/**
 * 用 CantRead 自己的 TABE 引擎，把纯文字 README 源文件格式化成 TABE 版。
 *   源文件：scripts/readme-src/*.md（平时改这里）
 *   输出：  对应位置的 README / ROADMAP（不要直接改输出文件）
 * 运行：npm run readme（需要先 npm run build -w @cantread/core）
 *
 * GitHub 会过滤掉 README 里的颜色和 CSS，所以只能用它保留的格式：
 *   名词 → **加粗**   动词 → <mark>黄色高亮</mark>   形容词/副词 → *斜体*
 *   数字 → 不变（GitHub 不允许橙色）
 * 只处理正文段落和列表项；标题、代码、表格、链接、图片、HTML、已有格式都原样保留。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenizeTABE } from '@cantread/core';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

// 源文件 → 输出文件。中文版暂时是手动标注的 TABE（引擎的中文分词还不够好），
// 标为 manual：只加文件头，不经过引擎。等中文分词改进后可以改回自动。
const MANUAL = new Set(['README.zh-CN.md', 'ROADMAP.zh-CN.md', 'firefox-extension.README.zh-CN.md']);
const TARGETS = {
  'README.md': 'README.md',
  'README.zh-CN.md': 'README.zh-CN.md',
  'ROADMAP.md': 'ROADMAP.md',
  'ROADMAP.zh-CN.md': 'ROADMAP.zh-CN.md',
  'firefox-extension.README.md': 'packages/firefox-extension/README.md',
  'firefox-extension.README.zh-CN.md': 'packages/firefox-extension/README.zh-CN.md',
};

// 行内不能碰的片段：代码、图片/链接、HTML 标签、已有的粗体/斜体、URL、键名
const PROTECT = /(`[^`]*`|!?\[[^\]]*\]\([^)]*\)|<[^>]+>[^<]*<\/[^>]+>|<[^>]+>|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|https?:\/\/\S+|\bnpm run [\w:-]+)/g;

const WRAP = {
  'tabe-bold': (w) => `**${w}**`,
  'tabe-highlight': (w) => `<mark>${w}</mark>`,
  'tabe-italic': (w) => `*${w}*`,
  'tabe-number': (w) => w,
};

/** 相邻、同一类、中间只隔一个空格的词合并成一段，比如 **your eyes** 而不是 **your** **eyes**。 */
function mergeRuns(tokens) {
  const out = [];
  for (const t of tokens) {
    const space = out[out.length - 1];
    const before = out[out.length - 2];
    if (t.cls && space && space.cls === null && space.text === ' ' && before?.cls === t.cls) {
      out.pop(); // 去掉中间的空格，并进前一个词
      before.text += ' ' + t.text;
      continue;
    }
    out.push({ ...t });
  }
  return out;
}

function formatText(text) {
  return mergeRuns(tokenizeTABE(text))
    .map((t) => {
      // 只格式化含字母/汉字的词；纯标点（比如被误判的逗号）保持原样
      if (!t.cls || !/[\p{L}\p{N}]/u.test(t.text)) return t.text;
      // 保留首尾空白在格式外面，否则 markdown 的 ** 不生效
      const m = t.text.match(/^(\s*)(.*?)(\s*)$/s);
      return m[1] + WRAP[t.cls](m[2]) + m[3];
    })
    .join('');
}

function formatInline(line) {
  return line
    .split(PROTECT)
    .map((part, i) => (i % 2 === 1 ? part : part ? formatText(part) : part))
    .join('');
}

function formatMarkdown(src) {
  let inFence = false;
  let off = false; // <!-- tabe:off-start --> … <!-- tabe:off-end --> 之间整段不格式化
  return src
    .split('\n')
    .flatMap((line) => {
      if (/<!--\s*tabe:off-start\s*-->/.test(line)) { off = true; return []; }
      if (/<!--\s*tabe:off-end\s*-->/.test(line)) { off = false; return []; }
      if (/^\s*```/.test(line)) { inFence = !inFence; return [line]; }
      if (inFence || off) return [line];
      return [formatLine(line)];
    })
    .join('\n');
}

function formatLine(line) {
  if (/<!--\s*tabe:off\s*-->/.test(line)) return line.replace(/\s*<!--\s*tabe:off\s*-->/, '');
  if (/^\s*(#|\||<|!\[|---)/.test(line) || !line.trim()) return line; // 标题、表格、HTML、图片、分割线
  const m = line.match(/^(\s*(?:[-*+]|\d+\.)\s+|\s*>\s*)?(.*)$/);
  return (m[1] ?? '') + formatInline(m[2]);
}

const banner = (name) =>
  `<!-- 自动生成，请勿直接修改。源文件：scripts/readme-src/${name}，运行 npm run readme 重新生成。 -->\n` +
  `<!-- Generated file — edit scripts/readme-src/${name} and run "npm run readme". -->\n\n`;

// 可以只生成指定文件：node scripts/build-readme.mjs README.md
const only = process.argv.slice(2);
for (const [srcName, outPath] of Object.entries(TARGETS).filter(([s]) => !only.length || only.includes(s))) {
  const src = readFileSync(resolve(here, 'readme-src', srcName), 'utf8');
  writeFileSync(resolve(root, outPath), banner(srcName) + (MANUAL.has(srcName) ? src : formatMarkdown(src)));
  console.log(`[readme] ${srcName} → ${outPath}`);
}
