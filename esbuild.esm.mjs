import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts', 'src/extend.ts'],
  packages: 'external',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: ['es2022'],
  outdir: './lib-esm',
  outExtension: { '.js': '.mjs' },
});
