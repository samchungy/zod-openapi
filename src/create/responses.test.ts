import { z } from 'zod';

import { extendZodWithOpenApi } from '../extendZod';
import { oas31 } from '../openapi3-ts/dist';

import { getDefaultComponents } from './components';
import { createResponses } from './responses';

extendZodWithOpenApi(z);

describe('createResponses', () => {
  it('creates a response', () => {
    const expected: oas31.ResponsesObject = {
      '200': {
        description: '200 OK',
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
        headers: {
          a: {
            $ref: '#/components/headers/a',
          },
        },
      },
    };
    const result = createResponses(
      {
        '200': {
          description: '200 OK',
          content: {
            'application/json': {
              schema: z.object({ a: z.string() }),
            },
          },
          headers: {
            a: {
              schema: {
                type: 'string',
              },
            },
          },
          responseHeaders: z.object({
            a: z.string().openapi({ header: { ref: 'a' } }),
          }),
        },
      },
      getDefaultComponents(),
    );
    expect(result).toStrictEqual(expected);
  });
});
