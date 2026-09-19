/**
 * CantRead content script
 * 把网页正文的文字节点做 TABE 高亮，保留原页面结构（链接/图片/布局不动）。
 * 复用 @cantread/core 的 tokenizeTABE —— 不重写任何 NLP。
 */
import { tokenizeTABE, type TABEToken } from '@cantread/core';

// 处理过的文字节点会被替换成一个 <cr-tabe> 包裹元素，原文存在 data 属性里，方便还原。
const WRAP_TAG = 'cr-tabe';
const PROCESSED_ATTR = 'data-cr-original';

// 这些标签里的文字不碰：脚本、样式、代码、可编辑控件等。
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION',
  'CODE', 'PRE', 'KBD', 'SAMP', 'CANVAS', 'SVG', 'MATH', 'HEAD', 'TITLE',
]);

let pageOn = false;

function shouldSkip(node: Text): boolean {
  const text = node.nodeValue;
  if (!text || !text.trim()) return true;
  let el: Node | null = node.parentNode;
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    const e = el as Element;
    if (SKIP_TAGS.has(e.tagName)) return true;
    if (e.tagName === WRAP_TAG.toUpperCase()) return true; // 已处理
    if ((e as HTMLElement).isContentEditable) return true;
    el = el.parentNode;
  }
  return false;
}

/** 把 token 列表变成 DOM 节点数组（span 或纯文本），不走 innerHTML 以避免 XSS。 */
function tokensToNodes(tokens: TABEToken[]): Node[] {
  return tokens.map((t) => {
    if (t.cls && t.text.trim()) {
      const span = document.createElement('span');
      span.className = t.cls;
      span.textContent = t.text;
      return span;
    }
    return document.createTextNode(t.text);
  });
}

/** 处理单个文字节点：替换成一个 <cr-tabe> 包裹，内部是高亮后的节点。 */
function processTextNode(node: Text): void {
  const original = node.nodeValue!;
  const tokens = tokenizeTABE(original);
  // 若整段没有任何高亮，跳过（省 DOM，也保留可选中的纯文本）
  if (!tokens.some((t) => t.cls)) return;

  const wrap = document.createElement(WRAP_TAG);
  wrap.setAttribute(PROCESSED_ATTR, original);
  for (const n of tokensToNodes(tokens)) wrap.appendChild(n);
  node.parentNode?.replaceChild(wrap, node);
}

/** 遍历某个根下的所有文字节点并处理。 */
function processRoot(root: Node): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      shouldSkip(n as Text) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const targets: Text[] = [];
  let cur: Node | null;
  while ((cur = walker.nextNode())) targets.push(cur as Text);
  for (const t of targets) processTextNode(t);
}

/** 撤销：把所有 <cr-tabe> 包裹还原成原始文字节点。 */
function undoAll(): void {
  const wraps = document.querySelectorAll(WRAP_TAG);
  wraps.forEach((w) => {
    const original = w.getAttribute(PROCESSED_ATTR) ?? w.textContent ?? '';
    w.parentNode?.replaceChild(document.createTextNode(original), w);
  });
}

function togglePage(): void {
  if (pageOn) {
    undoAll();
    pageOn = false;
  } else {
    processRoot(document.body);
    pageOn = true;
  }
}

/** 只处理当前选区所在的范围。 */
function processSelection(): void {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  // 取选区的公共祖先，遍历它内部落在选区里的文字节点。
  const container =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as Element)
      : range.commonAncestorContainer.parentElement;
  if (!container) return;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      if (shouldSkip(n as Text)) return NodeFilter.FILTER_REJECT;
      return range.intersectsNode(n) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const targets: Text[] = [];
  let cur: Node | null;
  while ((cur = walker.nextNode())) targets.push(cur as Text);
  for (const t of targets) processTextNode(t);
  sel.removeAllRanges();
}

// 来自 background 的指令
const runtime = (globalThis as any).browser?.runtime ?? (globalThis as any).chrome?.runtime;
runtime?.onMessage.addListener((msg: { cmd?: string }) => {
  if (msg?.cmd === 'toggle-page') togglePage();
  else if (msg?.cmd === 'tabe-selection') processSelection();
});
