const skuba = require('eslint-config-skuba');

module.exports = [
  {
    ignores: ['src/openapi3-ts/*', '**/crackle.config.ts', 'api', 'extend'],
  },
  ...skuba,
];
