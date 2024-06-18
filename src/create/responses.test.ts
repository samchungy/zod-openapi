import '../extend';
import { z } from 'zod';

import type { oas31 } from '../openapi3-ts/dist/index';

import { getDefaultComponents } from './components';
import { createResponses } from './responses';

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
          headers: z.object({
            a: z.string().openapi({ header: { ref: 'a' } }),
          }),
        },
      },
      getDefaultComponents(),
      ['previous'],
    );
    expect(result).toStrictEqual(expected);
  });
});
