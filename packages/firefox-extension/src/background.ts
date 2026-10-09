/**
 * CantRead background（event page）
 * - 快捷键（默认 Alt+Shift+H，Mac 上是 ⌥⇧H）→ 当前页开/关高亮，不用打开面板
 * - 右键菜单 → 只高亮选中的一段
 * 点工具栏图标则打开 popup 面板（见 popup.ts）。
 */
import { api, activeTab } from './api';
import { send } from './inject';

api.runtime.onInstalled.addListener(() => {
  api.contextMenus.create({
    id: 'cr-tabe-selection',
    title: api.i18n.getMessage('menuHighlightSelection'),
    contexts: ['selection'],
  });
});

api.contextMenus.onClicked.addListener(
  async (info: { menuItemId: string }, tab?: { id?: number }) => {
    if (info.menuItemId !== 'cr-tabe-selection' || tab?.id == null) return;
    try {
      await send(tab.id, 'tabe-selection');
    } catch (e) {
      console.warn('[CantRead] 这个页面不允许插件修改', e);
    }
  },
);

api.commands.onCommand.addListener(async (command: string, tab?: { id?: number }) => {
  if (command !== 'toggle-page') return;
  const target = tab?.id != null ? tab : await activeTab();
  if (target?.id == null) return;
  try {
    await send(target.id, 'toggle-page');
  } catch (e) {
    console.warn('[CantRead] 这个页面不允许插件修改', e);
  }
});
