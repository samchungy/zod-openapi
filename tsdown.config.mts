import { defineConfig } from 'tsdown';

export default defineConfig({
  failOnWarn: true,
  entry: ['src/index.ts', 'src/api.ts'],
  format: ['cjs', 'esm'],
  outDir: 'lib',
  dts: {
    eager: true,
  },
  checks: {
    legacyCjs: false,
  },
  publint: true,
  attw: true,
  exports: { devExports: 'zod-openapi/source' },
  deps: {
    onlyBundle: ['@zod-openapi/openapi3-ts'],
  },
});
