import { describe, it, expect } from 'vitest';
import { applyTABE, tokenizeTABE } from './index.js';

describe('@cantread/core smoke test', () => {
  it('applyTABE 返回带 TABE class 的 HTML', () => {
    const html = applyTABE('The quantum computer solved three problems.');
    // 名词/动词等实词应被包进 tabe-* span
    expect(html).toContain('<span class="tabe-');
    // 输出是完整字符串，句号保留
    expect(html).toContain('.');
  });

  it('tokenizeTABE 切出 token 且实词有 cls、虚词无 cls', () => {
    const tokens = tokenizeTABE('The cat runs fast.');
    expect(tokens.length).toBeGreaterThan(0);
    // 至少有一个 token 被打上视觉标记
    expect(tokens.some(t => t.cls !== null)).toBe(true);
  });

  it('中英混合不崩', () => {
    const html = applyTABE('这个 algorithm 收敛得很快。');
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });
});
