import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: ['src/index.ts', 'src/api.ts'],
  format: ['esm', 'cjs'],
  exports: true,
  dts: {
    resolve: ['@zod-openapi/openapi3-ts'],
  },
});
