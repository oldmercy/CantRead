/**
 * 工具栏面板：
 *  - 打开面板 = 当前页自动开启高亮（保持 v0.1「点一下就高亮」的手感）
 *  - 「还原原文」/「高亮本页」按钮
 *  - 四个层开关（存进 storage，所有已高亮的标签页即时生效）
 */
import type { TABELayers } from '@cantread/core';
import { api, activeTab } from './api';
import { ensureInjected, send } from './inject';
import { loadLayers, saveLayers, type LayerKey } from './settings';

const t = (key: string) => api.i18n.getMessage(key) || key;
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function localize(): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n!);
  });
  document.documentElement.lang = api.i18n.getUILanguage?.() ?? 'en';
}

function renderPage(on: boolean): void {
  const status = $('status');
  status.textContent = t(on ? 'popupOn' : 'popupOff');
  status.classList.toggle('on', on);
  $('toggle').textContent = t(on ? 'btnRestore' : 'btnHighlight');
}

async function initLayers(): Promise<void> {
  const layers: TABELayers = await loadLayers();
  document.querySelectorAll<HTMLInputElement>('input[data-layer]').forEach((box) => {
    const key = box.dataset.layer as LayerKey;
    box.checked = layers[key];
    box.addEventListener('change', async () => {
      const next = await loadLayers();
      next[key] = box.checked;
      await saveLayers(next);
    });
  });
}

async function initShortcut(): Promise<void> {
  try {
    const cmds: { name: string; shortcut?: string }[] = await api.commands.getAll();
    const sc = cmds.find((c) => c.name === 'toggle-page')?.shortcut;
    $('shortcut').textContent = sc || '—';
  } catch {
    $('shortcut').textContent = '—';
  }
}

async function initPage(): Promise<void> {
  let step = 'tab';
  try {
    const tab = await activeTab();
    if (tab?.id == null) throw new Error('no active tab');
    const tabId = tab.id;
    step = 'inject';
    await ensureInjected(tabId);
    step = 'message';
    // 打开面板即开启高亮
    const st = await api.tabs.sendMessage(tabId, { cmd: 'set-page', on: true });
    if (!st) throw new Error('content script did not respond');
    $('page').hidden = false;
    renderPage(st.on);
    $('toggle').addEventListener('click', async () => {
      const r = await send(tabId, 'toggle-page');
      renderPage(r.on);
    });
  } catch (e) {
    showRestricted(`[${step}] ${e instanceof Error ? e.message : String(e)}`);
  }
}

function showRestricted(err?: unknown): void {
  $('page').hidden = true;
  $('restricted').hidden = false;
  // 把真实原因也显示出来（小字），方便排查
  if (err) {
    const d = $('errDetail');
    d.textContent = err instanceof Error ? err.message : String(err);
    d.hidden = false;
    console.warn('[CantRead]', err);
  }
}

localize();
void initLayers();
void initShortcut();
void initPage();
try {
  $('version').textContent = `v${api.runtime.getManifest().version}`;
} catch {
  /* 版本号只是辅助信息，取不到也不影响使用 */
}
