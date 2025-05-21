import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('intersection', () => {
  it('creates intersection schema', () => {
    const a = z.object({ a: z.string() });
    const b = z.object({ b: z.number() });
    const expected: oas31.SchemaObject = {
      allOf: [
        {
          type: 'object',
          required: ['a'],
          properties: {
            a: { type: 'string' },
          },
        },
        {
          type: 'object',
          required: ['b'],
          properties: {
            b: { type: 'number' },
          },
        },
      ],
    };
    const schema = a.and(b);

    const result = createSchema(schema, createOutputState(), ['intersection']);

    expect(result).toEqual(expected);
  });
});
