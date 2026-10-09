/**
 * 用户设置：哪些 TABE 高亮层要显示。存在 storage.local（只在本机，不同步、不上传）。
 * 层的开关只靠 CSS 生效（见 tabe.css 的 html.cr-off-* 规则），所以切换是即时的，
 * 不需要重新分析文字。
 */
import type { TABELayers } from '@cantread/core';
import { api } from './api';

export type LayerKey = keyof TABELayers;
export const LAYER_KEYS: LayerKey[] = ['nouns', 'verbs', 'adjs', 'numbers'];

export const DEFAULT_SETTINGS: { layers: TABELayers } = {
  layers: { nouns: true, verbs: true, adjs: true, numbers: true },
};

export async function loadLayers(): Promise<TABELayers> {
  try {
    const got = await api.storage.local.get('layers');
    return { ...DEFAULT_SETTINGS.layers, ...(got?.layers ?? {}) };
  } catch {
    return { ...DEFAULT_SETTINGS.layers };
  }
}

export async function saveLayers(layers: TABELayers): Promise<void> {
  await api.storage.local.set({ layers });
}
