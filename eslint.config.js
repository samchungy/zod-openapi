const skuba = require('eslint-config-skuba');

module.exports = [
  {
    ignores: ['src/openapi3-ts/*', '**/crackle.config.ts', 'api', 'extend'],
  },
  ...skuba,
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
