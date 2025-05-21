import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('discriminatedUnion', () => {
  it('creates discriminated union schema', () => {
    const dog = z.object({
      type: z.literal('dog'),
      bark: z.string(),
    });
    const cat = z.object({
      type: z.literal('cat'),
      meow: z.string(),
    });
    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          type: 'object',
          required: ['type', 'bark'],
          properties: {
            type: { type: 'string', enum: ['dog'] },
            bark: { type: 'string' },
          },
        },
        {
          type: 'object',
          required: ['type', 'meow'],
          properties: {
            type: { type: 'string', enum: ['cat'] },
            meow: { type: 'string' },
          },
        },
      ],
      discriminator: {
        propertyName: 'type',
      },
    };
    const schema = z.discriminatedUnion('type', [dog, cat]);

    const result = createSchema(schema, createOutputState(), ['discriminatedUnion']);

    expect(result).toEqual(expected);
  });
});
