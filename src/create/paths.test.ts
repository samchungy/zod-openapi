import '../entries/extend';
import { z } from 'zod';

import type { oas31 } from '../openapi3-ts/dist';

import { getDefaultComponents } from './components';
import type { ZodOpenApiPathsObject } from './document';
import { createPaths } from './paths';

describe('createPaths', () => {
  it('should create a paths object', () => {
    const paths: ZodOpenApiPathsObject = {
      '/jobs': {
        get: {
          requestBody: {
            content: {
              'application/json': {
                schema: z.object({ a: z.string() }),
              },
            },
          },
          responses: {
            '200': {
              description: '200 OK',
              content: {
                'application/json': {
                  schema: z.object({ b: z.string() }),
                },
              },
            },
          },
        },
      },
    };

    const expectedResult: oas31.PathsObject = {
      '/jobs': {
        get: {
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    a: {
                      type: 'string',
                    },
                  },
                  required: ['a'],
                  type: 'object',
                },
              },
            },
          },
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: {
                    properties: {
                      b: {
                        type: 'string',
                      },
                    },
                    required: ['b'],
                    type: 'object',
                  },
                },
              },
              description: '200 OK',
            },
          },
        },
      },
    };

    const result = createPaths(paths, getDefaultComponents());

    expect(result).toStrictEqual(expectedResult);
  });

  it('preserves extra fields', () => {
    const paths: ZodOpenApiPathsObject = {
      '/jobs': {
        get: {
          'x-extra': 'hello',
          requestBody: {
            content: {
              'application/json': {
                schema: z.object({ a: z.string() }),
              },
            },
          },
          responses: {
            '200': {
              description: '200 OK',
              content: {
                'application/json': {
                  schema: z.object({ b: z.string() }),
                },
              },
            },
          },
          description: 'hello',
        },
      },
    };

    const expectedResult: oas31.PathsObject = {
      '/jobs': {
        get: {
          'x-extra': 'hello',
          description: 'hello',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    a: {
                      type: 'string',
                    },
                  },
                  required: ['a'],
                  type: 'object',
                },
              },
            },
          },
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: {
                    properties: {
                      b: {
                        type: 'string',
                      },
                    },
                    required: ['b'],
                    type: 'object',
                  },
                },
              },
              description: '200 OK',
            },
          },
        },
      },
    };

    const result = createPaths(paths, getDefaultComponents());

    expect(result).toStrictEqual(expectedResult);
  });
});
