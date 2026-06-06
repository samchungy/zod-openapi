import { defineConfig } from 'tsdown';

export default defineConfig({
  failOnWarn: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  outDir: 'lib',
  dts: true,
  checks: {
    legacyCjs: false,
  },
  publint: true,
  attw: true,
  unbundle: true, // TODO: determine if your project can be bundled
  exports: { devExports: 'zod-openapi/source' },
});
