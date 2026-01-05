// @ts-check
import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: ['src/index.ts', 'src/api.ts'],
  format: ['cjs', 'esm'],
  exports: true,
  dts: {
    resolve: ['@zod-openapi/openapi3-ts'],
  },
});
