import { describe, expect, it } from 'vitest';
import z from 'zod/v4';

import { createCallbacks } from './callbacks.js';
import { createRegistry } from './components.js';

import type { oas31 } from '@zod-openapi/openapi3-ts';

describe('createCallbacks', () => {
  it('should create a callbacks object', () => {
    const callbacks: oas31.CallbackObject = {
      exampleCallback: {
        '/path': {
          post: {
            summary: 'Example callback',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: z.object({
                      message: z.string(),
                    }),
                  },
                },
              },
            },
          },
        },
      },
    };

    const registry = createRegistry();

    const result = createCallbacks(callbacks, registry, ['test']);

    expect(result).toEqual({
      exampleCallback: {
        '/path': {
          post: {
            summary: 'Example callback',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {},
                  },
                },
              },
            },
          },
        },
      },
    });
  });
});
