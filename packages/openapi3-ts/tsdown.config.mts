import { defineConfig } from 'tsdown';

export default defineConfig({
  failOnWarn: true,
  entry: ['src/dist/index.ts'],
  format: ['cjs', 'esm'],
  outDir: 'lib',
  dts: true,
  checks: {
    legacyCjs: false,
  },
  publint: true,
  attw: true,
});
