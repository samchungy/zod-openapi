import * as z from 'zod/v4';

import type { oas31 } from '../openapi3-ts/dist/index.js';

import { createRegistry } from './components.js';
import type { ZodOpenApiResponsesObject } from './document.js';
import { createResponses } from './responses.js';

describe('createResponses', () => {
  it('creates a response', () => {
    const responses: ZodOpenApiResponsesObject = {
      'x-test': 'foo',
      '200': {
        description: '200 OK',
        content: {
          'application/json': {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        headers: z.object({
          'X-Custom-Header': z.string().describe('A custom header'),
        }),
      },
    };

    const registry = createRegistry();

    const result = createResponses(responses, registry, ['test']);

    expect(result).toEqual<oas31.ResponsesObject>({
      'x-test': 'foo',
      '200': {
        description: '200 OK',
        content: {
          'application/json': {
            schema: {},
          },
        },
        headers: {
          'X-Custom-Header': {
            description: 'A custom header',
            required: true,
            schema: {},
          },
        },
      },
    });
  });
});
