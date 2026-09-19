/**
 * esbuild 打包：把 content.ts / background.ts + @cantread/core + compromise
 * 各自捆成一个 IIFE 文件，输出到 dist/。浏览器插件不能直接 import node_modules，
 * 所以需要这一步胶水打包（用事实标准 esbuild，不自研）。
 */
import { build, context } from 'esbuild';

const watch = process.argv.includes('--watch');

const common = {
  bundle: true,
  format: 'iife',
  target: 'firefox115',
  platform: 'browser',
  logLevel: 'info',
};

const entries = [
  { entryPoints: ['src/content.ts'], outfile: 'dist/content.js', ...common },
  { entryPoints: ['src/background.ts'], outfile: 'dist/background.js', ...common },
];

if (watch) {
  for (const cfg of entries) {
    const ctx = await context(cfg);
    await ctx.watch();
  }
  console.log('[cantread] esbuild watching…');
} else {
  await Promise.all(entries.map((cfg) => build(cfg)));
  console.log('[cantread] build done → dist/');
}
