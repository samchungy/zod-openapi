import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      ENVIRONMENT: 'test',
    },
    coverage: {
      thresholds: {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0,
      },
    },
    include: ['**/*.test*.ts'],
  },
});
