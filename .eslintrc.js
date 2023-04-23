module.exports = {
  extends: ['skuba'],
  plugins: ['eslint-plugin-zod-openapi'],
  overrides: [
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
  ],
};
