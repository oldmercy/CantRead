/**
 * WebExtension API 入口。Firefox 用 `browser`（返回 Promise），Chrome 用 `chrome`。
 * 两者在 MV3 下大部分 API 都支持 Promise，所以统一从这里取，将来移植 Chrome 不用改别处。
 */
export const api: any = (globalThis as any).browser ?? (globalThis as any).chrome;

/** 取当前窗口里正在看的标签页。 */
export async function activeTab(): Promise<{ id?: number; url?: string } | undefined> {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (tab?.id != null) return tab;
  // 某些打开方式（比如从扩展菜单 🧩 打开面板）下 currentWindow 可能取不到，退一步取最后聚焦的窗口
  const [fallback] = await api.tabs.query({ active: true, lastFocusedWindow: true });
  return fallback;
}
