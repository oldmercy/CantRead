/**
 * esbuild 打包：把 content / background / popup 三个入口 + @cantread/core + compromise
 * 各自捆成一个 IIFE 文件，输出到 dist/。浏览器插件不能直接 import node_modules，
 * 所以需要这一步胶水打包（用事实标准 esbuild，不自研）。
 * 不压缩（minify: false）：方便 Firefox 商店审核员对照源码阅读。
 */
import { build, context } from 'esbuild';

const watch = process.argv.includes('--watch');

const common = {
  bundle: true,
  format: 'iife',
  target: 'firefox128',
  platform: 'browser',
  logLevel: 'info',
};

const entries = ['content', 'background', 'popup'].map((name) => ({
  entryPoints: [`src/${name}.ts`],
  outfile: `dist/${name}.js`,
  ...common,
}));

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
