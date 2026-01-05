import skuba from 'eslint-config-skuba';
import zodOpenapi from 'eslint-plugin-zod-openapi';

export default [
  {
    ignores: [
      'src/openapi3-ts/*',
      '**/crackle.config.ts',
      'api',
      'extend',
      'packages/openapi3-ts/src/*',
      'packages/openapi3-ts/lib-*',
    ],
  },
  ...skuba,
  {
    plugins: {
      'zod-openapi': zodOpenapi,
    },
  },
  {
    files: ['examples/**/*/types/**/*.ts'],

    rules: {
      'zod-openapi/require-meta': 'error',
      'zod-openapi/require-comment': 'error',
      'zod-openapi/require-example': 'error',
      'zod-openapi/prefer-meta-last': 'error',
      'zod-openapi/prefer-zod-default': 'error',
    },
  },
];
