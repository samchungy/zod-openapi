import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('unions', () => {
  it('creates union schema', () => {
    const expected: oas31.SchemaObject = {
      anyOf: [{ type: 'string' }, { type: 'number' }],
    };
    const schema = z.union([z.string(), z.number()]);

    const result = createSchema(schema, createOutputState(), ['union']);

    expect(result).toEqual(expected);
  });

  it('creates discriminated union schema', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['dog'] },
            bark: { type: 'string' },
          },
          required: ['type', 'bark'],
        },
        {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['cat'] },
            meow: { type: 'string' },
          },
          required: ['type', 'meow'],
        },
      ],
      discriminator: {
        propertyName: 'type',
      },
    };
    const schema = z.discriminatedUnion('type', [
      z.object({ type: z.literal('dog'), bark: z.string() }),
      z.object({ type: z.literal('cat'), meow: z.string() }),
    ]);

    const result = createSchema(schema, createOutputState(), ['union']);

    expect(result).toEqual(expected);
  });
});
