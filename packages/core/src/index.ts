/**
 * @cantread/core — 公共 barrel export
 * TABE 引擎的稳定对外接口。app / 插件都从这里 import，不直接摸内部文件。
 */
export {
  DEFAULT_LAYERS,
  tokenizeTABE,
  tokensToHtml,
  applyTABE,
} from './tabe-nlp.js';

export type { TABEClass, TABEToken, TABELayers } from './tabe-nlp.js';
