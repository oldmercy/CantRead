/**
 * CantRead background (event page)
 * 工具栏图标点击 → 通知当前标签页开关整页 TABE 高亮。
 * 右键菜单 → 只高亮选中的一段。
 */
const api = (globalThis as any).browser ?? (globalThis as any).chrome;

api.action.onClicked.addListener((tab: { id?: number }) => {
  if (tab.id != null) api.tabs.sendMessage(tab.id, { cmd: 'toggle-page' });
});

api.runtime.onInstalled.addListener(() => {
  api.contextMenus.create({
    id: 'cr-tabe-selection',
    title: 'CantRead：高亮选中文字',
    contexts: ['selection'],
  });
});

api.contextMenus.onClicked.addListener(
  (info: { menuItemId: string }, tab: { id?: number }) => {
    if (info.menuItemId === 'cr-tabe-selection' && tab.id != null) {
      api.tabs.sendMessage(tab.id, { cmd: 'tabe-selection' });
    }
  },
);
