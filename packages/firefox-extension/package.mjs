/**
 * 打包成可以上传到 Firefox 商店（AMO）的两个 zip：
 *   web-ext-artifacts/cantread-firefox-<版本>.zip   ← 插件本体，上传这个
 *   web-ext-artifacts/cantread-source-<版本>.zip    ← 源码包，商店审核要求（因为 dist/ 是打包产物）
 *
 * 用系统自带的 `zip` 和 `git archive`（macOS / Linux 都有），不额外装依赖。
 * 源码包取的是 git 里「已提交」的版本，所以打包前先 commit。
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const here = resolve('.');
const { version } = JSON.parse(readFileSync('manifest.json', 'utf8'));
const outDir = resolve('web-ext-artifacts');
mkdirSync(outDir, { recursive: true });

// 1) 构建
execFileSync('node', ['build.mjs'], { stdio: 'inherit' });

// 2) 插件本体 zip（manifest 必须在 zip 根目录）
const extZip = resolve(outDir, `cantread-firefox-${version}.zip`);
if (existsSync(extZip)) rmSync(extZip);
execFileSync(
  'zip',
  ['-r', '-X', extZip, 'manifest.json', '_locales', 'icons', 'popup', 'tabe.css', 'dist', '-x', '*.DS_Store', '*.map'],
  { cwd: here, stdio: 'inherit' },
);

// 3) 源码包：monorepo 里构建所需的全部文件
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const srcZip = resolve(outDir, `cantread-source-${version}.zip`);
if (existsSync(srcZip)) rmSync(srcZip);
execFileSync(
  'git',
  [
    'archive', '--format=zip', '-o', srcZip, 'HEAD', '--',
    'package.json', 'package-lock.json', 'tsconfig.base.json', 'tsconfig.json', 'LICENSE',
    'packages/core', 'packages/firefox-extension',
  ],
  { cwd: repoRoot, stdio: 'inherit' },
);

console.log(`\n[cantread] ✅ 打包完成：\n  ${extZip}\n  ${srcZip}`);
