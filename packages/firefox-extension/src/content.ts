/**
 * CantRead content script —— 由 background / popup 按需注入（见 inject.ts），不预加载。
 * 把网页正文的文字节点做 TABE 高亮，保留原页面结构（链接/图片/布局不动）。
 * 复用 @cantread/core 的 tokenizeTABE —— 不重写任何 NLP。
 *
 * 高亮时始终用「全部层」分析；用户在面板里关掉某一层，只是给 <html> 加一个
 * cr-off-* class，由 tabe.css 把那一层的样式取消，所以切换是即时的。
 */
import { tokenizeTABE, type TABEToken, type TABELayers } from '@cantread/core';
import { api } from './api';
import { LAYER_KEYS, loadLayers } from './settings';

// 处理过的文字节点会被替换成一个 <cr-tabe> 包裹元素，原文存在 data 属性里，方便还原。
const WRAP_TAG = 'cr-tabe';
const PROCESSED_ATTR = 'data-cr-original';

// 这些标签里的文字不碰：脚本、样式、代码、可编辑控件等。
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION',
  'CODE', 'PRE', 'KBD', 'SAMP', 'CANVAS', 'SVG', 'MATH', 'HEAD', 'TITLE',
]);

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

function collectTextNodes(root: Node, extraFilter?: (n: Text) => boolean): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      shouldSkip(n as Text) || (extraFilter && !extraFilter(n as Text))
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  const out: Text[] = [];
  let cur: Node | null;
  while ((cur = walker.nextNode())) out.push(cur as Text);
  return out;
}

/** 撤销：把所有 <cr-tabe> 包裹还原成原始文字节点。 */
function undoAll(): void {
  document.querySelectorAll(WRAP_TAG).forEach((w) => {
    const original = w.getAttribute(PROCESSED_ATTR) ?? w.textContent ?? '';
    w.parentNode?.replaceChild(document.createTextNode(original), w);
  });
}

function isOn(): boolean {
  return document.querySelector(WRAP_TAG) !== null;
}

function setPage(on: boolean): void {
  if (on && !isOn()) collectTextNodes(document.body).forEach(processTextNode);
  else if (!on) undoAll();
}

/** 只处理当前选区所在的范围。 */
function processSelection(): void {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  const anc = range.commonAncestorContainer;
  const container = anc.nodeType === Node.ELEMENT_NODE ? anc : anc.parentElement;
  if (!container) return;
  collectTextNodes(container, (n) => range.intersectsNode(n)).forEach(processTextNode);
  sel.removeAllRanges();
}

/** 把层开关反映到 <html> 的 class 上，tabe.css 据此隐藏对应层。 */
function applyLayers(layers: TABELayers): void {
  const root = document.documentElement;
  for (const k of LAYER_KEYS) root.classList.toggle(`cr-off-${k}`, !layers[k]);
}

function init(): void {
  loadLayers().then(applyLayers);
  api.storage.onChanged.addListener((changes: Record<string, { newValue?: unknown }>, area: string) => {
    if (area === 'local' && changes.layers) loadLayers().then(applyLayers);
  });

  // 同步回应（sendResponse）——Firefox/Chrome 都支持，不依赖返回 Promise 的行为差异。
  api.runtime.onMessage.addListener(
    (msg: { cmd?: string; on?: boolean }, _sender: unknown, sendResponse: (r: unknown) => void) => {
      switch (msg?.cmd) {
        case 'ping':
        case 'status':
          break;
        case 'toggle-page':
          setPage(!isOn());
          break;
        case 'set-page':
          setPage(!!msg.on);
          break;
        case 'tabe-selection':
          processSelection();
          break;
        default:
          return;
      }
      sendResponse({ ok: true, on: isOn() });
    },
  );
}

// executeScript 可能对同一页面注入多次（比如多次点击），只初始化一次。
const w = window as unknown as { __cantreadLoaded?: boolean };
if (!w.__cantreadLoaded) {
  w.__cantreadLoaded = true;
  init();
}
