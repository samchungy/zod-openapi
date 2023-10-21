import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  sourcemap: true,
  platform: 'node',
  format: 'esm',
  target: ['es2022'],
  outdir: './lib-esm',
});
