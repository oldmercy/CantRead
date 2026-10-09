/**
 * content 脚本由 manifest 的 content_scripts 预加载（只待命，不处理文字，直到用户点击）。
 * 这里是兜底：插件安装/重新载入之前就已打开的标签页里没有 content 脚本，
 * 这时用 scripting 补注入一次。
 *
 * 注：2026-10-09 曾尝试完全去掉预加载、只靠 activeTab 按需注入，在 Ahui 的真实 Firefox
 * 里失败（原因未查明），所以恢复了 v0.1 验证过的预加载方式。按需注入留在 ROADMAP 待研究。
 */
import { api } from './api';

export type PageStatus = { ok: true; on: boolean };

/** 确保当前页已注入 content 脚本；已注入则直接返回（content 自己也有防重复保护）。 */
export async function ensureInjected(tabId: number): Promise<void> {
  try {
    const r = await api.tabs.sendMessage(tabId, { cmd: 'ping' });
    if (r?.ok) return;
  } catch {
    /* 还没注入：页面里没有监听者，sendMessage 会报错，正常 */
  }
  await api.scripting.insertCSS({ target: { tabId }, files: ['tabe.css'] });
  await api.scripting.executeScript({ target: { tabId }, files: ['dist/content.js'] });
}

/** 注入后发指令，返回页面当前是否处于高亮状态。 */
export async function send(tabId: number, cmd: string, extra: object = {}): Promise<PageStatus> {
  await ensureInjected(tabId);
  return api.tabs.sendMessage(tabId, { cmd, ...extra });
}
