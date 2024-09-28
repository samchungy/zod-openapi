const skuba = require('eslint-config-skuba');
const zodOpenapi = require('eslint-plugin-zod-openapi');

module.exports = [
  {
    ignores: ['src/openapi3-ts/*', '**/crackle.config.ts', 'api', 'extend'],
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
      'zod-openapi/require-openapi': 'error',
      'zod-openapi/require-comment': 'error',
      'zod-openapi/require-example': 'error',
      'zod-openapi/prefer-openapi-last': 'error',
      'zod-openapi/prefer-zod-default': 'error',
    },
  },
];
