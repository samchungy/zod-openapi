import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: ['src/index.ts', 'src/api.ts', 'src/create/componentsSideEffects.ts'],
  external: ['./componentsSideEffects'],
  format: ['esm', 'cjs'],
});
