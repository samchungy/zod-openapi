import { z } from 'zod/v4';

import { createRegistry } from './components';
import type { ZodOpenApiPathsObject } from './document';
import { createPaths } from './paths';

describe('createPaths', () => {
  it('should create a paths object', () => {
    const paths: ZodOpenApiPathsObject = {
      '/users': {
        get: {
          summary: 'Get users',
          description: 'Returns a list of users',
          responses: {
            '200': {
              description: 'A list of users',
              content: {
                'application/json': {
                  schema: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                    }),
                  ),
                },
              },
            },
          },
        },
      },
    };

    const registry = createRegistry();

    const result = createPaths(paths, registry, ['test']);

    expect(result).toEqual({
      '/users': {
        get: {
          summary: 'Get users',
          description: 'Returns a list of users',
          responses: {
            '200': {
              description: 'A list of users',
              content: {
                'application/json': {
                  schema: {},
                },
              },
            },
          },
        },
      },
    });
  });
});
